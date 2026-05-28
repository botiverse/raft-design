import type { ChildProcess } from "node:child_process";
import type { AgentConfig, AgentMessage, RuntimeModelSet } from "@slock-ai/shared";
import type { AgentProxyInboxCoordinator } from "../agentCredentialProxy.js";

// ── Runtime Contracts ──
// Behavior-level contracts that describe how the daemon should interact with a
// runtime. The legacy booleans below remain during the transition, but new
// drivers should make these policies explicit instead of encoding them as
// unrelated flags.

export type RuntimeLifecycleContract =
  | {
      kind: "persistent";
      stdin: "direct" | "gated" | "notification";
      inFlightWake: "queue" | "steer";
    }
  | {
      kind: "per_turn";
      start: "immediate" | "defer_until_concrete_message";
      exit: "natural" | "terminate_on_turn_end";
      inFlightWake: "spawn_new" | "coalesce_into_pending";
    };

export type RuntimeCommunicationContract = {
  chat: "slock_cli";
  runtimeControl: "mcp_runtime_actions" | "none";
};

export type RuntimeSessionContract = {
  /**
   * `resume_or_fresh` is the current built-in default: try native resume, then
   * cold-start if the native session is missing. `fresh` is reserved for future
   * explicitly ephemeral runtimes or no-resume modes.
   */
  recovery: "fresh" | "resume_or_fresh";
};

export type RuntimeModelVerification = "launchable" | "suggestion_only";

export interface RuntimeModelLaunchSpec {
  args?: string[];
  env?: Record<string, string>;
  configFiles?: string[];
  params?: Record<string, unknown>;
  config?: Record<string, unknown>;
}

export interface RuntimeModelContract {
  detectedModelsVerifiedAs: RuntimeModelVerification;
  /**
   * Derive the launch-time model surface from the same source used by spawn().
   * Drivers that need local provider config should accept a SpawnContext and
   * optional test/runtime overrides instead of re-encoding a parallel launch
   * path.
   */
  toLaunchSpec?(
    modelId: string,
    ctx?: SpawnContext,
    opts?: { home?: string },
  ): RuntimeModelLaunchSpec | Promise<RuntimeModelLaunchSpec>;
}

// ── Parsed Events ──
// Runtime events consumed by agentProcessManager. Telemetry is a sidecar:
// it must not refresh turn progress, clear startup state, or drive activity.
// Internal progress is a payload-free runtime liveness signal: it refreshes the
// progress clock but must not be rendered into the agent trajectory.

export type ParsedEvent =
  | { kind: "session_init"; sessionId: string }
  | { kind: "thinking"; text: string }
  | { kind: "text"; text: string }
  | { kind: "tool_call"; name: string; input: any }
  | { kind: "tool_output"; name: string }
  | { kind: "compaction_started" }
  | { kind: "compaction_finished" }
  | { kind: "turn_end"; sessionId?: string }
  | { kind: "error"; message: string }
  | {
      kind: "internal_progress";
      source: "codex_raw_response_item" | "claude_stream_event" | "claude_system_status";
      itemType?: string;
      payloadBytes?: number;
    }
  | {
      kind: "telemetry";
      name: "token_usage" | "rate_limits";
      attrs: Record<string, string | number | boolean>;
    };

// ── Spawn Context ──
// Everything a driver needs to spawn a CLI process.

export interface SpawnContext {
  agentId: string;
  config: AgentConfig;
  /**
   * Long-lived standing instructions for the runtime. Drivers that support a
   * native instruction layer should mount this there so it survives compaction
   * and can be refreshed on resume.
   */
  standingPrompt: string;
  /**
   * Dynamic per-turn input: wake messages, unread summaries, migration hints,
   * and other ephemeral context that belongs in the normal conversation layer.
   */
  prompt: string;
  workingDirectory: string;
  chatBridgePath: string;
  /**
   * Absolute path to the bundled `slock` cli entry script. Drivers that have
   * been ported off the MCP chat-bridge inject this into the spawned process
   * so the agent can invoke the cli for chat/task/attachment operations
   * without depending on a globally installed `slock` binary.
   */
  slockCliPath: string;
  daemonApiKey: string;
  launchId?: string | null;
  agentCredentialProxyInboxCoordinator?: AgentProxyInboxCoordinator;
}

// ── Spawn Result ──
// Returned by driver.spawn() — the process plus an optional initial stdin write.

export interface SpawnResult {
  process: ChildProcess;
}

export interface RuntimeProbeResult {
  available: boolean;
  version?: string;
}

// ── Runtime Driver ──
// Minimal interface encapsulating runtime-specific behavior.

export interface RuntimeDriver {
  /** Short ID matching RUNTIMES[].id (e.g. "claude", "codex") */
  readonly id: string;

  /** Structured lifecycle policy. */
  readonly lifecycle: RuntimeLifecycleContract;

  /** Structured Slock communication policy. */
  readonly communication: RuntimeCommunicationContract;

  /** Native session recovery behavior. */
  readonly session: RuntimeSessionContract;

  /** Model detection and launch-compatibility policy. */
  readonly model: RuntimeModelContract;

  /**
   * Whether the runtime keeps a live process that can accept follow-up messages
   * over stdin while the daemon keeps it alive.
   */
  readonly supportsStdinNotification: boolean;

  /** MCP tool name prefix (e.g. "mcp__chat__" for Cursor, "mcp_chat_" for Codex, "" when no chat-MCP injection) */
  readonly mcpToolPrefix: string;

  /** Whether the daemon should close stdin after a turn ends so the runtime can exit cleanly. */
  readonly endStdinOnTurnEnd?: boolean;

  /**
   * Whether the daemon should terminate the spawned process after the runtime
   * reports a turn boundary. This is for per-turn CLIs whose auxiliary
   * transports can keep the process alive after the assistant turn is done.
   */
  readonly terminateProcessOnTurnEnd?: boolean;

  /**
   * Whether an idle start with no concrete wake message can be represented by
   * cached daemon state instead of spawning the runtime immediately.
   */
  readonly deferSpawnUntilMessage?: boolean;

  /**
   * Whether an incoming delivery is not concrete runtime work and should not
   * wake a deferred/per-turn runtime.
   */
  shouldDeferWakeMessage?(message: AgentMessage): boolean;

  /**
   * How follow-up messages are delivered while the runtime is busy.
   * - "direct": write an inbox-count notification promptly; content stays in
   *   the daemon inbox until the runtime explicitly checks or becomes idle
   * - "gated": write only an inbox-count notification while busy, with batching
   *   around runtime-observed boundaries/timers; content stays in the daemon
   *   inbox until check or idle delivery
   * - "notification": send a generic "you have N messages" notification
   * - "none": no stdin delivery while busy (e.g. Codex — exits after each turn)
   */
  readonly busyDeliveryMode: "direct" | "gated" | "notification" | "none";
  /** Whether this runtime supports a native standing-prompt layer. */
  readonly supportsNativeStandingPrompt?: boolean;

  /**
   * Whether visible Slock communication should be described as `slock` CLI
   * commands in daemon-generated dynamic prompts. Runtimes that use
   * prepareCliTransport should set this so wake/unread prompts match the
   * standing prompt contract.
   */
  readonly usesSlockCliForCommunication?: boolean;

  /**
   * Best-effort availability probe for this runtime on the current machine.
   *
   * This should answer the same question as spawn(): can the daemon actually
   * invoke the runtime from its own non-interactive environment?
   */
  probe?(): RuntimeProbeResult;

  /** Spawn the CLI process and send the initial prompt. */
  spawn(ctx: SpawnContext): SpawnResult | Promise<SpawnResult>;

  /** Parse a single stdout line into zero or more ParsedEvents. */
  parseLine(line: string): ParsedEvent[];

  /**
   * Encode a text message for live delivery into the running runtime.
   * Returns null if the runtime doesn't support live message delivery.
   */
  encodeStdinMessage(
    text: string,
    sessionId: string | null,
    opts?: { mode?: "idle" | "busy" },
  ): string | null;

  /** Build the full system prompt for first-time agent startup. */
  buildSystemPrompt(config: AgentConfig, agentId: string): string;

  /**
   * Detect the models this runtime can use on the current machine.
   *
   * Returns null (or throws) when the runtime has no reliable offline detection
   * path; the daemon falls back to the static RUNTIME_MODELS list in that case.
   * Runs at daemon startup and on explicit rescan — not per-turn.
   */
  detectModels?(): Promise<RuntimeModelSet | null>;
}
