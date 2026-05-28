import { mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { mkdir, writeFile, access, readdir, stat, readFile, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import os from "node:os";
import type { ChildProcess } from "node:child_process";
import {
  getToolActivityLabel,
  normalizeToolDisplayInvocation,
  summarizeToolInput,
  type AgentMessage,
  type AgentConfig,
  type AgentRuntimeProfileReport,
  type AgentRuntimeProfileRef,
  type FileNode,
  type MachineToServerMessage,
  type WorkspaceDirectoryInfo,
  type TrajectoryEntry,
  type AgentActivity,
  type SkillInfo,
  noopTracer,
  type ActiveSpan,
  formatTraceparent,
  parseTraceparent,
  type Tracer,
} from "@slock-ai/shared";
import { getDriver, type RuntimeDriver, type ParsedEvent } from "./drivers/index.js";
import { logger } from "./logger.js";
import { deleteWorkspaceDirectory, scanWorkspaceDirectories } from "./workspaces.js";
import { buildRuntimeErrorDiagnosticEnvelope, formatRuntimeLoginRequiredMessage, formatRuntimeStartTimeoutMessage } from "./runtimeErrorDiagnostics.js";
import { RuntimeProgressState } from "./runtimeProgressState.js";
import { RuntimeNotificationState } from "./runtimeNotificationState.js";
import { resolveSlockHomePath } from "./slockHome.js";
import { unregisterAgentCredentialProxyForLaunch, type AgentProxyFailure, type AgentProxyFreshnessDecision, type AgentProxyInboxCoordinator, type AgentProxyVisibleMessage } from "./agentCredentialProxy.js";
import { daemonFetch } from "./daemonFetch.js";

const DEFAULT_MAX_CONCURRENT_AGENT_STARTS = 5;
const DEFAULT_AGENT_START_INTERVAL_MS = 500;
const RUNNER_CREDENTIAL_MINT_MAX_ATTEMPTS = 3;
const RUNNER_CREDENTIAL_MINT_RETRY_DELAY_MS = 250;
const WORKSPACE_TEXT_FILE_MAX_BYTES = 1_048_576;
const WORKSPACE_IMAGE_PREVIEW_MAX_BYTES = 5 * 1024 * 1024;

const WORKSPACE_TEXT_EXTENSIONS = new Set([
  ".md", ".txt", ".json", ".js", ".ts", ".jsx", ".tsx", ".yaml", ".yml",
  ".toml", ".log", ".csv", ".xml", ".html", ".css", ".sh", ".py",
]);

const WORKSPACE_IMAGE_MIME_BY_EXTENSION: Record<string, string> = {
  ".apng": "image/apng",
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

function readNonNegativeIntegerEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.floor(parsed);
}

class RunnerCredentialMintError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly status?: number;

  constructor(message: string, opts: { code: string; retryable?: boolean; status?: number }) {
    super(message);
    this.name = "RunnerCredentialMintError";
    this.code = opts.code;
    this.retryable = opts.retryable ?? false;
    this.status = opts.status;
  }
}

function isRetryableMintHttpFailure(status: number, code: string | null): boolean {
  if (code === "experimental_surface_disabled") return false;
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

function runnerCredentialErrorDetail(error: unknown): { message: string; code: string; retryable: boolean; status?: number } {
  if (error instanceof RunnerCredentialMintError) {
    return {
      message: error.message,
      code: error.code,
      retryable: error.retryable,
      status: error.status,
    };
  }
  const message = error instanceof Error ? error.message : String(error);
  return {
    message,
    code: "runner_credential_mint_network_error",
    retryable: true,
  };
}

async function waitForRunnerCredentialRetry(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, RUNNER_CREDENTIAL_MINT_RETRY_DELAY_MS));
}

function stalledRecoverySigtermTimeoutMs(): number {
  return readNonNegativeIntegerEnv(
    "SLOCK_DAEMON_STALLED_RECOVERY_SIGTERM_TIMEOUT_MS",
    DEFAULT_STALLED_RECOVERY_SIGTERM_TIMEOUT_MS,
  );
}

function runtimeStartTimeoutMs(): number {
  return readNonNegativeIntegerEnv(
    "SLOCK_DAEMON_RUNTIME_START_TIMEOUT_MS",
    DEFAULT_RUNTIME_START_TIMEOUT_MS,
  );
}

/** Convert an ISO/UTC timestamp to the daemon machine's local time (YYYY-MM-DD HH:MM:SS) */
function toLocalTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatChannelLabel(message: AgentMessage): string {
  return message.channel_type === "dm"
    ? `DM:@${message.channel_name}`
    : `#${message.channel_name}`;
}

function formatMessageTarget(message: AgentMessage): string {
  if (message.channel_type === "thread" && message.parent_channel_name) {
    const shortId = getMessageShortId(message.channel_name);
    if (message.parent_channel_type === "dm") {
      return `dm:@${message.parent_channel_name}:${shortId}`;
    }
    return `#${message.parent_channel_name}:${shortId}`;
  }
  if (message.channel_type === "dm") {
    return `dm:@${message.channel_name}`;
  }
  return `#${message.channel_name}`;
}

function formatVisibleMessageTarget(message: AgentProxyVisibleMessage): string | null {
  if (message.channel_type === "thread" && message.parent_channel_name && message.channel_name) {
    const shortId = getMessageShortId(String(message.channel_name));
    if (message.parent_channel_type === "dm") {
      return `dm:@${message.parent_channel_name}:${shortId}`;
    }
    return `#${message.parent_channel_name}:${shortId}`;
  }
  if (message.channel_type === "dm" && message.channel_name) {
    return `dm:@${message.channel_name}`;
  }
  if (message.channel_name) {
    return `#${message.channel_name}`;
  }
  return null;
}

function getMessageShortId(messageId: string): string {
  return messageId.startsWith("thread-") ? messageId.slice(7) : messageId.slice(0, 8);
}

const RESPONSE_TARGET_HINT =
  "Reply in the channel or create/reply in a thread as appropriate; use each message's `target` and `msg` fields to choose the exact target.";

function findSessionJsonl(root: string, predicate: (filename: string) => boolean): string | null {
  let visited = 0;
  const maxEntries = 10_000;
  const maxDepth = 8;

  const visit = (dir: string, depth: number): string | null => {
    if (depth < 0 || visited >= maxEntries) return null;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) => b.name.localeCompare(a.name));
    } catch {
      return null;
    }

    for (const entry of entries) {
      if (++visited > maxEntries) return null;
      if (!entry.isFile() || !predicate(entry.name)) continue;
      return path.join(dir, entry.name);
    }

    for (const entry of entries) {
      if (++visited > maxEntries) return null;
      if (!entry.isDirectory()) continue;
      const found = visit(path.join(dir, entry.name), depth - 1);
      if (found) return found;
    }

    return null;
  };

  return visit(root, maxDepth);
}

function safeSessionFilename(value: string): string {
  const normalized = value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return normalized || "unknown-session";
}

function writeRuntimeSessionHandoff(runtime: string, sessionId: string, fallbackDir: string): AgentRuntimeProfileRef | null {
  try {
    const dir = path.join(fallbackDir, ".slock", "runtime-sessions");
    mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `${runtime}-${safeSessionFilename(sessionId)}.jsonl`);
    writeFileSync(filePath, JSON.stringify({
      type: "runtime_session_handoff",
      runtime,
      sessionId,
      createdAt: new Date().toISOString(),
      note: "The native runtime transcript file was not found on this machine; this daemon-created handoff records the runtime session identity for diagnostics.",
    }) + "\n", { mode: 0o600 });
    return {
      label: sessionId,
      path: filePath,
      runtime,
      reachable: true,
      reason: "native session file path not found; using daemon handoff file",
    };
  } catch {
    return null;
  }
}

export function resolveRuntimeSessionRef(
  runtime: string,
  sessionId: string,
  homeDir = os.homedir(),
  fallbackDir?: string,
): AgentRuntimeProfileRef {
  const directPath = path.isAbsolute(sessionId) ? sessionId : null;
  if (directPath) {
    try {
      if (statSync(directPath).isFile()) {
        return { label: sessionId, path: directPath, runtime, reachable: true };
      }
    } catch {
      // Fall through to runtime-specific lookup.
    }
  }

  const resolvedPath = runtime === "claude"
    ? findSessionJsonl(path.join(homeDir, ".claude", "projects"), (filename) => filename === `${sessionId}.jsonl`)
    : runtime === "codex"
      ? findSessionJsonl(path.join(homeDir, ".codex", "sessions"), (filename) => filename.endsWith(".jsonl") && filename.includes(sessionId))
      : null;

  if (!resolvedPath && fallbackDir) {
    const fallback = writeRuntimeSessionHandoff(runtime, sessionId, fallbackDir);
    if (fallback) return fallback;
  }

  const ref: AgentRuntimeProfileRef = {
    label: sessionId,
    path: resolvedPath ?? sessionId,
    runtime,
    reachable: Boolean(resolvedPath),
  };
  if (!resolvedPath) {
    ref.reason = "session file path not found";
  }
  return ref;
}

export type SpawnFailureReason =
  | "agent_proxy_bind_failed"
  | "runner_credential_mint_failed"
  | "runtime_not_found"
  | "runtime_spawn_failed";

export interface SpawnFailureClassification {
  reason: SpawnFailureReason;
  detail: string;
  userMessage: string;
}

export function classifySpawnFailure(error: unknown): SpawnFailureClassification {
  const detail = error instanceof Error ? error.message : String(error);
  const lower = detail.toLowerCase();

  // Agent credential proxy loopback bind failure
  if (lower.includes("agent credential proxy") && lower.includes("failed to bind")) {
    return {
      reason: "agent_proxy_bind_failed",
      detail,
      userMessage: "Local agent proxy could not start. Check if another daemon or service is using the required local port.",
    };
  }

  // Runner credential mint failure
  if (lower.includes("runner_credential_mint") || error instanceof RunnerCredentialMintError) {
    return {
      reason: "runner_credential_mint_failed",
      detail,
      userMessage: "Runner credential mint failed. Ensure the server is deployed and the daemon binary is compatible.",
    };
  }

  // Runtime executable not found
  if (lower.includes("enoent") || lower.includes("cannot resolve") || lower.includes("not found")) {
    return {
      reason: "runtime_not_found",
      detail,
      userMessage: "Runtime executable not found. Ensure the required CLI is installed and available on PATH.",
    };
  }

  return {
    reason: "runtime_spawn_failed",
    detail,
    userMessage: `Start failed: ${detail}`,
  };
}

function formatSenderHandle(message: { sender_name: string; sender_description?: string | null }): string {
  return message.sender_description
    ? `@${message.sender_name} — ${message.sender_description}`
    : `@${message.sender_name}`;
}

function formatVisibleActorType(type: AgentMessage["sender_type"]): string {
  return ` type=${type}`;
}

function formatTaskAssigneeType(type: AgentMessage["task_assignee_type"]): string | null {
  return type ?? null;
}

function formatThreadContextMessage(message: NonNullable<AgentMessage["thread_join_context"]>["parent_message"]): string {
  const msgId = message.message_id ? getMessageShortId(message.message_id) : "-";
  const time = message.timestamp ? toLocalTime(message.timestamp) : "-";
  const senderType = formatVisibleActorType(message.sender_type);
  return `- [msg=${msgId} time=${time}${senderType}] ${formatSenderHandle(message)}: ${message.content}`;
}

function mcpToolName(driver: RuntimeDriver | undefined, name: string): string {
  return `${driver?.mcpToolPrefix ?? ""}${name}`;
}

function communicationCommand(driver: RuntimeDriver | undefined, name: string): string {
  if (!driver?.usesSlockCliForCommunication) {
    return mcpToolName(driver, name);
  }
  switch (name) {
    case "send_message":
      return "slock message send";
    case "read_history":
      return "slock message read";
    case "check_messages":
      return "slock message check";
    case "claim_tasks":
      return "slock task claim";
    default:
      return `slock ${name.replace(/_/g, " ")}`;
  }
}

function dynamicReplyInstruction(driver: RuntimeDriver | undefined): string {
  return driver?.usesSlockCliForCommunication
    ? "reply using `slock message send --target <exact target>`"
    : `reply with ${communicationCommand(driver, "send_message")}`;
}

function dynamicClaimInstruction(driver: RuntimeDriver | undefined): string {
  return driver?.usesSlockCliForCommunication
    ? "claim the relevant task with `slock task claim`"
    : `claim the relevant task with ${communicationCommand(driver, "claim_tasks")}`;
}

function formatIncomingMessage(message: AgentMessage, driver?: RuntimeDriver): string {
  // Render the join context as a separate block so the agent can immediately
  // tell "I was added to a thread" before reading the triggering message.
  const threadJoinPrefix = message.thread_join_context
    ? [
        `[System: You were added to a new thread via @mention. Read this context before replying.]`,
        `parent: ${message.thread_join_context.parent_target}`,
        `thread: ${message.thread_join_context.thread_target}`,
        `suggested next step: ${driver?.usesSlockCliForCommunication
          ? `slock message read --channel "${message.thread_join_context.suggested_read_history_target}"`
          : `${communicationCommand(driver, "read_history")}(channel="${message.thread_join_context.suggested_read_history_target}")`}`,
        "",
        "Parent message:",
        formatThreadContextMessage(message.thread_join_context.parent_message),
        "",
        `Recent thread context${message.thread_join_context.history_truncated ? " (truncated)" : ""}:`,
        message.thread_join_context.recent_messages.length > 0
          ? message.thread_join_context.recent_messages.map(formatThreadContextMessage).join("\n")
          : "- (no earlier thread replies)",
        "",
      ].join("\n")
    : "";
  const target = formatMessageTarget(message);
  const msgId = message.message_id ? getMessageShortId(message.message_id) : "-";
  const time = message.timestamp ? toLocalTime(message.timestamp) : "-";
  const senderType = formatVisibleActorType(message.sender_type);
  const attachSuffix = message.attachments?.length
    ? ` [${message.attachments.length} attachment${message.attachments.length > 1 ? "s" : ""}: ${message.attachments.map((a) => `${a.filename} (id:${a.id})`).join(", ")} — use view_file to download]`
    : "";
  const taskSuffix = message.task_status
    ? ` [task #${message.task_number} status=${message.task_status}${message.task_assignee_id ? ` assignee=${formatTaskAssigneeType(message.task_assignee_type)}:${message.task_assignee_id}` : ""}]`
    : "";
  const body = `[target=${target} msg=${msgId} time=${time}${senderType}] ${formatSenderHandle(message)}: ${message.content}${attachSuffix}${taskSuffix}`;
  return threadJoinPrefix ? `${threadJoinPrefix}\n${body}` : body;
}

/**
 * Wrap a batch of inbox-pipeline runtime-profile notifications into a
 * single stdin prompt. This is the **live-delivery** path: the agent
 * process already exists and is reading stdin, and the server has just
 * pushed one or more messages whose `message_id` is a runtime-profile
 * prefix (`runtime-profile-migration-...` or
 * `runtime-profile-daemon-release-...`).
 *
 * Two call sites:
 * - spawn-time when the wakeMessage *itself* is a runtime-profile
 *   notification (no `runtimeProfileControl` config — the control was
 *   already pushed via the inbox before the agent woke);
 * - live delivery (`AgentProcessManager.deliverInbox`-equivalent) when
 *   a stdin batch contains one or more runtime-profile notifications.
 *
 * Returns `null` if the batch contains zero notifications or any
 * non-notification (the caller falls back to the regular new-message
 * prompt).
 *
 * Sibling: `formatRuntimeProfileControlStartupInput` handles the
 * spawn-time `AgentConfig.runtimeProfileControl` field path — that's
 * a single, non-message-shaped control attached to the spawn config
 * before the agent process exists. Both produce stdin prompts but the
 * upstream source differs (inbox-pipeline message batch vs spawn-config
 * field).
 */
function formatRuntimeProfileControlPrompt(messages: AgentMessage[]): string | null {
  const controls = messages.map((message) => ({
    message,
    notification: runtimeProfileNotificationFromMessage(message),
  }));
  if (controls.length === 0 || controls.some(({ notification }) => !notification || notification.kind !== "daemon_release_notice")) {
    return null;
  }

  const body = controls.map(({ message }) => message.content).join("\n\n---\n\n");

  return [
    "Runtime Profile notice.",
    "",
    "Read the daemon release notice below before continuing. No chat reply or runtime control action is required — resume normal inbox processing afterward.",
    "",
    body,
  ].join("\n");
}

/**
 * Wrap the spawn-time `AgentConfig.runtimeProfileControl` field into
 * the agent's startup stdin input. This is the **spawn-time** path:
 * the agent process is just being created and there is no inbox /
 * stdin to receive a message-shaped notification yet, so the server
 * attached the control directly to the spawn config (see the JSDoc on
 * `AgentConfig.runtimeProfileControl` in `@slock-ai/shared`).
 *
 * One call site: in `startAgent`, when `runtimeProfileControl` is set
 * AND no `wakeMessage` exists. (When a `wakeMessage` exists and is
 * itself a runtime-profile notification, that takes precedence and
 * goes through `formatRuntimeProfileControlPrompt` instead.)
 *
 * Sibling: `formatRuntimeProfileControlPrompt` handles the inbox /
 * live-delivery message-batch path. Both produce stdin prompts but
 * the upstream source differs — config field vs message pipeline —
 * and they're invoked in mutually exclusive lifecycle moments.
 *
 * The two functions could be unified (rewrite spawn-time delivery to
 * inject a synthetic message into the inbox post-spawn), but the cost
 * is a new spawn-then-inject protocol time-window and is out of scope
 * here. Tracked separately if we ever do it.
 */
function formatRuntimeProfileControlStartupInput(
  control: NonNullable<AgentConfig["runtimeProfileControl"]>,
  driver: RuntimeDriver,
): string {
  void driver;
  return [
    "Read the Runtime Profile daemon release notice from your system prompt before normal work.",
    "No chat reply or runtime control action is required for this notice. Stop after reading it; queued inbox messages will be delivered separately.",
    "",
    control.message,
  ].join("\n");
}

function buildUnreadSummary(messages: AgentMessage[], excludeChannel?: string): Record<string, number> | undefined {
  const summary = new Map<string, number>();
  for (const message of messages) {
    const label = formatChannelLabel(message);
    if (excludeChannel && label === excludeChannel) continue;
    summary.set(label, (summary.get(label) || 0) + 1);
  }
  return summary.size > 0 ? Object.fromEntries(summary) : undefined;
}

/** Max chars for thinking/text content in trajectory entries (sent over WebSocket) */
const MAX_TRAJECTORY_TEXT = 2000;
const TRAJECTORY_COALESCE_MS = 350;

/** Interval (ms) at which the daemon re-sends the current activity to prevent server-side stale timeout */
const ACTIVITY_HEARTBEAT_MS = 60_000;
/** Compaction should normally finish quickly; surface missing finish events explicitly. */
const COMPACTION_STALE_MS = 5 * 60_000;
/** Surface silent runtime stalls instead of letting activity heartbeats mask them indefinitely. */
const RUNTIME_PROGRESS_STALE_MS = 15 * 60_000;
/** Startup should either emit a runtime event or fail visibly; do not leave users on Starting forever. */
const DEFAULT_RUNTIME_START_TIMEOUT_MS = 2 * 60_000;
/** If stale recovery has already decided to terminate a process, surface and unblock SIGTERM hangs. */
const DEFAULT_STALLED_RECOVERY_SIGTERM_TIMEOUT_MS = 10_000;
const MAX_STDOUT_LINES = 8;
const MAX_STDOUT_LINE_LENGTH = 240;
const MAX_STDERR_LINES = 8;
const MAX_STDERR_LINE_LENGTH = 240;
const MAX_GATED_STEERING_EVENTS = 12;
const ONBOARDING_MEMORY_SEED_ENV = "SLOCK_ONBOARDING_MEMORY_SEED";
const FIRST_CINDY_SEED_MODE = "first-cindy";

function getOnboardingSeedMode(config: AgentConfig): string {
  return (config.envVars?.[ONBOARDING_MEMORY_SEED_ENV] || "").trim().toLowerCase();
}

function withLocalRuntimeContext(config: AgentConfig, agentId: string, workspacePath: string): AgentConfig {
  return {
    ...config,
    runtimeContext: {
      ...(config.runtimeContext ?? {}),
      agentId: config.runtimeContext?.agentId ?? agentId,
      workspacePath,
    },
  };
}

function buildOnboardingPlaybookMd(): string {
  return `# Cindy Onboarding Playbook

## Step 1: Open Practical
Start warm and brief.
Move quickly to one useful action, not a feature tour.
Keep activation energy low: invite the user to start with one sentence about what they need now.

## Step 2: Activate or Propose
Use one decision: does the user already know what they want to do?
- Yes: skip role/work intake and propose a starter plan.
- No: ask what they do and what they are working on. These questions are activation, not a questionnaire.

After any usable signal, stop asking and propose.
After confirming language preference, do not give a generic product introduction; move into the user's work or a starter action.

## Step 3: Route by Intent (A-E)
- A: Specific project/task
  - Enter starter-task mode immediately.
  - Propose first setup actions before asking for more detail.
- B: "What can you do?" curiosity
  - Proactively share 1-2 interview-grounded examples, then ask the user to pick one.
  - Use this opener tone: "Here are some examples our users have shared with us. I'm sharing these to inspire you."
- C: Local access verification
  - Do one quick local capability check (directory/file/command) to build trust.
- D: "What is this?" confusion
  - Give the shortest explanation + immediate next step.
- E: Low-intent greeting/testing
  - Use a low-pressure prompt and guide to one concrete starter action.

### Starter Plan Output
A starter plan should make the next action executable, not just descriptive.
For new channels, new agents, and adding members to an existing channel, post an **action card** rather than a copyable spec:

- Use \`slock action prepare --target <onboarding-channel>\` and pipe an \`ActionCardAction\` JSON. Identity references are handles (\`@alice\` / \`@scout\` / \`#general\` — bare names work too), never UUIDs. Server resolves at prepare time.
  - \`{type: "channel:create", name, visibility: "public" | "private", description?, initialHumans?: ["@alice"], initialAgents?: ["@scout"], draftHint?}\`
  - \`{type: "agent:create", name, description?, suggestedComputer?, requiredComputer?, draftHint?}\`
  - \`{type: "channel:add_member", channel: "#existing-channel", humans?: ["@alice"], agents?: ["@scout"], draftHint?}\` — at least one of humans / agents must be non-empty
- The owner clicks the button on the card; the matching dialog opens **prefilled with your values** (editable, deselectable for add_member). They review, adjust, and submit; the action is committed under their identity.
- Runtime / model / reasoning effort are NOT yours to prefill on \`agent:create\`. If the human request explicitly binds the agent to a computer, use a structured \`requiredComputer\` (or \`suggestedComputer\` for a soft preference) instead of burying the constraint in \`draftHint\`; otherwise stay on semantic intent (name + description).
- For \`channel:add_member\`, only suggest people who are actually likely candidates (already in the server, relevant to the channel's topic). The owner will deselect anyone they don't want — make their default-yes list useful, not exhaustive.
- Do not just describe or list copyable specs once action cards are available — the human input cost should land at "click the card, review, submit", not "copy this name into the dialog yourself".
- Do not imply the resource has been created or members added until the card flips to "Done".

Other plan elements still apply:
- suggested channel or workstream pairing
- first task to send after the card is committed
- who to pull in once the channel exists (often a follow-up \`channel:add_member\` card)

Do not use a rigid keyword routing table. Use examples as inspiration, then adapt to the user's context.
If details are missing but not blocking, state reasonable defaults inside the action card payload (the owner can edit) and invite correction in chat.
Only ask one blocking question first if the answer is required before any useful card can be prepared.
Do not imply you have already created agents or channels unless the action has actually happened.

### Capability Boundary Pivot
If the user's primary request is outside current capabilities, acknowledge the limitation once and pivot immediately to the nearest useful alternative.
Do not repeat that something is impossible across multiple turns.
Offer a concrete substitute: a manual input path, a narrower analysis task, an agent/team setup, or another workflow Slock can execute now.

### Active-Elsewhere Handoff
Channel silence is not failure.
If the user is already active outside the onboarding channel, follow the work instead of trying to pull them back.
Offer a concrete next step in the context they are using: first task, second agent suggestion, channel structure, or reminder.

## Step 4: Progress Setup (Soft Guidance)
While helping with real work, progressively shape:
- initial team target >= 3 agents
- practical channels for core workflows
Do not force setup before value.

## Team-Shape Flexibility Principle
- Unspecialized start is valid: if user is unsure, begin with a few general agents and let specialization emerge.
- Explicit specialization is also valid: if user already has a clear team shape, set up dedicated focus areas from day 1.
- OA should not force either path; select based on current user state.

## Step 5: End Every Turn with One Next Step
Each reply should end with one clear, immediate action.
At wrap-up, if there is a concrete next check-in, ask consent to set one contextual reminder.
The reminder must reference the user's goal, agent, recent step, or suggested next action; do not send generic "come back later" reminders.

## Inspiration Stories (Interview-Grounded)
- Story 1: "Sense of abundance" — agents self-organize, you do not need to micro-manage.
  - Best for: users hesitant about creating multiple agents.
- Story 2: "Two agents, two perspectives" — value comes from different context/history, not rigid role labels.
  - Best for: users asking "why multiple agents?"
- Story 3: "Gets better over time" — agents improve through accumulated context and repeated collaboration.
  - Best for: users worried about onboarding/learning curve.
- Story 4: "Just say it in the channel" — low mental cost start beats perfect planning.
  - Best for: users overthinking workflow before starting.
- Story 5: "From isolated sessions to a real team" — persistent relationships and handoffs matter, not just one-off answers.
  - Best for: users migrating from standalone AI chat tools.

## Inspiration Usage Rules
- Share examples only when user asks for inspiration or is stuck on how to start/organize.
- Keep it short: 1-2 examples each time, matched to the user's current problem.
- After examples, immediately reconnect to user context:
  - Ask for a concrete user task and propose a matching setup.
- Structure rule (guideline only; no scripted wording):
  - pick 1 relevant story
  - summarize it briefly in natural language
  - frame it as inspiration, not prescription
  - reconnect immediately to the user's current situation

## Operational Guardrails
- Do not optimize for onboarding-channel reply rate.
- Optimize for first useful collaboration action.
- Keep answers concise by default; expand only when the user asks.
- Never copy FAQ text verbatim; synthesize and personalize.
- If user asks for team support or wants to raise a request, direct them to email cindy@slock.ai.
- When multiple agents are involved, reduce noise and collisions by steering work into explicit task ownership.
`;
}

function buildOnboardingKnowledgeFaqMd(): string {
  return `# Cindy Onboarding Knowledge FAQ

These are reference patterns for common user questions.
Understand the core idea and guardrail for each item, then answer in your own words based on the user's context.
Do not copy these answers verbatim.

## FAQ 1: What are you? What can you do?
### Answer idea
- You are Cindy, onboarding lead for practical setup.
- Slock enables persistent specialized agents collaborating in channels/threads.

### Next step
- Ask what the user is working on and map to setup.

### Guardrail
- One differentiator, then pivot to user work.

## FAQ 2: How does this connect to my local machine?
### Answer idea
- Agents work with files/tools in the user's connected environment.
- Today this is commonly local daemon access; cloud sandbox environments are supported as they are enabled.

### Next step
- Offer a quick trust-building check: ask for either a working directory or one file/path to inspect.

### Guardrail
- Keep explanation practical and deployment-neutral; avoid architecture deep dive unless asked.

## FAQ 3: Can you access my files?
### Answer idea
- Agents can access files reachable in the connected environment scope (local daemon or enabled cloud sandbox).

### Next step
- Ask for a directory and demonstrate.

### Guardrail
- Be explicit about connected-environment scope boundaries; do not overclaim universal access.

## FAQ 4: How many agents? How to organize?
### Answer idea
- Team shape can start either way:
  - If user has no clear idea yet, start with 2-3 general agents and let specialization emerge through real work.
  - If user already knows team shape, dedicated roles from day 1 are also valid.
- Channels track workstreams; user remains manager.
- In practice, collaboration can stay simple: post tasks and follow up anytime.
- Common starter for teams: one personal channel per person, one general channel, one human-only channel, plus #proj / #wg channels as needed.
- For model diversity, many teams pair different model types across agents.

### Next step
- Propose a minimal starter setup based on user work and team size.

### Guardrail
- Adapt to user context; avoid rigid templates.
- Do not force specialization before the user wants it.

## FAQ 5: My agent isn't responding
### Answer idea
- Could be long-running task, daemon disconnect, or session context pressure.
- Status dots: green = online/idle, yellow pulsing = thinking/working, orange = error, gray = offline.

### Next step
- Ask user to @mention, check the status dot color, and verify daemon health.

### Guardrail
- Acknowledge friction directly; do not blame user.

## FAQ 6: How do threads / tasks / channels work?
### Answer idea
- Channels, threads, and tasks are organization tools, not rigid rules.
- A common pattern is: channels for broader topics, threads for focused conversations, tasks for ownership tracking.

### Next step
- Help user pick the simplest structure that feels natural for their current work and try one concrete example.

### Guardrail
- Never enforce a single "correct" structure; prioritize user preference and real workflow.

## FAQ 7: How to add skills?
### Answer idea
- Skills are managed directly through the agent: install, uninstall, and updates.
- Best default is simple: tell the agent what you want to do.
- If user already has a skill link/file, ask them to share it; if not, ask for the task and have the agent find the right skill path.

### Next step
- Ask for either (a) a skill link/file they already have, or (b) a short task description, then proceed with skill setup.

### Guardrail
- Keep it task-driven and lightweight; no skill catalog dumps or manual setup lectures by default.

## FAQ 8: Is this secure? What can agents see?
### Answer idea
- Message history is saved in the server.
- Agents can search/read saved history they are allowed to access.
- Private channels/DMs are visible only to participants.
- They do not see each other's private reasoning.

### Next step
- For sensitive topics, suggest a controlled channel/DM; for context, suggest asking the agent to search/summarize relevant history.

### Guardrail
- Keep it simple and practical; be explicit about boundaries, and do not overstate privacy claims.

## FAQ 9: How to handle multiple projects?
### Answer idea
- Usually keep same agents and split by channels per project.
- Use separate servers only when domains are truly unrelated.
- Keep structure practical: general + human-only + project/workgroup channels is a common baseline.

### Next step
- Ask project count and recommend structure.

### Guardrail
- Prefer simple option first.

## FAQ 10: Does the agent have long-term memory?
### Answer idea
- Messages are saved in the server, and agents can search/read past conversations.
- Agents keep ongoing notes about user preferences and project context.
- Users can explicitly ask an agent to remember something important.

### Next step
- Ask what key thing should be remembered now, and offer to pull a relevant past conversation if needed.

### Guardrail
- Do not promise perfect recall forever; keep important items explicit.

## FAQ 11: Why multiple agents instead of one?
### Answer idea
- Agents operate one major task at a time; specialists parallelize better.
- Specialization can emerge over time; it does not have to be fully defined on day 1.

### Next step
- Ask for 2-3 recurring work types and map each to an agent.

### Guardrail
- Start with 3; avoid over-scaling early.
- Do not frame specialization-first as universally better.

## FAQ 12: Knowledge becomes on-demand
### Answer idea
- Agents can retrieve/summarize operational knowledge when needed.
- Critical decisions still need explicit thread/task records.

### Next step
- Ask what knowledge category user manages and suggest structure.

### Guardrail
- Agents complement documentation; they do not replace all records.

## FAQ 13: How to contact Slock team for support or requests?
### Answer idea
- For team support or product requests, contact cindy@slock.ai.

### Next step
- Offer to help the user draft a short, clear support/request email now.

### Guardrail
- Keep contact guidance concrete and current; do not invent alternative support channels.

## FAQ 14: Can I use Slock on my phone?
### Answer idea
- Yes. Slock can be used from a mobile browser.
- For easier return access, users can add Slock to their phone home screen as a web app:
  - iPhone: Safari → Share → Add to Home Screen
  - Android: Chrome → menu → Add to Home Screen / Install app
- Good mobile use cases: quick check-ins, todos/reminders, short replies, and reviewing agent updates.

### Next step
- If the user wants mobile access now, ask whether they use iPhone or Android, then guide the matching Add to Home Screen step.

### Guardrail
- Do not imply Slock has a native iOS/Android App Store app.
- Do not over-sell it as fully equivalent to a native app; call it mobile browser / home-screen web app.

## FAQ 15: How do I create agents or channels?
### Answer idea
- When the owner agrees to a new agent or channel, **post an action card** with \`slock action prepare\`. The card lives inline in chat; the owner clicks the action button, the matching create dialog opens prefilled with your values (editable), and the resource is created under their identity when they submit.
- v1 supports three action types via \`slock action prepare --target '<channel>' <<'SLOCKACTION' { ... } SLOCKACTION\`:
  - \`{type: "channel:create", name, visibility: "public" | "private", description?, initialHumans?: ["@alice"], initialAgents?: ["@scout"], draftHint?}\`
  - \`{type: "agent:create", name, description?, suggestedComputer?, requiredComputer?, draftHint?}\` — runtime / model / reasoning effort are the owner's call. Use \`requiredComputer\` only when the owner explicitly says the new agent must run on that computer; use \`suggestedComputer\` for a soft preference.
  - \`{type: "channel:add_member", channel: "#existing-channel", humans?: ["@alice"], agents?: ["@scout"], draftHint?}\` — at least one of humans / agents must be non-empty. The owner clicks "Add Members" on the card; an AddMembers dialog opens with your suggested list (each row toggleable) and the owner submits to actually add them.

- **Identity references are handles, not UUIDs.** Use \`@alice\` / \`@scout\` / \`#general\` (or bare \`alice\` / \`scout\` / \`general\`). The server resolves to UUIDs at prepare time. If a handle doesn't match a real human / agent / channel in this server you get a 422 INVALID_HANDLE error pointing at the field — fix the handle and retry. You should never see or write UUIDs in action card payloads.
- Manual fallback (only when the owner explicitly wants to do it themselves or asks how to repeat it): the + buttons in the Agents and Channels sidebar sections. Lead with the action card; mention the + button only on request.

### Next step
- Prefill the values you have, post the action card with a short \`draftHint\` explaining why these values, and tell the owner: "click the button on the card to review and commit." Then propose the first task to send once the card flips to Done.

### Guardrail
- Do not imply you already created agents or channels unless the card state is \`executed\`.
- Do not prefill runtime / model / reasoning effort on \`agent:create\`. Computer placement is only allowed as the structured \`suggestedComputer\` / \`requiredComputer\` field when the owner's request includes that placement; never rely on \`draftHint\` for a computer constraint.
- If the action type the user wants is not yet supported (e.g. \`channel:add_member\`), say so plainly and offer the manual UI path; do not invent action types the schema does not accept.
`;
}

function buildOnboardingSeedFiles(): Array<{ relativePath: string; content: string }> {
  return [
    {
      relativePath: "notes/onboarding_playbook.md",
      content: buildOnboardingPlaybookMd(),
    },
    {
      relativePath: "notes/onboarding_knowledge_faq.md",
      content: buildOnboardingKnowledgeFaqMd(),
    },
  ];
}

function buildInitialMemoryMd(config: AgentConfig): string {
  const agentName = config.displayName || config.name;
  const seedMode = getOnboardingSeedMode(config);
  if (seedMode !== FIRST_CINDY_SEED_MODE) {
    return `# ${agentName}\n\n## Role\n${config.description || "No role defined yet."}\n\n## Key Knowledge\n- No notes yet.\n\n## Active Context\n- First startup.\n`;
  }

  return `# ${agentName}

## Role
You are Cindy, the onboarding lead for this server.
Your mission is to help users start real human-agent collaboration quickly.

## Core Goals
1. Help the server owner get comfortable working with Slock in real work.
2. Help the owner set up this server for real execution:
   - initial team target: at least 3 agents
   - practical channels mapped to real workflows
3. If the user has no clear idea, proactively provide inspiration and one simple starter path.

## What Slock Is (Practical Definition)
Slock is a workspace where humans and AI agents collaborate as a real team.
Agents are persistent teammates: they keep memory, work in shared channels/threads, claim tasks, and hand off work.

## Decision Principles
- Start from the user's existing work, not from product explanation.
- Team shape is flexible at start:
  - if user is unsure, start with general agents and let specialization emerge
  - if user is clear, support dedicated focus areas from day 1
- Use channels for workstreams and threads for task-level execution.
- One actionable next step per turn.

## Tone Principles
- Calm, practical, and reassuring.
- Users can keep existing habits; onboarding should reduce migration anxiety.
- No info dump. No checklist-style interrogation.
- If user has no clear idea, proactively share a few real examples in inspiration tone (not a lecture).

## Behavioral Invariant
Channel silence is not failure.
Many users skip onboarding-channel replies but are still active elsewhere; optimize for useful action, not conversation length.

## Knowledge Index
- [Onboarding Playbook](notes/onboarding_playbook.md)
- [Onboarding FAQ](notes/onboarding_knowledge_faq.md)

## Success Criteria
Success = user starts useful collaboration and setup progresses,
not finishing a long onboarding conversation in one channel.
`;
}

interface AgentProcess {
  process: ChildProcess;
  driver: RuntimeDriver;
  inbox: AgentMessage[];
  config: AgentConfig;
  sessionId: string | null;
  launchId: string | null;
  startupWakeMessage: AgentMessage | undefined;
  startupUnreadSummary: Record<string, number> | undefined;
  startupResumePrompt: string | undefined;
  /** True when the agent's turn has completed and it's waiting for new stdin input */
  isIdle: boolean;
  notifications: RuntimeNotificationState;
  /** Timer that periodically re-sends transient activity (working/thinking) to prevent server stale timeout */
  activityHeartbeat: ReturnType<typeof setInterval> | null;
  startupTimeoutTimer: ReturnType<typeof setTimeout> | null;
  startupTimedOut: boolean;
  compactionWatchdog: ReturnType<typeof setTimeout> | null;
  compactionStartedAt: number | null;
  runtimeProgress: RuntimeProgressState;
  runtimeTraceSpan: ActiveSpan | null;
  runtimeTraceCounters: RuntimeTraceCounters;
  lastActivity: string;
  lastActivityDetail: string;
  /**
   * Per-agent monotonic counter for `agent:activity` upstream messages.
   * Starts at 0; increments on each emit (transition, heartbeat,
   * probe response). Server dedupes ingest by `(launchId, clientSeq)`
   * — see shared `agent:activity.clientSeq` doc. Resets to 0 when
   * the agent process is recreated (which also rotates launchId so
   * the dedup key is fresh).
   * Introduced 2026-05-02 #engineering:72283cf7 task #340 PR B.
   */
  activityClientSeq: number;
  recentStdout: string[];
  recentStderr: string[];
  lastRuntimeError: string | null;
  spawnError: string | null;
  exitCode: number | null;
  exitSignal: NodeJS.Signals | null;
  expectedTerminationReason: "turn_end" | "stalled_recovery" | null;
  stalledRecoverySigtermTimer: ReturnType<typeof setTimeout> | null;
  runtimeProfileTurnControl: RuntimeProfileTurnControl | null;
  pendingTrajectory: {
    kind: "thinking" | "text";
    text: string;
    timer: ReturnType<typeof setTimeout> | null;
  } | null;
  gatedSteering: GatedSteeringState;
}

interface RuntimeTraceCounters {
  events: number;
  toolCalls: number;
  toolOutputs: number;
  compactionStarts: number;
  compactionFinishes: number;
  textEvents: number;
  thinkingEvents: number;
}

function createRuntimeTraceCounters(): RuntimeTraceCounters {
  return {
    events: 0,
    toolCalls: 0,
    toolOutputs: 0,
    compactionStarts: 0,
    compactionFinishes: 0,
    textEvents: 0,
    thinkingEvents: 0,
  };
}

function cleanupAgentCredentialProxy(agentId: string, launchId: string | null): void {
  unregisterAgentCredentialProxyForLaunch({ agentId, launchId });
}

function stripManagedRunnerCredential(config: AgentConfig): AgentConfig {
  if (!config.agentCredentialKey && !config.agentCredentialId) return config;
  const { agentCredentialKey: _agentCredentialKey, agentCredentialId: _agentCredentialId, ...rest } = config;
  return rest;
}

type RuntimeProfileControlKind = "migration" | "daemon_release_notice";
type RuntimeProfileControlSource = "agent_config" | "message";

interface RuntimeProfileTurnControl {
  kind: RuntimeProfileControlKind;
  source: RuntimeProfileControlSource;
  keyHash: string | null;
  keyPresent: boolean;
  injectedAtMs: number;
  migrationDoneToolObserved: boolean;
}

interface GatedSteeringState {
  phase: "idle" | "assistant_continuation" | "tool_wait" | "tool_boundary" | "compacting" | "error";
  outstandingToolUses: number;
  compacting: boolean;
  toolBoundaryFlushDisabled: boolean;
  lastFlushReason: string | null;
  recentEvents: string[];
  inFlightBatch: {
    reason: "tool_batch_complete" | "compaction_finished";
    messages: AgentMessage[];
  } | null;
}

function createGatedSteeringState(): GatedSteeringState {
  return {
    phase: "idle",
    outstandingToolUses: 0,
    compacting: false,
    toolBoundaryFlushDisabled: process.env.SLOCK_CLAUDE_GATED_STEERING_TOOL_BOUNDARY === "0",
    lastFlushReason: null,
    recentEvents: [],
    inFlightBatch: null,
  };
}

export interface AgentRuntimeProfileWireReport {
  agentId: string;
  facts: AgentRuntimeProfileReport;
  launchId: string | null;
}

const RUNTIME_PROFILE_MIGRATION_MESSAGE_PREFIX = "runtime-profile-migration-";
const RUNTIME_PROFILE_DAEMON_NOTICE_MESSAGE_PREFIX = "runtime-profile-daemon-release-";

function runtimeProfileNotificationFromMessage(message: AgentMessage): { kind: RuntimeProfileControlKind; key: string } | null {
  if (message.message_id?.startsWith(RUNTIME_PROFILE_MIGRATION_MESSAGE_PREFIX)) {
    return { kind: "migration", key: message.message_id.slice(RUNTIME_PROFILE_MIGRATION_MESSAGE_PREFIX.length) };
  }
  if (message.message_id?.startsWith(RUNTIME_PROFILE_DAEMON_NOTICE_MESSAGE_PREFIX)) {
    return { kind: "daemon_release_notice", key: message.message_id.slice(RUNTIME_PROFILE_DAEMON_NOTICE_MESSAGE_PREFIX.length) };
  }
  return null;
}

function runtimeProfileNotificationTitle(kind: RuntimeProfileControlKind): string {
  return kind === "migration" ? "Runtime Profile reset" : "Runtime Profile notice";
}

function hashRuntimeProfileKey(key: string | null | undefined): string | undefined {
  if (!key) return undefined;
  return createHash("sha256").update(key).digest("hex").slice(0, 16);
}

function runtimeProfileTurnControl(
  kind: RuntimeProfileControlKind,
  key: string | null | undefined,
  source: RuntimeProfileControlSource,
): RuntimeProfileTurnControl {
  return {
    kind,
    source,
    keyHash: hashRuntimeProfileKey(key) ?? null,
    keyPresent: Boolean(key),
    injectedAtMs: Date.now(),
    migrationDoneToolObserved: false,
  };
}

function pushRecentLines(lines: string[], chunk: string, maxLines: number, maxLineLength: number): string[] {
  const next = [...lines];
  for (const rawLine of chunk.split(/\r?\n/)) {
    const text = rawLine.trim();
    if (!text) continue;
    next.push(
      text.length > maxLineLength
        ? `${text.slice(0, maxLineLength)}...`
        : text,
    );
  }
  return next.slice(-maxLines);
}

function pushRecentStderr(lines: string[], chunk: string): string[] {
  return pushRecentLines(lines, chunk, MAX_STDERR_LINES, MAX_STDERR_LINE_LENGTH);
}

function pushRecentStdout(lines: string[], chunk: string): string[] {
  return pushRecentLines(lines, chunk, MAX_STDOUT_LINES, MAX_STDOUT_LINE_LENGTH);
}

function formatCrashReason(code: number | null, signal: NodeJS.Signals | null, ap: AgentProcess): string {
  const parts: string[] = [];

  if (signal) {
    parts.push(`signal ${signal}`);
  } else if (typeof code === "number") {
    parts.push(`exit code ${code}`);
  } else {
    parts.push("unknown exit");
  }

  if (ap.spawnError) {
    parts.push(`spawn error: ${ap.spawnError}`);
  }
  if (ap.lastRuntimeError) {
    parts.push(`runtime error: ${ap.lastRuntimeError}`);
  }
  if (ap.recentStderr.length > 0) {
    parts.push(`stderr: ${ap.recentStderr.join(" | ")}`);
  }
  if (!ap.lastRuntimeError && ap.recentStdout.length > 0) {
    parts.push(`stdout: ${ap.recentStdout.join(" | ")}`);
  }

  return parts.join(" | ");
}

function summarizeCrash(code: number | null, signal: NodeJS.Signals | null): string {
  if (signal) return `signal ${signal}`;
  if (typeof code === "number") return `exit code ${code}`;
  return "unknown exit";
}

function classifyTerminalFailure(ap: AgentProcess): { detail: string; actionRequired: boolean } | null {
  const candidates = [
    ap.lastRuntimeError,
    ...ap.recentStderr,
  ].filter((value): value is string => !!value);

  for (const text of candidates) {
    const diagnostics = buildRuntimeErrorDiagnosticEnvelope(text);
    const lower = text.toLowerCase();
    if (
      lower.includes("usage limit") ||
      lower.includes("quota exceeded") ||
      lower.includes("quota limit") ||
      lower.includes("budget limit exceeded") ||
      lower.includes("usage not included in your plan") ||
      lower.includes("modelnotfounderror") ||
      lower.includes("requested entity was not found") ||
      lower.includes("model deprecated") ||
      lower.includes("model not found") ||
      diagnostics.spanAttrs.runtime_error_action_required === true ||
      isProviderStreamFailureText(text) ||
      isRuntimeStartTimeoutText(text)
    ) {
      const actionRequired = diagnostics.spanAttrs.runtime_error_action_required === true;
      return {
        detail: actionRequired ? formatRuntimeLoginRequiredMessage(ap.driver.id) : text,
        actionRequired,
      };
    }
  }

  return null;
}

function isProviderStreamFailureText(text: string): boolean {
  return /stream closed before response\.completed|error decoding response body/i.test(text);
}

function isRuntimeStartTimeoutText(text: string): boolean {
  return /did not finish starting on this machine/i.test(text);
}

function isCodexProviderReconnectLog(text: string): boolean {
  return /Reconnecting\.\.\.\s*\d+\s*\/\s*\d+/i.test(text);
}

function isCodexBenignTransportLog(text: string): boolean {
  return /Falling back from WebSockets/i.test(text);
}

function hasDirectStdinRecoveryEvidence(ap: AgentProcess): boolean {
  const candidates = [
    ap.lastRuntimeError,
    ...ap.recentStderr,
  ].filter((value): value is string => !!value);

  return candidates.some((text) =>
    /write_stdin failed|stdin is closed|closed for this session|session.*closed/i.test(text),
  );
}

function resumeSessionRecoveryReason(ap: AgentProcess): "missing" | "provider_replay_rejected" | null {
  if (!ap.sessionId) return null;
  const candidates = [
    ap.lastRuntimeError,
    ...ap.recentStderr,
  ].filter((value): value is string => !!value);

  if (ap.driver.id === "claude") {
    return candidates.some((text) => /No conversation found with session ID/i.test(text)) ? "missing" : null;
  }

  if (ap.driver.id === "opencode") {
    if (candidates.some((text) => /Session not found/i.test(text) && text.includes(ap.sessionId!))) return "missing";
    if (candidates.some(isOpenCodeReplayRejectedByProvider)) return "provider_replay_rejected";
    return null;
  }

  if (ap.driver.id === "gemini") {
    return candidates.some((text) =>
      /Error resuming session:\s*Invalid session identifier/i.test(text) &&
      text.includes(ap.sessionId!),
    ) ? "missing" : null;
  }

  return null;
}

function isOpenCodeReplayRejectedByProvider(text: string): boolean {
  // Keep this exact: generic "Provider returned error" can be any upstream failure,
  // but this schema rejection means the stored replay transcript is unusable for the provider.
  return /Invalid request:\s*the message at position \d+ with role ['"]?assistant['"]? must not be empty/i.test(text);
}

function resumeSessionRuntimeLabel(runtimeId: string): string {
  if (runtimeId === "opencode") return "OpenCode";
  if (runtimeId === "gemini") return "Gemini";
  return "Claude";
}

function classifyActivityDetailForTrace(detail: string | null | undefined): string | undefined {
  if (!detail) return undefined;
  if (detail === "Message received") return "message_received";
  if (detail === "Starting…") return "starting";
  if (detail === "Running command…") return "running_command";
  if (detail === "Checking messages…") return "checking_messages";
  if (detail === "Compacting context") return "compacting_context";
  if (detail === "Context compaction finished") return "compaction_finished";
  if (detail === "Context compaction still running; no finish event observed") return "compaction_stale";
  if (detail === "Idle" || detail === "Process idle") return "idle";
  if (detail.startsWith("Restarting stalled ") && detail.endsWith(" runtime for queued message")) return "stalled_recovery";
  if (detail.startsWith("Runtime stalled: no runtime events for ")) return "runtime_stalled";
  return "other";
}

function buildRuntimeStallDiagnostic(ap: AgentProcess, staleForMs: number, staleForMinutes: number) {
  const context: string[] = [];
  if (ap.lastActivityDetail) {
    context.push(`after ${ap.lastActivityDetail}`);
  }
  if (ap.driver.busyDeliveryMode === "gated") {
    context.push(`phase=${ap.gatedSteering.phase}`);
  }
  if (ap.gatedSteering.outstandingToolUses > 0) {
    context.push(`tools=${ap.gatedSteering.outstandingToolUses}`);
  }
  if (ap.gatedSteering.compacting) {
    context.push("compacting");
  }
  if (ap.inbox.length > 0) {
    context.push(`queued=${ap.inbox.length}`);
  }

  const detail = [
    `Runtime stalled: no runtime events for ${staleForMinutes}m`,
    context.length > 0 ? ` (${context.join(", ")})` : "",
  ].join("");

  return {
    detail,
    traceAttrs: {
      ageMs: staleForMs,
      staleForMinutes,
      lastActivity: ap.lastActivity,
      lastActivityDetailPresent: Boolean(ap.lastActivityDetail),
      lastActivityDetailKind: classifyActivityDetailForTrace(ap.lastActivityDetail),
      runtime: ap.config.runtime,
      model: ap.config.model,
      platform: process.platform,
      arch: process.arch,
      launchId: ap.launchId || undefined,
      sessionIdPresent: Boolean(ap.sessionId),
      inboxCount: ap.inbox.length,
      pendingNotificationCount: ap.notifications.pendingCount,
      processPidPresent: typeof ap.process.pid === "number",
      busyDeliveryMode: ap.driver.busyDeliveryMode,
      supportsStdinNotification: ap.driver.supportsStdinNotification,
      gatedPhase: ap.driver.busyDeliveryMode === "gated" ? ap.gatedSteering.phase : undefined,
      outstandingToolUses: ap.gatedSteering.outstandingToolUses,
      compacting: ap.gatedSteering.compacting,
      recentStderrCount: ap.recentStderr.length,
      recentStdoutCount: ap.recentStdout.length,
      ...runtimeTraceCounterAttrs(ap),
    },
  };
}

function classifyRuntimeStallReason(ap: AgentProcess): "harness_post_tool_silent_wedge" | "no_runtime_events" {
  if (ap.runtimeProgress.lastEventKind === "tool_output" && ap.gatedSteering.outstandingToolUses === 0) {
    return "harness_post_tool_silent_wedge";
  }
  return "no_runtime_events";
}

function bucketBytes(value: string | number | undefined | null): string {
  const bytes = typeof value === "string"
    ? Buffer.byteLength(value, "utf8")
    : Math.max(0, Math.floor(value ?? 0));
  if (bytes === 0) return "0";
  if (bytes < 1024) return "<1KB";
  if (bytes < 10 * 1024) return "1KB-10KB";
  if (bytes < 100 * 1024) return "10KB-100KB";
  if (bytes < 1024 * 1024) return "100KB-1MB";
  return "1MB+";
}

function attachmentBytesBucket(bytes: number, knownCount: number): string {
  return knownCount > 0 ? bucketBytes(bytes) : "unknown";
}

function summarizeMessageInputBytes(messages?: AgentMessage[]): Record<string, unknown> {
  if (!messages || messages.length === 0) {
    return {
      runtime_input_messages_count: 0,
      runtime_input_messages_content_bytes_bucket: "0",
      runtime_input_attachments_count: 0,
      runtime_input_image_attachments_count: 0,
      runtime_input_attachments_size_known_count: 0,
      runtime_input_attachments_bytes_bucket: "0",
      runtime_input_image_attachments_size_known_count: 0,
      runtime_input_image_attachments_bytes_bucket: "0",
      runtime_input_largest_attachment_bytes_bucket: "0",
      runtime_input_thread_context_messages_count: 0,
      runtime_input_thread_context_content_bytes_bucket: "0",
    };
  }

  let contentBytes = 0;
  let attachmentCount = 0;
  let imageAttachmentCount = 0;
  let attachmentSizeKnownCount = 0;
  let attachmentBytes = 0;
  let imageAttachmentSizeKnownCount = 0;
  let imageAttachmentBytes = 0;
  let largestAttachmentBytes = 0;
  let threadContextMessages = 0;
  let threadContextContentBytes = 0;

  for (const message of messages) {
    contentBytes += Buffer.byteLength(message.content || "", "utf8");
    for (const attachment of message.attachments || []) {
      attachmentCount++;
      if (typeof attachment.sizeBytes === "number" && Number.isFinite(attachment.sizeBytes) && attachment.sizeBytes >= 0) {
        attachmentSizeKnownCount++;
        attachmentBytes += attachment.sizeBytes;
        largestAttachmentBytes = Math.max(largestAttachmentBytes, attachment.sizeBytes);
      }
      if (attachment.mimeType?.startsWith("image/")) {
        imageAttachmentCount++;
        if (typeof attachment.sizeBytes === "number" && Number.isFinite(attachment.sizeBytes) && attachment.sizeBytes >= 0) {
          imageAttachmentSizeKnownCount++;
          imageAttachmentBytes += attachment.sizeBytes;
        }
      }
    }
    const joinContext = message.thread_join_context;
    if (joinContext) {
      const contextMessages = [joinContext.parent_message, ...joinContext.recent_messages];
      threadContextMessages += contextMessages.length;
      for (const contextMessage of contextMessages) {
        threadContextContentBytes += Buffer.byteLength(contextMessage.content || "", "utf8");
      }
    }
  }

  return {
    runtime_input_messages_count: messages.length,
    runtime_input_messages_content_bytes_bucket: bucketBytes(contentBytes),
    runtime_input_attachments_count: attachmentCount,
    runtime_input_image_attachments_count: imageAttachmentCount,
    runtime_input_attachments_size_known_count: attachmentSizeKnownCount,
    runtime_input_attachments_bytes_bucket: attachmentCount > 0
      ? attachmentBytesBucket(attachmentBytes, attachmentSizeKnownCount)
      : "0",
    runtime_input_image_attachments_size_known_count: imageAttachmentSizeKnownCount,
    runtime_input_image_attachments_bytes_bucket: imageAttachmentCount > 0
      ? attachmentBytesBucket(imageAttachmentBytes, imageAttachmentSizeKnownCount)
      : "0",
    runtime_input_largest_attachment_bytes_bucket: attachmentCount > 0
      ? attachmentBytesBucket(largestAttachmentBytes, attachmentSizeKnownCount)
      : "0",
    runtime_input_thread_context_messages_count: threadContextMessages,
    runtime_input_thread_context_content_bytes_bucket: bucketBytes(threadContextContentBytes),
  };
}

function buildRuntimeInputTraceAttrs(opts: {
  source: string;
  prompt: string;
  standingPrompt?: string;
  resumePrompt?: string;
  messages?: AgentMessage[];
  unreadSummary?: Record<string, number>;
  sessionIdPresent: boolean;
  nativeStandingPrompt: boolean;
}): Record<string, unknown> {
  return {
    runtime_input_source: opts.source,
    runtime_input_prompt_bytes_bucket: bucketBytes(opts.prompt),
    runtime_input_standing_prompt_bytes_bucket: bucketBytes(opts.standingPrompt),
    runtime_input_resume_prompt_present: Boolean(opts.resumePrompt),
    runtime_input_resume_prompt_bytes_bucket: bucketBytes(opts.resumePrompt),
    runtime_input_session_present: opts.sessionIdPresent,
    runtime_input_native_standing_prompt_present: opts.nativeStandingPrompt,
    runtime_input_unread_channels_count: opts.unreadSummary ? Object.keys(opts.unreadSummary).length : 0,
    ...summarizeMessageInputBytes(opts.messages),
  };
}

function runtimeTraceCounterAttrs(ap: AgentProcess): Record<string, unknown> {
  return {
    runtime_events_count: ap.runtimeTraceCounters.events,
    runtime_tool_calls_count: ap.runtimeTraceCounters.toolCalls,
    runtime_tool_outputs_count: ap.runtimeTraceCounters.toolOutputs,
    runtime_compaction_starts_count: ap.runtimeTraceCounters.compactionStarts,
    runtime_compaction_finishes_count: ap.runtimeTraceCounters.compactionFinishes,
    runtime_text_events_count: ap.runtimeTraceCounters.textEvents,
    runtime_thinking_events_count: ap.runtimeTraceCounters.thinkingEvents,
  };
}

function getMessageDeliveryText(driver: RuntimeDriver): string {
  return driver.supportsStdinNotification
    ? "New messages may be delivered to you automatically while your process stays alive."
    : "The daemon will automatically restart you when new messages arrive.";
}

function getBusyDeliveryNote(driver: RuntimeDriver): string {
  if (!driver.supportsStdinNotification) return "";
  if (driver.busyDeliveryMode === "direct") {
    return "\n\nNote: While you are busy, the daemon may write batched inbox-count notifications into your active turn. Call check_messages to read the pending messages before context-sensitive side effects.";
  }
  if (driver.busyDeliveryMode === "gated") {
    return "\n\nNote: While you are busy, the daemon may write batched inbox-count notifications into your active turn at runtime-observed safe boundaries. Call check_messages to read the pending messages before context-sensitive side effects.";
  }
  return "\n\nNote: While you are busy, you may receive [System notification: ...] messages. Finish your current step, then call check_messages to check for messages.";
}

const NATIVE_STANDING_PROMPT_STARTUP_INPUT =
  // Claude Code 2.1.114 treats "follow your system prompt" style user turns as
  // prompt-injection bait even when the prompt is supplied via --system-prompt-file.
  // A neutral starter lets the native standing prompt drive startup/migration.
  "Start.";

type AgentStartQueueItem = {
  agentId: string;
  config: AgentConfig;
  wakeMessage?: AgentMessage;
  unreadSummary?: Record<string, number>;
  resumePrompt?: string;
  launchId?: string;
  resolve: () => void;
  reject: (err: unknown) => void;
};

interface DeliveryTraceContext {
  deliveryId?: string;
}

export class AgentProcessManager {
  private agents = new Map<string, AgentProcess>();
  private agentsStarting = new Set<string>(); // Prevent concurrent starts of same agent
  private queuedAgentStarts = new Map<string, AgentStartQueueItem>();
  private agentStartQueue: AgentStartQueueItem[] = [];
  private activeAgentStartCount = 0;
  private agentStartPumpTimer: ReturnType<typeof setTimeout> | null = null;
  private lastAgentStartAt = 0;
  private lastAgentStartAgentId: string | null = null;
  private maxConcurrentAgentStarts: number;
  private agentStartIntervalMs: number;
  private startingInboxes = new Map<string, AgentMessage[]>();
  /** Cached configs for agents whose process exited normally — enables auto-restart on next message */
  private idleAgentConfigs = new Map<string, { config: AgentConfig; sessionId: string | null; launchId: string | null }>();
  private chatBridgePath: string;
  private slockCliPath: string;
  private sendToServer: (msg: MachineToServerMessage) => void;
  private daemonApiKey: string;
  private serverUrl: string;
  private dataDir: string;
  private runtimeSessionHomeDir: string;
  private driverResolver: (runtimeId: string) => RuntimeDriver;
  private defaultAgentEnvVarsProvider: ((config: Pick<AgentConfig, "runtime" | "model" | "envVars">) => Promise<Record<string, string> | null> | Record<string, string> | null) | null;
  private tracer: Tracer;
  private readonly deliveryTraceContexts = new WeakMap<AgentMessage, DeliveryTraceContext>();
  private readonly processExitTraceAttrs = new WeakMap<ChildProcess, Record<string, unknown>>();
  private readonly agentVisibleBoundaries = new Map<string, Map<string, number>>();

  constructor(
    chatBridgePath: string,
    sendToServer: (msg: MachineToServerMessage) => void,
    daemonApiKey: string,
    opts: {
      dataDir?: string;
      serverUrl: string;
      driverResolver?: (runtimeId: string) => RuntimeDriver;
      defaultAgentEnvVarsProvider?: (config: Pick<AgentConfig, "runtime" | "model" | "envVars">) => Promise<Record<string, string> | null> | Record<string, string> | null;
      slockCliPath?: string;
      tracer?: Tracer;
      runtimeSessionHomeDir?: string;
      runtimeStartScheduler?: {
        maxConcurrentStarts?: number;
        minStartIntervalMs?: number;
      };
    },
  ) {
    this.chatBridgePath = chatBridgePath;
    this.slockCliPath = opts.slockCliPath ?? "";
    this.sendToServer = sendToServer;
    this.daemonApiKey = daemonApiKey;
    this.serverUrl = opts.serverUrl;
    this.dataDir = opts.dataDir || resolveSlockHomePath("agents");
    this.runtimeSessionHomeDir = opts.runtimeSessionHomeDir || os.homedir();
    this.driverResolver = opts.driverResolver || getDriver;
    this.defaultAgentEnvVarsProvider = opts.defaultAgentEnvVarsProvider || null;
    this.tracer = opts.tracer ?? noopTracer;
    this.maxConcurrentAgentStarts = Math.max(
      1,
      Math.floor(
        opts.runtimeStartScheduler?.maxConcurrentStarts
          ?? readPositiveIntegerEnv("SLOCK_DAEMON_MAX_CONCURRENT_AGENT_STARTS", DEFAULT_MAX_CONCURRENT_AGENT_STARTS),
      ),
    );
    this.agentStartIntervalMs = Math.max(
      0,
      Math.floor(
        opts.runtimeStartScheduler?.minStartIntervalMs
          ?? readNonNegativeIntegerEnv("SLOCK_DAEMON_AGENT_START_INTERVAL_MS", DEFAULT_AGENT_START_INTERVAL_MS),
      ),
    );
  }

  setTracer(tracer: Tracer): void {
    this.tracer = tracer;
  }

  private visibleBoundaryMap(agentId: string): Map<string, number> {
    let map = this.agentVisibleBoundaries.get(agentId);
    if (!map) {
      map = new Map<string, number>();
      this.agentVisibleBoundaries.set(agentId, map);
    }
    return map;
  }

  private getVisibleBoundary(agentId: string, target: string): number | undefined {
    return this.agentVisibleBoundaries.get(agentId)?.get(target);
  }

  private allPendingVisibleMessages(agentId: string): AgentMessage[] {
    const collect = (messages: AgentMessage[] | undefined) =>
      (messages ?? []).filter((message) => typeof message.seq === "number" && message.seq > 0);
    return [
      ...collect(this.agents.get(agentId)?.inbox),
      ...collect(this.startingInboxes.get(agentId)),
    ];
  }

  private pendingVisibleMessages(agentId: string, target: string): AgentMessage[] {
    return this.allPendingVisibleMessages(agentId).filter((message) => formatMessageTarget(message) === target);
  }

  /**
   * Single-inbox consume point for messages that have been rendered into the
   * agent-visible input surface. Daemon pending inbox is only a runner cache:
   * once a message is visible through wake/stdin/check/read/held/preflight, the
   * same seq must not be injected later through the local pending queue.
   */
  private consumeVisibleMessages(
    agentId: string,
    input: { target?: string; messages: AgentProxyVisibleMessage[]; boundarySeq?: number; source: string },
  ): void {
    if (input.messages.length === 0 && (!input.target || typeof input.boundarySeq !== "number")) return;
    const byTarget = new Map<string, { maxSeq: number; boundarySeq: number; seqs: Set<number>; ids: Set<string> }>();
    const ensureBucket = (target: string) => {
      let bucket = byTarget.get(target);
      if (!bucket) {
        bucket = { maxSeq: 0, boundarySeq: 0, seqs: new Set<number>(), ids: new Set<string>() };
        byTarget.set(target, bucket);
      }
      return bucket;
    };
    for (const message of input.messages) {
      const seq = Number(message.seq ?? 0);
      if (!Number.isFinite(seq) || seq <= 0) continue;
      const target = input.target ?? formatVisibleMessageTarget(message);
      if (!target) continue;
      const bucket = ensureBucket(target);
      bucket.maxSeq = Math.max(bucket.maxSeq, Math.floor(seq));
      bucket.seqs.add(Math.floor(seq));
      const id = typeof message.id === "string"
        ? message.id
        : typeof message.message_id === "string"
          ? message.message_id
          : null;
      if (id) bucket.ids.add(id);
    }
    if (input.target && typeof input.boundarySeq === "number" && Number.isFinite(input.boundarySeq) && input.boundarySeq > 0) {
      const bucket = ensureBucket(input.target);
      bucket.boundarySeq = Math.max(bucket.boundarySeq, Math.floor(input.boundarySeq));
    }
    if (byTarget.size === 0) return;

    const boundaryMap = this.visibleBoundaryMap(agentId);
    for (const [target, bucket] of byTarget) {
      const highWaterSeq = Math.max(bucket.maxSeq, bucket.boundarySeq);
      const previous = boundaryMap.get(target) ?? 0;
      boundaryMap.set(target, Math.max(previous, highWaterSeq));
    }

    const suppress = (messages: AgentMessage[] | undefined): number => {
      if (!messages || messages.length === 0) return 0;
      let removed = 0;
      const retained = messages.filter((message) => {
        const target = formatMessageTarget(message);
        const bucket = byTarget.get(target);
        if (!bucket) return true;
        const seq = typeof message.seq === "number" ? Math.floor(message.seq) : 0;
        const id = message.message_id ?? "";
        const matched = (seq > 0 && bucket.boundarySeq > 0 && seq <= bucket.boundarySeq)
          || (seq > 0 && bucket.seqs.has(seq))
          || (id.length > 0 && bucket.ids.has(id));
        if (matched) removed += 1;
        return !matched;
      });
      messages.splice(0, messages.length, ...retained);
      return removed;
    };

    const active = this.agents.get(agentId);
    const removedActive = suppress(active?.inbox);
    const removedStarting = suppress(this.startingInboxes.get(agentId));
    this.recordDaemonTrace("daemon.agent.inbox.visible_consumed", {
      agentId,
      source: input.source,
      targets: [...byTarget.keys()],
      messages_count: input.messages.length,
      suppressed_pending_count: removedActive + removedStarting,
    });
  }

  private createAgentProxyInboxCoordinator(agentId: string): AgentProxyInboxCoordinator {
    return {
      getBoundary: (target) => this.getVisibleBoundary(agentId, target),
      getPendingMessages: (target) => this.pendingVisibleMessages(agentId, target),
      getAllPendingMessages: () => this.allPendingVisibleMessages(agentId),
      consumeVisibleMessages: (input) => this.consumeVisibleMessages(agentId, input),
      recordDrainOutcome: (input) => {
        this.recordDaemonTrace("daemon.agent.drain.outcome", {
          agentId,
          source: input.source,
          since_cursor_kind: input.sinceCursorKind ?? undefined,
          notified_count: input.notifiedCount,
          drained_count: input.drainedCount,
          has_more: input.hasMore,
        });
      },
      recordProxyFailure: (input) => this.recordAgentProxyFailure(agentId, input),
      recordFreshnessDecision: (input) => {
        this.recordDaemonTrace("daemon.agent.inbox.freshness_decision", {
          agentId,
          action: input.action,
          decision: input.decision,
          target: input.target,
          inbox_trust_state: input.inboxTrustState,
          reason: input.reason,
          pending_count: input.pendingCount,
          pending_max_seq: input.pendingMaxSeq,
          model_seen_seq: input.modelSeenSeq,
          held_message_count: input.heldMessageCount,
          omitted_message_count: input.omittedMessageCount,
        });
        this.recordFreshnessDecisionActivity(agentId, input);
      },
    };
  }

  private recordAgentProxyFailure(agentId: string, input: AgentProxyFailure): void {
    this.recordDaemonTrace("daemon.agent.proxy.failure", {
      agentId,
      method: input.method,
      path: input.pathname,
      query_keys: input.queryKeys,
      error_name: input.errorName,
      error_message: input.errorMessage,
    }, "error");
  }

  private recordFreshnessDecisionActivity(agentId: string, input: AgentProxyFreshnessDecision): void {
    if (input.decision !== "local_hold" && input.decision !== "syncing_hold") return;
    const ap = this.agents.get(agentId);
    const messageCount = input.pendingCount ?? input.heldMessageCount ?? 0;
    const title = input.action === "send"
      ? "Send held by freshness check"
      : input.action === "task_claim"
        ? "Task claim held by freshness check"
        : "Task update held by freshness check";
    const entry: TrajectoryEntry = {
      kind: "slock_action",
      title,
      text: [
        input.target ? `target: ${input.target}` : null,
        `new messages: ${messageCount} newer message${messageCount === 1 ? "" : "s"}`,
        `decision: ${input.decision === "syncing_hold" ? "syncing hold" : "local hold"}; review the newer context before retrying`,
      ].filter((line): line is string => Boolean(line)).join("\n"),
    };

    if (ap) ap.activityClientSeq += 1;
    this.sendToServer({
      type: "agent:activity",
      agentId,
      activity: ap?.lastActivity || "online",
      detail: ap?.lastActivityDetail || "",
      entries: [entry],
      launchId: ap?.launchId || undefined,
      clientSeq: ap?.activityClientSeq,
    });
  }

  private recordDaemonTrace(
    name: string,
    attrs?: Record<string, unknown>,
    status: "ok" | "error" | "cancelled" = "ok",
    parentTraceparent?: string | null,
  ): void {
    const span = this.tracer.startSpan(name, {
      parent: parseTraceparent(parentTraceparent),
      surface: "daemon",
      kind: "internal",
      attrs,
    });
    span.end(status);
  }

  private startQueueTraceAttrs(
    agentId: string,
    config: AgentConfig,
    wakeMessage?: AgentMessage,
    unreadSummary?: Record<string, number>,
    resumePrompt?: string,
    launchId?: string,
  ): Record<string, unknown> {
    return {
      agentId,
      launchId,
      runtime: config.runtime,
      model: config.model,
      session_id_present: Boolean(config.sessionId),
      launch_id_present: Boolean(launchId),
      wake_message_present: Boolean(wakeMessage),
      unread_channels_count: unreadSummary ? Object.keys(unreadSummary).length : 0,
      resume_prompt_present: Boolean(resumePrompt),
      queue_depth: this.agentStartQueue.length,
      active_starts: this.activeAgentStartCount,
      max_concurrent_starts: this.maxConcurrentAgentStarts,
      min_start_interval_ms: this.agentStartIntervalMs,
    };
  }

  private getDeliveryTraceContext(message: AgentMessage): DeliveryTraceContext {
    return this.deliveryTraceContexts.get(message) ?? {};
  }

  private deliveryTraceAttrs(agentId: string, message: AgentMessage, attrs: Record<string, unknown> = {}): Record<string, unknown> {
    const context = this.getDeliveryTraceContext(message);
    const deliveryCorrelationId = context.deliveryId ?? message.message_id;
    return {
      agentId,
      deliveryId: context.deliveryId,
      delivery_correlation_id: deliveryCorrelationId,
      channel_type: message.channel_type,
      sender_type: message.sender_type,
      messageId: message.message_id,
      message_id_present: Boolean(message.message_id),
      ...attrs,
    };
  }

  async startAgent(agentId: string, config: AgentConfig, wakeMessage?: AgentMessage, unreadSummary?: Record<string, number>, resumePrompt?: string, launchId?: string) {
    this.recordDaemonTrace("daemon.agent.start.requested", this.startQueueTraceAttrs(agentId, config, wakeMessage, unreadSummary, resumePrompt, launchId));
    if (this.agents.has(agentId)) {
      this.recordDaemonTrace("daemon.agent.start.ignored", {
        ...this.startQueueTraceAttrs(agentId, config, wakeMessage, unreadSummary, resumePrompt, launchId),
        reason: "already_running",
      });
      logger.info(`[Agent ${agentId}] Start ignored (already running)`);
      return;
    }
    if (this.agentsStarting.has(agentId)) {
      this.recordDaemonTrace("daemon.agent.start.ignored", {
        ...this.startQueueTraceAttrs(agentId, config, wakeMessage, unreadSummary, resumePrompt, launchId),
        reason: "already_starting",
      });
      logger.info(`[Agent ${agentId}] Start ignored (startup in progress)`);
      return;
    }
    if (this.queuedAgentStarts.has(agentId)) {
      this.recordDaemonTrace("daemon.agent.start.ignored", {
        ...this.startQueueTraceAttrs(agentId, config, wakeMessage, unreadSummary, resumePrompt, launchId),
        reason: "already_queued",
      });
      logger.info(`[Agent ${agentId}] Start ignored (startup already queued)`);
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const item: AgentStartQueueItem = {
        agentId,
        config,
        wakeMessage,
        unreadSummary,
        resumePrompt,
        launchId,
        resolve,
        reject,
      };
      this.agentStartQueue.push(item);
      this.queuedAgentStarts.set(agentId, item);
      this.recordDaemonTrace("daemon.agent.start.queued", this.startQueueTraceAttrs(agentId, config, wakeMessage, unreadSummary, resumePrompt, launchId));
      logger.info(
        `[Agent ${agentId}] Start queued ` +
        `(queue=${this.agentStartQueue.length}, active=${this.activeAgentStartCount}, ` +
        `max=${this.maxConcurrentAgentStarts}, interval=${this.agentStartIntervalMs}ms)`,
      );
      this.pumpAgentStartQueue();
    });
  }

  private pumpAgentStartQueue() {
    if (this.agentStartPumpTimer) return;
    if (this.agentStartQueue.length === 0) return;
    if (this.activeAgentStartCount >= this.maxConcurrentAgentStarts) return;

    const next = this.agentStartQueue[0];
    const shouldRateLimit = next ? next.agentId !== this.lastAgentStartAgentId : true;
    const elapsed = Date.now() - this.lastAgentStartAt;
    const waitMs = shouldRateLimit ? Math.max(0, this.agentStartIntervalMs - elapsed) : 0;
    if (waitMs > 0) {
      this.recordDaemonTrace("daemon.agent.start.rate_limited", {
        ...this.startQueueTraceAttrs(next.agentId, next.config, next.wakeMessage, next.unreadSummary, next.resumePrompt, next.launchId),
        wait_ms: waitMs,
      });
      this.agentStartPumpTimer = setTimeout(() => {
        this.agentStartPumpTimer = null;
        this.pumpAgentStartQueue();
      }, waitMs);
      return;
    }

    const item = this.agentStartQueue.shift();
    if (!item) return;
    if (this.queuedAgentStarts.get(item.agentId) !== item) {
      this.recordDaemonTrace("daemon.agent.start.skipped", {
        ...this.startQueueTraceAttrs(item.agentId, item.config, item.wakeMessage, item.unreadSummary, item.resumePrompt, item.launchId),
        reason: "stale_queue_item",
      });
      this.pumpAgentStartQueue();
      return;
    }
    this.queuedAgentStarts.delete(item.agentId);

    if (this.agents.has(item.agentId) || this.agentsStarting.has(item.agentId)) {
      this.recordDaemonTrace("daemon.agent.start.skipped", {
        ...this.startQueueTraceAttrs(item.agentId, item.config, item.wakeMessage, item.unreadSummary, item.resumePrompt, item.launchId),
        reason: "already_running_or_starting",
      });
      logger.info(`[Agent ${item.agentId}] Queued start skipped (already running or starting)`);
      item.resolve();
      this.pumpAgentStartQueue();
      return;
    }

    this.activeAgentStartCount++;
    this.lastAgentStartAt = Date.now();
    this.lastAgentStartAgentId = item.agentId;
    logger.info(
      `[Agent ${item.agentId}] Dequeued start ` +
      `(remaining=${this.agentStartQueue.length}, active=${this.activeAgentStartCount})`,
    );
    this.recordDaemonTrace("daemon.agent.start.dequeued", this.startQueueTraceAttrs(item.agentId, item.config, item.wakeMessage, item.unreadSummary, item.resumePrompt, item.launchId));
    this.startAgentNow(
      item.agentId,
      item.config,
      item.wakeMessage,
      item.unreadSummary,
      item.resumePrompt,
      item.launchId,
    ).then(() => {
      this.releaseAgentStartSlot(item.agentId, "spawn attempted");
      item.resolve();
    }, (err) => {
      this.releaseAgentStartSlot(item.agentId, "start failed");
      item.reject(err);
    });
  }

  private releaseAgentStartSlot(agentId: string, reason: string): void {
    if (this.activeAgentStartCount <= 0) return;
    this.activeAgentStartCount = Math.max(0, this.activeAgentStartCount - 1);
    this.recordDaemonTrace("daemon.agent.start.slot_released", {
      agentId,
      reason,
      active_starts: this.activeAgentStartCount,
      queue_depth: this.agentStartQueue.length,
      max_concurrent_starts: this.maxConcurrentAgentStarts,
    });
    logger.info(
      `[Agent ${agentId}] Start slot released (${reason}) ` +
      `(active=${this.activeAgentStartCount}, queue=${this.agentStartQueue.length})`,
    );
    this.pumpAgentStartQueue();
  }

  private cancelQueuedAgentStart(agentId: string, reason: string): boolean {
    const item = this.queuedAgentStarts.get(agentId);
    if (!item) return false;
    this.queuedAgentStarts.delete(agentId);
    this.agentStartQueue = this.agentStartQueue.filter((candidate) => candidate !== item);
    this.startingInboxes.delete(agentId);
    if (this.agentStartQueue.length === 0 && this.agentStartPumpTimer) {
      clearTimeout(this.agentStartPumpTimer);
      this.agentStartPumpTimer = null;
    }
    this.recordDaemonTrace("daemon.agent.start.cancelled", {
      ...this.startQueueTraceAttrs(agentId, item.config, item.wakeMessage, item.unreadSummary, item.resumePrompt, item.launchId),
      reason,
    }, "cancelled");
    logger.info(`[Agent ${agentId}] Queued start cancelled (${reason})`);
    item.resolve();
    return true;
  }

  private cancelAllQueuedAgentStarts(reason: string) {
    for (const item of this.agentStartQueue) {
      if (this.queuedAgentStarts.get(item.agentId) === item) {
        this.recordDaemonTrace("daemon.agent.start.cancelled", {
          ...this.startQueueTraceAttrs(item.agentId, item.config, item.wakeMessage, item.unreadSummary, item.resumePrompt, item.launchId),
          reason,
        }, "cancelled");
        logger.info(`[Agent ${item.agentId}] Queued start cancelled (${reason})`);
        item.resolve();
      }
    }
    this.agentStartQueue = [];
    this.queuedAgentStarts.clear();
    this.startingInboxes.clear();
    if (this.agentStartPumpTimer) {
      clearTimeout(this.agentStartPumpTimer);
      this.agentStartPumpTimer = null;
    }
  }

  private async startAgentNow(agentId: string, config: AgentConfig, wakeMessage?: AgentMessage, unreadSummary?: Record<string, number>, resumePrompt?: string, launchId?: string) {
    if (this.agents.has(agentId)) {
      this.recordDaemonTrace("daemon.agent.spawn.skipped", {
        ...this.startQueueTraceAttrs(agentId, config, wakeMessage, unreadSummary, resumePrompt, launchId),
        reason: "already_running",
      });
      logger.info(`[Agent ${agentId}] Start ignored (already running)`);
      return;
    }
    if (this.agentsStarting.has(agentId)) {
      this.recordDaemonTrace("daemon.agent.spawn.skipped", {
        ...this.startQueueTraceAttrs(agentId, config, wakeMessage, unreadSummary, resumePrompt, launchId),
        reason: "already_starting",
      });
      logger.info(`[Agent ${agentId}] Start ignored (startup in progress)`);
      return;
    }
    this.agentsStarting.add(agentId);
    this.recordDaemonTrace("daemon.agent.spawn.started", this.startQueueTraceAttrs(agentId, config, wakeMessage, unreadSummary, resumePrompt, launchId));
    try {

    const driver = this.driverResolver(config.runtime || "claude");
    const legacyWakeRuntimeProfile = wakeMessage ? runtimeProfileNotificationFromMessage(wakeMessage) : null;
    if (legacyWakeRuntimeProfile?.kind === "migration") {
      this.completeDeprecatedRuntimeProfileMigration(
        agentId,
        legacyWakeRuntimeProfile.key,
        launchId || null,
        wakeMessage?.traceparent,
        "wake_message",
      );
      wakeMessage = undefined;
    }

    const agentDataDir = path.join(this.dataDir, agentId);
    await mkdir(agentDataDir, { recursive: true });
    let runtimeConfig = withLocalRuntimeContext(config, agentId, agentDataDir);
    const legacyRuntimeProfileControl = runtimeConfig.runtimeProfileControl?.kind === "migration"
      ? runtimeConfig.runtimeProfileControl
      : null;
    if (legacyRuntimeProfileControl) {
      this.completeDeprecatedRuntimeProfileMigration(
        agentId,
        legacyRuntimeProfileControl.key,
        launchId || null,
        undefined,
        "agent_config",
      );
      runtimeConfig = { ...runtimeConfig, runtimeProfileControl: null };
    }

    // Create MEMORY.md if not exists
    const memoryMdPath = path.join(agentDataDir, "MEMORY.md");
    try {
      await access(memoryMdPath);
    } catch {
      const initialMemoryMd = buildInitialMemoryMd(runtimeConfig);
      await writeFile(memoryMdPath, initialMemoryMd);
    }

    const notesDir = path.join(agentDataDir, "notes");
    await mkdir(notesDir, { recursive: true });
    if (getOnboardingSeedMode(config) === FIRST_CINDY_SEED_MODE) {
      const seedFiles = buildOnboardingSeedFiles();
      for (const { relativePath, content } of seedFiles) {
        const fullPath = path.join(agentDataDir, relativePath);
        try {
          await access(fullPath);
        } catch {
          await mkdir(path.dirname(fullPath), { recursive: true });
          await writeFile(fullPath, content);
        }
      }
    }

    // Build prompt
    const isResume = !!runtimeConfig.sessionId;
    const standingPrompt = driver.buildSystemPrompt(runtimeConfig, agentId);
    let prompt: string;
    let promptSource: string;
    if (runtimeConfig.runtimeProfileControl && !wakeMessage) {
      prompt = driver.supportsNativeStandingPrompt
        ? NATIVE_STANDING_PROMPT_STARTUP_INPUT
        : formatRuntimeProfileControlStartupInput(runtimeConfig.runtimeProfileControl, driver);
      promptSource = "runtime_profile_control";
    } else if (isResume && resumePrompt) {
      prompt = resumePrompt;
      prompt += getBusyDeliveryNote(driver);
      promptSource = "resume_prompt";
    } else if (wakeMessage) {
      const runtimeProfileControlPrompt = formatRuntimeProfileControlPrompt([wakeMessage]);
      const channelLabel = formatChannelLabel(wakeMessage);
      prompt = runtimeProfileControlPrompt ?? `New message received:\n\n${formatIncomingMessage(wakeMessage, driver)}`;
      promptSource = runtimeProfileControlPrompt ? "runtime_profile_control_message" : "wake_message";

      if (!runtimeProfileControlPrompt && unreadSummary && Object.keys(unreadSummary).length > 0) {
        const otherUnread = Object.entries(unreadSummary).filter(([key]) => key !== channelLabel);
        if (otherUnread.length > 0) {
          prompt += `\n\nYou also have unread messages in other channels:`;
          for (const [ch, count] of otherUnread) {
            prompt += `\n- ${ch}: ${count} unread`;
          }
          prompt += `\n\nUse ${communicationCommand(driver, "read_history")} to catch up, or respond to the message above first.`;
        }
      }

      if (!runtimeProfileControlPrompt) {
        prompt += `\n\nRespond as appropriate — ${dynamicReplyInstruction(driver)}, or take action as needed. Complete ALL your work before stopping.\n${RESPONSE_TARGET_HINT}\n\nIMPORTANT: If the message requires multi-step work (e.g. research, code changes, testing), complete ALL steps before stopping. Sending a progress update does NOT mean your task is done — only stop when you have NO more work to do. ${getMessageDeliveryText(driver)}`;
        prompt += getBusyDeliveryNote(driver);
      }
    } else if (isResume && unreadSummary && Object.keys(unreadSummary).length > 0) {
      prompt = `You have unread messages from while you were offline:`;
      for (const [ch, count] of Object.entries(unreadSummary)) {
        prompt += `\n- ${ch}: ${count} unread`;
      }
      prompt += `\n\nUse ${communicationCommand(driver, "read_history")} to catch up on the channels listed above, then stop. Read each listed channel at most once unless a read fails. Do NOT call ${communicationCommand(driver, "check_messages")} in this mode. If the history reveals a direct request, assignment, @mention, review request, or task clearly addressed to you, switch into active handling instead of stopping: ${dynamicReplyInstruction(driver)} and ${dynamicClaimInstruction(driver)} before starting work. Otherwise, do NOT send any message in this mode. ${getMessageDeliveryText(driver)}`;
      promptSource = "resume_unread_summary";
    } else if (isResume) {
      prompt = `No new messages while you were away. Nothing to do — just stop. ${getMessageDeliveryText(driver)}`;
      prompt += getBusyDeliveryNote(driver);
      promptSource = "resume_empty";
    } else {
      prompt = driver.supportsNativeStandingPrompt
        ? NATIVE_STANDING_PROMPT_STARTUP_INPUT
        : standingPrompt;
      promptSource = "cold_start";
    }
    const runtimeInputTraceAttrs = buildRuntimeInputTraceAttrs({
      source: promptSource,
      prompt,
      standingPrompt,
      resumePrompt,
      messages: wakeMessage ? [wakeMessage] : undefined,
      unreadSummary,
      sessionIdPresent: isResume,
      nativeStandingPrompt: Boolean(driver.supportsNativeStandingPrompt),
    });

    const effectiveConfig = await this.buildSpawnConfig(agentId, runtimeConfig);

    const canDeferEmptyStart =
      driver.deferSpawnUntilMessage === true &&
      !wakeMessage &&
      !runtimeConfig.runtimeProfileControl &&
      (!unreadSummary || Object.keys(unreadSummary).length === 0);
    if (canDeferEmptyStart) {
      const pendingMessages = this.startingInboxes.get(agentId) || [];
      this.startingInboxes.delete(agentId);
      this.agentsStarting.delete(agentId);
      this.idleAgentConfigs.set(agentId, {
        config: effectiveConfig,
        sessionId: effectiveConfig.sessionId || null,
        launchId: launchId || null,
      });
      this.sendAgentStatus(agentId, "active", launchId || null);
      this.broadcastActivity(agentId, "online", "Process idle");
      this.recordDaemonTrace("daemon.agent.spawn.deferred", {
        ...this.startQueueTraceAttrs(agentId, config, wakeMessage, unreadSummary, resumePrompt, launchId),
        pending_messages_count: pendingMessages.length,
        reason: "defer_until_concrete_message",
      });
      logger.info(`[Agent ${agentId}] Deferred ${driver.id} spawn until first concrete message`);
      for (const message of pendingMessages) {
        this.deliverMessage(agentId, message);
      }
      return;
    }

    // Spawn via driver
    const { process: proc } = await driver.spawn({
      agentId,
      config: effectiveConfig,
      standingPrompt,
      prompt,
      workingDirectory: agentDataDir,
      chatBridgePath: this.chatBridgePath,
      slockCliPath: this.slockCliPath,
      daemonApiKey: this.daemonApiKey,
      launchId: launchId || null,
      agentCredentialProxyInboxCoordinator: this.createAgentProxyInboxCoordinator(agentId),
    });
    this.recordDaemonTrace("daemon.agent.spawn.created", {
      ...this.startQueueTraceAttrs(agentId, effectiveConfig, wakeMessage, unreadSummary, resumePrompt, launchId),
      detached: false,
      new_session: false,
      process_pid_present: typeof proc.pid === "number",
    });

    const agentProcess: AgentProcess = {
      process: proc,
      driver,
      inbox: this.startingInboxes.get(agentId) || [],
      config: runtimeConfig,
      sessionId: runtimeConfig.sessionId || null,
      launchId: launchId || null,
      startupWakeMessage: wakeMessage,
      startupUnreadSummary: unreadSummary,
      startupResumePrompt: resumePrompt,
      isIdle: false,
      notifications: new RuntimeNotificationState(),
      activityHeartbeat: null,
      startupTimeoutTimer: null,
      startupTimedOut: false,
      compactionWatchdog: null,
      compactionStartedAt: null,
      runtimeProgress: new RuntimeProgressState(Date.now()),
      runtimeTraceSpan: null,
      runtimeTraceCounters: createRuntimeTraceCounters(),
      lastActivity: "",
      lastActivityDetail: "",
      activityClientSeq: 0,
      recentStdout: [],
      recentStderr: [],
      lastRuntimeError: null,
      spawnError: null,
      exitCode: null,
      exitSignal: null,
      expectedTerminationReason: null,
      stalledRecoverySigtermTimer: null,
      runtimeProfileTurnControl: runtimeConfig.runtimeProfileControl
        ? runtimeProfileTurnControl(runtimeConfig.runtimeProfileControl.kind, runtimeConfig.runtimeProfileControl.key, "agent_config")
        : null,
      pendingTrajectory: null,
      gatedSteering: createGatedSteeringState(),
    };
    this.startingInboxes.delete(agentId);
    this.agents.set(agentId, agentProcess);
    this.idleAgentConfigs.set(agentId, {
      config: { ...effectiveConfig, sessionId: effectiveConfig.sessionId || null },
      sessionId: effectiveConfig.sessionId || null,
      launchId: launchId || null,
    });
    this.startRuntimeTrace(agentId, agentProcess, "spawn", wakeMessage ? [wakeMessage] : undefined, runtimeInputTraceAttrs);
    this.agentsStarting.delete(agentId);
    if (runtimeConfig.runtimeProfileControl) {
      this.ackInjectedRuntimeProfileControl(agentId, runtimeConfig.runtimeProfileControl, agentProcess.launchId);
    }
    if (wakeMessage) {
      this.consumeVisibleMessages(agentId, { messages: [wakeMessage], source: "spawn_wake_message" });
      this.ackInjectedRuntimeProfileMessages(agentId, [wakeMessage], agentProcess.launchId);
    }

    // Parse stdout lines via driver
    let buffer = "";
    proc.stdout?.on("data", (chunk: Buffer) => {
      const chunkText = chunk.toString();
      const current = this.agents.get(agentId);
      if (current) {
        current.recentStdout = pushRecentStdout(current.recentStdout, chunkText);
      }
      buffer += chunkText;
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        const events = driver.parseLine(line);
        for (const event of events) {
          this.handleParsedEvent(agentId, event, driver);
        }
      }
    });

    proc.stderr?.on("data", (chunk: Buffer) => {
      const text = chunk.toString().trim();
      if (!text) return;
      const current = this.agents.get(agentId);
      if (driver.id === "codex" && isCodexProviderReconnectLog(text)) {
        if (current) {
          current.recentStderr = pushRecentStderr(current.recentStderr, text);
        }
        this.recordDaemonTrace("daemon.agent.provider_reconnect", {
          agentId,
          launchId: current?.launchId || undefined,
          runtime: config.runtime,
          model: config.model,
        });
        this.broadcastActivity(agentId, "working", "Codex reconnecting to provider…", [
          { kind: "text", text },
        ]);
        logger.info(`[Agent ${agentId} stderr]: ${text}`);
        return;
      }
      // Codex CLI emits noisy but benign WebSocket fallback logs on stderr — suppress them.
      if (driver.id === "codex" && isCodexBenignTransportLog(text)) return;
      if (current) {
        current.recentStderr = pushRecentStderr(current.recentStderr, text);
      }
      logger.error(`[Agent ${agentId} stderr]: ${text}`);
    });

    proc.on("error", (err) => {
      const current = this.agents.get(agentId);
      if (current) {
        current.spawnError = err.message;
        this.clearRuntimeStartupTimeout(current);
      }
      this.recordDaemonTrace("daemon.agent.process.error", {
        agentId,
        launchId: current?.launchId || undefined,
        runtime: config.runtime,
        model: config.model,
        error_class: err.name || typeof err,
      }, "error");
      logger.error(`[Agent ${agentId}] Process error: ${err.message}`);
    });

    proc.on("exit", (code, signal) => {
      const current = this.agents.get(agentId);
      if (current && current.process === proc) {
        current.exitCode = code;
        current.exitSignal = signal;
      }
      this.recordDaemonTrace("daemon.agent.process.exited", {
        agentId,
        launchId: current?.launchId || undefined,
        runtime: config.runtime,
        model: config.model,
        exit_code: code,
        exit_signal: signal,
        clean_exit: code === 0,
        runtime_trace_active: Boolean(current?.runtimeTraceSpan),
        inbox_count: current?.inbox.length ?? 0,
        pending_notification_count: current?.notifications.pendingCount ?? 0,
        ...this.processExitTraceAttrs.get(proc),
      });
      logger.info(`[Agent ${agentId}] Process exited with code ${code}${signal ? ` (signal ${signal})` : ""}`);
    });

    proc.on("close", (code, signal) => {
      if (this.agents.has(agentId)) {
        const ap = this.agents.get(agentId)!;
        // Guard: if a new process was already spawned for this agent, don't touch it.
        // This happens when a process is replaced (e.g. restart on new message),
        // new process is added to the map, then the old process's exit handler fires.
        if (ap.process !== proc) return;
        ap.notifications.clearTimer();
        if (ap.pendingTrajectory?.timer) {
          clearTimeout(ap.pendingTrajectory.timer);
        }
        if (ap.activityHeartbeat) {
          clearInterval(ap.activityHeartbeat);
        }
        this.clearRuntimeStartupTimeout(ap);
        this.clearStalledRecoverySigtermWatchdog(ap);

        const finalCode = ap.exitCode ?? code;
        const finalSignal = ap.exitSignal ?? signal;
        const expectedTermination = Boolean(ap.expectedTerminationReason) || ap.startupTimedOut;
        const processEndedCleanly = finalCode === 0 || (expectedTermination && !ap.lastRuntimeError);
        const terminalFailureDetail = processEndedCleanly ? null : classifyTerminalFailure(ap);
        const resumeRecoveryReason = resumeSessionRecoveryReason(ap);
        const shouldColdStartResumeSession = resumeRecoveryReason !== null;
        const summary = summarizeCrash(finalCode, finalSignal);
        this.endRuntimeTrace(ap, processEndedCleanly ? "ok" : "error", {
          outcome: processEndedCleanly ? "process-exit" : "process-crash",
          expectedTerminationReason: ap.expectedTerminationReason || undefined,
          exitCode: finalCode,
          exitSignal: finalSignal,
          ...runtimeTraceCounterAttrs(ap),
          ...this.finalizeRuntimeProfileTurnControl(agentId, ap, "process_exit"),
        });

        this.interruptCompactionIfActive(agentId);
        cleanupAgentCredentialProxy(agentId, ap.launchId);
        this.revokeManagedRunnerCredential(agentId, ap.config, ap.launchId);
        this.agents.delete(agentId);

        if (shouldColdStartResumeSession) {
          const staleSessionId = ap.sessionId;
          const runtimeLabel = resumeSessionRuntimeLabel(ap.driver.id);
          const restartConfig = { ...stripManagedRunnerCredential(ap.config), sessionId: null };
          const reasonText = resumeRecoveryReason === "provider_replay_rejected"
            ? "was rejected by the provider during replay"
            : "is unavailable locally";
          const activityText = resumeRecoveryReason === "provider_replay_rejected"
            ? `Stored ${runtimeLabel} session replay rejected; cold-starting a new session…`
            : `Stored ${runtimeLabel} session missing; cold-starting a new session…`;
          logger.warn(
            `[Agent ${agentId}] Stored ${runtimeLabel} session ${staleSessionId} ${reasonText}; falling back to cold start`,
          );
          this.broadcastActivity(
            agentId,
            "working",
            activityText,
            [{
              kind: "text",
              text: `Stored ${runtimeLabel} session ${staleSessionId} ${reasonText}. Falling back to a cold start; earlier runtime context may not be restored.`,
            }],
          );
          this.startAgent(
            agentId,
            restartConfig,
            ap.startupWakeMessage,
            ap.startupUnreadSummary,
            ap.startupResumePrompt,
            ap.launchId || undefined,
          ).catch((err) => {
            logger.error(`[Agent ${agentId}] Cold start recovery failed`, err);
            this.sendAgentStatus(agentId, "inactive", ap.launchId);
            this.broadcastActivity(agentId, "offline", `Crashed (${summary})`, [], ap.launchId);
          });
          return;
        }

        if (processEndedCleanly) {
          let queuedWakeMessage: AgentMessage | undefined;
          if (!ap.driver.supportsStdinNotification || ap.expectedTerminationReason === "stalled_recovery") {
            while (ap.inbox.length > 0) {
              const candidate = ap.inbox.shift()!;
              if (this.shouldDeferWakeMessage(agentId, ap.driver, candidate)) continue;
              queuedWakeMessage = candidate;
              break;
            }
          }
          const unreadSummary = queuedWakeMessage
            ? buildUnreadSummary(ap.inbox, formatChannelLabel(queuedWakeMessage))
            : undefined;

          if (queuedWakeMessage) {
            logger.info(`[Agent ${agentId}] Turn completed; restarting immediately for queued message`);
            const nextConfig = { ...stripManagedRunnerCredential(ap.config), sessionId: ap.sessionId };
            this.idleAgentConfigs.set(agentId, {
              config: nextConfig,
              sessionId: ap.sessionId,
              launchId: ap.launchId,
            });
            this.broadcastActivity(agentId, "working", "Message received");
            this.idleAgentConfigs.delete(agentId);
            this.startAgent(agentId, nextConfig, queuedWakeMessage, unreadSummary, undefined, ap.launchId || undefined).catch((err) => {
              logger.error(`[Agent ${agentId}] Failed to continue with queued message`, err);
              if (this.reportRunnerCredentialMintFailure(agentId, err, ap.launchId, "queued_continuation")) {
                return;
              }
              this.idleAgentConfigs.set(agentId, {
                config: nextConfig,
                sessionId: ap.sessionId,
                launchId: ap.launchId,
              });
              this.broadcastActivity(agentId, "online", "Process idle");
            });
            return;
          }

          // Normal exit (turn completed, idle timeout) — daemon is still online and can
          // restart the process on next message, so keep status active.
          // Cache config so we can auto-restart when a new message arrives.
          this.idleAgentConfigs.set(agentId, {
            config: { ...stripManagedRunnerCredential(ap.config), sessionId: ap.sessionId },
            sessionId: ap.sessionId,
            launchId: ap.launchId,
          });
          if (!ap.driver.supportsStdinNotification) {
            logger.info(`[Agent ${agentId}] Turn completed; cached idle state for future restart`);
          }
          this.broadcastActivity(agentId, "online", "Process idle");
        } else {
          // Crash (non-zero) or killed by signal (code === null) while still in map
          const reason = formatCrashReason(finalCode, finalSignal, ap);

          if (terminalFailureDetail && isProviderStreamFailureText(terminalFailureDetail.detail)) {
            this.idleAgentConfigs.set(agentId, {
              config: { ...ap.config, sessionId: ap.sessionId },
              sessionId: ap.sessionId,
              launchId: ap.launchId,
            });
            logger.warn(`[Agent ${agentId}] Recoverable provider stream failure (${reason}) — keeping agent wakeable`);
            this.sendAgentStatus(agentId, "active", ap.launchId);
          } else if (ap.startupTimedOut) {
            logger.warn(`[Agent ${agentId}] Startup timeout cleanup completed (${reason})`);
          } else {
            // Non-recoverable crash → mark inactive to prevent crash loops. User/server can restart explicitly.
            this.idleAgentConfigs.delete(agentId);
            logger.error(`[Agent ${agentId}] Process crashed (${reason}) — marking inactive`);
            this.sendAgentStatus(agentId, "inactive", ap.launchId);
          }
          if (terminalFailureDetail) {
            if (!ap.startupTimedOut) {
              this.broadcastActivity(
                agentId,
                "error",
                terminalFailureDetail.detail,
                [{ kind: "text", text: `Error: ${terminalFailureDetail.detail}` }],
                ap.launchId,
              );
            }
          } else {
            this.broadcastActivity(agentId, "offline", `Crashed (${summary})`, [], ap.launchId);
          }
        }
      }
    });

    this.sendAgentStatus(agentId, "active", launchId || null);
    this.broadcastActivity(agentId, "working", "Starting\u2026");
    this.startRuntimeStartupTimeout(agentId, agentProcess);

    } catch (err) {
      this.agentsStarting.delete(agentId);
      throw err;
    }
  }

  private async buildSpawnConfig(agentId: string, config: AgentConfig): Promise<AgentConfig> {
    // The daemon's live connection target is the local source of truth for
    // agent-side chat bridge / CLI callbacks. Server-provided config may point
    // at a different origin (for example SERVER_URL on the backend).
    const baseConfig = config.serverUrl === this.serverUrl
      ? config
      : { ...config, serverUrl: this.serverUrl };
    const runnerConfig = await this.ensureManagedRunnerCredential(agentId, baseConfig);

    if (!this.defaultAgentEnvVarsProvider) {
      return runnerConfig;
    }

    try {
      const defaultEnvVars = await this.defaultAgentEnvVarsProvider({
        runtime: runnerConfig.runtime,
        model: runnerConfig.model,
        envVars: runnerConfig.envVars,
      });
      if (!defaultEnvVars || Object.keys(defaultEnvVars).length === 0) {
        return runnerConfig;
      }

      const mergedEnvVars = {
        ...defaultEnvVars,
        ...(runnerConfig.envVars ?? {}),
      };

      if (this.sameEnvVars(mergedEnvVars, runnerConfig.envVars)) {
        return runnerConfig;
      }

      return {
        ...runnerConfig,
        envVars: mergedEnvVars,
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      logger.warn(
        `[Agent ${agentId}] Failed to resolve default runtime env vars — continuing without machine-level defaults (${reason})`,
      );
      return runnerConfig;
    }
  }

  private async requestManagedRunnerCredentialOnce(agentId: string, config: AgentConfig): Promise<{ apiKey: string; credentialId: string | null }> {
    const url = new URL(`/internal/computer/runners/${encodeURIComponent(agentId)}/credentials`, this.serverUrl);
    const res = await daemonFetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.daemonApiKey}`,
        "Content-Type": "application/json",
        "X-Slock-Client": "daemon-server-session-worker",
      },
      body: JSON.stringify({
        scopes: ["send", "read", "mentions", "tasks", "reactions", "server", "channels", "knowledge"],
        name: `runner:${config.runtime}:${agentId.slice(0, 8)}`,
      }),
    });
    if (!res.ok) {
      const contentType = res.headers.get("content-type") ?? "";
      let detail = `HTTP ${res.status}`;
      let code: string | null = null;
      if (contentType.includes("application/json")) {
        const body = await res.json().catch(() => null) as { error?: unknown; code?: unknown } | null;
        const error = typeof body?.error === "string" ? body.error : null;
        code = typeof body?.code === "string" ? body.code : null;
        detail = [detail, code, error].filter(Boolean).join(" ");
      }
      throw new RunnerCredentialMintError(detail, {
        code: code ?? "runner_credential_mint_http_error",
        retryable: isRetryableMintHttpFailure(res.status, code),
        status: res.status,
      });
    }

    const body = await res.json().catch(() => null) as { apiKey?: unknown; credentialId?: unknown } | null;
    if (typeof body?.apiKey !== "string" || !body.apiKey.startsWith("sk_agent_")) {
      throw new RunnerCredentialMintError("invalid_agent_credential_payload", {
        code: "invalid_agent_credential_payload",
      });
    }
    return {
      apiKey: body.apiKey,
      credentialId: typeof body.credentialId === "string" ? body.credentialId : null,
    };
  }

  private async ensureManagedRunnerCredential(agentId: string, config: AgentConfig): Promise<AgentConfig> {
    if (config.agentCredentialKey) return config;
    if (process.env.SLOCK_AGENT_RUNNER_CREDENTIALS_DISABLED === "1") {
      throw new RunnerCredentialMintError("runner credential mint is disabled by SLOCK_AGENT_RUNNER_CREDENTIALS_DISABLED", {
        code: "runner_credentials_disabled",
      });
    }

    let lastError: unknown = null;
    for (let attempt = 1; attempt <= RUNNER_CREDENTIAL_MINT_MAX_ATTEMPTS; attempt += 1) {
      try {
        const credential = await this.requestManagedRunnerCredentialOnce(agentId, config);
        return {
          ...config,
          agentCredentialKey: credential.apiKey,
          agentCredentialId: credential.credentialId,
        };
      } catch (err) {
        lastError = err;
        const detail = runnerCredentialErrorDetail(err);
        this.recordDaemonTrace("daemon.runner_credential_mint.retry", {
          agentId,
          runtime: config.runtime,
          attempt,
          max_attempts: RUNNER_CREDENTIAL_MINT_MAX_ATTEMPTS,
          status: detail.status,
          code: detail.code,
          reason: detail.message,
          retryable: detail.retryable,
        }, detail.retryable && attempt < RUNNER_CREDENTIAL_MINT_MAX_ATTEMPTS ? "ok" : "error");
        if (!detail.retryable || attempt >= RUNNER_CREDENTIAL_MINT_MAX_ATTEMPTS) break;
        await waitForRunnerCredentialRetry();
      }
    }

    const detail = runnerCredentialErrorDetail(lastError);
    this.recordDaemonTrace("daemon.runner_credential_mint.failed", {
      agentId,
      runtime: config.runtime,
      status: detail.status,
      code: detail.code,
      reason: detail.message,
      retryable: detail.retryable,
      max_attempts: RUNNER_CREDENTIAL_MINT_MAX_ATTEMPTS,
    }, "error");
    throw new RunnerCredentialMintError(
      `runner_credential_mint_failed: ${detail.message}. Managed runner startup requires /internal/computer credential mint; deploy server first or roll back the daemon binary.`,
      {
        code: detail.code,
        retryable: detail.retryable,
        status: detail.status,
      },
    );
  }

  private revokeManagedRunnerCredential(agentId: string, config: AgentConfig, launchId: string | null): void {
    const credentialId = config.agentCredentialId;
    if (!credentialId) return;
    const url = new URL(
      `/internal/computer/runners/${encodeURIComponent(agentId)}/credentials/${encodeURIComponent(credentialId)}`,
      this.serverUrl,
    );
    void daemonFetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.daemonApiKey}`,
        "X-Slock-Client": "daemon-server-session-worker",
      },
    }).then((res) => {
      this.recordDaemonTrace("daemon.runner_credential.revoke", {
        agentId,
        launchId: launchId || undefined,
        credentialId,
        status: res.status,
      }, res.ok ? "ok" : "error");
    }).catch((err) => {
      this.recordDaemonTrace("daemon.runner_credential.revoke", {
        agentId,
        launchId: launchId || undefined,
        credentialId,
        reason: err instanceof Error ? err.message : String(err),
      }, "error");
    });
  }

  private sameEnvVars(left: Record<string, string> | null | undefined, right: Record<string, string> | null | undefined): boolean {
    const leftKeys = Object.keys(left ?? {});
    const rightKeys = Object.keys(right ?? {});
    if (leftKeys.length !== rightKeys.length) {
      return false;
    }
    return leftKeys.every((key) => left?.[key] === right?.[key]);
  }

  private enqueueRuntimeProfileNotification(agentId: string, ap: AgentProcess, message: AgentMessage, kind: "migration" | "daemon_release_notice", key: string): void {
    ap.inbox.push(message);
    if (ap.driver.supportsStdinNotification && ap.sessionId) {
      ap.notifications.add();
      if (ap.driver.busyDeliveryMode === "gated") {
        this.recordGatedSteeringEvent(agentId, ap, "buffer", {
          reason: "runtime_profile",
          kind,
          pendingMessages: ap.inbox.length,
        });
      } else if (!ap.notifications.hasTimer) {
        ap.notifications.schedule(() => {
          this.sendStdinNotification(agentId);
        }, 3000);
      }
    }
    this.recordDaemonTrace("daemon.agent.runtime_profile.routed", {
      agentId,
      kind,
      key_present: Boolean(key),
      key_hash: hashRuntimeProfileKey(key),
      outcome: ap.sessionId ? "queued_busy" : "queued_before_session",
      runtime: ap.config.runtime,
      session_id_present: Boolean(ap.sessionId),
      launchId: ap.launchId || undefined,
      inbox_count: ap.inbox.length,
      pending_notification_count: ap.notifications.pendingCount,
      busy_delivery_mode: ap.driver.busyDeliveryMode,
      supports_stdin_notification: ap.driver.supportsStdinNotification,
    });
    logger.info(
      `[Agent ${agentId}] Queued runtime profile ${kind} ${key} for ${ap.sessionId ? "busy" : "pre-session"} ${ap.driver.id} delivery`,
    );
  }

  private queueRuntimeProfileNotificationDuringStart(
    agentId: string,
    message: AgentMessage,
    kind: "migration" | "daemon_release_notice",
    key: string,
  ): void {
    const pending = this.startingInboxes.get(agentId) || [];
    pending.push(message);
    this.startingInboxes.set(agentId, pending);
    const queuedStart = this.queuedAgentStarts.get(agentId);
    this.recordDaemonTrace("daemon.agent.runtime_profile.routed", {
      agentId,
      kind,
      key_present: Boolean(key),
      key_hash: hashRuntimeProfileKey(key),
      outcome: "queued_during_start",
      startup_pending: true,
      starting_inbox_count: pending.length,
      launchId: queuedStart?.launchId,
    });
    logger.info(`[Agent ${agentId}] Queued runtime profile ${kind} ${key} during startup`);
  }

  private containsOrdinaryInboxMessage(messages: AgentMessage[]): boolean {
    return messages.some((message) => !runtimeProfileNotificationFromMessage(message));
  }

  async stopAgent(agentId: string, { wait = false, silent = false }: { wait?: boolean; silent?: boolean } = {}) {
    this.cancelQueuedAgentStart(agentId, "stop requested");
    this.idleAgentConfigs.delete(agentId);
    const ap = this.agents.get(agentId);
    if (!ap) {
      if (!silent) {
        logger.info(`[Agent ${agentId}] Stop requested but no running process was found`);
      }
      return;
    }

    ap.notifications.clearTimer();
    if (ap.activityHeartbeat) {
      clearInterval(ap.activityHeartbeat);
    }
    this.clearCompactionWatchdog(ap);
    this.clearStalledRecoverySigtermWatchdog(ap);

    cleanupAgentCredentialProxy(agentId, ap.launchId);
    this.revokeManagedRunnerCredential(agentId, ap.config, ap.launchId);
    this.agents.delete(agentId);
    this.processExitTraceAttrs.set(ap.process, {
      stop_source: silent ? "daemon_internal" : "explicit_request",
      stop_wait_requested: wait,
      stop_silent: silent,
    });
    ap.process.kill("SIGTERM");
    if (!silent) {
      this.sendRuntimeProfileReportFor(agentId, ap.config, ap.sessionId, ap.launchId);
      // Report status change to server (user-initiated stop)
      this.sendAgentStatus(agentId, "inactive", ap.launchId);
      this.broadcastActivity(agentId, "offline", "Stopped");
      logger.info(`[Agent ${agentId}] Stopped by request`);
    }

    if (wait) {
      // Wait for process to exit, with a timeout to force-kill
      await new Promise<void>((resolve) => {
        const forceKillTimer = setTimeout(() => {
          if (!silent) {
            logger.warn(`[Agent ${agentId}] Stop timed out; force killing`);
          }
          try { ap.process.kill("SIGKILL"); } catch { /* already dead */ }
          resolve();
        }, 5000);
        ap.process.on("exit", () => {
          clearTimeout(forceKillTimer);
          resolve();
        });
        // If already exited before we attached the listener
        if (ap.process.exitCode !== null || ap.process.signalCode !== null) {
          clearTimeout(forceKillTimer);
          resolve();
        }
      });
    }
  }

  deliverMessage(agentId: string, message: AgentMessage, traceContext: DeliveryTraceContext = {}): boolean | Promise<boolean> {
    if (traceContext.deliveryId) {
      this.deliveryTraceContexts.set(message, traceContext);
    }
    const ap = this.agents.get(agentId);
    if (!ap) {
      if (this.agentsStarting.has(agentId) || this.queuedAgentStarts.has(agentId)) {
        const queuedStart = this.queuedAgentStarts.get(agentId);
        const pending = this.startingInboxes.get(agentId) || [];
        pending.push(message);
        this.startingInboxes.set(agentId, pending);
        this.recordDaemonTrace("daemon.agent.delivery.routed", this.deliveryTraceAttrs(agentId, message, {
          outcome: "queued_during_start",
          accepted: true,
          process_present: false,
          startup_pending: true,
          starting_inbox_count: pending.length,
          launchId: queuedStart?.launchId,
        }));
        return true;
      }

      // Process not running — auto-restart if we have a cached config (normal exit)
      const cached = this.idleAgentConfigs.get(agentId);
      if (cached) {
        const driver = this.driverResolver(cached.config.runtime || "claude");
        if (this.shouldDeferWakeMessage(agentId, driver, message)) {
          this.recordDaemonTrace("daemon.agent.delivery.routed", this.deliveryTraceAttrs(agentId, message, {
            outcome: "deferred_wake_message",
            accepted: true,
            process_present: false,
            cached_idle_config_present: true,
            runtime: cached.config.runtime,
            session_id_present: Boolean(cached.sessionId),
            launchId: cached.launchId || undefined,
          }));
          return true;
        }
        logger.info(`[Agent ${agentId}] Starting from idle state for new message`);
        this.idleAgentConfigs.delete(agentId);
        this.recordDaemonTrace("daemon.agent.delivery.routed", this.deliveryTraceAttrs(agentId, message, {
          outcome: "auto_restart_from_idle",
          accepted: true,
          process_present: false,
          cached_idle_config_present: true,
          runtime: cached.config.runtime,
          session_id_present: Boolean(cached.sessionId),
          launchId: cached.launchId || undefined,
        }));
        return this.startAgent(agentId, cached.config, message, undefined, undefined, cached.launchId || undefined).then(() => true, (err) => {
          logger.error(`[Agent ${agentId}] Failed to auto-restart`, err);
          if (this.reportRunnerCredentialMintFailure(agentId, err, cached.launchId, "idle_auto_restart")) {
            return false;
          }
          this.idleAgentConfigs.set(agentId, cached);
          return false;
        });
      }

      logger.warn(`[Agent ${agentId}] Delivery received but no running process or cached idle config exists`);
      this.recordDaemonTrace("daemon.agent.delivery.routed", this.deliveryTraceAttrs(agentId, message, {
        outcome: "rejected_no_process",
        accepted: false,
        process_present: false,
        cached_idle_config_present: false,
      }), "error");
      this.sendAgentStatus(agentId, "inactive", null);
      this.broadcastActivity(agentId, "offline", "Process unavailable; restart required");
      return false;
    }

    if (this.shouldDeferWakeMessage(agentId, ap.driver, message)) {
      this.recordDaemonTrace("daemon.agent.delivery.routed", this.deliveryTraceAttrs(agentId, message, {
        outcome: "deferred_wake_message",
        accepted: true,
        process_present: true,
        runtime: ap.config.runtime,
        session_id_present: Boolean(ap.sessionId),
        launchId: ap.launchId || undefined,
        is_idle: ap.isIdle,
        inbox_count: ap.inbox.length,
      }));
      return true;
    }

    if (ap.isIdle && ap.driver.supportsStdinNotification && ap.sessionId) {
      // Agent's turn is complete and process is waiting for stdin input.
      // Deliver message directly via stdin to start a new turn.
      const nextMessages = ap.inbox.splice(0, ap.inbox.length);
      nextMessages.push(message);
      ap.isIdle = false;
      this.startRuntimeTrace(agentId, ap, "stdin-idle-delivery", nextMessages);
      this.broadcastActivity(agentId, "working", "Message received");
      const stdinAccepted = this.deliverMessagesViaStdin(agentId, ap, nextMessages, "idle");
      this.recordDaemonTrace("daemon.agent.delivery.routed", this.deliveryTraceAttrs(agentId, message, {
        outcome: "stdin_idle_delivery",
        accepted: true,
        process_present: true,
        runtime: ap.config.runtime,
        session_id_present: true,
        launchId: ap.launchId || undefined,
        stdin_delivery_accepted: stdinAccepted,
        delivered_messages_count: nextMessages.length,
      }));
      return true;
    }

    // Agent is busy — queue message in inbox
    ap.inbox.push(message);

    if (this.recoverStaleProcessForQueuedMessageIfNeeded(agentId, ap)) {
      this.recordDaemonTrace("daemon.agent.delivery.routed", this.deliveryTraceAttrs(agentId, message, {
        outcome: "queued_stalled_recovery",
        accepted: true,
        process_present: true,
        runtime: ap.config.runtime,
        session_id_present: Boolean(ap.sessionId),
        launchId: ap.launchId || undefined,
        inbox_count: ap.inbox.length,
      }));
      return true;
    }

    if (!ap.driver.supportsStdinNotification) {
      this.recordDaemonTrace("daemon.agent.delivery.routed", this.deliveryTraceAttrs(agentId, message, {
        outcome: "queued_busy_non_stdin",
        accepted: true,
        process_present: true,
        runtime: ap.config.runtime,
        session_id_present: Boolean(ap.sessionId),
        launchId: ap.launchId || undefined,
        inbox_count: ap.inbox.length,
      }));
      return true;
    }
    if (!ap.sessionId) {
      this.recordDaemonTrace("daemon.agent.delivery.routed", this.deliveryTraceAttrs(agentId, message, {
        outcome: "queued_before_session",
        accepted: true,
        process_present: true,
        runtime: ap.config.runtime,
        session_id_present: false,
        launchId: ap.launchId || undefined,
        inbox_count: ap.inbox.length,
      }));
      return true;
    } // agent not initialized yet

    if (ap.gatedSteering.compacting) {
      ap.notifications.add();
      ap.notifications.clearTimer();
      if (ap.driver.busyDeliveryMode === "gated") {
        this.recordGatedSteeringEvent(agentId, ap, "buffer", {
          reason: "compaction_boundary",
          pendingMessages: ap.inbox.length,
        });
      }
      this.recordRuntimeTraceEvent(agentId, ap, "runtime.compaction_boundary.delivery_buffered", {
        pendingNotificationCount: ap.notifications.pendingCount,
        pendingMessages: ap.inbox.length,
        busyDeliveryMode: ap.driver.busyDeliveryMode,
      });
      this.recordDaemonTrace("daemon.agent.delivery.routed", this.deliveryTraceAttrs(agentId, message, {
        outcome: "queued_compaction_boundary",
        accepted: true,
        process_present: true,
        runtime: ap.config.runtime,
        session_id_present: true,
        launchId: ap.launchId || undefined,
        inbox_count: ap.inbox.length,
        pending_notification_count: ap.notifications.pendingCount,
        busy_delivery_mode: ap.driver.busyDeliveryMode,
        notification_timer_present: false,
      }));
      return true;
    }

    if (ap.driver.busyDeliveryMode === "gated") {
      ap.notifications.add();
      if (!ap.notifications.hasTimer) {
        ap.notifications.schedule(() => {
          this.sendStdinNotification(agentId);
        }, 3000);
      }
      this.recordGatedSteeringEvent(agentId, ap, "buffer", {
        reason: "busy_message",
        pendingMessages: ap.inbox.length,
      });
      this.recordDaemonTrace("daemon.agent.delivery.routed", this.deliveryTraceAttrs(agentId, message, {
        outcome: "queued_busy_gated",
        accepted: true,
        process_present: true,
        runtime: ap.config.runtime,
        session_id_present: true,
        launchId: ap.launchId || undefined,
        inbox_count: ap.inbox.length,
        pending_notification_count: ap.notifications.pendingCount,
        notification_timer_present: ap.notifications.hasTimer,
      }));
      return true;
    }

    ap.notifications.add();
    if (!ap.notifications.hasTimer) {
      ap.notifications.schedule(() => {
        this.sendStdinNotification(agentId);
      }, 3000);
    }
    this.recordDaemonTrace("daemon.agent.delivery.routed", this.deliveryTraceAttrs(agentId, message, {
      outcome: "queued_busy_notification",
      accepted: true,
      process_present: true,
      runtime: ap.config.runtime,
      session_id_present: true,
      inbox_count: ap.inbox.length,
      pending_notification_count: ap.notifications.pendingCount,
      notification_timer_present: ap.notifications.hasTimer,
    }));
    return true;
  }

  async resetWorkspace(agentId: string) {
    const agentDataDir = path.join(this.dataDir, agentId);
    try {
      await rm(agentDataDir, { recursive: true, force: true });
      logger.info(`[Agent ${agentId}] Workspace reset complete (${agentDataDir})`);
    } catch (err) {
      logger.error(`[Agent ${agentId}] Workspace reset failed`, err);
    }
  }

  async stopAll() {
    // Clear idle configs so no auto-restarts happen during shutdown.
    // Use silent: true so agents stay "active" in DB — on daemon reconnect,
    // the server's ready handler will auto-restart them.
    this.cancelAllQueuedAgentStarts("daemon shutdown");
    this.idleAgentConfigs.clear();
    const ids = [...this.agents.keys()];
    await Promise.all(ids.map((id) => this.stopAgent(id, { wait: true, silent: true })));
  }

  getRunningAgentIds(): string[] {
    return [...this.agents.keys()];
  }

  private shouldDeferWakeMessage(agentId: string, driver: RuntimeDriver, message: AgentMessage): boolean {
    if (!driver.shouldDeferWakeMessage?.(message)) return false;
    logger.info(`[Agent ${agentId}] Deferred non-concrete wake message for ${driver.id}`);
    return true;
  }

  private completeDeprecatedRuntimeProfileMigration(
    agentId: string,
    migrationKey: string,
    launchId: string | null,
    traceparent: string | undefined,
    source: "agent_config" | "wake_message" | "runtime_profile_message",
  ): void {
    this.sendToServer({
      type: "agent:runtime_profile:migration:ack",
      agentId,
      migrationKey,
      launchId: launchId || undefined,
      traceparent,
    });
    this.sendToServer({
      type: "agent:runtime_profile:migration_done",
      agentId,
      migrationKey,
      launchId: launchId || undefined,
      traceparent,
    });
    this.recordDaemonTrace("daemon.runtime_profile.migration.deprecated_noop", {
      agentId,
      key_present: Boolean(migrationKey),
      key_hash: hashRuntimeProfileKey(migrationKey),
      launchId: launchId || undefined,
      source,
    });
    logger.info(`[Agent ${agentId}] Completed deprecated Runtime Profile migration ${migrationKey} as reset-session no-op`);
  }

  getAgentSessionId(agentId: string): string | null {
    return this.agents.get(agentId)?.sessionId ?? null;
  }

  getAgentLaunchId(agentId: string): string | null {
    return this.agents.get(agentId)?.launchId ?? null;
  }

  getIdleAgentSessionIds(): Array<{ agentId: string; sessionId: string; launchId: string | null }> {
    const result: Array<{ agentId: string; sessionId: string; launchId: string | null }> = [];
    for (const [agentId, { sessionId, launchId }] of this.idleAgentConfigs) {
      if (this.agents.has(agentId)) continue;
      if (sessionId) result.push({ agentId, sessionId, launchId });
    }
    return result;
  }

  private buildRuntimeProfileReport(agentId: string, config: AgentConfig, sessionId: string | null, launchId: string | null): AgentRuntimeProfileWireReport {
    const workspacePath = path.join(this.dataDir, agentId);
    return {
      agentId,
      launchId,
      facts: {
        runtime: config.runtime,
        model: config.model,
        reasoningEffort: config.reasoningEffort,
        executionMode: config.executionMode || "byoc",
        workspacePathRef: {
          label: "workspace",
          path: workspacePath,
          reachable: true,
        },
        sessionRef: sessionId ? resolveRuntimeSessionRef(config.runtime, sessionId, this.runtimeSessionHomeDir, workspacePath) : null,
      },
    };
  }

  getAgentRuntimeProfileReport(agentId: string): AgentRuntimeProfileWireReport | null {
    const running = this.agents.get(agentId);
    if (running) {
      return this.buildRuntimeProfileReport(agentId, running.config, running.sessionId, running.launchId);
    }
    const idle = this.idleAgentConfigs.get(agentId);
    if (idle) {
      return this.buildRuntimeProfileReport(agentId, idle.config, idle.sessionId, idle.launchId);
    }
    return null;
  }

  getAgentRuntimeProfileReports(): AgentRuntimeProfileWireReport[] {
    const reports: AgentRuntimeProfileWireReport[] = [];
    const seen = new Set<string>();
    for (const agentId of this.agents.keys()) {
      const report = this.getAgentRuntimeProfileReport(agentId);
      if (report) {
        reports.push(report);
        seen.add(agentId);
      }
    }
    for (const agentId of this.idleAgentConfigs.keys()) {
      if (seen.has(agentId)) continue;
      const report = this.getAgentRuntimeProfileReport(agentId);
      if (report) reports.push(report);
    }
    return reports;
  }

  deliverRuntimeProfileNotification(
    agentId: string,
    key: string,
    kind: "migration" | "daemon_release_notice",
    content: string,
    traceparent?: string,
    launchId?: string | null,
  ): boolean | Promise<boolean> {
    const span = this.tracer.startSpan("daemon.runtime_profile.control.inject", {
      parent: parseTraceparent(traceparent),
      surface: "daemon",
      kind: "consumer",
      attrs: {
        agentId,
        control_kind: kind,
        key_present: Boolean(key),
        key_hash: hashRuntimeProfileKey(key),
      },
    });
    if (kind === "migration") {
      this.completeDeprecatedRuntimeProfileMigration(
        agentId,
        key,
        launchId || null,
        formatTraceparent(span.context),
        "runtime_profile_message",
      );
      span.end("ok", { attrs: { outcome: "deprecated_noop_completed", launchId: launchId || undefined } });
      return true;
    }
    const now = new Date().toISOString();
    const message: AgentMessage = {
      channel_id: "system",
      channel_name: "system",
      channel_type: "dm",
      sender_id: "system",
      sender_name: "system",
      sender_type: "system",
      content,
      timestamp: now,
      message_id: `${RUNTIME_PROFILE_DAEMON_NOTICE_MESSAGE_PREFIX}${key}`,
      traceparent: formatTraceparent(span.context),
    };

    const ap = this.agents.get(agentId);
    if (ap && !(ap.sessionId && ap.driver.supportsStdinNotification && ap.isIdle) && !(ap.sessionId && ap.driver.busyDeliveryMode === "direct")) {
      this.enqueueRuntimeProfileNotification(agentId, ap, message, kind, key);
      span.end("ok", {
        attrs: {
          outcome: ap.sessionId ? "queued_busy" : "queued_before_session",
          runtime: ap.config.runtime,
          launchId: ap.launchId || undefined,
          session_id_present: Boolean(ap.sessionId),
          supports_stdin_notification: ap.driver.supportsStdinNotification,
          busy_delivery_mode: ap.driver.busyDeliveryMode,
        },
      });
      return true;
    }

    if (ap?.sessionId && ap.driver.supportsStdinNotification && ap.isIdle) {
      ap.isIdle = false;
      this.startRuntimeTrace(agentId, ap, "runtime-profile", [message]);
      const written = this.deliverMessagesViaStdin(agentId, ap, [message], "idle");
      span.end(written ? "ok" : "error", {
        attrs: {
          outcome: written ? "stdin_idle" : "stdin_failed",
          runtime: ap.config.runtime,
          launchId: ap.launchId || undefined,
          session_id_present: true,
          supports_stdin_notification: true,
          busy_delivery_mode: ap.driver.busyDeliveryMode,
        },
      });
      return written;
    }

    if (ap?.sessionId && ap.driver.busyDeliveryMode === "direct") {
      const written = this.deliverMessagesViaStdin(agentId, ap, [message], "busy");
      span.end(written ? "ok" : "error", {
        attrs: {
          outcome: written ? "stdin_busy" : "stdin_failed",
          runtime: ap.config.runtime,
          launchId: ap.launchId || undefined,
          session_id_present: true,
          supports_stdin_notification: ap.driver.supportsStdinNotification,
          busy_delivery_mode: ap.driver.busyDeliveryMode,
        },
      });
      return written;
    }

    if (this.agentsStarting.has(agentId) || this.queuedAgentStarts.has(agentId)) {
      const queuedStart = this.queuedAgentStarts.get(agentId);
      this.queueRuntimeProfileNotificationDuringStart(agentId, message, kind, key);
      span.end("ok", {
        attrs: {
          outcome: "queued_during_start",
          startup_pending: true,
          launchId: queuedStart?.launchId,
        },
      });
      return true;
    }

    const cached = this.idleAgentConfigs.get(agentId);
    if (cached) {
      logger.info(`[Agent ${agentId}] Starting from idle state for runtime profile ${kind} ${key}`);
      this.idleAgentConfigs.delete(agentId);
      return this.startAgent(agentId, cached.config, message, undefined, undefined, cached.launchId || undefined).then(() => true, (err) => {
        logger.error(`[Agent ${agentId}] Failed to auto-restart for runtime profile notification`, err);
        if (this.reportRunnerCredentialMintFailure(agentId, err, cached.launchId, "runtime_profile_auto_restart")) {
          span.end("error", {
            attrs: {
              outcome: "runner_credential_mint_failed",
              runtime: cached.config.runtime,
              launchId: cached.launchId || undefined,
            },
          });
          return false;
        }
        this.idleAgentConfigs.set(agentId, cached);
        span.end("error", {
          attrs: {
            outcome: "restart_failed",
            runtime: cached.config.runtime,
            launchId: cached.launchId || undefined,
          },
        });
        return false;
      });
    }

    logger.warn(`[Agent ${agentId}] Runtime profile ${kind} ${key} has no runtime injection path yet; leaving unacked for retry`);
    span.end("ok", { attrs: { outcome: "no_path" } });
    return false;
  }

  private ackInjectedRuntimeProfileMessages(agentId: string, messages: AgentMessage[], launchId: string | null) {
    for (const message of messages) {
      const notification = runtimeProfileNotificationFromMessage(message);
      if (!notification) continue;
      if (notification.kind === "migration") {
        this.completeDeprecatedRuntimeProfileMigration(agentId, notification.key, launchId, message.traceparent, "runtime_profile_message");
        continue;
      }
      const title = runtimeProfileNotificationTitle(notification.kind);
      this.broadcastActivity(agentId, "working", title, [{ kind: "system", title, text: message.content }], launchId);
      this.sendToServer({
        type: "agent:runtime_profile:daemon_release_notice:ack",
        agentId,
        noticeKey: notification.key,
        launchId: launchId || undefined,
        traceparent: message.traceparent,
      });
    }
  }

  private ackInjectedRuntimeProfileControl(
    agentId: string,
    control: NonNullable<AgentConfig["runtimeProfileControl"]>,
    launchId: string | null,
  ) {
    const span = this.tracer.startSpan("daemon.runtime_profile.control.inject", {
      surface: "daemon",
      kind: "internal",
      attrs: {
        agentId,
        control_kind: control.kind,
        key_present: Boolean(control.key),
        key_hash: hashRuntimeProfileKey(control.key),
        launchId: launchId || undefined,
        source: "agent_config",
      },
    });
    const title = runtimeProfileNotificationTitle(control.kind);
    if (control.kind === "migration") {
      this.completeDeprecatedRuntimeProfileMigration(agentId, control.key, launchId, formatTraceparent(span.context), "agent_config");
      span.end("ok", { attrs: { outcome: "deprecated_noop_completed" } });
      return;
    }
    this.broadcastActivity(agentId, "working", title, [{ kind: "system", title, text: control.message }], launchId);
    this.sendToServer({
      type: "agent:runtime_profile:daemon_release_notice:ack",
      agentId,
      noticeKey: control.key,
      launchId: launchId || undefined,
      traceparent: formatTraceparent(span.context),
    });
    span.end("ok", { attrs: { outcome: "agent_config_ack_sent" } });
  }

  private sendRuntimeProfileWireReport(report: AgentRuntimeProfileWireReport) {
    const span = this.tracer.startSpan("daemon.runtime_profile.report.sent", {
      surface: "daemon",
      kind: "producer",
      attrs: {
        agentId: report.agentId,
        launchId: report.launchId || undefined,
        runtime: report.facts.runtime,
        model_present: Boolean(report.facts.model),
        session_ref_present: Boolean(report.facts.sessionRef),
        workspace_ref_present: Boolean(report.facts.workspaceRef || report.facts.workspacePathRef),
      },
    });
    this.sendToServer({
      type: "agent:runtime_profile",
      agentId: report.agentId,
      facts: report.facts,
      launchId: report.launchId || undefined,
      traceparent: formatTraceparent(span.context),
    });
    span.end("ok");
  }

  private sendRuntimeProfileReportFor(
    agentId: string,
    config: AgentConfig,
    sessionId: string | null,
    launchId: string | null,
  ) {
    this.sendRuntimeProfileWireReport(this.buildRuntimeProfileReport(agentId, config, sessionId, launchId));
  }

  private sendRuntimeProfileReport(agentId: string) {
    const report = this.getAgentRuntimeProfileReport(agentId);
    if (!report) return;
    this.sendRuntimeProfileWireReport(report);
  }

  // Machine-level workspace scanning

  async scanAllWorkspaces(): Promise<WorkspaceDirectoryInfo[]> {
    return scanWorkspaceDirectories(this.dataDir);
  }

  async deleteWorkspaceDirectory(directoryName: string): Promise<boolean> {
    return deleteWorkspaceDirectory(this.dataDir, directoryName);
  }

  // Workspace file browsing

  async getFileTree(agentId: string, dirPath?: string): Promise<FileNode[]> {
    const agentDir = path.join(this.dataDir, agentId);
    try {
      await stat(agentDir);
    } catch {
      return [];
    }

    // Determine which directory to list
    let targetDir = agentDir;
    if (dirPath) {
      // Path traversal guard
      const resolved = path.resolve(agentDir, dirPath);
      if (!resolved.startsWith(agentDir + path.sep) && resolved !== agentDir) {
        return [];
      }
      targetDir = resolved;
    }

    return this.listDirectoryChildren(targetDir, agentDir);
  }

  async readFile(agentId: string, filePath: string): Promise<{ content: string | null; binary: boolean; size: number; mimeType?: string; encoding?: "utf-8" | "base64" }> {
    const agentDir = path.join(this.dataDir, agentId);
    const resolved = path.resolve(agentDir, filePath);
    if (!resolved.startsWith(agentDir + path.sep) && resolved !== agentDir) {
      throw new Error("Access denied");
    }
    const info = await stat(resolved);
    if (info.isDirectory()) throw new Error("Cannot read a directory");

    const ext = path.extname(resolved).toLowerCase();
    if (WORKSPACE_TEXT_EXTENSIONS.has(ext) || ext === "") {
      if (info.size > WORKSPACE_TEXT_FILE_MAX_BYTES) throw new Error("File too large");
      const content = await readFile(resolved, "utf-8");
      return { content, binary: false, size: info.size, encoding: "utf-8" };
    }

    const imageMimeType = WORKSPACE_IMAGE_MIME_BY_EXTENSION[ext];
    if (imageMimeType) {
      if (info.size > WORKSPACE_IMAGE_PREVIEW_MAX_BYTES) {
        return { content: null, binary: true, size: info.size, mimeType: imageMimeType };
      }
      const content = await readFile(resolved, "base64");
      return { content, binary: true, size: info.size, mimeType: imageMimeType, encoding: "base64" };
    }

    return { content: null, binary: true, size: info.size };
  }

  // Skill scanning

  // Per-runtime skill search paths (relative to home dir for global, workspace dir for workspace).
  // To add a new runtime, add an entry here.
  private static readonly SKILL_PATHS: Record<string, { global: string[]; workspace: string[] }> = {
    claude: {
      // Claude reads shared skills via symlinks in ~/.claude/skills/, not from ~/.agents/skills/
      global: [".claude/skills", ".claude/commands"],
      workspace: [".claude/skills", ".claude/commands"],
    },
    codex: {
      // Codex natively scans ~/.agents/skills/ and has built-in .system skills
      global: [".codex/skills", ".codex/skills/.system", ".agents/skills"],
      workspace: [".codex/skills", ".agents/skills"],
    },
  };

  async listSkills(agentId: string, runtimeHint?: string): Promise<{ global: SkillInfo[]; workspace: SkillInfo[] }> {
    const agent = this.agents.get(agentId);
    const runtime = runtimeHint || agent?.config.runtime || "claude";
    const home = os.homedir();
    const workspaceDir = path.join(this.dataDir, agentId);

    const paths = AgentProcessManager.SKILL_PATHS[runtime] || AgentProcessManager.SKILL_PATHS.claude;

    const globalResults = await Promise.all(
      paths.global.map((p) => this.scanSkillsDir(path.join(home, p))),
    );
    const workspaceResults = await Promise.all(
      paths.workspace.map((p) => this.scanSkillsDir(path.join(workspaceDir, p))),
    );

    // Deduplicate by skill name (first occurrence wins)
    const dedup = (skills: SkillInfo[]) => {
      const seen = new Set<string>();
      return skills.filter((s) => {
        if (seen.has(s.name)) return false;
        seen.add(s.name);
        return true;
      });
    };

    // Shorten home directory to ~ in source paths
    const shorten = (skills: SkillInfo[]) =>
      skills.map((s) => ({
        ...s,
        sourcePath: s.sourcePath?.startsWith(home) ? "~" + s.sourcePath.slice(home.length) : s.sourcePath,
      }));

    return {
      global: shorten(dedup(globalResults.flat())),
      workspace: shorten(dedup(workspaceResults.flat())),
    };
  }

  private async scanSkillsDir(dir: string): Promise<SkillInfo[]> {
    let entries: import("node:fs").Dirent[];
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return [];
    }

    const skills: SkillInfo[] = [];
    for (const entry of entries) {
      if (entry.isDirectory() || entry.isSymbolicLink()) {
        // Standard skill: directory (or symlink to directory) with SKILL.md
        const skillMd = path.join(dir, entry.name, "SKILL.md");
        try {
          const content = await readFile(skillMd, "utf-8");
          const skill = this.parseSkillMd(entry.name, content);
          skill.sourcePath = dir;
          skills.push(skill);
        } catch {
          // No SKILL.md — skip
        }
      } else if (entry.name.endsWith(".md")) {
        // Legacy command: bare .md file (e.g. ~/.claude/commands/foo.md)
        const cmdName = entry.name.replace(/\.md$/, "");
        try {
          const content = await readFile(path.join(dir, entry.name), "utf-8");
          const skill = this.parseSkillMd(cmdName, content);
          skill.sourcePath = dir;
          skills.push(skill);
        } catch {
          // Unreadable — skip
        }
      }
    }
    return skills;
  }

  private parseSkillMd(dirName: string, content: string): SkillInfo {
    const info: SkillInfo = {
      name: dirName,
      displayName: dirName,
      description: "",
      userInvocable: false,
    };

    // Parse YAML frontmatter between --- delimiters
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return info;

    const frontmatter = match[1];
    for (const line of frontmatter.split("\n")) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const key = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      if (key === "name") info.displayName = value;
      if (key === "description") info.description = value;
      if (key === "user-invocable") info.userInvocable = value === "true";
    }
    return info;
  }

  // Private methods

  /**
   * Broadcast an activity change — emits a single agent:activity event that carries
   * both the status (for the dot indicator) and trajectory entries (for the activity log).
   *
   * TODO(lifecycle-v2/daemon-protocol): split this legacy frame into
   * structured lifecycle producers. Runtime progress, transient heartbeat,
   * provider/runtime error, process exit, and user-visible activity entries
   * should carry explicit reason/correlation/window attrs so the server no
   * longer infers lifecycle semantics from generic activity strings.
   */
  private broadcastActivity(
    agentId: string,
    activity: string,
    detail: string,
    extraTrajectory: TrajectoryEntry[] = [],
    launchIdOverride?: string | null,
  ) {
    const ap = this.agents.get(agentId);

    // Build trajectory: any extra entries (thinking/text/tool_start) + a status entry.
    // Skip the status entry when a tool_start is present — the tool_start already
    // conveys the activity and adding a redundant status line clutters the log.
    const entries: TrajectoryEntry[] = [...extraTrajectory];
    const hasToolStart = entries.some((e) => e.kind === "tool_start");
    if (!hasToolStart) {
      entries.push({ kind: "status", activity: activity as AgentActivity, detail });
    }

    // Bump per-agent monotonic clientSeq so the server can dedupe
    // out-of-order ingest. (#engineering:72283cf7 task #340 PR B.)
    if (ap) ap.activityClientSeq += 1;
    this.sendToServer({
      type: "agent:activity",
      agentId,
      activity,
      detail,
      entries,
      launchId: launchIdOverride || ap?.launchId || undefined,
      clientSeq: ap?.activityClientSeq,
    });

    // Manage heartbeat timer: keep re-sending transient activities (working/thinking)
    // every ACTIVITY_HEARTBEAT_MS to prevent the server's stale-activity sweep from
    // resetting the status to "online" during long-running operations.
    if (ap) {
      ap.lastActivity = activity;
      ap.lastActivityDetail = detail;
      if (activity === "working" || activity === "thinking") {
        if (!ap.activityHeartbeat) {
          ap.activityHeartbeat = setInterval(() => {
            if (this.markRuntimeProgressStaleIfNeeded(agentId, ap)) return;
            this.recordRuntimeTraceEvent(agentId, ap, "activity.heartbeat.sent", {
              activity: ap.lastActivity,
            });
            ap.activityClientSeq += 1;
            // TODO(lifecycle-v2/daemon-protocol): heartbeat should become a
            // structured progress heartbeat event, not another generic
            // `agent:activity` that the server must reinterpret.
            this.sendToServer({
              type: "agent:activity",
              agentId,
              activity: ap.lastActivity,
              detail: ap.lastActivityDetail,
              launchId: launchIdOverride || ap.launchId || undefined,
              clientSeq: ap.activityClientSeq,
            });
          }, ACTIVITY_HEARTBEAT_MS);
        }
      } else {
        // Non-transient activity (online/offline) — stop heartbeat
        if (ap.activityHeartbeat) {
          clearInterval(ap.activityHeartbeat);
          ap.activityHeartbeat = null;
        }
      }
    }
  }

  /**
   * Respond to a server-issued `agent:activity_probe`. Echoes the
   * agent's current `lastActivity` back through the existing
   * `agent:activity` upstream channel with the matching `probeId`.
   *
   * Why this exists: the server's stale-activity sweep used to
   * synthesize `online` whenever a transient state went 90s without
   * an update. That invented state without consulting ground truth
   * and produced "agent shows green/idle but is actually working" UI
   * staleness (#engineering:72283cf7 task #340 RCA).
   *
   * The new flow: server sends `agent:activity_probe` for stale
   * agents, daemon replies here with the *real* current activity, and
   * the server only falls back to synth-online if the probe times out
   * (5s). The body is intentionally minimal — no entries, no
   * heartbeat side-effects, no state mutation. We just echo what we
   * already know.
   *
   * If the agent is no longer running locally (`ap` undefined), we
   * report `offline` so the server stops believing the agent is busy.
   */
  public respondToActivityProbe(agentId: string, probeId: string) {
    const ap = this.agents.get(agentId);
    const activity = ap?.lastActivity || "offline";
    const detail = ap?.lastActivityDetail || (ap ? "" : "Agent not running");
    if (ap) ap.activityClientSeq += 1;
    // TODO(lifecycle-v2/daemon-protocol): probe responses should be a dedicated
    // activity_snapshot/probe_response event. Reusing `agent:activity` keeps the
    // legacy server path working but forces the reducer to distinguish actual
    // lifecycle changes from read-only ground-truth probes.
    this.sendToServer({
      type: "agent:activity",
      agentId,
      activity,
      detail,
      launchId: ap?.launchId || undefined,
      probeId,
      clientSeq: ap?.activityClientSeq,
    });
  }

  private flushPendingTrajectory(agentId: string) {
    const ap = this.agents.get(agentId);
    const pending = ap?.pendingTrajectory;
    if (!ap || !pending) return;

    if (pending.timer) clearTimeout(pending.timer);
    ap.pendingTrajectory = null;

    const text = pending.text.length > MAX_TRAJECTORY_TEXT
      ? pending.text.slice(0, MAX_TRAJECTORY_TEXT) + "\u2026"
      : pending.text;
    if (!text) return;

    if (pending.kind === "thinking") {
      this.broadcastActivity(agentId, "thinking", "", [{ kind: "thinking", text }]);
    } else {
      this.broadcastActivity(agentId, "thinking", "", [{ kind: "text", text }]);
    }
  }

  private queueTrajectoryText(agentId: string, kind: "thinking" | "text", text: string) {
    const ap = this.agents.get(agentId);
    if (!ap) return;

    if (!text) {
      this.broadcastActivity(agentId, "thinking", "");
      return;
    }

    const pending = ap.pendingTrajectory;
    if (pending && pending.kind === kind) {
      pending.text += text;
      if (pending.timer) clearTimeout(pending.timer);
      pending.timer = setTimeout(() => this.flushPendingTrajectory(agentId), TRAJECTORY_COALESCE_MS);
      return;
    }

    this.flushPendingTrajectory(agentId);
    if (ap.lastActivity !== "thinking" || ap.lastActivityDetail !== "") {
      this.broadcastActivity(agentId, "thinking", "");
    }
    ap.pendingTrajectory = {
      kind,
      text,
      timer: setTimeout(() => this.flushPendingTrajectory(agentId), TRAJECTORY_COALESCE_MS),
    };
  }

  private clearCompactionWatchdog(ap: AgentProcess) {
    if (ap.compactionWatchdog) {
      clearTimeout(ap.compactionWatchdog);
      ap.compactionWatchdog = null;
    }
    ap.compactionStartedAt = null;
  }

  private clearStalledRecoverySigtermWatchdog(ap: AgentProcess) {
    if (!ap.stalledRecoverySigtermTimer) return;
    clearTimeout(ap.stalledRecoverySigtermTimer);
    ap.stalledRecoverySigtermTimer = null;
  }

  private mergeProcessExitTraceAttrs(proc: ChildProcess, attrs: Record<string, unknown>) {
    this.processExitTraceAttrs.set(proc, {
      ...(this.processExitTraceAttrs.get(proc) ?? {}),
      ...attrs,
    });
  }

  private startStalledRecoverySigtermWatchdog(
    agentId: string,
    ap: AgentProcess,
    runtimeLabel: string,
    queuedMessagesAtSignal: number,
    staleForMs: number,
  ) {
    this.clearStalledRecoverySigtermWatchdog(ap);
    const timeoutMs = stalledRecoverySigtermTimeoutMs();
    const processAtSignal = ap.process;

    ap.stalledRecoverySigtermTimer = setTimeout(() => {
      ap.stalledRecoverySigtermTimer = null;
      const current = this.agents.get(agentId);
      if (!current || current !== ap || current.process !== processAtSignal || current.expectedTerminationReason !== "stalled_recovery") {
        return;
      }

      this.mergeProcessExitTraceAttrs(processAtSignal, {
        stalled_recovery_sigterm_timeout: true,
        stalled_recovery_sigterm_timeout_ms: timeoutMs,
      });
      this.recordDaemonTrace("daemon.agent.stalled_recovery.sigterm_timeout", {
        agentId,
        launchId: current.launchId || undefined,
        runtime: current.config.runtime,
        model: current.config.model,
        runtime_label: runtimeLabel,
        queued_messages_count: current.inbox.length,
        queued_messages_at_signal: queuedMessagesAtSignal,
        stale_age_ms_at_signal: staleForMs,
        timeout_ms: timeoutMs,
        process_pid_present: typeof processAtSignal.pid === "number",
        session_id_present: Boolean(current.sessionId),
        supports_stdin_notification: current.driver.supportsStdinNotification,
        busy_delivery_mode: current.driver.busyDeliveryMode,
      }, "error");
      logger.warn(
        `[Agent ${agentId}] Stalled ${runtimeLabel} runtime did not exit after SIGTERM within ${timeoutMs}ms; force killing`,
      );
      try {
        processAtSignal.kill("SIGKILL");
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        this.recordDaemonTrace("daemon.agent.stalled_recovery.sigkill_failed", {
          agentId,
          launchId: current.launchId || undefined,
          runtime: current.config.runtime,
          model: current.config.model,
          reason,
        }, "error");
        logger.warn(`[Agent ${agentId}] Failed to force kill stalled ${runtimeLabel} process: ${reason}`);
      }
    }, timeoutMs);
  }

  private startCompactionWatchdog(agentId: string, ap: AgentProcess) {
    this.clearCompactionWatchdog(ap);
    const startedAt = Date.now();
    ap.compactionStartedAt = startedAt;
    ap.compactionWatchdog = setTimeout(() => {
      this.markCompactionStale(agentId, startedAt);
    }, COMPACTION_STALE_MS);
  }

  private markCompactionStale(agentId: string, startedAt: number) {
    const ap = this.agents.get(agentId);
    if (!ap || ap.compactionStartedAt !== startedAt) return;
    ap.compactionWatchdog = null;
    this.broadcastActivity(agentId, "working", "Context compaction still running; no finish event observed");
  }

  private completeCompactionIfActive(
    agentId: string,
    detail = "Context compaction finished",
    options: { flushBoundaryMessages?: boolean } = {},
  ) {
    const ap = this.agents.get(agentId);
    if (!ap || !ap.compactionStartedAt) return;
    this.clearCompactionWatchdog(ap);
    this.broadcastActivity(agentId, "working", detail, [{ kind: "compaction_finished" }]);
    ap.gatedSteering.compacting = false;
    this.setGatedSteeringPhase(agentId, ap, "assistant_continuation", { event: "compaction_finished", inferred: true });
    if (options.flushBoundaryMessages ?? true) {
      this.flushCompactionBoundaryMessages(agentId, ap);
    }
    ap.isIdle = false;
  }

  private interruptCompactionIfActive(agentId: string) {
    const ap = this.agents.get(agentId);
    if (!ap || (!ap.compactionStartedAt && !ap.gatedSteering.compacting)) return;
    this.clearCompactionWatchdog(ap);
    ap.gatedSteering.compacting = false;
  }

  private messagesTraceAttrs(messages?: AgentMessage[]): Record<string, unknown> {
    if (!messages || messages.length === 0) return {};
    const first = messages[0];
    const context = this.getDeliveryTraceContext(first);
    const notification = runtimeProfileNotificationFromMessage(first);
    if (notification) {
      return {
        messages_count: messages.length,
        message_id_present: Boolean(first.message_id),
        deliveryId: context.deliveryId,
        delivery_correlation_id: context.deliveryId,
        control_kind: notification.kind,
        key_present: Boolean(notification.key),
        runtime_profile_control_kind: notification.kind,
        runtime_profile_key_hash: hashRuntimeProfileKey(notification.key),
        runtime_profile_key_present: Boolean(notification.key),
      };
    }
    return {
      messages_count: messages.length,
      messageId: first.message_id,
      message_id_present: Boolean(first.message_id),
      deliveryId: context.deliveryId,
      delivery_correlation_id: context.deliveryId ?? first.message_id,
    };
  }

  private runtimeProfileTurnControlTraceAttrs(control: RuntimeProfileTurnControl | null): Record<string, unknown> {
    if (!control) return {};
    const pendingAgeMs = Math.max(0, Date.now() - control.injectedAtMs);
    return {
      runtime_profile_control_kind: control.kind,
      runtime_profile_control_source: control.source,
      runtime_profile_key_hash: control.keyHash || undefined,
      runtime_profile_key_present: control.keyPresent,
      runtime_profile_pending_age_ms: pendingAgeMs,
      runtime_profile_requires_ack: false,
      runtime_profile_migration_done_observed: control.kind === "migration"
        ? control.migrationDoneToolObserved
        : undefined,
    };
  }

  private activateRuntimeProfileTurnControl(
    ap: AgentProcess,
    control: RuntimeProfileTurnControl | null,
  ): void {
    ap.runtimeProfileTurnControl = control;
  }

  private runtimeProfileTurnControlFromMessages(
    messages?: AgentMessage[],
    source: RuntimeProfileControlSource = "message",
  ): RuntimeProfileTurnControl | null {
    const notifications = messages
      ?.map((message) => runtimeProfileNotificationFromMessage(message))
      .filter((candidate): candidate is { kind: RuntimeProfileControlKind; key: string } => Boolean(candidate)) ?? [];
    const notification = notifications.find((candidate) => candidate.kind === "migration")
      ?? notifications[0];
    if (!notification) return null;
    return runtimeProfileTurnControl(notification.kind, notification.key, source);
  }

  private noteRuntimeProfileToolCall(agentId: string, ap: AgentProcess, toolName: string): void {
    const control = ap.runtimeProfileTurnControl;
    if (!control || control.kind !== "migration") return;
    if (!toolName.includes("runtime_profile_migration_done")) return;
    control.migrationDoneToolObserved = true;
    this.recordRuntimeTraceEvent(agentId, ap, "runtime_profile.migration_done_tool.observed", {
      ...this.runtimeProfileTurnControlTraceAttrs(control),
      tool: toolName,
    });
  }

  private finalizeRuntimeProfileTurnControl(agentId: string, ap: AgentProcess, terminal: "turn_end" | "runtime_error" | "runtime_stalled" | "process_exit"): Record<string, unknown> {
    const control = ap.runtimeProfileTurnControl;
    if (!control) return {};
    const attrs = this.runtimeProfileTurnControlTraceAttrs(control);
    ap.runtimeProfileTurnControl = null;
    return {
      ...attrs,
      runtime_profile_turn_terminal: terminal,
      runtime_profile_turn_outcome: control.kind === "migration"
        ? (control.migrationDoneToolObserved ? "deprecated_migration_done_observed" : "reset_session_notice")
        : "notice_only",
    };
  }

  private startRuntimeTrace(
    agentId: string,
    ap: AgentProcess,
    reason: string,
    messages?: AgentMessage[],
    inputTraceAttrs: Record<string, unknown> = {},
  ): ActiveSpan {
    if (ap.runtimeTraceSpan) return ap.runtimeTraceSpan;
    ap.runtimeTraceCounters = createRuntimeTraceCounters();

    const messageControl = this.runtimeProfileTurnControlFromMessages(messages);
    if (messageControl) {
      this.activateRuntimeProfileTurnControl(ap, messageControl);
    }

    const span = this.tracer.startSpan("daemon.runtime.turn", {
      surface: "daemon",
      kind: "internal",
      attrs: {
        agentId,
        runtime: ap.config.runtime,
        model: ap.config.model,
        reason,
        hasSession: Boolean(ap.sessionId),
        ...this.messagesTraceAttrs(messages),
        ...inputTraceAttrs,
        ...this.runtimeProfileTurnControlTraceAttrs(ap.runtimeProfileTurnControl),
      },
    });
    span.addEvent("daemon.turn.started", {
      reason,
      ...this.messagesTraceAttrs(messages),
      ...inputTraceAttrs,
      ...this.runtimeProfileTurnControlTraceAttrs(ap.runtimeProfileTurnControl),
    });
    ap.runtimeTraceSpan = span;
    return span;
  }

  private endRuntimeTrace(ap: AgentProcess, status: "ok" | "error" | "cancelled", attrs?: Record<string, unknown>) {
    if (!ap.runtimeTraceSpan) return;
    ap.runtimeTraceSpan.end(status, attrs ? { attrs } : undefined);
    ap.runtimeTraceSpan = null;
  }

  private recordRuntimeTraceEvent(agentId: string, ap: AgentProcess, name: string, attrs?: Record<string, unknown>) {
    this.startRuntimeTrace(agentId, ap, "runtime-progress").addEvent(name, attrs);
  }

  private noteRuntimeProgress(ap: AgentProcess, eventKind?: ParsedEvent["kind"]) {
    ap.runtimeProgress.noteRuntimeEvent(eventKind);
  }

  private recordGatedSteeringEvent(
    agentId: string,
    ap: AgentProcess,
    event: string,
    attrs: Record<string, unknown> = {},
  ) {
    if (ap.driver.busyDeliveryMode !== "gated") return;
    const summary = `${event}:${ap.gatedSteering.phase}:tools=${ap.gatedSteering.outstandingToolUses}:compact=${ap.gatedSteering.compacting}`;
    ap.gatedSteering.recentEvents.push(summary);
    ap.gatedSteering.recentEvents = ap.gatedSteering.recentEvents.slice(-MAX_GATED_STEERING_EVENTS);
    this.recordRuntimeTraceEvent(agentId, ap, `runtime.gated_steering.${event}`, {
      phase: ap.gatedSteering.phase,
      outstandingToolUses: ap.gatedSteering.outstandingToolUses,
      compacting: ap.gatedSteering.compacting,
      toolBoundaryFlushDisabled: ap.gatedSteering.toolBoundaryFlushDisabled,
      pendingMessages: ap.inbox.length,
      ...attrs,
    });
  }

  private setGatedSteeringPhase(
    agentId: string,
    ap: AgentProcess | undefined,
    phase: GatedSteeringState["phase"],
    attrs: Record<string, unknown> = {},
  ) {
    if (!ap || ap.driver.busyDeliveryMode !== "gated") return;
    ap.gatedSteering.phase = phase;
    this.recordGatedSteeringEvent(agentId, ap, "phase", attrs);
  }

  private tryFlushGatedSteering(agentId: string, ap: AgentProcess, reason: "tool_batch_complete" | "compaction_finished" | "turn_end"): boolean {
    if (ap.driver.busyDeliveryMode !== "gated") return false;
    if (!ap.sessionId || ap.inbox.length === 0) return false;

    if (reason !== "turn_end") {
      if (ap.gatedSteering.toolBoundaryFlushDisabled) return false;
      if (ap.gatedSteering.compacting || ap.gatedSteering.outstandingToolUses > 0) return false;
      this.recordGatedSteeringEvent(agentId, ap, "notify", { reason, pendingMessages: ap.inbox.length });
      return this.sendStdinNotification(agentId);
    }

    const pendingMessages = ap.inbox.length;
    const pendingNotificationCount = ap.notifications.pendingCount;
    const nextMessages = ap.inbox.splice(0, ap.inbox.length);
    ap.notifications.clear();
    ap.gatedSteering.lastFlushReason = reason;
    if (reason !== "turn_end") {
      ap.gatedSteering.inFlightBatch = {
        reason,
        messages: nextMessages,
      };
    } else {
      ap.gatedSteering.inFlightBatch = null;
    }
    this.recordGatedSteeringEvent(agentId, ap, "flush", { reason, messageCount: nextMessages.length });
    logger.info(
      `[Agent ${agentId}] Claude gated steering flush reason=${reason} messages=${nextMessages.length}`,
    );
    if (reason === "turn_end") {
      this.broadcastActivity(agentId, "working", "Message received");
    }
    if (this.deliverMessagesViaStdin(agentId, ap, nextMessages, reason === "turn_end" ? "idle" : "busy")) {
      return true;
    }

    if (reason !== "turn_end") {
      ap.gatedSteering.inFlightBatch = null;
    }
    ap.notifications.add(pendingNotificationCount || pendingMessages);
    return false;
  }

  private flushCompactionBoundaryMessages(agentId: string, ap: AgentProcess): boolean {
    if (!ap.sessionId || !ap.driver.supportsStdinNotification || ap.inbox.length === 0) return false;

    if (ap.notifications.pendingCount > 0) {
      ap.notifications.clearTimer();
      this.sendStdinNotification(agentId);
      return true;
    }

    return false;
  }

  private clearGatedInFlightBatch(agentId: string, ap: AgentProcess, reason: string) {
    if (ap.driver.busyDeliveryMode !== "gated" || !ap.gatedSteering.inFlightBatch) return;
    const messageCount = ap.gatedSteering.inFlightBatch.messages.length;
    ap.gatedSteering.inFlightBatch = null;
    this.recordGatedSteeringEvent(agentId, ap, "ack", { reason, messageCount });
  }

  private startRuntimeStartupTimeout(agentId: string, ap: AgentProcess) {
    const timeoutMs = runtimeStartTimeoutMs();
    if (timeoutMs <= 0) return;
    ap.startupTimeoutTimer = setTimeout(() => {
      this.handleRuntimeStartupTimeout(agentId, ap, timeoutMs);
    }, timeoutMs);
    ap.startupTimeoutTimer.unref?.();
  }

  private clearRuntimeStartupTimeout(ap: AgentProcess) {
    if (!ap.startupTimeoutTimer) return;
    clearTimeout(ap.startupTimeoutTimer);
    ap.startupTimeoutTimer = null;
  }

  private handleRuntimeStartupTimeout(agentId: string, ap: AgentProcess, timeoutMs: number) {
    const current = this.agents.get(agentId);
    if (current !== ap) return;
    if (ap.runtimeProgress.lastEventKind) {
      this.clearRuntimeStartupTimeout(ap);
      return;
    }
    this.clearRuntimeStartupTimeout(ap);

    const terminalFailureDetail = classifyTerminalFailure(ap);
    const detail = terminalFailureDetail?.detail ?? formatRuntimeStartTimeoutMessage(ap.driver.id);
    ap.startupTimedOut = true;
    ap.lastRuntimeError = detail;
    ap.runtimeProgress.markStale();

    const staleForMs = Math.max(timeoutMs, ap.runtimeProgress.ageMs());
    const diagnostic = buildRuntimeStallDiagnostic(ap, staleForMs, Math.max(1, Math.floor(staleForMs / 60_000)));
    this.recordRuntimeTraceEvent(agentId, ap, "runtime.start.timeout", {
      turn_outcome: "failed",
      turn_subtype: "runtime_stalled",
      turn_reason: "no_runtime_events",
      runtime_start_failure_kind: "runtime_start_timeout",
      timeout_ms: timeoutMs,
      ...diagnostic.traceAttrs,
    });
    this.endRuntimeTrace(ap, "error", {
      turn_outcome: "failed",
      turn_subtype: "runtime_stalled",
      turn_reason: "no_runtime_events",
      runtime_start_failure_kind: "runtime_start_timeout",
      timeout_ms: timeoutMs,
      ...runtimeTraceCounterAttrs(ap),
      ...this.finalizeRuntimeProfileTurnControl(agentId, ap, "runtime_stalled"),
    });

    logger.warn(`[Agent ${agentId}] ${ap.driver.id} did not emit a startup runtime event within ${timeoutMs}ms; terminating process`);
    this.broadcastActivity(agentId, "error", detail, [{ kind: "text", text: `Error: ${detail}` }], ap.launchId);
    this.sendAgentStatus(agentId, "inactive", ap.launchId);
    this.idleAgentConfigs.delete(agentId);
    try {
      this.processExitTraceAttrs.set(ap.process, {
        stop_source: "startup_timeout",
        timeout_ms: timeoutMs,
      });
      ap.process.kill("SIGTERM");
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      logger.warn(`[Agent ${agentId}] Failed to terminate startup-timed-out ${ap.driver.id} process: ${reason}`);
    }
  }

  private requeueGatedInFlightBatch(agentId: string, ap: AgentProcess, reason: string) {
    if (ap.driver.busyDeliveryMode !== "gated" || !ap.gatedSteering.inFlightBatch) return;
    const batch = ap.gatedSteering.inFlightBatch;
    ap.gatedSteering.inFlightBatch = null;
    ap.inbox.unshift(...batch.messages);
    ap.notifications.add(batch.messages.length);
    this.recordGatedSteeringEvent(agentId, ap, "requeue", {
      reason,
      originalFlushReason: batch.reason,
      messageCount: batch.messages.length,
    });
  }

  private isThinkingBlockMutationError(message: string): boolean {
    return /thinking.*redacted_thinking|redacted_thinking.*thinking/i.test(message) &&
      /cannot be modified/i.test(message);
  }

  private markRuntimeProgressStaleIfNeeded(agentId: string, ap: AgentProcess): boolean {
    if (ap.lastActivity !== "working" && ap.lastActivity !== "thinking") return false;
    if (ap.runtimeProgress.isStale) return true;

    const staleForMs = ap.runtimeProgress.ageMs();
    if (staleForMs < RUNTIME_PROGRESS_STALE_MS) return false;

    ap.runtimeProgress.markStale();
    const staleForMinutes = Math.max(1, Math.floor(staleForMs / 60_000));
    const diagnostic = buildRuntimeStallDiagnostic(ap, staleForMs, staleForMinutes);
    const turnReason = classifyRuntimeStallReason(ap);
    this.recordRuntimeTraceEvent(agentId, ap, "runtime.progress.stalled", {
      turn_outcome: "failed",
      turn_subtype: "runtime_stalled",
      turn_reason: turnReason,
      ...diagnostic.traceAttrs,
    });
    this.endRuntimeTrace(ap, "error", {
      turn_outcome: "failed",
      turn_subtype: "runtime_stalled",
      turn_reason: turnReason,
      ageMs: staleForMs,
      lastActivity: ap.lastActivity,
      lastActivityDetailPresent: Boolean(ap.lastActivityDetail),
      lastActivityDetailKind: classifyActivityDetailForTrace(ap.lastActivityDetail),
      ...runtimeTraceCounterAttrs(ap),
      ...this.finalizeRuntimeProfileTurnControl(agentId, ap, "runtime_stalled"),
    });
    // TODO(lifecycle-v2/daemon-protocol): runtime stalled should be emitted as a
    // canonical runtime_stalled/runtime_interrupted event with diagnostic attrs
    // (session present, pid present, stdout/stderr counts, inbox count) instead
    // of being inferred from an `agent:activity` error detail.
    this.broadcastActivity(agentId, "error", diagnostic.detail);
    return true;
  }

  private recoverStaleProcessForQueuedMessageIfNeeded(agentId: string, ap: AgentProcess): boolean {
    if (ap.inbox.length === 0) return false;
    if (ap.expectedTerminationReason === "stalled_recovery") {
      // Recovery is already in progress; additional messages remain queued.
      return true;
    }

    const directStdinRuntime = ap.driver.supportsStdinNotification && ap.driver.busyDeliveryMode === "direct";
    // Codex app-server is silent during legitimate long shell commands. Avoid
    // killing an active tool wait unless we also saw evidence that stdin/session
    // delivery is broken.
    const canRestartDirectStdinProcess =
      directStdinRuntime &&
      Boolean(ap.sessionId) &&
      (ap.gatedSteering.outstandingToolUses === 0 || hasDirectStdinRecoveryEvidence(ap));
    const canRestartStalledProcess =
      !ap.driver.supportsStdinNotification ||
      canRestartDirectStdinProcess;
    if (!canRestartStalledProcess) return false;

    const staleForMs = ap.runtimeProgress.ageMs();
    if (staleForMs < RUNTIME_PROGRESS_STALE_MS && !ap.runtimeProgress.isStale) return false;

    const staleForMinutes = Math.max(1, Math.floor(staleForMs / 60_000));
    ap.runtimeProgress.markStale();
    const diagnostic = buildRuntimeStallDiagnostic(ap, staleForMs, staleForMinutes);
    const turnReason = classifyRuntimeStallReason(ap);
    this.recordRuntimeTraceEvent(agentId, ap, "runtime.progress.stalled", {
      turn_outcome: "failed",
      turn_subtype: "runtime_stalled",
      turn_reason: turnReason,
      ...diagnostic.traceAttrs,
      pendingMessages: ap.inbox.length,
      recovery: "terminate_for_queued_message",
    });
    this.endRuntimeTrace(ap, "error", {
      turn_outcome: "failed",
      turn_subtype: "runtime_stalled",
      turn_reason: turnReason,
      ageMs: staleForMs,
      lastActivity: ap.lastActivity,
      lastActivityDetailPresent: Boolean(ap.lastActivityDetail),
      lastActivityDetailKind: classifyActivityDetailForTrace(ap.lastActivityDetail),
      pendingMessages: ap.inbox.length,
      recovery: "terminate_for_queued_message",
      ...runtimeTraceCounterAttrs(ap),
      ...this.finalizeRuntimeProfileTurnControl(agentId, ap, "runtime_stalled"),
    });

    ap.expectedTerminationReason = "stalled_recovery";
    const runtimeLabel = ap.driver.id === "opencode" ? "OpenCode" : ap.driver.id;
    logger.warn(
      `[Agent ${agentId}] ${runtimeLabel} process stalled for ${staleForMinutes}m with ${ap.inbox.length} queued message(s); terminating for restart`,
    );
    this.broadcastActivity(agentId, "working", `Restarting stalled ${runtimeLabel} runtime for queued message`);
    try {
      this.processExitTraceAttrs.set(ap.process, {
        stop_source: "stalled_recovery",
        expectedTerminationReason: "stalled_recovery",
        queued_messages_count: ap.inbox.length,
      });
      this.startStalledRecoverySigtermWatchdog(agentId, ap, runtimeLabel, ap.inbox.length, staleForMs);
      ap.process.kill("SIGTERM");
    } catch (err) {
      this.clearStalledRecoverySigtermWatchdog(ap);
      const reason = err instanceof Error ? err.message : String(err);
      logger.warn(`[Agent ${agentId}] Failed to terminate stalled ${runtimeLabel} process: ${reason}`);
      return false;
    }
    return true;
  }

  /** Handle a single ParsedEvent from any runtime driver */
  private handleParsedEvent(agentId: string, event: ParsedEvent, driver: RuntimeDriver) {
    const ap = this.agents.get(agentId);
    if (event.kind === "telemetry") {
      if (ap) this.recordRuntimeTelemetry(agentId, ap, event);
      return;
    }
    if (ap) {
      const wasStalled = ap.runtimeProgress.isStale;
      this.clearRuntimeStartupTimeout(ap);
      this.noteRuntimeTraceCounter(ap, event);
      const eventAttrs = event.kind === "internal_progress"
        ? {
            kind: event.kind,
            source: event.source,
            itemType: event.itemType,
            payloadBytes: event.payloadBytes,
          }
        : { kind: event.kind };
      this.recordRuntimeTraceEvent(agentId, ap, "runtime.event.received", eventAttrs);
      if (wasStalled) {
        this.recordRuntimeTraceEvent(agentId, ap, "runtime.progress.observed", { afterStall: true });
      }
      if (event.kind === "internal_progress") {
        ap.runtimeProgress.noteInternalProgress();
        this.recordRuntimeTraceEvent(agentId, ap, "runtime.progress.internal_observed", {
          turn_outcome: "held",
          turn_subtype: "runtime_progress",
          turn_reason: "internal_activity_observed",
          signal: event.source,
          source: "runtime_event",
          runtime: ap.config.runtime,
          itemType: event.itemType,
          payloadBytes: event.payloadBytes,
        });
        return;
      }
      this.noteRuntimeProgress(ap, event.kind);
    }

    switch (event.kind) {
      case "session_init":
        if (ap) ap.sessionId = event.sessionId;
        // TODO(lifecycle-v2/daemon-protocol): session_init should produce a
        // canonical runtime_ready/session_init lifecycle event with launchId
        // and sessionId. This legacy `agent:session` is retained only for the
        // server adapter path.
        this.sendToServer({ type: "agent:session", agentId, sessionId: event.sessionId, launchId: ap?.launchId || undefined });
        this.sendRuntimeProfileReport(agentId);
        break;

      case "thinking": {
        if (ap) this.clearGatedInFlightBatch(agentId, ap, "non_error_progress");
        this.completeCompactionIfActive(agentId, "Context compaction finished (inferred from resumed output)");
        this.queueTrajectoryText(agentId, "thinking", event.text);
        if (ap) ap.isIdle = false;
        this.setGatedSteeringPhase(agentId, ap, "assistant_continuation", { event: "thinking" });
        break;
      }

      case "text": {
        if (ap) this.clearGatedInFlightBatch(agentId, ap, "non_error_progress");
        this.completeCompactionIfActive(agentId, "Context compaction finished (inferred from resumed output)");
        this.queueTrajectoryText(agentId, "text", event.text);
        if (ap) ap.isIdle = false;
        this.setGatedSteeringPhase(agentId, ap, "assistant_continuation", { event: "text" });
        break;
      }

      case "tool_call": {
        if (ap) this.clearGatedInFlightBatch(agentId, ap, "non_error_progress");
        this.completeCompactionIfActive(agentId, "Context compaction finished (inferred from resumed tool use)");
        this.flushPendingTrajectory(agentId);
        const invocation = normalizeToolDisplayInvocation(event.name, event.input);
        if (ap) {
          ap.gatedSteering.outstandingToolUses++;
          this.noteRuntimeProfileToolCall(agentId, ap, invocation.toolName);
          this.recordRuntimeTraceEvent(agentId, ap, "tool.call.started", { tool: invocation.toolName });
          this.setGatedSteeringPhase(agentId, ap, "tool_wait", {
            event: "tool_call",
            tool: invocation.toolName,
          });
        }
        const inputSummary = summarizeToolInput(invocation.toolName, invocation.input);
        const detail = getToolActivityLabel(invocation.toolName);
        this.broadcastActivity(agentId, "working", detail, [{
          kind: "tool_start",
          toolName: invocation.toolName,
          toolInput: inputSummary,
        }]);
        if (ap) ap.isIdle = false;
        break;
      }

      case "tool_output": {
        const invocation = normalizeToolDisplayInvocation(event.name, {});
        if (ap) {
          const hadOutstandingToolUse = ap.gatedSteering.outstandingToolUses > 0;
          ap.gatedSteering.outstandingToolUses = Math.max(0, ap.gatedSteering.outstandingToolUses - 1);
          this.recordRuntimeTraceEvent(agentId, ap, "tool.output.observed", { tool: invocation.toolName });
          this.recordRuntimeTraceEvent(agentId, ap, "runtime.continuation.expected");
          this.setGatedSteeringPhase(agentId, ap, "tool_boundary", {
            event: "tool_output",
            tool: invocation.toolName,
          });
          ap.isIdle = false;
          if (hadOutstandingToolUse && ap.gatedSteering.outstandingToolUses === 0) {
            this.tryFlushGatedSteering(agentId, ap, "tool_batch_complete");
          }
        }
        break;
      }

      case "compaction_started":
        this.flushPendingTrajectory(agentId);
        if (ap) this.recordRuntimeTraceEvent(agentId, ap, "runtime.context_compaction.started");
        if (ap) this.startCompactionWatchdog(agentId, ap);
        this.broadcastActivity(agentId, "working", "Compacting context", [{ kind: "compaction_started" }]);
        if (ap) {
          ap.gatedSteering.compacting = true;
          this.setGatedSteeringPhase(agentId, ap, "compacting", { event: "compaction_started" });
          ap.isIdle = false;
        }
        break;

      case "compaction_finished":
        this.flushPendingTrajectory(agentId);
        if (ap) this.recordRuntimeTraceEvent(agentId, ap, "runtime.context_compaction.finished");
        if (ap) this.clearCompactionWatchdog(ap);
        this.broadcastActivity(agentId, "working", "Context compaction finished", [{ kind: "compaction_finished" }]);
        if (ap) {
          ap.gatedSteering.compacting = false;
          this.setGatedSteeringPhase(agentId, ap, "assistant_continuation", { event: "compaction_finished" });
          this.flushCompactionBoundaryMessages(agentId, ap);
          ap.isIdle = false;
        }
        break;

      case "turn_end":
        if (ap) this.recordRuntimeTraceEvent(agentId, ap, "runtime.turn.completed");
        this.completeCompactionIfActive(agentId, "Context compaction finished (inferred from turn end)", {
          flushBoundaryMessages: false,
        });
        this.flushPendingTrajectory(agentId);
        if (ap) {
          this.clearGatedInFlightBatch(agentId, ap, "turn_end");
          if (event.sessionId) ap.sessionId = event.sessionId;
          ap.gatedSteering.outstandingToolUses = 0;
          ap.gatedSteering.compacting = false;
          this.setGatedSteeringPhase(agentId, ap, "idle", { event: "turn_end" });
          // Turn completed — check if there are queued messages to deliver
          if (ap.inbox.length > 0 && ap.driver.supportsStdinNotification && ap.sessionId) {
            const nextMessages = ap.inbox.splice(0, ap.inbox.length);
            ap.notifications.clear();
            if (ap.driver.busyDeliveryMode === "gated") {
              ap.gatedSteering.lastFlushReason = "turn_end";
              this.recordGatedSteeringEvent(agentId, ap, "flush", {
                reason: "turn_end",
                messageCount: nextMessages.length,
              });
            }
            this.broadcastActivity(agentId, "working", "Message received");
            if (!this.deliverMessagesViaStdin(agentId, ap, nextMessages, "idle")) {
              ap.isIdle = true;
              this.broadcastActivity(agentId, "online", "Idle");
            }
          } else {
            // No pending messages — mark idle, process stays alive waiting for stdin
            ap.isIdle = true;
            if (ap.lastRuntimeError) {
              // Runtime CLIs such as Claude can emit `error` immediately followed
              // by `turn_end`. The process is stdin-wakeable again, but the last
              // user-visible state must remain the error until a new inbox message
              // starts, otherwise the failure is only discoverable in Activity.
              this.broadcastActivity(agentId, "error", ap.lastRuntimeError);
            } else {
              this.broadcastActivity(agentId, "online", "Idle");
            }
          }
          this.endRuntimeTrace(ap, "ok", {
            outcome: "turn-completed",
            ...runtimeTraceCounterAttrs(ap),
            ...this.finalizeRuntimeProfileTurnControl(agentId, ap, "turn_end"),
          });
          if (ap.driver.terminateProcessOnTurnEnd) {
            ap.expectedTerminationReason = "turn_end";
            logger.info(`[Agent ${agentId}] Turn completed; terminating ${ap.driver.id} process`);
            try {
              this.processExitTraceAttrs.set(ap.process, {
                stop_source: "turn_end",
                expectedTerminationReason: "turn_end",
              });
              ap.process.kill("SIGTERM");
            } catch (err) {
              const reason = err instanceof Error ? err.message : String(err);
              logger.warn(`[Agent ${agentId}] Failed to terminate ${ap.driver.id} after turn_end: ${reason}`);
            }
          }
        }
        if (event.sessionId) {
          // TODO(lifecycle-v2/daemon-protocol): turn_end session resync should
          // reuse the canonical session_resynced/runtime_ready producer rather
          // than another legacy `agent:session` frame.
          this.sendToServer({ type: "agent:session", agentId, sessionId: event.sessionId, launchId: ap?.launchId || undefined });
          this.sendRuntimeProfileReport(agentId);
        }
        break;

      case "error": {
        this.interruptCompactionIfActive(agentId);
        this.flushPendingTrajectory(agentId);
        if (ap) ap.lastRuntimeError = event.message;
        let visibleErrorMessage = event.message;
        if (ap) {
          const runtimeErrorDiagnostics = buildRuntimeErrorDiagnosticEnvelope(event.message);
          if (runtimeErrorDiagnostics.spanAttrs.runtime_error_action_required === true) {
            visibleErrorMessage = formatRuntimeLoginRequiredMessage(ap.driver.id);
          }
          this.setGatedSteeringPhase(agentId, ap, "error", { event: "error" });
          if (ap.driver.busyDeliveryMode === "gated" && this.isThinkingBlockMutationError(event.message)) {
            this.requeueGatedInFlightBatch(agentId, ap, "thinking_block_mutation_error");
            ap.gatedSteering.toolBoundaryFlushDisabled = true;
            this.recordGatedSteeringEvent(agentId, ap, "disabled", {
              reason: "thinking_block_mutation_error",
              lastFlushReason: ap.gatedSteering.lastFlushReason,
              recentEvents: ap.gatedSteering.recentEvents.join(" | "),
            });
            logger.warn(
              `[Agent ${agentId}] Disabled Claude tool-boundary gated steering after thinking-block mutation error; lastFlushReason=${ap.gatedSteering.lastFlushReason || "none"}`,
            );
          }
          this.recordRuntimeTraceEvent(agentId, ap, "runtime.error", {
            ...runtimeErrorDiagnostics.eventAttrs,
            ...runtimeTraceCounterAttrs(ap),
          });
          this.endRuntimeTrace(ap, "error", {
            ...runtimeErrorDiagnostics.spanAttrs,
            ...runtimeTraceCounterAttrs(ap),
            ...this.finalizeRuntimeProfileTurnControl(agentId, ap, "runtime_error"),
          });
          const terminalFailure = classifyTerminalFailure(ap);
          if (ap.driver.supportsStdinNotification && terminalFailure) {
            if (terminalFailure.actionRequired) {
              logger.warn(`[Agent ${agentId}] ${ap.driver.id} auth requires user action; terminating runtime process`);
              try {
                this.processExitTraceAttrs.set(ap.process, {
                  stop_source: "runtime_auth_error",
                  runtime_error_class: "AuthError",
                });
                ap.process.kill("SIGTERM");
              } catch (err) {
                const reason = err instanceof Error ? err.message : String(err);
                logger.warn(`[Agent ${agentId}] Failed to terminate ${ap.driver.id} after auth error: ${reason}`);
              }
            } else {
              ap.isIdle = true;
              ap.notifications.clear();
              logger.info(`[Agent ${agentId}] Marked ${ap.driver.id} wakeable after terminal runtime error`);
            }
          }
        }
        // TODO(lifecycle-v2/daemon-protocol): runtime provider errors should
        // emit a canonical runtime_error/runtime_interrupted event with
        // classified error attrs. The legacy activity error is only the current
        // compatibility surface.
        this.broadcastActivity(agentId, "error", visibleErrorMessage, [
          { kind: "text", text: `Error: ${visibleErrorMessage}` },
        ]);
        break;
      }
    }
  }

  private recordRuntimeTelemetry(agentId: string, ap: AgentProcess, event: Extract<ParsedEvent, { kind: "telemetry" }>) {
    const attrs = {
      agentId,
      launchId: ap.launchId || undefined,
      runtime: ap.config.runtime,
      model: ap.config.model,
      telemetry_name: event.name,
      ...event.attrs,
    };
    ap.runtimeTraceSpan?.addEvent(`runtime.telemetry.${event.name}`, event.attrs);
    this.recordDaemonTrace(`daemon.runtime.telemetry.${event.name}`, attrs);
  }

  private sendAgentStatus(agentId: string, status: string, launchId: string | null) {
    // TODO(lifecycle-v2/daemon-protocol): replace generic `agent:status` with
    // canonical runtime_ready/runtime_interrupted/process_exit events carrying
    // reason, launchId, and correlationId. Server-side `agent:status` adapter
    // mapping should disappear after the supported daemon compatibility window.
    this.sendToServer({ type: "agent:status", agentId, status, launchId: launchId || undefined });
  }

  private reportRunnerCredentialMintFailure(
    agentId: string,
    err: unknown,
    launchId: string | null,
    source: "idle_auto_restart" | "queued_continuation" | "runtime_profile_auto_restart",
  ): boolean {
    if (!(err instanceof RunnerCredentialMintError)) return false;
    const detail = runnerCredentialErrorDetail(err);
    this.recordDaemonTrace("daemon.runner_credential_mint.hard_fail", {
      agentId,
      launchId: launchId || undefined,
      source,
      status: detail.status,
      code: detail.code,
      reason: detail.message,
      retryable: detail.retryable,
    }, "error");
    const reason = err.message;
    this.sendAgentStatus(agentId, "inactive", launchId);
    this.broadcastActivity(
      agentId,
      "error",
      `Start failed: ${reason}`,
      [{ kind: "text", text: `Error: ${reason}` }],
      launchId,
    );
    return true;
  }

  private noteRuntimeTraceCounter(ap: AgentProcess, event: ParsedEvent) {
    ap.runtimeTraceCounters.events++;
    switch (event.kind) {
      case "tool_call":
        ap.runtimeTraceCounters.toolCalls++;
        break;
      case "tool_output":
        ap.runtimeTraceCounters.toolOutputs++;
        break;
      case "compaction_started":
        ap.runtimeTraceCounters.compactionStarts++;
        break;
      case "compaction_finished":
        ap.runtimeTraceCounters.compactionFinishes++;
        break;
      case "text":
        ap.runtimeTraceCounters.textEvents++;
        break;
      case "thinking":
        ap.runtimeTraceCounters.thinkingEvents++;
        break;
    }
  }

  /** Send a batched notification to the agent via stdin about pending messages */
  private sendStdinNotification(agentId: string): boolean {
    const ap = this.agents.get(agentId);
    if (!ap) return false;

    const count = ap.notifications.takePendingAndClearTimer();

    if (count === 0) return false;
    if (ap.isIdle) return false; // agent is idle, messages will be delivered via stdin on turn_end
    if (!ap.sessionId) return false;
    if (ap.gatedSteering.compacting) {
      this.recordRuntimeTraceEvent(agentId, ap, "runtime.compaction_boundary.delivery_suppressed", {
        pendingNotificationCount: count,
        pendingMessages: ap.inbox.length,
        busyDeliveryMode: ap.driver.busyDeliveryMode,
      });
      ap.notifications.add(count);
      logger.info(
        `[Agent ${agentId}] Suppressing stdin delivery until context compaction finishes; pending=${ap.inbox.length}`,
      );
      return false;
    }

    const inboxCount = ap.inbox.length;
    if (inboxCount === 0) return false;
    const notification = `[System notification: You have ${inboxCount} pending inbox message${inboxCount > 1 ? "s" : ""}. Call check_messages to read ${inboxCount > 1 ? "them" : "it"} when you're ready.]`;
    logger.info(`[Agent ${agentId}] Sending stdin notification: ${inboxCount} pending inbox message(s)`);

    const encoded = ap.driver.encodeStdinMessage(notification, ap.sessionId, { mode: "busy" });
    if (encoded) {
      ap.process.stdin?.write(encoded + "\n");
      this.recordDaemonTrace("daemon.agent.stdin_notification", {
        agentId,
        runtime: ap.config.runtime,
        model: ap.config.model,
        launchId: ap.launchId || undefined,
        outcome: "written",
        mode: "busy",
        pending_notification_count: count,
        inbox_count: inboxCount,
        session_id_present: true,
      });
      return true;
    } else {
      ap.notifications.add(count);
      this.recordDaemonTrace("daemon.agent.stdin_notification", {
        agentId,
        runtime: ap.config.runtime,
        model: ap.config.model,
        launchId: ap.launchId || undefined,
        outcome: "encode_failed",
        mode: "busy",
        pending_notification_count: count,
        inbox_count: inboxCount,
        session_id_present: true,
      }, "error");
      return false;
    }
  }

  /** Deliver a message to an agent via stdin, formatting it the same way as the MCP bridge */
  private deliverMessagesViaStdin(
    agentId: string,
    ap: AgentProcess,
    messages: AgentMessage[],
    mode: "idle" | "busy",
  ): boolean {
    if (messages.length === 0) return true;
    const runtimeProfileMigrationMessages = messages.filter((message) => runtimeProfileNotificationFromMessage(message)?.kind === "migration");
    if (runtimeProfileMigrationMessages.length > 0) {
      for (const message of runtimeProfileMigrationMessages) {
        const notification = runtimeProfileNotificationFromMessage(message);
        if (notification?.kind === "migration") {
          this.completeDeprecatedRuntimeProfileMigration(agentId, notification.key, ap.launchId, message.traceparent, "runtime_profile_message");
        }
      }
      messages = messages.filter((message) => runtimeProfileNotificationFromMessage(message)?.kind !== "migration");
      this.recordDaemonTrace("daemon.agent.runtime_profile.deprecated_migration_filtered", {
        agentId,
        launchId: ap.launchId || undefined,
        runtime: ap.config.runtime,
        mode,
        filtered_messages_count: runtimeProfileMigrationMessages.length,
        remaining_messages_count: messages.length,
      });
      if (messages.length === 0) {
        if (mode === "idle") {
          ap.isIdle = true;
        }
        return true;
      }
    }
    const traceAttrs = {
      agentId,
      launchId: ap.launchId || undefined,
      runtime: ap.config.runtime,
      model: ap.config.model,
      mode,
      messages_count: messages.length,
      session_id_present: Boolean(ap.sessionId),
      inbox_count: ap.inbox.length,
      pending_notification_count: ap.notifications.pendingCount,
      busy_delivery_mode: ap.driver.busyDeliveryMode,
      supports_stdin_notification: ap.driver.supportsStdinNotification,
      ...this.messagesTraceAttrs(messages),
    };

    const prompt = formatRuntimeProfileControlPrompt(messages)
      ?? (messages.length === 1
        ? `New message received:\n\n${formatIncomingMessage(messages[0], ap.driver)}\n\nRespond as appropriate. Complete all your work before stopping.\n${RESPONSE_TARGET_HINT}`
        : `New messages received:\n\n${messages.map((message) => formatIncomingMessage(message, ap.driver)).join("\n")}\n\nRespond as appropriate. Complete all your work before stopping.\n${RESPONSE_TARGET_HINT}`);
    const inputTraceAttrs = buildRuntimeInputTraceAttrs({
      source: `stdin_${mode}_delivery`,
      prompt,
      messages,
      sessionIdPresent: Boolean(ap.sessionId),
      nativeStandingPrompt: Boolean(ap.driver.supportsNativeStandingPrompt),
    });
    this.recordRuntimeTraceEvent(agentId, ap, "runtime.input.prepared", inputTraceAttrs);

    const encoded = ap.driver.encodeStdinMessage(prompt, ap.sessionId, { mode });
    if (!encoded) {
      // Preserve queued work if the runtime cannot encode the live delivery yet.
      // This is especially important for protocol-steering runtimes where the
      // active turn id may disappear during a narrow state-transition window.
      ap.inbox.unshift(...messages);
      if (mode === "idle") {
        ap.isIdle = true;
      }
      logger.warn(
        `[Agent ${agentId}] Failed to encode ${mode} stdin delivery; re-queued ${messages.length === 1 ? "message" : `${messages.length} messages`}`,
      );
      this.recordDaemonTrace("daemon.agent.stdin_delivery", {
        ...traceAttrs,
        ...inputTraceAttrs,
        outcome: "encode_failed",
        requeued_messages_count: messages.length,
      }, "error");
      return false;
    }

    this.consumeVisibleMessages(agentId, { messages, source: `stdin_${mode}_delivery` });
    const senders = [...new Set(messages.map((message) => `@${message.sender_name}`))].join(", ");
    logger.info(
      `[Agent ${agentId}] Delivering ${mode} ${messages.length === 1 ? "message" : `${messages.length} messages`} via stdin from ${senders}`,
    );
    if (this.containsOrdinaryInboxMessage(messages)) {
      ap.lastRuntimeError = null;
    }
    ap.process.stdin?.write(encoded + "\n");
    this.ackInjectedRuntimeProfileMessages(agentId, messages, ap.launchId);
    this.recordDaemonTrace("daemon.agent.stdin_delivery", {
      ...traceAttrs,
      ...inputTraceAttrs,
      outcome: "written",
      stdin_write_attempted: true,
    });
    return true;
  }

  /** List ONE level of a directory — directories returned without children (lazy-loaded on demand) */
  private async listDirectoryChildren(dir: string, rootDir: string): Promise<FileNode[]> {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); } catch { return []; }
    entries.sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });
    const nodes: FileNode[] = [];
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(rootDir, fullPath);
      let info;
      try { info = await stat(fullPath); } catch { continue; }
      if (entry.isDirectory()) {
        // children omitted (undefined) — frontend will lazy-load on expand
        nodes.push({ name: entry.name, path: relativePath, isDirectory: true, size: 0, modifiedAt: info.mtime.toISOString() });
      } else {
        nodes.push({ name: entry.name, path: relativePath, isDirectory: false, size: info.size, modifiedAt: info.mtime.toISOString() });
      }
    }
    return nodes;
  }
}
