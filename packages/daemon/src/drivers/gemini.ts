import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { runtimeConfigToLaunchFields, type AgentConfig } from "@slock-ai/shared";
import type { RuntimeDriver, SpawnContext, SpawnResult, ParsedEvent } from "./types.js";
import { buildCliTransportSystemPrompt, prepareCliTransport } from "./cliTransport.js";
import { resolveCommandOnPath, type ProbeDeps } from "./probe.js";

export async function buildGeminiSpawnEnv(
  ctx: SpawnContext,
  platform: NodeJS.Platform = process.platform,
): Promise<NodeJS.ProcessEnv> {
  const { spawnEnv } = await prepareCliTransport(ctx, { NO_COLOR: "1" }, platform);
  const launchEnvVars = runtimeConfigToLaunchFields(ctx.config).envVars;
  // Gemini CLI's trusted-workspace gate breaks our managed headless flow
  // unless we explicitly trust the daemon-owned agent workspace. Keep an
  // explicit agent env override authoritative for operators who need it.
  if (!Object.prototype.hasOwnProperty.call(launchEnvVars ?? {}, "GEMINI_CLI_TRUST_WORKSPACE")) {
    spawnEnv.GEMINI_CLI_TRUST_WORKSPACE = "true";
  }
  // On Windows, Gemini CLI's node-pty dependency calls AttachConsole which
  // fails in headless daemon spawn environments. Bypass PTY initialization
  // by telling Gemini to use node:child_process instead.
  // Respect explicit user override for operators who need PTY behavior.
  if (platform === "win32" && !Object.prototype.hasOwnProperty.call(launchEnvVars ?? {}, "GEMINI_PTY_INFO")) {
    spawnEnv.GEMINI_PTY_INFO = "child_process";
  }
  return spawnEnv;
}

function normalizeExecOutput(raw: unknown): string {
  return Buffer.isBuffer(raw) ? raw.toString("utf8") : String(raw ?? "");
}

export function buildGeminiArgs(config: AgentConfig): string[] {
  const args = [
    "--output-format", "stream-json",
    "--yolo",
    // Gemini CLI headless mode is selected by -p/--prompt. Keep the actual
    // prompt off argv and feed it through stdin below; this avoids Windows
    // cmd.exe's 8191-character command-line limit and keeps long wake payloads
    // below CreateProcess argv pressure too.
    "-p", "",
  ];

  const launchRuntimeFields = runtimeConfigToLaunchFields(config);
  if (launchRuntimeFields.model && launchRuntimeFields.model !== "default") {
    args.push("--model", launchRuntimeFields.model);
  }

  if (config.sessionId) {
    args.push("--resume", config.sessionId);
  }

  return args;
}

export function resolveGeminiSpawn(
  commandArgs: string[],
  deps: ProbeDeps = {},
): { command: string; args: string[] } {
  const platform = deps.platform ?? process.platform;
  if (platform !== "win32") {
    return { command: resolveCommandOnPath("gemini", deps) ?? "gemini", args: commandArgs };
  }

  const execFileSyncFn = deps.execFileSyncFn ?? execFileSync;
  const existsSyncFn = deps.existsSyncFn ?? existsSync;
  const env = deps.env ?? process.env;
  const winPath = path.win32;
  let geminiEntry: string | null = null;

  try {
    const globalRoot = normalizeExecOutput(execFileSyncFn("npm", ["root", "-g"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env,
    })).trim();
    const candidate = winPath.join(globalRoot, "@google", "gemini-cli", "bundle", "gemini.js");
    if (existsSyncFn(candidate)) geminiEntry = candidate;
  } catch {
    // Fall through to resolving the npm shim location.
  }

  if (!geminiEntry) {
    try {
      const cmdPath = normalizeExecOutput(execFileSyncFn("where.exe", ["gemini"], {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        env,
      })).trim().split(/\r?\n/)[0];
      const candidate = winPath.join(winPath.dirname(cmdPath), "node_modules", "@google", "gemini-cli", "bundle", "gemini.js");
      if (existsSyncFn(candidate)) geminiEntry = candidate;
    } catch {
      // ignore
    }
  }

  if (!geminiEntry) {
    throw new Error(
      "Cannot resolve Gemini CLI entry point on Windows. " +
      "Ensure @google/gemini-cli is installed globally via npm (npm i -g @google/gemini-cli).",
    );
  }

  return {
    command: process.execPath,
    args: [geminiEntry, ...commandArgs],
  };
}

/**
 * Gemini CLI driver.
 *
 * Uses `--output-format stream-json` which emits NDJSON events:
 *   init, message (role=user/assistant, delta), tool_use, tool_result, result, error
 *
 * Runtime-control MCP config is injected via a project-level `.gemini/settings.json`.
 * No stdin streaming support — each turn is a separate process invocation.
 */
export class GeminiDriver implements RuntimeDriver {
  readonly id = "gemini";
  readonly lifecycle = {
    kind: "per_turn",
    start: "immediate",
    exit: "natural",
    inFlightWake: "spawn_new",
  } as const;
  readonly communication = {
    chat: "slock_cli",
    runtimeControl: "mcp_runtime_actions",
  } as const;
  readonly session = {
    recovery: "resume_or_fresh",
  } as const;
  readonly model = {
    detectedModelsVerifiedAs: "suggestion_only",
    toLaunchSpec: (modelId: string) => (modelId && modelId !== "default" ? { args: ["--model", modelId] } : { args: [] }),
  } as const;
  readonly supportsStdinNotification = false;
  readonly mcpToolPrefix = "";
  readonly busyDeliveryMode = "none" as const;
  readonly usesSlockCliForCommunication = true;

  private sessionId: string | null = null;
  private sessionAnnounced = false;

  async spawn(ctx: SpawnContext): Promise<SpawnResult> {
    this.sessionId = ctx.config.sessionId || null;
    this.sessionAnnounced = false;
    this.writeGeminiSettings(ctx);

    const { command, args } = resolveGeminiSpawn(buildGeminiArgs(ctx.config));
    const spawnEnv = await buildGeminiSpawnEnv(ctx);

    const proc = spawn(command, args, {
      cwd: ctx.workingDirectory,
      stdio: ["pipe", "pipe", "pipe"],
      env: spawnEnv,
      shell: false,
    });

    proc.stdin?.end(ctx.prompt);

    return { process: proc };
  }

  parseLine(line: string): ParsedEvent[] {
    let event: any;
    try {
      event = JSON.parse(line);
    } catch {
      return [];
    }

    const events: ParsedEvent[] = [];

    switch (event.type) {
      case "init":
        if (event.session_id) {
          this.sessionId = event.session_id;
          events.push({ kind: "session_init", sessionId: event.session_id });
          this.sessionAnnounced = true;
        }
        break;

      case "message":
        if (event.role === "assistant" && event.content) {
          if (event.delta) {
            events.push({ kind: "text", text: event.content });
          } else {
            events.push({ kind: "text", text: event.content });
          }
        }
        break;

      case "tool_use":
        events.push({
          kind: "tool_call",
          name: event.tool_name || "unknown_tool",
          input: event.parameters,
        });
        break;

      case "error":
        events.push({ kind: "error", message: event.message || "Unknown Gemini error" });
        break;

      case "result":
        if (event.status !== "success") {
          const raw = event.error_message || event.message || event.error || "";
          const detail = typeof raw === "string" ? raw : (raw?.message || JSON.stringify(raw));
          const msg = detail
            ? `Gemini error: ${detail}`
            : `Gemini session ended with status: ${event.status}`;
          events.push({ kind: "error", message: msg });
        }
        events.push({ kind: "turn_end", sessionId: this.sessionId || undefined });
        break;
    }

    return events;
  }

  encodeStdinMessage(
    _text: string,
    _sessionId: string | null,
    _opts?: { mode?: "idle" | "busy" },
  ): string | null {
    // Gemini CLI does not support stdin streaming
    return null;
  }

  buildSystemPrompt(config: AgentConfig, _agentId: string): string {
    return buildCliTransportSystemPrompt(config, {
      toolPrefix: "",
      extraCriticalRules: [],
      postStartupNotes: [
        "**Gemini runtime note:** Slock launches you as a per-turn process. Complete the current wake using `slock` CLI commands, then stop; the daemon will restart you when new messages arrive.",
      ],
      includeStdinNotificationSection: false,
      messageNotificationStyle: "poll",
    });
  }

  private writeGeminiSettings(ctx: SpawnContext): void {
    const geminiDir = path.join(ctx.workingDirectory, ".gemini");
    mkdirSync(geminiDir, { recursive: true });

    const settingsPath = path.join(geminiDir, "settings.json");
    writeFileSync(settingsPath, JSON.stringify(this.buildRuntimeActionsMcpSettings(ctx)), "utf8");
  }

  private buildRuntimeActionsMcpSettings(ctx: SpawnContext): Record<string, unknown> {
    const isTsSource = ctx.chatBridgePath.endsWith(".ts");
    const command = isTsSource ? "npx" : "node";
    const bridgeArgs = isTsSource
      ? ["tsx", ctx.chatBridgePath]
      : [ctx.chatBridgePath];

    return {
      mcpServers: {
        chat: {
          command,
          args: [
            ...bridgeArgs,
            "--agent-id",
            ctx.agentId,
            "--server-url",
            ctx.config.serverUrl,
            "--auth-token",
            ctx.config.authToken || ctx.daemonApiKey,
            "--runtime",
            this.id,
            ...(ctx.launchId ? ["--launch-id", ctx.launchId] : []),
            "--runtime-actions-only",
          ],
        },
      },
    };
  }

}
