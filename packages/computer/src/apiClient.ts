// Minimal HTTP client for the PR-A2 shared device-code grant
// (`/api/auth/device/*`, RFC v0.8 contract v3 §3). undici fetch.
// Errors are mapped to ACTIONABLE codes — the caller renders guidance,
// never a raw server body (binding constraint).
import { fetch } from "undici";

export interface DeviceAuthorizeResult {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  verificationUriComplete?: string;
  expiresIn: number;
  interval: number;
}

export type DeviceTokenResult =
  | { status: "success"; accessToken: string; refreshToken: string; userId: string }
  | { status: "pending" }
  | { status: "denied" }
  | { status: "expired" }
  | { status: "error"; code: string };

export class DeviceAuthClient {
  constructor(private readonly baseUrl: string) {}

  private url(p: string): string {
    return new URL(p, this.baseUrl).toString();
  }

  async authorize(clientName: string): Promise<DeviceAuthorizeResult> {
    const res = await fetch(this.url("/api/auth/device/authorize"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientName }),
    });
    if (res.status === 404) {
      throw new Error(
        "device login is not enabled on this server (ask an admin to unset SLOCK_DEVICE_LOGIN_ENABLED or set it back to a non-false value; this surface is on by default since PR-G — upgrade the server if you are on an older build)",
      );
    }
    if (res.status !== 201) {
      throw new Error(`device authorize failed (HTTP ${res.status}) — check --server-url / server version`);
    }
    const body = (await res.json().catch(() => null)) as DeviceAuthorizeResult | null;
    if (!body || typeof body.deviceCode !== "string" || typeof body.userCode !== "string") {
      throw new Error("device authorize returned an unexpected response — server may be incompatible");
    }
    return body;
  }

  async token(deviceCode: string): Promise<DeviceTokenResult> {
    const res = await fetch(this.url("/api/auth/device/token"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceCode }),
    });
    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (res.status === 200 && body && typeof body.accessToken === "string") {
      return {
        status: "success",
        accessToken: body.accessToken as string,
        refreshToken: String(body.refreshToken ?? ""),
        userId: String(body.userId ?? ""),
      };
    }
    const code = body && typeof body.code === "string" ? (body.code as string) : `http_${res.status}`;
    if (code === "authorization_pending") return { status: "pending" };
    if (code === "access_denied") return { status: "denied" };
    if (code === "expired_token") return { status: "expired" };
    return { status: "error", code };
  }
}

// --- Computer attach (RFC v0.8 contract v3 §6/§9) ---
// `attach` consumes an existing USER session (from `login`) to create/
// resume this machine's Computer attachment, then runs the §9 read-only
// preflight with the issued sk_computer_* BEFORE any local state is
// written. Both calls map server responses to ACTIONABLE codes.

export type AttachResult =
  | {
      status: "success";
      apiKey: string;
      serverMachineId: string;
      serverId: string;
      serverSlug: string;
      resumed: boolean;
    }
  | { status: "not_authorized" }
  | { status: "server_not_found" }
  | { status: "disabled" }
  | { status: "error"; code: string };

export type PreflightResult = { ok: true; serverSlug?: string } | { ok: false; code: string };

export type AdoptLegacyResult =
  | {
      status: "success";
      apiKey: string;
      computerId: string;
      machineId: string;
      serverId: string;
      resumed: boolean;
    }
  | { status: "legacy_key_invalid" }
  | { status: "legacy_machine_key_migrated" }
  | { status: "auth_required" }
  | { status: "not_authorized" }
  | { status: "disabled" }
  | { status: "unexpected_response"; httpStatus: number; code?: string }
  | { status: "error"; code: string };

export class ComputerAttachClient {
  constructor(
    private readonly baseUrl: string,
    private readonly accessToken: string,
  ) {}

  private url(p: string): string {
    return new URL(p, this.baseUrl).toString();
  }

  /** POST /api/computer/attach — user-authed; issues sk_computer_*. */
  async attach(serverSlug: string, name: string): Promise<AttachResult> {
    let res: Awaited<ReturnType<typeof fetch>>;
    try {
      res = await fetch(this.url("/api/computer/attach"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: JSON.stringify({ serverSlug, name }),
      });
    } catch {
      return { status: "error", code: "request_failed" };
    }
    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    const code = body && typeof body.code === "string" ? (body.code as string) : undefined;
    if (res.status === 201 && body && typeof body.apiKey === "string") {
      return {
        status: "success",
        apiKey: body.apiKey as string,
        serverMachineId: String(body.serverMachineId ?? ""),
        serverId: String(body.serverId ?? ""),
        serverSlug: String(body.serverSlug ?? serverSlug),
        resumed: body.resumed === true,
      };
    }
    if (res.status === 401) return { status: "error", code: "session_invalid" };
    if (res.status === 403) return { status: "not_authorized" };
    if (res.status === 404) {
      // Older/disabled servers expose the attach route as a plain 404, but
      // some deployments return 404 with a structured auth/not-found code for
      // unknown slugs. Preserve that as a user-actionable slug/membership
      // error instead of mislabeling it as a disabled Computer surface.
      if (code === "not_authorized" || code === "server_not_found") return { status: "server_not_found" };
      if (!code || code === "computer_attach_disabled") return { status: "disabled" };
    }
    return { status: "error", code: code ?? `http_${res.status}` };
  }

  /**
   * POST /api/computer/adopt-legacy — task #39 PR-J1 (RFC v8.2 §5.11).
   * User-authed; the legacy `sk_machine_*` key is the proof of authority
   * over the machine. On success the server marks the machine row migrated
   * and mints a fresh `sk_computer_*`. The raw legacy key MUST NOT be
   * persisted by the caller — only the freshly-minted sk_computer_* lands
   * in attachment.json.
   */
  async adoptLegacy(legacyApiKey: string, name?: string): Promise<AdoptLegacyResult> {
    const res = await fetch(this.url("/api/computer/adopt-legacy"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({ legacyApiKey, ...(name ? { name } : {}) }),
    });
    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (res.status === 201 && body && typeof body.apiKey === "string") {
      return {
        status: "success",
        apiKey: body.apiKey as string,
        computerId: String(body.computerId ?? ""),
        machineId: String(body.machineId ?? ""),
        serverId: String(body.serverId ?? ""),
        resumed: body.resumed === true,
      };
    }
    const code = body && typeof body.code === "string" ? (body.code as string) : undefined;
    if (res.status === 401) {
      if (code === "legacy_key_invalid") return { status: "legacy_key_invalid" };
      if (code === "auth_required") return { status: "auth_required" };
      return { status: "unexpected_response", httpStatus: res.status, ...(code ? { code } : {}) };
    }
    if (res.status === 409 && code === "legacy_machine_key_migrated") {
      return { status: "legacy_machine_key_migrated" };
    }
    if (res.status === 403) return { status: "not_authorized" };
    if (res.status === 404) return { status: "disabled" };
    if (!code) return { status: "unexpected_response", httpStatus: res.status };
    return { status: "error", code };
  }

  /**
   * POST /internal/computer/preflight — §9 READ-ONLY, side-effect-free.
   * Authenticated with the freshly-issued sk_computer_* (NOT the user
   * session). Proves surface + auth-registry + principal split alignment
   * before any local attachment state is committed.
   */
  async preflight(apiKey: string): Promise<PreflightResult> {
    const res = await fetch(this.url("/internal/computer/preflight"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: "{}",
    });
    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (res.status === 200 && body && body.ok === true) {
      return {
        ok: true,
        serverSlug: typeof body.serverSlug === "string" && body.serverSlug.length > 0 ? body.serverSlug : undefined,
      };
    }
    const code =
      body && typeof body.code === "string" ? (body.code as string) : `http_${res.status}`;
    return { ok: false, code };
  }
}

// --- Computer runner control plane (RFC v0.8 §12) ---
// Authenticated with the sk_computer_* from attachment.json (NOT the
// user session). The server enforces the §12 whitelist; the client
// only renders what the server returned — it never re-derives fields.

export interface RunnerListItem {
  agentId: string;
  name: string;
  status: string;
  model: string;
  runtime: string;
}

export type RunnerListResult =
  | { status: "success"; whitelist: string[]; runners: RunnerListItem[] }
  | { status: "unauthorized" }
  | { status: "error"; code: string };

export type RunnerStopResult =
  | { status: "success" }
  | { status: "not_found" }
  | { status: "unauthorized" }
  | { status: "error"; code: string };

export class RunnersClient {
  constructor(
    private readonly baseUrl: string,
    private readonly computerApiKey: string,
  ) {}

  private url(p: string): string {
    return new URL(p, this.baseUrl).toString();
  }

  async list(): Promise<RunnerListResult> {
    const res = await fetch(this.url("/internal/computer/runners"), {
      method: "GET",
      headers: { Authorization: `Bearer ${this.computerApiKey}` },
    });
    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (res.status === 200 && body && Array.isArray(body.runners)) {
      return {
        status: "success",
        whitelist: Array.isArray(body.whitelist) ? (body.whitelist as string[]) : [],
        runners: body.runners as RunnerListItem[],
      };
    }
    if (res.status === 401 || res.status === 403) return { status: "unauthorized" };
    const code = body && typeof body.code === "string" ? (body.code as string) : `http_${res.status}`;
    return { status: "error", code };
  }

  async stop(agentId: string): Promise<RunnerStopResult> {
    const res = await fetch(this.url(`/internal/computer/runners/${encodeURIComponent(agentId)}/stop`), {
      method: "POST",
      headers: { Authorization: `Bearer ${this.computerApiKey}`, "Content-Type": "application/json" },
      body: "{}",
    });
    if (res.status === 200) return { status: "success" };
    if (res.status === 404) return { status: "not_found" };
    if (res.status === 401 || res.status === 403) return { status: "unauthorized" };
    const body = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    const code = body && typeof body.code === "string" ? (body.code as string) : `http_${res.status}`;
    return { status: "error", code };
  }
}
