// Thin HTTP client for the agent-facing `slock` CLI. It keeps the command
// layer legacy-shaped while selecting the right transport/surface from
// `AgentContext.clientMode` (§11 contract enum, sign-locked by XX):
//   - legacy-machine: call existing `/internal/agent/:id/*` machine routes
//     with `sk_machine_*`. Pre-RFC-v0.8 daemons only.
//   - managed-runner: call the daemon-local proxy, which forwards to
//     `/internal/agent-api/*` with the daemon-held `sk_agent_*`. The bearer
//     in this CLI process is a short-lived proxy token, not sk_agent_*.
//   - self-hosted-runner: CLI calls `/internal/agent-api/*` directly with a
//     real `sk_agent_*` loaded from a profile credential file written by
//     `slock agent login`.
//     WIP(self-hosted-runner-layer1): profile credential + agent-api client
//     only; runner lifecycle/runtime integration is not implemented here.
//
// In managed-runner mode the local daemon-owned `slock` wrapper injects a
// local proxy token into this short-lived CLI process. The daemon proxy holds
// the sk_agent_* bearer in memory. The client rewrites legacy
// `/internal/agent/:id/*` calls to the id-less
// `/internal/agent-api/*` surface where the server derives acting identity
// from the credential row. The proxy forwards only these rewritten agent-api
// calls to the real server with the daemon-held credential.

import type { Dispatcher } from "undici";
import type { AgentContext } from "./auth/env.js";
import { buildFetchDispatcher } from "./proxy.js";

type ProxyAwareRequestInit = RequestInit & { dispatcher?: Dispatcher };

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
  errorCode?: string | null;
}

export interface RawResponse {
  ok: boolean;
  status: number;
  response: Response;
  error: string | null;
}

export class ApiClient {
  constructor(private readonly ctx: AgentContext) {}

  private usesAgentApiSurface(): boolean {
    return this.ctx.clientMode === "managed-runner" || this.ctx.clientMode === "self-hosted-runner";
  }

  private rewriteAgentCredentialPath(pathname: string): string {
    if (!this.usesAgentApiSurface()) return pathname;

    const attachmentDownload = /^\/api\/attachments\/([^/?]+)(.*)$/.exec(pathname);
    if (attachmentDownload) {
      return `/internal/agent-api/attachments/${attachmentDownload[1]}${attachmentDownload[2] ?? ""}`;
    }

    const agentPrefix = `/internal/agent/${encodeURIComponent(this.ctx.agentId)}`;
    if (!pathname.startsWith(agentPrefix)) return pathname;

    const suffix = pathname.slice(agentPrefix.length);
    if (suffix === "/server") return "/internal/agent-api/server";
    if (suffix === "/send") return "/internal/agent-api/send";
    if (suffix.startsWith("/history")) return `/internal/agent-api/history${suffix.slice("/history".length)}`;
    if (suffix.startsWith("/search")) return `/internal/agent-api/search${suffix.slice("/search".length)}`;
    if (suffix.startsWith("/channel-members")) return `/internal/agent-api/channel-members${suffix.slice("/channel-members".length)}`;
    if (suffix === "/knowledge" || suffix.startsWith("/knowledge?")) {
      return `/internal/agent-api/knowledge${suffix.slice("/knowledge".length)}`;
    }
    if (suffix === "/profile" || suffix.startsWith("/profile/")) return `/internal/agent-api${suffix}`;
    if (suffix === "/integrations" || suffix.startsWith("/integrations/")) return `/internal/agent-api${suffix}`;
    if (suffix === "/upload") return "/internal/agent-api/upload";
    if (suffix === "/resolve-channel") return "/internal/agent-api/resolve-channel";
    if (suffix === "/threads/unfollow") return "/internal/agent-api/threads/unfollow";
    if (suffix === "/prepare-action") return "/internal/agent-api/prepare-action";
    if (suffix === "/tasks" || suffix.startsWith("/tasks?") || suffix.startsWith("/tasks/")) {
      return `/internal/agent-api${suffix}`;
    }
    if (suffix === "/reminders" || suffix.startsWith("/reminders?") || suffix.startsWith("/reminders/")) {
      return `/internal/agent-api${suffix}`;
    }
    if (suffix === "/receive" || suffix.startsWith("/receive?")) {
      return "/internal/agent-api/events?since=latest";
    }

    const reaction = /^\/messages\/([^/]+)\/reactions$/.exec(suffix);
    if (reaction) {
      return `/internal/agent-api/messages/${reaction[1]}/reactions`;
    }

    const channelMembership = /^\/channels\/([^/]+)\/(join|leave)$/.exec(suffix);
    if (channelMembership) {
      return `/internal/agent-api/channels/${channelMembership[1]}/${channelMembership[2]}`;
    }

    return pathname;
  }

  private normalizeAgentCredentialResponse<T>(pathname: string, data: T): T {
    if (!this.usesAgentApiSurface()) return data;
    if (!pathname.includes("/internal/agent-api/events")) return data;
    const value = data as { events?: unknown[] };
    if (!Array.isArray(value.events)) return data;
    return { ...(data as Record<string, unknown>), messages: value.events } as T;
  }

  private buildAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${this.ctx.token}`,
      "X-Agent-Id": this.ctx.agentId,
      "X-Slock-Client": "cli",
    };
    if (this.ctx.serverId) headers["X-Server-Id"] = this.ctx.serverId;
    return headers;
  }

  private async parseJsonResponse<T>(res: Response): Promise<ApiResponse<T>> {
    let data: T | null = null;
    let error: string | null = null;
    let errorCode: string | null = null;
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      let parseFailed = false;
      const parsed = await res.json().catch(() => {
        parseFailed = true;
        return null;
      });
      if (parseFailed) {
        return {
          ok: false,
          status: res.status,
          data: null,
          error: `Invalid JSON response from server/proxy (HTTP ${res.status})`,
          errorCode: "INVALID_JSON_RESPONSE",
        };
      }
      if (res.ok) {
        data = parsed as T;
      } else {
        const body = parsed as
          | { error?: string; errorCode?: string; requiredScope?: string; reason?: string }
          | null;
        // 403 with `requiredScope` is the agent-permission deny shape from
        // requireAgentScope middleware. Rewrite the wire error into something
        // the agent can act on — telling it that the human revoked a specific
        // capability and to ask for it back if it actually needs it. Without
        // this rewrite the agent just sees a generic "missing required scope"
        // and has no idea the human is the one who set the policy.
        if (res.status === 403 && body?.requiredScope) {
          errorCode = "SCOPE_DENIED";
          error =
            `Permission denied. The human has revoked the \`${body.requiredScope}\` ` +
            `capability for this agent under the agent profile's Permissions tab, ` +
            `so this command can't run. If you need it, ask the human to re-enable ` +
            `the corresponding toggle.`;
        } else {
          error = body?.error ?? `HTTP ${res.status}`;
          errorCode = body?.errorCode ?? null;
        }
      }
    } else if (!res.ok) {
      error = `HTTP ${res.status}`;
    }
    return { ok: res.ok, status: res.status, data, error, errorCode };
  }

  async request<T>(
    method: string,
    pathname: string,
    body?: unknown,
  ): Promise<ApiResponse<T>> {
    pathname = this.rewriteAgentCredentialPath(pathname);
    const url = new URL(pathname, this.ctx.serverUrl).toString();
    const headers = this.buildAuthHeaders();
    headers["Content-Type"] = "application/json";
    // This header is the session-side half of the v0.8 active-capability
    // intersection. The server still enforces credential max scopes first;
    // when present, this set can further deny otherwise-authorized commands
    // with `unsupported_capability`.
    if (this.ctx.activeCapabilities && this.ctx.activeCapabilities.length > 0) {
      headers["X-Slock-Agent-Active-Capabilities"] = this.ctx.activeCapabilities.join(",");
    }
    const dispatcher = buildFetchDispatcher(url);
    const init: ProxyAwareRequestInit = {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    };
    if (dispatcher) init.dispatcher = dispatcher;
    const res = await fetch(url, init);
    const parsed = await this.parseJsonResponse<T>(res);
    if (parsed.ok && parsed.data !== null) {
      parsed.data = this.normalizeAgentCredentialResponse(pathname, parsed.data);
    }
    return parsed;
  }

  // Multipart upload. Caller builds the FormData (file part + any text fields).
  // Content-Type intentionally omitted so fetch sets the correct multipart
  // boundary itself.
  async requestMultipart<T>(
    method: string,
    pathname: string,
    form: FormData,
  ): Promise<ApiResponse<T>> {
    pathname = this.rewriteAgentCredentialPath(pathname);
    const url = new URL(pathname, this.ctx.serverUrl).toString();
    const dispatcher = buildFetchDispatcher(url);
    const headers = this.buildAuthHeaders();
    if (this.ctx.activeCapabilities && this.ctx.activeCapabilities.length > 0) {
      headers["X-Slock-Agent-Active-Capabilities"] = this.ctx.activeCapabilities.join(",");
    }
    const init: ProxyAwareRequestInit = {
      method,
      headers,
      body: form,
    };
    if (dispatcher) init.dispatcher = dispatcher;
    const res = await fetch(url, init);
    return this.parseJsonResponse<T>(res);
  }

  // Returns the raw Response so the caller can stream / save the body.
  // For non-JSON downloads (binary attachments). Caller is responsible for
  // consuming the body. On non-2xx, attempts to surface a JSON error.
  async requestRaw(
    method: string,
    pathname: string,
  ): Promise<RawResponse> {
    pathname = this.rewriteAgentCredentialPath(pathname);
    const url = new URL(pathname, this.ctx.serverUrl).toString();
    const dispatcher = buildFetchDispatcher(url);
    const headers = this.buildAuthHeaders();
    if (this.ctx.activeCapabilities && this.ctx.activeCapabilities.length > 0) {
      headers["X-Slock-Agent-Active-Capabilities"] = this.ctx.activeCapabilities.join(",");
    }
    const init: ProxyAwareRequestInit = {
      method,
      headers,
      redirect: "follow" as RequestRedirect,
    };
    if (dispatcher) init.dispatcher = dispatcher;
    const res = await fetch(url, init);
    let error: string | null = null;
    if (!res.ok) {
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        const parsed = await res.json().catch(() => null);
        error = (parsed as { error?: string } | null)?.error ?? `HTTP ${res.status}`;
      } else {
        error = `HTTP ${res.status}`;
      }
    }
    return { ok: res.ok, status: res.status, response: res, error };
  }
}
