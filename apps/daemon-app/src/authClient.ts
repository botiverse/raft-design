import type { RemoteMachineOption, RemoteServerOption } from "./model";
import type { StoredUserSession } from "./secretStore";
import { resolveDaemonApiBaseUrl } from "./serverBaseUrl";
import { readJsonErrorMessage, readJsonResponse } from "./serverResponse";

interface AuthenticatedUserResponse {
  id: string;
  name: string;
  displayName?: string | null;
  email?: string | null;
}

interface RemoteServerResponse {
  id: string;
  name: string;
  slug: string;
  role?: string;
}

interface RegisterMachineResponse {
  apiKey: string;
  machine: {
    id: string;
    name: string;
  };
}

interface RemoteMachineResponse {
  id: string;
  name: string;
  status: "online" | "offline";
  apiKeyPrefix?: string | null;
  runtimes?: string[] | null;
  daemonVersion?: string | null;
  lastHeartbeat?: string | null;
}

interface ListRemoteMachinesResponse {
  machines?: Partial<RemoteMachineResponse>[];
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  displayName: string | null;
  email: string | null;
}

export interface ResolvedRemoteContext {
  session: StoredUserSession;
  user: AuthenticatedUser;
  servers: RemoteServerOption[];
}

export type FetchLike = typeof fetch;

export class AuthRejectedError extends Error {}

export function getAuthenticatedUserLabel(user: AuthenticatedUser): string {
  return user.displayName?.trim() || user.name.trim() || user.email?.trim() || "Signed in";
}

export function selectRemoteServer(
  remoteServers: RemoteServerOption[],
  previousServerId: string | null,
  preferredServerSlug: string | null = null,
): RemoteServerOption | null {
  if (previousServerId) {
    const existing = remoteServers.find((entry) => entry.id === previousServerId);
    if (existing) {
      return existing;
    }
  }

  if (preferredServerSlug) {
    const slugMatch = remoteServers.find((entry) => entry.slug === preferredServerSlug);
    if (slugMatch) {
      return slugMatch;
    }
  }

  if (remoteServers.length === 1) {
    return remoteServers[0];
  }

  return null;
}

export async function resolveRemoteContext(
  serverUrl: string,
  session: StoredUserSession,
  fetchImpl: FetchLike = fetch,
): Promise<ResolvedRemoteContext> {
  try {
    const [user, servers] = await Promise.all([
      fetchAuthenticatedUser(serverUrl, session.accessToken, fetchImpl),
      listAccessibleServers(serverUrl, session.accessToken, fetchImpl),
    ]);
    return { session, user, servers };
  } catch (error) {
    if (!(error instanceof AuthRejectedError)) {
      throw error;
    }

    const refreshedSession = await refreshUserSession(serverUrl, session.refreshToken, fetchImpl);
    const [user, servers] = await Promise.all([
      fetchAuthenticatedUser(serverUrl, refreshedSession.accessToken, fetchImpl),
      listAccessibleServers(serverUrl, refreshedSession.accessToken, fetchImpl),
    ]);
    return { session: refreshedSession, user, servers };
  }
}

export async function registerMachineWithUserSession(
  serverUrl: string,
  session: StoredUserSession,
  remoteServerId: string,
  machineName: string,
  fetchImpl: FetchLike = fetch,
): Promise<{ session: StoredUserSession; apiKey: string; machineId: string; machineName: string }> {
  const apiBaseUrl = resolveDaemonApiBaseUrl(serverUrl);
  const result = await withUserSessionRefresh(serverUrl, session, fetchImpl, async (accessToken) => {
    const response = await authRequest(
      new URL(`/api/servers/${remoteServerId}/machines`, apiBaseUrl),
      accessToken,
      fetchImpl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: machineName }),
      },
      {
        network: "Failed to reach the Slock server while registering this machine.",
        fallback: "Failed to register this machine.",
      },
    );

    const payload = await readJsonResponse<Partial<RegisterMachineResponse>>(
      response,
      "The Slock server returned an invalid machine registration response.",
    );
    if (!payload.apiKey || !payload.machine?.id || !payload.machine?.name) {
      throw new Error("The Slock server returned an invalid machine registration response.");
    }

    return {
      apiKey: payload.apiKey,
      machineId: payload.machine.id,
      machineName: payload.machine.name,
    };
  });

  return {
    session: result.session,
    ...result.value,
  };
}

export async function listRemoteMachinesWithUserSession(
  serverUrl: string,
  session: StoredUserSession,
  localServerId: string,
  remoteServerId: string,
  fetchImpl: FetchLike = fetch,
): Promise<{ session: StoredUserSession; machines: RemoteMachineOption[] }> {
  const apiBaseUrl = resolveDaemonApiBaseUrl(serverUrl);
  const result = await withUserSessionRefresh(serverUrl, session, fetchImpl, async (accessToken) => {
    const response = await authRequest(
      new URL(`/api/servers/${remoteServerId}/machines`, apiBaseUrl),
      accessToken,
      fetchImpl,
      undefined,
      {
        network: "Failed to reach the Slock server while loading existing machines.",
        fallback: "Failed to load existing machines.",
      },
    );
    const payload = await readJsonResponse<ListRemoteMachinesResponse>(
      response,
      "The Slock server returned an invalid machine list.",
    );
    if (!Array.isArray(payload.machines)) {
      throw new Error("The Slock server returned an invalid machine list.");
    }

    return payload.machines
      .filter(
        (entry): entry is RemoteMachineResponse =>
          Boolean(entry?.id && entry.name && (entry.status === "online" || entry.status === "offline")),
      )
      .map((entry) => ({
        localServerId,
        id: entry.id,
        name: entry.name,
        status: entry.status,
        apiKeyPrefix: entry.apiKeyPrefix ?? null,
        runtimes: entry.runtimes ?? [],
        daemonVersion: entry.daemonVersion ?? null,
        lastHeartbeat: entry.lastHeartbeat ?? null,
      }));
  });

  return {
    session: result.session,
    machines: result.value,
  };
}

export async function rotateMachineKeyWithUserSession(
  serverUrl: string,
  session: StoredUserSession,
  remoteServerId: string,
  machineId: string,
  fetchImpl: FetchLike = fetch,
): Promise<{ session: StoredUserSession; apiKey: string }> {
  const apiBaseUrl = resolveDaemonApiBaseUrl(serverUrl);
  const result = await withUserSessionRefresh(serverUrl, session, fetchImpl, async (accessToken) => {
    const response = await authRequest(
      new URL(`/api/servers/${remoteServerId}/machines/${machineId}/rotate-key`, apiBaseUrl),
      accessToken,
      fetchImpl,
      {
        method: "POST",
      },
      {
        network: "Failed to reach the Slock server while rotating this machine key.",
        fallback: "Failed to rotate this machine key.",
      },
    );
    const payload = await readJsonResponse<{ apiKey?: string }>(
      response,
      "The Slock server returned an invalid machine key rotation response.",
    );
    if (!payload.apiKey) {
      throw new Error("The Slock server returned an invalid machine key rotation response.");
    }
    return payload.apiKey;
  });

  return {
    session: result.session,
    apiKey: result.value,
  };
}

async function fetchAuthenticatedUser(
  serverUrl: string,
  accessToken: string,
  fetchImpl: FetchLike,
): Promise<AuthenticatedUser> {
  const response = await authGet(
    new URL("/api/auth/me", resolveDaemonApiBaseUrl(serverUrl)),
    accessToken,
    fetchImpl,
  );
  const payload = await readJsonResponse<Partial<AuthenticatedUserResponse>>(
    response,
    "The Slock server returned an invalid authenticated user.",
  );
  if (!payload.id || !payload.name) {
    throw new Error("The Slock server returned an invalid authenticated user.");
  }

  return {
    id: payload.id,
    name: payload.name,
    displayName: payload.displayName ?? null,
    email: payload.email ?? null,
  };
}

async function listAccessibleServers(
  serverUrl: string,
  accessToken: string,
  fetchImpl: FetchLike,
): Promise<RemoteServerOption[]> {
  const response = await authGet(
    new URL("/api/servers", resolveDaemonApiBaseUrl(serverUrl)),
    accessToken,
    fetchImpl,
  );
  const payload = await readJsonResponse<Partial<RemoteServerResponse>[]>(
    response,
    "The Slock server returned an invalid server list.",
  );
  if (!Array.isArray(payload)) {
    throw new Error("The Slock server returned an invalid server list.");
  }

  return payload
    .filter((entry): entry is RemoteServerResponse => Boolean(entry?.id && entry.name && entry.slug))
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      slug: entry.slug,
      role: entry.role ?? "member",
    }));
}

async function refreshUserSession(
  serverUrl: string,
  refreshToken: string,
  fetchImpl: FetchLike,
): Promise<StoredUserSession> {
  let response: Response;
  try {
    response = await fetchImpl(new URL("/api/auth/refresh", resolveDaemonApiBaseUrl(serverUrl)), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    throw new Error("Failed to reach the Slock server while refreshing the login session.");
  }

  if (response.status === 401 || response.status === 403) {
    throw new AuthRejectedError("The Slock login session is no longer valid.");
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `Failed to refresh the Slock login session (${response.status}).`));
  }

  const payload = await readJsonResponse<Partial<StoredUserSession>>(
    response,
    "The Slock server returned an invalid refresh response.",
  );
  if (!payload.accessToken || !payload.refreshToken) {
    throw new Error("The Slock server returned an invalid refresh response.");
  }

  return {
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  };
}

async function authGet(url: URL, accessToken: string, fetchImpl: FetchLike): Promise<Response> {
  return authRequest(url, accessToken, fetchImpl, undefined, {
    network: "Failed to reach the Slock server.",
    fallback: "Request failed.",
  });
}

async function withUserSessionRefresh<T>(
  serverUrl: string,
  session: StoredUserSession,
  fetchImpl: FetchLike,
  operation: (accessToken: string) => Promise<T>,
): Promise<{ session: StoredUserSession; value: T }> {
  try {
    return {
      session,
      value: await operation(session.accessToken),
    };
  } catch (error) {
    if (!(error instanceof AuthRejectedError)) {
      throw error;
    }

    const refreshedSession = await refreshUserSession(serverUrl, session.refreshToken, fetchImpl);
    return {
      session: refreshedSession,
      value: await operation(refreshedSession.accessToken),
    };
  }
}

async function authRequest(
  url: URL,
  accessToken: string,
  fetchImpl: FetchLike,
  init: RequestInit | undefined,
  messages: { network: string; fallback: string },
): Promise<Response> {
  let response: Response;
  try {
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    response = await fetchImpl(url, {
      ...init,
      headers,
    });
  } catch {
    throw new Error(messages.network);
  }

  if (response.status === 401 || response.status === 403) {
    throw new AuthRejectedError("The Slock login session is no longer valid.");
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, `${messages.fallback} (${response.status}).`));
  }

  return response;
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
  return readJsonErrorMessage(response, fallback);
}
