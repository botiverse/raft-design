import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  runUpgradeTestHarness,
  validateHarnessOptions,
} from "./upgradeTestHarness.js";

// PR-E §8 regression guard — `__upgrade-test` harness.

async function withHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = await mkdtemp(join(tmpdir(), "slock-pr-e-harness-"));
  try {
    return await fn(home);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
}

function captureLine(): { writer: (s: string) => void; payload: () => unknown } {
  let buf = "";
  return {
    writer: (s) => {
      buf += s;
    },
    payload: () => JSON.parse(buf.trim()),
  };
}

// --- validation ---

test("validateHarnessOptions: unknown phase rejected", () => {
  assert.match(
    validateHarnessOptions({ simulateFail: "fakephase" as never }) ?? "",
    /unknown phase/,
  );
});

test("validateHarnessOptions: network-loss only stage|verify", () => {
  assert.match(
    validateHarnessOptions({ simulateNetworkLossAt: "swap" as never }) ?? "",
    /only "stage" or "verify"/,
  );
});

test("validateHarnessOptions: sleep-wake negative rejected", () => {
  assert.match(
    validateHarnessOptions({ simulateSleepWakeMs: -5 }) ?? "",
    /non-negative/,
  );
});

test("validateHarnessOptions: sleep-wake over bound rejected", () => {
  assert.match(
    validateHarnessOptions({ simulateSleepWakeMs: 99_999 }) ?? "",
    /max 60000ms/,
  );
});

test("validateHarnessOptions: valid combo returns null", () => {
  assert.equal(
    validateHarnessOptions({
      simulateFail: "restart",
      simulateNetworkLossAt: "stage",
      simulateSleepWakeMs: 100,
    }),
    null,
  );
});

// --- harness outcomes ---

test("__upgrade-test: no simulation → ok=true phase=cleanup", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, {}, cap.writer);
    const p = cap.payload() as { ok: boolean; phase: string };
    assert.equal(p.ok, true);
    assert.equal(p.phase, "cleanup");
  });
});

test("__upgrade-test: --simulate-fail stage → ok=false phase=stage", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateFail: "stage" }, cap.writer);
    const p = cap.payload() as { ok: boolean; phase: string; reason: string | null };
    assert.equal(p.ok, false);
    assert.equal(p.phase, "stage");
    assert.match(p.reason ?? "", /stage|npm pack/i);
  });
});

test("__upgrade-test: --simulate-fail verify → ok=false phase=verify", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateFail: "verify" }, cap.writer);
    const p = cap.payload() as { ok: boolean; phase: string };
    assert.equal(p.ok, false);
    assert.equal(p.phase, "verify");
  });
});

test("__upgrade-test: --simulate-fail extract → ok=false phase=extract", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateFail: "extract" }, cap.writer);
    const p = cap.payload() as { ok: boolean; phase: string };
    assert.equal(p.ok, false);
    assert.equal(p.phase, "extract");
  });
});

test("__upgrade-test: --simulate-fail swap → ok=false phase=swap", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateFail: "swap" }, cap.writer);
    const p = cap.payload() as { ok: boolean; phase: string };
    assert.equal(p.ok, false);
    assert.equal(p.phase, "swap");
  });
});

test("__upgrade-test: --simulate-fail restart → ok=false phase=restart rolledBack=true", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateFail: "restart" }, cap.writer);
    const p = cap.payload() as { ok: boolean; phase: string; rolledBack: boolean };
    assert.equal(p.ok, false);
    assert.equal(p.phase, "restart");
    assert.equal(p.rolledBack, true);
  });
});

test("__upgrade-test: --simulate-fail rolling_health → ok=false phase=rolling_health rolledBack=true", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateFail: "rolling_health" }, cap.writer);
    const p = cap.payload() as { ok: boolean; phase: string; rolledBack: boolean };
    assert.equal(p.ok, false);
    assert.equal(p.phase, "rolling_health");
    assert.equal(p.rolledBack, true);
  });
});

test("__upgrade-test: --simulate-fail snapshot → ok=false phase=snapshot", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateFail: "snapshot" }, cap.writer);
    const p = cap.payload() as { ok: boolean; phase: string };
    assert.equal(p.ok, false);
    assert.equal(p.phase, "snapshot");
  });
});

test("__upgrade-test: --simulate-network-loss-at stage → ok=false phase=stage", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateNetworkLossAt: "stage" }, cap.writer);
    const p = cap.payload() as { ok: boolean; phase: string; reason: string | null };
    assert.equal(p.ok, false);
    assert.equal(p.phase, "stage");
    assert.match(p.reason ?? "", /network loss/);
  });
});

test("__upgrade-test: --simulate-network-loss-at verify → ok=false phase=verify (no advertised hash)", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateNetworkLossAt: "verify" }, cap.writer);
    const p = cap.payload() as { ok: boolean; phase: string };
    assert.equal(p.ok, false);
    assert.equal(p.phase, "verify");
  });
});

test("__upgrade-test: --simulate-sleep-wake 50 → still ok=true (sleep absorbed by health-poll budget)", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateSleepWakeMs: 50 }, cap.writer);
    const p = cap.payload() as { ok: boolean; phase: string; simulated: { sleepWakeMs: number } };
    assert.equal(p.ok, true);
    assert.equal(p.phase, "cleanup");
    assert.equal(p.simulated.sleepWakeMs, 50);
  });
});

test("__upgrade-test: --drain defer + idle (default isDaemonBusy stub=false) → proceeds to ok=true", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { drain: "defer" }, cap.writer);
    const p = cap.payload() as {
      ok: boolean;
      phase: string;
      simulated: { drain: string | null };
    };
    assert.equal(p.ok, true);
    assert.equal(p.phase, "cleanup");
    assert.equal(p.simulated.drain, "defer");
  });
});

test("__upgrade-test: --drain force → forwarded; outcome carries force in simulated", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { drain: "force" }, cap.writer);
    const p = cap.payload() as { ok: boolean; simulated: { drain: string | null } };
    assert.equal(p.ok, true);
    assert.equal(p.simulated.drain, "force");
  });
});

test("__upgrade-test: target/from version labels echoed in outcome (via simulated stage)", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(
      home,
      { targetVersion: "1.2.3", fromVersion: "1.2.2" },
      cap.writer,
    );
    const p = cap.payload() as { ok: boolean; phase: string };
    assert.equal(p.ok, true);
    assert.equal(p.phase, "cleanup");
  });
});

// --- §8 state-continuity invariants (Dayu weak-network gate, msg=23bb14b2) ---

interface StateField {
  kind: "file" | "dir";
  size: number;
}
interface StatePayload {
  ok: boolean;
  phase: string;
  rolledBack: boolean;
  state: {
    upgradeSnapshot: StateField | null;
    stagingDir: StateField | null;
    stagingEntries: string[] | null;
    prevBinary: StateField | null;
    currentBinary: StateField | null;
  };
}

test("state continuity: verify fail → staging dropped, snapshot absent (no rollback yet)", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateFail: "verify" }, cap.writer);
    const p = cap.payload() as StatePayload;
    assert.equal(p.ok, false);
    assert.equal(p.phase, "verify");
    assert.equal(p.state.stagingDir, null, "staging must be dropped after verify fail");
    assert.equal(p.state.upgradeSnapshot, null, "no snapshot written before snapshot phase");
    assert.equal(p.state.prevBinary, null, "no swap yet → no .prev");
  });
});

test("state continuity: extract fail → staging dropped, snapshot cleared", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateFail: "extract" }, cap.writer);
    const p = cap.payload() as StatePayload;
    assert.equal(p.phase, "extract");
    assert.equal(p.state.stagingDir, null, "staging dropped on extract fail");
    assert.equal(p.state.upgradeSnapshot, null, "snapshot cleared on extract fail");
  });
});

test("state continuity: swap fail → snapshot + staging KEPT (forensic per §2.3)", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateFail: "swap" }, cap.writer);
    const p = cap.payload() as StatePayload;
    assert.equal(p.phase, "swap");
    assert.notEqual(p.state.stagingDir, null, "staging must be kept on swap fail (forensic)");
    assert.notEqual(p.state.upgradeSnapshot, null, "snapshot must be kept on swap fail (forensic)");
  });
});

test("state continuity: restart fail → operational rollback (binary restored + old supervisor respawned + healthy); snapshot+staging kept", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateFail: "restart" }, cap.writer);
    const p = cap.payload() as StatePayload & {
      rollback: {
        binaryRestored: boolean;
        supervisorStopped: boolean;
        supervisorRespawned: boolean;
        supervisorHealthy: boolean;
        failedStep?: string;
      } | null;
    };
    assert.equal(p.phase, "restart");
    // rolledBack now means BOTH disk + process recovered. Dayu's blocker:
    // disk-only rollback with a still-stale supervisor process is NOT a PASS.
    assert.equal(p.rolledBack, true);
    assert.notEqual(p.rollback, null, "rollback substructure must be populated on restart fail");
    assert.equal(p.rollback?.binaryRestored, true, "disk: .prev → currentBinaryDir restored");
    assert.equal(p.rollback?.supervisorStopped, true, "process: stale new-version supervisor stopped");
    assert.equal(p.rollback?.supervisorRespawned, true, "process: old supervisor respawned post-restore");
    assert.equal(p.rollback?.supervisorHealthy, true, "process: respawned supervisor passed health probe");
    assert.notEqual(p.state.currentBinary, null, "current restored after rollback");
    assert.equal(p.state.prevBinary, null, ".prev removed after rollback");
    assert.notEqual(p.state.upgradeSnapshot, null, "snapshot kept for forensic after restart fail");
    assert.notEqual(p.state.stagingDir, null, "staging kept for forensic after restart fail");
  });
});

test("state continuity: rolling-health fail → operational rollback succeeds; snapshot+staging kept", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateFail: "rolling_health" }, cap.writer);
    const p = cap.payload() as StatePayload & {
      rollback: {
        binaryRestored: boolean;
        supervisorStopped: boolean;
        supervisorRespawned: boolean;
        supervisorHealthy: boolean;
      } | null;
    };
    assert.equal(p.phase, "rolling_health");
    assert.equal(p.rolledBack, true);
    assert.notEqual(p.rollback, null);
    assert.equal(p.rollback?.binaryRestored, true);
    assert.equal(p.rollback?.supervisorStopped, true);
    assert.equal(p.rollback?.supervisorRespawned, true);
    assert.equal(p.rollback?.supervisorHealthy, true);
    assert.notEqual(p.state.currentBinary, null);
    assert.equal(p.state.prevBinary, null);
    assert.notEqual(p.state.upgradeSnapshot, null);
    assert.notEqual(p.state.stagingDir, null);
  });
});

test("state continuity: happy path → staging + snapshot + .prev all cleaned (phase 6)", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, {}, cap.writer);
    const p = cap.payload() as StatePayload;
    assert.equal(p.ok, true);
    assert.equal(p.state.stagingDir, null, "staging cleaned by phase 6");
    assert.equal(p.state.upgradeSnapshot, null, "snapshot cleared by phase 6");
    assert.equal(p.state.prevBinary, null, ".prev cleaned by phase 6");
    assert.notEqual(p.state.currentBinary, null, "current binary stays in place");
  });
});

test("state continuity: network-loss-at stage → staging dropped (retry-safe)", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateNetworkLossAt: "stage" }, cap.writer);
    const p = cap.payload() as StatePayload;
    assert.equal(p.ok, false);
    assert.equal(p.phase, "stage");
    assert.equal(p.state.stagingDir, null, "no partial staging dir → retry-safe");
    assert.equal(p.state.upgradeSnapshot, null);
    assert.equal(p.state.prevBinary, null);
  });
});

test("state continuity: network-loss-at verify → staging dropped (no rollback needed)", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    await runUpgradeTestHarness(home, { simulateNetworkLossAt: "verify" }, cap.writer);
    const p = cap.payload() as StatePayload;
    assert.equal(p.phase, "verify");
    assert.equal(p.state.stagingDir, null);
    assert.equal(p.state.upgradeSnapshot, null);
    assert.equal(p.state.prevBinary, null);
  });
});

test("__upgrade-test: invalid sleep-wake → exit 1, stderr message", async () => {
  await withHome(async (home) => {
    const cap = captureLine();
    const oldErr = process.stderr.write.bind(process.stderr);
    let errBuf = "";
    process.stderr.write = ((c: unknown) => {
      errBuf += String(c);
      return true;
    }) as typeof process.stderr.write;
    const oldExitCode = process.exitCode;
    try {
      await runUpgradeTestHarness(home, { simulateSleepWakeMs: -1 }, cap.writer);
    } finally {
      process.stderr.write = oldErr;
    }
    assert.match(errBuf, /non-negative/);
    assert.equal(process.exitCode, 1);
    process.exitCode = oldExitCode;
  });
});
