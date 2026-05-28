import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import { CliExit } from "./output.js";
import { serverAttachmentPath, userSessionPath } from "./paths.js";
import { runSetup } from "./setup.js";

const SERVER_A = "11111111-1111-4111-8111-111111111111";
const SLUG_A = "alpha";

async function withHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = await mkdtemp(join(tmpdir(), "slock-computer-setup-"));
  const old = process.env.SLOCK_HOME;
  const oldLegacy = process.env.SLOCK_LEGACY_API_KEY;
  process.env.SLOCK_HOME = home;
  delete process.env.SLOCK_LEGACY_API_KEY;
  try {
    return await fn(home);
  } finally {
    if (old === undefined) delete process.env.SLOCK_HOME;
    else process.env.SLOCK_HOME = old;
    if (oldLegacy === undefined) delete process.env.SLOCK_LEGACY_API_KEY;
    else process.env.SLOCK_LEGACY_API_KEY = oldLegacy;
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

async function writeSession(home: string, serverUrl = "https://api.example.test"): Promise<void> {
  const file = userSessionPath(home);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(
    file,
    JSON.stringify({ kind: "user-session", userId: "u-1", accessToken: "tok", serverUrl }),
    { mode: 0o600 },
  );
}

function unsignedJwt(payload: Record<string, unknown>): string {
  return [
    Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url"),
    Buffer.from(JSON.stringify(payload)).toString("base64url"),
    "sig",
  ].join(".");
}

async function writeExpiredSession(home: string, serverUrl = "https://api.example.test"): Promise<void> {
  const file = userSessionPath(home);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(
    file,
    JSON.stringify({
      kind: "user-session",
      userId: "u-1",
      accessToken: unsignedJwt({ sub: "u-1", type: "access", exp: 1 }),
      refreshToken: "refresh-token",
      serverUrl,
    }),
    { mode: 0o600 },
  );
}

async function writeExpiringSoonSession(home: string, serverUrl = "https://api.example.test"): Promise<void> {
  const file = userSessionPath(home);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(
    file,
    JSON.stringify({
      kind: "user-session",
      userId: "u-1",
      accessToken: unsignedJwt({
        sub: "u-1",
        type: "access",
        exp: Math.floor((Date.now() + 5_000) / 1000),
      }),
      refreshToken: "refresh-token",
      serverUrl,
    }),
    { mode: 0o600 },
  );
}

async function writeExpiredSessionWithoutRefresh(home: string, serverUrl = "https://api.example.test"): Promise<void> {
  const file = userSessionPath(home);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(
    file,
    JSON.stringify({
      kind: "user-session",
      userId: "u-1",
      accessToken: unsignedJwt({ sub: "u-1", type: "access", exp: 1 }),
      serverUrl,
    }),
    { mode: 0o600 },
  );
}

async function writeAttach(home: string, serverId = SERVER_A, serverSlug = SLUG_A): Promise<void> {
  const file = serverAttachmentPath(home, serverId);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(
    file,
    JSON.stringify({
      kind: "computer-attachment",
      serverId,
      serverSlug,
      serverMachineId: `cm-${serverId}`,
      apiKey: `sk_computer_${serverId}`,
      serverUrl: "https://api.example.test",
    }),
    { mode: 0o600 },
  );
}

async function writeLiveLegacyOwner(home: string): Promise<void> {
  const dir = join(home, "machines", "machine-test", "daemon.lock");
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "owner.json"), JSON.stringify({ pid: process.pid }), "utf8");
}

test("setup: existing login + attachment skips login/attach/adopt and starts target server", async () => {
  await withHome(async (home) => {
    await writeSession(home);
    await writeAttach(home);
    const calls: string[] = [];
    const cap = captureOut();
    try {
      await runSetup(
        { serverSlug: "/alpha", yes: true },
        {
          isTty: false,
          runLogin: async () => { calls.push("login"); },
          runAttach: async () => { calls.push("attach"); },
          runAdoptLegacy: async () => { calls.push("adopt"); },
          runStart: async (opts) => { calls.push(`start:${opts?.serverId}`); },
        },
      );
    } finally {
      cap.restore();
    }
    assert.deepEqual(calls, [`start:${SERVER_A}`]);
    assert.match(cap.text(), /already logged in/);
    assert.match(cap.text(), /already attached/);
  });
});

test("setup: no login in TTY runs login, then attach, then start", async () => {
  await withHome(async (home) => {
    const calls: string[] = [];
    await runSetup(
      { serverSlug: "/alpha" },
      {
        isTty: true,
        hasLiveLegacyDaemon: async () => false,
        runLogin: async () => {
          calls.push("login");
          await writeSession(home);
        },
        runAttach: async () => {
          calls.push("attach");
          await writeAttach(home);
        },
        runStart: async (opts) => { calls.push(`start:${opts?.serverId}`); },
      },
    );
    assert.deepEqual(calls, ["login", "attach", `start:${SERVER_A}`]);
  });
});

test("setup: expired user session refreshes before adopt without browser login", async () => {
  await withHome(async (home) => {
    await writeExpiredSession(home);
    const calls: string[] = [];
    const cap = captureOut();
    try {
      await runSetup(
        { serverSlug: "/alpha", adoptLegacy: true, legacyApiKey: `sk_machine_${"a".repeat(64)}` },
        {
          isTty: true,
          hasLiveLegacyDaemon: async () => true,
          refreshUserSession: async () => {
            calls.push("refresh");
            await writeSession(home);
            return true;
          },
          runLogin: async () => {
            calls.push("login");
            await writeSession(home);
          },
          runAdoptLegacy: async () => {
            calls.push("adopt");
            await writeAttach(home);
          },
          runStart: async (opts) => { calls.push(`start:${opts?.serverId}`); },
        },
      );
    } finally {
      cap.restore();
    }
    assert.deepEqual(calls, ["refresh", "adopt", `start:${SERVER_A}`]);
    assert.match(cap.text(), /User session: refreshed/);
  });
});

test("setup: nearly expired user session refreshes before attach/adopt", async () => {
  await withHome(async (home) => {
    await writeExpiringSoonSession(home);
    const calls: string[] = [];
    const cap = captureOut();
    try {
      await runSetup(
        { serverSlug: "/alpha", adoptLegacy: true, legacyApiKey: `sk_machine_${"a".repeat(64)}` },
        {
          isTty: true,
          hasLiveLegacyDaemon: async () => true,
          refreshUserSession: async () => {
            calls.push("refresh");
            await writeSession(home);
            return true;
          },
          runLogin: async () => {
            calls.push("login");
            await writeSession(home);
          },
          runAdoptLegacy: async () => {
            calls.push("adopt");
            await writeAttach(home);
          },
          runStart: async (opts) => { calls.push(`start:${opts?.serverId}`); },
        },
      );
    } finally {
      cap.restore();
    }
    assert.deepEqual(calls, ["refresh", "adopt", `start:${SERVER_A}`]);
    assert.match(cap.text(), /User session: refreshed/);
  });
});

test("setup: expired user session with no refresh path in TTY re-runs login before adopt", async () => {
  await withHome(async (home) => {
    await writeExpiredSessionWithoutRefresh(home);
    const calls: string[] = [];
    const cap = captureOut();
    try {
      await runSetup(
        { serverSlug: "/alpha", adoptLegacy: true, legacyApiKey: `sk_machine_${"a".repeat(64)}` },
        {
          isTty: true,
          hasLiveLegacyDaemon: async () => true,
          refreshUserSession: async () => false,
          runLogin: async () => {
            calls.push("login");
            await writeSession(home);
          },
          runAdoptLegacy: async () => {
            calls.push("adopt");
            await writeAttach(home);
          },
          runStart: async (opts) => { calls.push(`start:${opts?.serverId}`); },
        },
      );
    } finally {
      cap.restore();
    }
    assert.deepEqual(calls, ["login", "adopt", `start:${SERVER_A}`]);
    assert.match(cap.text(), /missing or expired; starting login/);
  });
});

test("setup: non-TTY without explicit --yes fails closed", async () => {
  await withHome(async () => {
    const cap = captureOut();
    try {
      await assert.rejects(
        () => runSetup({ serverSlug: "/alpha" }, { isTty: false }),
        (e) => e instanceof CliExit,
      );
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /NON_INTERACTIVE_SETUP_REQUIRES_FLAGS/);
  });
});

test("setup: live legacy daemon without --adopt-legacy fails before fresh attach", async () => {
  await withHome(async (home) => {
    await writeSession(home);
    await writeLiveLegacyOwner(home);
    const calls: string[] = [];
    const cap = captureOut();
    try {
      await assert.rejects(
        () =>
          runSetup(
            { serverSlug: "/alpha" },
            {
              isTty: true,
              runAttach: async () => { calls.push("attach"); },
            },
          ),
        (e) => e instanceof CliExit,
      );
    } finally {
      cap.restore();
    }
    assert.deepEqual(calls, []);
    assert.match(cap.text(), /LEGACY_DAEMON_RUNNING/);
  });
});

test("setup: --adopt-legacy with key calls adoption primitive and starts", async () => {
  await withHome(async (home) => {
    await writeSession(home);
    const calls: string[] = [];
    await runSetup(
      { serverSlug: "/alpha", adoptLegacy: true, legacyApiKey: `sk_machine_${"a".repeat(64)}` },
      {
        isTty: true,
        hasLiveLegacyDaemon: async () => true,
        runAdoptLegacy: async () => {
          calls.push("adopt");
          await writeAttach(home);
        },
        runAttach: async () => { calls.push("attach"); },
        runStart: async (opts) => { calls.push(`start:${opts?.serverId}`); },
      },
    );
    assert.deepEqual(calls, ["adopt", `start:${SERVER_A}`]);
  });
});

test("setup: --adopt-legacy without key and without live legacy daemon falls back to fresh attach", async () => {
  await withHome(async (home) => {
    await writeSession(home);
    const calls: string[] = [];
    const cap = captureOut();
    try {
      await runSetup(
        { serverSlug: "/alpha", adoptLegacy: true },
        {
          isTty: true,
          hasLiveLegacyDaemon: async () => false,
          runAttach: async () => {
            calls.push("attach");
            await writeAttach(home);
          },
          runAdoptLegacy: async () => { calls.push("adopt"); },
          runStart: async (opts) => { calls.push(`start:${opts?.serverId}`); },
        },
      );
    } finally {
      cap.restore();
    }
    assert.deepEqual(calls, ["attach", `start:${SERVER_A}`]);
    assert.match(cap.text(), /falling back to fresh device-login attach/);
  });
});

test("setup: legacy key flag without --adopt-legacy fails stable LEGACY_KEY_OUTSIDE_ADOPT", async () => {
  await withHome(async (home) => {
    await writeSession(home);
    const cap = captureOut();
    try {
      await assert.rejects(
        () => runSetup({ serverSlug: "/alpha", legacyApiKey: `sk_machine_${"a".repeat(64)}` }, { isTty: true }),
        (e) => e instanceof CliExit,
      );
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /LEGACY_KEY_OUTSIDE_ADOPT/);
  });
});

test("setup: --no-start stops after creating attachment", async () => {
  await withHome(async (home) => {
    await writeSession(home);
    const calls: string[] = [];
    await runSetup(
      { serverSlug: "/alpha", start: false },
      {
        isTty: true,
        hasLiveLegacyDaemon: async () => false,
        runAttach: async () => {
          calls.push("attach");
          await writeAttach(home);
        },
        runStart: async () => { calls.push("start"); },
      },
    );
    assert.deepEqual(calls, ["attach"]);
    const raw = await readFile(serverAttachmentPath(home, SERVER_A), "utf8");
    assert.match(raw, /computer-attachment/);
  });
});

test("setup: forwards orchestrated:true to login/attach/adopt to suppress Next hints", async () => {
  await withHome(async (home) => {
    const seen: { login?: boolean; attach?: boolean; adopt?: boolean } = {};
    await runSetup(
      { serverSlug: "/alpha", adoptLegacy: true, legacyApiKey: `sk_machine_${"a".repeat(64)}` },
      {
        isTty: true,
        hasLiveLegacyDaemon: async () => true,
        runLogin: async (opts) => {
          seen.login = opts.orchestrated;
          await writeSession(home);
        },
        runAttach: async (opts) => {
          seen.attach = opts.orchestrated;
          await writeAttach(home);
        },
        runAdoptLegacy: async (opts) => {
          seen.adopt = opts.orchestrated;
          await writeAttach(home);
        },
        runStart: async () => { /* no-op */ },
      },
    );
    assert.equal(seen.adopt, true, "setup must forward orchestrated:true to adopt");
  });
});

test("setup: orchestrated success output does not contain 'Next: run `slock-computer attach`' or 'Next: run `slock-computer start`'", async () => {
  await withHome(async (home) => {
    await writeSession(home);
    const cap = captureOut();
    try {
      await runSetup(
        { serverSlug: "/alpha", yes: true },
        {
          isTty: false,
          hasLiveLegacyDaemon: async () => false,
          runAttach: async () => { await writeAttach(home); },
          runStart: async () => { /* no-op */ },
        },
      );
    } finally {
      cap.restore();
    }
    const text = cap.text();
    assert.doesNotMatch(text, /Next: run `slock-computer attach/);
    assert.doesNotMatch(text, /Next: run `slock-computer start/);
  });
});

test("setup: --no-start retains explicit Start: skipped hint (not regressed by orchestrated suppression)", async () => {
  await withHome(async (home) => {
    await writeSession(home);
    const cap = captureOut();
    try {
      await runSetup(
        { serverSlug: "/alpha", start: false },
        {
          isTty: true,
          hasLiveLegacyDaemon: async () => false,
          runAttach: async () => { await writeAttach(home); },
          runStart: async () => { /* no-op */ },
        },
      );
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /Start: skipped \(--no-start\)/);
  });
});
