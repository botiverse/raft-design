import { EventEmitter } from "node:events";
import crypto from "node:crypto";
import type { Server as SocketServer } from "socket.io";
import type { WebSocket } from "ws";
import { failpoints, formatTraceparent, hydrateRuntimeConfig, noopTracer, normalizeActivity, parseTraceparent, runtimeConfigToLaunchFields, type ActiveSpan, type AgentMessage, type ServerToMachineMessage, type MachineToServerMessage, type AgentConfig, type WorkspaceDirectoryInfo, type FileNode, type TrajectoryEntry, type ReasoningEffort, type RuntimeConfig, type SkillInfo, type AgentStatus, type RuntimeModelInfo, type AgentActivity, type TraceContext, type Tracer } from "@slock-ai/shared";
import * as agentService from "./agentService.js";
import * as agentRuntimeProfileService from "./agentRuntimeProfileService.js";
import * as machineService from "./machineService.js";
import * as channelService from "./channelService.js";
import * as agentActivityLogService from "./agentActivityLogService.js";
import type { PersistedAgentActivityHint } from "./agentActivityLogService.js";
import * as reminderService from "./reminderService.js";
import { agentHasScope } from "./agentScopesService.js";
import {
  adaptDaemonActivityLifecycleEvent,
  adaptDaemonSessionLifecycleEvent,
  adaptDaemonStatusLifecycleEvent,
  adaptMachineDisconnectLifecycleEvent,
  adaptReadyReconcileLifecycleEvent,
  adaptRuntimeProfileControlLifecycleEvent,
  adaptStartLifecycleEvent,
  adaptStopLifecycleEvent,
} from "./legacyAgentLifecycleAdapter.js";
import { applyAgentLifecycleProjectionPlan, type AgentLifecycleProjectionWriterDeps } from "./agentLifecycleProjectionWriter.js";
import {
  buildAgentLifecycleStateSnapshot,
  planActivitySignalAction,
  planSessionSignalAction,
  planStatusSignalAction,
  planWakeAction,
  reduceDaemonActivityLifecycle,
  reduceDaemonSessionLifecycle,
  reduceDaemonStatusLifecycle,
  reduceMachineDisconnectLifecycle,
  reduceReadyReconcileLifecycle,
  reduceRuntimeProfileControlLifecycle,
  reduceStartLifecycle,
  reduceStopLifecycle,
  type DaemonReportedAgentStatus,
  type LifecycleRuntimeState,
  type WakePlanAction,
  type WakePlanInput,
  type StatusSignalPlanAction,
  type StatusSignalPlanInput,
  type SessionSignalPlanAction,
  type SessionSignalPlanInput,
  type ActivitySignalPlanAction,
  type ActivitySignalPlanInput,
} from "./agentLifecycleReducer.js";

export {
  buildAgentLifecycleStateSnapshot,
  planActivitySignalAction,
  planSessionSignalAction,
  planStatusSignalAction,
  planWakeAction,
  type ActivitySignalPlanAction,
  type ActivitySignalPlanInput,
  type DaemonReportedAgentStatus,
  type SessionSignalPlanAction,
  type SessionSignalPlanInput,
  type StatusSignalPlanAction,
  type StatusSignalPlanInput,
  type WakePlanAction,
  type WakePlanInput,
} from "./agentLifecycleReducer.js";
import { getServerPlan, getHistoryCutoff } from "./planService.js";
import {
  REPLICA_ID,
  routeMachineCommand, routeInboxDelivery,
} from "../replicaRouter.js";
import { redisReplicaStateStore, type ReplicaStateStore } from "./replicaStateStore.js";

interface MachineConnection {
  ws: WebSocket;
  machineId: string;
  serverId: string;
  connectionEpochId: string;
  heartbeatTimer: unknown | null;
  lastPong: number;
  daemonVersion: string | null;
}

interface OrchestratorClock {
  now(): number;
  setInterval(fn: () => void, ms: number): unknown;
  clearInterval(timer: unknown): void;
}

const systemOrchestratorClock: OrchestratorClock = {
  now: () => Date.now(),
  setInterval: (fn, ms) => setInterval(fn, ms),
  clearInterval: (timer) => clearInterval(timer as ReturnType<typeof setInterval>),
};

function readBooleanEnv(name: string): boolean {
  const raw = process.env[name];
  if (!raw) return false;
  return ["1", "true", "yes", "on"].includes(raw.trim().toLowerCase());
}

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

function durationMsBucket(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return "unknown";
  if (ms === 0) return "0";
  if (ms <= 1_000) return "1s";
  if (ms <= 10_000) return "1s-10s";
  if (ms <= 30_000) return "10s-30s";
  if (ms <= 60_000) return "30s-60s";
  if (ms <= 120_000) return "60s-120s";
  return "120s+";
}

function hashRuntimeProfileKey(key: string | null | undefined): string | undefined {
  if (!key) return undefined;
  return crypto.createHash("sha256").update(key).digest("hex").slice(0, 16);
}

function oldestInboxMessageAgeMs(messages: AgentMessage[], now: number): number | undefined {
  let oldest: number | undefined;
  for (const message of messages) {
    if (!message.timestamp) continue;
    const timestampMs = Date.parse(message.timestamp);
    if (!Number.isFinite(timestampMs)) continue;
    oldest = oldest == null ? timestampMs : Math.min(oldest, timestampMs);
  }
  return oldest == null ? undefined : Math.max(0, now - oldest);
}

interface MachineDisconnectContext {
  cause?: "heartbeat_timeout" | "socket_close" | "socket_error";
  closeCode?: number;
  closeReason?: string;
  errorMessage?: string;
}

interface AgentInbox {
  inbox: AgentMessage[];
  pendingReceive: {
    resolve: (messages: AgentMessage[]) => void;
    timer: ReturnType<typeof setTimeout>;
    finish: (messages: AgentMessage[]) => void;
  } | null;
}

interface StartAgentOptions {
  resumePrompt?: string;
  wakeMessage?: AgentMessage;
}

type StopAgentReason = "manual" | "internal";
type PersistedAgentRow = NonNullable<Awaited<ReturnType<typeof agentService.getAgent>>>;

/** Cached agent state for delivery — avoids DB reads in hot path. */
interface CachedAgentState {
  id: string;
  /**
   * User/server intent, not proof that a runtime process is currently alive.
   * `active` means the agent is allowed to be served and may be lazy-woken.
   * Manual `stopped` is the true offline/unwakeable state.
   */
  status: AgentStatus;
  machineId: string | null;
  sessionId: string | null;
  expectedLaunchId: string | null;
  launchGuardMode: "legacy" | "guarded";
  serverId: string;
  name: string;
  displayName: string | null;
  description: string | null;
  model: string;
  runtime: string;
  runtimeConfig: RuntimeConfig;
  /**
   * Ephemeral runtime-process presence/state observed from daemon signals.
   * Daemon restart can make this `not_running` while `status` remains active.
   */
  runtimeState: LifecycleRuntimeState;
  reasoningEffort: ReasoningEffort | null;
  envVars: Record<string, string> | null;
}

type ActivitySnapshot = {
  activity: string;
  detail: string;
  updatedAt: number;
};

type VisibleActivity = {
  activity: string;
  activityDetail: string;
};

type MachineReachability = "local" | "remote" | "offline" | "none";

type ActivityHintSource = "local-cache" | "redis";

type ActivityTraceOptions = {
  parent?: TraceContext | null;
};

type RuntimeContextMachine = {
  name: string;
  hostname: string | null;
  os: string | null;
} | null;

function runtimeStateFromAgentActivity(activity: AgentActivity): LifecycleRuntimeState {
  if (activity === "thinking" || activity === "working") return activity;
  if (activity === "error") return "crashed";
  if (activity === "offline") return "interrupted";
  return "running_idle";
}

export type AgentLifecycleAction = "start" | "stop" | "reset" | "wake";
export type AgentLifecycleOutcome = "attempted" | "completed" | "failed" | "skipped" | "suppressed";
export type AgentLifecycleCause = "message" | "manual" | "resume" | "internal" | "restart" | "session" | "full";

export interface StaleActivitySweepPlanInput {
  isTransient: boolean;
  ageSec: number;
  staleAfterSec: number;
}

export type StaleActivitySweepPlanAction = "keep-current" | "sweep-online";

export function planStaleActivitySweepAction(input: StaleActivitySweepPlanInput): StaleActivitySweepPlanAction {
  return input.isTransient && input.ageSec > input.staleAfterSec ? "sweep-online" : "keep-current";
}

export interface ActivityBroadcastPlanInput {
  hasEntries: boolean;
  shouldPersistStatusOnly: boolean;
}

export type ActivityBroadcastPlanAction = "persist-and-emit-now" | "debounce-only";

export function planActivityBroadcastAction(input: ActivityBroadcastPlanInput): ActivityBroadcastPlanAction {
  return input.hasEntries || input.shouldPersistStatusOnly ? "persist-and-emit-now" : "debounce-only";
}

export interface RuntimeProfileHeartbeatNudgePlanInput {
  disabled: boolean;
  lastSentAt: number | null;
  now: number;
  cooldownMs: number;
}

export type RuntimeProfileHeartbeatNudgePlanAction = "disabled" | "cooldown" | "allow";

export function planRuntimeProfileHeartbeatNudgeAction(
  input: RuntimeProfileHeartbeatNudgePlanInput,
): RuntimeProfileHeartbeatNudgePlanAction {
  if (input.disabled) return "disabled";
  if (input.lastSentAt !== null && input.now - input.lastSentAt < input.cooldownMs) {
    return "cooldown";
  }
  return "allow";
}

type ActivityBroadcastTraceResult = {
  action: ActivityBroadcastPlanAction;
  persistedEntryCount: number;
  previousActivity: string | null;
  nextActivity: string;
  persistence?: Promise<ActivityPersistenceOutcome>;
};

type ActivityPersistenceOutcome = "applied" | "deduped" | "error";

export interface ActivityHintResolutionPlanInput {
  reachability: MachineReachability;
  shouldTrustRecoveredOfflineHint: boolean;
  source: ActivityHintSource;
  isFreshLocalCache: boolean;
}

export type ActivityHintResolutionPlanAction =
  | "return-snapshot"
  | "return-offline"
  | "ignore-hint"
  | "cache-and-return-snapshot";

export function planActivityHintResolutionAction(
  input: ActivityHintResolutionPlanInput,
): ActivityHintResolutionPlanAction {
  if (input.reachability === "local") {
    return "return-snapshot";
  }

  if (input.reachability === "offline" || input.reachability === "none") {
    return "return-offline";
  }

  if (input.shouldTrustRecoveredOfflineHint) {
    return "ignore-hint";
  }

  if (input.source === "local-cache") {
    return input.isFreshLocalCache ? "return-snapshot" : "ignore-hint";
  }

  return "cache-and-return-snapshot";
}

export interface MachineReachabilityPlanInput {
  hasMachineId: boolean;
  hasLocalMachine: boolean;
  replicaStateAvailable: boolean;
  ownerReplica: string | null;
}

export function planMachineReachability(input: MachineReachabilityPlanInput): MachineReachability {
  if (!input.hasMachineId) {
    return "none";
  }

  if (input.hasLocalMachine) {
    return "local";
  }

  if (!input.replicaStateAvailable) {
    return "offline";
  }

  if (!input.ownerReplica || input.ownerReplica === REPLICA_ID) {
    return "offline";
  }

  return "remote";
}

interface MachineReachabilityInputContext {
  agent: CachedAgentState | null;
}

export interface StaleTransientNormalizationPlanInput {
  isTransient: boolean;
  ageSec: number;
  staleAfterSec: number;
}

export type StaleTransientNormalizationPlanAction = "keep-current" | "normalize-online";

export function planStaleTransientNormalizationAction(
  input: StaleTransientNormalizationPlanInput,
): StaleTransientNormalizationPlanAction {
  return input.isTransient && input.ageSec > input.staleAfterSec ? "normalize-online" : "keep-current";
}

interface StaleActivitySweepApplyContext {
  action: StaleActivitySweepPlanAction;
  agentId: string;
  now: number;
}

interface ActivityBroadcastApplyContext {
  action: ActivityBroadcastPlanAction;
  agentId: string;
  activity: string;
  detail: string;
  now: number;
  persistedEntries: TrajectoryEntry[];
  dedupeKey?: string;
}

interface ActivityHintResolutionApplyContext {
  action: ActivityHintResolutionPlanAction;
  agentId: string;
  snapshot: ActivitySnapshot;
}

interface ActivityHintResolutionInputContext {
  agent: CachedAgentState | null;
  snapshot: ActivitySnapshot;
  source: ActivityHintSource;
}

interface StaleTransientNormalizationApplyContext {
  action: StaleTransientNormalizationPlanAction;
  agentId: string;
  source: ActivityHintSource;
  now: number;
}

export interface SendToMachinePlanInput {
  hasReadyLocalConnection: boolean;
  canReroute: boolean;
}

export type SendToMachinePlanAction =
  | "send-locally"
  | "reroute-then-warn"
  | "warn-offline";

export function planSendToMachineAction(input: SendToMachinePlanInput): SendToMachinePlanAction {
  if (input.hasReadyLocalConnection) {
    return "send-locally";
  }
  return input.canReroute ? "reroute-then-warn" : "warn-offline";
}

export interface StopPlanInput {
  reason: StopAgentReason;
}

export type StopPlanAction = "persist-stopped" | "persist-inactive";

export function planStopAction(input: StopPlanInput): StopPlanAction {
  return input.reason === "manual" ? "persist-stopped" : "persist-inactive";
}

export interface ReceivePlanInput {
  hasBufferedMessages: boolean;
  block: boolean;
}

export type ReceivePlanAction =
  | "return-buffered"
  | "return-empty"
  | "install-waiter";

export function planReceiveAction(input: ReceivePlanInput): ReceivePlanAction {
  if (input.hasBufferedMessages) {
    return "return-buffered";
  }
  return input.block ? "install-waiter" : "return-empty";
}

export interface AckPartitionInput {
  inbox: AgentMessage[];
  ackedSeqs: Set<number>;
}

export interface AckPartitionResult {
  removed: AgentMessage[];
  retained: AgentMessage[];
}

export function partitionAcknowledgedMessages(input: AckPartitionInput): AckPartitionResult {
  const removed: AgentMessage[] = [];
  const retained: AgentMessage[] = [];

  for (const message of input.inbox) {
    if (message.seq && input.ackedSeqs.has(message.seq)) {
      removed.push(message);
    } else {
      retained.push(message);
    }
  }

  return { removed, retained };
}

export interface TargetScopedAckPartitionInput {
  inbox: AgentMessage[];
  channelId: string;
  ackedSeqs: Set<number>;
}

export function partitionTargetScopedAcknowledgedMessages(input: TargetScopedAckPartitionInput): AckPartitionResult {
  const removed: AgentMessage[] = [];
  const retained: AgentMessage[] = [];

  for (const message of input.inbox) {
    if (message.channel_id === input.channelId && message.seq && input.ackedSeqs.has(message.seq)) {
      removed.push(message);
    } else {
      retained.push(message);
    }
  }

  return { removed, retained };
}

export interface TargetScopedAckUpToSeqPartitionInput {
  inbox: AgentMessage[];
  channelId: string;
  maxSeq: number;
}

export function partitionTargetScopedMessagesUpToSeq(input: TargetScopedAckUpToSeqPartitionInput): AckPartitionResult {
  const removed: AgentMessage[] = [];
  const retained: AgentMessage[] = [];

  for (const message of input.inbox) {
    if (message.channel_id === input.channelId && message.seq && message.seq <= input.maxSeq) {
      removed.push(message);
    } else {
      retained.push(message);
    }
  }

  return { removed, retained };
}

export interface ReadCursorAdvancePlanInput {
  messages: AgentMessage[];
}

export function planReadCursorAdvances(input: ReadCursorAdvancePlanInput): Map<string, number> {
  const channelMaxSeq = new Map<string, number>();
  for (const msg of input.messages) {
    if (msg.seq && msg.channel_id) {
      const current = channelMaxSeq.get(msg.channel_id) || 0;
      if (msg.seq > current) channelMaxSeq.set(msg.channel_id, msg.seq);
    }
  }
  return channelMaxSeq;
}

export interface LocalInboxEnqueuePlanInput {
  hasSeqDuplicate: boolean;
  hasMessageIdDuplicate: boolean;
}

export type LocalInboxEnqueuePlanAction = "enqueue" | "skip-duplicate";

export function planLocalInboxEnqueueAction(input: LocalInboxEnqueuePlanInput): LocalInboxEnqueuePlanAction {
  return input.hasSeqDuplicate || input.hasMessageIdDuplicate ? "skip-duplicate" : "enqueue";
}

export interface LocalDeliveryGatePlanInput {
  hasAgent: boolean;
  status: AgentStatus | null;
  machineMatches: boolean;
}

export type LocalDeliveryGatePlanAction = "deliver-locally" | "drop-delivery";

export function planLocalDeliveryGateAction(input: LocalDeliveryGatePlanInput): LocalDeliveryGatePlanAction {
  if (!input.hasAgent) {
    return "drop-delivery";
  }
  return input.status === "active" && input.machineMatches ? "deliver-locally" : "drop-delivery";
}

export interface RoutedOwnershipPlanInput {
  machineIsLocal: boolean;
  canReroute: boolean;
}

export type RoutedOwnershipPlanAction =
  | "handle-locally"
  | "reroute-then-fallback"
  | "fallback";

export function planRoutedOwnershipAction(input: RoutedOwnershipPlanInput): RoutedOwnershipPlanAction {
  if (input.machineIsLocal) {
    return "handle-locally";
  }
  return input.canReroute ? "reroute-then-fallback" : "fallback";
}

interface StopApplyContext {
  agentId: string;
  serverId: string;
  machineId: string | null;
  reason: StopAgentReason;
  previousStatus: AgentStatus;
  nextStatus: AgentStatus;
}

interface WakeApplyContext {
  agentId: string;
  machineId: string | null;
  previousStatus: AgentStatus;
  resetMode: "restart" | "session" | "full" | null;
}

interface DirectDeliveryContext {
  agentId: string;
  machineId: string | null;
  /**
   * Skip the replayable inbox enqueue and just do a best-effort ws send.
   * Used for transient wakes (e.g. reminder fire) where:
   *   - the wake doesn't have a `seq` allocated from `messages.seq`, so the
   *     inbox can't ack/remove it (`partitionAcknowledgedMessages` requires
   *     truthy seq), and
   *   - re-delivering on reconnect would be wrong: the audit lives in
   *     `reminder_events`, the owner sees fire history via the reminder UI,
   *     and a missed wake is recoverable on the agent's own initiative.
   */
  transient?: boolean;
}

/**
 * Options for `agentOrchestrator.deliverMessage`.
 */
export interface DeliverMessageOptions {
  /** Skip the replayable inbox; ws-send only. See `DirectDeliveryContext.transient`. */
  transient?: boolean;
  /**
   * Bypass the `inbox:receive` scope gate because the delivery was initiated by
   * a server owner/admin. This keeps a human authority lane open even when an
   * agent's ordinary inbox notifications are disabled.
   */
  adminAuthority?: boolean;
  /**
   * Bypass the `inbox:receive` scope gate. Set by intrinsic deliveries that
   * the agent cannot opt out of: reminder fire wakes, action-card execution
   * notices, and other author-owned events about the agent's own state.
   *
   * Default false — chat / in-channel system / task message deliveries all
   * gate by `inbox:receive`. This is intentionally separate from
   * `message:read`: read gates active CLI/history access; inbox:receive gates
   * passive server delivery and wake.
   *
   * The "intrinsic" lane is the same model as Discord gateway intents vs
   * session events: inbox receive gates other-principal content; the bot always
   * gets its own session/lifecycle events. In Slock terms, channel
   * messages are other-principal content (gated); reminder fires and
   * action-card notices are author-owned (intrinsic).
   */
  intrinsic?: boolean;
}

interface LocalInboxApplyContext {
  inbox: AgentInbox;
  message: AgentMessage;
  notifyPendingReceive?: boolean;
}

interface LocalDeliveryGateApplyContext {
  action: LocalDeliveryGatePlanAction;
  agentId: string;
  message: AgentMessage;
}

interface SendToMachineApplyContext {
  action: SendToMachinePlanAction;
  machineId: string;
  msg: ServerToMachineMessage;
  sendLocally: () => boolean;
  reroute: () => Promise<boolean>;
}

interface ReceiveApplyContext {
  agentId: string;
  timeoutMs: number;
  signal?: AbortSignal;
}

interface RoutedOwnershipApplyContext {
  action: RoutedOwnershipPlanAction;
  handleLocally: () => boolean | Promise<boolean>;
  rerouteToCurrentOwner: () => Promise<boolean>;
  fallback: () => boolean | Promise<boolean>;
}

export interface ReadyReconcilePlanInput {
  status: AgentStatus;
  running: boolean;
  resetMode: "restart" | "session" | "full" | null;
}

export type ReadyReconcilePlanAction =
  | "force-stop-and-stay-offline"
  | "mark-active-online"
  | "mark-wakeable-not-running"
  | "mark-inactive-offline"
  | "stay-offline";

export function planReadyReconcileAction(input: ReadyReconcilePlanInput): ReadyReconcilePlanAction {
  if (input.running) {
    if (input.status === "stopped" || input.resetMode) {
      return "force-stop-and-stay-offline";
    }
    return "mark-active-online";
  }

  if (input.status !== "active") {
    return "stay-offline";
  }

  // Missing from daemon ready means the runtime process is absent, not that the
  // agent was manually stopped. Keep active agents wakeable unless a reset gate
  // is deliberately draining the old process/session.
  return input.resetMode ? "mark-inactive-offline" : "mark-wakeable-not-running";
}

export interface ResetPlanInput {
  mode: "restart" | "session" | "full";
  hasMachine: boolean;
  restart?: boolean;
}

export type ResetPlanAction = "stop-internal" | "clear-session" | "reset-workspace" | "restart";

export function planResetActions(input: ResetPlanInput): ResetPlanAction[] {
  const actions: ResetPlanAction[] = ["stop-internal"];

  if (input.mode === "session" || input.mode === "full") {
    actions.push("clear-session");
  }

  if (input.mode === "full" && input.hasMachine) {
    actions.push("reset-workspace");
  }

  if (input.restart !== false) {
    actions.push("restart");
  }
  return actions;
}

export function normalizeDaemonAgentStatus(status: string): DaemonReportedAgentStatus {
  if (status === "sleeping") return "active";
  return status === "active" || status === "inactive" ? status : null;
}

export interface LifecycleEventAcceptanceInput {
  launchGuardMode: "legacy" | "guarded";
  expectedLaunchId: string | null;
  launchId?: string;
}

export type LifecycleEventAcceptanceAction =
  | "accept"
  | "ignore-legacy-for-guarded"
  | "ignore-stale-launch";

type MachineAgentValidationDropReason =
  | "missing_server_context"
  | "unknown_agent"
  | "machine_or_server_mismatch";

type MachineAgentValidationResult =
  | { agent: CachedAgentState; dropReason: null }
  | { agent: null; dropReason: MachineAgentValidationDropReason };

type ActivityIngestionDropReason =
  | MachineAgentValidationDropReason
  | "legacy_lifecycle_event"
  | "stale_launch_guard"
  | "agent_stopped"
  | "reset_window"
  | "activity_plan_ignore"
  | "stale_client_seq";

export function planLifecycleEventAcceptance(
  input: LifecycleEventAcceptanceInput,
): LifecycleEventAcceptanceAction {
  if (input.launchGuardMode !== "guarded" || !input.expectedLaunchId) {
    return "accept";
  }

  if (!input.launchId) {
    return "ignore-legacy-for-guarded";
  }

  if (input.launchId !== input.expectedLaunchId) {
    return "ignore-stale-launch";
  }

  return "accept";
}

export function supportsLaunchGuardForDaemonVersion(version: string | null): boolean {
  if (!version) return false;
  // Strip pre-release suffixes (e.g. "0.30.1-alpha.1" -> "0.30.1")
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return false;
  const [, major, minor, patch] = match.map(Number);
  // launchId was introduced in 0.30.1 (PR #518)
  if (major > 0) return true;
  if (minor > 30) return true;
  if (minor === 30 && patch >= 1) return true;
  return false;
}

function narrowPersistedAgentStatus(status: string): AgentStatus | null {
  return status === "active" || status === "inactive" || status === "stopped"
    ? status
    : null;
}

export function narrowReadyReconcileStatus(status: string): AgentStatus | null {
  return narrowPersistedAgentStatus(status);
}

type ReadyReconcileAgent = Awaited<ReturnType<AgentOrchestrator["loadAgentsForReadyReconcile"]>>[number];
type ActivityProducer = "lifecycle" | "slock_cli" | "runtime_tool" | "control" | "message_io";

interface ActivityProducerEvent {
  producer: ActivityProducer;
  summary: string;
  outcome?: "started" | "succeeded" | "failed";
  command?: string;
  target?: string;
  correlationId?: string;
}
type ResetApplyContext = {
  agentId: string;
  mode: "restart" | "session" | "full";
  previousStatus: AgentStatus | null;
  machineId: string | null;
};

export interface AgentLifecycleEvent {
  at: number;
  agentId: string;
  machineId: string | null;
  action: AgentLifecycleAction;
  outcome: AgentLifecycleOutcome;
  cause: AgentLifecycleCause;
  previousStatus?: AgentStatus | null;
  nextStatus?: AgentStatus | null;
  detail?: string;
}

type AgentLifecycleRingBuffer = {
  events: AgentLifecycleEvent[];
  nextIndex: number;
  size: number;
};

/**
 * AgentOrchestrator routes agent commands to the appropriate machine via WebSocket.
 */
export class AgentOrchestrator extends EventEmitter {
  private io: SocketServer | null = null;
  private machineConnections = new Map<string, MachineConnection>();
  private machineStatusVersions = new Map<string, number>();
  private agentInboxes = new Map<string, AgentInbox>();
  private agentActivity = new Map<string, { activity: string; detail: string; updatedAt: number }>();
  private activityDebounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private agentStateCache = new Map<string, CachedAgentState>();
  private resetInProgress = new Map<string, "restart" | "session" | "full">();
  private lifecycleEventsByAgent = new Map<string, AgentLifecycleRingBuffer>();
  private staleActivityTimer: unknown | null = null;
  /**
   * In-flight activity probes keyed by probeId. Each entry holds the
   * fallback timer that fires synth-online if the daemon never replies
   * (legacy sweep behaviour) and the snapshot time used to detect
   * "fresh organic activity arrived" without the probe needing to
   * complete. Cleared by handleActivityProbeResponse on probe-response
   * or by the timer's own callback on timeout.
   */
  private pendingActivityProbes = new Map<
    string,
    { agentId: string; startedAt: number; fallbackTimer: ReturnType<typeof setTimeout> }
  >();

  /**
   * Ingest dedup state for `agent:activity` from daemons, keyed by
   * `${agentId}:${launchId}` (launchId="" if absent). Stores the
   * highest `clientSeq` seen for that key. New launchId resets to 0
   * naturally because we never lookup a key for a launchId we
   * haven't started tracking. (#engineering:72283cf7 task #340 PR B)
   */
  private lastClientSeqByLaunch = new Map<string, number>();

  /**
   * Per-agent monotonic counter for outbound `agent:activity` socket
   * emits. Lets the client drop stale pushes that arrive out-of-order
   * during reconnect storms. Resets on server restart — the client
   * also clears its own lastSeen on `socket.connect`, which fires
   * `loadAgents()` and replaces the dot state wholesale, so the
   * reset window is self-healing.
   */
  private activityServerSeq = new Map<string, number>();
  private runtimeProfileHeartbeatNudgeSentAt = new Map<string, number>();

  /** Max seconds a transient activity (working/thinking) can stay before auto-reset */
  private static ACTIVITY_STALE_SEC = 90;
  /**
   * Soft timeout for an `agent:activity_probe` round-trip. If the
   * daemon doesn't respond within this window, the sweep falls back
   * to the legacy synth-online behaviour. Tuned so a single missed
   * sweep cycle (30s) plus normal WS RTT plus daemon `respondToActivityProbe`
   * processing time fits comfortably; if the daemon is genuinely
   * stuck/unreachable, fallback fires as before.
   * Introduced 2026-05-02 #engineering:72283cf7 task #340.
   */
  private static ACTIVITY_PROBE_TIMEOUT_MS = 5_000;
  private static RUNTIME_PROFILE_MIGRATION_NUDGE_AFTER_MS = 5 * 60_000;
  private static RUNTIME_PROFILE_MIGRATION_NUDGE_INTERVAL_MS = 15 * 60_000;
  private static RUNTIME_PROFILE_MIGRATION_MAX_NUDGES = 3;
  private static RUNTIME_PROFILE_HEARTBEAT_NUDGE_COOLDOWN_MS = 24 * 60 * 60_000;
  private static MACHINE_HEARTBEAT_TIMEOUT_MS = 60_000;
  /** Debounce window for activity broadcasts (ms) */
  private static ACTIVITY_DEBOUNCE_MS = 200;
  /** Retain a small recent lifecycle buffer for debugging/tests without introducing persistence yet. */
  private static MAX_LIFECYCLE_EVENTS = 500;

  constructor(
    private readonly replicaStateStore: ReplicaStateStore = redisReplicaStateStore,
    private readonly clock: OrchestratorClock = systemOrchestratorClock,
    private readonly tracer: Tracer = noopTracer,
  ) {
    super();
  }

  protected async persistAgentStatus(agentId: string, status: AgentStatus, sessionId?: string) {
    await agentService.updateAgentStatus(agentId, status, sessionId);
  }

  /**
   * Signal-driven status writes (ready reconcile, daemon `agent:status`/`agent:session`)
   * gate on the in-memory cache, but the cache is replica-local and never
   * invalidated cross-replica. Route signal writes through the DB-layer guard so
   * a stale `active` cache on another replica cannot resurrect a stopped agent.
   */
  protected async persistAgentStatusFromSignal(agentId: string, status: AgentStatus, sessionId?: string) {
    await agentService.updateAgentStatusFromSignal(agentId, status, sessionId);
  }

  private getLifecycleBuffer(agentId: string): AgentLifecycleRingBuffer {
    let buffer = this.lifecycleEventsByAgent.get(agentId);
    if (!buffer) {
      buffer = {
        events: new Array<AgentLifecycleEvent>(AgentOrchestrator.MAX_LIFECYCLE_EVENTS),
        nextIndex: 0,
        size: 0,
      };
      this.lifecycleEventsByAgent.set(agentId, buffer);
    }
    return buffer;
  }

  private readLifecycleBuffer(buffer: AgentLifecycleRingBuffer, limit: number): AgentLifecycleEvent[] {
    const count = Math.min(limit, buffer.size);
    if (count === 0) return [];

    const start = (buffer.nextIndex - count + AgentOrchestrator.MAX_LIFECYCLE_EVENTS) % AgentOrchestrator.MAX_LIFECYCLE_EVENTS;
    const events: AgentLifecycleEvent[] = [];

    for (let i = 0; i < count; i += 1) {
      const index = (start + i) % AgentOrchestrator.MAX_LIFECYCLE_EVENTS;
      const event = buffer.events[index];
      if (event) events.push(event);
    }

    return events;
  }

  protected recordLifecycleEvent(event: Omit<AgentLifecycleEvent, "at">) {
    const enriched: AgentLifecycleEvent = {
      at: this.clock.now(),
      ...event,
    };
    const buffer = this.getLifecycleBuffer(enriched.agentId);
    buffer.events[buffer.nextIndex] = enriched;
    buffer.nextIndex = (buffer.nextIndex + 1) % AgentOrchestrator.MAX_LIFECYCLE_EVENTS;
    buffer.size = Math.min(buffer.size + 1, AgentOrchestrator.MAX_LIFECYCLE_EVENTS);
    this.emit("agent:lifecycle", enriched);
  }

  getRecentLifecycleEvents(agentId?: string, limit = 50): AgentLifecycleEvent[] {
    if (agentId) {
      const buffer = this.lifecycleEventsByAgent.get(agentId);
      return buffer ? this.readLifecycleBuffer(buffer, limit) : [];
    }

    const events = [...this.lifecycleEventsByAgent.values()]
      .flatMap((buffer) => this.readLifecycleBuffer(buffer, AgentOrchestrator.MAX_LIFECYCLE_EVENTS))
      .sort((a, b) => a.at - b.at);

    return events.slice(-limit);
  }

  private makeLifecycleCorrelationId(...parts: Array<string | null | undefined>): string {
    return parts.filter((part): part is string => Boolean(part)).join(":");
  }

  private makeLifecycleDedupeKey(...parts: Array<string | null | undefined>): string {
    return parts.filter((part): part is string => Boolean(part)).join(":");
  }

  private makeReadyReconcileActivityDedupeKey(input: {
    agentId: string;
    machineId: string;
    connectionEpochId?: string;
    agentStatus: AgentStatus;
    action: ReadyReconcilePlanAction;
  }): string {
    const incidentKind = input.agentStatus === "stopped"
      ? "manualStop"
      : input.action === "mark-active-online"
        ? "readyOnline"
        : input.action === "mark-wakeable-not-running"
          ? "wakeableNotRunning"
          : "runtimeInterrupted";
    return this.makeLifecycleDedupeKey(
      "agent",
      input.agentId,
      "machine",
      input.machineId,
      "connectionEpoch",
      input.connectionEpochId ?? "unknown",
      "readyReconcile",
      incidentKind,
    );
  }

  private getConnectionEpochId(machineId: string | null | undefined): string | undefined {
    if (!machineId) return undefined;
    return this.machineConnections.get(machineId)?.connectionEpochId;
  }

  private lifecycleProjectionWriterDeps(): AgentLifecycleProjectionWriterDeps {
    return {
      broadcastActivity: (agentId, activity, detail, entries, nowOverride, options) =>
        this.broadcastActivity(agentId, activity, detail, entries, nowOverride, options),
      broadcastReadyOnline: (agentId) => this.broadcastReadyOnline(agentId),
      clearInbox: (agentId) => this.clearAgentInbox(agentId),
      clearLaunchGuard: (agentId) => this.clearLaunchGuard(agentId),
      maybeResolveStartingActivity: (agentId) => this.maybeResolveStartingActivity(agentId),
      persistAgentStatus: (agentId, status, sessionId) => this.persistAgentStatus(agentId, status, sessionId),
      persistAgentStatusFromSignal: (agentId, status, sessionId) =>
        this.persistAgentStatusFromSignal(agentId, status, sessionId),
      releaseWakeLock: (agentId) => this.releaseWakeLock(agentId),
      sendBestEffortStopToMachine: (machineId, agentId) => this.sendBestEffortToMachine(
        machineId,
        { type: "agent:stop", agentId },
        `best-effort lifecycle stop send failed for agent ${agentId}`,
      ),
      sendStopToMachine: async (machineId, agentId) => {
        const sent = await this.sendToMachine(machineId, { type: "agent:stop", agentId });
        if (!sent) {
          console.warn(`[Orchestrator] stopAgent ${agentId}: machine ${machineId} unreachable, applying lifecycle projection anyway`);
        }
        return sent;
      },
      updateCache: (agentId, updates) => this.updateCache(agentId, updates),
    };
  }

  setIO(io: SocketServer) {
    this.io = io;
    // Periodically sweep stale transient activities (working/thinking stuck due to missed events)
    if (!this.staleActivityTimer) {
      this.staleActivityTimer = this.clock.setInterval(() => {
        this.sweepStaleActivities();
      }, 30_000);
    }
  }

  /**
   * Reset any working/thinking activities that have been stale for too long.
   *
   * Behaviour change 2026-05-02 (#engineering:72283cf7 task #340 PR A):
   * instead of synthesizing `online` immediately when a transient state
   * goes 90s without an update, we first ask the agent's daemon for
   * ground truth via `agent:activity_probe`. The daemon's response
   * arrives via the existing `agent:activity` upstream channel and
   * cancels the fallback. Only if the probe times out (5s) or the
   * machine is unreachable do we fall back to the legacy
   * synth-online behaviour.
   *
   * The pure-function `planStaleActivitySweepAction` + protected
   * `applyStaleActivitySweepAction` seam is preserved for tests; the
   * probe machinery wraps but doesn't replace it.
   */
  private sweepStaleActivities() {
    const now = this.clock.now();
    for (const [agentId, entry] of this.agentActivity) {
      const action = planStaleActivitySweepAction({
        isTransient: this.isTransientActivity(entry.activity),
        ageSec: (now - entry.updatedAt) / 1000,
        staleAfterSec: AgentOrchestrator.ACTIVITY_STALE_SEC,
      });
      if (action === "keep-current") continue;

      // Resolve the agent's machine SYNCHRONOUSLY from the in-memory
      // state cache. If we have no cached entry (rare in steady state
      // — the agent was never seen by this replica) or no live
      // connection to the machine, fast-path straight to synth-online
      // so the sweep stays synchronous in that branch and we don't
      // leave the dot stuck. The probe path is async only when there
      // IS a connected machine to probe.
      //
      // NOTE: this cache can be stale during a machine migration (the
      // agent moved but cache still points at the old machine). In
      // that window the probe goes to the wrong daemon → no response
      // → 5s fallback fires synth-online. That matches pre-PR
      // behaviour exactly (pre-PR didn't ask the daemon at all and
      // synth'd online), so there's no regression. Migration-aware
      // probe routing can be a follow-up. (@Tenny note d8459ab7)
      const cached = this.agentStateCache.get(agentId);
      const machineId = cached?.machineId ?? null;
      if (!machineId || !this.machineConnections.has(machineId)) {
        this.applyStaleActivitySweepAction({ action, agentId, now });
        continue;
      }

      // Skip if another probe for this agent is already in flight.
      let alreadyInFlight = false;
      for (const pending of this.pendingActivityProbes.values()) {
        if (pending.agentId === agentId) {
          alreadyInFlight = true;
          break;
        }
      }
      if (alreadyInFlight) continue;

      // Probe path — async, fires fallback timer if no response in 5s.
      void this.issueActivityProbe(agentId, machineId, now);
    }
  }

  /**
   * Send `agent:activity_probe` to the daemon and arm a 5s fallback
   * timer that runs the legacy synth-online if the probe never
   * resolves. On daemon response (`agent:activity` carrying matching
   * `probeId`) `handleActivityProbeResponse` cancels the timer.
   *
   * TODO(lifecycle-v2/daemon-protocol): replace this legacy probe/request
   * pair with a canonical activity_snapshot_request / activity_snapshot
   * exchange. The response should be a read-only state snapshot, not another
   * `agent:activity` event that the server has to distinguish from lifecycle
   * mutation.
   */
  private async issueActivityProbe(agentId: string, machineId: string, sweepNow: number) {
    const fallbackToSynth = () => {
      this.applyStaleActivitySweepAction({
        action: "sweep-online",
        agentId,
        now: this.clock.now(),
      });
    };

    const probeId = crypto.randomUUID();
    const fallbackTimer = setTimeout(() => {
      // Probe timed out — daemon crashed, unreachable, or too slow.
      if (this.pendingActivityProbes.delete(probeId)) {
        fallbackToSynth();
      }
    }, AgentOrchestrator.ACTIVITY_PROBE_TIMEOUT_MS);

    this.pendingActivityProbes.set(probeId, {
      agentId,
      startedAt: sweepNow,
      fallbackTimer,
    });

    try {
      const sent = await this.sendToMachine(machineId, {
        type: "agent:activity_probe",
        agentId,
        probeId,
        purpose: "sweep",
      });
      if (!sent) {
        if (this.pendingActivityProbes.delete(probeId)) {
          clearTimeout(fallbackTimer);
          fallbackToSynth();
        }
      }
    } catch {
      if (this.pendingActivityProbes.delete(probeId)) {
        clearTimeout(fallbackTimer);
        fallbackToSynth();
      }
    }
  }

  /**
   * Cancel the fallback timer when the daemon's probe response arrives.
   * Called from the `agent:activity` ingest path when the inbound
   * message carries a matching `probeId`. The activity payload itself
   * still flows through the normal broadcast pipeline (so the new
   * ground-truth state propagates to clients via standard means);
   * this method just stops the synth-fallback from also firing.
   */
  private handleActivityProbeResponse(probeId: string) {
    const pending = this.pendingActivityProbes.get(probeId);
    if (!pending) return;
    clearTimeout(pending.fallbackTimer);
    this.pendingActivityProbes.delete(probeId);
  }

  protected applyStaleActivitySweepAction(context: StaleActivitySweepApplyContext) {
    if (context.action === "keep-current") {
      return;
    }
    this.agentActivity.set(context.agentId, { activity: "online", detail: "", updatedAt: context.now });
    this.broadcastActivity(context.agentId, "online", "", undefined, context.now);
  }

  private isTransientActivity(activity: string): boolean {
    return activity === "working" || activity === "thinking";
  }

  private shouldPersistStatusOnlyActivity(activity: string, detail: string): boolean {
    // Only the terminal activities that can currently arrive without explicit
    // trajectory entries need synthesis here. `stopped` / `crashed` are not
    // AgentActivity values routed through broadcastActivity; they are rendered as
    // `offline` or `error` before reaching this seam.
    if (activity === "offline" || activity === "error") return true;
    if (activity !== "working") return false;
    if (detail === "Starting\u2026") return true;
    if (detail === "Message received") return true;
    if (detail === "Context compaction still running; no finish event observed") return true;
    return detail.startsWith("Restarting stalled ") && detail.endsWith(" runtime for queued message");
  }

  recordActivityProducerEvent(agentId: string, event: ActivityProducerEvent) {
    const summary = this.formatActivityProducerField(event.summary, 120) || "Agent activity";
    const lines = [
      event.target ? `target: ${this.formatActivityProducerField(event.target, 160)}` : null,
      event.outcome && event.outcome !== "succeeded" ? `status: ${event.outcome}` : null,
    ].filter((line): line is string => Boolean(line));

    return this.broadcastSlockAction(agentId, {
      title: summary,
      text: lines.join("\n"),
    });
  }

  recordSlockCliAction(
    agentId: string,
    event: Omit<ActivityProducerEvent, "producer" | "outcome"> & { outcome?: "succeeded" | "failed" },
  ) {
    return this.recordActivityProducerEvent(agentId, {
      producer: "slock_cli",
      outcome: "succeeded",
      ...event,
    });
  }

  // Append a durable Slock workspace action. Live status/detail remains owned by
  // lifecycle/status projection; this helper must not author a new subtitle for it.
  async recordAgentSlockAction(
    agentId: string,
    event: {
      title: string;
      text: string;
      activity?: AgentActivity;
      dedupeKey?: string;
    },
  ): Promise<void> {
    const result = this.broadcastSlockAction(agentId, event);
    await result.persistence;
  }

  private broadcastSlockAction(
    agentId: string,
    event: {
      title: string;
      text: string;
      activity?: AgentActivity;
      dedupeKey?: string;
    },
  ): ActivityBroadcastTraceResult {
    const current = this.agentActivity.get(agentId);
    const envelopeActivity = current?.activity ?? event.activity ?? "online";
    const envelopeDetail = current?.detail ?? "";
    return this.broadcastActivity(
      agentId,
      envelopeActivity,
      envelopeDetail,
      [{
        // `slock_action` appends durable workspace history only. It must reuse
        // the current lifecycle/status projection as the transport envelope,
        // rather than inventing a new live-status subtitle from action copy.
        kind: "slock_action",
        title: event.title,
        text: event.text,
      }],
      undefined,
      event.dedupeKey ? { dedupeKey: event.dedupeKey } : undefined,
    );
  }

  private formatActivityProducerField(value: string, maxLength: number): string {
    const singleLine = value.replace(/\s+/g, " ").trim();
    if (singleLine.length <= maxLength) return singleLine;
    return `${singleLine.slice(0, Math.max(0, maxLength - 1))}\u2026`;
  }

  private formatActivity(activity: string, detail = ""): VisibleActivity {
    return { activity, activityDetail: detail };
  }

  protected maybeResolveStartingActivity(agentId: string) {
    const current = this.agentActivity.get(agentId);
    if (!current) return;
    if (current.activity !== "working") return;
    if (current.detail !== "Starting\u2026") return;
    this.broadcastActivity(agentId, "online", "", [{ kind: "status", activity: "online", detail: "" }]);
  }

  private isFreshBusyActivity(snapshot: ActivitySnapshot | PersistedAgentActivityHint): boolean {
    if (!this.isTransientActivity(snapshot.activity)) return false;
    if (snapshot.activity === "working" && snapshot.detail === "Starting\u2026") return false;
    return this.getActivityAgeSec(snapshot) <= AgentOrchestrator.ACTIVITY_STALE_SEC;
  }

  private async shouldPreserveBusyActivity(agentId: string): Promise<boolean> {
    const current = this.agentActivity.get(agentId);
    if (current && this.isFreshBusyActivity(current)) return true;

    const persisted = await this.loadLatestPersistedActivityHint(agentId);
    return Boolean(persisted && this.isFreshBusyActivity(persisted));
  }

  private isDurableRecoveryActivity(activity: string): boolean {
    return activity === "offline" || activity === "error";
  }

  private async broadcastReadyOnline(agentId: string) {
    const current = this.agentActivity.get(agentId);
    if (current && this.isFreshBusyActivity(current)) return;

    const persisted = await this.loadLatestPersistedActivityHint(agentId);
    if (persisted && this.isFreshBusyActivity(persisted)) return;

    const previous = current ?? persisted;
    const entries: TrajectoryEntry[] | undefined =
      previous && this.isDurableRecoveryActivity(previous.activity)
        ? [{ kind: "status", activity: "online", detail: "" }]
        : undefined;

    this.broadcastActivity(agentId, "online", "", entries);
  }

  private getActivityAgeSec(snapshot: ActivitySnapshot): number {
    return (this.clock.now() - snapshot.updatedAt) / 1000;
  }

  private normalizeStaleTransientActivity(
    agentId: string,
    snapshot: ActivitySnapshot,
    source: ActivityHintSource,
  ): VisibleActivity | null {
    const action = planStaleTransientNormalizationAction({
      isTransient: this.isTransientActivity(snapshot.activity),
      ageSec: this.getActivityAgeSec(snapshot),
      staleAfterSec: AgentOrchestrator.ACTIVITY_STALE_SEC,
    });
    return this.applyStaleTransientNormalizationAction({
      action,
      agentId,
      source,
      now: this.clock.now(),
    });
  }

  protected applyStaleTransientNormalizationAction(
    context: StaleTransientNormalizationApplyContext,
  ): VisibleActivity | null {
    if (context.action === "keep-current") {
      return null;
    }

    if (context.source === "local-cache") {
      this.agentActivity.set(context.agentId, { activity: "online", detail: "", updatedAt: context.now });
      this.broadcastActivity(context.agentId, "online", "", undefined, context.now);
    }
    return this.formatActivity("online");
  }

  private async getMachineReachability(agent: CachedAgentState | null): Promise<MachineReachability> {
    return planMachineReachability(await this.loadMachineReachabilityPlanInput({ agent }));
  }

  protected async loadMachineReachabilityPlanInput(
    context: MachineReachabilityInputContext,
  ): Promise<MachineReachabilityPlanInput> {
    const machineId = context.agent?.machineId ?? null;
    const replicaStateAvailable = this.replicaStateStore.isAvailable();
    const hasLocalMachine = Boolean(machineId && this.hasMachineLocally(machineId));
    const ownerReplica = machineId && replicaStateAvailable && !hasLocalMachine
      ? await this.replicaStateStore.getMachineReplicaOwner(machineId)
      : null;

    return {
      hasMachineId: Boolean(machineId),
      hasLocalMachine,
      replicaStateAvailable,
      ownerReplica,
    };
  }

  private shouldTrustRecoveredOfflineHint(
    agent: CachedAgentState | null,
    snapshot: ActivitySnapshot,
    reachability: MachineReachability,
  ): boolean {
    return snapshot.activity === "offline"
      && agent?.status === "active"
      && reachability !== "offline"
      && reachability !== "none";
  }

  private async resolveActivityHint(
    agentId: string,
    agent: CachedAgentState | null,
    snapshot: ActivitySnapshot,
    source: ActivityHintSource,
    span: ActiveSpan,
  ): Promise<VisibleActivity | null> {
    span.addEvent("activity.hint.seen", {
      source,
      activity: snapshot.activity,
    });

    const planInput = await this.loadActivityHintResolutionPlanInput({
      agent,
      snapshot,
      source,
    });
    span.addEvent("activity.reachability.resolved", {
      source,
      reachability: planInput.reachability,
      agentStatus: agent?.status ?? null,
      hasMachineId: Boolean(agent?.machineId),
    });

    const action = planActivityHintResolutionAction(planInput);
    if (action === "return-offline" || action === "ignore-hint") {
      span.addEvent("activity.hint.ignored", {
        source,
        reason: action === "return-offline" ? "hard-reachability-offline" : "hint-not-trusted",
      });
      return this.applyActivityHintResolutionAction({
        action,
        agentId,
        snapshot,
      });
    }

    const normalized = this.normalizeStaleTransientActivity(agentId, snapshot, source);
    if (normalized) {
      span.addEvent("activity.hint.normalized", {
        source,
        activity: snapshot.activity,
        result: normalized.activity,
      });
      return normalized;
    }

    span.addEvent("activity.hint.returned", {
      source,
      activity: snapshot.activity,
    });

    return this.applyActivityHintResolutionAction({
      action,
      agentId,
      snapshot,
    });
  }

  protected async loadActivityHintResolutionPlanInput(
    context: ActivityHintResolutionInputContext,
  ): Promise<ActivityHintResolutionPlanInput> {
    const reachability = await this.getMachineReachability(context.agent);
    return {
      reachability,
      shouldTrustRecoveredOfflineHint: this.shouldTrustRecoveredOfflineHint(
        context.agent,
        context.snapshot,
        reachability,
      ),
      source: context.source,
      isFreshLocalCache: this.getActivityAgeSec(context.snapshot) < 15,
    };
  }

  protected applyActivityHintResolutionAction(
    context: ActivityHintResolutionApplyContext,
  ): VisibleActivity | null {
    if (context.action === "return-snapshot") {
      return this.formatActivity(context.snapshot.activity, context.snapshot.detail);
    }

    if (context.action === "return-offline") {
      return this.formatActivity("offline");
    }

    if (context.action === "ignore-hint") {
      return null;
    }

    this.agentActivity.set(context.agentId, context.snapshot);
    return this.formatActivity(context.snapshot.activity, context.snapshot.detail);
  }

  private async resolveDerivedActivity(agent: CachedAgentState | null): Promise<VisibleActivity> {
    const reachability = await this.getMachineReachability(agent);
    const isReachable = reachability === "local" || reachability === "remote";
    return this.formatActivity(
      agent
      && isReachable
      && agent.status === "active"
        ? "online"
        : "offline",
    );
  }

  private async resolveRecentPersistedActivity(agentId: string, agent: CachedAgentState | null): Promise<VisibleActivity | null> {
    const reachability = await this.getMachineReachability(agent);
    const persisted = await this.loadLatestPersistedActivityHint(agentId);
    if (
      !agent
      || agent.status !== "active"
      || reachability === "offline"
      || reachability === "none"
      || !persisted
      || !this.isTransientActivity(persisted.activity)
      || this.getActivityAgeSec(persisted) > AgentOrchestrator.ACTIVITY_STALE_SEC
    ) {
      return null;
    }

    return this.formatActivity(persisted.activity, persisted.detail);
  }

  // Agent state cache management

  /** Get cached agent state, falling back to DB on cache miss */
  private async getCachedAgent(agentId: string): Promise<CachedAgentState | null> {
    const cached = this.agentStateCache.get(agentId);
    if (cached) return cached;

    // Cache miss — load from DB and populate cache
    const agent = await agentService.getAgent(agentId);
    if (!agent) return null;

    const state = this.cachedStateFromPersistedAgent(agent);
    this.agentStateCache.set(agentId, state);
    return state;
  }

  private cachedStateFromPersistedAgent(agent: PersistedAgentRow, existing?: CachedAgentState): CachedAgentState {
    const runtimeConfig = hydrateRuntimeConfig(agent);
    const launchRuntimeFields = runtimeConfigToLaunchFields(runtimeConfig);
    return {
      id: agent.id,
      status: agent.status,
      machineId: agent.machineId,
      sessionId: agent.sessionId,
      expectedLaunchId: existing?.expectedLaunchId ?? null,
      launchGuardMode: existing?.launchGuardMode ?? "legacy",
      serverId: agent.serverId,
      name: agent.name,
      displayName: agent.displayName,
      description: agent.description,
      model: launchRuntimeFields.model,
      runtime: launchRuntimeFields.runtime,
      runtimeState: existing?.machineId === agent.machineId ? existing.runtimeState : "unknown",
      reasoningEffort: launchRuntimeFields.reasoningEffort,
      runtimeConfig,
      envVars: launchRuntimeFields.envVars,
    };
  }

  protected async loadAgentForDelivery(agentId: string): Promise<PersistedAgentRow | null> {
    return agentService.getAgent(agentId);
  }

  /**
   * Passive-delivery scope check. Default impl reads `agent_scopes` via
   * `agentHasScope`; deterministic tests override to bypass DB. See
   * `DeliverMessageOptions.intrinsic` for the full design rationale.
   */
  protected async hasPassiveDeliveryScope(agentId: string): Promise<boolean> {
    return agentHasScope(agentId, "inbox:receive");
  }

  private async getAuthoritativeAgentForDelivery(agentId: string): Promise<CachedAgentState | null> {
    const persisted = await this.loadAgentForDelivery(agentId);
    if (!persisted) {
      this.agentStateCache.delete(agentId);
      return null;
    }

    const state = this.cachedStateFromPersistedAgent(persisted, this.agentStateCache.get(agentId));
    this.agentStateCache.set(agentId, state);
    return state;
  }

  /** Update cache entry (partial update) */
  private updateCache(agentId: string, updates: Partial<CachedAgentState>) {
    const cached = this.agentStateCache.get(agentId);
    if (cached) {
      Object.assign(cached, updates);
    }
  }

  protected setLaunchGuard(agentId: string, launchId: string) {
    this.updateCache(agentId, { expectedLaunchId: launchId, launchGuardMode: "guarded" });
  }

  protected clearLaunchGuard(agentId: string) {
    this.updateCache(agentId, { expectedLaunchId: null, launchGuardMode: "legacy" });
  }

  protected shouldAcceptLifecycleEvent(
    machineId: string,
    agent: CachedAgentState,
    messageType: MachineToServerMessage["type"],
    launchId?: string,
  ): boolean {
    const action = this.getLifecycleEventAcceptanceAction(agent, launchId);

    if (action === "accept") {
      return true;
    }

    this.logLifecycleEventDrop(machineId, agent, messageType, launchId, action);
    return false;
  }

  protected getLifecycleEventAcceptanceAction(
    agent: CachedAgentState,
    launchId?: string,
  ): LifecycleEventAcceptanceAction {
    return planLifecycleEventAcceptance({
      launchGuardMode: agent.launchGuardMode,
      expectedLaunchId: agent.expectedLaunchId,
      launchId,
    });
  }

  private logLifecycleEventDrop(
    machineId: string,
    agent: CachedAgentState,
    messageType: MachineToServerMessage["type"],
    launchId: string | undefined,
    action: Exclude<LifecycleEventAcceptanceAction, "accept">,
  ) {
    if (action === "ignore-legacy-for-guarded") {
      console.warn(
        `[Machine ${machineId}] Ignoring legacy ${messageType} for guarded agent ${agent.name} (${agent.expectedLaunchId})`,
      );
      return;
    }

    console.warn(
      `[Machine ${machineId}] Ignoring stale ${messageType} for agent ${agent.name}: expected launch ${agent.expectedLaunchId}, got ${launchId}`,
    );
  }

  /** Remove agent from cache */
  evictCache(agentId: string) {
    this.agentStateCache.delete(agentId);
  }

  // Machine WebSocket management

  private isMachineHeartbeatStale(conn: MachineConnection): boolean {
    return this.clock.now() - conn.lastPong > AgentOrchestrator.MACHINE_HEARTBEAT_TIMEOUT_MS;
  }

  protected onMachineHeartbeatTick(machineId: string, conn: MachineConnection) {
    const lastPongAgeMs = this.clock.now() - conn.lastPong;
    if (this.isMachineHeartbeatStale(conn)) {
      const span = this.tracer.startSpan("server.machine.websocket.heartbeat", {
        surface: "server",
        kind: "internal",
        attrs: {
          machine_id_present: Boolean(machineId),
          server_id_present: Boolean(conn.serverId),
          daemon_version_present: Boolean(conn.daemonVersion),
          ws_ready_state: conn.ws.readyState,
          last_pong_age_ms_bucket: durationMsBucket(lastPongAgeMs),
          heartbeat_timeout_ms: AgentOrchestrator.MACHINE_HEARTBEAT_TIMEOUT_MS,
        },
      });
      console.log(`[Machine ${machineId}] Heartbeat timeout — terminating socket`);
      span.addEvent("heartbeat.timeout", {
        last_pong_age_ms_bucket: durationMsBucket(lastPongAgeMs),
        ws_ready_state: conn.ws.readyState,
      });
      // Use terminate() (TCP RST) rather than close() so the connection is
      // dropped even in half-open / black-hole network conditions.
      try { conn.ws.terminate(); } catch { /* ignore */ }
      void this.handleMachineDisconnect(machineId, conn.ws, { cause: "heartbeat_timeout" });
      span.end("error", {
        attrs: {
          outcome: "heartbeat_timeout",
          terminated_socket: true,
        },
      });
      return;
    }

    void this.sendToMachine(machineId, { type: "ping" })
      .then((sent) => {
        if (sent) return;
        this.tracer.startSpan("server.machine.websocket.heartbeat", {
          surface: "server",
          kind: "internal",
          attrs: {
            machine_id_present: Boolean(machineId),
            server_id_present: Boolean(conn.serverId),
            daemon_version_present: Boolean(conn.daemonVersion),
            ws_ready_state: conn.ws.readyState,
            last_pong_age_ms_bucket: durationMsBucket(lastPongAgeMs),
            heartbeat_timeout_ms: AgentOrchestrator.MACHINE_HEARTBEAT_TIMEOUT_MS,
            outcome: "ping_send_failed",
            sent: false,
          },
        }).end("error");
      })
      .catch((err) => {
        console.warn(`[Machine ${machineId}] best-effort ping send failed:`, err);
        this.tracer.startSpan("server.machine.websocket.heartbeat", {
          surface: "server",
          kind: "internal",
          attrs: {
            machine_id_present: Boolean(machineId),
            server_id_present: Boolean(conn.serverId),
            daemon_version_present: Boolean(conn.daemonVersion),
            ws_ready_state: conn.ws.readyState,
            last_pong_age_ms_bucket: durationMsBucket(lastPongAgeMs),
            heartbeat_timeout_ms: AgentOrchestrator.MACHINE_HEARTBEAT_TIMEOUT_MS,
            outcome: "ping_send_failed",
            sent: false,
            error_class: err instanceof Error ? err.name : typeof err,
          },
        }).end("error");
      });
  }

  protected startMachineHeartbeat(machineId: string, conn: MachineConnection) {
    this.tracer.startSpan("server.machine.websocket.heartbeat_timer", {
      surface: "server",
      kind: "internal",
      attrs: {
        machine_id_present: Boolean(machineId),
        server_id_present: Boolean(conn.serverId),
        interval_ms: 30_000,
        outcome: "started",
      },
    }).end("ok");
    conn.heartbeatTimer = this.clock.setInterval(() => this.onMachineHeartbeatTick(machineId, conn), 30_000);
  }

  protected async autoAssignConnectedMachine(serverId: string, machineId: string) {
    await agentService.autoAssignMachine(serverId, machineId);
  }

  protected async loadAgentsForDisconnect(machineId: string) {
    return agentService.getAgentsForMachine(machineId);
  }

  protected async persistMachineCapabilities(
    machineId: string,
    runtimes: string[],
    hostname?: string,
    os?: string,
    daemonVersion?: string | null,
  ) {
    await machineService.updateMachineRuntimes(machineId, runtimes, hostname, os, daemonVersion);
  }

  protected async loadAgentsForReadyReconcile(machineId: string) {
    return agentService.getAgentsForMachine(machineId);
  }

  protected async loadRuntimeContextMachine(machineId: string): Promise<RuntimeContextMachine> {
    const machine = await machineService.getMachine(machineId);
    return machine
      ? { name: machine.name, hostname: machine.hostname, os: machine.os }
      : null;
  }

  protected async applyReadyReconcileAction(
    machineId: string,
    agent: ReadyReconcileAgent,
    action: ReadyReconcilePlanAction,
    span?: ActiveSpan,
  ): Promise<void> {
    if (!this.agentStateCache.has(agent.id)) {
      this.agentStateCache.set(agent.id, this.cachedStateFromPersistedAgent(agent));
    }
    const connectionEpochId = this.getConnectionEpochId(machineId);
    const activityDedupeKey = this.makeReadyReconcileActivityDedupeKey({
      agentId: agent.id,
      machineId,
      connectionEpochId,
      agentStatus: agent.status,
      action,
    });
    // TODO(lifecycle-v2/server-producer): ready reconcile is server-owned.
    // Have the reconcile planner produce canonical runtime_ready,
    // runtime_interrupted, or ready_reconciled lifecycle events directly with
    // connectionEpochId/reason attrs, then delete this legacy adapter call.
    const { event } = adaptReadyReconcileLifecycleEvent({
      serverId: agent.serverId,
      agentId: agent.id,
      machineId,
      action,
      agentStatus: agent.status,
      connectionEpochId,
      now: () => new Date(this.clock.now()),
    });
    const state = buildAgentLifecycleStateSnapshot({
      dbStatus: agent.status,
      machineId,
      machineReachability: "reachable",
      runtimeState: action === "mark-active-online"
        ? "running_idle"
        : action === "mark-wakeable-not-running"
          ? "not_running"
        : action === "mark-inactive-offline"
          ? "interrupted"
          : "not_running",
    });
    await applyAgentLifecycleProjectionPlan(
      reduceReadyReconcileLifecycle({
        action,
        activityDedupeKey,
        event,
        state,
      }),
      this.lifecycleProjectionWriterDeps(),
      span,
    );
  }

  private peekLocalInboxWakeMessage(agentId: string): AgentMessage | null {
    return this.agentInboxes.get(agentId)?.inbox[0] ?? null;
  }

  private removeLocalInboxWakeMessage(agentId: string, message: AgentMessage): boolean {
    const inbox = this.agentInboxes.get(agentId);
    if (!inbox || inbox.inbox.length === 0) return false;

    const index = inbox.inbox.findIndex((candidate) => {
      if (message.seq && candidate.seq === message.seq) return true;
      return Boolean(!message.seq && message.message_id && candidate.message_id === message.message_id);
    });
    if (index < 0) return false;

    inbox.inbox.splice(index, 1);
    return true;
  }

  private async maybeWakePendingInboxAfterReady(
    machineId: string,
    agent: ReadyReconcileAgent,
    span?: ActiveSpan,
  ): Promise<boolean> {
    const wakeMessage = this.peekLocalInboxWakeMessage(agent.id);
    if (!wakeMessage) {
      return false;
    }

    const wakeInput = await this.loadWakePlanInput(agent.id, agent.status);
    const action = planWakeAction(wakeInput);
    span?.addEvent("machine.ready.pending_inbox_wake.planned", {
      agent_id_present: Boolean(agent.id),
      machine_id_present: Boolean(machineId),
      message_id_present: Boolean(wakeMessage.message_id),
      seq: wakeMessage.seq ?? 0,
      db_status: wakeInput.state.dbStatus,
      runtime_state: wakeInput.state.runtimeState,
      reset_mode: wakeInput.state.resetMode ?? null,
      control_gate: wakeInput.state.controlGate,
      action,
    });

    if (action !== "attempt-wake") {
      return false;
    }

    await this.applyWakeAction({
      agentId: agent.id,
      machineId,
      previousStatus: agent.status,
      resetMode: wakeInput.state.resetMode,
    }, wakeMessage, action);

    const woke = this.agentStateCache.get(agent.id)?.runtimeState === "starting";
    if (!woke) {
      span?.addEvent("machine.ready.pending_inbox_wake.not_started", {
        agent_id_present: Boolean(agent.id),
        machine_id_present: Boolean(machineId),
        seq: wakeMessage.seq ?? 0,
      });
      return false;
    }

    // The pending message is now embedded in agent:start as wakeMessage. Daemon
    // startup-wake messages are not sent as agent:deliver, so they do not emit
    // a delivery ack to drain this replay inbox entry.
    const removed = this.removeLocalInboxWakeMessage(agent.id, wakeMessage);
    span?.addEvent("machine.ready.pending_inbox_wake.started", {
      agent_id_present: Boolean(agent.id),
      machine_id_present: Boolean(machineId),
      seq: wakeMessage.seq ?? 0,
      removed_from_inbox: removed,
    });
    return true;
  }

  private async bumpMachineStatusVersion(machineId: string): Promise<number> {
    if (this.replicaStateStore.isAvailable()) {
      return this.replicaStateStore.bumpMachineStatusVersion(machineId);
    }
    const next = (this.machineStatusVersions.get(machineId) ?? 0) + 1;
    this.machineStatusVersions.set(machineId, next);
    return next;
  }

  async getMachineStatusVersion(machineId: string): Promise<number> {
    if (this.replicaStateStore.isAvailable()) {
      return this.replicaStateStore.getMachineStatusVersion(machineId);
    }
    return this.machineStatusVersions.get(machineId) ?? 0;
  }

  private clearMachineConnection(machineId: string, unregisterReplica: boolean) {
    const conn = this.machineConnections.get(machineId);
    if (!conn) return;

    const hadHeartbeatTimer = Boolean(conn.heartbeatTimer);
    if (conn.heartbeatTimer) this.clock.clearInterval(conn.heartbeatTimer);
    try { conn.ws.close(); } catch { /* ignore */ }
    this.machineConnections.delete(machineId);
    this.tracer.startSpan("server.machine.websocket.heartbeat_timer", {
      surface: "server",
      kind: "internal",
      attrs: {
        machine_id_present: Boolean(machineId),
        server_id_present: Boolean(conn.serverId),
        timer_present: hadHeartbeatTimer,
        outcome: "cleared",
      },
    }).end("ok");

    if (unregisterReplica) {
      this.replicaStateStore.unregisterMachineReplica(machineId).catch(() => {});
    }
  }

  async registerMachine(machineId: string, serverId: string, ws: WebSocket) {
    const replacedExistingConnection = this.machineConnections.has(machineId);
    const span = this.tracer.startSpan("server.machine.connection.register", {
      surface: "server",
      kind: "internal",
      attrs: {
        machine_id_present: Boolean(machineId),
        server_id_present: Boolean(serverId),
        replaced_existing_connection: replacedExistingConnection,
      },
    });
    // A same-replica reconnect is a connection handoff, not a true ownership drop.
    // If we unregister the replica mapping here, the stale async delete can land after
    // the fresh register and briefly strand the machine as "offline" to other replicas.
    try {
      this.clearMachineConnection(machineId, false);

      const conn: MachineConnection = {
        ws,
        machineId,
        serverId,
        connectionEpochId: `machine:${machineId}:connection:${crypto.randomUUID()}`,
        heartbeatTimer: null,
        lastPong: this.clock.now(),
        daemonVersion: null,
      };

      this.startMachineHeartbeat(machineId, conn);

      this.machineConnections.set(machineId, conn);
      const statusVersion = await this.bumpMachineStatusVersion(machineId);

      this.io?.to(`server:${serverId}`).emit("machine:status", {
        machineId,
        status: "online",
        statusVersion,
      });
      span.addEvent("machine.status.emitted", {
        status: "online",
        status_version: statusVersion,
      });

      // Register machine→replica mapping in Redis for cross-replica routing
      this.replicaStateStore.registerMachineReplica(machineId).catch((err) =>
        console.error(`[Machine ${machineId}] Failed to register replica mapping:`, err.message));
      span.addEvent("machine.replica.register_scheduled");

      // Auto-assign this machine to any BYOC agents in the server that have no machine
      try {
        await this.autoAssignConnectedMachine(serverId, machineId);
        span.addEvent("machine.auto_assign.completed");
      } catch (err) {
        console.error(`[Machine ${machineId}] Failed to auto-assign agents:`, err);
        span.addEvent("machine.auto_assign.failed", {
          error_class: err instanceof Error ? err.name : typeof err,
        });
      }

      console.log(`[Machine ${machineId}] Connected (server: ${serverId})`);
      span.end("ok", { attrs: { outcome: "registered", status_version: statusVersion } });
    } catch (err) {
      span.end("error", { attrs: { error_class: err instanceof Error ? err.name : typeof err } });
      throw err;
    }
  }

  unregisterMachine(machineId: string) {
    this.clearMachineConnection(machineId, true);
  }

  /** Get the daemon version for a connected machine (null if offline or unknown). */
  getMachineDaemonVersion(machineId: string): string | null {
    return this.machineConnections.get(machineId)?.daemonVersion ?? null;
  }

  /** Check if a daemon supports the launchId lifecycle guard (requires >= 0.30.1). */
  private daemonSupportsLaunchGuard(machineId: string): boolean {
    return supportsLaunchGuardForDaemonVersion(this.getMachineDaemonVersion(machineId));
  }

  protected prepareStartLaunchGuard(agentId: string, machineId: string | null): string | undefined {
    if (!machineId || !this.daemonSupportsLaunchGuard(machineId)) {
      return undefined;
    }
    const launchId = crypto.randomUUID();
    this.setLaunchGuard(agentId, launchId);
    return launchId;
  }

  protected rollbackStartLaunchGuard(agentId: string, launchId?: string) {
    if (launchId) {
      this.clearLaunchGuard(agentId);
    }
  }

  /** Resolve current machine status from live reachability instead of trusting stale DB state. */
  async getMachineStatus(machineId: string): Promise<"online" | "offline"> {
    if (this.hasMachineLocally(machineId)) return "online";
    if (this.replicaStateStore.isAvailable()) {
      const ownerReplica = await this.replicaStateStore.getMachineReplicaOwner(machineId);
      return ownerReplica && ownerReplica !== REPLICA_ID ? "online" : "offline";
    }
    return "offline";
  }

  /** Check if a machine is connected to THIS replica (for fly-replay routing). */
  hasMachineLocally(machineId: string): boolean {
    const conn = this.machineConnections.get(machineId);
    return !!conn && conn.ws.readyState === 1 && !this.isMachineHeartbeatStale(conn);
  }

  /** Close all machine connections and timers (for graceful shutdown). */
  shutdown() {
    if (this.staleActivityTimer) {
      this.clock.clearInterval(this.staleActivityTimer);
      this.staleActivityTimer = null;
    }
    for (const timer of this.activityDebounceTimers.values()) {
      clearTimeout(timer);
    }
    this.activityDebounceTimers.clear();
    for (const machineId of [...this.machineConnections.keys()]) {
      this.unregisterMachine(machineId);
    }
    this.lifecycleEventsByAgent.clear();
  }

  async handleMachineDisconnect(machineId: string, ws?: WebSocket, context: MachineDisconnectContext = {}) {
    const span = this.tracer.startSpan("server.machine.connection.disconnect", {
      surface: "server",
      kind: "internal",
      attrs: {
        machine_id_present: Boolean(machineId),
        cause: context.cause || "socket_close",
        close_code_present: context.closeCode !== undefined,
        close_reason_present: Boolean(context.closeReason),
        error_present: Boolean(context.errorMessage),
      },
    });
    const conn = this.machineConnections.get(machineId);
    // Ignore stale disconnect from a previous socket (e.g. after reconnect)
    if (ws && conn && conn.ws !== ws) {
      console.log(`[Machine ${machineId}] Ignoring stale disconnect from previous socket`);
      span.end("ok", { attrs: { outcome: "ignored_stale_socket" } });
      return;
    }
    // Ignore duplicate disconnect (error + close both fire on same socket)
    if (!conn) {
      span.end("ok", { attrs: { outcome: "ignored_duplicate" } });
      return;
    }
    const serverId = conn.serverId;
    this.unregisterMachine(machineId);

    // Mark all active agents on this machine offline, but preserve enough
    // lifecycle state for a future explicit work item to lazy-wake them.
    try {
      const machineAgents = await this.loadAgentsForDisconnect(machineId);
      let activeAgentsCount = 0;
      let pendingReceivesResolvedCount = 0;
      for (const agent of machineAgents) {
        this.releaseWakeLock(agent.id);
        if (agent.status === "active") {
          activeAgentsCount += 1;
          const activityDedupeKey = this.makeLifecycleDedupeKey(
            "agent",
            agent.id,
            "machine",
            machineId,
            "connectionEpoch",
            conn.connectionEpochId,
            "disconnect",
          );
          // TODO(lifecycle-v2/server-producer): machine disconnect is a
          // server-owned reachability transition. Emit canonical
          // machine_disconnected events from the disconnect planner with the
          // connection epoch and cause, then delete this adapter call.
          const { event } = adaptMachineDisconnectLifecycleEvent({
            serverId: agent.serverId,
            agentId: agent.id,
            machineId,
            reason: context.cause === "heartbeat_timeout" ? "heartbeat_timeout" : "machine_disconnect",
            connectionEpochId: conn.connectionEpochId,
            disconnectCause: context.cause || "socket_close",
            previousStatus: agent.status,
            now: () => new Date(this.clock.now()),
          });
          await applyAgentLifecycleProjectionPlan(
            reduceMachineDisconnectLifecycle({
              activityDedupeKey,
              event,
              state: buildAgentLifecycleStateSnapshot({
                dbStatus: agent.status,
                machineId,
                machineReachability: "unreachable",
                runtimeState: "interrupted",
              }),
            }),
            this.lifecycleProjectionWriterDeps(),
            span,
          );

          // Clean up inbox
          if (this.clearAgentInbox(agent.id)) {
            pendingReceivesResolvedCount += 1;
          }
        }
      }

      let statusVersion: number | null = null;
      if (serverId) {
        statusVersion = await this.bumpMachineStatusVersion(machineId);
        this.io?.to(`server:${serverId}`).emit("machine:status", {
          machineId,
          status: "offline",
          statusVersion,
        });
        span.addEvent("machine.status.emitted", {
          status: "offline",
          status_version: statusVersion,
        });
      }

      const detailParts = [
        `reason=${context.cause || "socket_close"}`,
        `affected_agents=${machineAgents.length}`,
      ];
      if (context.closeCode !== undefined) detailParts.push(`code=${context.closeCode}`);
      if (context.closeReason) detailParts.push(`close_reason=${JSON.stringify(context.closeReason)}`);
      if (context.errorMessage) detailParts.push(`error=${JSON.stringify(context.errorMessage)}`);
      console.log(`[Machine ${machineId}] Disconnected (${detailParts.join(", ")})`);
      span.end("ok", {
        attrs: {
          outcome: "processed",
          affected_agents_count: machineAgents.length,
          active_agents_count: activeAgentsCount,
          pending_receives_resolved_count: pendingReceivesResolvedCount,
          status_version: statusVersion,
        },
      });
    } catch (err) {
      console.error(`[Machine ${machineId}] Failed to clean up agents on disconnect:`, err);
      let statusVersion: number | null = null;
      if (serverId) {
        statusVersion = await this.bumpMachineStatusVersion(machineId);
        this.io?.to(`server:${serverId}`).emit("machine:status", {
          machineId,
          status: "offline",
          statusVersion,
        });
      }
      span.end("error", {
        attrs: {
          outcome: "cleanup_failed",
          error_class: err instanceof Error ? err.name : typeof err,
          status_version: statusVersion,
        },
      });
    }
  }

  async handleMachineMessage(machineId: string, msg: MachineToServerMessage) {
    const conn = this.machineConnections.get(machineId);

    switch (msg.type) {
      case "pong":
      {
        const previousLastPong = conn?.lastPong ?? null;
        if (conn) conn.lastPong = this.clock.now();
        try {
          await this.updateMachineHeartbeat(machineId);
        } catch (err) {
          console.error(`[Machine ${machineId}] Failed to update heartbeat:`, err);
          this.tracer.startSpan("server.machine.websocket.pong_received", {
            surface: "server",
            kind: "internal",
            attrs: {
              machine_id_present: Boolean(machineId),
              server_id_present: Boolean(conn?.serverId),
              previous_last_pong_age_ms_bucket: previousLastPong == null ? "unknown" : durationMsBucket(this.clock.now() - previousLastPong),
              outcome: "heartbeat_persist_failed",
              connection_present: Boolean(conn),
              error_class: err instanceof Error ? err.name : typeof err,
            },
          }).end("error");
        }
        // Refresh machine→replica TTL in Redis so cross-replica routing stays valid
        this.replicaStateStore.refreshMachineReplica(machineId).catch(() => {});
        await this.maybePiggybackRuntimeProfileMigrationNudgesForMachine(machineId);
        break;
      }

      case "ready":
      {
        const span = this.tracer.startSpan("server.machine.ready.reconcile", {
          surface: "server",
          kind: "internal",
          attrs: {
            machine_id_present: Boolean(machineId),
            server_id_present: Boolean(conn?.serverId),
            runtimes_count: msg.runtimes.length,
            running_agents_count: msg.runningAgents.length,
            daemon_version_present: Boolean(msg.daemonVersion),
            hostname_present: Boolean(msg.hostname),
            os_present: Boolean(msg.os),
          },
        });
        const actionCounts: Record<string, number> = {};
        let invalid_status_count = 0;
        let requestStartCount = 0;
        try {
          console.log(`[Machine ${machineId}] Ready, runtimes: ${msg.runtimes.join(", ") || "none"}, version: ${msg.daemonVersion || "unknown"}, running agents: ${msg.runningAgents.join(", ") || "none"}`);
          // Store version in memory (transient connection state)
          if (conn) conn.daemonVersion = msg.daemonVersion ?? null;
          // Persist runtimes to DB
          try {
            await this.persistMachineCapabilities(machineId, msg.runtimes, msg.hostname, msg.os, msg.daemonVersion ?? null);
            span.addEvent("machine.capabilities.persisted", { runtimes_count: msg.runtimes.length });
          } catch (err) {
            console.error(`[Machine ${machineId}] Failed to update runtimes:`, err);
            span.addEvent("machine.capabilities.persist_failed", {
              error_class: err instanceof Error ? err.name : typeof err,
            });
          }
          // Broadcast runtimes + version to frontend
          if (conn) {
            this.io?.to(`server:${conn.serverId}`).emit("machine:capabilities", {
              machineId,
              runtimes: msg.runtimes,
              hostname: msg.hostname,
              os: msg.os,
              daemonVersion: msg.daemonVersion,
            });
            span.addEvent("machine.capabilities.broadcasted", { server_id_present: Boolean(conn.serverId) });
          }

          // Reconcile all agents assigned to this machine:
          // - running now => mark active
          // - active but missing => keep wakeable/online, mark only runtime process absent
          // - inactive/stopped => stay non-running until an explicit wake path
          try {
            const runningSet = new Set(msg.runningAgents);
            const machineAgents = await this.loadAgentsForReadyReconcile(machineId);
            span.addEvent("machine.ready.agents.loaded", { agents_count: machineAgents.length });
            for (const agent of machineAgents) {
              const running = runningSet.has(agent.id);
              const narrowedStatus = narrowReadyReconcileStatus(agent.status);
              if (!narrowedStatus) {
                console.warn(
                  `[Machine ${machineId}] Invalid persisted agent status ${JSON.stringify(agent.status)} for ${agent.id}; failing closed`,
                );
                invalid_status_count += 1;
                const action = running ? "force-stop-and-stay-offline" : "stay-offline";
                actionCounts[action] = (actionCounts[action] ?? 0) + 1;
                await this.applyReadyReconcileAction(
                  machineId,
                  { ...agent, status: "inactive" },
                  action,
                  span,
                );
                continue;
              }

              const action = planReadyReconcileAction({
                status: narrowedStatus,
                running,
                resetMode: this.getResetMode(agent.id),
              });
              actionCounts[action] = (actionCounts[action] ?? 0) + 1;
              await this.applyReadyReconcileAction(machineId, agent, action, span);
              if (action === "mark-wakeable-not-running" && await this.maybeWakePendingInboxAfterReady(machineId, agent, span)) {
                requestStartCount += 1;
              }
            }
          } catch (err) {
            console.error(`[Machine ${machineId}] Failed to reconcile agents:`, err);
            span.addEvent("machine.ready.reconcile_failed", {
              error_class: err instanceof Error ? err.name : typeof err,
            });
          }
          span.end("ok", {
            attrs: {
              outcome: "processed",
              invalid_status_count,
              force_stop_and_stay_offline_count: actionCounts["force-stop-and-stay-offline"] ?? 0,
              mark_inactive_offline_count: actionCounts["mark-inactive-offline"] ?? 0,
              mark_wakeable_not_running_count: actionCounts["mark-wakeable-not-running"] ?? 0,
              mark_active_online_count: actionCounts["mark-active-online"] ?? 0,
              stay_offline_count: actionCounts["stay-offline"] ?? 0,
              request_start_count: requestStartCount,
            },
          });
        } catch (err) {
          span.end("error", { attrs: { error_class: err instanceof Error ? err.name : typeof err } });
          throw err;
        }
        break;
      }

      case "agent:status": {
        const span = this.tracer.startSpan("server.agent.status.ingest", {
          surface: "server",
          kind: "internal",
          attrs: {
            agent_id_present: Boolean(msg.agentId),
            machine_id_present: Boolean(machineId),
            launch_id_present: Boolean(msg.launchId),
            reported_status: msg.status,
          },
        });
        const finish = (outcome: string, attrs?: Record<string, unknown>) => {
          span.end("ok", { attrs: { outcome, ...attrs } });
        };
        try {
          span.addEvent("agent.status.received", {
            reported_status: msg.status,
            launch_id_present: Boolean(msg.launchId),
          });
          const agent = await this.validateMachineAgentMessage(machineId, conn?.serverId ?? null, msg.agentId, msg.type);
          if (!agent) {
            finish("dropped", { reason: "validation_failed" });
            break;
          }
          if (!this.shouldAcceptLifecycleEvent(machineId, agent, msg.type, msg.launchId)) {
            span.addEvent("agent.status.lifecycle_guard.checked", {
              accepted: false,
              launch_id_present: Boolean(msg.launchId),
            });
            finish("dropped", { reason: "lifecycle_guard" });
            break;
          }
          span.addEvent("agent.status.lifecycle_guard.checked", {
            accepted: true,
            launch_id_present: Boolean(msg.launchId),
          });
          const normalizedStatus = normalizeDaemonAgentStatus(msg.status);
          if (!normalizedStatus) {
            console.warn(`[Machine ${machineId}] Unknown agent status "${msg.status}" for ${msg.agentId}, ignoring`);
            finish("dropped", { reason: "unknown_status" });
            break;
          }
          const resetMode = this.getResetMode(msg.agentId);
          const state = buildAgentLifecycleStateSnapshot({
            dbStatus: agent.status,
            launchId: msg.launchId,
            machineId,
            machineReachability: "reachable",
            resetMode,
            runtimeState: normalizedStatus === "active" ? "running_idle" : "not_running",
          });
          const action = planStatusSignalAction({
            reportedStatus: normalizedStatus,
            state,
          });
          span.addEvent("agent.status.action.planned", {
            current_status: agent.status,
            normalized_status: normalizedStatus,
            action,
          });
          const nextStatus: AgentStatus =
            action === "persist-active" ? "active"
              : action === "persist-stopped" ? "stopped"
                : "inactive";
          // TODO(lifecycle-v2/daemon-protocol): replace legacy `agent:status`
          // ingestion with daemon-emitted canonical runtime_ready or
          // runtime_interrupted events carrying reason, launchId, correlationId,
          // and reset/window attrs. This call site is the server compatibility
          // boundary until all supported daemons speak that protocol.
          const { event } = adaptDaemonStatusLifecycleEvent({
            serverId: agent.serverId,
            agentId: msg.agentId,
            machineId,
            launchId: msg.launchId,
            currentStatus: agent.status,
            normalizedStatus,
            resetMode,
            now: () => new Date(this.clock.now()),
          });
          try {
            await applyAgentLifecycleProjectionPlan(
              reduceDaemonStatusLifecycle({
                action,
                event,
                nextStatus,
                state,
              }),
              this.lifecycleProjectionWriterDeps(),
              span,
            );
            if (action === "persist-active" || action === "persist-inactive" || action === "persist-stopped") {
              span.addEvent("agent.status.persisted", { next_status: nextStatus });
            }
          } catch (err) {
            console.error(`[Machine ${machineId}] Failed to apply agent ${msg.agentId} status projection:`, err);
            span.addEvent("agent.status.persist_failed", {
              error_class: err instanceof Error ? err.name : typeof err,
              next_status: nextStatus,
            });
          }
          finish(action === "ignore" || action === "ignore-and-release-wake-lock" ? "ignored" : "persisted", { action, next_status: nextStatus });
        } catch (err) {
          span.end("error", { attrs: { error_class: err instanceof Error ? err.name : typeof err } });
          throw err;
        }
        break;
      }

      case "agent:activity": {
        const span = this.tracer.startSpan("server.agent.activity.ingest", {
          surface: "server",
          attrs: {
            agent_id_present: Boolean(msg.agentId),
            machine_id_present: Boolean(machineId),
          },
        });
        span.addEvent("activity.ingest.received", {
          activity: msg.activity,
          hasEntries: Boolean(msg.entries?.length),
          hasLaunchId: Boolean(msg.launchId),
        });

        const drop = (reason: ActivityIngestionDropReason, attrs?: Record<string, unknown>) => {
          span.addEvent("activity.ingest.dropped", { reason, ...attrs });
          span.end("ok", { attrs: { outcome: "dropped", reason } });
        };

        try {
          const validation = await this.validateMachineAgentMessageWithReason(
            machineId,
            conn?.serverId ?? null,
            msg.agentId,
            msg.type,
          );
          if (!validation.agent) {
            drop(validation.dropReason);
            break;
          }
          const agent = validation.agent;

          const lifecycleAction = this.getLifecycleEventAcceptanceAction(agent, msg.launchId);
          span.addEvent("lifecycle_guard.checked", {
            action: lifecycleAction,
            guardMode: agent.launchGuardMode,
            hasExpectedLaunchId: Boolean(agent.expectedLaunchId),
            hasLaunchId: Boolean(msg.launchId),
          });
          if (lifecycleAction !== "accept") {
            this.logLifecycleEventDrop(machineId, agent, msg.type, msg.launchId, lifecycleAction);
            drop(
              lifecycleAction === "ignore-legacy-for-guarded"
                ? "legacy_lifecycle_event"
                : "stale_launch_guard",
            );
            break;
          }

          // Ingest dedup by (launchId, clientSeq). Daemon-emitted
          // activity messages can arrive out-of-order across WS
          // reconnects (a re-queued heartbeat can land after a
          // newer transition). Drop any whose clientSeq isn't
          // strictly greater than the highest seen for that
          // launchId. Old daemons leave clientSeq unset → no
          // dedup, identical to pre-PR behaviour.
          // (#engineering:72283cf7 task #340 PR B)
          if (typeof msg.clientSeq === "number") {
            const launchKey = `${msg.agentId}:${msg.launchId ?? ""}`;
            const lastSeen = this.lastClientSeqByLaunch.get(launchKey);
            if (lastSeen !== undefined && msg.clientSeq <= lastSeen) {
              span.addEvent("activity.ingest.dropped_stale_seq", {
                clientSeq: msg.clientSeq,
                lastSeen,
              });
              drop("stale_client_seq", {
                clientSeq: msg.clientSeq,
                lastSeen,
              });
              break;
            }
            this.lastClientSeqByLaunch.set(launchKey, msg.clientSeq);
          }

          const resetMode = this.getResetMode(msg.agentId);
          const activity = normalizeActivity(msg.activity, agent.status);
          const state = buildAgentLifecycleStateSnapshot({
            dbStatus: agent.status,
            launchId: msg.launchId,
            machineId,
            machineReachability: "reachable",
            resetMode,
            runtimeState: runtimeStateFromAgentActivity(activity),
          });
          const action = planActivitySignalAction({
            state,
          });
          // TODO(lifecycle-v2/daemon-protocol): replace legacy `agent:activity`
          // ingestion with structured daemon events that distinguish runtime
          // progress, transient heartbeat, provider/runtime error, process exit,
          // and activity-log entries. Until then the adapter is the only place
          // that maps legacy activity strings into canonical lifecycle events.
          const { event } = adaptDaemonActivityLifecycleEvent({
            serverId: agent.serverId,
            agentId: msg.agentId,
            machineId,
            launchId: msg.launchId,
            clientSeq: msg.clientSeq,
            currentStatus: agent.status,
            resetMode,
            activity,
            hasEntries: Boolean(msg.entries?.length),
            now: () => new Date(this.clock.now()),
          });
          if (action === "ignore") {
            await applyAgentLifecycleProjectionPlan(
              reduceDaemonActivityLifecycle({
                action,
                event,
                activity,
                detail: msg.detail,
                entries: msg.entries,
                state,
              }),
              this.lifecycleProjectionWriterDeps(),
              span,
            );
            drop(
              agent.status === "stopped"
                ? "agent_stopped"
                : resetMode
                  ? "reset_window"
                  : "activity_plan_ignore",
              {
                agentStatus: agent.status,
                resetMode,
              },
            );
            break;
          }

          span.addEvent("activity.ingest.accepted", {
            activity,
            hasEntries: Boolean(msg.entries?.length),
          });
          const result = await applyAgentLifecycleProjectionPlan(
            reduceDaemonActivityLifecycle({
              action,
              event,
              activity,
              detail: msg.detail,
              entries: msg.entries,
              state,
            }),
            this.lifecycleProjectionWriterDeps(),
            span,
          );
          if (result.liveActivityResult) {
            span.addEvent("status.read_model.updated", {
              from: result.liveActivityResult.previousActivity ?? null,
              to: result.liveActivityResult.nextActivity ?? activity,
            });
          }
          if (result.liveActivityResult?.action === "persist-and-emit-now") {
            span.addEvent("activity.log.persist_scheduled", {
              entryCount: result.liveActivityResult.persistedEntryCount ?? 0,
            });
          } else {
            span.addEvent("activity.log.persist_skipped", {
              reason: "debounce_only",
            });
          }
          // If this activity is the daemon's response to a server-issued
          // `agent:activity_probe`, cancel the pending fallback timer.
          // The activity broadcast above already updated agent state and
          // pushed to clients; the fallback's job (synth-online) is
          // moot. Lifecycle-dropped messages skip this — that's
          // intentional, the fallback should still fire if the
          // probe response was rejected. (#engineering:72283cf7 #340 PR A)
          if (msg.probeId) {
            this.handleActivityProbeResponse(msg.probeId);
            span.addEvent("activity.probe.response_consumed", { probe_id_present: true });
          }
          span.end("ok", { attrs: { outcome: "accepted" } });
        } catch (err) {
          span.addEvent("activity.ingest.failed", {
            error_class: err instanceof Error ? err.name : typeof err,
          });
          span.end("error");
          throw err;
        }
        break;
      }

      case "agent:session": {
        const agent = await this.validateMachineAgentMessage(machineId, conn?.serverId ?? null, msg.agentId, msg.type);
        if (!agent) {
          break;
        }
        if (!this.shouldAcceptLifecycleEvent(machineId, agent, msg.type, msg.launchId)) {
          break;
        }
        const resetMode = this.getResetMode(msg.agentId);
        const state = buildAgentLifecycleStateSnapshot({
          dbStatus: agent.status,
          launchId: msg.launchId,
          machineId,
          machineReachability: "reachable",
          resetMode,
          runtimeState: "running_idle",
          sessionId: msg.sessionId,
        });
        const action = planSessionSignalAction({ state });
        // TODO(lifecycle-v2/daemon-protocol): replace legacy `agent:session`
        // ingestion with canonical runtime_ready/session_init or session_resync
        // events. The daemon producer should include launchId and reconnect/
        // connection-window identity so the server does not infer readiness
        // solely from session presence.
        const { event } = adaptDaemonSessionLifecycleEvent({
          serverId: agent.serverId,
          agentId: msg.agentId,
          machineId,
          launchId: msg.launchId,
          currentStatus: agent.status,
          resetMode,
          now: () => new Date(this.clock.now()),
        });
        try {
          await applyAgentLifecycleProjectionPlan(
            reduceDaemonSessionLifecycle({
              action,
              event,
              sessionId: msg.sessionId,
              state,
            }),
            this.lifecycleProjectionWriterDeps(),
          );
        } catch (err) {
          console.error(`[Machine ${machineId}] Failed to update agent ${msg.agentId} session:`, err);
        }
        if (action === "persist-active-session") {
          await this.deliverPendingRuntimeProfileMigration(machineId, agent, msg.launchId);
        }
        break;
      }

      case "agent:runtime_profile": {
        const span = this.tracer.startSpan("server.runtime_profile.report.ingest", {
          parent: parseTraceparent(msg.traceparent),
          surface: "server",
          kind: "consumer",
          attrs: {
            agent_id_present: Boolean(msg.agentId),
            machine_id_present: Boolean(machineId),
            launch_id_present: Boolean(msg.launchId),
            runtime: msg.facts.runtime,
            model_present: Boolean(msg.facts.model),
            session_ref_present: Boolean(msg.facts.sessionRef),
            workspace_ref_present: Boolean(msg.facts.workspaceRef || msg.facts.workspacePathRef),
          },
        });
        const agent = await this.validateMachineAgentMessage(machineId, conn?.serverId ?? null, msg.agentId, msg.type);
        if (!agent) {
          span.end("ok", { attrs: { outcome: "invalid-agent" } });
          break;
        }
        if (!this.shouldAcceptLifecycleEvent(machineId, agent, msg.type, msg.launchId)) {
          span.end("ok", { attrs: { outcome: "stale-launch" } });
          break;
        }
        const context = await agentRuntimeProfileService.loadAgentRuntimeProfileContext(msg.agentId);
        if (!context) {
          console.warn(`[Machine ${machineId}] Dropping runtime profile report for ${msg.agentId}: missing runtime profile context`);
          span.end("ok", { attrs: { outcome: "missing-context" } });
          break;
        }
        try {
          await agentRuntimeProfileService.recordAgentRuntimeProfile({
            serverId: agent.serverId,
            agentId: msg.agentId,
            machineId,
            daemonVersion: conn?.daemonVersion ?? context.machine.daemonVersion ?? null,
            facts: msg.facts,
          });
          await this.deliverPendingRuntimeProfileMigration(machineId, agent, msg.launchId);
          span.end("ok", { attrs: { outcome: "recorded" } });
        } catch (err) {
          console.error(`[Machine ${machineId}] Failed to record runtime profile for ${msg.agentId}:`, err);
          span.end("error", { attrs: { outcome: "record-failed", error_class: err instanceof Error ? err.name : typeof err } });
        }
        break;
      }

      case "agent:runtime_profile:migration:ack": {
        const span = this.tracer.startSpan("server.runtime_profile.control.inject_ack", {
          parent: parseTraceparent(msg.traceparent),
          surface: "server",
          kind: "consumer",
          attrs: {
            agent_id_present: Boolean(msg.agentId),
            machine_id_present: Boolean(machineId),
            launch_id_present: Boolean(msg.launchId),
            control_kind: "migration",
            key_present: Boolean(msg.migrationKey),
          },
        });
        const agent = await this.validateMachineAgentMessage(machineId, conn?.serverId ?? null, msg.agentId, msg.type);
        if (!agent) {
          span.end("ok", { attrs: { outcome: "invalid-agent" } });
          break;
        }
        if (!this.shouldAcceptLifecycleEvent(machineId, agent, msg.type, msg.launchId)) {
          span.end("ok", { attrs: { outcome: "stale-launch" } });
          break;
        }
        try {
          await agentRuntimeProfileService.markRuntimeProfileMigrationDelivered(msg.agentId, msg.migrationKey, msg.launchId || null);
          span.end("ok", { attrs: { outcome: "delivered" } });
        } catch (err) {
          console.error(`[Machine ${machineId}] Failed to mark runtime profile migration delivered ${msg.migrationKey} for ${msg.agentId}:`, err);
          span.end("error", { attrs: { outcome: "mark-failed", error_class: err instanceof Error ? err.name : typeof err } });
        }
        break;
      }

      case "agent:runtime_profile:migration_done": {
        const span = this.tracer.startSpan("server.runtime_profile.migration_done", {
          parent: parseTraceparent(msg.traceparent),
          surface: "server",
          kind: "consumer",
          attrs: {
            agent_id_present: Boolean(msg.agentId),
            machine_id_present: Boolean(machineId),
            launch_id_present: Boolean(msg.launchId),
            key_present: Boolean(msg.migrationKey),
            source: "daemon",
          },
        });
        const agent = await this.validateMachineAgentMessage(machineId, conn?.serverId ?? null, msg.agentId, msg.type);
        if (!agent) {
          span.end("ok", { attrs: { outcome: "invalid-agent" } });
          break;
        }
        if (!this.shouldAcceptLifecycleEvent(machineId, agent, msg.type, msg.launchId)) {
          span.end("ok", { attrs: { outcome: "stale-launch" } });
          break;
        }
        try {
          const handled = await agentRuntimeProfileService.markRuntimeProfileMigrationHandled(msg.agentId, msg.migrationKey, msg.launchId || null);
          if (handled) {
            await this.deliverPendingRuntimeProfileMigration(machineId, agent, msg.launchId);
          }
          span.end("ok", { attrs: { outcome: handled ? "handled" : "not-handled" } });
        } catch (err) {
          console.error(`[Machine ${machineId}] Failed to mark runtime profile migration handled ${msg.migrationKey} for ${msg.agentId}:`, err);
          span.end("error", { attrs: { outcome: "handle-failed", error_class: err instanceof Error ? err.name : typeof err } });
        }
        break;
      }

      case "agent:runtime_profile:daemon_release_notice:ack": {
        const span = this.tracer.startSpan("server.runtime_profile.control.inject_ack", {
          parent: parseTraceparent(msg.traceparent),
          surface: "server",
          kind: "consumer",
          attrs: {
            agent_id_present: Boolean(msg.agentId),
            machine_id_present: Boolean(machineId),
            launch_id_present: Boolean(msg.launchId),
            control_kind: "daemon_release_notice",
            key_present: Boolean(msg.noticeKey),
          },
        });
        const agent = await this.validateMachineAgentMessage(machineId, conn?.serverId ?? null, msg.agentId, msg.type);
        if (!agent) {
          span.end("ok", { attrs: { outcome: "invalid-agent" } });
          break;
        }
        if (!this.shouldAcceptLifecycleEvent(machineId, agent, msg.type, msg.launchId)) {
          span.end("ok", { attrs: { outcome: "stale-launch" } });
          break;
        }
        try {
          await agentRuntimeProfileService.markRuntimeProfileMigrationDelivered(msg.agentId, msg.noticeKey, msg.launchId || null);
          span.end("ok", { attrs: { outcome: "delivered" } });
        } catch (err) {
          console.error(`[Machine ${machineId}] Failed to ack runtime profile daemon release notice ${msg.noticeKey} for ${msg.agentId}:`, err);
          span.end("error", { attrs: { outcome: "mark-failed", error_class: err instanceof Error ? err.name : typeof err } });
        }
        break;
      }

      case "agent:deliver:ack": {
        const span = this.tracer.startSpan("server.agent.delivery.ack", {
          parent: parseTraceparent(msg.traceparent),
          surface: "server",
          kind: "server",
          attrs: {
            agent_id_present: Boolean(msg.agentId),
            machine_id_present: Boolean(machineId),
            deliveryId: msg.deliveryId,
            delivery_correlation_id: msg.deliveryId,
            seq: msg.seq,
          },
        });
        span.addEvent("server.ack.received", { seq: msg.seq, deliveryId: msg.deliveryId });
        const ackResult = this.acknowledgeDeliveredMessages(msg.agentId, [msg.seq]);
        if (ackResult.removedCount > 0) {
          span.addEvent("inbox.cleared", { removedCount: ackResult.removedCount });
        } else {
          span.addEvent("inbox.clear.noop");
        }
        span.end("ok", { attrs: { outcome: ackResult.removedCount > 0 ? "cleared-inbox" : "noop" } });
        break;
      }

      case "reminder.fire_attempt": {
        const agent = await this.validateMachineAgentMessage(machineId, conn?.serverId ?? null, msg.agentId, msg.type);
        if (!agent) break;
        try {
          const result = await reminderService.fireReminder(msg.reminderId, msg.version);
          if (!result) {
            // Version mismatch, already fired, already canceled, or unknown id — daemon retry/stale push, no-op.
            break;
          }
          if (!result.fired) {
            // Unsupported recurrence kind — scheduler already skipped + advanced fire_at. No wake.
            break;
          }
          const fired = result.row;
          if (fired.ownerAgentId !== msg.agentId) {
            console.warn(`[Machine ${machineId}] reminder.fire_attempt owner mismatch: reminder ${msg.reminderId} owned by ${fired.ownerAgentId}, got ${msg.agentId}`);
            break;
          }
          this.io?.to(`server:${fired.serverId}`).emit("reminder:fired", {
            reminderId: fired.id,
            ownerAgentId: fired.ownerAgentId,
            firedAt: fired.firedAt?.toISOString() ?? new Date().toISOString(),
            catchup: result.catchup,
            nextFireAt: result.nextFireAt?.toISOString() ?? null,
          });
          await reminderService.deliverFireWake(this.io, this, fired, { catchup: result.catchup });
        } catch (err) {
          console.error(`[Machine ${machineId}] Failed to fire reminder ${msg.reminderId}:`, err);
        }
        break;
      }

      case "reminder.snapshot.request": {
        const agent = await this.validateMachineAgentMessage(machineId, conn?.serverId ?? null, msg.agentId, msg.type);
        if (!agent) break;
        try {
          const rows = await reminderService.getSnapshotForAgent(msg.agentId);
          await this.sendToMachine(machineId, {
            type: "reminder.snapshot",
            agentId: msg.agentId,
            reminders: rows.map(reminderService.toReminderJob),
          });
        } catch (err) {
          console.error(`[Machine ${machineId}] Failed to build reminder snapshot for ${msg.agentId}:`, err);
        }
        break;
      }

      case "agent:workspace:file_tree":
      case "agent:workspace:file_content":
      case "agent:skills:list_result":
      case "machine:workspace:scan_result":
      case "machine:workspace:delete_result":
      case "machine:runtime_models:result":
        // These are responses to workspace/machine requests — emit events for pending promises
        this.emit(`machine:response:${machineId}`, msg);
        break;
    }
  }

  /**
   * Push a reminder to the daemon that owns the agent. Best-effort: if the
   * machine is offline, the daemon will request a snapshot on reconnect.
   */
  async pushReminderUpsert(agentId: string, row: reminderService.ReminderRow): Promise<boolean> {
    const agent = await agentService.getAgent(agentId);
    if (!agent?.machineId) return false;
    return this.sendToMachine(agent.machineId, {
      type: "reminder.upsert",
      agentId,
      reminder: reminderService.toReminderJob(row),
    });
  }

  async pushReminderCancel(agentId: string, reminderId: string, version: number): Promise<boolean> {
    const agent = await agentService.getAgent(agentId);
    if (!agent?.machineId) return false;
    return this.sendToMachine(agent.machineId, {
      type: "reminder.cancel",
      agentId,
      reminderId,
      version,
    });
  }

  private async deliverPendingRuntimeProfileMigration(
    machineId: string,
    agent: CachedAgentState,
    launchId?: string,
  ): Promise<void> {
    await agentRuntimeProfileService.clearRuntimeProfileMigrationForReset(agent.id, launchId || null);

    const notice = await agentRuntimeProfileService.getPendingRuntimeProfileNotice(agent.id);
    if (!notice?.pendingKey) return;
    const span = this.tracer.startSpan("server.runtime_profile.control.delivery", {
      surface: "server",
      kind: "producer",
      attrs: {
        agent_id_present: true,
        machine_id_present: Boolean(machineId),
        launch_id_present: Boolean(agent.expectedLaunchId || launchId),
        control_kind: "daemon_release_notice",
        key_present: true,
        migration_status: notice.migrationStatus,
        pending_kind: notice.pendingKind,
        delivery_reason: "pending",
      },
    });
    const sent = await this.sendToMachine(machineId, {
      type: "agent:runtime_profile:daemon_release_notice",
      agentId: agent.id,
      noticeKey: notice.pendingKey,
      message: agentRuntimeProfileService.renderRuntimeProfileMigrationMessage(notice),
      launchId: agent.expectedLaunchId || launchId,
      traceparent: formatTraceparent(span.context),
    });
    span.end(sent ? "ok" : "error", { attrs: { outcome: sent ? "sent" : "send_failed" } });
  }

  private async maybePiggybackRuntimeProfileMigrationNudge(
    machineId: string,
    agent: CachedAgentState,
    launchId?: string,
    options: { source?: "heartbeat" | "user_path"; nudgeIntervalMs?: number } = {},
  ): Promise<"sent" | "send_failed" | "not_online" | "no_candidate"> {
    const activity = this.agentActivity.get(agent.id);
    if (activity && activity.activity !== "online") return "not_online";

    const pending = await agentRuntimeProfileService.getRuntimeProfileMigrationNudgeCandidate(
      agent.id,
      new Date(this.clock.now()),
      AgentOrchestrator.RUNTIME_PROFILE_MIGRATION_NUDGE_AFTER_MS,
      options.nudgeIntervalMs ?? AgentOrchestrator.RUNTIME_PROFILE_MIGRATION_NUDGE_INTERVAL_MS,
      AgentOrchestrator.RUNTIME_PROFILE_MIGRATION_MAX_NUDGES,
    );
    if (!pending?.pendingKey) return "no_candidate";

    const span = this.tracer.startSpan("server.runtime_profile.control.delivery", {
      surface: "server",
      kind: "producer",
      attrs: {
        agent_id_present: true,
        machine_id_present: Boolean(machineId),
        launch_id_present: Boolean(agent.expectedLaunchId || launchId),
        control_kind: "migration",
        key_present: true,
        migration_status: pending.migrationStatus,
        pending_kind: pending.pendingKind,
        delivery_reason: options.source === "heartbeat" ? "heartbeat_nudge" : "user_path_nudge",
      },
    });
    const sent = await this.sendToMachine(machineId, {
      type: "agent:runtime_profile:migration",
      agentId: agent.id,
      migrationKey: pending.pendingKey,
      message: agentRuntimeProfileService.renderRuntimeProfileMigrationNudgeMessage(pending),
      launchId: agent.expectedLaunchId || launchId,
      traceparent: formatTraceparent(span.context),
    });
    if (sent) {
      await agentRuntimeProfileService.markRuntimeProfileMigrationNudged(agent.id, pending.pendingKey);
      if (options.source === "heartbeat") {
        this.runtimeProfileHeartbeatNudgeSentAt.set(this.runtimeProfileHeartbeatNudgeKey(machineId, agent.id), this.clock.now());
      }
      span.end("ok", { attrs: { outcome: "sent" } });
      return "sent";
    }
    span.end("error", { attrs: { outcome: "send_failed" } });
    return "send_failed";
  }

  private async maybePiggybackRuntimeProfileMigrationNudgesForMachine(machineId: string): Promise<void> {
    const activeAgents = [...this.agentStateCache.values()]
      .filter((agent) => agent.machineId === machineId && agent.status === "active");
    if (activeAgents.length === 0) return;

    const disabled = readBooleanEnv("SLOCK_DISABLE_MIGRATION_NUDGE_PIGGYBACK");
    const cooldownMs = readPositiveIntegerEnv(
      "SLOCK_MIGRATION_NUDGE_PIGGYBACK_COOLDOWN_MS",
      AgentOrchestrator.RUNTIME_PROFILE_HEARTBEAT_NUDGE_COOLDOWN_MS,
    );
    const now = this.clock.now();
    let activeAgentsCount = 0;
    let disabledCount = 0;
    let cooldownCount = 0;
    let sentCount = 0;
    let sendFailedCount = 0;
    let noCandidateCount = 0;
    let notOnlineCount = 0;

    try {
      for (const agent of activeAgents) {
        activeAgentsCount += 1;
        const action = planRuntimeProfileHeartbeatNudgeAction({
          disabled,
          lastSentAt: this.runtimeProfileHeartbeatNudgeSentAt.get(this.runtimeProfileHeartbeatNudgeKey(machineId, agent.id)) ?? null,
          now,
          cooldownMs,
        });
        if (action === "disabled") {
          disabledCount += 1;
          continue;
        }
        if (action === "cooldown") {
          cooldownCount += 1;
          continue;
        }
        const outcome = await this.maybePiggybackRuntimeProfileMigrationNudge(machineId, agent, undefined, {
          source: "heartbeat",
          nudgeIntervalMs: cooldownMs,
        });
        if (outcome === "sent") sentCount += 1;
        if (outcome === "send_failed") sendFailedCount += 1;
        if (outcome === "no_candidate") noCandidateCount += 1;
        if (outcome === "not_online") notOnlineCount += 1;
      }
      if (disabled || sentCount > 0 || sendFailedCount > 0) {
        this.tracer.startSpan("server.runtime_profile.heartbeat_nudge.scan", {
          surface: "server",
          kind: "internal",
          attrs: {
            machine_id_present: Boolean(machineId),
            disabled,
            cooldown_ms: cooldownMs,
            active_agents_count: activeAgentsCount,
            disabled_count: disabledCount,
            cooldown_count: cooldownCount,
            sent_count: sentCount,
            send_failed_count: sendFailedCount,
            no_candidate_count: noCandidateCount,
            not_online_count: notOnlineCount,
          },
        }).end("ok");
      }
    } catch (err) {
      this.tracer.startSpan("server.runtime_profile.heartbeat_nudge.scan", {
        surface: "server",
        kind: "internal",
        attrs: {
          machine_id_present: Boolean(machineId),
          disabled,
          cooldown_ms: cooldownMs,
          active_agents_count: activeAgentsCount,
          disabled_count: disabledCount,
          cooldown_count: cooldownCount,
          sent_count: sentCount,
          send_failed_count: sendFailedCount,
          no_candidate_count: noCandidateCount,
          not_online_count: notOnlineCount,
          error_class: err instanceof Error ? err.name : typeof err,
        },
      }).end("error");
      throw err;
    }
  }

  private runtimeProfileHeartbeatNudgeKey(machineId: string, agentId: string): string {
    return `${machineId}:${agentId}`;
  }

  async completeRuntimeProfileMigrationFromAgent(
    agentId: string,
    migrationKey: string,
    launchId?: string | null,
  ): Promise<boolean> {
    const span = this.tracer.startSpan("server.runtime_profile.migration_done", {
      surface: "server",
      kind: "server",
      attrs: {
        agent_id_present: Boolean(agentId),
        key_present: Boolean(migrationKey),
        launch_id_present: Boolean(launchId),
        source: "tool",
      },
    });
    const agent = await this.getCachedAgent(agentId);
    if (!agent?.machineId) {
      span.end("ok", { attrs: { outcome: "missing-agent-or-machine" } });
      return false;
    }
    if (!this.shouldAcceptLifecycleEvent(agent.machineId, agent, "agent:runtime_profile:migration_done", launchId || undefined)) {
      span.end("ok", { attrs: { outcome: "stale-launch" } });
      return false;
    }
    let handled = false;
    try {
      handled = await agentRuntimeProfileService.markRuntimeProfileMigrationHandled(
        agentId,
        migrationKey,
        launchId || null,
      );
      if (handled) {
        await this.deliverPendingRuntimeProfileMigration(agent.machineId, agent, launchId || undefined);
      }
    } catch (err) {
      span.end("error", { attrs: { outcome: "handle-failed", error_class: err instanceof Error ? err.name : typeof err } });
      throw err;
    }
    span.end("ok", { attrs: { outcome: handled ? "handled" : "not-handled" } });
    return handled;
  }

  private async flushRuntimeProfileGatedInbox(
    machineId: string,
    agent: CachedAgentState,
  ): Promise<void> {
    const inbox = this.agentInboxes.get(agent.id);
    if (!inbox || inbox.inbox.length === 0) return;
    const oldestMessageAgeMs = oldestInboxMessageAgeMs(inbox.inbox, this.clock.now());
    const span = this.tracer.startSpan("server.runtime_profile.gated_inbox.flush", {
      surface: "server",
      kind: "producer",
      attrs: {
        agent_id_present: Boolean(agent.id),
        machine_id_present: Boolean(machineId),
        inbox_count: inbox.inbox.length,
        oldest_message_age_ms: oldestMessageAgeMs,
        oldest_message_age_bucket: durationMsBucket(oldestMessageAgeMs),
      },
    });
    let sentCount = 0;
    let sendFailedCount = 0;
    for (const message of [...inbox.inbox]) {
      const deliveryId = crypto.randomUUID();
      const sent = await this.sendToMachine(machineId, {
        type: "agent:deliver",
        agentId: agent.id,
        message,
        seq: message.seq ?? 0,
        deliveryId,
        traceparent: formatTraceparent(span.context),
      });
      if (sent) {
        sentCount += 1;
      } else {
        sendFailedCount += 1;
      }
    }
    span.end(sendFailedCount > 0 ? "error" : "ok", {
      attrs: {
        sent_count: sentCount,
        send_failed_count: sendFailedCount,
        outcome: sendFailedCount > 0 ? "partial_failure" : "sent",
      },
    });
  }

  /** Messages that are expected to fail silently (fire-and-forget during deploy transitions) */
  private static SILENT_SEND_TYPES = new Set(["ping", "agent:stop"]);

  protected getRoutableLocalMachineIds(): Set<string> {
    const localIds = new Set<string>();
    for (const [machineId, conn] of this.machineConnections.entries()) {
      if (conn.ws.readyState === 1) {
        localIds.add(machineId);
      }
    }
    return localIds;
  }

  protected async routeMachineCommandCrossReplica(
    machineId: string,
    msg: ServerToMachineMessage,
    localMachineIds: Set<string>,
  ): Promise<boolean> {
    return routeMachineCommand(machineId, msg, localMachineIds);
  }

  protected async routeInboxDeliveryCrossReplica(
    agentId: string,
    machineId: string,
    message: AgentMessage,
    localMachineIds: Set<string>,
  ): Promise<boolean> {
    return routeInboxDelivery(agentId, machineId, message, localMachineIds);
  }

  protected async sendToMachine(machineId: string, msg: ServerToMachineMessage): Promise<boolean> {
    const dispatch = async (): Promise<boolean> => {
      const conn = this.machineConnections.get(machineId);
      const hasReadyLocalConnection = Boolean(conn && conn.ws.readyState === 1);
      const action = planSendToMachineAction({
        hasReadyLocalConnection,
        canReroute: this.replicaStateStore.isAvailable(),
      });
      return this.applySendToMachineAction({
        action,
        machineId,
        msg,
        sendLocally: () => {
          if (!conn) return false;
          conn.ws.send(JSON.stringify(msg));
          return true;
        },
        reroute: () => this.routeMachineCommandCrossReplica(
          machineId,
          msg,
          this.getRoutableLocalMachineIds(),
        ),
      });
    };

    if (!failpoints.enabled) {
      return dispatch();
    }

    const result = await failpoints.hit<boolean>(
      "server.agentOrchestrator.sendToMachine.dispatch",
      { machineId, msgType: msg.type },
      dispatch,
    );
    return result ?? false;
  }

  protected async applySendToMachineAction(context: SendToMachineApplyContext): Promise<boolean> {
    if (context.action === "send-locally") {
      return context.sendLocally();
    }

    if (context.action === "reroute-then-warn") {
      try {
        const routed = await context.reroute();
        if (routed) return true;
      } catch (err: any) {
        console.error(`[ReplicaRouter] Failed to route to machine ${context.machineId}:`, err.message);
      }
    }

    if (!AgentOrchestrator.SILENT_SEND_TYPES.has(context.msg.type)) {
      console.warn(`[Machine ${context.machineId}] sendToMachine: no connection found (msg: ${context.msg.type})`);
    }
    return false;
  }

  protected async sendRequiredToMachine(
    machineId: string,
    msg: ServerToMachineMessage,
    offlineMessage = "Machine WebSocket not ready",
  ): Promise<void> {
    const sent = await this.sendToMachine(machineId, msg);
    if (!sent) {
      throw new Error(offlineMessage);
    }
  }

  protected sendBestEffortToMachine(machineId: string, msg: ServerToMachineMessage, errorContext: string): void {
    void this.sendToMachine(machineId, msg).catch((err) => {
      console.warn(`[Machine ${machineId}] ${errorContext}:`, err);
    });
  }

  protected async resolveRoutedMachineOwnership(
    machineId: string,
    localMachineIds: Set<string>,
    handleLocally: () => boolean | Promise<boolean>,
    rerouteToCurrentOwner: () => Promise<boolean>,
    fallback: () => boolean | Promise<boolean>,
  ): Promise<boolean> {
    const action = planRoutedOwnershipAction({
      machineIsLocal: localMachineIds.has(machineId),
      canReroute: this.replicaStateStore.isAvailable(),
    });

    return this.applyRoutedOwnershipAction({
      action,
      handleLocally,
      rerouteToCurrentOwner,
      fallback,
    });
  }

  protected async applyRoutedOwnershipAction(context: RoutedOwnershipApplyContext): Promise<boolean> {
    if (context.action === "handle-locally") {
      return await context.handleLocally();
    }

    if (context.action === "reroute-then-fallback") {
      const rerouted = await context.rerouteToCurrentOwner();
      if (rerouted) {
        return true;
      }
    }

    return await context.fallback();
  }

  /** Send directly to a local machine connection (used by ReplicaRouter callback) */
  sendToLocalMachine(machineId: string, msg: ServerToMachineMessage): boolean {
    const conn = this.machineConnections.get(machineId);
    if (!conn || conn.ws.readyState !== 1) return false;
    conn.ws.send(JSON.stringify(msg));
    return true;
  }

  async handleRoutedMachineCommand(machineId: string, msg: ServerToMachineMessage): Promise<boolean> {
    const localMachineIds = this.getRoutableLocalMachineIds();
    return this.resolveRoutedMachineOwnership(
      machineId,
      localMachineIds,
      () => this.handleLocalRoutedMachineCommand(machineId, msg),
      () => this.routeMachineCommandCrossReplica(machineId, msg, localMachineIds),
      () => false,
    );
  }

  private async handleLocalRoutedMachineCommand(machineId: string, msg: ServerToMachineMessage): Promise<boolean> {
    if (msg.type === "agent:deliver" && await this.maybeWakeForRoutedAgentDeliver(machineId, msg)) {
      return true;
    }

    return this.sendToLocalMachine(machineId, msg);
  }

  private async maybeWakeForRoutedAgentDeliver(
    machineId: string,
    msg: Extract<ServerToMachineMessage, { type: "agent:deliver" }>,
  ): Promise<boolean> {
    const agent = await this.getAuthoritativeAgentForDelivery(msg.agentId);
    if (!agent || agent.machineId !== machineId) {
      return false;
    }

    const wakeInput = await this.loadWakePlanInput(msg.agentId, agent.status);
    const action = planWakeAction(wakeInput);
    if (action === "deliver-directly") {
      return false;
    }
    if (action === "suppress-control-gate") {
      this.deliverToLocalInbox(msg.agentId, msg.message, { notifyPendingReceive: false });
      await this.maybePiggybackRuntimeProfileMigrationNudge(machineId, agent);
      return true;
    }

    await this.applyWakeAction({
      agentId: msg.agentId,
      machineId: agent.machineId,
      previousStatus: agent.status,
      resetMode: wakeInput.state.resetMode,
    }, msg.message, action);
    return true;
  }

  async handleRoutedInboxDelivery(agentId: string, machineId: string | null, message: AgentMessage): Promise<boolean> {
    const agent = await this.getCachedAgent(agentId);
    if (!agent || agent.status !== "active" || !agent.machineId) {
      return true;
    }

    // Old routed payloads may not carry machineId; use current cached ownership as
    // the contract anchor so mixed-version server windows still route correctly.
    const targetMachineId = agent.machineId;
    const localMachineIds = this.getRoutableLocalMachineIds();
    return this.resolveRoutedMachineOwnership(
      targetMachineId,
      localMachineIds,
      () => this.deliverToLocalInboxIfStillActive(agentId, targetMachineId, message),
      () => this.routeInboxDeliveryCrossReplica(agentId, targetMachineId, message, localMachineIds),
      () => this.deliverToLocalInboxIfStillActive(agentId, targetMachineId, message),
    );
  }

  /**
   * Validate that an incoming machine-originated agent event actually belongs to
   * the machine/server that sent it. This prevents a buggy or compromised daemon
   * from overwriting another agent's activity/status/trajectory.
   */
  private async validateMachineAgentMessage(
    machineId: string,
    serverId: string | null,
    agentId: string,
    messageType: string
  ): Promise<CachedAgentState | null> {
    const result = await this.validateMachineAgentMessageWithReason(machineId, serverId, agentId, messageType);
    return result.agent;
  }

  private async validateMachineAgentMessageWithReason(
    machineId: string,
    serverId: string | null,
    agentId: string,
    messageType: string
  ): Promise<MachineAgentValidationResult> {
    if (!serverId) {
      console.warn(`[Machine ${machineId}] Dropping ${messageType} for agent ${agentId}: missing server context`);
      return { agent: null, dropReason: "missing_server_context" };
    }

    const agent = await this.getCachedAgent(agentId);
    if (!agent) {
      console.warn(`[Machine ${machineId}] Dropping ${messageType} for unknown agent ${agentId}`);
      return { agent: null, dropReason: "unknown_agent" };
    }

    if (agent.machineId !== machineId || agent.serverId !== serverId) {
      console.warn(
        `[Machine ${machineId}] Dropping ${messageType} for agent ${agentId}: ` +
        `expected machine=${agent.machineId ?? "null"} server=${agent.serverId}, got machine=${machineId} server=${serverId}`
      );
      return { agent: null, dropReason: "machine_or_server_mismatch" };
    }

    return { agent, dropReason: null };
  }

  private async getMachineForAgent(agentId: string): Promise<{ machineId: string; conn: MachineConnection } | null> {
    const agent = await agentService.getAgent(agentId);
    if (!agent?.machineId) return null;
    const conn = this.machineConnections.get(agent.machineId);
    if (!conn) return null;
    return { machineId: agent.machineId, conn };
  }

  // Agent lifecycle

  protected async loadAgentForStart(agentId: string) {
    return agentService.getAgent(agentId);
  }

  protected async resetPersistedAgentSession(agentId: string) {
    await agentService.resetAgentSession(agentId);
  }

  private releaseWakeLock(agentId: string) {
    if (!this.replicaStateStore.isAvailable()) return;
    this.replicaStateStore.releaseWakeLock(agentId).catch(() => {});
  }

  private clearAgentInbox(agentId: string): boolean {
    const inbox = this.agentInboxes.get(agentId);
    let resolvedPendingReceive = false;
    if (inbox?.pendingReceive) {
      clearTimeout(inbox.pendingReceive.timer);
      inbox.pendingReceive.resolve([]);
      resolvedPendingReceive = true;
    }
    this.agentInboxes.delete(agentId);
    return resolvedPendingReceive;
  }

  protected getResetMode(agentId: string): "restart" | "session" | "full" | null {
    return this.resetInProgress.get(agentId) ?? null;
  }

  private async loadWakePlanInput(agentId: string, status: AgentStatus): Promise<WakePlanInput> {
    // TODO(lifecycle-v2/state-snapshot): delivery wake planning currently
    // builds a minimal in-memory state from DB status, reset state, and
    // runtime-profile gate. If machine reachability becomes authoritative for
    // delivery wake decisions, extend this builder to read the machine owner/
    // connection state instead of leaving reachability as "unknown".
    return {
      state: buildAgentLifecycleStateSnapshot({
        controlGate: await agentRuntimeProfileService.isRuntimeProfileMigrationGated(agentId)
          ? "runtime_profile_migration"
          : "open",
        dbStatus: status,
        resetMode: this.getResetMode(agentId),
        runtimeState: this.agentStateCache.get(agentId)?.runtimeState,
      }),
    };
  }

  async startAgent(agentId: string, options: StartAgentOptions = {}) {
    const { resumePrompt, wakeMessage } = options;
    // Load from DB (and populate cache) for start — need full state
    const agent = await this.loadAgentForStart(agentId);
    const startCause = wakeMessage ? "message" : resumePrompt ? "resume" : "manual";
    if (!agent) {
      this.recordLifecycleEvent({
        agentId,
        machineId: null,
        action: "start",
        outcome: "failed",
        cause: startCause,
        detail: "agent_not_found",
      });
      throw new Error(`Agent ${agentId} not found`);
    }
    const previousStatus = narrowPersistedAgentStatus(agent.status);
    if (!previousStatus) {
      console.warn(
        `[Agent ${agentId}] Invalid persisted agent status ${JSON.stringify(agent.status)} before start; failing closed`,
      );
    }
    if (wakeMessage && previousStatus === "stopped") {
      this.updateCache(agentId, { status: "stopped" });
      this.recordLifecycleEvent({
        agentId,
        machineId: agent.machineId,
        action: "wake",
        outcome: "suppressed",
        cause: "message",
        previousStatus,
      });
      return;
    }
    const rollbackStatus = previousStatus ?? "inactive";

    if (!agent.machineId) {
      this.recordLifecycleEvent({
        agentId,
        machineId: null,
        action: "start",
        outcome: "failed",
        cause: startCause,
        previousStatus,
        detail: "machine_unassigned",
      });
      throw new Error("No machine assigned. Please assign a machine to this agent first.");
    }

    let wakeLockHeld = false;
    if (this.replicaStateStore.isAvailable()) {
      wakeLockHeld = await this.replicaStateStore.acquireWakeLock(agentId);
      if (!wakeLockHeld) {
        this.recordLifecycleEvent({
          agentId,
          machineId: agent.machineId,
          action: "start",
          outcome: "skipped",
          cause: startCause,
          previousStatus,
          detail: "wake_lock_held",
        });
        console.log(`[Agent ${agentId}] Start skipped: wake lock held on another replica`);
        return;
      }
    }

    // Populate/refresh cache
    const normalizedRuntimeConfig = hydrateRuntimeConfig(agent);
    const launchRuntimeFields = runtimeConfigToLaunchFields(normalizedRuntimeConfig);
    const state: CachedAgentState = {
      id: agent.id,
      status: "active",
      machineId: agent.machineId,
      sessionId: agent.sessionId,
      expectedLaunchId: null,
      launchGuardMode: "legacy",
      serverId: agent.serverId,
      name: agent.name,
      displayName: agent.displayName,
      description: agent.description,
      model: launchRuntimeFields.model,
      runtime: launchRuntimeFields.runtime,
      runtimeConfig: normalizedRuntimeConfig,
      runtimeState: "starting",
      reasoningEffort: launchRuntimeFields.reasoningEffort,
      envVars: launchRuntimeFields.envVars,
    };
    this.agentStateCache.set(agentId, state);

    const machine = agent.machineId ? await this.loadRuntimeContextMachine(agent.machineId) : null;
    const daemonVersion = agent.machineId ? this.getMachineDaemonVersion(agent.machineId) : null;
    const config: AgentConfig = {
      name: agent.name,
      displayName: agent.displayName,
      description: agent.description,
      model: launchRuntimeFields.model,
      runtime: launchRuntimeFields.runtime,
      runtimeConfig: normalizedRuntimeConfig,
      reasoningEffort: launchRuntimeFields.reasoningEffort,
      executionMode: agent.executionMode,
      envVars: launchRuntimeFields.envVars,
      sessionId: agent.sessionId,
      serverUrl: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3001}`,
      authToken: "", // Daemon will use its own API key
      runtimeContext: {
        agentId: agent.id,
        serverId: agent.serverId,
        machineId: agent.machineId,
        machineName: machine?.name ?? null,
        machineHostname: machine?.hostname ?? null,
        machineOs: machine?.os ?? null,
        daemonVersion,
        workspacePath: null,
      },
    };
    const runtimeProfileControl = await agentRuntimeProfileService.getPendingRuntimeProfileControl(agentId);
    if (runtimeProfileControl) {
      config.runtimeProfileControl = runtimeProfileControl;
    }

    // Query unread counts so the agent knows to catch up via read_history on resume
    let unreadSummary: Record<string, number> | undefined;
    if (agent.sessionId) {
      try {
        const plan = await getServerPlan(agent.serverId);
        const historyCutoff = getHistoryCutoff(plan);
        const counts = await channelService.getAgentUnreadCounts(agentId, historyCutoff);
        if (Object.keys(counts).length > 0) unreadSummary = counts;
      } catch { /* non-critical */ }
    }

    // Only set launch guard if the daemon supports it (>= 0.30.1).
    // Old daemons ignore the launchId field and never echo it back,
    // which causes all their lifecycle events to be silently dropped.
    const launchId = this.prepareStartLaunchGuard(agentId, agent.machineId);
    try {
      await this.sendRequiredToMachine(agent.machineId, {
        type: "agent:start",
        agentId,
        config,
        wakeMessage,
        unreadSummary,
        resumePrompt,
        launchId,
      }, "Machine offline. Please start your local daemon.");
    } catch (err) {
      this.updateCache(agentId, { status: rollbackStatus });
      this.rollbackStartLaunchGuard(agentId, launchId);
      if (wakeLockHeld) this.releaseWakeLock(agentId);
      this.recordLifecycleEvent({
        agentId,
        machineId: agent.machineId,
        action: "start",
        outcome: "failed",
        cause: startCause,
        previousStatus,
        detail: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }

    // Init inbox
    if (!this.agentInboxes.has(agentId)) {
      this.agentInboxes.set(agentId, { inbox: [], pendingReceive: null });
    }

    // TODO(lifecycle-v2/server-producer): manual/lazy/resume start is
    // server-owned. Construct the canonical runtime_spawned event at the start
    // planner boundary (or make the planner return it) and remove this legacy
    // action adapter once start no longer flows through the compatibility layer.
    const { event } = adaptStartLifecycleEvent({
      serverId: agent.serverId,
      agentId,
      machineId: agent.machineId,
      launchId,
      previousStatus,
      startCause,
      now: () => new Date(this.clock.now()),
    });
    const span = this.tracer.startSpan("server.agent.lifecycle.start.apply", {
      surface: "server",
      kind: "internal",
      attrs: {
        agent_id_present: Boolean(agentId),
        machine_id_present: Boolean(agent.machineId),
        previous_status: previousStatus ?? null,
        start_cause: startCause,
      },
    });
    try {
      await applyAgentLifecycleProjectionPlan(
        reduceStartLifecycle({
          event,
          state: buildAgentLifecycleStateSnapshot({
            dbStatus: previousStatus ?? agent.status,
            intentState: "running_allowed",
            launchId,
            machineId: agent.machineId,
            machineReachability: agent.machineId ? "reachable" : "unknown",
            runtimeState: "starting",
          }),
        }),
        this.lifecycleProjectionWriterDeps(),
        span,
      );
      this.recordLifecycleEvent({
        agentId,
        machineId: agent.machineId,
        action: "start",
        outcome: "completed",
        cause: startCause,
        previousStatus,
        nextStatus: "active",
      });
      span.end("ok", { attrs: { outcome: "applied" } });
    } catch (err) {
      span.end("error", { attrs: { error_class: err instanceof Error ? err.name : typeof err } });
      throw err;
    }
  }

  async stopAgent(agentId: string, reason: StopAgentReason = "manual") {
    const agent = await this.getCachedAgent(agentId);
    if (!agent) return;
    const previousStatus = agent.status;
    const action = planStopAction({ reason });
    const nextStatus: AgentStatus = action === "persist-stopped" ? "stopped" : "inactive";
    const context: StopApplyContext = {
      agentId,
      serverId: agent.serverId,
      machineId: agent.machineId,
      reason,
      previousStatus,
      nextStatus,
    };

    await this.applyStopAction(context);
  }

  protected async applyStopAction(context: StopApplyContext) {
    const correlationId = this.makeLifecycleCorrelationId(
      "agent",
      context.agentId,
      "stop",
      context.reason,
      crypto.randomUUID(),
    );
    // TODO(lifecycle-v2/server-producer): stop is server-owned. Have the stop
    // planner emit canonical manual_stop_requested/runtime_interrupted events
    // with the stop correlation id and reason, then delete this adapter call.
    const { event } = adaptStopLifecycleEvent({
      serverId: context.serverId,
      agentId: context.agentId,
      machineId: context.machineId,
      reason: context.reason,
      previousStatus: context.previousStatus,
      nextStatus: context.nextStatus,
      stopCorrelationId: correlationId,
      now: () => new Date(this.clock.now()),
    });
    const activityDedupeKey = this.makeLifecycleDedupeKey("agent", context.agentId, "stop", correlationId);
    const span = this.tracer.startSpan("server.agent.lifecycle.stop.apply", {
      surface: "server",
      kind: "internal",
      attrs: {
        agent_id_present: Boolean(context.agentId),
        machine_id_present: Boolean(context.machineId),
        reason: context.reason,
        previous_status: context.previousStatus,
        next_status: context.nextStatus,
      },
    });
    try {
      const result = await applyAgentLifecycleProjectionPlan(
        reduceStopLifecycle({
          activityDedupeKey,
          event,
          nextStatus: context.nextStatus,
          state: buildAgentLifecycleStateSnapshot({
            dbStatus: context.previousStatus,
            intentState: context.nextStatus === "stopped" ? "manual_stopped" : "running_allowed",
            machineId: context.machineId,
            machineReachability: context.machineId ? "reachable" : "unknown",
            runtimeState: "not_running",
          }),
        }),
        this.lifecycleProjectionWriterDeps(),
        span,
      );
      this.recordLifecycleEvent({
        agentId: context.agentId,
        machineId: context.machineId,
        action: "stop",
        outcome: "completed",
        cause: context.reason,
        previousStatus: context.previousStatus,
        nextStatus: context.nextStatus,
      });
      span.end("ok", { attrs: { outcome: "applied", stop_sent: result.stopSent ?? false } });
    } catch (err) {
      span.end("error", { attrs: { error_class: err instanceof Error ? err.name : typeof err } });
      throw err;
    }
  }

  async resetAgent(
    agentId: string,
    mode: "restart" | "session" | "full",
    options: { restartEvenIfInactive?: boolean } = {},
  ) {
    if (this.resetInProgress.has(agentId)) {
      this.recordLifecycleEvent({
        agentId,
        machineId: null,
        action: "reset",
        outcome: "skipped",
        cause: mode,
        detail: "reset_in_progress",
      });
      return;
    }
    this.resetInProgress.set(agentId, mode);
    try {
      // Get machine info before stopping (cache may be populated)
      const agentBefore = await this.getCachedAgent(agentId);
      const previousStatus = agentBefore?.status ?? null;
      const shouldRestart = (options.restartEvenIfInactive ?? true) || agentBefore?.status === "active";
      const plan = planResetActions({
        mode,
        hasMachine: Boolean(agentBefore?.machineId),
        restart: shouldRestart,
      });
      const context: ResetApplyContext = {
        agentId,
        mode,
        previousStatus,
        machineId: agentBefore?.machineId ?? null,
      };
      this.recordLifecycleEvent({
        agentId,
        machineId: agentBefore?.machineId ?? null,
        action: "reset",
        outcome: "attempted",
        cause: mode,
        previousStatus,
      });
      await this.applyResetPlan(context, plan);
    } finally {
      this.resetInProgress.delete(agentId);
    }
  }

  protected async applyResetPlan(context: ResetApplyContext, plan: ResetPlanAction[]) {
    if (plan.includes("stop-internal")) {
      await this.stopAgent(context.agentId, "internal");
    }

    if (plan.includes("clear-session")) {
      await this.resetPersistedAgentSession(context.agentId);
      this.updateCache(context.agentId, { sessionId: null, status: "inactive" });
      this.clearLaunchGuard(context.agentId);
    }

    if (plan.includes("reset-workspace") && context.machineId) {
      this.sendBestEffortToMachine(
        context.machineId,
        { type: "agent:reset-workspace", agentId: context.agentId },
        `best-effort reset-workspace send failed for agent ${context.agentId}`,
      );
    }

    // Some caller-driven resets only need to clear session state; restart remains explicit in the plan.
    if (!plan.includes("restart")) return;

    try {
      await this.startAgent(context.agentId);
      const restarted = await this.getCachedAgent(context.agentId);
      this.recordLifecycleEvent({
        agentId: context.agentId,
        machineId: restarted?.machineId ?? context.machineId,
        action: "reset",
        outcome: "completed",
        cause: context.mode,
        previousStatus: context.previousStatus,
        nextStatus: restarted?.status ?? "active",
      });
    } catch {
      // If restart fails (e.g. no machine), agent stays offline — that's fine.
      const failed = await this.getCachedAgent(context.agentId);
      this.recordLifecycleEvent({
        agentId: context.agentId,
        machineId: failed?.machineId ?? context.machineId,
        action: "reset",
        outcome: "failed",
        cause: context.mode,
        previousStatus: context.previousStatus,
        nextStatus: failed?.status ?? null,
      });
    }
  }

  // Agent workspace file browsing

  async getAgentFileTree(agentId: string, dirPath?: string): Promise<FileNode[]> {
    const result = await this.getMachineForAgent(agentId);
    if (!result) throw new Error("Agent has no connected machine");
    const { machineId } = result;

    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        this.removeListener(`machine:response:${machineId}`, handler);
        reject(new Error("File tree request timed out"));
      }, 15_000);

      const handler = (msg: MachineToServerMessage) => {
        if (msg.type === "agent:workspace:file_tree" && msg.agentId === agentId && msg.dirPath === dirPath) {
          clearTimeout(timeout);
          this.removeListener(`machine:response:${machineId}`, handler);
          resolve(msg.files);
        }
      };

      this.on(`machine:response:${machineId}`, handler);

      try {
        await this.sendRequiredToMachine(machineId, { type: "agent:workspace:list", agentId, dirPath });
      } catch {
        clearTimeout(timeout);
        this.removeListener(`machine:response:${machineId}`, handler);
        reject(new Error("Failed to send request — machine WebSocket not ready"));
      }
    });
  }

  async detectMachineRuntimeModels(machineId: string, runtime: string): Promise<{ models: RuntimeModelInfo[]; default?: string }> {
    const requestId = crypto.randomUUID();

    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        this.removeListener(`machine:response:${machineId}`, handler);
        reject(new Error("Runtime model detect request timed out"));
      }, 5_000);

      const handler = (msg: MachineToServerMessage) => {
        if (msg.type === "machine:runtime_models:result" && msg.requestId === requestId) {
          clearTimeout(timeout);
          this.removeListener(`machine:response:${machineId}`, handler);
          if (msg.error) {
            reject(new Error(msg.error));
          } else {
            resolve({ models: msg.models ?? [], default: msg.default });
          }
        }
      };

      this.on(`machine:response:${machineId}`, handler);

      try {
        await this.sendRequiredToMachine(machineId, { type: "machine:runtime_models:detect", requestId, runtime });
      } catch {
        clearTimeout(timeout);
        this.removeListener(`machine:response:${machineId}`, handler);
        reject(new Error("Failed to send request — machine WebSocket not ready"));
      }
    });
  }

  async readAgentFile(agentId: string, filePath: string): Promise<{ content: string | null; binary: boolean; size: number; mimeType?: string; encoding?: "utf-8" | "base64" }> {
    const result = await this.getMachineForAgent(agentId);
    if (!result) throw new Error("Agent has no connected machine");
    const { machineId } = result;

    const requestId = crypto.randomUUID();

    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        this.removeListener(`machine:response:${machineId}`, handler);
        reject(new Error("File read request timed out"));
      }, 15_000);

      const handler = (msg: MachineToServerMessage) => {
        if (msg.type === "agent:workspace:file_content" && msg.agentId === agentId && msg.requestId === requestId) {
          clearTimeout(timeout);
          this.removeListener(`machine:response:${machineId}`, handler);
          resolve({
            content: msg.content,
            binary: msg.binary,
            size: msg.size ?? (msg.content ? Buffer.byteLength(msg.content, msg.encoding === "base64" ? "base64" : "utf-8") : 0),
            mimeType: msg.mimeType,
            encoding: msg.encoding,
          });
        }
      };

      this.on(`machine:response:${machineId}`, handler);

      try {
        await this.sendRequiredToMachine(machineId, { type: "agent:workspace:read", agentId, path: filePath, requestId });
      } catch {
        clearTimeout(timeout);
        this.removeListener(`machine:response:${machineId}`, handler);
        reject(new Error("Failed to send request — machine WebSocket not ready"));
      }
    });
  }

  // Agent skills listing

  async getAgentSkills(agentId: string, runtime?: string): Promise<{ global: SkillInfo[]; workspace: SkillInfo[] }> {
    const result = await this.getMachineForAgent(agentId);
    if (!result) throw new Error("Agent has no connected machine");
    const { machineId } = result;

    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        this.removeListener(`machine:response:${machineId}`, handler);
        reject(new Error("Skills list request timed out"));
      }, 15_000);

      const handler = (msg: MachineToServerMessage) => {
        if (msg.type === "agent:skills:list_result" && msg.agentId === agentId) {
          clearTimeout(timeout);
          this.removeListener(`machine:response:${machineId}`, handler);
          resolve({ global: msg.global, workspace: msg.workspace });
        }
      };

      this.on(`machine:response:${machineId}`, handler);

      try {
        await this.sendRequiredToMachine(machineId, { type: "agent:skills:list", agentId, runtime });
      } catch {
        clearTimeout(timeout);
        this.removeListener(`machine:response:${machineId}`, handler);
        reject(new Error("Failed to send request — machine WebSocket not ready"));
      }
    });
  }

  // Machine workspace scanning

  async scanMachineWorkspaces(machineId: string): Promise<WorkspaceDirectoryInfo[]> {
    const conn = this.machineConnections.get(machineId);
    if (!conn || conn.ws.readyState !== 1) {
      throw new Error("Machine is not connected");
    }

    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        this.removeListener(`machine:response:${machineId}`, handler);
        reject(new Error("Workspace scan timed out"));
      }, 15_000);

      const handler = (msg: MachineToServerMessage) => {
        if (msg.type === "machine:workspace:scan_result") {
          clearTimeout(timeout);
          this.removeListener(`machine:response:${machineId}`, handler);
          resolve(msg.directories);
        }
      };

      this.on(`machine:response:${machineId}`, handler);
      try {
        await this.sendRequiredToMachine(machineId, { type: "machine:workspace:scan" });
      } catch {
        clearTimeout(timeout);
        this.removeListener(`machine:response:${machineId}`, handler);
        reject(new Error("Failed to send request — machine WebSocket not ready"));
      }
    });
  }

  async deleteMachineWorkspaceDir(machineId: string, directoryName: string): Promise<boolean> {
    const conn = this.machineConnections.get(machineId);
    if (!conn || conn.ws.readyState !== 1) {
      throw new Error("Machine is not connected");
    }

    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        this.removeListener(`machine:response:${machineId}`, handler);
        reject(new Error("Delete timed out"));
      }, 15_000);

      const handler = (msg: MachineToServerMessage) => {
        if (msg.type === "machine:workspace:delete_result" && msg.directoryName === directoryName) {
          clearTimeout(timeout);
          this.removeListener(`machine:response:${machineId}`, handler);
          resolve(msg.success);
        }
      };

      this.on(`machine:response:${machineId}`, handler);
      try {
        await this.sendRequiredToMachine(machineId, { type: "machine:workspace:delete", directoryName });
      } catch {
        clearTimeout(timeout);
        this.removeListener(`machine:response:${machineId}`, handler);
        reject(new Error("Failed to send request — machine WebSocket not ready"));
      }
    });
  }

  async deliverMessage(agentId: string, message: AgentMessage, options: DeliverMessageOptions = {}) {
    const agent = await this.getAuthoritativeAgentForDelivery(agentId);
    if (!agent) return;
    // Passive scope gate — see DeliverMessageOptions.intrinsic. We drop
    // silently here rather than enqueue: a revoked agent should not see
    // historical channel traffic when the scope is later restored. The
    // server-side audit trail lives on the scope toggle itself
    // (revision + updatedAt + updatedByUserId on `agent_scopes`).
    if (!options.intrinsic && !options.adminAuthority) {
      const allowed = await this.hasPassiveDeliveryScope(agentId).catch(() => false);
      if (!allowed) return;
    }
    const wakeInput = await this.loadWakePlanInput(agentId, agent.status);
    const action = planWakeAction(wakeInput);
    if (action === "suppress-control-gate") {
      // Migration-gated path normally enqueues into the local inbox so the wake
      // is delivered after the gate clears. For transient wakes (e.g. reminder
      // fire) we DROP instead of enqueue: the synthetic AgentMessage has no
      // ackable seq, so it would sit in the inbox forever and re-fire on every
      // receive/reconnect once the gate lifts. Audit lives in `reminder_events`;
      // owner observes via reminder UI (status=fired). Best-effort delivery
      // semantics are intentional — reminder fire is fire-and-observe.
      if (!options.transient) {
        this.deliverToLocalInbox(agentId, message, { notifyPendingReceive: false });
      }
      if (agent.machineId) {
        await this.maybePiggybackRuntimeProfileMigrationNudge(agent.machineId, agent);
      }
      return;
    }
    if (action !== "deliver-directly") {
      await this.applyWakeAction({
        agentId,
        machineId: agent.machineId,
        previousStatus: agent.status,
        resetMode: wakeInput.state.resetMode,
      }, message, action);
      return;
    }
    await this.applyDirectDelivery({
      agentId,
      machineId: agent.machineId,
      transient: options.transient ?? false,
    }, message);
  }

  protected async applyDirectDelivery(context: DirectDeliveryContext, message: AgentMessage) {
    const deliveryId = crypto.randomUUID();
    const span = this.tracer.startSpan("server.agent.delivery", {
      surface: "server",
      kind: "producer",
      attrs: {
        agent_id_present: Boolean(context.agentId),
        machine_id_present: Boolean(context.machineId),
        deliveryId,
        delivery_correlation_id: deliveryId,
        message_id_present: Boolean(message.message_id),
        seq: message.seq ?? 0,
      },
    });
    span.addEvent("server.deliver.enqueued", { seq: message.seq ?? 0, deliveryId });

    try {
      let inboxPath: "routed" | "local" | "local-fallback" | "transient-skip" = "local";
      // Establish replayable inbox state before direct websocket delivery. The
      // daemon can ack immediately from ws.send(); if the inbox does not exist yet,
      // that ack is lost and weak-network recovery can replay a delivered message.
      //
      // Transient deliveries (e.g. reminder fire) intentionally skip this: their
      // synthetic AgentMessage has no `seq` from `messages.seq`, so the inbox
      // could never ack/remove it (see `partitionAcknowledgedMessages`). Audit
      // lives elsewhere (`reminder_events`) and a missed wake is recoverable
      // via the owner's reminder UI, so best-effort ws send is correct.
      if (context.transient) {
        inboxPath = "transient-skip";
        span.addEvent("inbox.skipped", { path: inboxPath });
      } else if (context.machineId && this.replicaStateStore.isAvailable()) {
        const routed = await this.routeInboxDeliveryCrossReplica(
          context.agentId,
          context.machineId,
          message,
          this.getRoutableLocalMachineIds(),
        );
        if (routed) {
          inboxPath = "routed";
          span.addEvent("inbox.routed", { path: inboxPath });
        } else {
          inboxPath = "local-fallback";
          await this.deliverToLocalInboxIfStillActive(context.agentId, context.machineId, message);
          span.addEvent("inbox.ready", { path: inboxPath });
        }
      } else {
        await this.deliverToLocalInboxIfStillActive(context.agentId, context.machineId, message);
        span.addEvent("inbox.ready", { path: inboxPath });
      }

      // Try to deliver to the machine directly (daemon auto-restarts idle processes;
      // sendToMachine handles cross-replica routing via Redis).
      if (context.machineId) {
        span.addEvent("server.ws.send.attempted", { machine_id_present: true });
        this.sendBestEffortToMachine(context.machineId, {
          type: "agent:deliver",
          agentId: context.agentId,
          message,
          seq: message.seq ?? 0,
          traceparent: formatTraceparent(span.context),
          deliveryId,
        }, `deliverMessage send failed for agent ${context.agentId}`);
      }
      span.end("ok", { attrs: { outcome: context.machineId ? "ws-send-attempted" : "inbox-only" } });
    } catch (err) {
      span.end("error", { attrs: { error_class: err instanceof Error ? err.name : typeof err } });
      throw err;
    }
  }

  protected async applyWakeAction(context: WakeApplyContext, message: AgentMessage, action: Exclude<WakePlanAction, "deliver-directly">) {
    if (action === "suppress-reset") {
      this.recordLifecycleEvent({
        agentId: context.agentId,
        machineId: context.machineId,
        action: "wake",
        outcome: "suppressed",
        cause: "message",
        previousStatus: context.previousStatus,
        detail: `reset_in_progress:${context.resetMode}`,
      });
      return;
    }
    if (action === "attempt-wake") {
      this.recordLifecycleEvent({
        agentId: context.agentId,
        machineId: context.machineId,
        action: "wake",
        outcome: "attempted",
        cause: "message",
        previousStatus: context.previousStatus,
      });
      try {
        await this.startAgent(context.agentId, { wakeMessage: message });
      } catch (err) {
        this.recordLifecycleEvent({
          agentId: context.agentId,
          machineId: context.machineId,
          action: "wake",
          outcome: "failed",
          cause: "message",
          previousStatus: context.previousStatus,
          detail: err instanceof Error ? err.message : String(err),
        });
        console.warn(`[Orchestrator] deliverMessage ${context.agentId}: failed to wake inactive agent: ${err instanceof Error ? err.message : String(err)}`);
      }
      return;
    }
    this.recordLifecycleEvent({
      agentId: context.agentId,
      machineId: context.machineId,
      action: "wake",
      outcome: "suppressed",
      cause: "message",
      previousStatus: context.previousStatus,
    });
  }

  private async deliverToLocalInboxIfStillActive(
    agentId: string,
    expectedMachineId: string | null,
    message: AgentMessage,
  ): Promise<boolean> {
    const latest = await this.getAuthoritativeAgentForDelivery(agentId);
    const action = planLocalDeliveryGateAction({
      hasAgent: Boolean(latest),
      status: latest?.status ?? null,
      machineMatches: latest?.machineId === expectedMachineId,
    });
    return this.applyLocalDeliveryGateAction({
      action,
      agentId,
      message,
    });
  }

  protected applyLocalDeliveryGateAction(context: LocalDeliveryGateApplyContext): boolean {
    if (context.action === "drop-delivery") {
      return true;
    }

    this.deliverToLocalInbox(context.agentId, context.message);
    return true;
  }

  /** Deliver a message to a local agent inbox. Used by deliverMessage and ReplicaRouter. */
  deliverToLocalInbox(agentId: string, message: AgentMessage, options: { notifyPendingReceive?: boolean } = {}) {
    let inbox = this.agentInboxes.get(agentId);
    if (!inbox) {
      inbox = { inbox: [], pendingReceive: null };
      this.agentInboxes.set(agentId, inbox);
    }

    const action = planLocalInboxEnqueueAction({
      hasSeqDuplicate: Boolean(message.seq && inbox.inbox.some((queued) => queued.seq === message.seq)),
      hasMessageIdDuplicate: Boolean(!message.seq && message.message_id && inbox.inbox.some((queued) => queued.message_id === message.message_id)),
    });
    if (action === "enqueue") {
      this.applyLocalInboxEnqueue({
        inbox,
        message,
        notifyPendingReceive: options.notifyPendingReceive ?? true,
      });
    }
  }

  protected applyLocalInboxEnqueue(context: LocalInboxApplyContext) {
    context.inbox.inbox.push(context.message);
    if (context.inbox.inbox.length > 1000) {
      context.inbox.inbox.shift();
    }

    if (context.notifyPendingReceive !== false && context.inbox.pendingReceive) {
      clearTimeout(context.inbox.pendingReceive.timer);
      context.inbox.pendingReceive.resolve([...context.inbox.inbox]);
      context.inbox.pendingReceive = null;
    }
  }

  async receiveMessages(agentId: string, block: boolean, timeoutMs: number, signal?: AbortSignal): Promise<AgentMessage[]> {
    if (await agentRuntimeProfileService.isRuntimeProfileMigrationGated(agentId)) {
      const agent = await this.getCachedAgent(agentId);
      const inbox = this.agentInboxes.get(agentId);
      const pendingMigration = await agentRuntimeProfileService.getPendingRuntimeProfileMigration(agentId);
      const oldestMessageAgeMs = oldestInboxMessageAgeMs(inbox?.inbox ?? [], this.clock.now());
      const pendingAgeMs = pendingMigration?.migratingSince
        ? Math.max(0, this.clock.now() - pendingMigration.migratingSince.getTime())
        : undefined;
      const span = this.tracer.startSpan("server.runtime_profile.gated_inbox.receive_blocked", {
        surface: "server",
        kind: "internal",
        attrs: {
          agent_id_present: Boolean(agentId),
          machine_id_present: Boolean(agent?.machineId),
          pending_kind: pendingMigration?.pendingKind,
          pending_key_present: Boolean(pendingMigration?.pendingKey),
          pending_key_hash: hashRuntimeProfileKey(pendingMigration?.pendingKey),
          migration_status: pendingMigration?.migrationStatus,
          pending_age_ms: pendingAgeMs,
          pending_age_bucket: durationMsBucket(pendingAgeMs),
          inbox_count: inbox?.inbox.length ?? 0,
          pending_receive_present: Boolean(inbox?.pendingReceive),
          oldest_message_age_ms: oldestMessageAgeMs,
          oldest_message_age_bucket: durationMsBucket(oldestMessageAgeMs),
          block,
          timeout_ms: timeoutMs,
        },
      });
      try {
        if (agent?.machineId) {
          await this.maybePiggybackRuntimeProfileMigrationNudge(agent.machineId, agent);
        }
        if (agent) {
          const pendingKeyHash = hashRuntimeProfileKey(pendingMigration?.pendingKey);
          // TODO(lifecycle-v2/server-producer): this is the server-side half of
          // runtime-profile control gating. Emit canonical
          // runtime_profile_control_changed from the gate planner when it marks
          // controlGate=runtime_profile_migration, then remove this adapter use.
          const { event } = adaptRuntimeProfileControlLifecycleEvent({
            serverId: agent.serverId,
            agentId,
            machineId: agent.machineId,
            source: "server",
            controlGate: "runtime_profile_migration",
            pendingKeyHash,
            now: () => new Date(this.clock.now()),
            attrs: {
              pending_kind: pendingMigration?.pendingKind,
              migration_status: pendingMigration?.migrationStatus,
            },
          });
          await applyAgentLifecycleProjectionPlan(
            reduceRuntimeProfileControlLifecycle({
              event,
              state: buildAgentLifecycleStateSnapshot({
                controlGate: "runtime_profile_migration",
                dbStatus: agent.status,
                machineId: agent.machineId,
                machineReachability: agent.machineId ? "reachable" : "unknown",
              }),
            }),
            this.lifecycleProjectionWriterDeps(),
            span,
          );
        }
      } catch (err) {
        span.end("error", {
          attrs: {
            outcome: "nudge_failed",
            error_class: err instanceof Error ? err.name : typeof err,
          },
        });
        throw err;
      }
      span.end("ok", { attrs: { outcome: "gated_by_runtime_profile_migration" } });
      return [];
    }
    let inbox = this.agentInboxes.get(agentId);
    if (!inbox) {
      inbox = { inbox: [], pendingReceive: null };
      this.agentInboxes.set(agentId, inbox);
    }

    const action = planReceiveAction({
      hasBufferedMessages: inbox.inbox.length > 0,
      block,
    });

    if (action === "return-buffered") {
      return Promise.resolve([...inbox.inbox]);
    }

    if (action === "return-empty") return Promise.resolve([]);
    return this.installReceiveWaiter({
      agentId,
      timeoutMs,
      signal,
    });
  }

  protected installReceiveWaiter(context: ReceiveApplyContext): Promise<AgentMessage[]> {
    return new Promise((resolve) => {
      let finished = false;
      let timer: ReturnType<typeof setTimeout>;
      let cleanupAbortListener = () => {};

      const finish = (messages: AgentMessage[]) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        cleanupAbortListener();
        const ib = this.agentInboxes.get(context.agentId);
        if (ib?.pendingReceive === pendingReceive) {
          ib.pendingReceive = null;
        }
        resolve(messages);
      };

      timer = setTimeout(() => {
        // Return empty — the bridge returns a "take a rest" hint to the agent,
        // keeping the process alive until new messages arrive via stdin.
        finish([]);
      }, context.timeoutMs);

      const pendingReceive = { resolve, timer, finish };
      const inbox = this.agentInboxes.get(context.agentId);

      // Only one blocked receive can be active per agent. If a second long-poll
      // arrives, supersede the old waiter so it doesn't hang indefinitely or let
      // a stale abort/timeout clear the newer waiter.
      if (inbox?.pendingReceive) {
        inbox.pendingReceive.finish([]);
      }

      // If the HTTP connection is aborted, clean up gracefully
      if (context.signal) {
        const onAbort = () => finish([]);
        if (context.signal.aborted) {
          finish([]);
          return;
        }
        context.signal.addEventListener("abort", onAbort, { once: true });
        cleanupAbortListener = () => context.signal?.removeEventListener("abort", onAbort);
      }

      if (!inbox) {
        this.agentInboxes.set(context.agentId, { inbox: [], pendingReceive });
        return;
      }
      inbox.pendingReceive = pendingReceive;
    });
  }

  acknowledgeDeliveredMessages(agentId: string, seqs: number[]): { removedCount: number } {
    if (seqs.length === 0) return { removedCount: 0 };
    const inbox = this.agentInboxes.get(agentId);
    if (!inbox || inbox.inbox.length === 0) return { removedCount: 0 };

    const { removed, retained } = partitionAcknowledgedMessages({
      inbox: inbox.inbox,
      ackedSeqs: new Set(seqs),
    });

    if (removed.length === 0) return { removedCount: 0 };
    inbox.inbox = retained;
    this.updateAgentReadCursors(agentId, removed);
    return { removedCount: removed.length };
  }

  acknowledgeDeliveredMessagesForChannel(agentId: string, channelId: string, seqs: number[]): { removedCount: number } {
    if (seqs.length === 0) return { removedCount: 0 };
    const inbox = this.agentInboxes.get(agentId);
    if (!inbox || inbox.inbox.length === 0) return { removedCount: 0 };

    const { removed, retained } = partitionTargetScopedAcknowledgedMessages({
      inbox: inbox.inbox,
      channelId,
      ackedSeqs: new Set(seqs),
    });

    if (removed.length === 0) return { removedCount: 0 };
    inbox.inbox = retained;
    this.updateAgentReadCursors(agentId, removed);
    return { removedCount: removed.length };
  }

  acknowledgeDeliveredMessagesForChannelUpToSeq(agentId: string, channelId: string, maxSeq: number): { removedCount: number } {
    if (!Number.isInteger(maxSeq) || maxSeq <= 0) return { removedCount: 0 };
    const inbox = this.agentInboxes.get(agentId);
    if (!inbox || inbox.inbox.length === 0) return { removedCount: 0 };

    const { removed, retained } = partitionTargetScopedMessagesUpToSeq({
      inbox: inbox.inbox,
      channelId,
      maxSeq,
    });

    if (removed.length === 0) return { removedCount: 0 };
    inbox.inbox = retained;
    this.updateAgentReadCursors(agentId, removed);
    return { removedCount: removed.length };
  }

  /** Update read cursors for multiple messages (fire-and-forget). */
  private updateAgentReadCursors(agentId: string, msgs: AgentMessage[]) {
    const channelMaxSeq = planReadCursorAdvances({ messages: msgs });
    this.applyReadCursorAdvances(agentId, channelMaxSeq);
  }

  protected applyReadCursorAdvances(agentId: string, channelMaxSeq: Map<string, number>) {
    for (const [channelId, seq] of channelMaxSeq) {
      channelService.markAgentRead(agentId, channelId, seq).catch(() => {});
    }
  }

  async getActivity(agentId: string, options: ActivityTraceOptions = {}): Promise<VisibleActivity> {
    const span = this.tracer.startSpan("server.agent.activity.resolve", {
      parent: options.parent ?? null,
      surface: "server",
      kind: "internal",
      attrs: { agent_id_present: Boolean(agentId) },
    });
    try {
      const agent = await this.getCachedAgent(agentId);
      if (agent?.status === "stopped") {
        const stopped = this.formatActivity("offline", "Stopped");
        span.end("ok", { attrs: { outcome: stopped.activity, source: "stopped-status" } });
        return stopped;
      }

      const activityCached = this.agentActivity.get(agentId);
      if (activityCached) {
        const resolved = await this.resolveActivityHint(agentId, agent, activityCached, "local-cache", span);
        if (resolved) {
          span.end("ok", { attrs: { outcome: resolved.activity, source: "local-cache" } });
          return resolved;
        }
      }

      // Check Redis for cross-replica activity (agent may be active on another replica)
      if (this.replicaStateStore.isAvailable()) {
        const redisActivity = await this.replicaStateStore.getAgentActivity(agentId);
        if (redisActivity) {
          const resolved = await this.resolveActivityHint(agentId, agent, redisActivity, "redis", span);
          if (resolved) {
            span.end("ok", { attrs: { outcome: resolved.activity, source: "redis" } });
            return resolved;
          }
        }
      }

      const persisted = await this.resolveRecentPersistedActivity(agentId, agent);
      if (persisted) {
        span.end("ok", { attrs: { outcome: persisted.activity, source: "persisted" } });
        return persisted;
      }
      const derived = await this.resolveDerivedActivity(agent);
      span.end("ok", { attrs: { outcome: derived.activity, source: "derived" } });
      return derived;
    } catch (err) {
      span.addEvent("activity.resolve.failed", {
        error_class: err instanceof Error ? err.name : typeof err,
      });
      span.end("error");
      throw err;
    }
  }

  async listRecentActivityLog(agentId: string, limit = 50) {
    return this.loadPersistedActivityLog(agentId, limit);
  }

  /**
   * Unified activity broadcast — emits a single `agent:activity` Socket.io event
   * carrying both the status (activity/detail) and trajectory entries.
   *
   * When trajectory entries are present, the event is emitted immediately (entries
   * must not be dropped). Status-only updates (e.g. heartbeats) are debounced to
   * merge rapid state changes.
   */
  private broadcastActivity(
    agentId: string,
    activity: string,
    detail: string = "",
    entries?: TrajectoryEntry[],
    nowOverride?: number,
    options: { dedupeKey?: string } = {},
  ): ActivityBroadcastTraceResult {
    const now = nowOverride ?? this.clock.now();
    const previousActivity = this.agentActivity.get(agentId)?.activity ?? null;

    // Always update in-memory cache immediately so getActivity() returns latest state
    this.agentActivity.set(agentId, { activity, detail, updatedAt: now });

    // Mirror to Redis for cross-replica consistency (fire-and-forget)
    this.replicaStateStore.setAgentActivity(agentId, activity, detail).catch(() => {});

    const hasEntries = Boolean(entries && entries.length > 0);
    const shouldPersistStatusOnly = !hasEntries && this.shouldPersistStatusOnlyActivity(activity, detail);
    const action = planActivityBroadcastAction({
      hasEntries,
      shouldPersistStatusOnly,
    });
    const persistedEntries: TrajectoryEntry[] = hasEntries
      ? (entries ?? [])
      : [{ kind: "status", activity: activity as AgentActivity, detail }];

    const persistence = this.applyActivityBroadcastAction({
      action,
      agentId,
      activity,
      detail,
      now,
      persistedEntries,
      dedupeKey: options.dedupeKey,
    });

    return {
      action,
      persistedEntryCount: persistedEntries.length,
      previousActivity,
      nextActivity: activity,
      persistence,
    };
  }

  protected applyActivityBroadcastAction(context: ActivityBroadcastApplyContext): Promise<ActivityPersistenceOutcome> | undefined {
    if (context.action === "persist-and-emit-now") {
      const persistence = this.persistActivityEvent(
        context.agentId,
        context.activity,
        context.detail,
        context.persistedEntries,
        new Date(context.now),
        context.dedupeKey,
      ).then((inserted): ActivityPersistenceOutcome => inserted ? "applied" : "deduped")
        .catch((err): ActivityPersistenceOutcome => {
          console.warn(`[ActivityLog ${context.agentId}] Failed to persist activity event:`, err);
          return "error";
        });

      // Trajectory entries present — emit immediately (cancel any pending debounce)
      const existing = this.activityDebounceTimers.get(context.agentId);
      if (existing) {
        clearTimeout(existing);
        this.activityDebounceTimers.delete(context.agentId);
      }
      this.emitActivity(
        context.agentId,
        context.activity,
        context.detail,
        context.now,
        context.persistedEntries,
      );
      return persistence;
    }

    // Status-only update — debounce to merge rapid state changes
    const existing = this.activityDebounceTimers.get(context.agentId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      this.activityDebounceTimers.delete(context.agentId);
      const latest = this.agentActivity.get(context.agentId);
      if (!latest) return;
      this.emitActivity(context.agentId, latest.activity, latest.detail, this.clock.now());
    }, AgentOrchestrator.ACTIVITY_DEBOUNCE_MS);

    this.activityDebounceTimers.set(context.agentId, timer);
    return undefined;
  }

  protected async updateMachineHeartbeat(machineId: string) {
    await machineService.updateHeartbeat(machineId);
  }

  protected async persistActivityEvent(
    agentId: string,
    activity: string,
    detail: string,
    entries: TrajectoryEntry[],
    createdAt: Date,
    dedupeKey?: string,
  ): Promise<boolean> {
    return agentActivityLogService.appendAgentActivityEvent(agentId, activity, detail, entries, createdAt, dedupeKey);
  }

  protected async loadPersistedActivityLog(agentId: string, limit: number) {
    return agentActivityLogService.listRecentAgentTrajectory(agentId, limit);
  }

  protected async loadLatestPersistedActivityHint(agentId: string) {
    return agentActivityLogService.getLatestAgentActivityHint(agentId);
  }

  private async emitActivity(agentId: string, activity: string, detail: string, timestamp: number, entries?: TrajectoryEntry[]) {
    const agent = await this.getCachedAgent(agentId);
    if (agent) {
      // Bump per-agent monotonic seq before emit so the client can
      // drop pushes that arrive out-of-order during reconnect storms
      // (a race between socket-pushed updates and an in-flight
      // `loadAgents()` REST call). Resets on server restart — the
      // client also clears its own lastSeen on `socket.connect`,
      // which fires `loadAgents()` and replaces dot state wholesale,
      // so the reset window is self-healing.
      // (#engineering:72283cf7 task #340 PR B)
      const nextSeq = (this.activityServerSeq.get(agentId) ?? 0) + 1;
      this.activityServerSeq.set(agentId, nextSeq);
      this.io?.to(`server:${agent.serverId}`).emit("agent:activity", {
        agentId, activity, detail, timestamp, entries, serverSeq: nextSeq,
      });
    }
  }
}
