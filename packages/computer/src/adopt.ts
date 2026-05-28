// `slock-computer adopt-legacy <serverSlug>` — task #39 PR-J1.
//
// One-time migration of a still-running legacy daemon (sk_machine_*) into
// the canonical Computer surface (sk_computer_*). The legacy key proves
// ownership of the legacy machine row; the server marks it migrated and
// mints a fresh sk_computer_* scoped to the same server.
//
// Per RFC v8.2 §5.11.1, four secret-input channels are accepted (CHOOSE
// EXACTLY ONE; mixing → LEGACY_KEY_MULTIPLE_SOURCES):
//
//   --legacy-api-key <key>           argv (operator typed at terminal)
//   --legacy-api-key-file <path>     read a 0600 file containing only the key
//   --legacy-api-key-stdin           read the key from stdin
//   SLOCK_LEGACY_API_KEY env         ambient (systemd / CI / process manager)
//
// After-success behavior:
//   - the freshly-minted sk_computer_* is committed to
//     `~/.slock/computer/servers/<serverId>/attachment.json` (0600)
//   - a forensic line is appended to `~/.slock/computer/adoption.log` per
//     §5.11.4 with the credential_bridge_mode + timestamps
//   - raw legacy key is NEVER echoed, NEVER persisted; only a short
//     8-char redacted prefix appears in adoption.log
//
// Local memory of the raw legacy key is the smallest possible window:
//   1. read into one binding
//   2. POST to /api/computer/adopt-legacy
//   3. clear the binding (best-effort overwrite)
import { chmod, mkdir, readFile, writeFile, appendFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { ComputerAttachClient } from "./apiClient.js";
import {
  resolveSlockHome,
  userSessionPath,
  serverAttachmentPath,
  adoptionLogPath,
  computerDir,
} from "./paths.js";
import { fail, info } from "./output.js";
import { formatServerSlugDisplay, normalizeServerSlug } from "./serverState.js";
import { resolveServerUrl } from "./serverUrl.js";

interface UserSession {
  kind?: string;
  userId?: string;
  accessToken?: string;
  serverUrl?: string;
}

/** Credential bridge mode — §5.11.4 closed enum, snake_case byte-exact. */
export type CredentialBridgeMode =
  | "legacy_key_argv"
  | "legacy_key_file"
  | "legacy_key_stdin"
  | "legacy_key_env";

export interface AdoptInputs {
  serverSlug: string;
  serverUrl?: string;
  name?: string;
  legacyApiKey?: string;          // --legacy-api-key
  legacyApiKeyFile?: string;      // --legacy-api-key-file
  legacyApiKeyStdin?: boolean;    // --legacy-api-key-stdin
  orchestrated?: boolean;         // suppress trailing "Next:" hint when called from setup
}

interface ResolvedLegacyKey {
  rawKey: string;
  mode: CredentialBridgeMode;
  redactedPrefix: string;
}

/**
 * Resolve the legacy key from the single chosen input channel.
 * Exactly-one-source invariant enforced here so the network call never
 * runs with an ambiguous source.
 */
export async function resolveLegacyKey(
  inputs: AdoptInputs,
  env: NodeJS.ProcessEnv,
): Promise<ResolvedLegacyKey> {
  const sources: Array<{ mode: CredentialBridgeMode; load: () => Promise<string> }> = [];
  if (typeof inputs.legacyApiKey === "string" && inputs.legacyApiKey.length > 0) {
    sources.push({
      mode: "legacy_key_argv",
      load: async () => inputs.legacyApiKey!.trim(),
    });
  }
  if (typeof inputs.legacyApiKeyFile === "string" && inputs.legacyApiKeyFile.length > 0) {
    sources.push({
      mode: "legacy_key_file",
      load: async () => {
        const contents = await readFile(inputs.legacyApiKeyFile!, "utf8");
        return contents.trim();
      },
    });
  }
  if (inputs.legacyApiKeyStdin) {
    sources.push({
      mode: "legacy_key_stdin",
      load: async () => readAllStdin(),
    });
  }
  const envKey = env.SLOCK_LEGACY_API_KEY;
  // Per §5.11.1: env is ambient and SAFE to silently ignore outside adopt,
  // but inside adopt the env IS one of the four legitimate input channels.
  // We only consult it when the adopt command runs.
  if (typeof envKey === "string" && envKey.trim().length > 0) {
    sources.push({
      mode: "legacy_key_env",
      load: async () => envKey.trim(),
    });
  }

  if (sources.length === 0) {
    fail(
      "LEGACY_KEY_REQUIRED",
      "No legacy api key provided. Pass exactly one of: --legacy-api-key <key>, --legacy-api-key-file <path>, --legacy-api-key-stdin, or SLOCK_LEGACY_API_KEY.",
    );
  }
  if (sources.length > 1) {
    const modes = sources.map((s) => s.mode).join(", ");
    fail(
      "LEGACY_KEY_MULTIPLE_SOURCES",
      `Multiple legacy api key sources provided (${modes}). Choose exactly one.`,
    );
  }

  const chosen = sources[0]!;
  const rawKey = await chosen.load();
  // Unset env immediately after read so a long-lived process never keeps it.
  if (chosen.mode === "legacy_key_env") {
    delete env.SLOCK_LEGACY_API_KEY;
  }
  if (!rawKey.startsWith("sk_machine_") && !rawKey.startsWith("sk_daemon_")) {
    fail(
      "LEGACY_KEY_INVALID",
      "Provided key does not look like a legacy machine key (expected `sk_machine_*` or `sk_daemon_*`).",
    );
  }
  return {
    rawKey,
    mode: chosen.mode,
    redactedPrefix: rawKey.slice(0, 8),
  };
}

async function readAllStdin(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    process.stdin.on("data", (chunk: Buffer) => chunks.push(chunk));
    process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString("utf8").trim()));
    process.stdin.on("error", reject);
  });
}

// --- legacy daemon pid stop (§5.11 / Jianwei's acceptance for #39) ---
//
// The legacy daemon writes its lock at
//   `<SLOCK_HOME>/machines/machine-<sha256(rawKey)[0..15]>/daemon.lock/owner.json`
// (see daemon/machineLock.ts). Adoption's post-success step:
//   1. derive the fingerprint from the raw key (BEFORE we drop the key)
//   2. read owner.json → pid
//   3. SIGTERM + wait-for-exit (up to STOP_WAIT_MS)
// All steps are best-effort with stable RETURN codes; failures are logged
// to adoption.log via `failureReason`.
const LEGACY_STOP_WAIT_MS = 10_000;
const LEGACY_STOP_POLL_MS = 200;

interface LegacyStopResult {
  attempted: boolean;
  pid?: number;
  outcome: "absent" | "already_dead" | "stopped" | "timed_out" | "denied" | "error";
  reason?: string;
}

interface LegacyOwnerEvidence {
  ownerFile: string;
  pid?: number;
  alive?: boolean;
  startedAt?: string;
  serverUrl?: string;
  reason?: string;
}

export function legacyLockOwnerPath(slockHome: string, rawKey: string): string {
  const fingerprint = createHash("sha256").update(rawKey).digest("hex").slice(0, 16);
  return join(slockHome, "machines", `machine-${fingerprint}`, "daemon.lock", "owner.json");
}

function isProcessAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    const code = typeof err === "object" && err && "code" in err ? (err as { code?: string }).code : undefined;
    return code !== "ESRCH";
  }
}

async function stopLegacyDaemonByOwnerFile(
  ownerFile: string,
): Promise<LegacyStopResult> {
  let raw: string;
  try {
    raw = await readFile(ownerFile, "utf8");
  } catch {
    return { attempted: false, outcome: "absent" };
  }
  let pid: number;
  try {
    const owner = JSON.parse(raw) as { pid?: unknown };
    if (typeof owner.pid !== "number") {
      return { attempted: false, outcome: "error", reason: "owner_json_missing_pid" };
    }
    pid = owner.pid;
  } catch {
    return { attempted: false, outcome: "error", reason: "owner_json_unparseable" };
  }
  if (!isProcessAlive(pid)) {
    return { attempted: false, pid, outcome: "already_dead" };
  }
  try {
    process.kill(pid, "SIGTERM");
  } catch (err) {
    const code = typeof err === "object" && err && "code" in err ? (err as { code?: string }).code : undefined;
    if (code === "EPERM") return { attempted: true, pid, outcome: "denied", reason: "eperm" };
    return { attempted: true, pid, outcome: "error", reason: code ?? "signal_failed" };
  }
  const deadline = Date.now() + LEGACY_STOP_WAIT_MS;
  while (Date.now() < deadline) {
    if (!isProcessAlive(pid)) return { attempted: true, pid, outcome: "stopped" };
    await delay(LEGACY_STOP_POLL_MS);
  }
  return { attempted: true, pid, outcome: "timed_out" };
}

async function readLegacyOwnerEvidence(ownerFile: string): Promise<LegacyOwnerEvidence> {
  let raw: string;
  try {
    raw = await readFile(ownerFile, "utf8");
  } catch {
    return { ownerFile, reason: "owner_file_absent" };
  }
  let owner: Record<string, unknown>;
  try {
    owner = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { ownerFile, reason: "owner_json_unparseable" };
  }

  const pid = typeof owner.pid === "number" ? owner.pid : undefined;
  return {
    ownerFile,
    pid,
    alive: typeof pid === "number" ? isProcessAlive(pid) : undefined,
    startedAt: typeof owner.startedAt === "string" ? owner.startedAt : undefined,
    serverUrl: typeof owner.serverUrl === "string" ? owner.serverUrl : undefined,
    reason: typeof pid === "number" ? undefined : "owner_json_missing_pid",
  };
}

function formatLegacyOwnerEvidence(slockHome: string, evidence: LegacyOwnerEvidence): string {
  const fields = [
    `SLOCK_HOME=${slockHome}`,
    `owner=${evidence.ownerFile}`,
  ];
  if (typeof evidence.pid === "number") {
    fields.push(`pid=${evidence.pid}`);
    if (typeof evidence.alive === "boolean") fields.push(`alive=${evidence.alive}`);
  }
  if (evidence.startedAt) fields.push(`startedAt=${evidence.startedAt}`);
  if (evidence.serverUrl) fields.push(`serverUrl=${evidence.serverUrl}`);
  if (evidence.reason) fields.push(`ownerStatus=${evidence.reason}`);
  return fields.join(" ");
}

export async function runAdoptLegacy(inputs: AdoptInputs): Promise<void> {
  const slockHome = resolveSlockHome();
  const sessionFile = userSessionPath(slockHome);

  let session: UserSession;
  try {
    session = JSON.parse(await readFile(sessionFile, "utf8")) as UserSession;
  } catch {
    fail(
      "NO_USER_SESSION",
      `No user session at ${sessionFile}. Run \`slock-computer login\` first.`,
    );
  }
  if (session.kind !== "user-session" || typeof session.accessToken !== "string" || !session.accessToken) {
    fail(
      "INVALID_USER_SESSION",
      `User session at ${sessionFile} is invalid. Re-run \`slock-computer login\`.`,
    );
  }

  const baseUrl = resolveServerUrl(inputs.serverUrl, session.serverUrl, process.env.SLOCK_SERVER_URL);

  const slugForServer = normalizeServerSlug(inputs.serverSlug);
  if (!slugForServer) {
    fail("ADOPT_NOT_AUTHORIZED", "Server slug must not be empty.");
  }

  const legacy = await resolveLegacyKey(inputs, process.env);
  info(
    `Adopting legacy daemon for ${formatServerSlugDisplay(slugForServer)} via ${legacy.mode}…`,
  );

  const client = new ComputerAttachClient(baseUrl, session.accessToken);
  const adoptStartedAt = new Date();
  // Compute the legacy lock fingerprint BEFORE the network call so we can
  // drop the raw key reference as soon as the response lands. The lock
  // owner path is derived from the SHA-256 of the raw key.
  const legacyOwnerFile = legacyLockOwnerPath(slockHome, legacy.rawKey);
  const ownerEvidence = await readLegacyOwnerEvidence(legacyOwnerFile);
  const result = await client.adoptLegacy(legacy.rawKey, inputs.name);
  // Best-effort scrub of the raw key memory binding. JS can't truly zero
  // a string, but we drop the reference so no later code path sees it.
  (legacy as { rawKey?: string }).rawKey = undefined;

  if (result.status === "disabled") {
    await appendAdoptionLog(slockHome, {
      mode: legacy.mode,
      redactedPrefix: legacy.redactedPrefix,
      startedAt: adoptStartedAt,
      outcome: "failed",
      failureReason: "computer_adopt_disabled",
    });
    fail(
      "ADOPT_DISABLED",
      "Computer legacy adoption is not enabled on this server. Upgrade the server or set SLOCK_DEVICE_LOGIN_ENABLED.",
    );
  }
  if (result.status === "legacy_key_invalid") {
    await appendAdoptionLog(slockHome, {
      mode: legacy.mode,
      redactedPrefix: legacy.redactedPrefix,
      startedAt: adoptStartedAt,
      outcome: "failed",
      failureReason: "legacy_key_invalid",
    });
    fail(
      "LEGACY_KEY_INVALID",
      `Server rejected the legacy api key (unknown / wrong server / malformed). Local legacy owner evidence for this key: ${formatLegacyOwnerEvidence(slockHome, ownerEvidence)}. Verify the key came from this SLOCK_HOME and server, or use a fresh isolated SLOCK_HOME for a clean Computer setup.`,
    );
  }
  if (result.status === "legacy_machine_key_migrated") {
    await appendAdoptionLog(slockHome, {
      mode: legacy.mode,
      redactedPrefix: legacy.redactedPrefix,
      startedAt: adoptStartedAt,
      outcome: "failed",
      failureReason: "legacy_machine_key_migrated",
    });
    fail(
      "LEGACY_MACHINE_KEY_MIGRATED",
      `This machine has already been adopted; the legacy key is no longer accepted. Local legacy owner evidence for this key: ${formatLegacyOwnerEvidence(slockHome, ownerEvidence)}. Use \`slock-computer attach\` to add another Computer attachment, or use a fresh isolated SLOCK_HOME for a clean setup.`,
    );
  }
  if (result.status === "auth_required") {
    await appendAdoptionLog(slockHome, {
      mode: legacy.mode,
      redactedPrefix: legacy.redactedPrefix,
      startedAt: adoptStartedAt,
      outcome: "failed",
      failureReason: "auth_required",
    });
    fail(
      "ADOPT_AUTH_REQUIRED",
      `Your Computer user session was rejected by the server before legacy adoption. Local legacy owner evidence for this key: ${formatLegacyOwnerEvidence(slockHome, ownerEvidence)}. Re-run \`slock-computer login\` for this server (use the same \`--server-url\` if not on production), then retry the adopt command. No local Computer state was written.`,
    );
  }
  if (result.status === "not_authorized") {
    await appendAdoptionLog(slockHome, {
      mode: legacy.mode,
      redactedPrefix: legacy.redactedPrefix,
      startedAt: adoptStartedAt,
      outcome: "failed",
      failureReason: "not_authorized",
    });
    fail(
      "ADOPT_NOT_AUTHORIZED",
      "Not authorized to adopt this machine on this server. Check that you are a current member.",
    );
  }
  if (result.status === "unexpected_response") {
    await appendAdoptionLog(slockHome, {
      mode: legacy.mode,
      redactedPrefix: legacy.redactedPrefix,
      startedAt: adoptStartedAt,
      outcome: "failed",
      failureReason: result.code ? `unexpected_response_${result.code}` : "unexpected_response_missing_code",
    });
    const responseDetail = result.code
      ? `status ${result.httpStatus}, code ${result.code}`
      : `status ${result.httpStatus}, missing error code`;
    const authHint = result.httpStatus === 401
      ? " If your server may be on an older release that does not emit `code: auth_required`, re-run `slock-computer login` first to refresh your user session, then retry. If the issue persists, report it as server contract drift."
      : "";
    fail(
      "ADOPT_UNEXPECTED_RESPONSE",
      `Server returned an unexpected legacy adoption response (${responseDetail}).${authHint} Local legacy owner evidence for this key: ${formatLegacyOwnerEvidence(slockHome, ownerEvidence)}. Please report this with the command, server URL, and SLOCK_HOME; no local Computer state was written.`,
    );
  }
  if (result.status === "error") {
    await appendAdoptionLog(slockHome, {
      mode: legacy.mode,
      redactedPrefix: legacy.redactedPrefix,
      startedAt: adoptStartedAt,
      outcome: "failed",
      failureReason: result.code,
    });
    fail(
      "ADOPT_FAILED",
      `Adoption failed at server exchange (${result.code}). Local legacy owner evidence for this key: ${formatLegacyOwnerEvidence(slockHome, ownerEvidence)}. Confirm the user session is valid, the legacy key belongs to this server/SLOCK_HOME, and the server URL is correct. No local Computer state was written.`,
    );
  }

  // result.status === "success" — we now hold a fresh sk_computer_*.
  // Run §9 preflight before committing local state, mirroring `attach`.
  info(result.resumed ? "Adopted (resumed prior attachment); running preflight…" : "Adopted; running preflight…");
  const pre = await client.preflight(result.apiKey);
  if (!pre.ok) {
    await appendAdoptionLog(slockHome, {
      mode: legacy.mode,
      redactedPrefix: legacy.redactedPrefix,
      startedAt: adoptStartedAt,
      outcome: "failed",
      failureReason: `preflight_${pre.code}`,
    });
    fail(
      "PREFLIGHT_FAILED",
      `Server preflight failed (${pre.code}); local state not written. Upgrade the server or retry.`,
    );
  }

  // Stop the legacy daemon process BEFORE writing attachment.json
  // (RFC v8.2 §5.11 / Jianwei #39 acceptance). The server already rejects
  // the old key with `legacy_machine_key_migrated`, but the v8.2 single-owner
  // invariant also demands that the local lock file no longer represents a
  // live process. If the legacy pid cannot be stopped (timed_out / denied /
  // error), fail closed: do NOT write attachment.json, so `slock-computer
  // start` cannot mint a second supervisor while the legacy daemon is still
  // alive locally.
  const stop = await stopLegacyDaemonByOwnerFile(legacyOwnerFile);
  if (stop.outcome === "timed_out" || stop.outcome === "denied" || stop.outcome === "error") {
    await appendAdoptionLog(slockHome, {
      mode: legacy.mode,
      redactedPrefix: legacy.redactedPrefix,
      startedAt: adoptStartedAt,
      outcome: "failed",
      failureReason: `legacy_stop_${stop.outcome}`,
      computerId: result.computerId,
      machineId: result.machineId,
      serverId: result.serverId,
      legacyStop: stop,
    });
    const detail =
      stop.outcome === "timed_out"
        ? `pid ${stop.pid} did not exit within ${LEGACY_STOP_WAIT_MS}ms`
        : stop.outcome === "denied"
          ? `pid ${stop.pid} cannot be stopped (permission denied)`
          : `stop attempt error (${stop.reason ?? "unknown"})`;
    fail(
      "LEGACY_DAEMON_STOP_FAILED",
      `Adoption succeeded server-side but the legacy daemon could not be stopped: ${detail}. Stop it manually and re-run \`slock-computer adopt-legacy\`, or run \`slock-computer attach\` after confirming the legacy process is gone. No local Computer state was written.`,
    );
  }

  const file = serverAttachmentPath(slockHome, result.serverId);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(
    file,
    JSON.stringify(
      {
        kind: "computer-attachment",
        serverId: result.serverId,
        serverSlug: slugForServer,
        serverMachineId: result.computerId,
        apiKey: result.apiKey,
        serverUrl: baseUrl,
        attachedAt: new Date().toISOString(),
        adoptedFromLegacy: true,
        legacyMachineId: result.machineId,
      },
      null,
      2,
    ),
    { mode: 0o600 },
  );
  await chmod(file, 0o600);

  await appendAdoptionLog(slockHome, {
    mode: legacy.mode,
    redactedPrefix: legacy.redactedPrefix,
    startedAt: adoptStartedAt,
    outcome: "succeeded",
    computerId: result.computerId,
    machineId: result.machineId,
    serverId: result.serverId,
    legacyStop: stop,
  });

  info(`Adopted. Computer state written to ${file}`);
  info(`  server:        ${formatServerSlugDisplay(slugForServer)}`);
  info(`  serverMachine: ${result.computerId}`);
  info(`  legacyMachine: ${result.machineId}`);
  switch (stop.outcome) {
    case "absent":
      info("  legacy daemon: not detected on this Computer (no local lock file)");
      break;
    case "already_dead":
      info(`  legacy daemon: already stopped (pid ${stop.pid} not running)`);
      break;
    case "stopped":
      info(`  legacy daemon: stopped (pid ${stop.pid}, SIGTERM)`);
      break;
  }
  if (!inputs.orchestrated) {
    info(`Next: run \`slock-computer start\` to bring this server online under the Computer supervisor.`);
  }
}

// --- adoption.log writer (§5.11.4) ---

export interface AdoptionLogLine {
  mode: CredentialBridgeMode;
  redactedPrefix: string;
  startedAt: Date;
  outcome: "succeeded" | "failed";
  failureReason?: string;
  computerId?: string;
  machineId?: string;
  serverId?: string;
  legacyStop?: LegacyStopResult;
}

/**
 * Append one forensic line per §5.11.4. Closed enum field order:
 *   ts outcome bridge_mode redacted_prefix [failure_reason] [computer_id]
 *   [machine_id] [server_id]
 *
 * Format choice: one line, space-separated `key=value`. Best-effort —
 * a log write failure must never block the adoption flow result.
 */
export async function appendAdoptionLog(
  slockHome: string,
  line: AdoptionLogLine,
): Promise<void> {
  try {
    await mkdir(computerDir(slockHome), { recursive: true });
    const fields: string[] = [
      `ts=${new Date().toISOString()}`,
      `started_at=${line.startedAt.toISOString()}`,
      `outcome=${line.outcome}`,
      `credential_bridge_mode=${line.mode}`,
      `legacy_key_prefix=${line.redactedPrefix}`,
    ];
    if (line.failureReason) fields.push(`failure_reason=${line.failureReason}`);
    if (line.computerId) fields.push(`computer_id=${line.computerId}`);
    if (line.machineId) fields.push(`legacy_machine_id=${line.machineId}`);
    if (line.serverId) fields.push(`server_id=${line.serverId}`);
    if (line.legacyStop) {
      fields.push(`legacy_stop_outcome=${line.legacyStop.outcome}`);
      if (typeof line.legacyStop.pid === "number") {
        fields.push(`legacy_stop_pid=${line.legacyStop.pid}`);
      }
      if (line.legacyStop.reason) {
        fields.push(`legacy_stop_reason=${line.legacyStop.reason}`);
      }
    }
    const path = adoptionLogPath(slockHome);
    await appendFile(path, fields.join(" ") + "\n", { mode: 0o600 });
    try {
      const st = await stat(path);
      if ((st.mode & 0o077) !== 0) await chmod(path, 0o600);
    } catch {
      // ignore
    }
  } catch {
    // adoption.log is forensic — never block the user's adoption outcome
    // on a log-write failure.
  }
}
