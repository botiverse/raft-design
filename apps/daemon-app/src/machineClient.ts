import type { MachineShellState } from "./model";
import { resolveDaemonApiBaseUrl } from "./serverBaseUrl";
import { readJsonErrorMessage, readJsonResponse } from "./serverResponse";

interface MachineSelfResponse {
  id: string;
  workspaceId: string | null;
  workspaceName: string | null;
  serverSlug: string | null;
  name: string;
  status: "online" | "offline";
  apiKeyPrefix: string | null;
  runtimes: string[];
  hostname: string | null;
  os: string | null;
  daemonVersion: string | null;
  latestDaemonVersion: string | null;
  lastHeartbeat: string | null;
}

export type FetchLike = typeof fetch;

export async function fetchMachineSelf(
  serverId: string,
  serverUrl: string,
  apiKey: string,
  fetchImpl: FetchLike = fetch,
): Promise<MachineShellState> {
  const apiBaseUrl = resolveDaemonApiBaseUrl(serverUrl);
  let response: Response;
  try {
    response = await fetchImpl(new URL("/internal/machine/self", apiBaseUrl), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  } catch {
    throw new Error("Failed to reach the Slock server while verifying this machine API key.");
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error("This machine API key was rejected by the Slock server.");
  }

  if (!response.ok) {
    throw new Error(await readJsonErrorMessage(response, `Failed to verify machine API key (${response.status}).`));
  }

  const payload = await readJsonResponse<Partial<MachineSelfResponse>>(
    response,
    "The Slock server returned an invalid machine response.",
  );
  if (!payload.id || !payload.name || !payload.status) {
    throw new Error("The Slock server returned an invalid machine response.");
  }

  return {
    serverId,
    machineId: payload.id,
    workspaceId: payload.workspaceId ?? null,
    workspaceName: payload.workspaceName ?? null,
    serverSlug: payload.serverSlug ?? null,
    name: payload.name,
    status: payload.status,
    apiKeyPrefix: payload.apiKeyPrefix ?? null,
    runtimes: payload.runtimes ?? [],
    hostname: payload.hostname ?? null,
    os: payload.os ?? null,
    daemonVersion: payload.daemonVersion ?? null,
    latestDaemonVersion: payload.latestDaemonVersion ?? null,
    lastHeartbeat: payload.lastHeartbeat ?? null,
  };
}
