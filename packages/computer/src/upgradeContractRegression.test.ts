import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { CliExit } from "./output.js";
import { upgradeLogPath } from "./paths.js";
import { runUpgradeCli, mapFailurePhaseToCode } from "./upgradeCli.js";
import type { UpgradeOutcome } from "./upgrade.js";
import {
  appendUpgradeLogEntry,
  assertUpgradeLogEntry,
  UPGRADE_ERROR_CODES,
  type UpgradeErrorCode,
  type UpgradeLogEntry,
} from "./upgradeLog.js";

const EXPECTED_UPGRADE_ERROR_CODES = [
  "UPGRADE_DEPS_CHANGED",
  "UPGRADE_NETWORK_FAILED",
  "UPGRADE_INTEGRITY_FAILED",
  "UPGRADE_SWAP_FAILED",
  "UPGRADE_RESTART_FAILED",
  "UPGRADE_NO_TARGET",
  "UPGRADE_ALREADY_RUNNING",
] as const satisfies readonly UpgradeErrorCode[];

type FailurePhase = Exclude<UpgradeOutcome["phase"], "drain" | "cleanup">;

async function withHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = await mkdtemp(join(tmpdir(), "slock-upgrade-contract-"));
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
  const stdout = process.stdout.write.bind(process.stdout);
  const stderr = process.stderr.write.bind(process.stderr);
  let buffer = "";
  const sink = (chunk: unknown) => {
    buffer += String(chunk);
    return true;
  };
  process.stdout.write = sink as typeof process.stdout.write;
  process.stderr.write = sink as typeof process.stderr.write;
  return {
    restore: () => {
      process.stdout.write = stdout;
      process.stderr.write = stderr;
    },
    text: () => buffer,
  };
}

function failureOutcome(phase: FailurePhase): UpgradeOutcome {
  return { ok: false, phase, reason: `simulated ${phase} failure` };
}

async function readLastUpgradeLogEntry(home: string): Promise<UpgradeLogEntry> {
  const raw = await readFile(upgradeLogPath(home), "utf8");
  const lines = raw.trim().split("\n");
  const last = JSON.parse(lines.at(-1) ?? "null") as UpgradeLogEntry;
  assertUpgradeLogEntry(last);
  return last;
}

test("upgrade contract: v8.3.3 closed-set is byte-locked to 7 verbatim values", () => {
  assert.deepStrictEqual([...UPGRADE_ERROR_CODES].sort(), [...EXPECTED_UPGRADE_ERROR_CODES].sort());
});

test("upgrade contract: runtime log guard accepts each closed-set error code", async () => {
  await withHome(async (home) => {
    for (const errorCode of EXPECTED_UPGRADE_ERROR_CODES) {
      await appendUpgradeLogEntry(home, {
        fromBundle: { computerVersion: "0.0.10" },
        toBundle: { computerVersion: "0.0.11" },
        channel: "latest",
        trigger: "cli",
        outcome: "err",
        errorCode,
      });
    }

    const raw = await readFile(upgradeLogPath(home), "utf8");
    const seen = raw
      .trim()
      .split("\n")
      .map((line) => (JSON.parse(line) as UpgradeLogEntry).errorCode);

    assert.deepStrictEqual(seen, [...EXPECTED_UPGRADE_ERROR_CODES]);
  });
});

test("upgrade contract: phase/stage outcomes map to the RFC closed-set codes", () => {
  const cases: Array<{ phase: FailurePhase; code: UpgradeErrorCode }> = [
    { phase: "preflight", code: "UPGRADE_DEPS_CHANGED" },
    { phase: "stage", code: "UPGRADE_NETWORK_FAILED" },
    { phase: "hydrate", code: "UPGRADE_NETWORK_FAILED" },
    { phase: "verify", code: "UPGRADE_INTEGRITY_FAILED" },
    { phase: "extract", code: "UPGRADE_INTEGRITY_FAILED" },
    { phase: "snapshot", code: "UPGRADE_SWAP_FAILED" },
    { phase: "swap", code: "UPGRADE_SWAP_FAILED" },
    { phase: "restart", code: "UPGRADE_RESTART_FAILED" },
    { phase: "rolling_health", code: "UPGRADE_RESTART_FAILED" },
  ];

  for (const { phase, code } of cases) {
    assert.equal(mapFailurePhaseToCode(failureOutcome(phase)), code, `phase=${phase}`);
  }

  assert.throws(
    () => mapFailurePhaseToCode({ ok: false, phase: "drain", reason: "busy" }),
    /handled by caller/,
  );
  assert.throws(
    () => mapFailurePhaseToCode({ ok: false, phase: "cleanup", reason: "cleanup warning" }),
    /handled by caller/,
  );
});

test("upgrade contract: CLI failure emissions write closed-set audit entries", async () => {
  const cases: Array<{ phase: FailurePhase; code: UpgradeErrorCode }> = [
    { phase: "preflight", code: "UPGRADE_DEPS_CHANGED" },
    { phase: "hydrate", code: "UPGRADE_NETWORK_FAILED" },
    { phase: "extract", code: "UPGRADE_INTEGRITY_FAILED" },
    { phase: "swap", code: "UPGRADE_SWAP_FAILED" },
    { phase: "restart", code: "UPGRADE_RESTART_FAILED" },
  ];

  await withHome(async (home) => {
    for (const { phase, code } of cases) {
      const cap = captureOut();
      try {
        await assert.rejects(
          () =>
            runUpgradeCli(
              home,
              { targetVersion: `0.99.${cases.findIndex((c) => c.phase === phase)}` },
              {
                currentVersion: async () => "0.0.10",
                currentBinaryDir: () => home,
                runUpgradeFn: async () => failureOutcome(phase),
                readBundledDaemonVersion: async () => "0.53.0",
              },
            ),
          (err) => err instanceof CliExit && err.exitCode === 1 && err.code === code,
        );
      } finally {
        cap.restore();
      }

      assert.match(cap.text(), new RegExp(code));
      const entry = await readLastUpgradeLogEntry(home);
      assert.equal(entry.outcome, "err");
      assert.equal(entry.errorCode, code);
      assert.equal(entry.fromBundle.computerVersion, "0.0.10");
      assert.equal(entry.toBundle.computerVersion, `0.99.${cases.findIndex((c) => c.phase === phase)}`);
      assert.equal(entry.fromBundle.bundledDaemonVersion, "0.53.0");
      assert.equal(entry.toBundle.bundledDaemonVersion, "0.53.0");
    }
  });
});

test("upgrade contract: no-target steady state emits UPGRADE_NO_TARGET without running orchestrator", async () => {
  await withHome(async (home) => {
    let called = false;
    const cap = captureOut();
    try {
      await runUpgradeCli(
        home,
        { targetVersion: "0.0.10" },
        {
          currentVersion: async () => "0.0.10",
          currentBinaryDir: () => home,
          runUpgradeFn: async () => {
            called = true;
            return { ok: true, phase: "cleanup" };
          },
        },
      );
    } finally {
      cap.restore();
    }

    assert.equal(called, false);
    assert.match(cap.text(), /No upgrade target/);
    assert.doesNotMatch(cap.text(), /Nothing to do/);
    const entry = await readLastUpgradeLogEntry(home);
    assert.equal(entry.outcome, "err");
    assert.equal(entry.errorCode, "UPGRADE_NO_TARGET");
    assert.deepStrictEqual(entry.fromBundle, { computerVersion: "0.0.10" });
    assert.deepStrictEqual(entry.toBundle, { computerVersion: "0.0.10" });
  });
});
