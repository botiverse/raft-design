import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { buildStatusReport, runStatus } from "./status.js";

// task #30 PR-G regression guard — Computer-level aggregate `status`.
// Pins: fresh state, per-server aggregation, daemon liveness from
// per-server pidfile, supervisor liveness, and the SECRET REDLINE
// (the report must never carry user access token or any sk_computer_*).

const SERVER_A = "11111111-1111-4111-8111-111111111111";
const SERVER_B = "22222222-2222-4222-8222-222222222222";
const SECRET_TOKEN = "user-access-token-DO-NOT-LEAK-abc123";
const SECRET_KEY_A = "sk_computer_AAA-DO-NOT-LEAK-aaaaaaaaaaaa";
const SECRET_KEY_B = "sk_computer_BBB-DO-NOT-LEAK-bbbbbbbbbbbb";

async function withHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = await mkdtemp(join(tmpdir(), "slock-computer-status-"));
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

async function writeUnder(home: string, rel: string, body: string): Promise<void> {
  const p = join(home, "computer", rel);
  await mkdir(join(p, ".."), { recursive: true });
  await writeFile(p, body);
}

async function writeAttach(home: string, serverId: string, apiKey: string, url = "https://api.example.test"): Promise<void> {
  await writeUnder(
    home,
    `servers/${serverId}/attachment.json`,
    JSON.stringify({
      kind: "computer-attachment",
      serverId,
      serverMachineId: `cm-${serverId}`,
      apiKey,
      serverUrl: url,
      attachedAt: "2026-05-20T00:00:00.000Z",
    }),
  );
}

test("status: fresh home → not logged in, supervisor stopped, no attachments", async () => {
  await withHome(async (home) => {
    const r = await buildStatusReport();
    assert.equal(r.slockHome, home);
    assert.equal(r.loggedIn, false);
    assert.equal(r.userId, null);
    assert.equal(r.supervisor.running, false);
    assert.equal(r.supervisor.logPath, join(home, "computer", "supervisor.log"));
    assert.deepEqual(r.servers, []);
  });
});

test("status: user session present → loggedIn; tokens NEVER carried in report", async () => {
  await withHome(async (home) => {
    await writeUnder(home, "user-session.json", JSON.stringify({
      kind: "user-session",
      userId: "user-42",
      accessToken: SECRET_TOKEN,
      refreshToken: "refresh-secret",
      serverUrl: "https://api.example.test",
    }));
    const r = await buildStatusReport();
    assert.equal(r.loggedIn, true);
    assert.equal(r.userId, "user-42");
    assert.equal(r.loginServerUrl, "https://api.example.test");
    const blob = JSON.stringify(r);
    assert.ok(!blob.includes(SECRET_TOKEN), "leaked accessToken");
    assert.ok(!blob.includes("refresh-secret"), "leaked refreshToken");
  });
});

test("status: corrupted user-session.json is explicit and secret-free", async () => {
  await withHome(async (home) => {
    await writeUnder(home, "user-session.json", '{"kind":"user-session","userId":"abc","acce');
    const r = await buildStatusReport();
    assert.equal(r.loggedIn, false);
    assert.equal(r.userId, null);
    assert.equal(r.loginServerUrl, null);
    assert.match(r.userSessionError ?? "", /JSON/);

    const lines: string[] = [];
    const oldWrite = process.stdout.write;
    process.stdout.write = ((chunk: string | Uint8Array) => {
      lines.push(String(chunk));
      return true;
    }) as typeof process.stdout.write;
    try {
      await runStatus({});
    } finally {
      process.stdout.write = oldWrite;
    }
    const out = lines.join("");
    assert.match(out, /user session file is invalid/);
    assert.match(out, /slock-computer login/);
    assert.ok(!out.includes("abc"), "human output should not echo corrupted session content");
  });
});

test("status: multiple attachments → servers[] aggregates; sk_computer_* NEVER in report", async () => {
  await withHome(async (home) => {
    await writeAttach(home, SERVER_A, SECRET_KEY_A);
    await writeAttach(home, SERVER_B, SECRET_KEY_B);
    const r = await buildStatusReport();
    assert.equal(r.servers.length, 2);
    const ids = r.servers.map((s) => s.serverId).sort();
    assert.deepEqual(ids, [SERVER_A, SERVER_B]);
    for (const s of r.servers) {
      assert.equal(s.daemon.running, false);
      assert.equal(s.daemonLogPath, join(home, "computer", "servers", s.serverId, "daemon.log"));
    }
    const blob = JSON.stringify(r);
    assert.ok(!blob.includes(SECRET_KEY_A), "leaked sk_computer_* (A)");
    assert.ok(!blob.includes(SECRET_KEY_B), "leaked sk_computer_* (B)");
  });
});

test("status: JSON report includes derived log paths", async () => {
  await withHome(async (home) => {
    await writeAttach(home, SERVER_A, SECRET_KEY_A);
    const r = JSON.parse(JSON.stringify(await buildStatusReport()));
    assert.equal(r.supervisor.logPath, join(home, "computer", "supervisor.log"));
    assert.equal(
      r.servers[0].daemonLogPath,
      join(home, "computer", "servers", SERVER_A, "daemon.log"),
    );
  });
});

test("status: human output prints supervisor and per-server daemon log paths", async () => {
  await withHome(async (home) => {
    await writeUnder(home, "user-session.json", JSON.stringify({
      kind: "user-session",
      userId: "user-42",
      accessToken: SECRET_TOKEN,
      refreshToken: "refresh-secret",
      serverUrl: "https://api.example.test",
    }));
    await writeUnder(
      home,
      `servers/${SERVER_A}/attachment.json`,
      JSON.stringify({
        kind: "computer-attachment",
        serverId: SERVER_A,
        serverSlug: "alpha",
        serverMachineId: `cm-${SERVER_A}`,
        apiKey: SECRET_KEY_A,
        serverUrl: "https://api.example.test",
        attachedAt: "2026-05-20T00:00:00.000Z",
      }),
    );

    const lines: string[] = [];
    const oldWrite = process.stdout.write;
    process.stdout.write = ((chunk: string | Uint8Array) => {
      lines.push(String(chunk));
      return true;
    }) as typeof process.stdout.write;
    try {
      await runStatus({});
    } finally {
      process.stdout.write = oldWrite;
    }

    const out = lines.join("");
    assert.match(out, new RegExp(`Supervisor log: ${join(home, "computer", "supervisor\\.log")}`));
    assert.match(out, /\/alpha\s+offline\s+stopped/);
    assert.match(
      out,
      new RegExp(`Daemon log: ${join(home, "computer", "servers", SERVER_A, "daemon\\.log")}`),
    );
    assert.ok(!out.includes(SECRET_TOKEN), "human output leaked accessToken");
    assert.ok(!out.includes(SECRET_KEY_A), "human output leaked sk_computer_*");
  });
});

test("status: live pidfiles → supervisor + per-server daemon report running", async () => {
  await withHome(async (home) => {
    await writeAttach(home, SERVER_A, SECRET_KEY_A);
    await writeUnder(home, "supervisor.pid", String(process.pid));
    await writeUnder(home, `servers/${SERVER_A}/daemon.pid`, String(process.pid));
    const r = await buildStatusReport();
    assert.equal(r.supervisor.running, true);
    assert.equal(r.supervisor.running === true && r.supervisor.pid, process.pid);
    const sa = r.servers.find((s) => s.serverId === SERVER_A);
    assert.ok(sa);
    assert.equal(sa?.daemon.running, true);
  });
});

test("status: malformed attachment.json → that server is skipped; others OK", async () => {
  await withHome(async (home) => {
    await writeAttach(home, SERVER_A, SECRET_KEY_A);
    await writeUnder(home, `servers/${SERVER_B}/attachment.json`, "{ not json");
    const r = await buildStatusReport();
    assert.deepEqual(r.servers.map((s) => s.serverId), [SERVER_A]);
  });
});
