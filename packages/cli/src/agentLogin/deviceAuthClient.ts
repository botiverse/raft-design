/**
 * Minimal CLI-side client for the device-code login grant
 * (`/api/auth/device/{authorize,approve,token}` — see
 * `packages/server/src/routes/deviceAuth.ts`, landed on
 * `xx/device-code-login-shared` / PR #1916).
 *
 * NOT a shared package because the boundary linter
 * (`scripts/check-boundaries.mjs`) forbids
 * `@slock-ai/computer` ↔ `@slock-ai/cli` direct imports both ways
 * (#1573 revert lesson, enforced by XX msg=f71a6195). The Computer
 * package has its own DeviceAuthClient; this one is the agent-side
 * mirror. A future refactor can extract the shared grant client to
 * `@slock-ai/auth-client` or similar — that's a separate refactor
 * PR, not part of the self-managed agent credential mint work.
 *
 * Surface intentionally narrow:
 *
 *   const session = await runDeviceCodeLogin({ serverUrl, onUserAction });
 *
 * `onUserAction` is invoked once the server has returned the
 * verification URI + user_code so the caller can render
 * "Open <uri>, enter <code>". This separates UX from transport so
 * the same client can drive a TTY-style flow and a unit test.
 */

import { fetch } from "undici";

export interface DeviceCodeLoginUserAction {
  verificationUri: string;
  userCode: string;
  expiresInSeconds: number;
}

export interface RunDeviceCodeLoginOptions {
  serverUrl: string;
  /**
   * Human-readable client label sent to the authorize endpoint;
   * surfaced on the web approval page so the user knows what they
   * are approving. Optional but recommended.
   */
  clientName?: string;
  /**
   * Called exactly once when the server returns a device_code +
   * user_code. The caller is expected to print/open the verification
   * URI for the operator.
   */
  onUserAction(action: DeviceCodeLoginUserAction): void | Promise<void>;
  /**
   * Override the poll interval the server returned. Tests pass `0`
   * to drive polls deterministically; production should accept the
   * server's value.
   */
  pollIntervalOverrideMs?: number;
  /**
   * Test seam — defaults to `globalThis.fetch` via undici.
   */
  fetchImpl?: typeof fetch;
}

export interface DeviceCodeLoginResult {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export class DeviceCodeLoginError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = "DeviceCodeLoginError";
  }
}

/**
 * Human-readable mapping for the stable server error codes documented
 * in `packages/server/src/routes/deviceAuth.ts`. The CLI uses the
 * `code` field for branching; this map is what gets rendered when the
 * CLI presents a final failure to the operator (per PR-B liuliu
 * constraint: "actionable error map, not raw server response dump").
 */
const ACTIONABLE_ERROR_MESSAGES: Record<string, string> = {
  device_login_disabled:
    "Device login is not enabled on this Slock server. Ask an admin to set SLOCK_DEVICE_LOGIN_ENABLED=true.",
  device_code_required: "Internal CLI bug: device_code was missing from the poll request.",
  user_code_required: "Internal CLI bug: user_code was missing from the approve request.",
  authorization_pending: "Still waiting for you to approve the login on the web page.",
  expired_token: "The login code expired. Run `slock agent login` again to start a new flow.",
  access_denied: "You denied the login request in the web approval page.",
  device_code_consumed: "This login code has already been used. Run `slock agent login` again.",
  device_code_invalid:
    "Unknown / malformed device code. Run `slock agent login` again to start a fresh flow.",
};

export function describeDeviceCodeLoginError(code: string): string {
  return ACTIONABLE_ERROR_MESSAGES[code] ?? `Device login failed (code: ${code}).`;
}

/**
 * Drive the device-code login flow end-to-end.
 *
 * 1. POST `/api/auth/device/authorize` to claim a device_code + user_code.
 * 2. Invoke `onUserAction` so the caller can print the verification
 *    URI + user_code (and copy to clipboard / open browser if it wants).
 * 3. Poll POST `/api/auth/device/token` until the server returns a
 *    user session, or until a terminal error.
 *
 * Throws `DeviceCodeLoginError` with a stable `code` field on
 * terminal failures.
 */
export async function runDeviceCodeLogin(
  options: RunDeviceCodeLoginOptions,
): Promise<DeviceCodeLoginResult> {
  const httpFetch = options.fetchImpl ?? fetch;
  const base = options.serverUrl.replace(/\/+$/, "");

  // --- step 1: authorize ---
  const authorizeRes = await httpFetch(`${base}/api/auth/device/authorize`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...(options.clientName ? { clientName: options.clientName } : {}),
    }),
  });
  if (!authorizeRes.ok) {
    const payload = await safeJson(authorizeRes);
    throw new DeviceCodeLoginError(
      typeof payload?.code === "string" ? payload.code : "authorize_failed",
      describeDeviceCodeLoginError(typeof payload?.code === "string" ? payload.code : "authorize_failed"),
    );
  }
  const authorizeBody = (await authorizeRes.json()) as {
    deviceCode?: string;
    userCode?: string;
    verificationUri?: string;
    expiresIn?: number;
    interval?: number;
  };
  if (!authorizeBody.deviceCode || !authorizeBody.userCode || !authorizeBody.verificationUri) {
    throw new DeviceCodeLoginError(
      "authorize_response_invalid",
      "Server's authorize response was missing deviceCode / userCode / verificationUri.",
    );
  }

  // The verificationUri is server-relative — compose against the base.
  const verificationUri = authorizeBody.verificationUri.startsWith("http")
    ? authorizeBody.verificationUri
    : `${base}${authorizeBody.verificationUri}`;

  await options.onUserAction({
    verificationUri,
    userCode: authorizeBody.userCode,
    expiresInSeconds: authorizeBody.expiresIn ?? 0,
  });

  // --- step 2: poll the token endpoint ---
  const serverIntervalMs = (authorizeBody.interval ?? 5) * 1000;
  const pollIntervalMs = options.pollIntervalOverrideMs ?? serverIntervalMs;
  const deadlineMs = Date.now() + Math.max(1, authorizeBody.expiresIn ?? 600) * 1000;

  while (Date.now() < deadlineMs) {
    const tokenRes = await httpFetch(`${base}/api/auth/device/token`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ deviceCode: authorizeBody.deviceCode }),
    });
    if (tokenRes.ok) {
      const tokenBody = (await tokenRes.json()) as {
        accessToken?: string;
        refreshToken?: string;
        userId?: string;
      };
      if (!tokenBody.accessToken || !tokenBody.refreshToken || !tokenBody.userId) {
        throw new DeviceCodeLoginError(
          "token_response_invalid",
          "Server's token response was missing accessToken / refreshToken / userId.",
        );
      }
      return {
        accessToken: tokenBody.accessToken,
        refreshToken: tokenBody.refreshToken,
        userId: tokenBody.userId,
      };
    }
    const tokenError = await safeJson(tokenRes);
    const code = typeof tokenError?.code === "string" ? tokenError.code : "token_failed";
    if (code === "authorization_pending") {
      // Expected — keep polling.
      await delay(pollIntervalMs);
      continue;
    }
    // Any other status → terminal.
    throw new DeviceCodeLoginError(code, describeDeviceCodeLoginError(code));
  }
  throw new DeviceCodeLoginError(
    "expired_token",
    describeDeviceCodeLoginError("expired_token"),
  );
}

async function safeJson(res: { json: () => Promise<unknown> }): Promise<Record<string, unknown> | null> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
