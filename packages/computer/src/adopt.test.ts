import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile, mkdir, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer, type Server } from "node:http";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";
import test from "node:test";

import {
  resolveLegacyKey,
  legacyLockOwnerPath,
  appendAdoptionLog,
  runAdoptLegacy,
  type CredentialBridgeMode,
} from "./adopt.js";
import { adoptionLogPath, userSessionPath } from "./paths.js";
import { CliExit } from "./output.js";

// task #39 PR-J1 regression guard — CLI-side adoption invariants
// (RFC v0.8 v8.2 §5.11 / §10.13).

async function withHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = await mkdtemp(join(tmpdir(), "slock-computer-adopt-"));
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

function captureErr(): { restore: () => void; text: () => string } {
  const oe = process.stderr.write.bind(process.stderr);
  const oo = process.stdout.write.bind(process.stdout);
  let buf = "";
  const sink = (c: unknown) => {
    buf += String(c);
    return true;
  };
  process.stdout.write = sink as typeof process.stdout.write;
  process.stderr.write = sink as typeof process.stderr.write;
  return {
    restore: () => {
      process.stdout.write = oo;
      process.stderr.write = oe;
    },
    text: () => buf,
  };
}

async function expectCliExit(fn: () => Promise<unknown>, expectedCode?: string) {
  const cap = captureErr();
  try {
    await fn();
    cap.restore();
    assert.fail("expected fail() to throw CliExit");
  } catch (err) {
    cap.restore();
    if (!(err instanceof CliExit)) throw err;
    if (expectedCode) {
      assert.match(cap.text(), new RegExp(`"code":"${expectedCode}"`));
    }
  }
}

// --- resolveLegacyKey ---

test("resolveLegacyKey: no source provided → LEGACY_KEY_REQUIRED", async () => {
  await expectCliExit(
    () => resolveLegacyKey({ serverSlug: "/x" }, {}),
    "LEGACY_KEY_REQUIRED",
  );
});

test("resolveLegacyKey: argv + env both set → LEGACY_KEY_MULTIPLE_SOURCES", async () => {
  await expectCliExit(
    () =>
      resolveLegacyKey(
        { serverSlug: "/x", legacyApiKey: `sk_machine_${"a".repeat(64)}` },
        { SLOCK_LEGACY_API_KEY: `sk_machine_${"b".repeat(64)}` },
      ),
    "LEGACY_KEY_MULTIPLE_SOURCES",
  );
});

test("resolveLegacyKey: argv key is accepted and prefix redacted", async () => {
  const key = `sk_machine_${"a".repeat(64)}`;
  const r = await resolveLegacyKey({ serverSlug: "/x", legacyApiKey: key }, {});
  assert.equal(r.mode, "legacy_key_argv" satisfies CredentialBridgeMode);
  assert.equal(r.rawKey, key);
  assert.equal(r.redactedPrefix, key.slice(0, 8));
});

test("resolveLegacyKey: env key is consumed and SLOCK_LEGACY_API_KEY is unset after read", async () => {
  const env: NodeJS.ProcessEnv = { SLOCK_LEGACY_API_KEY: `sk_machine_${"c".repeat(64)}` };
  const r = await resolveLegacyKey({ serverSlug: "/x" }, env);
  assert.equal(r.mode, "legacy_key_env");
  assert.equal(env.SLOCK_LEGACY_API_KEY, undefined);
});

test("resolveLegacyKey: file source reads key from path", async () => {
  await withHome(async (home) => {
    const path = join(home, "legacy.key");
    const key = `sk_daemon_${"d".repeat(64)}`;
    await writeFile(path, key + "\n", { mode: 0o600 });
    const r = await resolveLegacyKey(
      { serverSlug: "/x", legacyApiKeyFile: path },
      {},
    );
    assert.equal(r.mode, "legacy_key_file");
    assert.equal(r.rawKey, key);
  });
});

test("resolveLegacyKey: key without sk_machine_/sk_daemon_ prefix → LEGACY_KEY_INVALID", async () => {
  await expectCliExit(
    () =>
      resolveLegacyKey(
        { serverSlug: "/x", legacyApiKey: `sk_computer_${"e".repeat(64)}` },
        {},
      ),
    "LEGACY_KEY_INVALID",
  );
});

// --- legacyLockOwnerPath ---

test("legacyLockOwnerPath: derives path from SHA-256(rawKey)[0..15] fingerprint", async () => {
  const home = "/tmp/slock-test-home";
  const key = `sk_machine_${"f".repeat(64)}`;
  const path = legacyLockOwnerPath(home, key);
  const fp = createHash("sha256").update(key).digest("hex").slice(0, 16);
  assert.equal(path, `/tmp/slock-test-home/machines/machine-${fp}/daemon.lock/owner.json`);
});

// --- appendAdoptionLog (§5.11.4) ---

test("appendAdoptionLog: writes a line containing snake_case fields, no raw key", async () => {
  await withHome(async (home) => {
    const rawKey = `sk_machine_${"a".repeat(64)}`;
    await appendAdoptionLog(home, {
      mode: "legacy_key_argv",
      redactedPrefix: rawKey.slice(0, 8),
      startedAt: new Date("2026-05-22T00:00:00Z"),
      outcome: "succeeded",
      computerId: "cmp-1",
      machineId: "mch-1",
      serverId: "srv-1",
      legacyStop: { attempted: true, pid: 42, outcome: "stopped" },
    });
    const path = adoptionLogPath(home);
    const text = await readFile(path, "utf8");
    assert.match(text, /outcome=succeeded/);
    assert.match(text, /credential_bridge_mode=legacy_key_argv/);
    assert.match(text, /legacy_key_prefix=sk_machi/);
    assert.match(text, /computer_id=cmp-1/);
    assert.match(text, /legacy_machine_id=mch-1/);
    assert.match(text, /server_id=srv-1/);
    assert.match(text, /legacy_stop_outcome=stopped/);
    assert.match(text, /legacy_stop_pid=42/);
    // The raw key MUST NOT appear in the log — only the 8-char prefix.
    assert.equal(text.includes(rawKey), false);

    // File permissions tightened to 0600 (Unix only — macOS/linux CI).
    if (process.platform !== "win32") {
      const st = await stat(path);
      assert.equal(st.mode & 0o077, 0);
    }
  });
});

test("appendAdoptionLog: failure line includes failure_reason", async () => {
  await withHome(async (home) => {
    await appendAdoptionLog(home, {
      mode: "legacy_key_env",
      redactedPrefix: "sk_machi",
      startedAt: new Date("2026-05-22T00:00:00Z"),
      outcome: "failed",
      failureReason: "legacy_machine_key_migrated",
    });
    const text = await readFile(adoptionLogPath(home), "utf8");
    assert.match(text, /outcome=failed/);
    assert.match(text, /failure_reason=legacy_machine_key_migrated/);
  });
});

// --- runAdoptLegacy end-to-end against a fake HTTP server ---

async function startFakeAdoptServer(opts: {
  adoptStatus?: number;
  adoptBody?: Record<string, unknown>;
  preflightStatus?: number;
  preflightBody?: Record<string, unknown>;
  onAdopt?: (body: { legacyApiKey?: string; name?: string }) => void;
}): Promise<{ url: string; close: () => Promise<void>; calls: { adopt: number; preflight: number } }> {
  const calls = { adopt: 0, preflight: 0 };
  const server = await new Promise<Server>((resolve) => {
    const s = createServer((req, res) => {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        const url = req.url ?? "";
        const parsed = body ? (JSON.parse(body) as Record<string, unknown>) : {};
        if (url === "/api/computer/adopt-legacy") {
          calls.adopt++;
          opts.onAdopt?.(parsed as { legacyApiKey?: string; name?: string });
          res.statusCode = opts.adoptStatus ?? 201;
          res.setHeader("content-type", "application/json");
          res.end(
            JSON.stringify(
              opts.adoptBody ?? {
                apiKey: "sk_computer_" + "f".repeat(64),
                computerId: "cmp-1",
                machineId: "mch-1",
                serverId: "11111111-1111-1111-1111-111111111111",
                resumed: false,
              },
            ),
          );
          return;
        }
        if (url === "/internal/computer/preflight") {
          calls.preflight++;
          res.statusCode = opts.preflightStatus ?? 200;
          res.setHeader("content-type", "application/json");
          res.end(JSON.stringify(opts.preflightBody ?? { ok: true, serverSlug: "/legacy" }));
          return;
        }
        res.statusCode = 404;
        res.end();
      });
    });
    s.listen(0, "127.0.0.1", () => resolve(s));
  });
  const addr = server.address() as { port: number };
  return {
    url: `http://127.0.0.1:${addr.port}`,
    close: () => new Promise<void>((resolve, reject) => server.close((e) => (e ? reject(e) : resolve()))),
    calls,
  };
}

async function seedUserSession(home: string, serverUrl: string) {
  await mkdir(join(home, "computer"), { recursive: true });
  await writeFile(
    userSessionPath(home),
    JSON.stringify({
      kind: "user-session",
      userId: "u-1",
      accessToken: "test-access",
      serverUrl,
    }),
    { mode: 0o600 },
  );
}

test("runAdoptLegacy: happy path — writes attachment.json without raw legacy key, logs success", async () => {
  await withHome(async (home) => {
    const fake = await startFakeAdoptServer({});
    try {
      await seedUserSession(home, fake.url);
      const legacyKey = `sk_machine_${"a".repeat(64)}`;
      const cap = captureErr();
      try {
        await runAdoptLegacy({
          serverSlug: "/legacy",
          serverUrl: fake.url,
          legacyApiKey: legacyKey,
        });
      } catch (err) {
        if (!(err instanceof CliExit)) {
          cap.restore();
          throw err;
        }
        cap.restore();
        assert.fail("happy path must not exit: " + cap.text());
      }
      cap.restore();
      assert.equal(fake.calls.adopt, 1);
      assert.equal(fake.calls.preflight, 1);

      // attachment.json must NOT contain the raw legacy key — only the fresh sk_computer_*.
      const attachPath = join(
        home,
        "computer",
        "servers",
        "11111111-1111-1111-1111-111111111111",
        "attachment.json",
      );
      const attach = JSON.parse(await readFile(attachPath, "utf8")) as {
        apiKey: string;
        kind: string;
        adoptedFromLegacy?: boolean;
        legacyMachineId?: string;
      };
      assert.ok(attach.apiKey.startsWith("sk_computer_"));
      assert.equal(attach.kind, "computer-attachment");
      assert.equal(attach.adoptedFromLegacy, true);
      assert.equal(attach.legacyMachineId, "mch-1");
      assert.equal(JSON.stringify(attach).includes(legacyKey), false);
      if (process.platform !== "win32") {
        const st = await stat(attachPath);
        assert.equal(st.mode & 0o077, 0);
      }

      // adoption.log must NOT contain the raw legacy key — only the 8-char prefix.
      const logText = await readFile(adoptionLogPath(home), "utf8");
      assert.match(logText, /outcome=succeeded/);
      assert.match(logText, /credential_bridge_mode=legacy_key_argv/);
      assert.equal(logText.includes(legacyKey), false);
    } finally {
      await fake.close();
    }
  });
});

test("runAdoptLegacy: server returns legacy_machine_key_migrated → fail + log failure line, no attachment.json", async () => {
  await withHome(async (home) => {
    const fake = await startFakeAdoptServer({
      adoptStatus: 409,
      adoptBody: { code: "legacy_machine_key_migrated" },
    });
    try {
      await seedUserSession(home, fake.url);
      await expectCliExit(
        () =>
          runAdoptLegacy({
            serverSlug: "/legacy",
            serverUrl: fake.url,
            legacyApiKey: `sk_machine_${"b".repeat(64)}`,
          }),
        "LEGACY_MACHINE_KEY_MIGRATED",
      );
      assert.equal(fake.calls.preflight, 0);
      // No attachment.json should have been written.
      const stat1 = await stat(
        join(home, "computer", "servers", "11111111-1111-1111-1111-111111111111", "attachment.json"),
      ).catch(() => null);
      assert.equal(stat1, null);
      const logText = await readFile(adoptionLogPath(home), "utf8");
      assert.match(logText, /outcome=failed/);
      assert.match(logText, /failure_reason=legacy_machine_key_migrated/);
    } finally {
      await fake.close();
    }
  });
});

test("runAdoptLegacy: server returns legacy_key_invalid → closed-set failure, no http fallback", async () => {
  await withHome(async (home) => {
    const fake = await startFakeAdoptServer({
      adoptStatus: 401,
      adoptBody: { code: "legacy_key_invalid" },
    });
    try {
      await seedUserSession(home, fake.url);
      const legacyKey = `sk_machine_${"7".repeat(64)}`;
      const cap = captureErr();
      try {
        await runAdoptLegacy({
          serverSlug: "/legacy",
          serverUrl: fake.url,
          legacyApiKey: legacyKey,
        });
        cap.restore();
        assert.fail("expected LEGACY_KEY_INVALID");
      } catch (err) {
        cap.restore();
        if (!(err instanceof CliExit)) throw err;
        const text = cap.text();
        assert.match(text, /"code":"LEGACY_KEY_INVALID"/);
        assert.match(text, /Local legacy owner evidence/);
        assert.equal(text.includes("http_401"), false);
        assert.equal(text.includes(legacyKey), false);
      }
    } finally {
      await fake.close();
    }
  });
});

test("runAdoptLegacy: auth_required has login guidance and local owner evidence", async () => {
  await withHome(async (home) => {
    const fake = await startFakeAdoptServer({
      adoptStatus: 401,
      adoptBody: { code: "auth_required" },
    });
    try {
      await seedUserSession(home, fake.url);
      const legacyKey = `sk_machine_${"8".repeat(64)}`;
      await seedLegacyOwnerFile(
        home,
        legacyKey,
        JSON.stringify({
          pid: process.pid,
          startedAt: "2026-05-24T00:00:00.000Z",
          serverUrl: fake.url,
        }),
      );
      const cap = captureErr();
      try {
        await runAdoptLegacy({
          serverSlug: "/legacy",
          serverUrl: fake.url,
          legacyApiKey: legacyKey,
        });
        cap.restore();
        assert.fail("expected ADOPT_AUTH_REQUIRED");
      } catch (err) {
        cap.restore();
        if (!(err instanceof CliExit)) throw err;
        const text = cap.text();
        assert.match(text, /"code":"ADOPT_AUTH_REQUIRED"/);
        assert.match(text, /Re-run `slock-computer login`/);
        assert.match(text, /use the same `--server-url` if not on production/);
        assert.match(text, /SLOCK_HOME=/);
        assert.match(text, /owner=.*owner\.json/);
        assert.match(text, new RegExp(`pid=${process.pid}`));
        assert.match(text, /alive=true/);
        assert.equal(text.includes("http_401"), false);
        assert.equal(text.includes(legacyKey), false);
      }
    } finally {
      await fake.close();
    }
  });
});

test("runAdoptLegacy: legacy auth 401 without code stays fail-loud as unexpected response", async () => {
  await withHome(async (home) => {
    const fake = await startFakeAdoptServer({
      adoptStatus: 401,
      adoptBody: { error: "Invalid or expired token" },
    });
    try {
      await seedUserSession(home, fake.url);
      const legacyKey = `sk_machine_${"6".repeat(64)}`;
      const cap = captureErr();
      try {
        await runAdoptLegacy({
          serverSlug: "/legacy",
          serverUrl: fake.url,
          legacyApiKey: legacyKey,
        });
        cap.restore();
        assert.fail("expected ADOPT_UNEXPECTED_RESPONSE");
      } catch (err) {
        cap.restore();
        if (!(err instanceof CliExit)) throw err;
        const text = cap.text();
        assert.match(text, /"code":"ADOPT_UNEXPECTED_RESPONSE"/);
        assert.match(text, /status 401, missing error code/);
        assert.match(text, /re-run `slock-computer login` first/);
        assert.equal(text.includes("ADOPT_AUTH_REQUIRED"), false);
        assert.equal(text.includes("http_401"), false);
        assert.equal(text.includes(legacyKey), false);
      }
    } finally {
      await fake.close();
    }
  });
});

test("runAdoptLegacy: unexpected server adoption response includes local owner evidence", async () => {
  await withHome(async (home) => {
    const fake = await startFakeAdoptServer({
      adoptStatus: 401,
      adoptBody: {},
    });
    try {
      await seedUserSession(home, fake.url);
      const legacyKey = `sk_machine_${"9".repeat(64)}`;
      await seedLegacyOwnerFile(
        home,
        legacyKey,
        JSON.stringify({
          pid: process.pid,
          startedAt: "2026-05-24T00:00:00.000Z",
          serverUrl: fake.url,
        }),
      );
      const cap = captureErr();
      try {
        await runAdoptLegacy({
          serverSlug: "/legacy",
          serverUrl: fake.url,
          legacyApiKey: legacyKey,
        });
        cap.restore();
        assert.fail("expected ADOPT_UNEXPECTED_RESPONSE");
      } catch (err) {
        cap.restore();
        if (!(err instanceof CliExit)) throw err;
        const text = cap.text();
        assert.match(text, /"code":"ADOPT_UNEXPECTED_RESPONSE"/);
        assert.match(text, /status 401, missing error code/);
        assert.match(text, /re-run `slock-computer login` first/);
        assert.match(text, /SLOCK_HOME=/);
        assert.match(text, /owner=.*owner\.json/);
        assert.match(text, new RegExp(`pid=${process.pid}`));
        assert.match(text, /alive=true/);
        assert.match(text, /startedAt=2026-05-24T00:00:00\.000Z/);
        assert.equal(text.includes("http_401"), false);
        assert.equal(text.includes(legacyKey), false);
      }
    } finally {
      await fake.close();
    }
  });
});

// --- index.ts pre-parse stray-flag guard (CLI top-level) ---

const INDEX_TS = resolvePath(dirname(fileURLToPath(import.meta.url)), "index.ts");

function runCli(args: string[], env: NodeJS.ProcessEnv = {}): Promise<{
  code: number | null;
  stdout: string;
  stderr: string;
}> {
  return new Promise((resolve) => {
    const child = spawn(
      process.execPath,
      ["--import", "tsx", INDEX_TS, ...args],
      { env: { ...process.env, ...env, SLOCK_HOME: "/tmp/slock-stray-flag-test" } },
    );
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (c) => (stdout += String(c)));
    child.stderr?.on("data", (c) => (stderr += String(c)));
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("CLI: --legacy-api-key outside adopt-legacy → exit 2 with LEGACY_KEY_OUTSIDE_ADOPT", async () => {
  const r = await runCli(["status", "--legacy-api-key", "sk_machine_aaa"]);
  assert.equal(r.code, 2);
  assert.match(r.stderr, /LEGACY_KEY_OUTSIDE_ADOPT/);
});

test("CLI: --legacy-api-key-file outside adopt-legacy → exit 2 with LEGACY_KEY_OUTSIDE_ADOPT", async () => {
  const r = await runCli(["status", "--legacy-api-key-file", "/tmp/x"]);
  assert.equal(r.code, 2);
  assert.match(r.stderr, /LEGACY_KEY_OUTSIDE_ADOPT/);
});

test("CLI: --legacy-api-key-stdin outside adopt-legacy → exit 2 with LEGACY_KEY_OUTSIDE_ADOPT", async () => {
  const r = await runCli(["status", "--legacy-api-key-stdin"]);
  assert.equal(r.code, 2);
  assert.match(r.stderr, /LEGACY_KEY_OUTSIDE_ADOPT/);
});

test("CLI: SLOCK_LEGACY_API_KEY env outside adopt-legacy is ambient (silently ignored)", async () => {
  const r = await runCli(["--version"], { SLOCK_LEGACY_API_KEY: "sk_machine_aaa" });
  assert.equal(r.code, 0);
  assert.equal(r.stderr.includes("LEGACY_KEY_OUTSIDE_ADOPT"), false);
  assert.match(r.stdout, /\d+\.\d+\.\d+/);
});

async function seedLegacyOwnerFile(home: string, rawKey: string, contents: string): Promise<string> {
  const fp = createHash("sha256").update(rawKey).digest("hex").slice(0, 16);
  const dir = join(home, "machines", `machine-${fp}`, "daemon.lock");
  await mkdir(dir, { recursive: true });
  const path = join(dir, "owner.json");
  await writeFile(path, contents, { mode: 0o600 });
  return path;
}

test("runAdoptLegacy: legacy daemon stop returns error → fail closed, no attachment.json", async () => {
  await withHome(async (home) => {
    const fake = await startFakeAdoptServer({});
    try {
      await seedUserSession(home, fake.url);
      const legacyKey = `sk_machine_${"e".repeat(64)}`;
      // Unparseable owner.json → stopLegacyDaemonByOwnerFile returns
      // { outcome: "error", reason: "owner_json_unparseable" }.
      await seedLegacyOwnerFile(home, legacyKey, "{not valid json");

      await expectCliExit(
        () =>
          runAdoptLegacy({
            serverSlug: "/legacy",
            serverUrl: fake.url,
            legacyApiKey: legacyKey,
          }),
        "LEGACY_DAEMON_STOP_FAILED",
      );

      // attachment.json MUST NOT exist — single-owner invariant fail closed.
      const stat1 = await stat(
        join(home, "computer", "servers", "11111111-1111-1111-1111-111111111111", "attachment.json"),
      ).catch(() => null);
      assert.equal(stat1, null);

      const logText = await readFile(adoptionLogPath(home), "utf8");
      assert.match(logText, /outcome=failed/);
      assert.match(logText, /failure_reason=legacy_stop_error/);
      assert.match(logText, /legacy_stop_outcome=error/);
      assert.match(logText, /legacy_stop_reason=owner_json_unparseable/);
    } finally {
      await fake.close();
    }
  });
});

test("runAdoptLegacy: legacy daemon stop denied (pid=1, non-root) → fail closed, no attachment.json", async (t) => {
  if (process.platform === "win32") {
    t.skip("POSIX pid=1 EPERM behavior; skipping on win32");
    return;
  }
  if (process.getuid && process.getuid() === 0) {
    t.skip("running as root — pid=1 would actually receive SIGTERM");
    return;
  }
  await withHome(async (home) => {
    const fake = await startFakeAdoptServer({});
    try {
      await seedUserSession(home, fake.url);
      const legacyKey = `sk_machine_${"d".repeat(64)}`;
      // pid=1 (init) is alive but SIGTERM raises EPERM for non-root → denied.
      await seedLegacyOwnerFile(home, legacyKey, JSON.stringify({ pid: 1 }));

      await expectCliExit(
        () =>
          runAdoptLegacy({
            serverSlug: "/legacy",
            serverUrl: fake.url,
            legacyApiKey: legacyKey,
          }),
        "LEGACY_DAEMON_STOP_FAILED",
      );

      const stat1 = await stat(
        join(home, "computer", "servers", "11111111-1111-1111-1111-111111111111", "attachment.json"),
      ).catch(() => null);
      assert.equal(stat1, null);

      const logText = await readFile(adoptionLogPath(home), "utf8");
      assert.match(logText, /outcome=failed/);
      assert.match(logText, /failure_reason=legacy_stop_denied/);
      assert.match(logText, /legacy_stop_outcome=denied/);
      assert.match(logText, /legacy_stop_pid=1/);
    } finally {
      await fake.close();
    }
  });
});

test("runAdoptLegacy: malformed owner.json (missing pid) → fail closed", async () => {
  await withHome(async (home) => {
    const fake = await startFakeAdoptServer({});
    try {
      await seedUserSession(home, fake.url);
      const legacyKey = `sk_machine_${"f".repeat(64)}`;
      await seedLegacyOwnerFile(home, legacyKey, JSON.stringify({ host: "x" }));

      await expectCliExit(
        () =>
          runAdoptLegacy({
            serverSlug: "/legacy",
            serverUrl: fake.url,
            legacyApiKey: legacyKey,
          }),
        "LEGACY_DAEMON_STOP_FAILED",
      );

      const logText = await readFile(adoptionLogPath(home), "utf8");
      assert.match(logText, /failure_reason=legacy_stop_error/);
      assert.match(logText, /legacy_stop_reason=owner_json_missing_pid/);
    } finally {
      await fake.close();
    }
  });
});

test("runAdoptLegacy: sk_daemon_* legacy key is accepted (server-side prefix parity)", async () => {
  await withHome(async (home) => {
    let received: { legacyApiKey?: string } = {};
    const fake = await startFakeAdoptServer({
      onAdopt: (body) => {
        received = body;
      },
    });
    try {
      await seedUserSession(home, fake.url);
      const legacyKey = `sk_daemon_${"a".repeat(64)}`;
      const cap = captureErr();
      try {
        await runAdoptLegacy({
          serverSlug: "/legacy",
          serverUrl: fake.url,
          legacyApiKey: legacyKey,
        });
      } catch (err) {
        cap.restore();
        if (!(err instanceof CliExit)) throw err;
        assert.fail("sk_daemon_* happy path must not exit: " + cap.text());
      }
      cap.restore();
      assert.equal(received.legacyApiKey, legacyKey);
    } finally {
      await fake.close();
    }
  });
});

test("runAdoptLegacy: preflight failure → log preflight_<code> + abort before attachment.json", async () => {
  await withHome(async (home) => {
    const fake = await startFakeAdoptServer({
      preflightStatus: 500,
      preflightBody: { ok: false, code: "internal" },
    });
    try {
      await seedUserSession(home, fake.url);
      await expectCliExit(
        () =>
          runAdoptLegacy({
            serverSlug: "/legacy",
            serverUrl: fake.url,
            legacyApiKey: `sk_machine_${"c".repeat(64)}`,
          }),
        "PREFLIGHT_FAILED",
      );
      const stat1 = await stat(
        join(home, "computer", "servers", "11111111-1111-1111-1111-111111111111", "attachment.json"),
      ).catch(() => null);
      assert.equal(stat1, null);
      const logText = await readFile(adoptionLogPath(home), "utf8");
      assert.match(logText, /outcome=failed/);
      assert.match(logText, /failure_reason=preflight_internal/);
    } finally {
      await fake.close();
    }
  });
});
