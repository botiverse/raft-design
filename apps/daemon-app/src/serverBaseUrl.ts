export function normalizeServerOrigin(rawUrl: string): string {
  const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  const parsed = new URL(withProtocol);
  return parsed.origin;
}

const API_ORIGIN_OVERRIDES: Record<string, string> = {
  "https://app.slock.ai": "https://api.slock.ai",
  "https://slock-app-staging.botiverse.dev": "https://slock-server-staging.fly.dev",
};

export function resolveDaemonApiBaseUrl(rawUrl: string): string {
  const origin = normalizeServerOrigin(rawUrl);
  if (API_ORIGIN_OVERRIDES[origin]) {
    return API_ORIGIN_OVERRIDES[origin];
  }

  const parsed = new URL(origin);
  if ((parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") && parsed.port === "5173") {
    parsed.port = "3001";
    return parsed.origin;
  }

  if (parsed.hostname.startsWith("app.")) {
    parsed.hostname = `api.${parsed.hostname.slice(4)}`;
    return parsed.origin;
  }

  return origin;
}

export function daemonApiBasesMatch(leftUrl: string, rightUrl: string): boolean {
  return resolveDaemonApiBaseUrl(leftUrl) === resolveDaemonApiBaseUrl(rightUrl);
}
