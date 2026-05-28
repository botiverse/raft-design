import assert from "node:assert/strict";
import test from "node:test";
import { createAgentLifecycleEvent } from "./agentLifecycleEvents.js";
import {
  buildAgentLifecycleStateSnapshot,
  reduceDaemonActivityLifecycle,
  reduceDaemonSessionLifecycle,
  reduceDaemonStatusLifecycle,
  reduceMachineDisconnectLifecycle,
  reduceReadyReconcileLifecycle,
  reduceRuntimeProfileControlLifecycle,
  reduceStartLifecycle,
  reduceStopLifecycle,
  shouldEmitLiveActivity,
} from "./agentLifecycleReducer.js";

function state(input: Parameters<typeof buildAgentLifecycleStateSnapshot>[0]) {
  return buildAgentLifecycleStateSnapshot({
    machineId: "machine-1",
    ...input,
  });
}

function lifecycleEvent() {
  return createAgentLifecycleEvent(
    {
      serverId: "server-1",
      agentId: "agent-1",
      machineId: "machine-1",
      eventType: "runtime_interrupted",
      actor: "daemon",
      source: "ready_reconcile",
      reason: "daemon_restart",
      correlationId: "correlation-1",
      occurredAt: "2026-05-13T00:00:00.000Z",
    },
    { createId: () => "event-1" },
  );
}

test("ready reconcile reducer keeps manual stopped agents wake-ineligible", () => {
  const plan = reduceReadyReconcileLifecycle({
    action: "force-stop-and-stay-offline",
    activityDedupeKey: "dedupe-1",
    event: lifecycleEvent(),
    state: state({ dbStatus: "stopped" }),
  });

  assert.equal(plan.dbStatus.kind, "skip");
  assert.equal(plan.wakeEligibility.eligible, false);
  assert.equal(plan.wakeEligibility.blockReason, "manual_stopped");
  assert.deepEqual(plan.sideEffects, {
    sendStopToMachine: "best_effort",
    updateCache: { machineId: "machine-1", status: "stopped" },
  });
  assert.deepEqual(plan.liveActivity, {
    kind: "emit",
    activity: "offline",
    detail: "Stopped",
    dedupeKey: "dedupe-1",
    detailKind: "stopped",
  });
});

test("ready reconcile reducer keeps missing active runtime wakeable and online", () => {
  const plan = reduceReadyReconcileLifecycle({
    action: "mark-wakeable-not-running",
    activityDedupeKey: "dedupe-2",
    event: lifecycleEvent(),
    state: state({ dbStatus: "active", runtimeState: "not_running" }),
  });

  assert.deepEqual(plan.dbStatus, {
    kind: "skip",
    skippedReason: "runtime_absent_but_agent_wakeable",
    attrs: { legacy_status: "active", runtime_state: "not_running" },
  });
  assert.deepEqual(plan.wakeEligibility, { eligible: true });
  assert.deepEqual(plan.sideEffects, {
    clearLaunchGuard: true,
    releaseWakeLock: true,
    updateCache: { machineId: "machine-1", runtimeState: "not_running", status: "active" },
  });
  assert.equal(plan.liveActivity.kind, "ready_online");
  assert.equal(plan.activityLog.labelKind, "ready_wakeable_not_running");
});

test("machine disconnect reducer preserves status but blocks wake on reachability", () => {
  const plan = reduceMachineDisconnectLifecycle({
    activityDedupeKey: "disconnect-dedupe",
    event: lifecycleEvent(),
    state: state({
      dbStatus: "active",
      machineReachability: "unreachable",
      runtimeState: "interrupted",
    }),
  });

  assert.equal(plan.dbStatus.kind, "skip");
  assert.equal(plan.dbStatus.attrs?.machine_reachability, "unreachable");
  assert.equal(plan.wakeEligibility.eligible, false);
  assert.equal(plan.wakeEligibility.blockReason, "machine_unreachable");
  assert.equal(plan.liveActivity.kind, "emit");
  assert.equal(plan.liveActivity.kind === "emit" ? plan.liveActivity.detail : null, "Machine disconnected");
});

test("manual stop reducer makes silence explicit via wake block and visible activity", () => {
  const plan = reduceStopLifecycle({
    activityDedupeKey: "stop-dedupe",
    event: lifecycleEvent(),
    nextStatus: "stopped",
    state: state({
      dbStatus: "active",
      intentState: "manual_stopped",
      runtimeState: "not_running",
    }),
  });

  assert.deepEqual(plan.dbStatus, {
    kind: "apply",
    status: "stopped",
    writer: "direct",
    attrs: {
      intent_state: "manual_stopped",
      legacy_status: "stopped",
      runtime_state: "not_running",
    },
  });
  assert.equal(plan.wakeEligibility.eligible, false);
  assert.equal(plan.wakeEligibility.blockReason, "manual_stopped");
  assert.equal(shouldEmitLiveActivity({
    liveActivity: plan.liveActivity,
    nextStatus: "stopped",
    stopSent: true,
  }), true);
});

test("internal stop only emits stopped activity if the daemon stop could not be sent", () => {
  const plan = reduceStopLifecycle({
    activityDedupeKey: "stop-dedupe",
    event: lifecycleEvent(),
    nextStatus: "inactive",
    state: state({
      dbStatus: "active",
      intentState: "running_allowed",
      runtimeState: "not_running",
    }),
  });

  assert.equal(shouldEmitLiveActivity({
    liveActivity: plan.liveActivity,
    nextStatus: "inactive",
    stopSent: true,
  }), false);
  assert.equal(shouldEmitLiveActivity({
    liveActivity: plan.liveActivity,
    nextStatus: "inactive",
    stopSent: false,
  }), true);
});

test("runtime profile migration gate is control-only and wake-ineligible", () => {
  const plan = reduceRuntimeProfileControlLifecycle({
    event: lifecycleEvent(),
    state: state({ controlGate: "runtime_profile_migration", dbStatus: "active" }),
  });

  assert.deepEqual(plan.dbStatus, {
    kind: "skip",
    skippedReason: "control_gate_only",
    attrs: { control_gate: "runtime_profile_migration" },
  });
  assert.equal(plan.wakeEligibility.eligible, false);
  assert.equal(plan.wakeEligibility.blockReason, "control_gate");
  assert.equal(plan.liveActivity.kind, "skip");
});

test("start reducer owns active starting projection", () => {
  const plan = reduceStartLifecycle({
    event: lifecycleEvent(),
    state: state({ dbStatus: "inactive", runtimeState: "starting" }),
  });

  assert.deepEqual(plan.dbStatus, {
    kind: "apply",
    status: "active",
    writer: "direct",
    attrs: {
      intent_state: "running_allowed",
      legacy_status: "active",
      previous_status: "inactive",
      runtime_state: "starting",
    },
  });
  assert.deepEqual(plan.wakeEligibility, { eligible: true });
  assert.deepEqual(plan.sideEffects, { updateCache: { runtimeState: "starting", status: "active" } });
  assert.deepEqual(plan.liveActivity, {
    kind: "emit",
    activity: "working",
    detail: "Starting…",
    detailKind: "runtime_starting",
  });
  assert.equal(plan.activityLog.labelKind, "runtime_starting");
});

test("daemon activity reducer emits activity without changing DB status", () => {
  const plan = reduceDaemonActivityLifecycle({
    action: "broadcast-activity",
    activity: "working",
    detail: "Message received",
    entries: [{ kind: "status", activity: "working", detail: "Message received" }],
    event: lifecycleEvent(),
    state: state({ dbStatus: "active", runtimeState: "working" }),
  });

  assert.deepEqual(plan.dbStatus, {
    kind: "skip",
    skippedReason: "daemon_activity_does_not_change_db_status",
    attrs: { activity_status: "working" },
  });
  assert.deepEqual(plan.wakeEligibility, { eligible: true });
  assert.equal(plan.liveActivity.kind, "emit");
  assert.equal(plan.liveActivity.kind === "emit" ? plan.liveActivity.detailKind : null, "daemon_activity");
  assert.equal(plan.activityLog.labelKind, "daemon_activity");
});

test("daemon activity reducer restores inactive agents when live runtime activity resumes", () => {
  const plan = reduceDaemonActivityLifecycle({
    action: "broadcast-activity",
    activity: "thinking",
    detail: "Resumed output",
    event: lifecycleEvent(),
    state: state({ dbStatus: "inactive", runtimeState: "thinking" }),
  });

  assert.deepEqual(plan.sideEffects, { updateCache: { runtimeState: "thinking", status: "active" } });
  assert.deepEqual(plan.dbStatus, {
    kind: "apply",
    status: "active",
    writer: "signal",
    attrs: {
      activity_status: "thinking",
      legacy_status: "inactive",
      runtime_state: "thinking",
    },
  });
  assert.deepEqual(plan.wakeEligibility, { eligible: true });
  assert.equal(plan.liveActivity.kind, "emit");
  assert.equal(plan.activityLog.labelKind, "daemon_activity");
});

test("daemon activity reducer does not restore inactive agents from offline or error activity", () => {
  for (const activity of ["offline", "error"] as const) {
    const plan = reduceDaemonActivityLifecycle({
      action: "broadcast-activity",
      activity,
      detail: activity,
      event: lifecycleEvent(),
      state: state({ dbStatus: "inactive", runtimeState: activity === "offline" ? "interrupted" : "crashed" }),
    });

    assert.deepEqual(plan.sideEffects, {
      updateCache: { runtimeState: activity === "offline" ? "interrupted" : "crashed" },
    });
    assert.deepEqual(plan.dbStatus, {
      kind: "skip",
      skippedReason: "daemon_activity_does_not_change_db_status",
      attrs: { activity_status: activity },
    });
  }
});

test("daemon activity reducer suppresses manually stopped agents", () => {
  const plan = reduceDaemonActivityLifecycle({
    action: "ignore",
    activity: "online",
    detail: "",
    event: lifecycleEvent(),
    state: state({ dbStatus: "stopped" }),
  });

  assert.equal(plan.dbStatus.kind, "skip");
  assert.equal(plan.wakeEligibility.eligible, false);
  assert.equal(plan.wakeEligibility.blockReason, "manual_stopped");
  assert.equal(plan.liveActivity.kind, "skip");
  assert.equal(plan.liveActivity.kind === "skip" ? plan.liveActivity.skippedReason : null, "manual_stopped_ignores_daemon_activity");
});

test("reset-window ignored status signal projects wake-ineligible", () => {
  const plan = reduceDaemonStatusLifecycle({
    action: "ignore",
    event: lifecycleEvent(),
    state: state({ dbStatus: "active", resetMode: "restart" }),
  });

  assert.equal(plan.dbStatus.kind, "skip");
  assert.equal(plan.wakeEligibility.eligible, false);
  assert.equal(plan.wakeEligibility.blockReason, "reset_window");
  assert.equal(plan.liveActivity.kind, "skip");
  assert.equal(plan.liveActivity.kind === "skip" ? plan.liveActivity.skippedReason : null, "reset_window_ignores_daemon_status");
});

test("reset-window ignored session signal projects wake-ineligible", () => {
  const plan = reduceDaemonSessionLifecycle({
    action: "ignore",
    event: lifecycleEvent(),
    sessionId: "session-1",
    state: state({ dbStatus: "active", resetMode: "restart" }),
  });

  assert.equal(plan.dbStatus.kind, "skip");
  assert.equal(plan.wakeEligibility.eligible, false);
  assert.equal(plan.wakeEligibility.blockReason, "reset_window");
  assert.equal(plan.liveActivity.kind, "skip");
  assert.equal(plan.liveActivity.kind === "skip" ? plan.liveActivity.skippedReason : null, "reset_window_ignores_daemon_session");
});

test("reset-window ignored activity signal projects wake-ineligible", () => {
  const plan = reduceDaemonActivityLifecycle({
    action: "ignore",
    activity: "working",
    detail: "Still working",
    event: lifecycleEvent(),
    state: state({ dbStatus: "active", resetMode: "restart" }),
  });

  assert.equal(plan.dbStatus.kind, "skip");
  assert.equal(plan.wakeEligibility.eligible, false);
  assert.equal(plan.wakeEligibility.blockReason, "reset_window");
  assert.equal(plan.liveActivity.kind, "skip");
  assert.equal(plan.liveActivity.kind === "skip" ? plan.liveActivity.skippedReason : null, "reset_window_ignores_daemon_activity");
});
