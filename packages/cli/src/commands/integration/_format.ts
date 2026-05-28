export interface RegisteredIntegrationService {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  homepageUrl: string | null;
  returnUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActiveAgentLogin {
  id: string;
  serviceId: string;
  clientId: string;
  name: string;
  description: string | null;
  homepageUrl: string | null;
  returnUrl: string | null;
  scopes: string[];
  createdAt: string;
}

export interface IntegrationListResponse {
  services: RegisteredIntegrationService[];
  activeLogins: ActiveAgentLogin[];
}

export interface IntegrationLoginResponse {
  status: "logged_in" | "already_logged_in";
  service: RegisteredIntegrationService;
  scopes: string[];
  requestId: string;
}

function formatMaybe(value: string | null | undefined): string {
  return value?.trim() || "-";
}

function buildAgentAppUrl(returnUrl: string | null | undefined, requestId: string): string | null {
  if (!returnUrl?.trim()) return null;
  try {
    const url = new URL(returnUrl);
    url.searchParams.set("code", requestId);
    return url.toString();
  } catch {
    return null;
  }
}

export function formatIntegrationList(data: IntegrationListResponse): string {
  const activeByServiceId = new Map(data.activeLogins.map((login) => [login.serviceId, login]));
  const lines: string[] = [];

  lines.push("Registered services:");
  if (data.services.length === 0) {
    lines.push("- none");
  } else {
    for (const service of data.services) {
      const active = activeByServiceId.get(service.id);
      lines.push(`- ${service.name}`);
      lines.push(`  service: ${service.clientId}`);
      lines.push(`  id: ${service.id}`);
      lines.push(`  status: ${active ? "active login" : "not logged in"}`);
      lines.push(`  return URL: ${formatMaybe(service.returnUrl)}`);
      if (service.homepageUrl) lines.push(`  homepage: ${service.homepageUrl}`);
      if (service.description) lines.push(`  description: ${service.description}`);
      if (!active) lines.push(`  next: slock integration login --service ${JSON.stringify(service.clientId)}`);
    }
  }

  lines.push("");
  lines.push("Active agent logins:");
  if (data.activeLogins.length === 0) {
    lines.push("- none");
  } else {
    for (const login of data.activeLogins) {
      lines.push(`- ${login.name}`);
      lines.push(`  service: ${login.clientId}`);
      lines.push(`  grant id: ${login.id}`);
      lines.push(`  scopes: ${login.scopes.length > 0 ? login.scopes.join(", ") : "-"}`);
      lines.push(`  return URL: ${formatMaybe(login.returnUrl)}`);
      lines.push(`  created: ${login.createdAt}`);
    }
  }

  return lines.join("\n");
}

export function formatIntegrationLogin(data: IntegrationLoginResponse): string {
  const verb = data.status === "already_logged_in" ? "Already logged in" : "Agent login ready";
  const lines = [
    `${verb}: ${data.service.name}`,
    `service: ${data.service.clientId}`,
    `id: ${data.service.id}`,
    `scopes: ${data.scopes.length > 0 ? data.scopes.join(", ") : "-"}`,
    `return URL: ${formatMaybe(data.service.returnUrl)}`,
    "complete: this agent login is configured in Slock; no human OAuth is required",
    "identity: run `slock profile show` if the service or human asks for your Slock Agent identity card",
  ];
  const agentAppUrl = buildAgentAppUrl(data.service.returnUrl, data.requestId);
  if (agentAppUrl) {
    lines.push(`app URL: ${agentAppUrl}`);
    lines.push("next: open the app URL if you need the third-party app surface, or run `slock integration list` to confirm active login");
  } else {
    lines.push("next: use the registered service, or run `slock integration list` to confirm active login");
  }
  return lines.join("\n");
}
