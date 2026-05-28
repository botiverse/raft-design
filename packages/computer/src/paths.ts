// Computer state paths (RFC v0.8 contract v4 §1/§10).
//
// Identity: **a Computer IS one SLOCK_HOME on one real machine** (liuliu
// §1, tygg). It manages ALL Slock connections under that SLOCK_HOME: one
// shared user identity + N independent per-server attachments, each with
// its own daemon, all owned by one supervisor.
//
//   ~/.slock/computer/
//     user-session.json              # SHARED — one user identity per Computer
//     supervisor.pid                 # the single per-Computer supervisor
//     supervisor.log
//     servers/<serverId>/
//       attachment.json              # sk_computer_* + serverMachineId (per server)
//       daemon.pid                   # this server's daemon child
//       daemon.log
//
// Per-server isolation is a HARD contract invariant (§5, my axis):
// reading/writing one serverId's subdir must never touch another's.
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";

export function resolveSlockHome(
  env: { SLOCK_HOME?: string } = process.env,
  homeDir = os.homedir(),
): string {
  const configured = env.SLOCK_HOME?.trim();
  const raw = configured && configured.length > 0 ? configured : path.join(homeDir, ".slock");
  return path.resolve(expandHome(raw, homeDir));
}

function expandHome(input: string, homeDir: string): string {
  if (input === "~") return homeDir;
  if (input.startsWith("~/")) return path.join(homeDir, input.slice(2));
  return input;
}

export function computerDir(slockHome: string): string {
  return path.join(slockHome, "computer");
}

// login output — user identity/session ONLY (no sk_computer_*). SHARED
// across every per-server attachment under this Computer (§1: one user
// identity per SLOCK_HOME).
export function userSessionPath(slockHome: string): string {
  return path.join(computerDir(slockHome), "user-session.json");
}

// --- per-server attachment state (contract v4 §10) ---

/**
 * serverId is user-supplied (`attach <serverId>`) and is used as a
 * directory name — it MUST be validated to a strict shape so it can
 * never escape `servers/` via traversal / separators / `.`. Slock
 * server ids are UUIDs; accept exactly that.
 */
const SERVER_ID_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function isValidServerId(serverId: string): boolean {
  return SERVER_ID_RE.test(serverId);
}

export function assertValidServerId(serverId: string): string {
  if (!isValidServerId(serverId)) {
    throw new Error(`invalid server id: ${JSON.stringify(serverId)} (expected a UUID)`);
  }
  return serverId;
}

export function serversDir(slockHome: string): string {
  return path.join(computerDir(slockHome), "servers");
}

export function serverDir(slockHome: string, serverId: string): string {
  return path.join(serversDir(slockHome), assertValidServerId(serverId));
}

export function serverAttachmentPath(slockHome: string, serverId: string): string {
  return path.join(serverDir(slockHome, serverId), "attachment.json");
}

export function serverDaemonPidPath(slockHome: string, serverId: string): string {
  return path.join(serverDir(slockHome, serverId), "daemon.pid");
}

export function serverDaemonLogPath(slockHome: string, serverId: string): string {
  return path.join(serverDir(slockHome, serverId), "daemon.log");
}

// Per-server "managed" marker — presence indicates "supervisor should
// keep this server's daemon running". Distinct from attachment.json:
// attach establishes the credential; `start [serverId]` writes the
// managed flag for the targeted server(s); detach removes it.
//
// Contract v4 §6 line 80: `start [serverId]` without a serverId manages
// all attached; with a serverId, manages only that one. This file is how
// the supervisor's reconcile loop knows the difference.
export function serverManagedFlagPath(slockHome: string, serverId: string): string {
  return path.join(serverDir(slockHome, serverId), "managed.flag");
}

// Per-server crash history file — JSON array of recent crash entries
// with timestamp + exitCode + signal. The supervisor appends on each
// daemon child exit; `status` derives `health` enum from recent crash
// count; repeated-crash threshold (>=3 in 60s) marks the server as
// `degraded`, stopping supervisor auto-restart per v6 §3.3.
//
// Cleared by `slock-computer doctor <serverId> --reset-health` after
// the operator has inspected last-3-crash reasons + fixed the
// underlying issue.
export function serverHealthPath(slockHome: string, serverId: string): string {
  return path.join(serverDir(slockHome, serverId), "health.json");
}

// --- the single per-Computer supervisor (contract v4 §1/§6) ---

export function supervisorPidPath(slockHome: string): string {
  return path.join(computerDir(slockHome), "supervisor.pid");
}

export function supervisorLogPath(slockHome: string): string {
  return path.join(computerDir(slockHome), "supervisor.log");
}

/**
 * Active-supervisor version evidence — `supervisor-version.json`.
 *
 * The running supervisor writes this on startup with:
 *   { version, installRoot, pid, writtenAt }
 *
 * Purpose (Dayu msg=73312d23): proves which install-root the CURRENTLY
 * RUNNING supervisor was started from, independent of the file tree at
 * `<install>/dist`. The file tree can be swapped mid-upgrade and look
 * "new" while the running pid is still the old binary; this evidence
 * file is written ONCE on supervisor startup, so the values reflect the
 * actual running process. Used by PR-E QA harness to assert
 * active-version post-upgrade / post-rollback, and useful operationally
 * (operator can `cat` it to see what binary the supervisor pid actually
 * came from).
 */
export function supervisorVersionPath(slockHome: string): string {
  return path.join(computerDir(slockHome), "supervisor-version.json");
}

const HOSTNAME_SUFFIXES = [
  ".fritz.box",
  ".localdomain",
  ".local",
  ".lan",
  ".home",
] as const;

function shortHostnameHash(hostname: string): string {
  return createHash("sha256").update(hostname).digest("hex").slice(0, 8);
}

/**
 * Derive the default user-visible Computer display name from the host.
 * Server-side `computers.name` remains canonical; this helper is the
 * single client-side default used by attach/setup prompts.
 */
export function deriveDefaultComputerName(hostname: string = os.hostname()): string {
  const original = hostname.trim();
  let name = original;
  let lower = name.toLowerCase();

  for (;;) {
    const suffix = HOSTNAME_SUFFIXES.find((candidate) => lower.endsWith(candidate));
    if (!suffix) break;
    name = name.slice(0, -suffix.length);
    lower = name.toLowerCase();
  }

  name = name
    .replace(/[\s'"]+/g, "-")
    .replace(/-+$/g, "");

  return name.length > 0 ? name : `slock-computer-${shortHostnameHash(original)}`;
}

// --- legacy daemon adoption forensic log (RFC v8.2 §5.11.4 / task #39 PR-J1) ---

// `~/.slock/computer/adoption.log` — append-only forensic log of every
// legacy daemon adoption attempt on this Computer. Each line records the
// credential bridge mode (which secret channel the user chose) plus the
// PID transition + new sk_computer mint timestamp, so a later operator
// can reconstruct what happened during a one-way migration.
//
// Raw legacy keys MUST NEVER appear here — at most a redacted prefix
// (first 8 chars) or HMAC surrogate `mch_<hex>`.
export function adoptionLogPath(slockHome: string): string {
  return path.join(computerDir(slockHome), "adoption.log");
}

// --- release channel state (contract v6 §6 / §10 / §11 / PR-E §2.1) ---

// `~/.slock/computer/channel` — release channel marker. One-line text
// file. Default `latest` if absent. Contract-mutable ONLY via
// `slock-computer channel set <name>` (manual edit is undefined behavior).
//
// v6 §11 enum: `latest | alpha | pinned:<semver>`. Other values rejected
// with stable code `CHANNEL_INVALID`.
export function channelPath(slockHome: string): string {
  return path.join(computerDir(slockHome), "channel");
}

// --- v8.3 upgrade lifecycle paths (RFC v0.8 §4.4 contract) ---
//
// Adopted as canonical paths.ts accessors per v8.3 §4.4 (10): all
// upgrade-related paths must derive from paths.ts::* helpers, not
// string literals scattered through upgrade.ts. Existing upgrade.ts
// (PR-E narrow-v1 era) currently constructs these paths inline;
// follow-up PR will refactor to consume these helpers.

// `~/.slock/computer/upgrade-staging/<version>/` — transient per-attempt
// scratch dir where target version is unpacked + deployed before the
// atomic swap. Removed on success after cleanup phase; kept on failure
// for forensic inspection (operator must `rm -rf` manually).
//
// Note: keyed by `<version>` (matching existing PR-E impl), not by
// `<run-id>` as v8.3 §4.4 (10) doc originally specified — drift to be
// resolved in the follow-up v8.3 §4.4 doc-patch PR per the impl-side
// alignment direction locked in #wg-slock-computer:5255faa6. Same-version
// retry after a failed attempt requires manual cleanup of the prior
// staging dir; the upgrade attempt will fail-closed if
// `upgrade-staging/<version>/` already exists, which is acceptable v0
// behavior (operator inspects forensic artifact, then `rm -rf`).
export function upgradeStagingDir(slockHome: string, version: string): string {
  return path.join(computerDir(slockHome), "upgrade-staging", version);
}

// `~/.slock/computer/upgrade-snapshot.json` — pre-swap state file for
// rollback (single file, not directory — existing impl shape from PR-E
// 6-phase flow: stage / verify / snapshot / swap / restart / cleanup).
// Captures current binary path + version + channel before swap so
// rollback can restore the pre-upgrade state on failure.
export function upgradeSnapshotPath(slockHome: string): string {
  return path.join(computerDir(slockHome), "upgrade-snapshot.json");
}

// `~/.slock/computer/upgrade.log` — append-only JSON-lines audit log
// of every upgrade attempt (success or failure). Schema per v8.3.2
// §4.4 (7):
// `{ at, fromBundle: { computerVersion, bundledDaemonVersion? },
//    toBundle: { computerVersion, bundledDaemonVersion? },
//    channel, trigger: cli|web|tray, outcome: ok|err, errorCode? }`.
// Secret hygiene: raw npm tokens / api keys / sk_* must never appear
// in this log (see §10.14 secret hygiene). Recommended permission 0o600.
export function upgradeLogPath(slockHome: string): string {
  return path.join(computerDir(slockHome), "upgrade.log");
}

// `~/.slock/computer/upgrade-install-<timestamp>.log` — per-attempt
// raw install output (npm/pnpm stdout/stderr). Separated from
// upgrade.log (which is structured JSON-lines) so structured audit
// readers don't have to parse around raw install noise. Permission
// 0o600 per §10.14 secret hygiene (npm install output can include
// transient registry tokens / temporary credentials).
//
// `timestamp` shape contract: callers MUST go through
// `formatUpgradeLogTimestamp()` below so all upgrade.log entries +
// upgrade-install-*.log filenames share the same timestamp format.
// Format is intentionally Windows-path-safe (no colons, no spaces,
// no slashes) so the path works on Windows + POSIX identically.
export function upgradeInstallLogPath(slockHome: string, timestamp: string): string {
  return path.join(computerDir(slockHome), `upgrade-install-${timestamp}.log`);
}

// Canonical timestamp formatter for upgrade.log JSON entries and
// upgrade-install-*.log filenames. Format: `YYYYMMDDTHHmmssZ` (ISO
// 8601 basic UTC, no separators).
//
// Why this format:
//   - Windows-path-safe: no `:`, no ` `, no `/`. Can appear in any
//     filename on any filesystem.
//   - Lexicographic sort = chronological sort.
//   - Fixed length (16 chars including Z) — easy to grep / parse.
//   - UTC (Z suffix) — no timezone ambiguity across operator hosts.
//
// Centralized so callers don't reinvent
// `new Date().toISOString().replace(...)` patterns that drift between
// callsites and break the upgradeInstallLogPath(timestamp) contract
// (Jianwei QA gate item 4, #wg-slock-computer:5255faa6 msg=a9805dc5).
export function formatUpgradeLogTimestamp(date: Date = new Date()): string {
  const iso = date.toISOString(); // "2026-05-24T17:30:00.123Z"
  // Strip separators + drop millis: "20260524T173000Z"
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
