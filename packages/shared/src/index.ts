// Shared types for Slock — used by server, web, and machine (daemon process)

export interface AgentThreadContextMessage {
  message_id: string;
  sender_name: string;
  sender_description?: string | null;
  sender_type: "human" | "agent" | "system";
  content: string;
  timestamp: string;
  seq?: number;
}

export interface AgentThreadJoinContext {
  reason: "mentioned";
  parent_target: string;
  thread_target: string;
  suggested_read_history_target: string;
  /** The parent/root message anchors what problem this thread is actually about. */
  parent_message: AgentThreadContextMessage;
  /** A small recent window keeps the first reply from feeling like a blind guess. */
  recent_messages: AgentThreadContextMessage[];
  history_truncated: boolean;
}
// Agent message delivered between server/machine/MCP bridge
export interface AgentMessage {
  channel_id: string;
  channel_name: string;
  channel_type: "channel" | "private" | "joint" | "dm" | "thread";
  sender_id: string;
  sender_name: string;
  sender_description?: string | null;
  sender_type: "human" | "agent" | "system";
  content: string;
  timestamp: string;
  seq?: number;
  /** The message UUID — first 8 chars can be used as thread target (e.g. #channel:shortid) */
  message_id?: string;
  /** For thread messages: the parent channel name (e.g. "general") or peer name for DM threads */
  parent_channel_name?: string;
  /** For thread messages: the parent channel ID */
  parent_channel_id?: string;
  /** For thread messages: the parent channel type ("channel", "private", "joint", or "dm") */
  parent_channel_type?: "channel" | "private" | "joint" | "dm";
  /** Attached files */
  attachments?: { id: string; filename: string; mimeType: string; sizeBytes?: number }[];
  /** Task fields — present when the message is (or could be) a task */
  task_status?: "todo" | "in_progress" | "in_review" | "done" | "closed" | null;
  task_number?: number | null;
  task_assignee_type?: "human" | "agent" | null;
  task_assignee_id?: string | null;
  /** Present when the agent was auto-joined into a thread and would otherwise only see the triggering @message. */
  thread_join_context?: AgentThreadJoinContext;
  /** Internal trace context for daemon-injected synthetic control messages. Not rendered to the agent. */
  traceparent?: string;
}

export * from "./slockPermalinks.js";
export * from "./emailValidation.js";
export * from "./tracing/index.js";
export * from "./tracing/memory.js";
export * from "./tracing/assertions.js";
export * from "./toolDisplay.js";
export * from "./attachmentPreview.js";
export * from "./actionCards.js";
export * from "./translationLanguages.js";
export * from "./timeFormatPreference.js";
export * from "./legalAcceptance.js";
export * from "./agentScopes.js";

// ── Reminders (contract types) ────────────────────────────────────────────────
// Server DB is authoritative. Daemon keeps an ephemeral timer cache keyed by
// `reminderId`; it applies upsert/cancel only when the incoming `version` is
// greater than the locally cached one. At fire time the daemon sends a
// `reminder.fire_attempt` — the server transitions status atomically and is
// the only party that enqueues the wake DM. A server-side fallback scanner
// delivers reminders when the daemon is offline / missed the push.

export type ReminderStatus = "scheduled" | "fired" | "canceled";

/**
 * Wire-shape recurrence descriptor. The server stores a richer structured
 * form (see `services/recurrence.ts`), but the daemon timer cache and UI
 * only need the kind + a human-readable description. Unknown kinds written
 * by a newer server surface as `kind="unsupported"` so older clients render
 * "(recurring, unknown rule)" instead of crashing.
 */
export interface ReminderRecurrence {
  kind: "interval" | "daily" | "weekly" | "unsupported";
  description: string;
}

/** Daemon-side cache shape: the minimum needed to hold a local timer. */
export interface ReminderJob {
  reminderId: string;
  ownerAgentId: string;
  msgId: string | null;
  title: string;
  /** ISO-8601 UTC */
  fireAt: string;
  version: number;
  /** Non-null when this reminder auto-reschedules after fire. */
  recurrence: ReminderRecurrence | null;
}

/**
 * Server-authoritative summary shape for humans / UI. The sidebar pending
 * list, agent profile pending section, and any list API consume this.
 * Includes fields the daemon timer cache doesn't need (status, createdAt,
 * msgRef, msgPermalink) so the UI never has to reach into daemon state.
 */
export interface ReminderSummary {
  reminderId: string;
  ownerAgentId: string;
  title: string;
  /** ISO-8601 UTC */
  fireAt: string;
  /** ISO-8601 UTC. Non-null after a reminder has fired at least once. */
  firedAt?: string | null;
  /** ISO-8601 UTC */
  createdAt: string;
  status: ReminderStatus;
  /** Rendered AX label (e.g. `#engineering:abc123`), or null for free-form reminders. */
  msgRef: string | null;
  /** Clickable absolute URL for the anchor message, or null. Server-computed via slockPermalinks. */
  msgPermalink: string | null;
  /** Non-null when this reminder auto-reschedules after fire. */
  recurrence: ReminderRecurrence | null;
}

export type ReminderEventType = "scheduled" | "fired" | "snoozed" | "updated" | "canceled";

export interface ReminderEventSummary {
  eventId: string;
  reminderId: string;
  eventType: ReminderEventType;
  actorType: "agent" | "human" | "system";
  actorId: string | null;
  occurredAt: string;
  nextFireAt: string | null;
  metadata: Record<string, unknown> | null;
}

// ── Agent Runtime Profile (restart-time reset/notice contract) ────────────────

export type AgentRuntimeProfileMigrationStatus = "stable" | "pending" | "migrating";
export type AgentRuntimeProfilePendingKind = "migration" | "daemon_release_notice";

export interface AgentRuntimeProfileRef {
  label?: string | null;
  path?: string | null;
  machineId?: string | null;
  runtime?: string | null;
  reachable?: boolean | null;
  reason?: string | null;
}

export interface AgentRuntimeProfileReport {
  runtime: string;
  model: string;
  reasoningEffort?: ReasoningEffort | null;
  executionMode?: "byoc" | "cloud" | string | null;
  workspaceRef?: AgentRuntimeProfileRef | string | null;
  workspacePathRef?: AgentRuntimeProfileRef | string | null;
  sessionRef?: AgentRuntimeProfileRef | string | null;
}

export interface AgentRuntimeProfileChange {
  field: string;
  before?: unknown;
  after?: unknown;
}

export interface AgentRuntimeProfileSnapshot {
  runtimeProfileFingerprint?: string;
  daemonVersion?: string | null;
  machineId?: string | null;
  machineName?: string | null;
  runtime?: string | null;
  model?: string | null;
  reasoningEffort?: ReasoningEffort | null;
  executionMode?: "byoc" | "cloud" | string | null;
  workspaceRef?: AgentRuntimeProfileRef | string | null;
  workspacePathRef?: AgentRuntimeProfileRef | string | null;
  sessionRef?: AgentRuntimeProfileRef | string | null;
  observedAt?: string | null;
}

export interface AgentRuntimeProfilePending {
  kind: AgentRuntimeProfilePendingKind;
  key: string;
  releaseNotesUrl?: string | null;
  migratingSince?: string | null;
  lastNudgeAt?: string | null;
  nudgeCount?: number;
  before?: AgentRuntimeProfileSnapshot | null;
  after?: AgentRuntimeProfileSnapshot | null;
  changes?: AgentRuntimeProfileChange[];
  previousSessionRef?: AgentRuntimeProfileRef | string | null;
}

export interface AgentRuntimeProfileSummary {
  current?: AgentRuntimeProfileSnapshot | null;
  migrationStatus: AgentRuntimeProfileMigrationStatus;
  pending?: AgentRuntimeProfilePending | null;
}

// Server ↔ Machine WebSocket protocol
export type ServerToMachineMessage =
  | { type: "agent:start"; agentId: string; config: AgentConfig; wakeMessage?: AgentMessage; unreadSummary?: Record<string, number>; resumePrompt?: string; launchId?: string }
  | { type: "agent:stop"; agentId: string }
  | { type: "agent:reset-workspace"; agentId: string }
  | { type: "agent:deliver"; agentId: string; message: AgentMessage; seq: number; traceparent?: string; deliveryId?: string }
  | { type: "agent:workspace:list"; agentId: string; dirPath?: string }
  | { type: "agent:workspace:read"; agentId: string; path: string; requestId: string }
  | { type: "agent:skills:list"; agentId: string; runtime?: string }
  /**
   * Ask the daemon to re-emit current activity ground-truth for an agent.
   * Replaces the server-side "synthesize online when transient state is
   * stale" behaviour so the server stops inventing state.
   *
   * Daemon responds via the existing `agent:activity` upstream channel
   * with `probeId` echoed back so the server can correlate. Old daemons
   * that don't recognize this type fall through their unknown-type
   * switch silently (server-side fallback timer kicks in after 5s →
   * synth `online` like today).
   *
   * Introduced 2026-05-02 #engineering:72283cf7 task #340 (#1).
   */
  | { type: "agent:activity_probe"; agentId: string; probeId: string; purpose: "sweep" | "manual" }
  | { type: "machine:workspace:scan" }
  | { type: "machine:workspace:delete"; directoryName: string }
  | { type: "machine:runtime_models:detect"; requestId: string; runtime: string }
  | { type: "agent:runtime_profile:migration"; agentId: string; migrationKey: string; message: string; launchId?: string; traceparent?: string }
  | { type: "agent:runtime_profile:daemon_release_notice"; agentId: string; noticeKey: string; message: string; launchId?: string; traceparent?: string }
  | { type: "reminder.upsert"; agentId: string; reminder: ReminderJob }
  | { type: "reminder.cancel"; agentId: string; reminderId: string; version: number }
  | { type: "reminder.snapshot"; agentId: string; reminders: ReminderJob[] }
  | { type: "ping" };

export type MachineToServerMessage =
  /**
   * TODO(lifecycle-v2/daemon-protocol): `agent:status`,
   * `agent:activity`, and `agent:session` are legacy lifecycle signal
   * frames. The server currently adapts them into canonical lifecycle events
   * in `legacyAgentLifecycleAdapter`. The next protocol should add structured
   * daemon lifecycle events for runtime_ready/runtime_interrupted,
   * activity/progress, session_init/resync, runtime_stalled/provider_error,
   * and process_exit with explicit reason/correlation/window attrs. Once the
   * supported daemon window speaks that protocol, delete these lifecycle
   * compatibility frames from the reducer path.
   */
  | { type: "agent:status"; agentId: string; status: string; launchId?: string }
  /**
   * `probeId` (optional) — when this activity message is the daemon's
   * response to a prior `agent:activity_probe`, the daemon echoes back
   * the server-issued `probeId`. Server uses it to correlate the
   * response with its pending probe and cancel the fallback timer.
   * Self-initiated activity broadcasts (heartbeat, transition, etc.)
   * leave `probeId` unset.
   *
   * `clientSeq` (optional) — daemon-side per-agent monotonic counter
   * (starts at 1 on daemon process start, increments on each emit).
   * Server uses `(launchId, clientSeq)` as the dedupe key on ingest
   * and drops messages whose `clientSeq` is not strictly greater than
   * the highest seen for that `launchId`. Out-of-order delivery
   * across WS reconnects can otherwise overwrite recent state with
   * older state. Old daemons leave it unset; server treats absence
   * as "no dedup", behaviour-equivalent to pre-PR. New launchId
   * resets the counter so daemon restarts don't false-reject.
   * Introduced 2026-05-02 #engineering:72283cf7 task #340 PR B.
   */
  | { type: "agent:activity"; agentId: string; activity: string; detail: string; entries?: TrajectoryEntry[]; launchId?: string; probeId?: string; clientSeq?: number }
  | { type: "agent:session"; agentId: string; sessionId: string; launchId?: string }
  | { type: "agent:runtime_profile"; agentId: string; facts: AgentRuntimeProfileReport; launchId?: string; traceparent?: string }
  | { type: "agent:runtime_profile:migration:ack"; agentId: string; migrationKey: string; launchId?: string; traceparent?: string }
  | { type: "agent:runtime_profile:migration_done"; agentId: string; migrationKey: string; launchId?: string; traceparent?: string }
  | { type: "agent:runtime_profile:daemon_release_notice:ack"; agentId: string; noticeKey: string; launchId?: string; traceparent?: string }
  | { type: "agent:deliver:ack"; agentId: string; seq: number; traceparent?: string; deliveryId?: string }
  | { type: "agent:workspace:file_tree"; agentId: string; files: FileNode[]; dirPath?: string }
  | { type: "agent:workspace:file_content"; agentId: string; requestId: string; content: string | null; binary: boolean; size?: number; mimeType?: string; encoding?: "utf-8" | "base64" }
  | { type: "agent:skills:list_result"; agentId: string; global: SkillInfo[]; workspace: SkillInfo[] }
  | { type: "machine:workspace:scan_result"; directories: WorkspaceDirectoryInfo[] }
  | { type: "machine:workspace:delete_result"; directoryName: string; success: boolean }
  | { type: "machine:runtime_models:result"; requestId: string; models?: RuntimeModelInfo[]; default?: string; error?: string }
  | { type: "reminder.fire_attempt"; agentId: string; reminderId: string; version: number; firedAtClient: string }
  | { type: "reminder.snapshot.request"; agentId: string }
  | { type: "pong" }
  | { type: "ready"; capabilities: string[]; runtimes: string[]; runningAgents: string[]; hostname?: string; os?: string; daemonVersion?: string };

export interface AgentRuntimeContext {
  /** The agent process receiving this context. */
  agentId?: string | null;
  /** Server/org context this launch is serving. */
  serverId?: string | null;
  /** Server-side machine UUID that owns this launch. */
  machineId?: string | null;
  /** Human-readable machine name from Slock. */
  machineName?: string | null;
  /** Daemon-reported host name, when known. */
  machineHostname?: string | null;
  /** Daemon-reported OS/platform, when known. */
  machineOs?: string | null;
  /** Connected daemon version, when known. */
  daemonVersion?: string | null;
  /** Local workspace path for this agent process, filled by the daemon. */
  workspacePath?: string | null;
}

export const RUNTIME_CONFIG_VERSION = 1 as const;

export type RuntimeProviderConfig =
  | { kind: "default" }
  | { kind: "custom"; apiUrl: string; apiKey: string };

export type RuntimeModelConfig =
  | { kind: "preset"; id: string }
  | { kind: "custom"; name: string };

export type RuntimeModeConfig =
  | { kind: "default" }
  | { kind: "fast" };

export interface RuntimeConfig {
  version: typeof RUNTIME_CONFIG_VERSION;
  runtime: string;
  provider?: RuntimeProviderConfig;
  model: RuntimeModelConfig;
  mode: RuntimeModeConfig;
  reasoningEffort?: ReasoningEffort | null;
  envVars?: Record<string, string> | null;
}

export interface AgentConfig {
  name: string;
  displayName: string | null;
  description: string | null;
  model: string;
  runtime: string;
  runtimeConfig?: RuntimeConfig | null;
  reasoningEffort: ReasoningEffort | null;
  executionMode?: "byoc" | "cloud" | string | null;
  envVars: Record<string, string> | null;
  sessionId: string | null;
  serverUrl: string;
  authToken: string;
  /**
   * Optional per-agent `sk_agent_*` credential — the bearer for the
   * `/internal/agent-api/*` surface where the acting agent is read from the
   * credential row, not a `:id` path param.
   *
   * Authority is the shared credential RFC (post-split — see
   * `#wg-slock-computer:0de1186e` discussion; pre-split equivalent is the
   * §3 credential isolation + §5 auth axis sections of the Computer RFC
   * v8.3.x). This docstring intentionally avoids naming a specific RFC
   * filename so the runner credential code does not need to follow doc
   * renames; cross-refs land in the contract index (task #9 follow-up).
   *
   * Server session worker runner credential contract:
   *   - The daemon stores this value in process memory and exposes a local
   *     proxy affordance to the `slock` wrapper (see `prepareCliTransport`).
   *   - The raw key, or any file pointer to it, MUST NOT be present in the
   *     spawned runtime env, workspace files, or CLI args. The
   *     local `slock` wrapper points short-lived CLI subprocesses at a
   *     launch-scoped local proxy; same-uid shells are contained by proxy
   *     capability enforcement and launch cleanup, not by file permissions.
   *   - When this key is present, the runner env MUST NOT also receive the
   *     legacy machine-token file path. Legacy token fallback is only for
   *     failed runner credential mint.
   *   - The daemon host process itself MUST NOT outbound-call
   *     `/internal/agent-api/*` with this credential — only the spawned
   *     runner (via the `slock` CLI wrapper) can use the local proxy. This
   *     isolates the agent-self surface to the runner's process boundary.
   *
   * Null until the Computer (sk_computer_*) mints a managed-runner credential
   * for this agent and threads it through `agent:start`.
   */
  agentCredentialKey?: string | null;
  /**
   * Server-side credential row id for a managed-runner credential minted for
   * this launch. Present only for daemon-managed runner credentials so the
   * server session worker can revoke the row when the launch ends.
   */
  agentCredentialId?: string | null;
  runtimeContext?: AgentRuntimeContext | null;
  /**
   * Spawn-time runtime-profile control. Server attaches this on
   * `agent:start` when the agent has a pending release notice that must be
   * surfaced before any inbox processing. Legacy migration controls may still
   * appear from older deployments, but runtime switches now reset the session
   * automatically; daemons acknowledge those legacy controls as no-ops instead
   * of surfacing them to the runtime — see
   * `agentRuntimeProfileService.getPendingRuntimeProfileControl()`.
   *
   * This is the spawn-time twin of the message-shaped runtime-profile
   * notification (the inbox path). Spawn-time can't deliver via stdin
   * because the agent process doesn't exist yet, so the control rides
   * along as a config field; once alive, the same control class is
   * delivered through the message pipeline (`agent:deliver` carrying
   * a `runtime_profile_*` message_id prefix) and wrapped by
   * `formatRuntimeProfileControlPrompt` instead.
   *
   * - `kind`    — `"daemon_release_notice"` for current deployments. `"migration"`
   *               is retained only as a legacy wire value; current daemons
   *               complete it without prompt/tool involvement.
   * - `key`     — opaque server-issued identifier. The daemon auto-acks on
   *               injection; agents never need to send it.
   * - `message` — fully rendered body the agent reads.
   */
  runtimeProfileControl?: {
    kind: AgentRuntimeProfilePendingKind;
    key: string;
    message: string;
  } | null;
}

export type ProfileVisibilityMembershipStatus = "active" | "removed";

export interface ProfileCreatedAgentSummary {
  id: string;
  name: string;
  displayName: string | null;
  avatarUrl: string | null;
  runtime: string;
  status: AgentStatus;
}

export type ProfileCreatorSummary =
  | {
      type: "human";
      id: string;
      name: string;
      displayName: string | null;
      avatarUrl: string | null;
      gravatarHash: string;
    }
  | {
      type: "agent";
      id: string;
      name: string;
      displayName: string | null;
      avatarUrl: string | null;
      deletedAt: string | null;
    };

export interface HumanProfileView {
  kind: "human";
  id: string;
  isSelf: boolean;
  name: string;
  displayName: string | null;
  description: string | null;
  avatarUrl: string | null;
  email: string | null;
  role: "owner" | "admin" | "member" | null;
  joinedAt: string | null;
  membershipStatus: ProfileVisibilityMembershipStatus;
  createdAgents: ProfileCreatedAgentSummary[];
}

export interface AgentProfileView {
  kind: "agent";
  id: string;
  isSelf: boolean;
  name: string;
  displayName: string | null;
  description: string | null;
  avatarUrl: string | null;
  status: AgentStatus;
  runtime: string;
  model: string;
  runtimeConfig?: RuntimeConfig | null;
  reasoningEffort: ReasoningEffort | null;
  executionMode: "byoc" | "cloud" | string | null;
  computerId: string | null;
  computerName: string | null;
  computerHostname: string | null;
  daemonVersion: string | null;
  creator: ProfileCreatorSummary | null;
  createdAgents: ProfileCreatedAgentSummary[];
  createdAt: string;
  deletedAt: string | null;
}

export type ProfileView = HumanProfileView | AgentProfileView;

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modifiedAt: string;
  children?: FileNode[];
}

/** Summary info for a single agent workspace directory on a machine */
export interface WorkspaceDirectoryInfo {
  /** Directory name (= agentId UUID) */
  directoryName: string;
  /** Total size in bytes of all files */
  totalSizeBytes: number;
  /** Most recent modification time */
  lastModified: string;
  /** Number of top-level files */
  fileCount: number;
}

/** A Claude Code skill (slash command) from SKILL.md */
export interface SkillInfo {
  /** Skill directory name */
  name: string;
  /** Display name from SKILL.md frontmatter */
  displayName: string;
  /** Description from SKILL.md frontmatter */
  description: string;
  /** Whether the skill is user-invocable */
  userInvocable: boolean;
  /** Source directory path where this skill was found */
  sourcePath?: string;
}

// Agent activity states
export type AgentActivity = "online" | "thinking" | "working" | "error" | "offline";
export type AgentStatus = "active" | "inactive" | "stopped";

export const VALID_ACTIVITIES = new Set<AgentActivity>(["online", "thinking", "working", "error", "offline"]);

// ── Agent Trajectory ──

/** A single entry in the agent's trajectory log — rich activity data from stream-json */
export type TrajectoryEntry =
  | { kind: "thinking"; text: string }
  | { kind: "tool_start"; toolName: string; toolInput: string }
  | { kind: "text"; text: string }
  // Durable history of an agent-visible action performed through Slock itself
  // (send / claim / reminder / profile update, etc.). This is not a live-status
  // subtitle, and it must not carry agent-facing recovery instructions.
  | { kind: "slock_action"; title: string; text: string }
  | { kind: "system"; title: string; text: string }
  | { kind: "compaction_started" }
  | { kind: "compaction_finished" }
  | { kind: "status"; activity: AgentActivity; detail: string };

/** Normalize backend activity string to a valid frontend AgentActivity.
 *  Maps unknown values to sensible defaults. */
export function normalizeActivity(raw: string | undefined, dbStatus?: string): AgentActivity {
  if (raw && VALID_ACTIVITIES.has(raw as AgentActivity)) return raw as AgentActivity;
  // Fallback from DB status
  if (dbStatus === "active") return "working";
  return "offline";
}

// ── Runtimes ──

export interface RuntimeInfo {
  /** Short ID used in DB, protocol, and config (e.g. "claude") */
  id: string;
  /** Human-readable name (e.g. "Claude Code") */
  displayName: string;
  /** CLI binary name to detect on PATH (e.g. "claude") */
  binary: string;
  /** Whether this runtime is currently supported */
  supported: boolean;
}

export const RUNTIMES: RuntimeInfo[] = [
  { id: "claude", displayName: "Claude Code", binary: "claude", supported: true },
  { id: "codex", displayName: "Codex CLI", binary: "codex", supported: true },
  { id: "antigravity", displayName: "Antigravity CLI", binary: "agy", supported: true },
  { id: "kimi", displayName: "Kimi CLI", binary: "kimi", supported: true },
  { id: "copilot", displayName: "Copilot CLI", binary: "copilot", supported: true },
  { id: "cursor", displayName: "Cursor CLI", binary: "cursor-agent", supported: true },
  { id: "gemini", displayName: "Gemini CLI", binary: "gemini", supported: true },
  { id: "opencode", displayName: "OpenCode", binary: "opencode", supported: true },
];

/** Map runtime ID → display name. Falls back to the ID itself. */
export function getRuntimeDisplayName(id: string): string {
  return RUNTIMES.find((r) => r.id === id)?.displayName ?? id;
}

export {
  __resetFailpointsForTests,
  __setFailpointsForTests,
  failpoints,
  InMemoryFailpointRegistry,
  noopFailpointRegistry,
} from "./testing/failpoints.js";
export type {
  FailpointEffect,
  FailpointMode,
  FailpointRegistry,
  FailpointSpec,
  FailpointTraceEntry,
  InMemoryFailpointRegistryOptions,
  MaybePromise,
} from "./testing/failpoints.js";

// ── Runtime Models ──

export interface RuntimeModelInfo {
  /** Model ID passed to CLI (e.g. "sonnet", "gpt-5.3-codex") */
  id: string;
  /** Human-readable label (e.g. "Sonnet", "GPT-5.3 Codex") */
  label: string;
  /**
   * Whether this model is expected to launch with the current runtime config.
   * Official CLI model catalogs can be marked launchable when launch is a
   * direct model-id argument; suggestion_only is for entries that may need
   * user provider config the machine has not verified.
   */
  verified?: "launchable" | "suggestion_only";
}

/**
 * A runtime's model catalog as reported by a specific machine, or statically
 * bundled when detection isn't available. The `default` field, when present,
 * is the runtime's own configured-default model on that machine.
 */
export interface RuntimeModelSet {
  models: RuntimeModelInfo[];
  default?: string;
}

export const RUNTIME_MODELS: Record<string, RuntimeModelInfo[]> = {
  claude: [
    { id: "opus", label: "Opus" },
    { id: "sonnet", label: "Sonnet" },
    { id: "haiku", label: "Haiku" },
  ],
  codex: [
    { id: "gpt-5.5", label: "GPT-5.5" },
    { id: "gpt-5.4", label: "GPT-5.4" },
    { id: "gpt-5.3-codex", label: "GPT-5.3 Codex" },
    { id: "gpt-5.3-codex-spark", label: "GPT-5.3 Codex Spark" },
    { id: "gpt-5.2-codex", label: "GPT-5.2 Codex" },
    { id: "gpt-5.2", label: "GPT-5.2" },
    { id: "gpt-5.1-codex-max", label: "GPT-5.1 Codex Max" },
    { id: "gpt-5.1-codex", label: "GPT-5.1 Codex" },
    { id: "gpt-5-codex", label: "GPT-5 Codex" },
    { id: "gpt-5", label: "GPT-5" },
  ],
  antigravity: [
    { id: "default", label: "AGY configured default", verified: "suggestion_only" },
  ],
  copilot: [
    { id: "gpt-5.4", label: "GPT-5.4" },
    { id: "gpt-5.2", label: "GPT-5.2" },
    { id: "claude-4-sonnet", label: "Claude 4 Sonnet" },
    { id: "claude-4.5-sonnet", label: "Claude 4.5 Sonnet" },
  ],
  cursor: [
    { id: "composer-2-fast", label: "Composer 2 Fast" },
    { id: "composer-2", label: "Composer 2" },
    { id: "auto", label: "Auto" },
  ],
  gemini: [
    { id: "default", label: "Configured Default / Auto", verified: "suggestion_only" },
    { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro (Preview)" },
    { id: "gemini-3-flash-preview", label: "Gemini 3 Flash (Preview)" },
    { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  ],
  opencode: [
    { id: "default", label: "Configured Default / Auto", verified: "suggestion_only" },
    { id: "deepseek/deepseek-v4-pro", label: "DeepSeek V4 Pro (OpenCode)", verified: "suggestion_only" },
    { id: "openrouter/anthropic/claude-opus-4.5", label: "Claude Opus 4.5 via OpenRouter", verified: "suggestion_only" },
    { id: "fusecode/opus[1m]", label: "Opus 1M via FuseCode", verified: "suggestion_only" },
  ],
  // Kimi CLI resolves model keys from each user's local config, so the safest
  // built-in option is to defer to whatever default model the CLI already uses.
  kimi: [
    { id: "default", label: "Configured Default" },
  ],
};

/** Get the default model ID for a runtime. */
export function getDefaultModel(runtimeId: string): string {
  const models = RUNTIME_MODELS[runtimeId];
  return models?.[0]?.id ?? "sonnet";
}

/** Get a model's display label. Falls back to the raw model ID. */
export function getModelLabel(runtimeId: string, modelId: string): string {
  const models = RUNTIME_MODELS[runtimeId];
  return models?.find((m) => m.id === modelId)?.label ?? modelId;
}

export interface RuntimeConfigHydrationInput {
  runtime?: string | null;
  model?: string | null;
  runtimeConfig?: unknown;
  reasoningEffort?: ReasoningEffort | null;
  envVars?: Record<string, string> | null;
}

export interface RuntimeConfigLaunchFields {
  runtime: string;
  model: string;
  mode: RuntimeModeConfig;
  reasoningEffort: ReasoningEffort | null;
  envVars: Record<string, string> | null;
}

const CONTROLLED_RUNTIME_ENV_KEYS: Record<string, readonly string[]> = {
  claude: ["ANTHROPIC_BASE_URL", "ANTHROPIC_API_KEY", "ANTHROPIC_CUSTOM_MODEL_OPTION"],
};

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalizeEnvVars(envVars: unknown): Record<string, string> | null {
  if (!isPlainRecord(envVars)) return null;
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(envVars)) {
    if (typeof key === "string" && typeof value === "string") {
      normalized[key] = value;
    }
  }
  return Object.keys(normalized).length > 0 ? normalized : null;
}

export function getControlledRuntimeEnvKeys(runtime: string): readonly string[] {
  return CONTROLLED_RUNTIME_ENV_KEYS[runtime] ?? [];
}

export function stripControlledRuntimeEnvVars(
  runtime: string,
  envVars: Record<string, string> | null | undefined,
): Record<string, string> | null {
  const normalized = normalizeEnvVars(envVars);
  if (!normalized) return null;
  const controlled = new Set(getControlledRuntimeEnvKeys(runtime));
  for (const key of controlled) {
    delete normalized[key];
  }
  return Object.keys(normalized).length > 0 ? normalized : null;
}

function isPresetRuntimeModel(runtime: string, model: string): boolean {
  return (RUNTIME_MODELS[runtime] ?? []).some((candidate) => candidate.id === model);
}

function modelConfigFromLegacy(runtime: string, model: string): RuntimeModelConfig {
  return isPresetRuntimeModel(runtime, model)
    ? { kind: "preset", id: model }
    : { kind: "custom", name: model };
}

function parseProviderConfig(runtime: string, value: unknown): RuntimeProviderConfig | undefined {
  if (runtime !== "claude") return undefined;
  if (!isPlainRecord(value)) return { kind: "default" };
  if (
    value.kind === "custom"
    && typeof value.apiUrl === "string"
    && value.apiUrl.trim()
    && typeof value.apiKey === "string"
    && value.apiKey.trim()
  ) {
    return { kind: "custom", apiUrl: value.apiUrl.trim(), apiKey: value.apiKey.trim() };
  }
  return { kind: "default" };
}

function parseModelConfig(runtime: string, value: unknown, fallback: string): RuntimeModelConfig {
  if (!isPlainRecord(value)) return modelConfigFromLegacy(runtime, fallback);
  if (value.kind === "custom" && typeof value.name === "string" && value.name.trim()) {
    return { kind: "custom", name: value.name.trim() };
  }
  if (value.kind === "preset" && typeof value.id === "string" && value.id.trim()) {
    return { kind: "preset", id: value.id.trim() };
  }
  return modelConfigFromLegacy(runtime, fallback);
}

function parseModeConfig(value: unknown): RuntimeModeConfig {
  if (!isPlainRecord(value)) return { kind: "default" };
  if (value.kind === "fast") return { kind: "fast" };
  return { kind: "default" };
}

export function hydrateRuntimeConfig(input: RuntimeConfigHydrationInput): RuntimeConfig {
  const stored = isPlainRecord(input.runtimeConfig) && input.runtimeConfig.version === RUNTIME_CONFIG_VERSION
    ? input.runtimeConfig
    : null;
  const runtime = (typeof stored?.runtime === "string" && stored.runtime.trim())
    || (typeof input.runtime === "string" && input.runtime.trim())
    || "claude";
  const fallbackModel = (typeof input.model === "string" && input.model.trim()) || getDefaultModel(runtime);
  const legacyEnvVars = normalizeEnvVars(input.envVars);
  const storedEnvVars = normalizeEnvVars(stored?.envVars);
  const legacyClaudeApiUrl = runtime === "claude" ? legacyEnvVars?.ANTHROPIC_BASE_URL : undefined;
  const legacyClaudeApiKey = runtime === "claude" ? legacyEnvVars?.ANTHROPIC_API_KEY : undefined;
  const provider = stored
    ? parseProviderConfig(runtime, stored.provider)
    : runtime === "claude" && legacyClaudeApiUrl && legacyClaudeApiKey
      ? { kind: "custom" as const, apiUrl: legacyClaudeApiUrl, apiKey: legacyClaudeApiKey }
      : runtime === "claude"
        ? { kind: "default" as const }
        : undefined;
  return {
    version: RUNTIME_CONFIG_VERSION,
    runtime,
    ...(provider ? { provider } : {}),
    model: stored
      ? parseModelConfig(runtime, stored.model, fallbackModel)
      : modelConfigFromLegacy(runtime, fallbackModel),
    mode: stored ? parseModeConfig(stored.mode) : { kind: "default" },
    reasoningEffort: (stored?.reasoningEffort as ReasoningEffort | null | undefined)
      ?? input.reasoningEffort
      ?? null,
    envVars: stripControlledRuntimeEnvVars(runtime, stored ? storedEnvVars : legacyEnvVars),
  };
}

export function runtimeConfigModelValue(config: RuntimeConfig): string {
  return config.model.kind === "custom" ? config.model.name : config.model.id;
}

export function runtimeConfigToLaunchFields(config: RuntimeConfigHydrationInput | RuntimeConfig): RuntimeConfigLaunchFields {
  const normalized = isPlainRecord(config) && config.version === RUNTIME_CONFIG_VERSION
    ? hydrateRuntimeConfig({ runtimeConfig: config })
    : hydrateRuntimeConfig(config as RuntimeConfigHydrationInput);
  const generatedEnvVars: Record<string, string> = {};
  if (normalized.runtime === "claude") {
    if (normalized.provider?.kind === "custom") {
      generatedEnvVars.ANTHROPIC_BASE_URL = normalized.provider.apiUrl;
      generatedEnvVars.ANTHROPIC_API_KEY = normalized.provider.apiKey;
    }
    if (normalized.model.kind === "custom") {
      generatedEnvVars.ANTHROPIC_CUSTOM_MODEL_OPTION = normalized.model.name;
    }
  }
  const envVars = {
    ...(normalized.envVars ?? {}),
    ...generatedEnvVars,
  };
  return {
    runtime: normalized.runtime,
    model: runtimeConfigModelValue(normalized),
    mode: normalized.mode,
    reasoningEffort: normalized.reasoningEffort ?? null,
    envVars: Object.keys(envVars).length > 0 ? envVars : null,
  };
}

export function validateRuntimeConfig(config: RuntimeConfig): string | null {
  if (config.version !== RUNTIME_CONFIG_VERSION) return "runtimeConfig version is unsupported";
  if (!config.runtime.trim()) return "runtimeConfig.runtime is required";
  if (config.model.kind === "preset" && !config.model.id.trim()) return "runtimeConfig.model.id is required";
  if (config.model.kind === "custom" && !config.model.name.trim()) return "runtimeConfig.model.name is required";
  if (config.mode.kind !== "default" && config.mode.kind !== "fast") {
    return "runtimeConfig.mode.kind is invalid";
  }
  if (config.mode.kind === "fast" && !RUNTIME_FAST_MODE_RUNTIMES.has(config.runtime)) {
    return `runtimeConfig.mode is not supported for runtime: ${config.runtime}`;
  }
  if (config.provider && config.runtime !== "claude") {
    return `runtimeConfig.provider is not supported for runtime: ${config.runtime}`;
  }
  if (config.provider?.kind === "custom") {
    if (!config.provider.apiUrl.trim()) {
      return "runtimeConfig.provider.apiUrl is required";
    }
    if (!config.provider.apiKey.trim()) {
      return "runtimeConfig.provider.apiKey is required";
    }
    let parsed: URL;
    try {
      parsed = new URL(config.provider.apiUrl);
    } catch {
      return "runtimeConfig.provider.apiUrl must be a valid URL";
    }
    if (parsed.username || parsed.password) {
      return "runtimeConfig.provider.apiUrl must not contain credentials";
    }
  }
  const validEffortIds = new Set(REASONING_EFFORTS.map((effort) => effort.id));
  if (config.reasoningEffort != null && !validEffortIds.has(config.reasoningEffort)) {
    return `Invalid reasoning effort: ${config.reasoningEffort}`;
  }
  if (config.reasoningEffort != null && !REASONING_EFFORT_RUNTIMES.has(config.runtime)) {
    return `runtimeConfig.reasoningEffort is not supported for runtime: ${config.runtime}`;
  }
  return null;
}

// ── Reasoning Effort ──

export type ReasoningEffort = "low" | "medium" | "high" | "xhigh";

export const REASONING_EFFORTS: { id: ReasoningEffort; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "xhigh", label: "Extra High" },
];

/** Runtimes that support configurable reasoning effort. */
export const REASONING_EFFORT_RUNTIMES = new Set(["claude", "codex", "copilot"]);

/** Runtimes that support the shared fast-mode launch variant. */
export const RUNTIME_FAST_MODE_RUNTIMES = new Set(["claude", "codex"]);

// ── Task Board ──

/**
 * Task lifecycle status.
 *
 * `closed` is a terminal state that means "won't do" — the task was
 * deliberately abandoned (cancelled / won't-fix / duplicate / out-of-scope),
 * distinct from `done` which means "completed". A closed task can be
 * reopened by transitioning back to `todo`.
 *
 * Transition rules live in taskService.VALID_TRANSITIONS; route input
 * validation in routes/tasks.ts whitelists the literal values.
 *
 * stdrc 2026-05-08 #proj-task:5ca7dfa3:
 *   "Task除了 done，还应该该有一个closed 的状态，显示为红色，
 *    表示的是关掉并且不准备做了"
 */
export type TaskStatus = "todo" | "in_progress" | "in_review" | "done" | "closed";

export interface TaskInfo {
  id: string;
  /** Same as id — task IS the message */
  messageId: string;
  channelId: string;
  channelName?: string | null;
  channelType?: "channel" | "private" | "joint" | "dm" | "thread";
  taskNumber: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdByType: "user" | "agent";
  createdById: string;
  createdByName?: string;
  claimedByType?: "user" | "agent" | null;
  claimedById?: string | null;
  claimedByName?: string | null;
  claimedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

export * from "./serverPermissions.js";

// ── Server Plans ──

/** Plan identifiers stored in the database. */
export type ServerPlan = "free" | "founder";

/** Plans shown in the pricing comparison UI (includes coming-soon tiers). */
export type DisplayPlan = "free" | "pro" | "max";

export interface PlanLimits {
  maxMachines: number;       // -1 = unlimited
  maxAgents: number;         // -1 = unlimited
  maxChannels: number;       // -1 = unlimited
  messageHistoryDays: number; // -1 = unlimited
  includedAgents: number;    // [UNUSED] extra-agent billing disabled — all plans use hard maxAgents caps
}

export interface PlanConfig {
  displayName: string;
  limits: PlanLimits;
  comingSoon: boolean;
  price: number;             // monthly price in dollars (0 = free)
  extraAgentPrice: number;   // [UNUSED] extra-agent billing disabled — always 0 for now
}

export const PLAN_CONFIG: Record<ServerPlan, PlanConfig> = {
  free: {
    displayName: "Hobby",
    limits: { maxMachines: 2, maxAgents: 5, maxChannels: 5, messageHistoryDays: 30, includedAgents: 5 },
    comingSoon: false,
    price: 0,
    extraAgentPrice: 0,
  },
  founder: {
    displayName: "Founder",
    limits: { maxMachines: -1, maxAgents: -1, maxChannels: -1, messageHistoryDays: -1, includedAgents: -1 },
    comingSoon: false,
    price: 0,
    extraAgentPrice: 0,
  },
};

/** Display-only plan configs for the pricing comparison UI (includes coming-soon tiers). */
export const DISPLAY_PLAN_CONFIG: Record<DisplayPlan, PlanConfig> = {
  free: PLAN_CONFIG.free,
  pro: {
    displayName: "Team",
    limits: { maxMachines: 8, maxAgents: 40, maxChannels: 20, messageHistoryDays: -1, includedAgents: 40 },
    comingSoon: true,
    price: 20,
    extraAgentPrice: 0,
  },
  max: {
    displayName: "Business",
    limits: { maxMachines: 40, maxAgents: 200, maxChannels: -1, messageHistoryDays: -1, includedAgents: 200 },
    comingSoon: true,
    price: 200,
    extraAgentPrice: 0,
  },
};

/** Plans shown in the pricing comparison UI. */
export const DISPLAY_PLANS: DisplayPlan[] = ["free", "pro", "max"];

// ── Free Trial ──

/** Start date of the extended free trial for Hobby plan users. */
export const TRIAL_START_DATE = new Date("2026-04-18T00:00:00Z");

/** Duration of the free trial in days. */
export const TRIAL_DURATION_DAYS = 44;

/** Check if the free trial period is currently active. */
export function isTrialActive(now: Date = new Date()): boolean {
  const trialEnd = new Date(TRIAL_START_DATE);
  trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS);
  return now >= TRIAL_START_DATE && now < trialEnd;
}

/** Get the trial end date. */
export function getTrialEndDate(): Date {
  const end = new Date(TRIAL_START_DATE);
  end.setDate(end.getDate() + TRIAL_DURATION_DAYS);
  return end;
}

/** Unlimited limits used during trial period for free plan users. */
export const TRIAL_LIMITS: PlanLimits = {
  maxMachines: -1,
  maxAgents: -1,
  maxChannels: -1,
  messageHistoryDays: -1,
  includedAgents: -1,
};

/**
 * Get the effective limits for a plan, accounting for the free trial.
 * During the trial period, free plan users get unlimited access.
 */
export function getEffectiveLimits(plan: ServerPlan, now?: Date): PlanLimits {
  if (plan === "free" && isTrialActive(now)) {
    return TRIAL_LIMITS;
  }
  return PLAN_CONFIG[plan].limits;
}

// ── Downgrade Grace Period ──

export const DOWNGRADE_GRACE_PERIOD_DAYS = 7;

// ── Name Validation ──

/**
 * Regex for valid `name` fields (user, agent, channel).
 * Must start with a letter; rest can be letters, digits, underscore, hyphen.
 * Disallows: pure numbers, leading digits, spaces, @, #, and other special characters.
 */
export const NAME_REGEX = /^[\p{L}][\p{L}\p{N}_-]*$/u;
export const NAME_MIN_LENGTH = 1;
export const NAME_MAX_LENGTH = 32;
export const RESERVED_AGENT_NAMES = [
  "all",
  "human",
  "humans",
  "agent",
  "agents",
  "here",
  "idle",
  "busy",
  "system",
] as const;

/** Validate a name and return an error message, or null if valid.
 *  Pass `minLength` to override the default minimum (e.g. 5 for user/server names). */
export function validateName(name: string, label = "Name", minLength = NAME_MIN_LENGTH): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return `${label} is required`;
  }
  if (trimmed.length < minLength) {
    return `${label} must be at least ${minLength} characters`;
  }
  if (trimmed.length > NAME_MAX_LENGTH) {
    return `${label} must be at most ${NAME_MAX_LENGTH} characters`;
  }
  if (!NAME_REGEX.test(trimmed)) {
    return `${label} must start with a letter and can only contain letters, numbers, hyphens, and underscores`;
  }
  return null;
}

export function isReservedAgentName(name: string): boolean {
  const normalized = name.trim().replace(/^@/, "").toLowerCase();
  return (RESERVED_AGENT_NAMES as readonly string[]).includes(normalized);
}

export function validateAgentName(name: string, label = "Agent name"): string | null {
  if (name.trim().length === 0) {
    return `${label} is required`;
  }
  if (isReservedAgentName(name)) {
    return `${label} @${name.trim().replace(/^@/, "").toLowerCase()} is reserved. Choose another name.`;
  }
  return validateName(name, label);
}

// ── Announcements ──

/** A single page inside a paginated announcement. */
export interface AnnouncementPage {
  title?: string;
  body: string;
}

/** An account-level popup announcement. Shown exactly once per user (by id)
 *  until dismissed; a new announcement always means a new id. */
export interface Announcement {
  id: string;
  title: string;
  pages: AnnouncementPage[];
  publishedAt: string;
}

// ── Daemon Version ──

/** Check if a daemon version is outdated (below the latest known version).
 *  Returns true if outdated or version is missing/unparseable. */
export function isDaemonOutdated(version: string | null | undefined, latestVersion: string | null | undefined): boolean {
  if (!version || !latestVersion) return false;
  const parse = (v: string) => v.split(".").map(Number);
  const latest = parse(latestVersion);
  const cur = parse(version);
  for (let i = 0; i < 3; i++) {
    const l = latest[i] ?? 0;
    const c = cur[i] ?? 0;
    if (c < l) return true;
    if (c > l) return false;
  }
  return false; // equal = not outdated
}
