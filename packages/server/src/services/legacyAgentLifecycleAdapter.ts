// Design note: this module implements the legacy-input adapter from
// docs/server/agent-lifecycle-event-model-rfc.zh.html.
//
// Keep old daemon/server protocol compatibility here: translate ready reconcile,
// daemon status/session/activity, machine disconnect, start/stop, and control
// gate signals into canonical lifecycle events. Do not decide user-visible
// lifecycle semantics here. Status labels, wake eligibility, Activity Log rows,
// and lifecycle side effects belong in the reducer/projection writer boundary.
//
// Source discussion: #proj-runtime:4dbe9aa7.
//
// TODO(lifecycle-v2): Treat every function in this file as a deletion target,
// not as the long-term event model. The durable direction is to move each
// upstream producer to canonical lifecycle events with explicit reason,
// correlation/window identity, and state attrs:
// - server producers: ready reconcile, manual start/stop, machine disconnect,
//   runtime-profile gates, and delivery wake planning;
// - daemon producers: agent status/activity/session, runtime stalled/provider
//   error/process exit, and reconnect/session resync.
// Once a producer emits the canonical event directly, delete the matching
// adapter branch and its orchestrator/daemon call-site TODO instead of
// extending this legacy mapping layer.
import { createAgentLifecycleEvent, type AgentLifecycleEvent, type AgentLifecycleReason } from "./agentLifecycleEvents.js";
import type { AgentActivity } from "@slock-ai/shared";
import type { ReadyReconcileLifecycleAction } from "./agentLifecycleReducer.js";

export interface LegacyLifecycleEventFactoryOptions {
  now: () => Date;
}

export interface AdaptReadyReconcileInput extends LegacyLifecycleEventFactoryOptions {
  action: ReadyReconcileLifecycleAction;
  agentId: string;
  agentStatus: string;
  connectionEpochId?: string;
  machineId: string;
  serverId: string;
}

export interface AdaptedLifecycleEvent {
  event: AgentLifecycleEvent;
}

export function adaptReadyReconcileLifecycleEvent(input: AdaptReadyReconcileInput): AdaptedLifecycleEvent {
  const eventType =
    input.action === "mark-active-online" ? "runtime_ready"
      : input.action === "mark-inactive-offline" ? "runtime_interrupted"
        : "ready_reconciled";
  const reason: AgentLifecycleReason =
    input.action === "mark-active-online" ? "daemon_ready"
      : input.action === "mark-inactive-offline" ? "daemon_restart"
        : input.action === "mark-wakeable-not-running" ? "missing_running_agent"
        : input.agentStatus === "stopped" ? "manual_stop"
          : "missing_running_agent";
  const correlationId = input.connectionEpochId ?? `machine:${input.machineId}:ready`;

  return {
    event: createAgentLifecycleEvent({
      serverId: input.serverId,
      agentId: input.agentId,
      machineId: input.machineId,
      eventType,
      actor: "daemon",
      source: "ready_reconcile",
      reason,
      correlationId,
      occurredAt: input.now(),
      attrs: {
        connection_epoch_present: Boolean(input.connectionEpochId),
        persisted_status: input.agentStatus,
        ready_action: input.action,
        source_protocol: "legacy_daemon",
      },
    }),
  };
}

export interface AdaptStartInput extends LegacyLifecycleEventFactoryOptions {
  agentId: string;
  launchId?: string | null;
  machineId: string;
  previousStatus?: string | null;
  serverId: string;
  startCause: "manual" | "message" | "resume";
}

export function adaptStartLifecycleEvent(input: AdaptStartInput): AdaptedLifecycleEvent {
  const reason: AgentLifecycleReason =
    input.startCause === "message" ? "lazy_wake"
      : input.startCause === "resume" ? "runtime_starting"
        : "manual_start";

  return {
    event: createAgentLifecycleEvent({
      serverId: input.serverId,
      agentId: input.agentId,
      machineId: input.machineId,
      ...(input.launchId ? { launchId: input.launchId } : {}),
      eventType: "runtime_spawned",
      actor: input.startCause === "manual" ? "human" : "server",
      source: input.startCause === "manual" ? "api" : "server",
      reason,
      correlationId: `agent:${input.agentId}:start:${input.launchId ?? "legacy"}`,
      occurredAt: input.now(),
      attrs: {
        launch_id_present: Boolean(input.launchId),
        previous_status: input.previousStatus ?? null,
        source_protocol: "server_legacy_action",
        start_cause: input.startCause,
      },
    }),
  };
}

export interface AdaptDaemonActivityInput extends LegacyLifecycleEventFactoryOptions {
  activity: AgentActivity;
  agentId: string;
  clientSeq?: number;
  currentStatus: string;
  hasEntries: boolean;
  launchId?: string | null;
  machineId: string;
  resetMode?: "restart" | "session" | "full" | null;
  serverId: string;
}

export function adaptDaemonActivityLifecycleEvent(input: AdaptDaemonActivityInput): AdaptedLifecycleEvent {
  return {
    event: createAgentLifecycleEvent({
      serverId: input.serverId,
      agentId: input.agentId,
      machineId: input.machineId,
      ...(input.launchId ? { launchId: input.launchId } : {}),
      eventType: "activity_changed",
      actor: "daemon",
      source: "daemon",
      reason: daemonActivityReason(input.activity),
      correlationId: [
        "agent",
        input.agentId,
        "daemonActivity",
        input.launchId ?? "legacy",
        input.clientSeq ?? "unsequenced",
      ].join(":"),
      occurredAt: input.now(),
      attrs: {
        activity_status: input.activity,
        client_seq_present: typeof input.clientSeq === "number",
        current_status: input.currentStatus,
        entries_present: input.hasEntries,
        reset_mode: input.resetMode ?? null,
        source_protocol: "legacy_daemon_activity",
      },
    }),
  };
}

function daemonActivityReason(activity: AgentActivity): AgentLifecycleReason {
  if (activity === "online") return "runtime_idle";
  if (activity === "error") return "runtime_crash";
  if (activity === "offline") return "runtime_exit";
  return "runtime_working";
}

export interface AdaptDaemonStatusInput extends LegacyLifecycleEventFactoryOptions {
  agentId: string;
  currentStatus: string;
  launchId?: string | null;
  machineId: string;
  normalizedStatus: "active" | "inactive";
  resetMode?: "restart" | "session" | "full" | null;
  serverId: string;
}

export function adaptDaemonStatusLifecycleEvent(input: AdaptDaemonStatusInput): AdaptedLifecycleEvent {
  return {
    event: createAgentLifecycleEvent({
      serverId: input.serverId,
      agentId: input.agentId,
      machineId: input.machineId,
      ...(input.launchId ? { launchId: input.launchId } : {}),
      eventType: input.normalizedStatus === "active" ? "runtime_ready" : "runtime_interrupted",
      actor: "daemon",
      source: "daemon",
      reason: input.normalizedStatus === "active" ? "runtime_idle" : "runtime_exit",
      correlationId: `agent:${input.agentId}:daemonStatus:${input.launchId ?? "legacy"}`,
      occurredAt: input.now(),
      attrs: {
        current_status: input.currentStatus,
        normalized_status: input.normalizedStatus,
        reset_mode: input.resetMode ?? null,
        source_protocol: "legacy_daemon_status",
      },
    }),
  };
}

export interface AdaptDaemonSessionInput extends LegacyLifecycleEventFactoryOptions {
  agentId: string;
  currentStatus: string;
  launchId?: string | null;
  machineId: string;
  resetMode?: "restart" | "session" | "full" | null;
  serverId: string;
}

export function adaptDaemonSessionLifecycleEvent(input: AdaptDaemonSessionInput): AdaptedLifecycleEvent {
  return {
    event: createAgentLifecycleEvent({
      serverId: input.serverId,
      agentId: input.agentId,
      machineId: input.machineId,
      ...(input.launchId ? { launchId: input.launchId } : {}),
      eventType: "runtime_ready",
      actor: "daemon",
      source: "daemon",
      reason: "runtime_idle",
      correlationId: `agent:${input.agentId}:daemonSession:${input.launchId ?? "legacy"}`,
      occurredAt: input.now(),
      attrs: {
        current_status: input.currentStatus,
        reset_mode: input.resetMode ?? null,
        session_present: true,
        source_protocol: "legacy_daemon_session",
      },
    }),
  };
}

export interface AdaptMachineDisconnectInput extends LegacyLifecycleEventFactoryOptions {
  agentId: string;
  disconnectCause: string;
  machineId: string;
  previousStatus: string;
  reason: "heartbeat_timeout" | "machine_disconnect";
  serverId: string;
  connectionEpochId?: string;
}

export function adaptMachineDisconnectLifecycleEvent(input: AdaptMachineDisconnectInput): AdaptedLifecycleEvent {
  return {
    event: createAgentLifecycleEvent({
      serverId: input.serverId,
      agentId: input.agentId,
      machineId: input.machineId,
      eventType: "machine_disconnected",
      actor: "server",
      source: "server",
      reason: input.reason,
      correlationId: `machine:${input.machineId}:disconnect:${input.connectionEpochId ?? "unknown"}`,
      occurredAt: input.now(),
      attrs: {
        disconnect_cause: input.disconnectCause,
        previous_status: input.previousStatus,
        source_protocol: "server_legacy_signal",
      },
    }),
  };
}

export interface AdaptStopInput extends LegacyLifecycleEventFactoryOptions {
  agentId: string;
  machineId: string | null;
  nextStatus: string;
  previousStatus: string;
  reason: "internal" | "manual";
  serverId: string;
  stopCorrelationId: string;
}

export function adaptStopLifecycleEvent(input: AdaptStopInput): AdaptedLifecycleEvent {
  return {
    event: createAgentLifecycleEvent({
      serverId: input.serverId,
      agentId: input.agentId,
      ...(input.machineId ? { machineId: input.machineId } : {}),
      eventType: input.reason === "manual" ? "manual_stop_requested" : "runtime_interrupted",
      actor: input.reason === "manual" ? "human" : "server",
      source: input.reason === "manual" ? "api" : "server",
      reason: input.reason === "manual" ? "manual_stop" : "runtime_exit",
      correlationId: input.stopCorrelationId,
      occurredAt: input.now(),
      attrs: {
        next_status: input.nextStatus,
        previous_status: input.previousStatus,
        source_protocol: "server_legacy_action",
      },
    }),
  };
}

export interface AdaptRuntimeProfileControlInput extends LegacyLifecycleEventFactoryOptions {
  agentId: string;
  attrs?: Record<string, boolean | number | string | null | undefined>;
  controlGate: "open" | "runtime_profile_migration";
  launchId?: string | null;
  machineId?: string | null;
  pendingKeyHash?: string;
  serverId: string;
  source: "runtime" | "server";
}

export function adaptRuntimeProfileControlLifecycleEvent(
  input: AdaptRuntimeProfileControlInput,
): AdaptedLifecycleEvent {
  return {
    event: createAgentLifecycleEvent({
      serverId: input.serverId,
      agentId: input.agentId,
      ...(input.machineId ? { machineId: input.machineId } : {}),
      ...(input.launchId ? { launchId: input.launchId } : {}),
      eventType: "runtime_profile_control_changed",
      actor: input.source === "runtime" ? "agent" : "server",
      source: input.source,
      reason: "migration_pending",
      correlationId: `agent:${input.agentId}:runtimeProfileMigration:${input.pendingKeyHash ?? "unknown"}`,
      occurredAt: input.now(),
      attrs: {
        ...input.attrs,
        control_gate: input.controlGate,
        pending_key_hash: input.pendingKeyHash,
        pending_key_present: Boolean(input.pendingKeyHash),
        source_protocol: "server_runtime_profile",
      },
    }),
  };
}
