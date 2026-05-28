import { spawn } from "node:child_process";
import type { AgentConfig } from "@slock-ai/shared";
import type { RuntimeDriver, SpawnContext, SpawnResult, ParsedEvent, RuntimeProbeResult } from "./types.js";
import { buildCliTransportSystemPrompt, prepareCliTransport } from "./cliTransport.js";
import { ClaudeEventNormalizer } from "./claudeEventNormalizer.js";
import { buildClaudeArgs, buildClaudeSpawnSpec, probeClaude, resolveClaudeCommand, writeClaudeSystemPromptFile } from "./claudeLaunch.js";
import { logger } from "../logger.js";

export {
  buildClaudeArgs,
  buildClaudeSpawnSpec,
  CLAUDE_DESKTOP_CLI_RELATIVE_PATH,
  CLAUDE_DESKTOP_CLI_SYSTEM_PATH,
  CLAUDE_DISALLOWED_TOOLS,
  probeClaude,
  resolveClaudeCommand,
} from "./claudeLaunch.js";

export class ClaudeDriver implements RuntimeDriver {
  readonly id = "claude";
  readonly lifecycle = {
    kind: "persistent",
    stdin: "gated",
    inFlightWake: "queue",
  } as const;
  readonly communication = {
    chat: "slock_cli",
    runtimeControl: "none",
  } as const;
  readonly session = {
    recovery: "resume_or_fresh",
  } as const;
  readonly model = {
    detectedModelsVerifiedAs: "launchable",
    toLaunchSpec: (modelId: string) => ({ args: ["--model", modelId] }),
  } as const;
  readonly supportsStdinNotification = true;
  readonly mcpToolPrefix = "";
  readonly usesSlockCliForCommunication = true;
  // Claude Code supports same-turn steering, but raw stdin injection at an
  // arbitrary busy instant can collide with active signed thinking blocks. The
  // daemon therefore gates busy delivery on Claude stream-json boundaries.
  readonly busyDeliveryMode = "gated" as const;
  readonly supportsNativeStandingPrompt = true;
  private readonly eventNormalizer = new ClaudeEventNormalizer();

  probe(): RuntimeProbeResult {
    return probeClaude();
  }

  buildClaudeArgs(
    config: AgentConfig,
    opts: { standingPromptFilePath: string },
  ): string[] {
    return buildClaudeArgs(config, opts);
  }

  async spawn(ctx: SpawnContext): Promise<SpawnResult> {
    // The daemon resolves the bundled CLI once, then gives each agent a local
    // `slock` wrapper and prepends that directory to PATH. This keeps runtime
    // behavior deterministic: agents always hit the daemon-managed CLI rather
    // than whatever `slock` binary the host machine happens to have installed.
    const { slockDir, tokenFile, spawnEnv } = await prepareCliTransport(ctx);
    const systemPromptPath = writeClaudeSystemPromptFile(ctx.standingPrompt, slockDir);

    const args = this.buildClaudeArgs(ctx.config, {
      standingPromptFilePath: systemPromptPath,
    });

    delete spawnEnv.CLAUDECODE;

    logger.info(
      `[Agent ${ctx.agentId}] transport=cli cli=${ctx.slockCliPath} token_file=${tokenFile}`,
    );

    const claudeCommand = resolveClaudeCommand();
    const spawnSpec = buildClaudeSpawnSpec(claudeCommand);

    const proc = spawn(spawnSpec.command, args, {
      cwd: ctx.workingDirectory,
      stdio: ["pipe", "pipe", "pipe"],
      env: spawnEnv as NodeJS.ProcessEnv,
      shell: spawnSpec.shell,
    });

    // Send initial prompt via stdin (stream-json format)
    const stdinMsg = JSON.stringify({
      type: "user",
      message: {
        role: "user",
        content: [{ type: "text", text: ctx.prompt }],
      },
      ...(ctx.config.sessionId ? { session_id: ctx.config.sessionId } : {}),
    });
    proc.stdin?.write(stdinMsg + "\n");

    return { process: proc };
  }

  parseLine(line: string): ParsedEvent[] {
    return this.eventNormalizer.normalizeLine(line);
  }

  encodeStdinMessage(
    text: string,
    sessionId: string | null,
    _opts?: { mode?: "idle" | "busy" },
  ): string | null {
    return JSON.stringify({
      type: "user",
      message: {
        role: "user",
        content: [{ type: "text", text }],
      },
      ...(sessionId ? { session_id: sessionId } : {}),
    });
  }

  buildSystemPrompt(config: AgentConfig, _agentId: string): string {
    return buildCliTransportSystemPrompt(config, {
      toolPrefix: "",
      extraCriticalRules: [],
      postStartupNotes: [
        "**Claude runtime note:** While you are busy, Slock batches inbox-count notifications instead of injecting message content. Use `slock message check` at natural breakpoints to pull the pending messages before side-effect actions that depend on current context.",
      ],
      includeStdinNotificationSection: true,
      messageNotificationStyle: "direct",
    });
  }

}
