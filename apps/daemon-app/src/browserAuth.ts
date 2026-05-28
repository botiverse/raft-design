import type { StoredUserSession } from "./secretStore";

export function extractBrowserAuthSession(payload: unknown): StoredUserSession | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const value = payload as {
    accessToken?: unknown;
    refreshToken?: unknown;
  };

  if (typeof value.accessToken !== "string" || typeof value.refreshToken !== "string") {
    return null;
  }

  const accessToken = value.accessToken.trim();
  const refreshToken = value.refreshToken.trim();
  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
}
