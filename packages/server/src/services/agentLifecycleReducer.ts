// Design note: this reducer is the lifecycle semantic boundary documented in
// docs/server/agent-lifecycle-event-model-rfc.zh.html.
//
// Callers should feed canonical lifecycle events plus explicit current-state
// inputs into this file and receive projection plans back. This is where product
// semantics such as "Starting", "Stopped", "Runtime interrupted", wake
// eligibility, reset-window suppression, and Activity Log dedupe are decided.
// Do not reintroduce those decisions directly into AgentOrchestrator branches;
// keep legacy protocol translation in the adapter and side-effect writes in the
// projection writer.
//
// Source discussion: #proj-runtime:4dbe9aa7.
import type { AgentStatus, TrajectoryEntry } from "@slock-ai/shared";
import type {
  AgentLifecycleEvent,
  AgentLifecycleProjectionOutcome,
  AgentLifecycleTraceAttrs,
} from "./agentLifecycleEvents.js";

export type LifecycleWakeBlockReason =
  | "control_gate"
  | "machine_unreachable"
  | "manual_stopped"
  | "reset_window";

export type LifecycleDbStatusProjection =
  | {
      kind: "apply";
      sessionId?: string;
      status: AgentStatus;
      writer: "direct" | "signal";
      attrs?: AgentLifecycleTraceAttrs;
    }
  | {
      kind: "skip";
      skippedReason: string;
      attrs?: AgentLifecycleTraceAttrs;
    };

export interface LifecycleWakeEligibilityProjection {
  eligible: boolean;
  blockReason?: LifecycleWakeBlockReason;
  attrs?: AgentLifecycleTraceAttrs;
}

export type LifecycleLiveActivityProjection =
  | {
      kind: "emit";
      activity: "error" | "offline" | "online" | "thinking" | "working";
      detail: string;
      entries?: TrajectoryEntry[];
      dedupeKey?: string;
      detailKind: string;
      emitWhen?: "always" | "manual_or_stop_send_failed";
      attrs?: AgentLifecycleTraceAttrs;
    }
  | {
      kind: "ready_online";
      detailKind: "ready";
      attrs?: AgentLifecycleTraceAttrs;
    }
  | {
      kind: "skip";
      skippedReason: string;
      attrs?: AgentLifecycleTraceAttrs;
    };

export interface LifecycleActivityLogProjection {
  labelKind: string;
  dedupeKey?: string;
  skippedReason?: string;
  attrs?: AgentLifecycleTraceAttrs;
}

export interface LifecycleProjectionSideEffects {
  clearInbox?: boolean;
  clearLaunchGuard?: boolean;
  releaseWakeLock?: boolean;
  resolveStartingActivity?: boolean;
  sendStopToMachine?: "await" | "best_effort";
  updateCache?: {
    machineId?: string | null;
    runtimeState?: LifecycleRuntimeState;
    sessionId?: string | null;
    status?: AgentStatus;
  };
}

export interface AgentLifecycleProjectionPlan {
  event: AgentLifecycleEvent;
  activityLog: LifecycleActivityLogProjection;
  dbStatus: LifecycleDbStatusProjection;
  liveActivity: LifecycleLiveActivityProjection;
  sideEffects?: LifecycleProjectionSideEffects;
  wakeEligibility: LifecycleWakeEligibilityProjection;
}

export type ReadyReconcileLifecycleAction =
  | "force-stop-and-stay-offline"
  | "mark-wakeable-not-running"
  | "mark-active-online"
  | "mark-inactive-offline"
  | "stay-offline";

export type LifecycleIntentState = "running_allowed" | "manual_stopped" | "deleted";
export type LifecycleMachineReachability = "reachable" | "unreachable" | "degraded" | "unknown";
export type LifecycleRuntimeState =
  | "not_running"
  | "starting"
  | "running_idle"
  | "working"
  | "thinking"
  | "interrupted"
  | "crashed"
  | "stalled"
  | "unknown";
export type LifecycleControlGate = "open" | "runtime_profile_migration" | "reset_window";
export type RuntimeProfileControlGate = Extract<LifecycleControlGate, "open" | "runtime_profile_migration">;

export interface AgentLifecycleStateSnapshot {
  /**
   * In-memory state-machine input assembled from the existing physical stores.
   *
   * This is deliberately not a new persisted source of truth. Callers build it
   * from legacy `agents.status`, reset/migration gates, machine reachability,
   * runtime/session/launch facts, and pass it to the reducer as the explicit
   * state snapshot side of `state + event -> projection plan`.
   */
  controlGate: LifecycleControlGate;
  dbStatus: AgentStatus;
  intentState: LifecycleIntentState;
  launchId?: string | null;
  machineId?: string | null;
  machineReachability: LifecycleMachineReachability;
  resetMode: "restart" | "session" | "full" | null;
  runtimeState: LifecycleRuntimeState;
  sessionId?: string | null;
}

export function buildAgentLifecycleStateSnapshot(input: {
  controlGate?: LifecycleControlGate;
  dbStatus: AgentStatus;
  intentState?: LifecycleIntentState;
  launchId?: string | null;
  machineId?: string | null;
  machineReachability?: LifecycleMachineReachability;
  resetMode?: "restart" | "session" | "full" | null;
  runtimeState?: LifecycleRuntimeState;
  sessionId?: string | null;
}): AgentLifecycleStateSnapshot {
  const resetMode = input.resetMode ?? null;
  return {
    controlGate: input.controlGate ?? (resetMode ? "reset_window" : "open"),
    dbStatus: input.dbStatus,
    intentState: input.intentState ?? inferIntentState(input.dbStatus),
    launchId: input.launchId,
    machineId: input.machineId,
    machineReachability: input.machineReachability ?? "unknown",
    resetMode,
    runtimeState: input.runtimeState ?? inferRuntimeState(input.dbStatus),
    sessionId: input.sessionId,
  };
}

function inferIntentState(status: AgentStatus): LifecycleIntentState {
  if (status === "stopped") return "manual_stopped";
  return "running_allowed";
}

function inferRuntimeState(status: AgentStatus): LifecycleRuntimeState {
  if (status === "active") return "running_idle";
  return "not_running";
}

function stateWakeBlockReason(state: AgentLifecycleStateSnapshot): LifecycleWakeBlockReason | undefined {
  if (state.intentState === "manual_stopped" || state.dbStatus === "stopped") {
    return "manual_stopped";
  }
  if (state.controlGate === "reset_window" || state.resetMode) {
    return "reset_window";
  }
  if (state.controlGate === "runtime_profile_migration") {
    return "control_gate";
  }
  if (state.machineReachability === "unreachable") {
    return "machine_unreachable";
  }
  return undefined;
}

export interface WakePlanInput {
  state: AgentLifecycleStateSnapshot;
}

export type WakePlanAction =
  | "attempt-wake"
  | "suppress-control-gate"
  | "suppress-stopped"
  | "suppress-reset"
  | "deliver-directly";

export function planWakeAction(input: WakePlanInput): WakePlanAction {
  if (input.state.controlGate === "runtime_profile_migration") {
    return "suppress-control-gate";
  }
  if (input.state.dbStatus === "inactive") {
    return input.state.controlGate === "reset_window" || input.state.resetMode ? "suppress-reset" : "attempt-wake";
  }
  if (input.state.dbStatus === "stopped") {
    return "suppress-stopped";
  }
  // Active is the wake-allowed intent. If daemon ready/restart told us the
  // process is absent, a message should start it instead of being delivered to
  // a runtime that is not actually running.
  if (input.state.dbStatus === "active" && input.state.runtimeState === "not_running") {
    return input.state.controlGate === "reset_window" || input.state.resetMode ? "suppress-reset" : "attempt-wake";
  }
  return "deliver-directly";
}

export type DaemonReportedAgentStatus = "active" | "inactive" | null;

export interface StatusSignalPlanInput {
  reportedStatus: DaemonReportedAgentStatus;
  state: AgentLifecycleStateSnapshot;
}

export type StatusSignalPlanAction =
  | "ignore"
  | "ignore-and-release-wake-lock"
  | "persist-active"
  | "persist-inactive"
  | "persist-stopped";

export function planStatusSignalAction(input: StatusSignalPlanInput): StatusSignalPlanAction {
  if (!input.reportedStatus) return "ignore";

  if (input.reportedStatus === "active") {
    if (input.state.dbStatus === "stopped" || input.state.intentState === "manual_stopped") return "ignore-and-release-wake-lock";
    if (input.state.controlGate === "reset_window" || input.state.resetMode) return "ignore";
    return "persist-active";
  }

  return input.state.dbStatus === "stopped" ? "persist-stopped" : "persist-inactive";
}

export interface SessionSignalPlanInput {
  state: AgentLifecycleStateSnapshot;
}

export type SessionSignalPlanAction =
  | "ignore"
  | "ignore-and-release-wake-lock"
  | "persist-active-session";

export function planSessionSignalAction(input: SessionSignalPlanInput): SessionSignalPlanAction {
  if (input.state.dbStatus === "stopped" || input.state.intentState === "manual_stopped") {
    return "ignore-and-release-wake-lock";
  }
  if (input.state.controlGate === "reset_window" || input.state.resetMode) {
    return "ignore";
  }
  return "persist-active-session";
}

export interface ActivitySignalPlanInput {
  state: AgentLifecycleStateSnapshot;
}

export type ActivitySignalPlanAction = "ignore" | "broadcast-activity";

export function planActivitySignalAction(input: ActivitySignalPlanInput): ActivitySignalPlanAction {
  if (input.state.dbStatus === "stopped" || input.state.intentState === "manual_stopped") {
    return "ignore";
  }
  if (input.state.controlGate === "reset_window" || input.state.resetMode) {
    return "ignore";
  }
  return "broadcast-activity";
}

export interface StartProjectionInput {
  event: AgentLifecycleEvent;
  state: AgentLifecycleStateSnapshot;
}

export function reduceStartLifecycle(input: StartProjectionInput): AgentLifecycleProjectionPlan {
  return {
    event: input.event,
    sideEffects: {
      updateCache: { runtimeState: "starting", status: "active" },
    },
    dbStatus: {
      kind: "apply",
      status: "active",
      writer: "direct",
      attrs: {
        intent_state: "running_allowed",
        legacy_status: "active",
        previous_status: input.state.dbStatus,
        runtime_state: "starting",
      },
    },
    wakeEligibility: { eligible: true },
    liveActivity: {
      kind: "emit",
      activity: "working",
      detail: "Starting…",
      detailKind: "runtime_starting",
    },
    activityLog: {
      labelKind: "runtime_starting",
    },
  };
}

export interface DaemonActivityProjectionInput {
  action: ActivitySignalPlanAction;
  activity: "error" | "offline" | "online" | "thinking" | "working";
  detail: string;
  entries?: TrajectoryEntry[];
  event: AgentLifecycleEvent;
  state: AgentLifecycleStateSnapshot;
}

export function reduceDaemonActivityLifecycle(input: DaemonActivityProjectionInput): AgentLifecycleProjectionPlan {
  const wakeBlockReason = stateWakeBlockReason(input.state);
  if (input.action === "ignore") {
    return skippedSignalProjection(input.event, {
      blockReason: wakeBlockReason,
      eligible: !wakeBlockReason,
      skippedReason: wakeBlockReason === "manual_stopped"
        ? "manual_stopped_ignores_daemon_activity"
        : wakeBlockReason === "reset_window"
          ? "reset_window_ignores_daemon_activity"
        : "activity_signal_ignored",
    });
  }

  const liveRuntimeActivity =
    input.activity === "online" || input.activity === "thinking" || input.activity === "working";
  const shouldRestoreActiveStatus = input.state.dbStatus === "inactive" && liveRuntimeActivity;
  const runtimeState: LifecycleRuntimeState =
    input.activity === "online" ? "running_idle"
      : input.activity === "thinking" ? "thinking"
        : input.activity === "working" ? "working"
          : input.activity === "error" ? "crashed"
            : "interrupted";
  const dbStatus: LifecycleDbStatusProjection = shouldRestoreActiveStatus
    ? {
        kind: "apply",
        status: "active",
        writer: "signal",
        attrs: {
          activity_status: input.activity,
          legacy_status: input.state.dbStatus,
          runtime_state: input.state.runtimeState,
        },
      }
    : {
        kind: "skip",
        skippedReason: "daemon_activity_does_not_change_db_status",
        attrs: { activity_status: input.activity },
      };

  return {
    event: input.event,
    sideEffects: {
      updateCache: {
        runtimeState,
        ...(shouldRestoreActiveStatus ? { status: "active" as const } : {}),
      },
    },
    dbStatus,
    wakeEligibility: { eligible: true },
    liveActivity: {
      kind: "emit",
      activity: input.activity,
      detail: input.detail,
      entries: input.entries,
      detailKind: "daemon_activity",
    },
    activityLog: {
      labelKind: "daemon_activity",
      attrs: { activity_status: input.activity },
    },
  };
}

export interface ReadyReconcileProjectionInput {
  action: ReadyReconcileLifecycleAction;
  activityDedupeKey: string;
  event: AgentLifecycleEvent;
  state: AgentLifecycleStateSnapshot;
}

export function reduceReadyReconcileLifecycle(input: ReadyReconcileProjectionInput): AgentLifecycleProjectionPlan {
  switch (input.action) {
    case "force-stop-and-stay-offline":
      return {
        event: input.event,
        sideEffects: {
          sendStopToMachine: "best_effort",
          updateCache: { machineId: input.state.machineId, status: input.state.dbStatus },
        },
        dbStatus: {
          kind: "skip",
          skippedReason: "preserve_persisted_status",
          attrs: { legacy_status: input.state.dbStatus },
        },
        wakeEligibility: {
          eligible: false,
          blockReason: input.state.dbStatus === "stopped" ? "manual_stopped" : "control_gate",
        },
        liveActivity: {
          kind: "emit",
          activity: "offline",
          detail: "Stopped",
          dedupeKey: input.activityDedupeKey,
          detailKind: "stopped",
        },
        activityLog: {
          labelKind: "stopped",
          dedupeKey: input.activityDedupeKey,
        },
      };

    case "mark-active-online":
      return {
        event: input.event,
        sideEffects: {
          clearLaunchGuard: true,
          updateCache: { machineId: input.state.machineId, runtimeState: "running_idle", status: "active" },
        },
        dbStatus: {
          kind: "apply",
          status: "active",
          writer: "signal",
          attrs: { legacy_status: "active", runtime_state: "running_idle" },
        },
        wakeEligibility: { eligible: true },
        liveActivity: {
          kind: "ready_online",
          detailKind: "ready",
          attrs: { activity_status: "online", detail_kind: "ready" },
        },
        activityLog: {
          labelKind: "ready_online",
          skippedReason: "online_recovery_may_be_persisted_by_broadcast_ready_online",
        },
      };

    case "mark-wakeable-not-running":
      // Daemon restart / ready reconciliation can observe no running process
      // for an agent that is still logically active. Do not persist an offline
      // status here; only record the runtime-process axis as absent.
      return {
        event: input.event,
        sideEffects: {
          clearLaunchGuard: true,
          releaseWakeLock: true,
          updateCache: { machineId: input.state.machineId, runtimeState: "not_running", status: "active" },
        },
        dbStatus: {
          kind: "skip",
          skippedReason: "runtime_absent_but_agent_wakeable",
          attrs: { legacy_status: "active", runtime_state: "not_running" },
        },
        wakeEligibility: { eligible: true },
        liveActivity: {
          kind: "ready_online",
          detailKind: "ready",
          attrs: { activity_status: "online", detail_kind: "ready", runtime_state: "not_running" },
        },
        activityLog: {
          labelKind: "ready_wakeable_not_running",
          skippedReason: "wakeable_sleeping_runtime_is_not_user_visible_offline",
        },
      };

    case "mark-inactive-offline":
      return {
        event: input.event,
        sideEffects: {
          releaseWakeLock: true,
          updateCache: { machineId: input.state.machineId, runtimeState: "interrupted", status: "inactive" },
        },
        dbStatus: {
          kind: "apply",
          status: "inactive",
          writer: "signal",
          attrs: { legacy_status: "inactive", runtime_state: "interrupted" },
        },
        wakeEligibility: { eligible: true },
        liveActivity: {
          kind: "emit",
          activity: "offline",
          detail: "Runtime interrupted",
          dedupeKey: input.activityDedupeKey,
          detailKind: "runtime_interrupted",
        },
        activityLog: {
          labelKind: "runtime_interrupted",
          dedupeKey: input.activityDedupeKey,
        },
      };

    case "stay-offline": {
      const stopped = input.state.dbStatus === "stopped";
      const detailKind = stopped ? "stopped" : "runtime_interrupted";
      return {
        event: input.event,
        sideEffects: {
          updateCache: { machineId: input.state.machineId, runtimeState: "not_running", status: input.state.dbStatus },
        },
        dbStatus: {
          kind: "skip",
          skippedReason: "preserve_persisted_status",
          attrs: { legacy_status: input.state.dbStatus },
        },
        wakeEligibility: {
          eligible: !stopped,
          ...(stopped ? { blockReason: "manual_stopped" } : {}),
        },
        liveActivity: {
          kind: "emit",
          activity: "offline",
          detail: stopped ? "Stopped" : "Runtime interrupted",
          dedupeKey: input.activityDedupeKey,
          detailKind,
        },
        activityLog: {
          labelKind: detailKind,
          dedupeKey: input.activityDedupeKey,
        },
      };
    }
  }
}

export interface DaemonStatusProjectionInput {
  action: StatusSignalPlanAction;
  event: AgentLifecycleEvent;
  nextStatus?: AgentStatus;
  state: AgentLifecycleStateSnapshot;
}

export function reduceDaemonStatusLifecycle(input: DaemonStatusProjectionInput): AgentLifecycleProjectionPlan {
  if (input.action === "ignore-and-release-wake-lock") {
    return skippedSignalProjection(input.event, {
      blockReason: "manual_stopped",
      eligible: false,
      releaseWakeLock: true,
      skippedReason: "manual_stopped_ignores_daemon_status",
    });
  }

  if (input.action === "ignore") {
    const wakeBlockReason = stateWakeBlockReason(input.state);
    return skippedSignalProjection(input.event, {
      blockReason: wakeBlockReason,
      eligible: !wakeBlockReason,
      skippedReason: wakeBlockReason === "reset_window"
        ? "reset_window_ignores_daemon_status"
        : "status_signal_ignored",
    });
  }

  const status = input.nextStatus ?? (input.action === "persist-active" ? "active" : input.action === "persist-stopped" ? "stopped" : "inactive");
  return {
    event: input.event,
    sideEffects: {
      ...(status === "active" ? { resolveStartingActivity: true } : { clearLaunchGuard: true, releaseWakeLock: true }),
      updateCache: { runtimeState: status === "active" ? "running_idle" : "not_running", status },
    },
    dbStatus: {
      kind: "apply",
      status,
      writer: "signal",
      attrs: { legacy_status: status },
    },
    wakeEligibility: {
      eligible: status !== "stopped",
      ...(status === "stopped" ? { blockReason: "manual_stopped" } : {}),
    },
    liveActivity: {
      kind: "skip",
      skippedReason: status === "active" ? "starting_activity_may_be_resolved" : "status_signal_not_visible_activity",
    },
    activityLog: {
      labelKind: "none",
      skippedReason: "status_signal_not_visible_activity",
    },
  };
}

export interface DaemonSessionProjectionInput {
  action: SessionSignalPlanAction;
  event: AgentLifecycleEvent;
  sessionId: string;
  state: AgentLifecycleStateSnapshot;
}

export function reduceDaemonSessionLifecycle(input: DaemonSessionProjectionInput): AgentLifecycleProjectionPlan {
  if (input.action === "ignore-and-release-wake-lock") {
    return skippedSignalProjection(input.event, {
      blockReason: "manual_stopped",
      eligible: false,
      releaseWakeLock: true,
      skippedReason: "manual_stopped_ignores_daemon_session",
    });
  }

  if (input.action === "ignore") {
    const wakeBlockReason = stateWakeBlockReason(input.state);
    return skippedSignalProjection(input.event, {
      blockReason: wakeBlockReason,
      eligible: !wakeBlockReason,
      skippedReason: wakeBlockReason === "reset_window"
        ? "reset_window_ignores_daemon_session"
        : "session_signal_ignored",
    });
  }

  return {
    event: input.event,
    sideEffects: {
      releaseWakeLock: true,
      resolveStartingActivity: true,
      updateCache: { runtimeState: "running_idle", sessionId: input.sessionId, status: "active" },
    },
    dbStatus: {
      kind: "apply",
      sessionId: input.sessionId,
      status: "active",
      writer: "signal",
      attrs: { legacy_status: "active", session_present: true },
    },
    wakeEligibility: { eligible: true },
    liveActivity: {
      kind: "skip",
      skippedReason: "starting_activity_may_be_resolved",
    },
    activityLog: {
      labelKind: "none",
      skippedReason: "session_signal_not_visible_activity",
    },
  };
}

function skippedSignalProjection(
  event: AgentLifecycleEvent,
  input: {
    blockReason?: LifecycleWakeBlockReason;
    eligible: boolean;
    releaseWakeLock?: boolean;
    skippedReason: string;
  },
): AgentLifecycleProjectionPlan {
  return {
    event,
    sideEffects: input.releaseWakeLock ? { releaseWakeLock: true } : undefined,
    dbStatus: {
      kind: "skip",
      skippedReason: input.skippedReason,
    },
    wakeEligibility: {
      eligible: input.eligible,
      ...(input.blockReason ? { blockReason: input.blockReason } : {}),
    },
    liveActivity: {
      kind: "skip",
      skippedReason: input.skippedReason,
    },
    activityLog: {
      labelKind: "none",
      skippedReason: input.skippedReason,
    },
  };
}

export interface MachineDisconnectProjectionInput {
  activityDedupeKey: string;
  event: AgentLifecycleEvent;
  state: AgentLifecycleStateSnapshot;
}

export function reduceMachineDisconnectLifecycle(input: MachineDisconnectProjectionInput): AgentLifecycleProjectionPlan {
  return {
    event: input.event,
    sideEffects: {
      updateCache: { runtimeState: "interrupted", status: input.state.dbStatus },
    },
    dbStatus: {
      kind: "skip",
      skippedReason: "machine_disconnect_preserves_agent_status",
      attrs: { legacy_status: input.state.dbStatus, machine_reachability: "unreachable" },
    },
    wakeEligibility: {
      eligible: false,
      blockReason: "machine_unreachable",
      attrs: { machine_reachability: "unreachable" },
    },
    liveActivity: {
      kind: "emit",
      activity: "offline",
      detail: "Machine disconnected",
      dedupeKey: input.activityDedupeKey,
      detailKind: "machine_disconnected",
    },
    activityLog: {
      labelKind: "machine_disconnected",
      dedupeKey: input.activityDedupeKey,
    },
  };
}

export interface StopProjectionInput {
  activityDedupeKey: string;
  event: AgentLifecycleEvent;
  nextStatus: AgentStatus;
  state: AgentLifecycleStateSnapshot;
}

export function reduceStopLifecycle(input: StopProjectionInput): AgentLifecycleProjectionPlan {
  const stopped = input.nextStatus === "stopped";
  return {
    event: input.event,
    sideEffects: {
      clearInbox: true,
      clearLaunchGuard: true,
      releaseWakeLock: true,
      ...(input.state.machineId ? { sendStopToMachine: "await" } : {}),
      updateCache: { runtimeState: "not_running", status: input.nextStatus },
    },
    dbStatus: {
      kind: "apply",
      status: input.nextStatus,
      writer: "direct",
      attrs: {
        intent_state: stopped ? "manual_stopped" : "running_allowed",
        legacy_status: input.nextStatus,
        runtime_state: "not_running",
      },
    },
    wakeEligibility: {
      eligible: !stopped,
      ...(stopped ? { blockReason: "manual_stopped" } : {}),
    },
    liveActivity: {
      kind: "emit",
      activity: "offline",
      detail: "Stopped",
      dedupeKey: input.activityDedupeKey,
      detailKind: "stopped",
      emitWhen: "manual_or_stop_send_failed",
    },
    activityLog: {
      labelKind: "stopped",
      dedupeKey: input.activityDedupeKey,
    },
  };
}

export interface RuntimeProfileControlProjectionInput {
  event: AgentLifecycleEvent;
  state: AgentLifecycleStateSnapshot;
}

export function reduceRuntimeProfileControlLifecycle(
  input: RuntimeProfileControlProjectionInput,
): AgentLifecycleProjectionPlan {
  const gated = input.state.controlGate === "runtime_profile_migration";
  return {
    event: input.event,
    dbStatus: {
      kind: "skip",
      skippedReason: "control_gate_only",
      attrs: { control_gate: input.state.controlGate },
    },
    wakeEligibility: {
      eligible: !gated,
      ...(gated ? { blockReason: "control_gate" } : {}),
    },
    liveActivity: {
      kind: "skip",
      skippedReason: "control_gate_not_visible_activity",
      attrs: { control_gate: input.state.controlGate },
    },
    activityLog: {
      labelKind: "none",
      skippedReason: "control_gate_not_visible_activity",
      attrs: { control_gate: input.state.controlGate },
    },
  };
}

export function shouldEmitLiveActivity(input: {
  liveActivity: LifecycleLiveActivityProjection;
  nextStatus?: AgentStatus;
  stopSent?: boolean;
}): boolean {
  if (input.liveActivity.kind !== "emit") return false;
  if (input.liveActivity.emitWhen !== "manual_or_stop_send_failed") return true;
  return input.nextStatus === "stopped" || input.stopSent !== true;
}
