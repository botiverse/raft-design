// `slock-computer login` — device-code user-identity flow (RFC v0.8
// contract v3 §6). Establishes a USER session only; does NOT create a
// Computer attachment and does NOT mint sk_computer_*/sk_agent_* (§5).
// Writes user-session state to ~/.slock/computer/user-session.json.
// `login` must precede `attach`.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { DeviceAuthClient } from "./apiClient.js";
import { resolveSlockHome, userSessionPath } from "./paths.js";
import { fail, info } from "./output.js";
import { resolveServerUrl } from "./serverUrl.js";

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function runLogin(opts: { serverUrl?: string; orchestrated?: boolean }): Promise<void> {
  const baseUrl = resolveServerUrl(opts.serverUrl, process.env.SLOCK_SERVER_URL);

  const client = new DeviceAuthClient(baseUrl);
  let grant;
  try {
    grant = await client.authorize("slock-computer");
  } catch (err) {
    // v8.3.3 PR-2c Slice 3 — wrap raw transport errors (`fetch failed`,
    // `ECONNREFUSED`, raw HTTP body) with actionable context. The error
    // code stays `DEVICE_AUTHORIZE_FAILED` (regression-stable for tests
    // and callers); only the user-facing message is enriched. The raw
    // `<reason>` is preserved as a substring so operators can still
    // diagnose the underlying transport problem.
    const reason = err instanceof Error ? err.message : String(err);
    fail(
      "DEVICE_AUTHORIZE_FAILED",
      `Could not start device login at ${baseUrl}: ${reason}. Check that the server URL is correct and reachable.`,
    );
  }

  const verificationUri = grant.verificationUriComplete || grant.verificationUri;
  const verifyUrl = new URL(verificationUri, baseUrl).toString();
  info(`To finish login, open: ${verifyUrl}`);
  info(`and enter the code:   ${grant.userCode}`);
  info(`Waiting for approval (expires in ${grant.expiresIn}s)…`);

  const intervalMs = Math.max(1, grant.interval) * 1000;
  const deadline = Date.now() + grant.expiresIn * 1000;
  while (Date.now() < deadline) {
    await sleep(intervalMs);
    const r = await client.token(grant.deviceCode);
    if (r.status === "pending") continue;
    if (r.status === "denied") fail("LOGIN_DENIED", "Login was denied in the approval page.");
    if (r.status === "expired") fail("LOGIN_EXPIRED", "Login request expired before approval. Re-run `slock-computer login`.");
    if (r.status === "error") fail("LOGIN_FAILED", `Login failed (${r.code}). Re-run \`slock-computer login\`.`);

    // success — persist USER session only (not a Computer attachment).
    const slockHome = resolveSlockHome();
    const file = userSessionPath(slockHome);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(
      file,
      JSON.stringify(
        { kind: "user-session", userId: r.userId, accessToken: r.accessToken, refreshToken: r.refreshToken, serverUrl: baseUrl, createdAt: new Date().toISOString() },
        null,
        2,
      ),
      { mode: 0o600 },
    );
    info(`Logged in. User session written to ${file}`);
    if (!opts.orchestrated) {
      info(`Next: run \`slock-computer attach <serverSlug>\` to attach this machine.`);
    }
    return;
  }
  fail("LOGIN_EXPIRED", "Login request expired before approval. Re-run `slock-computer login`.");
}
