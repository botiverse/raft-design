// Per-server daemon health tracking (RFC v0.8 contract v6 §3.3 / PR-H).
//
// Repeated-crash detection: the supervisor appends to a per-server
// `health.json` crash log on every daemon child exit; status reader
// derives the `health` enum (`ok | degraded | offline`) from recent
// crash count + daemon liveness.
//
// Crash threshold: >=3 crashes within a 60-second window → `degraded`.
// In `degraded` state, the supervisor's restart loop skips restart
// (per v6 §3.3 "stop trying to restart") to avoid crash-restart-spin;
// the user MUST run `slock-computer doctor <serverId> --reset-health`
// after fixing the underlying issue to clear the state.
//
// File format (per `health.json`):
//   { "crashes": [{ "at": "2026-05-21T10:00:00Z", "exitCode": 1, "signal": null }, ...] }
//
// Entries older than the crash-window are pruned on each append; the
// file grows bounded.

import { readFile, writeFile, unlink, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { serverHealthPath } from "./paths.js";
import { isValidServerId } from "./paths.js";

export const CRASH_WINDOW_MS = 60_000;
export const DEGRADED_THRESHOLD = 3;

export interface CrashEntry {
  at: string; // ISO timestamp
  exitCode: number | null;
  signal: string | null;
}

export interface FatalConfigMarker {
  at: string;
  exitCode: number | null;
  signal: string | null;
  reason: "ex_config";
}

interface HealthFile {
  crashes: CrashEntry[];
  fatalConfig?: FatalConfigMarker;
}

async function readHealthFile(slockHome: string, serverId: string): Promise<HealthFile> {
  if (!isValidServerId(serverId)) return { crashes: [] };
  try {
    const raw = await readFile(serverHealthPath(slockHome, serverId), "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && Array.isArray((parsed as HealthFile).crashes)) {
      return parsed as HealthFile;
    }
  } catch {
    /* missing / corrupt → empty */
  }
  return { crashes: [] };
}

async function writeHealthFile(
  slockHome: string,
  serverId: string,
  file: HealthFile,
): Promise<void> {
  const path = serverHealthPath(slockHome, serverId);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(file), { mode: 0o600 });
}

/**
 * Append a crash entry. Prunes entries older than the crash-window so
 * the file grows bounded. Caller passes the exit info from the child
 * exit handler.
 */
export async function recordCrash(
  slockHome: string,
  serverId: string,
  exitCode: number | null,
  signal: NodeJS.Signals | null,
  nowMs: number = Date.now(),
): Promise<void> {
  if (!isValidServerId(serverId)) return;
  const file = await readHealthFile(slockHome, serverId);
  // Prune old entries first
  const cutoffMs = nowMs - CRASH_WINDOW_MS;
  file.crashes = file.crashes.filter((c) => {
    const t = new Date(c.at).getTime();
    return Number.isFinite(t) && t >= cutoffMs;
  });
  file.crashes.push({
    at: new Date(nowMs).toISOString(),
    exitCode,
    signal,
  });
  await writeHealthFile(slockHome, serverId, file);
}

/**
 * Read the recent crash history (within the crash-window). Returns []
 * if file missing/corrupt.
 */
export async function readCrashHistory(
  slockHome: string,
  serverId: string,
  nowMs: number = Date.now(),
): Promise<CrashEntry[]> {
  const file = await readHealthFile(slockHome, serverId);
  const cutoffMs = nowMs - CRASH_WINDOW_MS;
  return file.crashes.filter((c) => {
    const t = new Date(c.at).getTime();
    return Number.isFinite(t) && t >= cutoffMs;
  });
}

/**
 * `true` iff the server has crossed the repeated-crash threshold
 * (>=3 crashes within 60s) OR the daemon child has fatally exited with
 * an EX_CONFIG error that the supervisor decided not to keep retrying.
 *
 * When true, the supervisor must skip restart per v6 §3.3, and `status`
 * must report `degraded`. Cleared by `resetHealth`.
 */
export async function isDegraded(
  slockHome: string,
  serverId: string,
  nowMs: number = Date.now(),
): Promise<boolean> {
  const file = await readHealthFile(slockHome, serverId);
  if (file.fatalConfig) return true;
  const cutoffMs = nowMs - CRASH_WINDOW_MS;
  const recent = file.crashes.filter((c) => {
    const t = new Date(c.at).getTime();
    return Number.isFinite(t) && t >= cutoffMs;
  });
  return recent.length >= DEGRADED_THRESHOLD;
}

/**
 * Mark the server as degraded due to a fatal config error (e.g. the
 * per-server daemon child exited with EX_CONFIG_EXIT_CODE because its
 * dep tree is broken). Unlike `recordCrash`, this does NOT contribute
 * to the crash budget — config errors are not crashes — but it sets a
 * separate `fatalConfig` marker that forces `isDegraded` to return true
 * regardless of crash count. Cleared by `resetHealth`.
 */
export async function markFatalConfig(
  slockHome: string,
  serverId: string,
  exitCode: number | null,
  signal: NodeJS.Signals | null,
  nowMs: number = Date.now(),
): Promise<void> {
  if (!isValidServerId(serverId)) return;
  const file = await readHealthFile(slockHome, serverId);
  file.fatalConfig = {
    at: new Date(nowMs).toISOString(),
    exitCode,
    signal,
    reason: "ex_config",
  };
  await writeHealthFile(slockHome, serverId, file);
}

/**
 * Read the fatal-config marker, if any. Used by doctor/status to
 * surface the actionable cause when the server is `degraded` for a
 * config reason rather than a crash reason.
 */
export async function readFatalConfig(
  slockHome: string,
  serverId: string,
): Promise<FatalConfigMarker | null> {
  const file = await readHealthFile(slockHome, serverId);
  return file.fatalConfig ?? null;
}

/**
 * Clear the crash history — user action via
 * `slock-computer doctor <serverId> --reset-health` after inspecting +
 * fixing the underlying issue. Idempotent: missing file is a no-op.
 */
export async function resetHealth(slockHome: string, serverId: string): Promise<void> {
  if (!isValidServerId(serverId)) return;
  try {
    await unlink(serverHealthPath(slockHome, serverId));
  } catch {
    /* missing = already reset */
  }
}
