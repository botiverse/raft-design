import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { runtimeConfigToLaunchFields, type AgentConfig, type RuntimeModelSet } from "@slock-ai/shared";
import { buildCliTransportSystemPrompt, prepareCliTransport } from "./cliTransport.js";
import { resolveCommandOnPath, readCommandVersion, type ProbeDeps } from "./probe.js";
import type { ParsedEvent, RuntimeDriver, RuntimeProbeResult, SpawnContext, SpawnResult } from "./types.js";

const DEFAULT_PRINT_TIMEOUT = "30m";
export const ANTIGRAVITY_ENV_OVERRIDES = {
  // `agy` switches to a separate file-based token store when it detects an SSH
  // session. Daemon agents commonly run under SSH-managed hosts, while the
  // human login lives in the normal local Antigravity credential store.
  SSH_CLIENT: undefined,
  SSH_CONNECTION: undefined,
  SSH_TTY: undefined,
} as const;

export function resolveAntigravitySpawn(
  commandArgs: string[],
  deps: ProbeDeps = {},
): { command: string; args: string[]; shell: false } {
  return {
    command: resolveCommandOnPath("agy", deps) ?? "agy",
    args: commandArgs,
    shell: false,
  };
}

export function buildAntigravityArgs(ctx: SpawnContext): string[] {
  const args = [
    "--print",
    "--print-timeout",
    runtimeConfigToLaunchFields(ctx.config).envVars?.ANTIGRAVITY_PRINT_TIMEOUT || DEFAULT_PRINT_TIMEOUT,
    "--dangerously-skip-permissions",
  ];

  if (ctx.config.sessionId) {
    args.push("--continue");
  }

  return args;
}

const ERROR_LINE_PREFIX_RE = /^(?:(?:error|fatal|exception|failure):\s*|failed(?:\b|:))/i;
const ERROR_LINE_PATTERNS = [
  /authentication timed out/i,
  /\bpermission denied\b/i,
  /\bunauthorized\b/i,
  /\brate limit(?:ed)?\b/i,
  /\bserver error\b/i,
  /\bnetwork error\b/i,
  /\brequest timed out\b/i,
  /\btimed out waiting\b/i,
  /\b(?:http|status)\s+(?:401|403|429|500|502|503|504)\b/i,
];

function isErrorLine(line: string): boolean {
  return (
    ERROR_LINE_PREFIX_RE.test(line) ||
    ERROR_LINE_PATTERNS.some((pattern) => pattern.test(line))
  );
}

/**
 * Antigravity CLI driver.
 *
 * `agy --print` is a per-turn CLI. It prints assistant text as normal stdout
 * and exits after the turn. The CLI persists conversation state in its own
 * workspace-local store; after Slock has seen one turn, follow-up launches use
 * `--continue` for that workspace instead of trying to interpret the opaque
 * Antigravity conversation files.
 */
export class AntigravityDriver implements RuntimeDriver {
  readonly id = "antigravity";
  readonly lifecycle = {
    kind: "per_turn",
    start: "immediate",
    exit: "natural",
    inFlightWake: "spawn_new",
  } as const;
  readonly communication = {
    chat: "slock_cli",
    runtimeControl: "none",
  } as const;
  readonly session = {
    recovery: "resume_or_fresh",
  } as const;
  readonly model = {
    detectedModelsVerifiedAs: "suggestion_only" as const,
    toLaunchSpec: (_modelId: string) => ({ args: [] }),
  };
  readonly supportsStdinNotification = false;
  readonly mcpToolPrefix = "";
  readonly busyDeliveryMode = "none" as const;
  readonly usesSlockCliForCommunication = true;

  private sessionId: string | null = null;
  private sessionAnnounced = false;

  probe(): RuntimeProbeResult {
    const command = resolveCommandOnPath("agy");
    if (!command) return { available: false };
    return {
      available: true,
      version: readCommandVersion(command) ?? undefined,
    };
  }

  async spawn(ctx: SpawnContext): Promise<SpawnResult> {
    this.sessionId = ctx.config.sessionId || randomUUID();
    this.sessionAnnounced = false;

    const { command, args, shell } = resolveAntigravitySpawn(buildAntigravityArgs(ctx));
    const { spawnEnv } = await prepareCliTransport(ctx, {
      NO_COLOR: "1",
      ...ANTIGRAVITY_ENV_OVERRIDES,
    });

    const proc = spawn(command, args, {
      cwd: ctx.workingDirectory,
      stdio: ["pipe", "pipe", "pipe"],
      env: spawnEnv,
      shell,
    });

    proc.stdin?.end(ctx.prompt);

    return { process: proc };
  }

  parseLine(line: string): ParsedEvent[] {
    const trimmed = line.trim();
    if (!trimmed) return [];

    const events: ParsedEvent[] = [];
    // `agy --print` has no stable external session id. This is the daemon's
    // logical session marker, so emit it only with meaningful runtime output.
    if (!this.sessionAnnounced && this.sessionId) {
      events.push({ kind: "session_init", sessionId: this.sessionId });
      this.sessionAnnounced = true;
    }

    if (isErrorLine(trimmed)) {
      events.push({ kind: "error", message: trimmed });
      return events;
    }

    events.push({ kind: "text", text: line });
    return events;
  }

  encodeStdinMessage(
    _text: string,
    _sessionId: string | null,
    _opts?: { mode?: "idle" | "busy" },
  ): string | null {
    return null;
  }

  buildSystemPrompt(config: AgentConfig, _agentId: string): string {
    return buildCliTransportSystemPrompt(config, {
      toolPrefix: "",
      extraCriticalRules: [],
      postStartupNotes: [
        "**Antigravity runtime note:** Slock launches you as a per-turn process. Complete the current wake using `slock` CLI commands, then stop; the daemon will restart you when new messages arrive.",
      ],
      includeStdinNotificationSection: false,
      messageNotificationStyle: "poll",
    });
  }

  async detectModels(): Promise<RuntimeModelSet | null> {
    return null;
  }
}
