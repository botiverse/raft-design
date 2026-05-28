// Computer supervisor + per-server daemon children (RFC v0.8 contract
// v4 §1/§6).
//
// Process model:
//
//   slock-computer start [serverId]              ← user command (foreground; exits after spawn)
//      └── slock-computer __supervise            ← detached, long-running supervisor (one per SLOCK_HOME)
//           ├── slock-computer __run <serverIdA> ← per-server DaemonCore child (one per attached server)
//           └── slock-computer __run <serverIdB>
//
// The supervisor reconciles `listAttachedServerIds()` against the set
// of live children: it spawns missing children, restarts crashed
// children with a small backoff, and reaps children whose attachment
// was removed (basis for `detach`). It is the host-level owner of all
// per-server daemons in a single Computer / SLOCK_HOME.
//
// §3.3.1 redline: each per-server sk_computer_* lives only in its own
// child's memory (loaded from `servers/<serverId>/attachment.json`);
// it is never read by the supervisor, never logged, never printed.
import { spawn, type ChildProcess } from "node:child_process";
import { mkdir, readFile, writeFile, open, unlink, rename } from "node:fs/promises";
import { dirname, join as joinPath } from "node:path";
import { fileURLToPath } from "node:url";
import {
  resolveSlockHome,
  computerDir,
  supervisorPidPath,
  supervisorLogPath,
  supervisorVersionPath,
  serverDaemonPidPath,
  serverDaemonLogPath,
  serverAttachmentPath,
  assertValidServerId,
} from "./paths.js";
import {
  listAttachedServerIds,
  listManagedServerIds,
  readServerAttachment,
  setServerManaged,
  clearServerManaged,
} from "./serverState.js";
import { fail, info } from "./output.js";
import { runFullCleanup, forceReleaseLock } from "./cleanup.js";
import { recordCrash, isDegraded, markFatalConfig } from "./health.js";

// ---------- pidfile primitives ----------

/** Generic pidfile reader by absolute path. Returns null on missing / junk. */
export async function readPidfileAt(pidfilePath: string): Promise<number | null> {
  try {
    const raw = (await readFile(pidfilePath, "utf8")).trim();
    const pid = Number.parseInt(raw, 10);
    return Number.isInteger(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

/** Liveness via signal 0. */
export function isProcessAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return (err as NodeJS.ErrnoException).code === "EPERM";
  }
}

async function writePidfileAt(pidfilePath: string, pid: number): Promise<void> {
  await mkdir(dirname(pidfilePath), { recursive: true });
  await writeFile(pidfilePath, String(pid), { mode: 0o600 });
}

async function clearPidfileAt(pidfilePath: string): Promise<void> {
  try {
    await unlink(pidfilePath);
  } catch {
    /* ignore */
  }
}

// ---------- self-re-exec argv builder (pure / unit-tested) ----------

export function buildResidentSpawn(
  mode: "__supervise" | "__run",
  serverId: string | null,
  selfEntry = process.argv[1] ?? "",
  execArgv: string[] = process.execArgv,
): { command: string; args: string[] } {
  // Carry parent execArgv so the dev-mode tsx loader survives re-exec.
  const tail = serverId ? [mode, serverId] : [mode];
  return { command: process.execPath, args: [...execArgv, selfEntry, ...tail] };
}

/**
 * Env-var marker telling the spawned supervisor's startup recovery pass
 * that the parent CLI still holds `~/.slock/computer/.lock` (because it
 * is running under `withMutationLock`). When this marker is present the
 * supervisor MUST skip the unconditional `forceReleaseLock` step — that
 * would delete the parent's still-valid mutex, allowing other mutating
 * CLIs to slip in during phase 5 → rolling_health → cleanup, breaking
 * PR-H §3.2 "mutating commands serialize cleanly".
 *
 * Dayu blocker (#wg-slock-computer:b43b36fb msg=ff69d33f): both
 * `runStart` and `runUpgradeCli` invoke `spawnDetachedSupervisor` while
 * the parent CLI is under `withMutationLock`. Without this marker, the
 * child supervisor's startup recovery would force-release the parent's
 * lock during PR-E's long-running upgrade window. The latent same-class
 * risk also exists for the pre-PR-E `start` path, but its window is
 * shorter so it had not been flagged. Fixing here covers both callsites.
 *
 * The marker is intentionally NOT inherited by `__run` children (those
 * are launched by the supervisor itself, after the parent has already
 * exited and released its lock). The supervisor explicitly does not
 * propagate this env var when calling `buildResidentSpawn("__run", ...)`.
 */
export const PARENT_LOCK_HELD_ENV_VAR = "SLOCK_COMPUTER_PARENT_MUTATION_LOCK_HELD";

/**
 * Spawn a detached `slock-computer __supervise` child. The detached child
 * survives the parent process exit, writes its stdio to the supervisor
 * log, and registers its pid in `supervisor.pid`. Returns the pid.
 *
 * Used by `runStart` (foreground CLI → background supervisor) AND by the
 * §2.5 upgrade flow's restart phase: after `swap` renames the new bits
 * into `currentBinaryDir`, this helper re-execs the freshly-installed
 * binary as the new supervisor. After a §2.3 rollback (`.prev` restored)
 * it re-execs the old bits the same way — same code path, same log sink,
 * same pidfile invariant. Dayu blocker (msg=911eb84e): without this
 * shared helper, `runUpgradeCli` had no spawn callback wired into
 * `runUpgrade`, so the production CLI's restart phase never spawned a
 * fresh supervisor — it would time out on health and then fail rollback
 * respawn for the same reason.
 *
 * Both current callsites (`runStart`, `runUpgradeCli`) invoke this while
 * holding `withMutationLock`, so the spawn always sets
 * `PARENT_LOCK_HELD_ENV_VAR=1` to suppress the child supervisor's
 * unconditional `forceReleaseLock` startup step. See env-var docstring
 * above.
 *
 * NOT for use inside `__supervise` itself (the supervisor is already the
 * detached process). NOT for use inside `restartPhase` defaults: the
 * orchestrator's `deps.spawnFreshSupervisor` callback is the integration
 * point so unit tests can stub it without spawning real children.
 *
 * Throws if the OS refuses the spawn (no pid available).
 */
export async function spawnDetachedSupervisor(slockHome: string): Promise<number> {
  await mkdir(computerDir(slockHome), { recursive: true });
  const supLogFd = await open(supervisorLogPath(slockHome), "a");
  const { command, args } = buildResidentSpawn("__supervise", null);
  const child = spawn(command, args, {
    detached: true,
    stdio: ["ignore", supLogFd.fd, supLogFd.fd],
    windowsHide: true,
    env: { ...process.env, [PARENT_LOCK_HELD_ENV_VAR]: "1" },
  });
  child.on("error", (err) => {
    process.stderr.write(
      `${JSON.stringify({ ok: false, code: "SUPERVISOR_SPAWN_FAILED", message: err.message })}\n`,
    );
  });
  const pid = child.pid;
  child.unref();
  await supLogFd.close();
  if (!pid) {
    throw new Error("SUPERVISOR_SPAWN_FAILED: could not spawn the supervisor process");
  }
  // The supervisor itself will rewrite supervisor.pid with its own pid on
  // startup; we write here too so a fast `status` between spawn and the
  // child's write still sees a live pid.
  await writePidfileAt(supervisorPidPath(slockHome), pid);
  return pid;
}

// ---------- per-server daemon child (the `__run <serverId>` mode) ----------

export interface ResidentCore {
  start: () => void | Promise<void>;
  stop: () => void | Promise<void>;
}
export type ResidentCoreFactory = (creds: {
  serverId: string;
  serverMachineId: string;
  apiKey: string;
  serverUrl: string;
}) => ResidentCore | Promise<ResidentCore>;

/**
 * Stable exit code for "the per-server daemon child can't even start
 * because its required dependency tree is missing or corrupt." Picked
 * to match the BSD `EX_CONFIG = 78` convention used by many CLIs.
 *
 * The supervisor recognises this code and (a) does NOT charge the crash
 * toward the repeated-crash budget (the daemon hasn't actually crashed
 * — it never ran), (b) marks the server `degraded` immediately so the
 * status/doctor surface explains why, and (c) does NOT auto-restart
 * (a missing dep won't fix itself by retrying).
 *
 * Triggered by Jianwei field test (#wg-slock-computer:0d6f6c15 finding
 * #2): a fresh source-run setup before `pnpm --filter @slock-ai/daemon
 * build` produced infinite ERR_MODULE_NOT_FOUND crash-restart-spin until
 * the 60s/3-crash threshold kicked in. With EX_CONFIG fail-closed, the
 * first attempt logs the actionable error and stops.
 */
export const EX_CONFIG_EXIT_CODE = 78;

const defaultCoreFactory: ResidentCoreFactory = async (creds) => {
  let coreMod: { DaemonCore: new (o: { serverUrl: string; apiKey: string; localTrace?: boolean }) => ResidentCore };
  try {
    coreMod = (await import("@slock-ai/daemon/core")) as typeof coreMod;
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    const isModuleMissing =
      code === "ERR_MODULE_NOT_FOUND" ||
      code === "MODULE_NOT_FOUND" ||
      (err instanceof Error && /Cannot find (module|package)/i.test(err.message));
    if (isModuleMissing) {
      process.stderr.write(
        `slock-computer: per-server daemon failed to load \`@slock-ai/daemon/core\`.\n` +
          `  Reason: ${err instanceof Error ? err.message : String(err)}\n` +
          `  This usually means a source-run workspace without a built daemon dist.\n` +
          `  Fix: run \`pnpm --filter @slock-ai/daemon build\` once, then \`slock-computer doctor <server> --reset-health && slock-computer start\`.\n` +
          `  (Packaged/npx installs ship the dist already — this only affects local source-run setups.)\n`,
      );
      process.exit(EX_CONFIG_EXIT_CODE);
    }
    throw err;
  }
  return new coreMod.DaemonCore({ serverUrl: creds.serverUrl, apiKey: creds.apiKey, localTrace: true });
};

/**
 * Classify a per-server daemon child exit so the supervisor's restart
 * loop can react proportionally.
 *
 *   `graceful`     — code 0, or terminated by SIGTERM/SIGINT. Treat as
 *                    an expected stop (supervisor itself, external user
 *                    kill, or daemon's own clean shutdown). Don't count
 *                    toward crash budget; supervisor still restarts if
 *                    the server is still in the MANAGED set.
 *   `config-error` — code 78 (EX_CONFIG_EXIT_CODE). Daemon child gave
 *                    up before running because its dep tree is broken
 *                    (e.g. source-run without `pnpm --filter
 *                    @slock-ai/daemon build`). Mark degraded
 *                    immediately, don't restart, don't count as crash.
 *   `crash`        — anything else. Count toward crash budget.
 *
 * Pure function — extracted from the supervisor exit handler so it can
 * be unit-tested without spawning real processes.
 */
export type ChildExitClass = "graceful" | "config-error" | "crash";

export function classifyChildExit(
  code: number | null,
  signal: NodeJS.Signals | null,
): ChildExitClass {
  if (code === EX_CONFIG_EXIT_CODE) return "config-error";
  if (signal === "SIGTERM" || signal === "SIGINT") return "graceful";
  if (code === 0) return "graceful";
  return "crash";
}

/**
 * The per-server daemon child. Loads exactly THAT server's attachment
 * (per-server isolation: never reads another server's state), runs
 * DaemonCore in-process. SIGTERM/SIGINT → core.stop().
 */
export async function runResident(
  serverId: string,
  deps: { coreFactory?: ResidentCoreFactory } = {},
): Promise<void> {
  assertValidServerId(serverId);
  const slockHome = resolveSlockHome();
  const a = await readServerAttachment(slockHome, serverId);
  if (!a) {
    fail(
      "NO_ATTACHMENT",
      `No attachment for server ${serverId}. Run \`slock-computer attach ${serverId}\` first.`,
    );
  }
  const core = await (deps.coreFactory ?? defaultCoreFactory)({
    serverId: a.serverId,
    serverMachineId: a.serverMachineId,
    apiKey: a.apiKey,
    serverUrl: a.serverUrl,
  });
  let stopping = false;
  const shutdown = async () => {
    if (stopping) return;
    stopping = true;
    try {
      await core.stop();
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGTERM", () => void shutdown());
  process.on("SIGINT", () => void shutdown());
  await core.start();
}

// ---------- supervisor loop (the `__supervise` mode) ----------

const RECONCILE_INTERVAL_MS = 5_000;
const CHILD_RESTART_BACKOFF_MS = 2_000;
const START_ENSURE_TIMEOUT_MS = 15_000;
const START_ENSURE_POLL_INTERVAL_MS = 100;

interface ChildHandle {
  serverId: string;
  child: ChildProcess;
  // When the user-requested detach removed this server, we ask the
  // child to stop and don't restart it on exit.
  stopping: boolean;
}

type RunStartDeps = {
  coreFactory?: ResidentCoreFactory;
  spawnDetachedSupervisor?: typeof spawnDetachedSupervisor;
  readPidfile?: typeof readPidfileAt;
  isProcessAlive?: typeof isProcessAlive;
  sleep?: (ms: number) => Promise<void>;
  ensureTimeoutMs?: number;
  ensurePollIntervalMs?: number;
};

async function waitForManagedDaemonPids(
  slockHome: string,
  serverIds: string[],
  deps: RunStartDeps,
): Promise<Map<string, number>> {
  const readPidfile = deps.readPidfile ?? readPidfileAt;
  const isAlive = deps.isProcessAlive ?? isProcessAlive;
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const timeoutMs = deps.ensureTimeoutMs ?? START_ENSURE_TIMEOUT_MS;
  const pollIntervalMs = deps.ensurePollIntervalMs ?? START_ENSURE_POLL_INTERVAL_MS;
  const deadline = Date.now() + timeoutMs;
  const ready = new Map<string, number>();

  while (ready.size < serverIds.length) {
    for (const serverId of serverIds) {
      if (ready.has(serverId)) continue;
      const pid = await readPidfile(serverDaemonPidPath(slockHome, serverId));
      if (pid && isAlive(pid)) ready.set(serverId, pid);
    }
    if (ready.size === serverIds.length) return ready;
    const remaining = deadline - Date.now();
    if (remaining <= 0) return ready;
    await sleep(Math.min(pollIntervalMs, remaining));
  }

  return ready;
}

function formatReadySummary(
  ready: Map<string, number>,
  serverIds: string[],
  opts: { serverId?: string | null; serverLabel?: string | null },
): string {
  if (opts.serverId && serverIds.length === 1) {
    const pid = ready.get(opts.serverId);
    return `Daemon for server ${opts.serverLabel ?? opts.serverId} is running${pid ? ` (pid ${pid})` : ""}.`;
  }
  return `Daemons for ${serverIds.length} managed server(s) are running.`;
}

function failStartEnsureTimeout(
  slockHome: string,
  serverIds: string[],
  ready: Map<string, number>,
  opts: { serverId?: string | null; serverLabel?: string | null },
): never {
  const missing = serverIds.filter((id) => !ready.has(id));
  const target =
    opts.serverId && missing.length === 1
      ? `${opts.serverLabel ?? opts.serverId}`
      : `${missing.length} daemon(s): ${missing.join(", ")}`;
  fail(
    "START_DAEMON_TIMEOUT",
    `Timed out waiting for ${target} to start. Run \`slock-computer status\` and inspect ${supervisorLogPath(slockHome)} plus per-server daemon logs under ~/.slock/computer/servers/<serverId>/daemon.log.`,
  );
}

/**
 * PR-H §3.1 — supervisor startup recovery pass (extracted so the
 * lock-preservation invariant can be unit-tested without launching the
 * full reconcile loop).
 *
 * The supervisor is the canonical lifecycle owner; an ordinary starting
 * supervisor implies no prior CLI mutator was mid-flight (else the
 * spawning CLI would have blocked on its own lock attempt). Force-release
 * any stale `.lock` unconditionally so the first post-supervisor CLI
 * acquires immediately instead of waiting for proper-lockfile's default
 * stale timeout. Then run the full cleanup pass so the supervisor starts
 * with a clean state baseline.
 *
 * Failures are tolerated: cleanup is best-effort self-heal, not a gate on
 * supervisor liveness. A failed cleanup logs a breadcrumb but does not
 * abort startup.
 *
 * EXCEPTION (Dayu blocker msg=ff69d33f): when this supervisor was
 * spawned by a parent CLI that is itself holding `.lock` under
 * `withMutationLock` (every current callsite: `runStart`,
 * `runUpgradeCli`), `forceReleaseLock` would delete the parent's
 * still-valid lock and let other mutating CLIs slip in during the long
 * PR-E upgrade window (phase 5 → rolling_health → cleanup). The parent
 * sets `PARENT_LOCK_HELD_ENV_VAR=1` to signal "skip the unconditional
 * force-release, but still run the rest of the recovery pass". Orphan /
 * post-crash supervisor restarts don't carry the env var → original
 * behavior preserved.
 *
 * Both `forceReleaseLock` (unconditional) AND `cleanupStaleLock` (60s
 * age-gated, fired inside `runFullCleanup`) are skipped under the marker
 * — a real PR-E upgrade can exceed the 60s age threshold during stage /
 * verify / extract / swap / restart, so the age gate is NOT a sufficient
 * guard. See Dayu blocker msg=29336624.
 */
export async function runSupervisorStartupRecovery(slockHome: string): Promise<void> {
  const parentHoldsLock = process.env[PARENT_LOCK_HELD_ENV_VAR] === "1";
  try {
    if (parentHoldsLock) {
      process.stderr.write(
        "Supervisor startup: parent CLI holds mutation lock — skipping lock cleanup.\n",
      );
    } else {
      const releasedLocks = await forceReleaseLock(slockHome);
      if (releasedLocks.length > 0) {
        process.stderr.write(
          `Supervisor startup: force-released ${releasedLocks.length} stale lock(s).\n`,
        );
      }
    }
    const report = await runFullCleanup(slockHome, { skipLockCleanup: parentHoldsLock });
    if (report.anyAction) {
      process.stderr.write(
        `Supervisor startup recovery: cleaned ${report.stalePidfiles.length} pidfile(s), ${report.powerLossRecovered.length} quarantined, ${report.tmpFilesCleared.length} tmp file(s), ${report.staleLocks.length} stale lock(s).\n`,
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(
      `Supervisor startup recovery pass failed: ${msg}. Continuing; cleanup will retry on next supervisor restart.\n`,
    );
  }
}

/**
 * Resolve the install root + version of the currently-running
 * supervisor. The install root is `<installRoot>/dist/index.js` for a
 * packed install, so two dirnames up from this module file. The version
 * is read from `<installRoot>/package.json`.
 *
 * Returns `null` for `version` if the package.json is unreadable —
 * doctor surface can still surface the installRoot; the version field
 * just becomes informational on dev-mode runs (where the source layout
 * doesn't produce a stable installRoot/package.json pair).
 */
async function resolveSupervisorIdentity(): Promise<{ installRoot: string; version: string | null }> {
  const here = fileURLToPath(import.meta.url);
  const installRoot = dirname(dirname(here));
  let version: string | null = null;
  try {
    const raw = await readFile(joinPath(installRoot, "package.json"), "utf8");
    const parsed = JSON.parse(raw) as { version?: unknown };
    if (typeof parsed.version === "string" && parsed.version.length > 0) {
      version = parsed.version;
    }
  } catch {
    /* dev-mode / no package.json — leave version null */
  }
  return { installRoot, version };
}

/**
 * Shape of `supervisor-version.json`. Stable contract for QA harness
 * + `doctor`-style operator inspection.
 */
export interface SupervisorVersionEvidence {
  version: string | null;
  installRoot: string;
  pid: number;
  writtenAt: string;
}

/**
 * Write `supervisor-version.json` evidence — captures what the
 * RUNNING supervisor process actually is (install root, version, pid)
 * at the moment it started. PR-E §QA active-version evidence + general
 * operator-debug surface.
 *
 * §10 layout invariants (liuliu review #wg-slock-computer:b43b36fb
 * msg=dd55ada2): atomic write via tmp + rename, mode 0o600. Same pattern
 * as `snapshotPhase` / `attachment.json` / pidfile writes.
 *
 * Failures are tolerated: this is observability, not a gate on
 * supervisor liveness. A failed write logs a breadcrumb but does not
 * abort startup.
 */
async function writeSupervisorVersionEvidence(slockHome: string): Promise<void> {
  try {
    const ident = await resolveSupervisorIdentity();
    const payload: SupervisorVersionEvidence = {
      version: ident.version,
      installRoot: ident.installRoot,
      pid: process.pid,
      writtenAt: new Date().toISOString(),
    };
    const dest = supervisorVersionPath(slockHome);
    const tmp = `${dest}.tmp`;
    await writeFile(tmp, JSON.stringify(payload) + "\n", { mode: 0o600 });
    await rename(tmp, dest);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(
      `Supervisor: failed to write version evidence: ${msg}. Continuing.\n`,
    );
  }
}

/**
 * Read `supervisor-version.json` evidence. Lenient: returns `null` if
 * the file is missing, unreadable, or not parseable JSON of the
 * expected shape (per liuliu review msg=dd55ada2). Callers that need
 * the evidence (QA harness, doctor) must handle the null case.
 */
export async function readSupervisorVersionEvidence(
  slockHome: string,
): Promise<SupervisorVersionEvidence | null> {
  try {
    const raw = await readFile(supervisorVersionPath(slockHome), "utf8");
    const parsed = JSON.parse(raw) as Partial<SupervisorVersionEvidence>;
    if (
      typeof parsed.installRoot !== "string" ||
      typeof parsed.pid !== "number" ||
      typeof parsed.writtenAt !== "string" ||
      (parsed.version !== null && typeof parsed.version !== "string")
    ) {
      return null;
    }
    return {
      version: parsed.version ?? null,
      installRoot: parsed.installRoot,
      pid: parsed.pid,
      writtenAt: parsed.writtenAt,
    };
  } catch {
    return null;
  }
}

export async function runSupervise(): Promise<void> {
  const slockHome = resolveSlockHome();
  await mkdir(computerDir(slockHome), { recursive: true });
  await runSupervisorStartupRecovery(slockHome);

  await writePidfileAt(supervisorPidPath(slockHome), process.pid);
  await writeSupervisorVersionEvidence(slockHome);

  const children = new Map<string, ChildHandle>();

  // Strip the parent-mutation-lock marker before spawning per-server
  // `__run` daemons so the control flag never leaks into daemon /
  // runtime / agent process environments. The marker is a startup-only
  // hint for a child SUPERVISOR; daemons don't run startup recovery and
  // shouldn't observe it. Defensive even though `runResident` doesn't
  // currently read this var. See Dayu nit (msg=29336624).
  const { [PARENT_LOCK_HELD_ENV_VAR]: _parentLockMarker, ...childEnv } = process.env;

  const spawnChild = async (serverId: string): Promise<void> => {
    const logPath = serverDaemonLogPath(slockHome, serverId);
    await mkdir(dirname(logPath), { recursive: true });
    const logFd = await open(logPath, "a");
    const { command, args } = buildResidentSpawn("__run", serverId);
    const child = spawn(command, args, {
      stdio: ["ignore", logFd.fd, logFd.fd],
      windowsHide: true,
      env: childEnv,
    });
    await logFd.close();
    if (!child.pid) return;
    const handle: ChildHandle = { serverId, child, stopping: false };
    children.set(serverId, handle);
    await writePidfileAt(serverDaemonPidPath(slockHome, serverId), child.pid);
    child.on("exit", (code, signal) => {
      void (async () => {
        children.delete(serverId);
        await clearPidfileAt(serverDaemonPidPath(slockHome, serverId));
        if (handle.stopping) return;

        const classification = classifyChildExit(code, signal);

        // Config-error fail-closed: daemon child couldn't load its deps
        // (e.g. source-run with missing daemon dist). Don't count toward
        // crash budget — the daemon never actually ran — but force the
        // server to `degraded` so doctor/status surfaces the cause, and
        // don't restart (a missing dep won't fix itself by retrying).
        if (classification === "config-error") {
          try {
            await markFatalConfig(slockHome, serverId, code, signal);
          } catch {
            /* health logging best-effort */
          }
          process.stderr.write(
            `Supervisor: server ${serverId} child exited with EX_CONFIG (${EX_CONFIG_EXIT_CODE}); ` +
              `marked degraded, NOT auto-restarting. ` +
              `See ${serverDaemonLogPath(slockHome, serverId)} for the actionable error.\n`,
          );
          return;
        }

        // Graceful exit (code 0, SIGTERM, SIGINT): supervisor or external
        // caller asked daemon to stop, daemon obliged. This is not a crash;
        // don't count toward crash budget. Still restart, because the
        // supervisor's contract is to keep MANAGED servers running — the
        // canonical way to stop a daemon for good is `slock-computer stop`
        // (which clears managed.flag and sets `handle.stopping`, hitting
        // the early return above).
        if (classification === "graceful") {
          await new Promise((r) => setTimeout(r, CHILD_RESTART_BACKOFF_MS));
          if ((await readServerAttachment(slockHome, serverId)) && !shuttingDown) {
            await spawnChild(serverId);
          }
          return;
        }

        // Real crash: record + check threshold (v6 §3.3: >=3 in 60s →
        // degraded, stop restarting).
        try {
          await recordCrash(slockHome, serverId, code, signal);
        } catch {
          /* health logging best-effort; never blocks recovery */
        }
        if (await isDegraded(slockHome, serverId)) {
          process.stderr.write(
            `Supervisor: server ${serverId} marked degraded (>=3 crashes in 60s); ` +
              `skipping auto-restart. Run \`slock-computer doctor ${serverId} --reset-health\` ` +
              `after fixing the underlying issue.\n`,
          );
          return;
        }
        await new Promise((r) => setTimeout(r, CHILD_RESTART_BACKOFF_MS));
        if ((await readServerAttachment(slockHome, serverId)) && !shuttingDown) {
          await spawnChild(serverId);
        }
      })();
    });
  };

  const killChild = (handle: ChildHandle): void => {
    handle.stopping = true;
    try {
      handle.child.kill("SIGTERM");
    } catch {
      /* ignore */
    }
  };

  const reconcile = async (): Promise<void> => {
    // Contract v4 §6 line 80: the supervisor keeps daemons running for
    // servers in the MANAGED subset (attached + managed.flag set), not
    // every attached server. `start [serverId]` writes managed.flag for
    // the targeted server(s); `start` without serverId writes it for
    // all attached. detach clears managed.flag and removes the attachment.
    const wanted = new Set(await listManagedServerIds(slockHome));
    for (const id of wanted) {
      if (!children.has(id)) await spawnChild(id);
    }
    for (const [id, handle] of children) {
      if (!wanted.has(id)) killChild(handle);
    }
  };

  let shuttingDown = false;
  const shutdown = (): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    for (const handle of children.values()) killChild(handle);
    void clearPidfileAt(supervisorPidPath(slockHome)).then(() => process.exit(0));
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  await reconcile();
  // Periodic reconcile — picks up new attachments (attach add-not-replace)
  // and reaps daemons whose attachment was removed (basis for detach).
  const timer = setInterval(() => {
    void reconcile();
  }, RECONCILE_INTERVAL_MS);
  // Keep the loop alive even if no children for a moment.
  timer.unref();
  // Block forever; signals do the cleanup.
  await new Promise<void>(() => {
    /* never resolves */
  });
}

// ---------- `start [serverId]` user-facing command ----------

export async function runStart(
  opts: { foreground?: boolean; serverId?: string | null; serverLabel?: string | null } = {},
  deps: RunStartDeps = {},
): Promise<void> {
  const slockHome = resolveSlockHome();

  // We need at least one attachment to start anything meaningful.
  const attached = await listAttachedServerIds(slockHome);
  if (attached.length === 0) {
    fail(
      "NO_ATTACHMENT",
      "No server attachments yet. Run `slock-computer attach <serverId>` first.",
    );
  }
  if (opts.serverId && !attached.includes(opts.serverId)) {
    fail(
      "NOT_ATTACHED",
      `Not attached to server ${opts.serverId}. Run \`slock-computer attach ${opts.serverId}\` first or omit the argument.`,
    );
  }

  // Contract v4 §6 line 80: mark which server(s) the supervisor should
  // keep running. `start <serverId>` → only that one. `start` no-arg →
  // all attached. Writing the managed.flag here (before spawning the
  // supervisor) means the supervisor's first reconcile picks up the
  // correct managed-set.
  const managedTargets = opts.serverId ? [opts.serverId] : attached;
  for (const id of managedTargets) {
    await setServerManaged(slockHome, id);
  }

  // Idempotent: a live supervisor pidfile → already running. Managed
  // flags we just wrote will be picked up by its next reconcile tick.
  const existing = await readPidfileAt(supervisorPidPath(slockHome));
  if (existing && isProcessAlive(existing)) {
    info(`Supervisor already running (pid ${existing}).`);
    const ready = await waitForManagedDaemonPids(slockHome, managedTargets, deps);
    if (ready.size !== managedTargets.length) {
      failStartEnsureTimeout(slockHome, managedTargets, ready, opts);
    }
    info(formatReadySummary(ready, managedTargets, opts));
    return;
  }

  // Foreground: run the supervise loop inline.
  if (opts.foreground) {
    info(
      `Running supervisor in the foreground (managing ${managedTargets.length} of ${attached.length} attached server(s)). Ctrl-C to stop.`,
    );
    await runSupervise();
    return;
  }

  // Background: re-exec slock-computer ITSELF detached into __supervise.
  let pid: number;
  try {
    pid = await (deps.spawnDetachedSupervisor ?? spawnDetachedSupervisor)(slockHome);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    fail("SUPERVISOR_SPAWN_FAILED", msg);
  }
  info(`Supervisor started (pid ${pid}); keeps running after this terminal closes.`);
  const ready = await waitForManagedDaemonPids(slockHome, managedTargets, deps);
  if (ready.size !== managedTargets.length) {
    failStartEnsureTimeout(slockHome, managedTargets, ready, opts);
  }
  info(formatReadySummary(ready, managedTargets, opts));
  info(
    `Managing ${managedTargets.length} of ${attached.length} attached server(s). Logs: ${supervisorLogPath(slockHome)}`,
  );
  info(`Per-server daemon logs: ~/.slock/computer/servers/<serverId>/daemon.log`);
  info(`Check state with \`slock-computer status\`.`);
}

// ---------- `detach <serverId>` ----------

/**
 * Remove one server's local attachment. Per-server isolation: never
 * touches user-session, never touches other servers/<id>/, never touches
 * supervisor state. The running supervisor (if any) notices via its
 * reconcile tick and stops the corresponding per-server daemon child.
 *
 * Contract v4 §6 line 79: "best-effort revoke/detach that server's
 * Computer credential". We attempt a server-side revoke via
 * `POST /internal/computer/attachment/revoke` (principal: this server's
 * own sk_computer_*) before clearing local state. Failure is surfaced as
 * a warning but does NOT block the detach — the contract is "best-effort".
 */
// ---------- `stop` user-facing command ----------

/**
 * v0.0.8 — root `slock-computer stop` command.
 *
 * Stop the persistent supervisor process gracefully (SIGTERM → wait for
 * pidfile clear). Idempotent: missing or stale pidfile reports
 * "Supervisor not running" and exits 0; the existing supervisor signal
 * handler clears its own pidfile on shutdown (supervisor.ts shutdown
 * handler around L680).
 *
 * Wired into the upgrade-ephemeral-context error message remediation
 * sequence (`upgradeCli.ts` ephemeral gate redirect, msg=fb9e5675 Hao):
 * `npx -y @slock-ai/computer@latest stop` must route to an actually-
 * working CLI handler or the migration cliff stays unresolved. Pre-0.0.8
 * the only `stop` was `runners stop <agentId>`; this adds the root
 * supervisor-level `stop` that field users actually need.
 *
 * Failure surfaces (Tier-2 stderr-only per §4.4 dual-tier note):
 *   - SIGTERM throws (e.g. EPERM) → STOP_SIGNAL_FAILED with actionable
 *   - SIGTERM succeeds + supervisor doesn't exit within `timeoutMs` →
 *     STOP_TIMEOUT with `kill -9 <pid>` hint
 *
 * Dep-injectable for tests so we can simulate pidfile state + kill /
 * isAlive transitions without launching a real supervisor.
 */
export interface RunStopDeps {
  readPidfile?: typeof readPidfileAt;
  isProcessAlive?: typeof isProcessAlive;
  killSupervisor?: (pid: number) => void;
  sleep?: (ms: number) => Promise<void>;
  pollIntervalMs?: number;
  timeoutMs?: number;
}

export async function runStop(deps: RunStopDeps = {}): Promise<void> {
  const slockHome = resolveSlockHome();
  const readPidfile = deps.readPidfile ?? readPidfileAt;
  const isAlive = deps.isProcessAlive ?? isProcessAlive;
  const killer = deps.killSupervisor ?? ((pid: number) => {
    process.kill(pid, "SIGTERM");
  });
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));
  const pollIntervalMs = deps.pollIntervalMs ?? 200;
  const timeoutMs = deps.timeoutMs ?? 5000;

  const pidfilePath = supervisorPidPath(slockHome);
  const pid = await readPidfile(pidfilePath);

  // Idempotent: missing pidfile OR stale (pid present but process dead).
  if (pid === null) {
    info("Supervisor not running.");
    return;
  }
  if (!isAlive(pid)) {
    // Stale pidfile from a crashed supervisor — clean it up so subsequent
    // `start` doesn't hit a "supervisor already running" false positive.
    await clearPidfileAt(pidfilePath);
    info(`Supervisor not running (cleared stale pidfile for pid ${pid}).`);
    return;
  }

  // Send SIGTERM. The supervisor's signal handler (supervisor.ts L676-681)
  // clears its own pidfile + process.exit(0). We poll for liveness rather
  // than pidfile-absence because pidfile clear is best-effort during
  // emergency shutdown.
  try {
    killer(pid);
  } catch (err) {
    fail(
      "STOP_SIGNAL_FAILED",
      `Failed to send SIGTERM to supervisor (pid ${pid}): ${err instanceof Error ? err.message : String(err)}. Check process permissions or run: kill ${pid}`,
    );
  }

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!isAlive(pid)) {
      // Defensive pidfile cleanup if the supervisor crashed before its
      // signal handler ran. Best-effort; the path may already be gone.
      await clearPidfileAt(pidfilePath);
      info(`Stopped supervisor (pid ${pid}).`);
      return;
    }
    await sleep(pollIntervalMs);
  }

  fail(
    "STOP_TIMEOUT",
    `Supervisor (pid ${pid}) did not exit within ${timeoutMs}ms after SIGTERM. Force-kill with: kill -9 ${pid}`,
  );
}

export async function runDetach(serverId: string, serverLabel = serverId): Promise<void> {
  assertValidServerId(serverId);
  const slockHome = resolveSlockHome();
  const a = await readServerAttachment(slockHome, serverId);
  if (!a) {
    fail("NOT_ATTACHED", `Not attached to server ${serverLabel} (nothing to detach).`);
  }
  // Step 1: best-effort server-side revoke. Uses the attachment's own
  // sk_computer_* as the principal; the server endpoint is principal-only
  // (no path param) so an sk_computer can only revoke its own row. Network
  // failure or non-2xx is logged but not fatal: contract is best-effort.
  await bestEffortServerRevoke(a.serverUrl, a.apiKey, serverId);
  // Step 2: clear managed.flag so the supervisor's next reconcile tick
  // stops this server's daemon child even if attachment.json removal
  // races with the supervisor reading mid-tick.
  await clearServerManaged(slockHome, serverId);
  // Step 3: remove the per-server subtree. The supervisor reconcile loop
  // sees the attachment gone and kills that server's daemon child.
  // We avoid `rm -rf` recursion semantics: explicitly unlink the known
  // files; refuse to touch anything outside `servers/<serverId>/`.
  const subtree = [
    serverAttachmentPath(slockHome, serverId),
    serverDaemonPidPath(slockHome, serverId),
    serverDaemonLogPath(slockHome, serverId),
  ];
  for (const p of subtree) await clearPidfileAt(p); // unlink-or-ignore
  // The subdir itself is left to the supervisor's next reconcile pass
  // (and the OS); empty dirs are harmless and they get reused on re-attach.
  info(`Detached from server ${serverLabel}.`);
  info(`The supervisor (if running) will stop that server's daemon on its next reconcile tick.`);
}

/**
 * Best-effort server-side revoke of this server's Computer credential.
 * Never throws — failures emit a stderr warning and return. Contract v4
 * §6 line 79 says "best-effort"; a failed revoke does not block detach.
 *
 * Uses the attachment's own sk_computer_* as the principal so the server
 * can identify which `computers` row to mark revokedAt; the endpoint is
 * principal-only and rejects any other principal kind.
 */
async function bestEffortServerRevoke(
  serverUrl: string,
  apiKey: string,
  serverId: string,
): Promise<void> {
  const url = `${serverUrl.replace(/\/$/, "")}/internal/computer/attachment/revoke`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ reason: "computer_detach" }),
      signal: controller.signal,
    });
    if (!res.ok) {
      process.stderr.write(
        `Warning: server-side revoke for server ${serverId} returned HTTP ${res.status}; ` +
          `local detach proceeds, but the credential may remain valid until it expires.\n`,
      );
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    process.stderr.write(
      `Warning: server-side revoke for server ${serverId} failed: ${msg}. ` +
        `Local detach proceeds, but the credential may remain valid until it expires.\n`,
    );
  } finally {
    clearTimeout(timeout);
  }
}
