import { spawn, spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { runtimeConfigToLaunchFields, type AgentConfig, type RuntimeModelInfo, type RuntimeModelSet } from "@slock-ai/shared";
import type { RuntimeDriver, SpawnContext, SpawnResult, ParsedEvent } from "./types.js";
import { buildCliTransportSystemPrompt, prepareCliTransport } from "./cliTransport.js";
import { withWindowsUserEnvironment, type ProbeDeps } from "./probe.js";

interface CursorModelsCommandResult {
  status: number | null;
  stdout?: string | Buffer | null;
  error?: Error;
}

type CursorModelsCommand = () => CursorModelsCommandResult;

export async function buildCursorSpawnEnv(ctx: SpawnContext, deps: ProbeDeps = {}): Promise<NodeJS.ProcessEnv> {
  const { spawnEnv } = await prepareCliTransport(ctx, { NO_COLOR: "1" });
  return withWindowsUserEnvironment(spawnEnv, deps);
}

/**
 * Cursor CLI driver.
 *
 * Uses `--print --output-format stream-json` which emits the same NDJSON
 * event format as Claude Code (system/init, assistant, result).
 *
 * MCP config is written to `.cursor/mcp.json` in the working directory.
 * No stdin streaming support — each turn is a separate process invocation.
 */
export class CursorDriver implements RuntimeDriver {
  readonly id = "cursor";
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
    detectedModelsVerifiedAs: "launchable",
    toLaunchSpec: (modelId: string) => ({ args: ["--model", modelId] }),
  } as const;
  readonly supportsStdinNotification = false;
  readonly mcpToolPrefix = "mcp__chat__";
  readonly busyDeliveryMode = "none" as const;
  readonly usesSlockCliForCommunication = true;

  private buildRuntimeActionsMcpConfig(ctx: SpawnContext): string {
    const isTsSource = ctx.chatBridgePath.endsWith(".ts");
    const command = isTsSource ? "npx" : "node";
    const bridgeArgs = isTsSource
      ? ["tsx", ctx.chatBridgePath]
      : [ctx.chatBridgePath];

    return JSON.stringify({
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
    });
  }

  async spawn(ctx: SpawnContext): Promise<SpawnResult> {
    const cursorDir = path.join(ctx.workingDirectory, ".cursor");
    if (!existsSync(cursorDir)) {
      mkdirSync(cursorDir, { recursive: true });
    }

    const mcpConfigPath = path.join(cursorDir, "mcp.json");
    writeFileSync(mcpConfigPath, this.buildRuntimeActionsMcpConfig(ctx), "utf8");

    const args = [
      "--print",
      "--output-format", "stream-json",
      "--yolo",
      "--approve-mcps",
      "--trust",
    ];

    const launchRuntimeFields = runtimeConfigToLaunchFields(ctx.config);
    if (launchRuntimeFields.model && launchRuntimeFields.model !== "default") {
      args.push("--model", launchRuntimeFields.model);
    }

    if (ctx.config.sessionId) {
      args.push("--resume", ctx.config.sessionId);
    }

    // Add the prompt as positional argument
    args.push(ctx.prompt);

    const spawnEnv = await buildCursorSpawnEnv(ctx);

    const proc = spawn("cursor-agent", args, {
      cwd: ctx.workingDirectory,
      stdio: ["pipe", "pipe", "pipe"],
      env: spawnEnv,
      shell: process.platform === "win32",
    });

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
      case "system":
        if (event.subtype === "init" && event.session_id) {
          events.push({ kind: "session_init", sessionId: event.session_id });
        } else if (event.subtype === "status" && event.status === "compacting") {
          events.push({ kind: "compaction_started" });
        } else if (event.subtype === "compact_boundary") {
          events.push({ kind: "compaction_finished" });
        }
        break;

      case "assistant": {
        const content = event.message?.content;
        if (Array.isArray(content)) {
          for (const block of content) {
            if (block.type === "thinking" && block.thinking) {
              events.push({ kind: "thinking", text: block.thinking });
            } else if (block.type === "text" && block.text) {
              events.push({ kind: "text", text: block.text });
            } else if (block.type === "tool_use") {
              events.push({ kind: "tool_call", name: block.name || "unknown_tool", input: block.input });
            }
          }
        }
        break;
      }

      case "result": {
        const subtype = typeof event.subtype === "string" ? event.subtype : "success";
        if (subtype !== "success" || event.is_error) {
          const parts: string[] = [];
          if (Array.isArray(event.errors)) {
            for (const err of event.errors) {
              if (typeof err === "string" && err.trim()) parts.push(err.trim());
            }
          }
          if (typeof event.result === "string" && event.result.trim()) {
            parts.push(event.result.trim());
          }
          const detail = parts.join(" | ") || "Execution failed";
          events.push({ kind: "error", message: detail });
        }
        events.push({ kind: "turn_end", sessionId: event.session_id });
        break;
      }
    }

    return events;
  }

  encodeStdinMessage(
    _text: string,
    _sessionId: string | null,
    _opts?: { mode?: "idle" | "busy" },
  ): string | null {
    // Cursor CLI does not support stdin streaming
    return null;
  }

  buildSystemPrompt(config: AgentConfig, _agentId: string): string {
    return buildCliTransportSystemPrompt(config, {
      toolPrefix: "mcp__chat__",
      extraCriticalRules: [],
      postStartupNotes: [
        "**Cursor runtime note:** Slock launches you as a per-turn process. Complete the current wake using `slock` CLI commands, then stop; the daemon will restart you when new messages arrive.",
      ],
      includeStdinNotificationSection: false,
      messageNotificationStyle: "poll",
    });
  }

  async detectModels(): Promise<RuntimeModelSet | null> {
    return detectCursorModels();
  }

}

export function parseCursorModelsOutput(output: string): RuntimeModelSet | null {
  const stripAnsi = (value: string) => value.replace(/\u001b\[[0-9;]*m/g, "");
  const models: RuntimeModelInfo[] = [];
  let defaultModel: string | undefined;

  for (const rawLine of stripAnsi(output).split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || /^available models$/i.test(line) || /^tip:/i.test(line)) continue;
    if (/^no models available/i.test(line) || /^failed to load models:/i.test(line)) continue;

    let modelLine = line;
    const markerMatch = modelLine.match(/\s+\(([^)]+)\)$/);
    const markers = markerMatch?.[1]?.split(",").map((part) => part.trim().toLowerCase()) ?? [];
    if (markers.length > 0 && markers.every((part) => part === "current" || part === "default")) {
      const markerStart = markerMatch?.index ?? modelLine.length;
      modelLine = modelLine.slice(0, markerStart).trim();
    }

    const match = modelLine.match(/^(\S+)(?:\s+-\s+(.+))?$/);
    if (!match) continue;

    const id = match[1]?.trim();
    if (!id || id.startsWith("-")) continue;

    const label = match[2]?.trim() || id;
    models.push({ id, label, verified: "launchable" });
    if (markers.includes("default")) defaultModel = id;
  }

  if (models.length === 0) return null;
  return { models, default: defaultModel };
}

export function detectCursorModels(runCommand: CursorModelsCommand = runCursorModelsCommand): RuntimeModelSet | null {
  const result = runCommand();

  if (result.error || result.status !== 0) return null;
  return parseCursorModelsOutput(String(result.stdout || ""));
}

export function buildCursorModelProbeEnv(deps: ProbeDeps = {}): NodeJS.ProcessEnv {
  return withWindowsUserEnvironment({
    ...(deps.env ?? process.env),
    FORCE_COLOR: "0",
    NO_COLOR: "1",
  }, deps);
}

function runCursorModelsCommand(): CursorModelsCommandResult {
  return spawnSync("cursor-agent", ["models"], {
    env: buildCursorModelProbeEnv(),
    encoding: "utf8",
    timeout: 5000,
  });
}
