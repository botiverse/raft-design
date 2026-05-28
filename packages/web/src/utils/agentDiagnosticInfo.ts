import type { Agent, AgentActivityState, ActivityLogEntry } from "../store/agentStore";
import type { Machine } from "../store/machineStore";

type DiagnosticAgent = Pick<Agent, "id" | "machineId" | "runtime" | "model" | "status">;
type DiagnosticMachine = Pick<Machine, "id" | "daemonVersion">;

export interface BuildAgentDiagnosticInfoOptions {
  agent: DiagnosticAgent;
  serverId: string | null | undefined;
  machine: DiagnosticMachine | null | undefined;
  activityState: AgentActivityState | null | undefined;
  activityLog: ActivityLogEntry[];
  reportedAt?: Date;
}

function formatIso(value: Date | number | null | undefined): string {
  if (value == null) return "unknown";
  const date = typeof value === "number" ? new Date(value) : value;
  const time = date.getTime();
  return Number.isFinite(time) ? date.toISOString() : "unknown";
}

function valueOrUnknown(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "unknown";
}

export function classifyDiagnosticActivityKind(
  activity: string | null | undefined,
  detail: string | null | undefined,
): string {
  if (detail?.startsWith("Runtime stalled: no runtime events for ")) return "runtime_stalled";
  if (detail === "Message received") return "message_received";
  if (detail === "Starting…") return "starting";
  if (detail === "Running command…") return "running_command";
  if (detail === "Checking messages…") return "checking_messages";
  if (detail === "Compacting context") return "compacting_context";
  if (detail === "Context compaction finished") return "compaction_finished";
  if (detail === "Context compaction still running; no finish event observed") return "compaction_stale";
  if (activity === "error") return "error";
  if (activity === "offline") return "offline";
  if (activity === "online") return "online";
  if (activity === "working") return "working";
  if (activity === "thinking") return "thinking";
  return "other";
}

export function buildAgentDiagnosticInfo({
  agent,
  serverId,
  machine,
  activityState,
  activityLog,
  reportedAt = new Date(),
}: BuildAgentDiagnosticInfoOptions): string {
  const latestActivity = activityLog.at(-1);
  const activity = activityState?.activity ?? "unknown";
  const detail = activityState?.activityDetail ?? "";
  const activityKind = classifyDiagnosticActivityKind(activity, detail);

  return [
    "Slock Diagnostic Info",
    `reportedAtUtc: ${formatIso(reportedAt)}`,
    `serverId: ${valueOrUnknown(serverId)}`,
    `agentId: ${agent.id}`,
    `machineId: ${valueOrUnknown(agent.machineId ?? machine?.id)}`,
    `runtime: ${valueOrUnknown(agent.runtime)}`,
    `model: ${valueOrUnknown(agent.model)}`,
    `daemonVersion: ${valueOrUnknown(machine?.daemonVersion)}`,
    `agentStatus: ${valueOrUnknown(agent.status)}`,
    `activity: ${valueOrUnknown(activity)}`,
    `activityKind: ${activityKind}`,
    `lastActivityAtUtc: ${formatIso(latestActivity?.timestamp)}`,
  ].join("\n");
}
