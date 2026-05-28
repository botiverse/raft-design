// Design note: this writer is the single lifecycle projection output seam from
// docs/server/agent-lifecycle-event-model-rfc.zh.html.
//
// Reducers return projection plans; this module applies the side effects and
// records trace rows. Keep DB status writes, live activity emission, Activity
// Log persistence/dedupe, wake-projection trace outcomes, wake-lock release,
// launch-guard cleanup, and machine stop side effects centralized here. Do not
// let AgentOrchestrator or legacy adapters bypass this writer for lifecycle
// product semantics.
//
// Source discussion: #proj-runtime:4dbe9aa7.
import type { AgentStatus, TrajectoryEntry } from "@slock-ai/shared";
import type { ActiveSpan } from "@slock-ai/shared";
import {
  AGENT_LIFECYCLE_EVENT_TRACE_NAME,
  AGENT_LIFECYCLE_PROJECTION_TRACE_NAME,
  createAgentLifecycleProjectionTraceRows,
  toAgentLifecycleEventTraceAttrs,
  toAgentLifecycleProjectionTraceAttrs,
  type AgentLifecycleTraceAttrs,
  type CreateAgentLifecycleProjectionInput,
} from "./agentLifecycleEvents.js";
import {
  shouldEmitLiveActivity,
  type AgentLifecycleProjectionPlan,
  type LifecycleRuntimeState,
} from "./agentLifecycleReducer.js";

export type ActivityPersistenceOutcome = "applied" | "deduped" | "error";

export interface LifecycleActivityBroadcastResult {
  action?: string;
  persistedEntryCount?: number;
  previousActivity?: string | null;
  nextActivity?: string;
  persistence?: Promise<ActivityPersistenceOutcome>;
}

export interface AgentLifecycleProjectionWriterDeps {
  broadcastActivity(
    agentId: string,
    activity: string,
    detail: string,
    entries?: TrajectoryEntry[],
    nowOverride?: number,
    options?: { dedupeKey?: string },
  ): LifecycleActivityBroadcastResult;
  broadcastReadyOnline(agentId: string): Promise<void>;
  clearInbox(agentId: string): void;
  clearLaunchGuard(agentId: string): void;
  maybeResolveStartingActivity(agentId: string): void;
  persistAgentStatus(agentId: string, status: AgentStatus, sessionId?: string): Promise<void>;
  persistAgentStatusFromSignal(agentId: string, status: AgentStatus, sessionId?: string): Promise<void>;
  releaseWakeLock(agentId: string): void;
  sendBestEffortStopToMachine(machineId: string, agentId: string): void;
  sendStopToMachine(machineId: string, agentId: string): Promise<boolean>;
  updateCache(agentId: string, updates: {
    machineId?: string | null;
    runtimeState?: LifecycleRuntimeState;
    sessionId?: string | null;
    status?: AgentStatus;
  }): void;
}

export interface AppliedAgentLifecycleProjection {
  activityOutcome?: ActivityPersistenceOutcome;
  liveActivityResult?: LifecycleActivityBroadcastResult;
  stopSent?: boolean;
}

export async function applyAgentLifecycleProjectionPlan(
  plan: AgentLifecycleProjectionPlan,
  deps: AgentLifecycleProjectionWriterDeps,
  span?: ActiveSpan | null,
): Promise<AppliedAgentLifecycleProjection> {
  const agentId = plan.event.agentId;
  let stopSent: boolean | undefined;

  if (plan.sideEffects?.sendStopToMachine && plan.event.machineId) {
    if (plan.sideEffects.sendStopToMachine === "best_effort") {
      deps.sendBestEffortStopToMachine(plan.event.machineId, agentId);
    } else {
      stopSent = await deps.sendStopToMachine(plan.event.machineId, agentId);
    }
  }

  if (plan.sideEffects?.clearInbox) deps.clearInbox(agentId);
  if (plan.sideEffects?.updateCache) deps.updateCache(agentId, plan.sideEffects.updateCache);
  if (plan.sideEffects?.clearLaunchGuard) deps.clearLaunchGuard(agentId);
  if (plan.sideEffects?.releaseWakeLock) deps.releaseWakeLock(agentId);
  if (plan.sideEffects?.resolveStartingActivity) deps.maybeResolveStartingActivity(agentId);

  if (plan.dbStatus.kind === "apply") {
    if (plan.dbStatus.writer === "signal") {
      await deps.persistAgentStatusFromSignal(agentId, plan.dbStatus.status, plan.dbStatus.sessionId);
    } else {
      await deps.persistAgentStatus(agentId, plan.dbStatus.status, plan.dbStatus.sessionId);
    }
  }

  let liveActivityOutcome: CreateAgentLifecycleProjectionInput["outcome"] = "skipped";
  let liveActivityResult: LifecycleActivityBroadcastResult | undefined;
  let liveActivitySkippedReason: string | undefined;
  let activityLogOutcome: CreateAgentLifecycleProjectionInput["outcome"] = "skipped";
  let activityLogSkippedReason = plan.activityLog.skippedReason;
  let activityOutcome: ActivityPersistenceOutcome | undefined;

  if (plan.liveActivity.kind === "ready_online") {
    await deps.broadcastReadyOnline(agentId);
    liveActivityOutcome = "applied";
    activityLogSkippedReason ??= "online_recovery_may_be_persisted_by_broadcast_ready_online";
  } else if (plan.liveActivity.kind === "emit") {
    const shouldEmit = shouldEmitLiveActivity({
      liveActivity: plan.liveActivity,
      nextStatus: plan.sideEffects?.updateCache?.status,
      stopSent,
    });
    if (shouldEmit) {
      const result = deps.broadcastActivity(
        agentId,
        plan.liveActivity.activity,
        plan.liveActivity.detail,
        plan.liveActivity.entries,
        undefined,
        { dedupeKey: plan.liveActivity.dedupeKey },
      );
      liveActivityResult = result;
      activityOutcome = await result.persistence;
      liveActivityOutcome = "applied";
      activityLogOutcome = activityOutcome ?? "skipped";
    } else {
      liveActivitySkippedReason = "no_visible_activity_for_internal_stop";
      activityLogSkippedReason ??= "no_visible_activity_for_internal_stop";
    }
  } else {
    liveActivitySkippedReason = plan.liveActivity.skippedReason;
    activityLogSkippedReason ??= plan.liveActivity.skippedReason;
  }

  recordLifecycleProjectionTrace(span, plan, {
    activityLogOutcome,
    activityLogSkippedReason,
    liveActivityOutcome,
    liveActivitySkippedReason,
  });

  return { activityOutcome, liveActivityResult, stopSent };
}

function recordLifecycleProjectionTrace(
  span: ActiveSpan | null | undefined,
  plan: AgentLifecycleProjectionPlan,
  outcomes: {
    activityLogOutcome: CreateAgentLifecycleProjectionInput["outcome"];
    activityLogSkippedReason?: string;
    liveActivityOutcome: CreateAgentLifecycleProjectionInput["outcome"];
    liveActivitySkippedReason?: string;
  },
) {
  if (!span) return;
  const projections: CreateAgentLifecycleProjectionInput[] = [
    {
      projectionKind: "db_status",
      outcome: plan.dbStatus.kind === "apply" ? "applied" : "skipped",
      ...(plan.dbStatus.kind === "skip" ? { skippedReason: plan.dbStatus.skippedReason } : {}),
      attrs: plan.dbStatus.attrs,
    },
    {
      projectionKind: "wake_eligibility",
      outcome: "applied",
      attrs: {
        ...plan.wakeEligibility.attrs,
        wake_eligibility: plan.wakeEligibility.eligible,
        ...(plan.wakeEligibility.blockReason ? { wake_block_reason: plan.wakeEligibility.blockReason } : {}),
      },
    },
    {
      projectionKind: "live_activity",
      outcome: outcomes.liveActivityOutcome,
      ...(outcomes.liveActivitySkippedReason ? { skippedReason: outcomes.liveActivitySkippedReason } : {}),
      attrs: liveActivityTraceAttrs(plan),
    },
    {
      projectionKind: "activity_log",
      outcome: outcomes.activityLogOutcome,
      ...(plan.activityLog.dedupeKey ? { dedupeKey: plan.activityLog.dedupeKey } : {}),
      ...(outcomes.activityLogSkippedReason ? { skippedReason: outcomes.activityLogSkippedReason } : {}),
      attrs: {
        ...plan.activityLog.attrs,
        label_kind: plan.activityLog.labelKind,
      },
    },
  ];

  span.addEvent(AGENT_LIFECYCLE_EVENT_TRACE_NAME, toAgentLifecycleEventTraceAttrs(plan.event));
  for (const row of createAgentLifecycleProjectionTraceRows(plan.event, projections)) {
    span.addEvent(AGENT_LIFECYCLE_PROJECTION_TRACE_NAME, toAgentLifecycleProjectionTraceAttrs(row));
  }
}

function liveActivityTraceAttrs(plan: AgentLifecycleProjectionPlan): AgentLifecycleTraceAttrs {
  if (plan.liveActivity.kind === "ready_online") {
    return {
      ...plan.liveActivity.attrs,
      activity_status: "online",
      detail_kind: plan.liveActivity.detailKind,
    };
  }
  if (plan.liveActivity.kind === "emit") {
    return {
      ...plan.liveActivity.attrs,
      activity_status: plan.liveActivity.activity,
      detail_kind: plan.liveActivity.detailKind,
    };
  }
  return plan.liveActivity.attrs ?? {};
}
