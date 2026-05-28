import type { MachineAssignedAgent } from "./model";
import { resolveDaemonApiBaseUrl } from "./serverBaseUrl";
import { readJsonErrorMessage, readJsonResponse } from "./serverResponse";

interface MachineAgentResponse {
  id: string;
  name: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  description?: string | null;
  status: "active" | "inactive" | "stopped";
  activity: string;
  activityDetail?: string | null;
  model: string;
  runtime: string;
  executionMode: "byoc" | "cloud";
}

export type FetchLike = typeof fetch;

export async function fetchMachineAgents(
  serverId: string,
  serverUrl: string,
  apiKey: string,
  fetchImpl: FetchLike = fetch,
): Promise<MachineAssignedAgent[]> {
  const apiBaseUrl = resolveDaemonApiBaseUrl(serverUrl);
  let response: Response;
  try {
    response = await fetchImpl(new URL("/internal/machine/agents", apiBaseUrl), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  } catch {
    throw new Error("Failed to reach the Slock server while loading machine-assigned agents.");
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error("This machine API key was rejected while loading assigned agents.");
  }

  if (!response.ok) {
    throw new Error(
      await readJsonErrorMessage(response, `Failed to load machine-assigned agents (${response.status}).`),
    );
  }

  const payload = await readJsonResponse<unknown>(
    response,
    "The Slock server returned an invalid machine agent response.",
  );
  if (!Array.isArray(payload)) {
    throw new Error("The Slock server returned an invalid machine agent response.");
  }

  return payload.map((entry) => normalizeMachineAgent(serverId, entry));
}

export async function startMachineAssignedAgent(
  serverUrl: string,
  apiKey: string,
  agentId: string,
  fetchImpl: FetchLike = fetch,
): Promise<void> {
  return sendMachineAgentAction(serverUrl, apiKey, agentId, "start", fetchImpl);
}

export async function stopMachineAssignedAgent(
  serverUrl: string,
  apiKey: string,
  agentId: string,
  fetchImpl: FetchLike = fetch,
): Promise<void> {
  return sendMachineAgentAction(serverUrl, apiKey, agentId, "stop", fetchImpl);
}

function normalizeMachineAgent(serverId: string, payload: unknown): MachineAssignedAgent {
  if (!payload || typeof payload !== "object") {
    throw new Error("The Slock server returned an invalid machine agent response.");
  }

  const raw = payload as Partial<MachineAgentResponse>;
  if (
    !raw.id ||
    !raw.name ||
    !raw.status ||
    !raw.activity ||
    !raw.model ||
    !raw.runtime ||
    !raw.executionMode
  ) {
    throw new Error("The Slock server returned an invalid machine agent response.");
  }

  return {
    serverId,
    id: raw.id,
    name: raw.name,
    displayName: raw.displayName ?? null,
    avatarUrl: raw.avatarUrl ?? null,
    description: raw.description ?? null,
    status: raw.status,
    activity: raw.activity,
    activityDetail: raw.activityDetail ?? "",
    model: raw.model,
    runtime: raw.runtime,
    executionMode: raw.executionMode,
  };
}

async function sendMachineAgentAction(
  serverUrl: string,
  apiKey: string,
  agentId: string,
  action: "start" | "stop",
  fetchImpl: FetchLike,
): Promise<void> {
  const apiBaseUrl = resolveDaemonApiBaseUrl(serverUrl);
  let response: Response;
  try {
    response = await fetchImpl(
      new URL(`/internal/machine/agents/${agentId}/${action}`, apiBaseUrl),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );
  } catch {
    throw new Error(`Failed to reach the Slock server while trying to ${action} this agent.`);
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error(`This machine API key was rejected while trying to ${action} this agent.`);
  }

  if (!response.ok) {
    throw new Error(await readJsonErrorMessage(response, `Failed to ${action} this agent (${response.status}).`));
  }
}
