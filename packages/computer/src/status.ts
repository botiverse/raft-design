// `slock-computer status` — Computer-level aggregate view (RFC v0.8
// contract v4 §1/§6/§9). One Computer = one SLOCK_HOME = N server
// attachments + their per-server daemons + one supervisor. `status`
// lists all of them in a single table.
//
// READ-ONLY and SECRET-FREE (§3.3.1, our axis-locked redline): the
// report carries server attachment IDENTITY and pid/liveness derived
// from filesystem state, but NEVER the user access token or any
// sk_computer_* key — none of those values ever enter the report object.
import { readFile } from "node:fs/promises";
import {
  resolveSlockHome,
  userSessionPath,
  supervisorPidPath,
  supervisorLogPath,
  serverDaemonPidPath,
  serverDaemonLogPath,
} from "./paths.js";
import { formatServerSlugDisplay, listServerAttachments } from "./serverState.js";
import { readPidfileAt, isProcessAlive } from "./supervisor.js";
import { isDegraded } from "./health.js";
import { info } from "./output.js";

type UserSessionReadResult =
  | { state: "missing"; session: null; error: null }
  | { state: "invalid"; session: null; error: string }
  | { state: "present"; session: Record<string, unknown>; error: null };

async function readUserSession(path: string): Promise<UserSessionReadResult> {
  try {
    const parsed = JSON.parse(await readFile(path, "utf8")) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return { state: "present", session: parsed as Record<string, unknown>, error: null };
    }
    return { state: "invalid", session: null, error: "not a JSON object" };
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "ENOENT") {
      return { state: "missing", session: null, error: null };
    }
    return {
      state: "invalid",
      session: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

export type DaemonState = { running: true; pid: number } | { running: false };
export type ServerHealth = "ok" | "degraded" | "offline";

async function pidStatus(pidfile: string): Promise<DaemonState> {
  const pid = await readPidfileAt(pidfile);
  return pid !== null && isProcessAlive(pid) ? { running: true, pid } : { running: false };
}

/**
 * Derive `health` enum from daemon liveness + recent crash history.
 * Per v6 §11:
 *  - `offline` = daemon not running (either supervisor not managing or stopped)
 *  - `degraded` = daemon may be running but recent crash history crossed
 *                 the repeated-crash threshold (supervisor stopped auto-restart)
 *  - `ok`      = daemon running and no recent crash history
 */
async function deriveHealth(
  slockHome: string,
  serverId: string,
  daemon: DaemonState,
): Promise<ServerHealth> {
  if (!daemon.running) return "offline";
  if (await isDegraded(slockHome, serverId)) return "degraded";
  return "ok";
}

export interface ServerStatusRow {
  serverId: string;
  serverSlug: string | null;
  serverMachineId: string;
  serverUrl: string;
  attachedAt: string | null;
  daemonLogPath: string;
  daemon: DaemonState;
  /** v6 §11 health enum surfaced in `status` table (PR-H §3.3). */
  health: ServerHealth;
}

export interface ComputerStatusReport {
  slockHome: string;
  loggedIn: boolean;
  userId: string | null;
  loginServerUrl: string | null;
  userSessionError: string | null;
  // Global per-Computer supervisor (one per SLOCK_HOME).
  supervisor: DaemonState & { logPath: string };
  // One row per attached server (v4 §6 aggregate). Empty array when the
  // Computer has no attachments yet.
  servers: ServerStatusRow[];
}

export async function buildStatusReport(): Promise<ComputerStatusReport> {
  const slockHome = resolveSlockHome();
  const sessionRead = await readUserSession(userSessionPath(slockHome));
  const session = sessionRead.session;
  const attachments = await listServerAttachments(slockHome);
  const supervisor = {
    ...(await pidStatus(supervisorPidPath(slockHome))),
    logPath: supervisorLogPath(slockHome),
  };

  const servers: ServerStatusRow[] = [];
  for (const a of attachments) {
    const daemon = await pidStatus(serverDaemonPidPath(slockHome, a.serverId));
    servers.push({
      serverId: a.serverId,
      serverSlug: a.serverSlug ?? null,
      serverMachineId: a.serverMachineId,
      serverUrl: a.serverUrl,
      attachedAt: a.attachedAt ?? null,
      daemonLogPath: serverDaemonLogPath(slockHome, a.serverId),
      daemon,
      health: await deriveHealth(slockHome, a.serverId, daemon),
    });
  }

  // `loggedIn` is derived from the token's PRESENCE; token value is
  // never copied into the report.
  const loggedIn =
    session?.kind === "user-session" && typeof session.accessToken === "string" && session.accessToken.length > 0;

  return {
    slockHome,
    loggedIn,
    userId: session ? str(session.userId) : null,
    loginServerUrl: session ? str(session.serverUrl) : null,
    userSessionError: sessionRead.state === "invalid" ? sessionRead.error : null,
    supervisor,
    servers,
  };
}

function pad(s: string, n: number): string {
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}

export async function runStatus(opts: { json?: boolean }): Promise<void> {
  const report = await buildStatusReport();
  if (opts.json) {
    info(JSON.stringify(report, null, 2));
    return;
  }
  info("");
  info(`SLOCK_HOME:   ${report.slockHome}`);
  const loginDetail = report.userSessionError
    ? "no — user session file is invalid; re-run `slock-computer login`"
    : report.loggedIn
      ? `yes (user ${report.userId ?? "?"})`
      : "no — run `slock-computer login`";
  info(
    `Logged in:    ${loginDetail}`,
  );
  if (report.loginServerUrl) info(`Login server: ${report.loginServerUrl}`);
  info(
    `Supervisor:   ${report.supervisor.running ? `running (pid ${report.supervisor.pid})` : "stopped — run `slock-computer start`"}`,
  );
  info(`Supervisor log: ${report.supervisor.logPath}`);
  info("");
  if (report.servers.length === 0) {
    info("Attachments:  none — run `slock-computer attach /<serverSlug>` (e.g. `/myserver`).");
  } else {
    info("Attachments:");
    info(`  ${pad("SERVER", 24)}${pad("HEALTH", 12)}${pad("DAEMON", 24)}${pad("MACHINE", 38)}URL`);
    for (const s of report.servers) {
      const dcol = s.daemon.running ? `running (pid ${s.daemon.pid})` : "stopped";
      info(
        `  ${pad(formatServerSlugDisplay(s.serverSlug), 24)}${pad(s.health, 12)}${pad(dcol, 24)}${pad(s.serverMachineId, 38)}${s.serverUrl}`,
      );
      info(`    Daemon log: ${s.daemonLogPath}`);
    }
    if (report.servers.some((s) => s.health === "degraded")) {
      info("");
      info(
        "  Note: one or more servers are `degraded` (repeated crashes; auto-restart paused).",
      );
      info(
        "  Run `slock-computer doctor /<serverSlug> --reset-health` (e.g. `/myserver`) after fixing the underlying issue.",
      );
    }
  }
  info("");
}
