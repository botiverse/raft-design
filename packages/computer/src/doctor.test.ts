import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { redactSecrets, runDoctorChecks, runDoctor } from "./doctor.js";
import { serverAttachmentPath, userSessionPath } from "./paths.js";

// task #30 PR-G regression guard — per-server `doctor` (v4 §7).
// Decisive: the SECRET REDLINE — inject sk_computer_* + JWT into the
// per-server state files and prove they never appear in the output.

const SECRET_KEY = "sk_computer_DOCTOR-MUST-NOT-PRINT-abcdef0123456789";
const SECRET_JWT = "eyJhbGciOiJIUzI1NiJ9.PAYLOADpayloadPAYLOADpayload.sigsigsig";
const SERVER_A = "11111111-1111-4111-8111-111111111111";

async function withHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = await mkdtemp(join(tmpdir(), "slock-computer-doctor-"));
  const old = process.env.SLOCK_HOME;
  const oldExit = process.exitCode;
  process.env.SLOCK_HOME = home;
  try {
    return await fn(home);
  } finally {
    if (old === undefined) delete process.env.SLOCK_HOME;
    else process.env.SLOCK_HOME = old;
    process.exitCode = oldExit;
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

async function writeUserSession(home: string, token: string): Promise<void> {
  const p = userSessionPath(home);
  await mkdir(join(p, ".."), { recursive: true });
  await writeFile(p, JSON.stringify({
    kind: "user-session", userId: "u-1", accessToken: token, serverUrl: "http://127.0.0.1:1",
  }));
}

async function writeAttach(home: string, serverId: string, apiKey: string): Promise<void> {
  const p = serverAttachmentPath(home, serverId);
  await mkdir(join(p, ".."), { recursive: true });
  await writeFile(p, JSON.stringify({
    kind: "computer-attachment", serverId, serverMachineId: `cm-${serverId}`, apiKey,
    serverUrl: "http://127.0.0.1:1",
  }));
}

test("redactSecrets: masks sk_* / JWT / long hex", () => {
  assert.equal(redactSecrets(`key=${SECRET_KEY} done`), "key=***REDACTED*** done");
  assert.equal(redactSecrets(`tok ${SECRET_JWT}`), "tok ***REDACTED***");
  assert.equal(redactSecrets("nothing secret here"), "nothing secret here");
});

test("doctor: fresh home → login + attachments checks fail (actionable)", async () => {
  await withHome(async () => {
    const checks = await runDoctorChecks();
    const byName = Object.fromEntries(checks.map((c) => [c.name, c]));
    assert.equal(byName["user session"].ok, false);
    assert.match(byName["user session"].detail, /slock-computer login/);
    assert.equal(byName["attachments"].ok, false);
    assert.match(byName["attachments"].detail, /slock-computer attach/);
  });
});

test("doctor: corrupted user-session.json fails fast with login guidance", async () => {
  await withHome(async (home) => {
    const p = userSessionPath(home);
    await mkdir(join(p, ".."), { recursive: true });
    await writeFile(p, '{"kind":"user-session","userId":"abc","acce');

    const checks = await runDoctorChecks();
    const userSession = checks.find((c) => c.name === "user session");
    assert.ok(userSession);
    assert.equal(userSession.ok, false);
    assert.match(userSession.detail, /invalid user session file/);
    assert.match(userSession.detail, /slock-computer login/);

    const cap = captureOut();
    try {
      await runDoctor({});
      const out = cap.text();
      cap.restore();
      assert.match(out, /invalid user session file/);
      assert.match(out, /slock-computer login/);
      assert.ok(!out.includes("abc"), "doctor must not echo corrupted session content");
    } finally {
      cap.restore();
    }
  });
});

test("doctor: SECRET REDLINE — injected per-server key + user token never appear in output", async () => {
  await withHome(async (home) => {
    await writeUserSession(home, SECRET_JWT);
    await writeAttach(home, SERVER_A, SECRET_KEY);
    const cap = captureOut();
    try {
      await runDoctor({});
      const out = cap.text();
      cap.restore();
      assert.ok(!out.includes(SECRET_KEY), "leaked sk_computer_*");
      assert.ok(!out.includes(SECRET_JWT), "leaked user token");
    } finally {
      cap.restore();
    }
  });
});

test("doctor: --json mode also redacted", async () => {
  await withHome(async (home) => {
    await writeAttach(home, SERVER_A, SECRET_KEY);
    const cap = captureOut();
    try {
      await runDoctor({ json: true });
      const out = cap.text();
      cap.restore();
      assert.ok(!out.includes(SECRET_KEY), "--json leaked the key");
    } finally {
      cap.restore();
    }
  });
});

// PR-H integration tests — doctor --cleanup / --reset-health.

test("doctor --cleanup: residue cleaned + per-category structured output", async () => {
  await withHome(async (home) => {
    // Set up two residue categories: stale pidfile + tmp file (>24h)
    await mkdir(join(home, "computer"), { recursive: true });
    await writeFile(join(home, "computer", "supervisor.pid"), "999999999"); // dead pid
    const snap = join(home, "computer", "upgrade-snapshot.json");
    await writeFile(snap, "{}");
    const { utimes } = await import("node:fs/promises");
    await utimes(snap, new Date(Date.now() - 25 * 60 * 60 * 1000), new Date(Date.now() - 25 * 60 * 60 * 1000));

    const cap = captureOut();
    try {
      await runDoctor({ cleanup: true });
      const out = cap.text();
      cap.restore();
      assert.match(out, /Cleanup pass:/);
      assert.match(out, /Stale pidfiles cleared/);
      assert.match(out, /Tmp files cleared/);
    } finally {
      cap.restore();
    }
  });
});

test("doctor --fix: alias for --cleanup (same behavior)", async () => {
  await withHome(async (home) => {
    await mkdir(join(home, "computer"), { recursive: true });
    await writeFile(join(home, "computer", "supervisor.pid"), "999999998"); // dead pid
    const cap = captureOut();
    try {
      await runDoctor({ fix: true });
      const out = cap.text();
      cap.restore();
      assert.match(out, /Cleanup pass:/);
      assert.match(out, /Stale pidfiles cleared/);
    } finally {
      cap.restore();
    }
  });
});

test("doctor --json --cleanup: cleanup key embedded in JSON output", async () => {
  await withHome(async (home) => {
    await mkdir(join(home, "computer"), { recursive: true });
    await writeFile(join(home, "computer", "supervisor.pid"), "999999997");
    const cap = captureOut();
    try {
      await runDoctor({ json: true, cleanup: true });
      const out = cap.text();
      cap.restore();
      const parsed = JSON.parse(out) as { cleanup?: { anyAction: boolean } };
      assert.ok(parsed.cleanup, "JSON output must include cleanup key when --cleanup set");
      assert.equal(parsed.cleanup.anyAction, true);
    } finally {
      cap.restore();
    }
  });
});

test("doctor: clean baseline + --cleanup → 'No residue found' line", async () => {
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await runDoctor({ cleanup: true });
      const out = cap.text();
      cap.restore();
      assert.match(out, /No residue found/);
    } finally {
      cap.restore();
    }
  });
});

test("doctor <serverId> --reset-health: clears recorded crashes", async () => {
  await withHome(async (home) => {
    const { recordCrash, isDegraded, DEGRADED_THRESHOLD } = await import("./health.js");
    await mkdir(join(home, "computer", "servers", SERVER_A), { recursive: true });
    const now = Date.now();
    for (let i = 0; i < DEGRADED_THRESHOLD; i++) {
      await recordCrash(home, SERVER_A, 1, null, now);
    }
    assert.equal(await isDegraded(home, SERVER_A, now + 1000), true);
    const cap = captureOut();
    try {
      await runDoctor({ serverId: SERVER_A, resetHealth: true });
      const out = cap.text();
      cap.restore();
      assert.match(out, /Reset health state for server/);
    } finally {
      cap.restore();
    }
    assert.equal(await isDegraded(home, SERVER_A, now + 1000), false);
  });
});
