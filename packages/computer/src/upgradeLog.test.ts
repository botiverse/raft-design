import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile, chmod } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import { formatUpgradeLogTimestamp, upgradeLogPath } from "./paths.js";
import {
  appendUpgradeLogEntry,
  assertUpgradeLogEntry,
  UPGRADE_ERROR_CODES,
  type UpgradeLogEntry,
} from "./upgradeLog.js";

// v8.3 §4.4 (7) upgrade.log writer contract + Jianwei QA gate
// items 1 / 3 / 4 (msg=a9805dc5 + msg=197d68d2) regression guard.

async function withHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = await mkdtemp(join(tmpdir(), "slock-upgrade-log-"));
  try {
    return await fn(home);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
}

// ---------- formatUpgradeLogTimestamp ----------

test("formatUpgradeLogTimestamp: shape matches YYYYMMDDTHHmmssZ", () => {
  const ts = formatUpgradeLogTimestamp(new Date("2026-05-24T17:30:00.123Z"));
  assert.equal(ts, "20260524T173000Z");
  assert.match(ts, /^\d{8}T\d{6}Z$/);
});

test("formatUpgradeLogTimestamp: Windows-path-safe (no colons / spaces / slashes)", () => {
  const ts = formatUpgradeLogTimestamp(new Date("2026-12-31T23:59:59.999Z"));
  assert.equal(ts, "20261231T235959Z");
  // Banned chars for cross-platform paths
  for (const banned of [":", " ", "/", "\\", "?", "*", "<", ">", "|", '"']) {
    assert.ok(!ts.includes(banned), `timestamp must not contain ${banned}`);
  }
});

test("formatUpgradeLogTimestamp: lexicographic sort == chronological sort", () => {
  const a = formatUpgradeLogTimestamp(new Date("2026-05-24T17:30:00Z"));
  const b = formatUpgradeLogTimestamp(new Date("2026-05-24T17:30:01Z"));
  const c = formatUpgradeLogTimestamp(new Date("2026-05-25T00:00:00Z"));
  assert.ok(a < b);
  assert.ok(b < c);
});

test("formatUpgradeLogTimestamp: default arg uses current time (smoke)", () => {
  const ts = formatUpgradeLogTimestamp();
  assert.match(ts, /^\d{8}T\d{6}Z$/);
});

// ---------- appendUpgradeLogEntry: shape + JSON-lines ----------

// v8.3.2 bundle shape: `computerVersion` is the user-facing primary
// surface; `bundledDaemonVersion` is forensic-only and optional. The
// samples below exercise both shapes — `SAMPLE_OK_PRIMARY_ONLY` mirrors
// what the 0.0.7 writer emits today (bundled daemon plumbing deferred),
// `SAMPLE_OK_WITH_FORENSIC` exercises the optional forensic field for
// the follow-up that hydrates it.
const SAMPLE_OK_PRIMARY_ONLY: UpgradeLogEntry = {
  fromBundle: { computerVersion: "0.0.5" },
  toBundle: { computerVersion: "0.0.6" },
  channel: "latest",
  trigger: "cli",
  outcome: "ok",
};

const SAMPLE_OK_WITH_FORENSIC: UpgradeLogEntry = {
  fromBundle: { computerVersion: "0.0.5", bundledDaemonVersion: "0.53.0" },
  toBundle: { computerVersion: "0.0.6", bundledDaemonVersion: "0.53.0" },
  channel: "latest",
  trigger: "cli",
  outcome: "ok",
};

const SAMPLE_ERR: UpgradeLogEntry = {
  fromBundle: { computerVersion: "0.0.5" },
  toBundle: { computerVersion: "0.0.6" },
  channel: "latest",
  trigger: "web",
  outcome: "err",
  errorCode: "UPGRADE_SWAP_FAILED",
};

test("appendUpgradeLogEntry: writes valid JSON-line entry with auto-filled `at`", async () => {
  await withHome(async (home) => {
    await appendUpgradeLogEntry(home, SAMPLE_OK_PRIMARY_ONLY);
    const raw = await readFile(upgradeLogPath(home), "utf8");
    assert.ok(raw.endsWith("\n"), "entry must terminate with newline");
    const lines = raw.trim().split("\n");
    assert.equal(lines.length, 1);
    const parsed = JSON.parse(lines[0]);
    assert.match(parsed.at, /^\d{8}T\d{6}Z$/);
    assert.deepEqual(parsed.fromBundle, { computerVersion: "0.0.5" });
    assert.deepEqual(parsed.toBundle, { computerVersion: "0.0.6" });
    assert.equal(parsed.channel, "latest");
    assert.equal(parsed.trigger, "cli");
    assert.equal(parsed.outcome, "ok");
    assert.equal(parsed.errorCode, undefined);
    // Forensic field intentionally absent on primary-only writes.
    assert.equal(parsed.fromBundle.bundledDaemonVersion, undefined);
    assert.equal(parsed.toBundle.bundledDaemonVersion, undefined);
  });
});

test("appendUpgradeLogEntry: optional forensic bundledDaemonVersion round-trips", async () => {
  await withHome(async (home) => {
    await appendUpgradeLogEntry(home, SAMPLE_OK_WITH_FORENSIC);
    const raw = await readFile(upgradeLogPath(home), "utf8");
    const parsed = JSON.parse(raw.trim());
    assert.deepEqual(parsed.fromBundle, { computerVersion: "0.0.5", bundledDaemonVersion: "0.53.0" });
    assert.deepEqual(parsed.toBundle, { computerVersion: "0.0.6", bundledDaemonVersion: "0.53.0" });
  });
});

test("appendUpgradeLogEntry: err entry includes errorCode", async () => {
  await withHome(async (home) => {
    await appendUpgradeLogEntry(home, SAMPLE_ERR);
    const raw = await readFile(upgradeLogPath(home), "utf8");
    const parsed = JSON.parse(raw.trim());
    assert.equal(parsed.outcome, "err");
    assert.equal(parsed.errorCode, "UPGRADE_SWAP_FAILED");
    assert.equal(parsed.trigger, "web");
  });
});

test("appendUpgradeLogEntry: caller-supplied `at` is preserved (round-trip)", async () => {
  await withHome(async (home) => {
    const explicitAt = "20260524T173000Z";
    await appendUpgradeLogEntry(home, { ...SAMPLE_OK_PRIMARY_ONLY, at: explicitAt });
    const raw = await readFile(upgradeLogPath(home), "utf8");
    const parsed = JSON.parse(raw.trim());
    assert.equal(parsed.at, explicitAt);
  });
});

test("appendUpgradeLogEntry: multiple appends produce one JSON line each (append semantics)", async () => {
  await withHome(async (home) => {
    await appendUpgradeLogEntry(home, SAMPLE_OK_PRIMARY_ONLY);
    await appendUpgradeLogEntry(home, SAMPLE_ERR);
    await appendUpgradeLogEntry(home, SAMPLE_OK_PRIMARY_ONLY);
    const raw = await readFile(upgradeLogPath(home), "utf8");
    const lines = raw.trim().split("\n");
    assert.equal(lines.length, 3);
    for (const line of lines) {
      const parsed = JSON.parse(line);
      assert.ok(parsed.at, "every line must have a timestamp");
    }
  });
});

test("appendUpgradeLogEntry: trigger ∈ {cli, web, tray} round-trips intact", async () => {
  await withHome(async (home) => {
    await appendUpgradeLogEntry(home, { ...SAMPLE_OK_PRIMARY_ONLY, trigger: "cli" });
    await appendUpgradeLogEntry(home, { ...SAMPLE_OK_PRIMARY_ONLY, trigger: "web" });
    await appendUpgradeLogEntry(home, { ...SAMPLE_OK_PRIMARY_ONLY, trigger: "tray" });
    const raw = await readFile(upgradeLogPath(home), "utf8");
    const lines = raw.trim().split("\n").map((l) => JSON.parse(l));
    assert.deepEqual(
      lines.map((l) => l.trigger).sort(),
      ["cli", "tray", "web"],
    );
  });
});

// ---------- appendUpgradeLogEntry: 0o600 permission enforcement ----------

test("appendUpgradeLogEntry: new file is created with 0o600", { skip: process.platform === "win32" }, async () => {
  await withHome(async (home) => {
    await appendUpgradeLogEntry(home, SAMPLE_OK_PRIMARY_ONLY);
    const st = await stat(upgradeLogPath(home));
    assert.equal(st.mode & 0o777, 0o600, `expected mode 0o600, got 0${(st.mode & 0o777).toString(8)}`);
  });
});

test("appendUpgradeLogEntry: pre-existing loose 0o644 file is tightened to 0o600 (defense-in-depth chmod)", { skip: process.platform === "win32" }, async () => {
  await withHome(async (home) => {
    // Pre-create with loose perms (simulating an operator that touched the file)
    await mkdir(dirname(upgradeLogPath(home)), { recursive: true });
    await writeFile(upgradeLogPath(home), "", { mode: 0o644 });
    const stBefore = await stat(upgradeLogPath(home));
    assert.equal(stBefore.mode & 0o777, 0o644);

    await appendUpgradeLogEntry(home, SAMPLE_OK_PRIMARY_ONLY);
    const stAfter = await stat(upgradeLogPath(home));
    assert.equal(
      stAfter.mode & 0o777,
      0o600,
      `expected mode 0o600 after defensive chmod, got 0${(stAfter.mode & 0o777).toString(8)}`,
    );
  });
});

test("appendUpgradeLogEntry: pre-existing world-readable 0o666 is tightened to 0o600", { skip: process.platform === "win32" }, async () => {
  await withHome(async (home) => {
    await mkdir(dirname(upgradeLogPath(home)), { recursive: true });
    await writeFile(upgradeLogPath(home), "", { mode: 0o600 });
    // Loosen post-create to simulate manual chmod
    await chmod(upgradeLogPath(home), 0o666);
    await appendUpgradeLogEntry(home, SAMPLE_OK_PRIMARY_ONLY);
    const st = await stat(upgradeLogPath(home));
    assert.equal(st.mode & 0o777, 0o600);
  });
});

// ---------- regression guard: upgradeLog.ts contains no inline literals ----------

test("upgradeLog.ts contains no inline path literals (regression guard, same shape as upgrade.ts guard)", async () => {
  const source = await readFile(new URL("./upgradeLog.ts", import.meta.url), "utf8");
  const codeSection = source.split("\n").filter((l) => !l.startsWith("//")).join("\n");
  for (const banned of [
    /"upgrade\.log"/,
    /"upgrade-install-/,
    /"upgrade-staging"/,
    /"upgrade-snapshot\.json"/,
  ]) {
    assert.ok(
      !banned.test(codeSection),
      `upgradeLog.ts contains banned inline path literal matching ${banned} — must derive via paths.ts helper`,
    );
  }
});

// --- v8.3.3 §4.4 (6) closed-set + discriminated-union runtime guard ---

test("UPGRADE_ERROR_CODES: byte-locked verbatim to RFC v8.3.3 §4.4 (6) 7-value set", () => {
  // RFC source: docs/server/slock-computer-rfc.zh.html §4.4 (6)
  // L361 (programmatic-tier closed-set, v8.3.3 lock). Re-ordering or
  // adding/removing requires an RFC bump (additive-only discipline).
  assert.deepEqual(
    [...UPGRADE_ERROR_CODES],
    [
      "UPGRADE_DEPS_CHANGED",
      "UPGRADE_NETWORK_FAILED",
      "UPGRADE_INTEGRITY_FAILED",
      "UPGRADE_SWAP_FAILED",
      "UPGRADE_RESTART_FAILED",
      "UPGRADE_NO_TARGET",
      "UPGRADE_ALREADY_RUNNING",
    ],
  );
});

test("assertUpgradeLogEntry: rejects outcome=ok with errorCode (discriminated-union violation)", () => {
  const bad = {
    fromBundle: { computerVersion: "0.0.7" },
    toBundle: { computerVersion: "0.0.7" },
    channel: "latest",
    trigger: "cli",
    outcome: "ok",
    errorCode: "UPGRADE_SWAP_FAILED",
  } as unknown as UpgradeLogEntry;
  assert.throws(() => assertUpgradeLogEntry(bad), /outcome="ok" must not carry errorCode/);
});

test("assertUpgradeLogEntry: rejects outcome=err without errorCode", () => {
  const bad = {
    fromBundle: { computerVersion: "0.0.7" },
    toBundle: { computerVersion: "0.0.7" },
    channel: "latest",
    trigger: "cli",
    outcome: "err",
  } as unknown as UpgradeLogEntry;
  assert.throws(() => assertUpgradeLogEntry(bad), /outcome="err" requires errorCode/);
});

test("assertUpgradeLogEntry: rejects errorCode not in v8.3.3 closed 7-value set", () => {
  const bad = {
    fromBundle: { computerVersion: "0.0.7" },
    toBundle: { computerVersion: "0.0.7" },
    channel: "latest",
    trigger: "cli",
    outcome: "err",
    errorCode: "UPGRADE_DOWNLOAD_FAILED", // off-RFC (pre-v8.3.3 token)
  } as unknown as UpgradeLogEntry;
  assert.throws(() => assertUpgradeLogEntry(bad), /not in the v8.3.3 closed 7-value set/);
});

test("assertUpgradeLogEntry: accepts both valid shapes (ok-no-code / err-with-code)", () => {
  const okEntry: UpgradeLogEntry = {
    fromBundle: { computerVersion: "0.0.6" },
    toBundle: { computerVersion: "0.0.7" },
    channel: "latest",
    trigger: "cli",
    outcome: "ok",
  };
  const errEntry: UpgradeLogEntry = {
    fromBundle: { computerVersion: "0.0.6" },
    toBundle: { computerVersion: "0.0.7" },
    channel: "latest",
    trigger: "web",
    outcome: "err",
    errorCode: "UPGRADE_SWAP_FAILED",
  };
  // Neither should throw.
  assertUpgradeLogEntry(okEntry);
  assertUpgradeLogEntry(errEntry);
});

test("assertUpgradeLogEntry: rejects malformed bundle (missing or empty computerVersion)", () => {
  const noFrom = {
    fromBundle: {},
    toBundle: { computerVersion: "0.0.7" },
    channel: "latest",
    trigger: "cli",
    outcome: "ok",
  } as unknown as UpgradeLogEntry;
  assert.throws(() => assertUpgradeLogEntry(noFrom), /fromBundle\.computerVersion must be a non-empty string/);

  const emptyTo = {
    fromBundle: { computerVersion: "0.0.7" },
    toBundle: { computerVersion: "" },
    channel: "latest",
    trigger: "cli",
    outcome: "ok",
  } as unknown as UpgradeLogEntry;
  assert.throws(() => assertUpgradeLogEntry(emptyTo), /toBundle\.computerVersion must be a non-empty string/);
});

test("appendUpgradeLogEntry: runtime guard runs before file I/O (contract violation never leaves partial line)", async () => {
  await withHome(async (home) => {
    const bad = {
      fromBundle: { computerVersion: "0.0.7" },
      toBundle: { computerVersion: "0.0.7" },
      channel: "latest",
      trigger: "cli",
      outcome: "err",
      errorCode: "UPGRADE_NOT_A_REAL_CODE",
    } as unknown as UpgradeLogEntry;
    await assert.rejects(
      () => appendUpgradeLogEntry(home, bad),
      /not in the v8.3.3 closed 7-value set/,
    );
    // No file should exist (guard fired before any open).
    await assert.rejects(
      () => readFile(upgradeLogPath(home), "utf8"),
      (e) => (e as NodeJS.ErrnoException).code === "ENOENT",
    );
  });
});
