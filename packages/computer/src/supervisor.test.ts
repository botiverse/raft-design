import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm, readFile, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  isProcessAlive,
  readPidfileAt,
  buildResidentSpawn,
  runResident,
  runStart,
  runStop,
  runDetach,
  runSupervisorStartupRecovery,
  PARENT_LOCK_HELD_ENV_VAR,
} from "./supervisor.js";
import {
  computerDir,
  supervisorPidPath,
  serverAttachmentPath,
  serverDaemonPidPath,
  serverManagedFlagPath,
} from "./paths.js";
import { stat } from "node:fs/promises";
import {
  isServerManaged,
  listManagedServerIds,
  setServerManaged,
} from "./serverState.js";
import { CliExit } from "./output.js";

// task #30 PR-G regression guard — supervisor + per-server daemon
// primitives. Pins: pure pieces (argv, pidfile, liveness),
// per-server fail-closed paths (NO_ATTACHMENT / NOT_ATTACHED), and
// detach isolation.

const SERVER_A = "11111111-1111-4111-8111-111111111111";
const SERVER_B = "22222222-2222-4222-8222-222222222222";

async function withHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = await mkdtemp(join(tmpdir(), "slock-computer-sup-"));
  const old = process.env.SLOCK_HOME;
  process.env.SLOCK_HOME = home;
  try {
    return await fn(home);
  } finally {
    if (old === undefined) delete process.env.SLOCK_HOME;
    else process.env.SLOCK_HOME = old;
    await rm(home, { recursive: true, force: true });
  }
}

function captureOut(): { restore: () => void; text: () => string } {
  const oo = process.stdout.write.bind(process.stdout);
  const oe = process.stderr.write.bind(process.stderr);
  let buf = "";
  const sink = ((c: unknown) => { buf += String(c); return true; });
  process.stdout.write = sink as typeof process.stdout.write;
  process.stderr.write = sink as typeof process.stderr.write;
  return { restore: () => { process.stdout.write = oo; process.stderr.write = oe; }, text: () => buf };
}

async function writeAttach(home: string, serverId: string): Promise<void> {
  const p = serverAttachmentPath(home, serverId);
  await mkdir(join(p, ".."), { recursive: true });
  await writeFile(p, JSON.stringify({
    kind: "computer-attachment",
    serverId,
    serverMachineId: `cm-${serverId}`,
    apiKey: `sk_computer_${serverId}`,
    serverUrl: "https://api.example.test",
  }));
}

async function writeDaemonPid(home: string, serverId: string, pid = process.pid): Promise<void> {
  const p = serverDaemonPidPath(home, serverId);
  await mkdir(join(p, ".."), { recursive: true });
  await writeFile(p, String(pid), { mode: 0o600 });
}

test("isProcessAlive: own pid alive, absurd/junk dead", () => {
  assert.equal(isProcessAlive(process.pid), true);
  assert.equal(isProcessAlive(999999999), false);
  assert.equal(isProcessAlive(0), false);
  assert.equal(isProcessAlive(Number.NaN), false);
});

test("readPidfileAt: missing → null, junk → null, valid → number", async () => {
  await withHome(async (home) => {
    assert.equal(await readPidfileAt(supervisorPidPath(home)), null);
    await mkdir(join(home, "computer"), { recursive: true });
    await writeFile(supervisorPidPath(home), "nope");
    assert.equal(await readPidfileAt(supervisorPidPath(home)), null);
    await writeFile(supervisorPidPath(home), " 4242\n");
    assert.equal(await readPidfileAt(supervisorPidPath(home)), 4242);
  });
});

test("buildResidentSpawn: carries execArgv (tsx loader); __supervise vs __run <serverId>", () => {
  const sup = buildResidentSpawn("__supervise", null, "/abs/index.ts", ["--import", "tsx"]);
  assert.equal(sup.command, process.execPath);
  assert.deepEqual(sup.args, ["--import", "tsx", "/abs/index.ts", "__supervise"]);

  const run = buildResidentSpawn("__run", SERVER_A, "/abs/dist/index.js", []);
  assert.deepEqual(run.args, ["/abs/dist/index.js", "__run", SERVER_A]);
});

test("__run / runResident: loads THAT server's attachment, constructs core with its creds, starts it", async () => {
  await withHome(async (home) => {
    await writeAttach(home, SERVER_A);
    let seenServerId = "";
    let seenApiKey = "";
    let started = false;
    await runResident(SERVER_A, {
      coreFactory: (creds) => {
        seenServerId = creds.serverId;
        seenApiKey = creds.apiKey;
        return { start: () => { started = true; }, stop: () => {} };
      },
    });
    assert.equal(seenServerId, SERVER_A);
    assert.equal(seenApiKey, `sk_computer_${SERVER_A}`);
    assert.equal(started, true);
  });
});

test("__run / runResident: no attachment for that server → fail-closed NO_ATTACHMENT", async () => {
  await withHome(async () => {
    const cap = captureOut();
    try {
      await assert.rejects(
        () => runResident(SERVER_A, { coreFactory: () => ({ start: () => {}, stop: () => {} }) }),
        (e) => e instanceof CliExit,
      );
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /NO_ATTACHMENT/);
  });
});

test("start: no attached servers → fail-closed before any spawn", async () => {
  await withHome(async () => {
    const cap = captureOut();
    try {
      await assert.rejects(() => runStart({}), (e) => e instanceof CliExit && e.exitCode === 1);
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /NO_ATTACHMENT/);
  });
});

test("start: serverId not in attached set → NOT_ATTACHED", async () => {
  await withHome(async (home) => {
    await writeAttach(home, SERVER_A);
    const cap = captureOut();
    try {
      await assert.rejects(() => runStart({ serverId: SERVER_B }), (e) => e instanceof CliExit);
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /NOT_ATTACHED/);
  });
});

test("start: live supervisor pidfile → waits for daemon readiness before returning", async () => {
  await withHome(async (home) => {
    await writeAttach(home, SERVER_A);
    await mkdir(join(home, "computer"), { recursive: true });
    await writeFile(supervisorPidPath(home), String(process.pid)); // alive
    let polls = 0;
    const cap = captureOut();
    try {
      await runStart(
        {},
        {
          readPidfile: async (pidfile) => {
            polls += 1;
            if (polls === 2) await writeDaemonPid(home, SERVER_A);
            return readPidfileAt(pidfile);
          },
          sleep: async () => undefined,
        },
      );
    } finally {
      cap.restore();
    }
    assert.equal(polls >= 2, true);
    assert.match(cap.text(), /Supervisor already running/);
    assert.match(cap.text(), /Daemons for 1 managed server\(s\) are running/);
    assert.doesNotMatch(cap.text(), /next reconcile tick/);
  });
});

test("start: live supervisor but daemon never becomes ready → fail-loud START_DAEMON_TIMEOUT", async () => {
  await withHome(async (home) => {
    await writeAttach(home, SERVER_A);
    await mkdir(join(home, "computer"), { recursive: true });
    await writeFile(supervisorPidPath(home), String(process.pid));
    const cap = captureOut();
    try {
      await assert.rejects(
        () =>
          runStart(
            { serverId: SERVER_A, serverLabel: "/alpha" },
            {
              ensureTimeoutMs: 0,
              ensurePollIntervalMs: 1,
              sleep: async () => undefined,
            },
          ),
        (e) => e instanceof CliExit,
      );
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /START_DAEMON_TIMEOUT/);
    assert.match(cap.text(), /slock-computer status/);
    assert.doesNotMatch(cap.text(), /next reconcile tick/);
  });
});

test("start: newly spawned supervisor waits for target daemon before returning", async () => {
  await withHome(async (home) => {
    await writeAttach(home, SERVER_A);
    const cap = captureOut();
    try {
      await runStart(
        { serverId: SERVER_A, serverLabel: "/alpha" },
        {
          spawnDetachedSupervisor: async () => {
            await writeDaemonPid(home, SERVER_A);
            return process.pid;
          },
        },
      );
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /Supervisor started/);
    assert.match(cap.text(), /Daemon for server \/alpha is running/);
  });
});

test("detach: removes ONLY that server's subtree, never touches user-session or other servers", async () => {
  await withHome(async (home) => {
    // 2 attachments + a user-session.
    await writeAttach(home, SERVER_A);
    await writeAttach(home, SERVER_B);
    const sess = join(home, "computer", "user-session.json");
    await writeFile(sess, '{"kind":"user-session","userId":"u1","accessToken":"t","serverUrl":"x"}');

    const cap = captureOut();
    try {
      await runDetach(SERVER_A);
    } finally {
      cap.restore();
    }
    // A's attachment is gone; B's untouched; user-session untouched.
    await assert.rejects(() => readFile(serverAttachmentPath(home, SERVER_A), "utf8"));
    const bRaw = await readFile(serverAttachmentPath(home, SERVER_B), "utf8");
    assert.ok(bRaw.includes(SERVER_B));
    const sessRaw = await readFile(sess, "utf8");
    assert.ok(sessRaw.includes("user-session"));
  });
});

test("detach: not attached → fail-closed NOT_ATTACHED", async () => {
  await withHome(async () => {
    const cap = captureOut();
    try {
      await assert.rejects(() => runDetach(SERVER_A), (e) => e instanceof CliExit);
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /NOT_ATTACHED/);
  });
});

// --- managed.flag contract v4 §6 line 80 ---

test("start <serverId>: marks ONLY that server as managed", async () => {
  await withHome(async (home) => {
    await writeAttach(home, SERVER_A);
    await writeAttach(home, SERVER_B);
    // Pre-write supervisor pid so runStart returns idempotently without
    // spawning a real supervisor process.
    await mkdir(join(home, "computer"), { recursive: true });
    await writeFile(supervisorPidPath(home), String(process.pid));
    await writeDaemonPid(home, SERVER_A);
    const cap = captureOut();
    try {
      await runStart({ serverId: SERVER_A });
    } finally {
      cap.restore();
    }
    assert.equal(await isServerManaged(home, SERVER_A), true);
    assert.equal(await isServerManaged(home, SERVER_B), false);
  });
});

test("start (no arg): marks ALL attached servers as managed", async () => {
  await withHome(async (home) => {
    await writeAttach(home, SERVER_A);
    await writeAttach(home, SERVER_B);
    await mkdir(join(home, "computer"), { recursive: true });
    await writeFile(supervisorPidPath(home), String(process.pid));
    await writeDaemonPid(home, SERVER_A);
    await writeDaemonPid(home, SERVER_B);
    const cap = captureOut();
    try {
      await runStart({});
    } finally {
      cap.restore();
    }
    assert.equal(await isServerManaged(home, SERVER_A), true);
    assert.equal(await isServerManaged(home, SERVER_B), true);
  });
});

test("listManagedServerIds: returns only servers with both attachment AND managed.flag", async () => {
  await withHome(async (home) => {
    await writeAttach(home, SERVER_A);
    await writeAttach(home, SERVER_B);
    await setServerManaged(home, SERVER_A);
    // SERVER_B is attached but NOT managed.
    const managed = await listManagedServerIds(home);
    assert.deepEqual(managed, [SERVER_A]);
  });
});

test("detach: clears managed.flag along with attachment", async () => {
  await withHome(async (home) => {
    await writeAttach(home, SERVER_A);
    await setServerManaged(home, SERVER_A);
    assert.equal(await isServerManaged(home, SERVER_A), true);
    const cap = captureOut();
    try {
      await runDetach(SERVER_A);
    } finally {
      cap.restore();
    }
    assert.equal(await isServerManaged(home, SERVER_A), false);
    // Best-effort server revoke is fired during detach; the test
    // attachment serverUrl resolves nowhere so the fetch fails fast and
    // emits a stderr warning. The warning is the expected best-effort
    // surface — NOT a test failure.
    assert.match(cap.text(), /Warning: server-side revoke for server/);
  });
});

// Touch serverDaemonPidPath to exercise the path helper (no semantic
// assertion; would catch accidental shape regression at compile time).
test("paths: serverDaemonPidPath ends in servers/<id>/daemon.pid", () => {
  const p = serverDaemonPidPath("/x", SERVER_A);
  assert.match(p, new RegExp(`servers/${SERVER_A}/daemon\\.pid$`));
});

// Dayu blocker (#wg-slock-computer:b43b36fb msg=ff69d33f). Supervisor
// startup recovery is invoked under two distinct conditions:
//   (a) ordinary / orphan / post-crash startup — parent CLI is NOT
//       holding `.lock`, so `forceReleaseLock` is correct.
//   (b) PR-E upgrade or `start` background path — parent CLI IS holding
//       `.lock` under `withMutationLock`, so force-releasing it would
//       open a serialization hole during the upgrade window.
// These tests pin both branches.

async function makeLockDir(home: string): Promise<string> {
  const dir = join(computerDir(home), ".lock");
  await mkdir(dir, { recursive: true });
  return dir;
}

test("runSupervisorStartupRecovery: parent holds lock → .lock preserved, breadcrumb emitted", async () => {
  await withHome(async (home) => {
    const lockDir = await makeLockDir(home);
    const prevMarker = process.env[PARENT_LOCK_HELD_ENV_VAR];
    process.env[PARENT_LOCK_HELD_ENV_VAR] = "1";
    const cap = captureOut();
    try {
      await runSupervisorStartupRecovery(home);
    } finally {
      cap.restore();
      if (prevMarker === undefined) delete process.env[PARENT_LOCK_HELD_ENV_VAR];
      else process.env[PARENT_LOCK_HELD_ENV_VAR] = prevMarker;
    }
    // Lock must still be on disk — PR-H §3.2 serialization invariant.
    const s = await stat(lockDir);
    assert.ok(s.isDirectory(), ".lock must survive parent-held startup recovery");
    assert.match(cap.text(), /skipping lock cleanup/);
  });
});

test("runSupervisorStartupRecovery: no marker → .lock force-released (orphan path preserved)", async () => {
  await withHome(async (home) => {
    const lockDir = await makeLockDir(home);
    const prevMarker = process.env[PARENT_LOCK_HELD_ENV_VAR];
    delete process.env[PARENT_LOCK_HELD_ENV_VAR];
    const cap = captureOut();
    try {
      await runSupervisorStartupRecovery(home);
    } finally {
      cap.restore();
      if (prevMarker !== undefined) process.env[PARENT_LOCK_HELD_ENV_VAR] = prevMarker;
    }
    // Without the marker, the supervisor is the canonical lifecycle
    // owner and clears the stale lock so the next CLI acquires fast.
    await assert.rejects(() => stat(lockDir), /ENOENT/);
    assert.match(cap.text(), /force-released 1 stale lock/);
  });
});

test("runSupervisorStartupRecovery: marker present but no lock → no-op + no spurious breadcrumb about release", async () => {
  await withHome(async (home) => {
    const prevMarker = process.env[PARENT_LOCK_HELD_ENV_VAR];
    process.env[PARENT_LOCK_HELD_ENV_VAR] = "1";
    const cap = captureOut();
    try {
      await runSupervisorStartupRecovery(home);
    } finally {
      cap.restore();
      if (prevMarker === undefined) delete process.env[PARENT_LOCK_HELD_ENV_VAR];
      else process.env[PARENT_LOCK_HELD_ENV_VAR] = prevMarker;
    }
    // No lock to begin with; recovery still emits the marker note but
    // does not falsely claim it released anything.
    assert.match(cap.text(), /skipping lock cleanup/);
    assert.doesNotMatch(cap.text(), /force-released \d+ stale lock/);
  });
});

// Dayu Round 3 blocker (#wg-slock-computer:b43b36fb msg=29336624):
// the env-var marker MUST suppress the entire `.lock` cleanup category,
// not just the unconditional `forceReleaseLock` step. `runFullCleanup`
// also fires `cleanupStaleLock` which rm's any `.lock` whose mtime is
// older than 60s — and a real PR-E upgrade (stage + verify + extract +
// swap + rolling-health + cleanup) routinely exceeds 60s. Without this
// fix, the parent CLI's still-valid lock would be wiped mid-upgrade,
// breaking the PR-H §3.2 "mutating commands serialize cleanly"
// invariant during the upgrade window.

test("runSupervisorStartupRecovery: marker + >60s-old .lock → still preserved (age-gated cleanup ALSO skipped)", async () => {
  await withHome(async (home) => {
    const lockDir = await makeLockDir(home);
    // Backdate the lock dir's mtime to 5 minutes ago so cleanupStaleLock
    // (60s threshold) would normally rm it.
    const oldTime = new Date(Date.now() - 5 * 60 * 1000);
    await utimes(lockDir, oldTime, oldTime);
    const prevMarker = process.env[PARENT_LOCK_HELD_ENV_VAR];
    process.env[PARENT_LOCK_HELD_ENV_VAR] = "1";
    const cap = captureOut();
    try {
      await runSupervisorStartupRecovery(home);
    } finally {
      cap.restore();
      if (prevMarker === undefined) delete process.env[PARENT_LOCK_HELD_ENV_VAR];
      else process.env[PARENT_LOCK_HELD_ENV_VAR] = prevMarker;
    }
    // Even though the lock is well past the 60s age gate, the marker
    // tells the supervisor "parent CLI is mid-mutate, hands off the
    // lock entirely". Same serialization invariant as the fresh-lock
    // case above.
    const s = await stat(lockDir);
    assert.ok(s.isDirectory(), ".lock must survive parent-held even when older than 60s");
    assert.match(cap.text(), /skipping lock cleanup/);
    assert.doesNotMatch(cap.text(), /force-released \d+ stale lock/);
    assert.doesNotMatch(cap.text(), /\d+ stale lock\(s\)\./);
  });
});

test("runSupervisorStartupRecovery: NO marker + >60s-old .lock → still removed by age-gated cleanup (orphan recovery preserved)", async () => {
  await withHome(async (home) => {
    const lockDir = await makeLockDir(home);
    const oldTime = new Date(Date.now() - 5 * 60 * 1000);
    await utimes(lockDir, oldTime, oldTime);
    const prevMarker = process.env[PARENT_LOCK_HELD_ENV_VAR];
    delete process.env[PARENT_LOCK_HELD_ENV_VAR];
    const cap = captureOut();
    try {
      await runSupervisorStartupRecovery(home);
    } finally {
      cap.restore();
      if (prevMarker !== undefined) process.env[PARENT_LOCK_HELD_ENV_VAR] = prevMarker;
    }
    // Orphan path: supervisor IS the canonical lifecycle owner; the
    // unconditional `forceReleaseLock` runs first and wipes the lock.
    // (The age-gated `cleanupStaleLock` would also have cleared it,
    // but `forceReleaseLock` runs first and short-circuits.)
    await assert.rejects(() => stat(lockDir), /ENOENT/);
    assert.match(cap.text(), /force-released 1 stale lock/);
  });
});

// ---------- classifyChildExit (task #48 #3 — SIGTERM crash budget) ----------
//
// Field finding: external `kill -TERM <daemonPid>` was counted as a crash
// because the supervisor's exit handler treated all `handle.stopping=false`
// exits as crashes. After 3 such kills in 60s the server went degraded
// even though no actual crash occurred. classifyChildExit splits exit
// modes so only true crashes count toward the budget.

import { classifyChildExit, EX_CONFIG_EXIT_CODE } from "./supervisor.js";

test("classifyChildExit: code 0 → graceful (not a crash)", () => {
  assert.equal(classifyChildExit(0, null), "graceful");
});

test("classifyChildExit: SIGTERM → graceful regardless of source", () => {
  // External `kill -TERM`, supervisor-initiated kill, or daemon's own
  // SIGTERM-handler-driven exit all surface as signal=SIGTERM. The
  // exit handler can't tell them apart, but they all represent
  // "process was asked to stop", not "process crashed".
  assert.equal(classifyChildExit(null, "SIGTERM"), "graceful");
});

test("classifyChildExit: SIGINT → graceful (Ctrl-C / dev kill)", () => {
  assert.equal(classifyChildExit(null, "SIGINT"), "graceful");
});

test(`classifyChildExit: code ${EX_CONFIG_EXIT_CODE} → config-error`, () => {
  // EX_CONFIG sentinel from runResident when @slock-ai/daemon/core can't
  // resolve. Don't count toward crash budget AND don't restart.
  assert.equal(classifyChildExit(EX_CONFIG_EXIT_CODE, null), "config-error");
});

test("classifyChildExit: non-zero exit code → crash", () => {
  assert.equal(classifyChildExit(1, null), "crash");
  assert.equal(classifyChildExit(127, null), "crash");
});

test("classifyChildExit: non-graceful signals → crash", () => {
  assert.equal(classifyChildExit(null, "SIGKILL"), "crash");
  assert.equal(classifyChildExit(null, "SIGSEGV"), "crash");
  assert.equal(classifyChildExit(null, "SIGBUS"), "crash");
});

test("classifyChildExit: EX_CONFIG_EXIT_CODE constant is 78 (BSD EX_CONFIG)", () => {
  assert.equal(EX_CONFIG_EXIT_CODE, 78);
});

// --- runStop (root `slock-computer stop` — v0.0.8 hotfix command) ---
//
// Wired into ephemeral-context upgrade remediation per #wg-slock-computer
// msg=fb9e5675 (Hao blocker). Tests cover the four state transitions:
// missing pidfile, stale pidfile, alive supervisor, and the failure
// surfaces (signal throw, exit-timeout).

test("runStop: no pidfile → idempotent 'Supervisor not running' (exit 0)", async () => {
  await withHome(async () => {
    const cap = captureOut();
    try {
      await runStop({
        readPidfile: async () => null,
        isProcessAlive: () => false,
      });
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /Supervisor not running/);
  });
});

test("runStop: stale pidfile (pid dead) → clears pidfile + idempotent success", async () => {
  await withHome(async (home) => {
    const pidfile = supervisorPidPath(home);
    await mkdir(computerDir(home), { recursive: true });
    await writeFile(pidfile, "99999\n", "utf8");
    const cap = captureOut();
    try {
      await runStop({
        readPidfile: async () => 99999,
        isProcessAlive: () => false,
      });
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /Supervisor not running.*cleared stale pidfile/);
    // Pidfile cleared.
    await assert.rejects(
      () => readFile(pidfile, "utf8"),
      (e) => (e as NodeJS.ErrnoException).code === "ENOENT",
    );
  });
});

test("runStop: alive supervisor → SIGTERM + waits for exit + success", async () => {
  await withHome(async () => {
    let killed = false;
    let aliveCalls = 0;
    const cap = captureOut();
    try {
      await runStop({
        readPidfile: async () => 12345,
        // First call (gate): alive. After kill (subsequent polls): dead.
        isProcessAlive: () => {
          aliveCalls += 1;
          return aliveCalls === 1;
        },
        killSupervisor: (pid: number) => {
          assert.equal(pid, 12345);
          killed = true;
        },
        sleep: async () => {},
        pollIntervalMs: 1,
        timeoutMs: 1000,
      });
    } finally {
      cap.restore();
    }
    assert.equal(killed, true, "SIGTERM must be sent");
    assert.match(cap.text(), /Stopped supervisor.*pid 12345/);
  });
});

test("runStop: SIGTERM throws (e.g. EPERM) → STOP_SIGNAL_FAILED with actionable kill hint", async () => {
  await withHome(async () => {
    const cap = captureOut();
    try {
      await assert.rejects(
        () =>
          runStop({
            readPidfile: async () => 12345,
            isProcessAlive: () => true,
            killSupervisor: () => {
              const err = new Error("EPERM: operation not permitted") as NodeJS.ErrnoException;
              err.code = "EPERM";
              throw err;
            },
          }),
        (e) => e instanceof CliExit && e.exitCode === 1,
      );
    } finally {
      cap.restore();
    }
    const out = cap.text();
    assert.match(out, /STOP_SIGNAL_FAILED/);
    assert.match(out, /EPERM/);
    assert.match(out, /kill 12345/);
  });
});

test("runStop: SIGTERM succeeds but supervisor doesn't exit within timeout → STOP_TIMEOUT with kill -9 hint", async () => {
  await withHome(async () => {
    const cap = captureOut();
    try {
      await assert.rejects(
        () =>
          runStop({
            readPidfile: async () => 12345,
            isProcessAlive: () => true, // never dies
            killSupervisor: () => {},
            sleep: async () => {},
            pollIntervalMs: 1,
            timeoutMs: 10,
          }),
        (e) => e instanceof CliExit && e.exitCode === 1,
      );
    } finally {
      cap.restore();
    }
    const out = cap.text();
    assert.match(out, /STOP_TIMEOUT/);
    assert.match(out, /pid 12345/);
    assert.match(out, /kill -9 12345/);
  });
});
