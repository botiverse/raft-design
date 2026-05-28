import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import test from "node:test";

import {
  stagePhase,
  verifyPhase,
  cleanupStaged,
  snapshotPhase,
  readUpgradeSnapshot,
  clearUpgradeSnapshot,
  upgradeStagingDir,
  upgradeSnapshotPath,
  extractTarball,
  hydrateStagedDependencies,
  swapPhase,
  rollbackSwap,
  restartPhase,
  cleanupSuccessPhase,
  rollingDaemonHealthCheck,
  runUpgrade,
  type UpgradeSnapshot,
} from "./upgrade.js";

// PR-E §2.3 phase 1-3 regression guard — stage / verify / snapshot.

async function withHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = await mkdtemp(join(tmpdir(), "slock-pr-e-upgrade-"));
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

/**
 * Always-passing preflight stub for tests that mock npmPack with fake
 * tarball bytes (the production preflight's `tar -xzOf` would otherwise
 * fail). Dep-drift refusal semantics get their own dedicated tests in
 * `preflightDepDrift.test.ts` + the new `runUpgrade: preflight fail …`
 * tests below; everything else just needs to skip past phase 1.5.
 */
function passingPreflight() {
  return {
    readTarballPackageJson: async () => ({
      dependencies: { "@slock-ai/daemon": "^0.0.0-test" },
    }),
    readCurrentPackageJson: async () => ({
      dependencies: { "@slock-ai/daemon": "^0.0.0-test" },
    }),
    readInstalledDaemonVersion: async () => "0.0.0-test",
    semverSatisfies: () => true,
    allowUnsafeSpec: true,
  };
}

const hydrateOk = async () => ({ exitCode: 0, stderr: "" });

// --- phase 1: stage ---

test("stagePhase: npm pack OK → stagedPath + tarballSha1 returned (matches npm dist.shasum)", async () => {
  await withHome(async (home) => {
    const tarballBytes = Buffer.from("FAKE TARBALL CONTENT for sha1 test", "utf8");
    const expectedSha = createHash("sha1").update(tarballBytes).digest("hex");

    const npmPack = async (cwd: string, packageRef: string) => {
      // Mock: write a fake tarball to cwd
      const filename = `slock-ai-computer-0.99.0.tgz`;
      await writeFile(join(cwd, filename), tarballBytes);
      void packageRef;
      return { tarballPath: join(cwd, filename), exitCode: 0, stderr: "" };
    };

    const result = await stagePhase(home, "0.99.0", { npmPack });
    assert.equal(result.version, "0.99.0");
    assert.equal(result.tarballSha1, expectedSha);
    assert.equal(result.stagedPath, upgradeStagingDir(home, "0.99.0"));
    // Verify the staging dir is real on disk
    await assert.doesNotReject(() => stat(result.stagedPath));
  });
});

test("stagePhase: npm pack exit-non-zero → UPGRADE_DOWNLOAD_FAILED", async () => {
  await withHome(async (home) => {
    const npmPack = async () => ({ tarballPath: "", exitCode: 1, stderr: "package not found" });
    await assert.rejects(
      stagePhase(home, "9.9.9", { npmPack }),
      (e) => {
        const code = (e as { code?: string }).code;
        return code === "UPGRADE_DOWNLOAD_FAILED";
      },
    );
  });
});

test("stagePhase: tarball missing after pack → UPGRADE_DOWNLOAD_FAILED", async () => {
  await withHome(async (home) => {
    const npmPack = async (cwd: string) => ({
      tarballPath: join(cwd, "nonexistent.tgz"),
      exitCode: 0,
      stderr: "",
    });
    await assert.rejects(
      stagePhase(home, "0.99.0", { npmPack }),
      (e) => (e as { code?: string }).code === "UPGRADE_DOWNLOAD_FAILED",
    );
  });
});

// --- phase 2: verify ---

test("verifyPhase: advertised matches actual → ok=true", async () => {
  const staged = {
    stagedPath: "/tmp/whatever",
    version: "0.99.0",
    tarballSha1: "abc123",
  };
  const result = await verifyPhase(staged, {
    fetchAdvertisedHash: async () => "abc123",
  });
  assert.equal(result.ok, true);
  assert.equal(result.actual, "abc123");
  assert.equal(result.advertised, "abc123");
});

test("verifyPhase: advertised differs → ok=false + checksum_mismatch", async () => {
  const staged = {
    stagedPath: "/tmp/whatever",
    version: "0.99.0",
    tarballSha1: "abc123",
  };
  const result = await verifyPhase(staged, {
    fetchAdvertisedHash: async () => "def456",
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "checksum_mismatch");
  assert.equal(result.actual, "abc123");
  assert.equal(result.advertised, "def456");
});

test("verifyPhase: registry returns null → ok=false + no_advertised_sha", async () => {
  const staged = {
    stagedPath: "/tmp/whatever",
    version: "0.99.0",
    tarballSha1: "abc123",
  };
  const result = await verifyPhase(staged, {
    fetchAdvertisedHash: async () => null,
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "no_advertised_sha");
});

test("verifyPhase: registry fetch throws → ok=false + registry_fetch_failed", async () => {
  const staged = {
    stagedPath: "/tmp/whatever",
    version: "0.99.0",
    tarballSha1: "abc123",
  };
  const result = await verifyPhase(staged, {
    fetchAdvertisedHash: async () => {
      throw new Error("network down");
    },
  });
  assert.equal(result.ok, false);
  assert.equal(result.reason, "registry_fetch_failed");
});

// --- cleanup ---

test("cleanupStaged: removes the staging dir", async () => {
  await withHome(async (home) => {
    const dir = upgradeStagingDir(home, "0.99.0");
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, "marker.txt"), "hi");
    await cleanupStaged(home, "0.99.0");
    await assert.rejects(() => stat(dir));
  });
});

test("cleanupStaged: missing dir → no-op", async () => {
  await withHome(async (home) => {
    await assert.doesNotReject(() => cleanupStaged(home, "0.99.0"));
  });
});

// --- phase 3: snapshot ---

test("snapshotPhase + readUpgradeSnapshot: round-trip", async () => {
  await withHome(async (home) => {
    const snap: UpgradeSnapshot = {
      at: new Date().toISOString(),
      fromVersion: "0.52.2",
      toVersion: "0.53.0",
      channel: "latest",
    };
    await snapshotPhase(home, snap);
    const read = await readUpgradeSnapshot(home);
    assert.deepEqual(read, snap);
  });
});

test("snapshotPhase: writes atomically (no .tmp file left behind)", async () => {
  await withHome(async (home) => {
    const snap: UpgradeSnapshot = {
      at: new Date().toISOString(),
      fromVersion: "0.52.2",
      toVersion: "0.53.0",
      channel: "latest",
    };
    await snapshotPhase(home, snap);
    const path = upgradeSnapshotPath(home);
    // The final file exists, .tmp does not
    await assert.doesNotReject(() => stat(path));
    await assert.rejects(() => stat(`${path}.tmp`));
  });
});

test("readUpgradeSnapshot: missing → null", async () => {
  await withHome(async (home) => {
    const read = await readUpgradeSnapshot(home);
    assert.equal(read, null);
  });
});

test("readUpgradeSnapshot: corrupt JSON → null (lenient)", async () => {
  await withHome(async (home) => {
    await mkdir(join(home, "computer"), { recursive: true });
    await writeFile(upgradeSnapshotPath(home), "{not json");
    const read = await readUpgradeSnapshot(home);
    assert.equal(read, null);
  });
});

test("clearUpgradeSnapshot: deletes file; idempotent on missing", async () => {
  await withHome(async (home) => {
    const snap: UpgradeSnapshot = {
      at: new Date().toISOString(),
      fromVersion: "0.52.2",
      toVersion: "0.53.0",
      channel: "alpha",
    };
    await snapshotPhase(home, snap);
    await assert.doesNotReject(() => stat(upgradeSnapshotPath(home)));
    await clearUpgradeSnapshot(home);
    await assert.rejects(() => stat(upgradeSnapshotPath(home)));
    // Re-clearing missing = no-op
    await assert.doesNotReject(() => clearUpgradeSnapshot(home));
  });
});

// --- extract tarball helper ---

test("extractTarball: tar exit 0 → returns extractedPackageDir", async () => {
  await withHome(async (home) => {
    const dest = join(home, "stage-extract");
    const tarSpawn = async (tarballPath: string, destDir: string) => {
      // Mock: simulate tar by creating <destDir>/package/index.js
      await mkdir(join(destDir, "package"), { recursive: true });
      await writeFile(join(destDir, "package", "index.js"), "// fake");
      void tarballPath;
      return { exitCode: 0, stderr: "" };
    };
    const r = await extractTarball("/fake/path.tgz", dest, { tarSpawn });
    assert.equal(r.extractedPackageDir, join(dest, "package"));
    await assert.doesNotReject(() => stat(join(dest, "package", "index.js")));
  });
});

test("extractTarball: tar exit-non-zero → UPGRADE_EXTRACT_FAILED", async () => {
  await withHome(async (home) => {
    const tarSpawn = async () => ({ exitCode: 1, stderr: "tar: bad gzip" });
    await assert.rejects(
      extractTarball("/fake/path.tgz", join(home, "stage"), { tarSpawn }),
      (e) => (e as { code?: string }).code === "UPGRADE_EXTRACT_FAILED",
    );
  });
});

// --- staged dependency hydration ---

test("hydrateStagedDependencies: npm install OK → succeeds", async () => {
  await withHome(async (home) => {
    const pkg = join(home, "package");
    await mkdir(pkg, { recursive: true });
    let seenCwd = "";
    await hydrateStagedDependencies(pkg, {
      npmInstall: async (cwd) => {
        seenCwd = cwd;
        await mkdir(join(cwd, "node_modules", "@slock-ai", "daemon"), { recursive: true });
        return { exitCode: 0, stderr: "" };
      },
    });
    assert.equal(seenCwd, pkg);
    await assert.doesNotReject(() => stat(join(pkg, "node_modules", "@slock-ai", "daemon")));
  });
});

test("hydrateStagedDependencies: npm install fail → UPGRADE_DEPENDENCY_INSTALL_FAILED without raw npm stderr leak", async () => {
  await withHome(async (home) => {
    const pkg = join(home, "package");
    await mkdir(pkg, { recursive: true });
    await assert.rejects(
      hydrateStagedDependencies(pkg, {
        npmInstall: async () => ({ exitCode: 1, stderr: "npm token=sk_should_not_echo" }),
      }),
      (e) => {
        const err = e as { code?: string; message?: string };
        assert.equal(err.code, "UPGRADE_DEPENDENCY_INSTALL_FAILED");
        assert.doesNotMatch(err.message ?? "", /sk_should_not_echo/);
        return true;
      },
    );
  });
});

// --- phase 4: swap ---

test("swapPhase: current → .prev, staged → current (happy path)", async () => {
  await withHome(async (home) => {
    const current = join(home, "current");
    const staged = join(home, "staged");
    await mkdir(current, { recursive: true });
    await writeFile(join(current, "marker.txt"), "OLD");
    await mkdir(staged, { recursive: true });
    await writeFile(join(staged, "marker.txt"), "NEW");

    const r = await swapPhase(current, staged);
    assert.equal(r.prevBinaryDir, `${current}.prev`);
    assert.equal(r.newBinaryDir, current);
    // Old contents at .prev
    const prevContent = await readFile(join(r.prevBinaryDir, "marker.txt"), "utf8");
    assert.equal(prevContent, "OLD");
    // New contents at current
    const newContent = await readFile(join(current, "marker.txt"), "utf8");
    assert.equal(newContent, "NEW");
    // Staged dir is gone (was moved)
    await assert.rejects(() => stat(staged));
  });
});

test("swapPhase: stale .prev from prior failed upgrade is removed first", async () => {
  await withHome(async (home) => {
    const current = join(home, "current");
    const staged = join(home, "staged");
    await mkdir(current, { recursive: true });
    await writeFile(join(current, "marker.txt"), "OLD");
    await mkdir(staged, { recursive: true });
    await writeFile(join(staged, "marker.txt"), "NEW");
    // Plant a stale .prev
    await mkdir(`${current}.prev`, { recursive: true });
    await writeFile(join(`${current}.prev`, "stale.txt"), "STALE");

    await swapPhase(current, staged);
    // .prev now contains OLD content, no stale.txt
    await assert.doesNotReject(() => stat(join(`${current}.prev`, "marker.txt")));
    await assert.rejects(() => stat(join(`${current}.prev`, "stale.txt")));
  });
});

test("swapPhase: staged-rename failure → rollback (.prev → current restored) + UPGRADE_SWAP_FAILED", async () => {
  await withHome(async (home) => {
    const current = join(home, "current");
    const staged = join(home, "staged");
    await mkdir(current, { recursive: true });
    await writeFile(join(current, "marker.txt"), "OLD");
    await mkdir(staged, { recursive: true });

    let renameCount = 0;
    const fsRename = async (from: string, to: string) => {
      renameCount += 1;
      if (renameCount === 2) {
        // Simulate cross-FS / EPERM on the staged → current rename
        throw new Error("cross-device link");
      }
      // Otherwise use real rename
      const { rename: realRename } = await import("node:fs/promises");
      await realRename(from, to);
    };

    await assert.rejects(
      swapPhase(current, staged, { fsRename }),
      (e) => (e as { code?: string }).code === "UPGRADE_SWAP_FAILED",
    );
    // Current should be restored
    const restored = await readFile(join(current, "marker.txt"), "utf8");
    assert.equal(restored, "OLD");
  });
});

test("rollbackSwap: restores .prev → current after a successful swap", async () => {
  await withHome(async (home) => {
    const current = join(home, "current");
    const staged = join(home, "staged");
    await mkdir(current, { recursive: true });
    await writeFile(join(current, "marker.txt"), "OLD");
    await mkdir(staged, { recursive: true });
    await writeFile(join(staged, "marker.txt"), "NEW");

    await swapPhase(current, staged);
    const rb = await rollbackSwap(current);
    assert.equal(rb.rolledBack, true);
    const content = await readFile(join(current, "marker.txt"), "utf8");
    assert.equal(content, "OLD");
  });
});

test("rollbackSwap: missing .prev → rolledBack=false (idempotent)", async () => {
  await withHome(async (home) => {
    const current = join(home, "current");
    await mkdir(current, { recursive: true });
    const rb = await rollbackSwap(current);
    assert.equal(rb.rolledBack, false);
  });
});

// --- phase 5: restart ---

test("restartPhase: happy path — kill, spawn, health OK → ok=true", async () => {
  let killed = false;
  let spawned = false;
  let healthPolls = 0;
  const r = await restartPhase("/tmp/fake-home", {
    readSupervisorPid: async () => 12345,
    killSupervisor: async () => {
      killed = true;
    },
    waitForExit: async () => true,
    spawnFreshSupervisor: async () => {
      spawned = true;
    },
    healthCheck: async () => {
      healthPolls += 1;
      return healthPolls >= 2; // first poll false, second true
    },
    healthPollIntervalMs: 10,
  });
  assert.equal(r.ok, true);
  assert.equal(killed, true);
  assert.equal(spawned, true);
  assert.ok((r.healthAfterMs ?? 0) >= 0);
});

test("restartPhase: no prior supervisor → skips kill, spawns + health-checks", async () => {
  let spawned = false;
  const r = await restartPhase("/tmp/fake-home", {
    readSupervisorPid: async () => null,
    killSupervisor: async () => {
      throw new Error("should not be called");
    },
    spawnFreshSupervisor: async () => {
      spawned = true;
    },
    healthCheck: async () => true,
    healthPollIntervalMs: 10,
  });
  assert.equal(r.ok, true);
  assert.equal(spawned, true);
});

test("restartPhase: kill throws → supervisor_kill_failed", async () => {
  const r = await restartPhase("/tmp/fake-home", {
    readSupervisorPid: async () => 12345,
    killSupervisor: async () => {
      throw new Error("EPERM");
    },
    healthCheck: async () => true,
  });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "supervisor_kill_failed");
});

test("restartPhase: spawn throws → spawn_failed", async () => {
  const r = await restartPhase("/tmp/fake-home", {
    readSupervisorPid: async () => null,
    spawnFreshSupervisor: async () => {
      throw new Error("ENOENT");
    },
    healthCheck: async () => true,
  });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "spawn_failed");
});

test("restartPhase: health stays false → health_check_timeout", async () => {
  const r = await restartPhase("/tmp/fake-home", {
    readSupervisorPid: async () => null,
    spawnFreshSupervisor: async () => {},
    healthCheck: async () => false,
    healthTimeoutMs: 50,
    healthPollIntervalMs: 10,
  });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "health_check_timeout");
});

// Dayu blocker #2 (msg=911eb84e): waitForExit=false must NEVER let spawn
// / health-check proceed against a still-alive old supervisor. The
// default health probe reads the pidfile + kill(pid, 0); a stale-but-
// alive old pid would return healthy and the upgrade would report
// success while the old binary was still in charge.

test("restartPhase: SIGTERM times out → SIGKILL escalation → exited → spawn proceeds", async () => {
  let killSignals: string[] = [];
  let waitCalls = 0;
  let spawnCalls = 0;
  const r = await restartPhase("/tmp/fake-home", {
    readSupervisorPid: async () => 12345,
    killSupervisor: async () => {
      killSignals.push("SIGTERM");
    },
    forceKillSupervisor: async () => {
      killSignals.push("SIGKILL");
    },
    waitForExit: async () => {
      waitCalls += 1;
      // First wait (SIGTERM) times out; second wait (after SIGKILL) sees exit.
      return waitCalls >= 2;
    },
    spawnFreshSupervisor: async () => {
      spawnCalls += 1;
    },
    healthCheck: async () => true,
    healthTimeoutMs: 100,
    healthPollIntervalMs: 10,
  });
  assert.equal(r.ok, true);
  assert.deepEqual(killSignals, ["SIGTERM", "SIGKILL"]);
  assert.equal(waitCalls, 2);
  assert.equal(spawnCalls, 1);
});

test("restartPhase: SIGTERM + SIGKILL both time out → supervisor_kill_failed; spawn NOT called", async () => {
  let spawnCalls = 0;
  let healthCalls = 0;
  const r = await restartPhase("/tmp/fake-home", {
    readSupervisorPid: async () => 12345,
    killSupervisor: async () => {},
    forceKillSupervisor: async () => {},
    waitForExit: async () => false,
    spawnFreshSupervisor: async () => {
      spawnCalls += 1;
    },
    healthCheck: async () => {
      healthCalls += 1;
      return true;
    },
    healthTimeoutMs: 100,
    healthPollIntervalMs: 10,
  });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "supervisor_kill_failed");
  // Critical: with the old supervisor still alive, we must not have
  // spawned the new one OR run the (default) pidfile-based health probe.
  // Otherwise the live old pid would be misread as new-version healthy.
  assert.equal(spawnCalls, 0);
  assert.equal(healthCalls, 0);
});

// --- phase 6: cleanup-success ---

test("cleanupSuccessPhase: deletes staging + snapshot + .prev", async () => {
  await withHome(async (home) => {
    const stagedDir = upgradeStagingDir(home, "0.99.0");
    await mkdir(stagedDir, { recursive: true });
    await writeFile(join(stagedDir, "marker.txt"), "x");
    const snap: UpgradeSnapshot = {
      at: new Date().toISOString(),
      fromVersion: "0.52.2",
      toVersion: "0.99.0",
      channel: "latest",
    };
    await snapshotPhase(home, snap);
    const prev = join(home, "binary.prev");
    await mkdir(prev, { recursive: true });
    await writeFile(join(prev, "old.txt"), "old");

    await cleanupSuccessPhase(home, "0.99.0", prev);
    await assert.rejects(() => stat(stagedDir));
    await assert.rejects(() => stat(upgradeSnapshotPath(home)));
    await assert.rejects(() => stat(prev));
  });
});

test("cleanupSuccessPhase: missing inputs → no-op (best-effort)", async () => {
  await withHome(async (home) => {
    await assert.doesNotReject(() =>
      cleanupSuccessPhase(home, "0.99.0", join(home, "nonexistent")),
    );
  });
});

// --- runUpgrade orchestrator ---

async function setupFakeUpgradeEnv(home: string): Promise<{
  current: string;
  tarballBytes: Buffer;
  expectedSha: string;
}> {
  const current = join(home, "current-binary");
  await mkdir(current, { recursive: true });
  await writeFile(join(current, "old-marker.txt"), "OLD");
  const tarballBytes = Buffer.from("fake tarball bytes", "utf8");
  const expectedSha = createHash("sha1").update(tarballBytes).digest("hex");
  return { current, tarballBytes, expectedSha };
}

test("runUpgrade: full happy path 1→6 ends ok=true and cleans up", async () => {
  await withHome(async (home) => {
    const { current, tarballBytes, expectedSha } = await setupFakeUpgradeEnv(home);

    const r = await runUpgrade(home, {
      targetVersion: "0.99.0",
      fromVersion: "0.52.2",
      channel: "latest",
      currentBinaryDir: current,
      deps: {
        preflight: passingPreflight(),
        npmPack: async (cwd) => {
          const filename = `slock-ai-computer-0.99.0.tgz`;
          await writeFile(join(cwd, filename), tarballBytes);
          return { tarballPath: join(cwd, filename), exitCode: 0, stderr: "" };
        },
        fetchAdvertisedHash: async () => expectedSha,
        tarSpawn: async (_t, destDir) => {
          await mkdir(join(destDir, "package"), { recursive: true });
          await writeFile(join(destDir, "package", "marker.txt"), "NEW");
          return { exitCode: 0, stderr: "" };
        },
        npmInstall: hydrateOk,
        readSupervisorPid: async () => null,
        spawnFreshSupervisor: async () => {},
        healthCheck: async () => true,
        healthPollIntervalMs: 5,
      },
    });
    assert.equal(r.ok, true);
    assert.equal(r.phase, "cleanup");
    // New binary in place
    const content = await readFile(join(current, "marker.txt"), "utf8");
    assert.equal(content, "NEW");
    // Cleanup: snapshot + .prev + staging gone
    await assert.rejects(() => stat(upgradeSnapshotPath(home)));
    await assert.rejects(() => stat(`${current}.prev`));
    await assert.rejects(() => stat(upgradeStagingDir(home, "0.99.0")));
  });
});

test("runUpgrade: verify fail (checksum mismatch) → ok=false phase=verify; staging cleaned", async () => {
  await withHome(async (home) => {
    const { current, tarballBytes } = await setupFakeUpgradeEnv(home);
    const r = await runUpgrade(home, {
      targetVersion: "0.99.0",
      fromVersion: "0.52.2",
      channel: "latest",
      currentBinaryDir: current,
      deps: {
        preflight: passingPreflight(),
        npmPack: async (cwd) => {
          const filename = `slock-ai-computer-0.99.0.tgz`;
          await writeFile(join(cwd, filename), tarballBytes);
          return { tarballPath: join(cwd, filename), exitCode: 0, stderr: "" };
        },
        fetchAdvertisedHash: async () => "deadbeefDEADBEEFdeadbeefDEADBEEF",
      },
    });
    assert.equal(r.ok, false);
    assert.equal(r.phase, "verify");
    assert.equal(r.verify?.reason, "checksum_mismatch");
    // Staging cleaned
    await assert.rejects(() => stat(upgradeStagingDir(home, "0.99.0")));
    // Snapshot was NOT written (didn't reach phase 3)
    await assert.rejects(() => stat(upgradeSnapshotPath(home)));
    // Current binary untouched
    const old = await readFile(join(current, "old-marker.txt"), "utf8");
    assert.equal(old, "OLD");
  });
});

// --- PR-E 18/n: phase 1.5 preflight integration tests ---
//
// Jianwei's three fixture groups (msg=18117731 / dbbc4e52):
//   - spec_changed:           target spec differs from current spec
//   - installed_unsatisfied:  installed daemon version doesn't satisfy spec
//   - unsafe_spec:            workspace:/file:/git: etc rejected in production
//
// State invariants on preflight fail (cross-checked against §2.3):
//   - phase reported as "preflight"
//   - no snapshot was written (didn't reach phase 3)
//   - no .prev was created (didn't reach phase 4)
//   - currentBinaryDir untouched
//   - staging dir was cleaned up (no leak across retries)

function preflightDepsForRunUpgrade(
  targetSpec: string,
  currentSpec: string,
  installedVersion: string | null,
  extra: { allowUnsafeSpec?: boolean; semverSatisfies?: (v: string, r: string) => boolean } = {},
) {
  return {
    readTarballPackageJson: async () => ({
      dependencies: { "@slock-ai/daemon": targetSpec },
    }),
    readCurrentPackageJson: async () => ({
      dependencies: { "@slock-ai/daemon": currentSpec },
    }),
    readInstalledDaemonVersion: async () => installedVersion,
    ...extra,
  };
}

async function runUpgradeWithMockedTarball(
  home: string,
  current: string,
  preflightOverride: ReturnType<typeof preflightDepsForRunUpgrade>,
) {
  const tarballBytes = Buffer.from("fake tarball bytes", "utf8");
  const expectedSha = createHash("sha1").update(tarballBytes).digest("hex");
  return runUpgrade(home, {
    targetVersion: "0.99.0",
    fromVersion: "0.52.2",
    channel: "latest",
    currentBinaryDir: current,
    deps: {
      preflight: preflightOverride,
      npmPack: async (cwd) => {
        const filename = `slock-ai-computer-0.99.0.tgz`;
        await writeFile(join(cwd, filename), tarballBytes);
        return { tarballPath: join(cwd, filename), exitCode: 0, stderr: "" };
      },
      fetchAdvertisedHash: async () => expectedSha,
      tarSpawn: async (_t, destDir) => {
        await mkdir(join(destDir, "package"), { recursive: true });
        await writeFile(join(destDir, "package", "marker.txt"), "NEW");
        return { exitCode: 0, stderr: "" };
      },
      npmInstall: hydrateOk,
      readSupervisorPid: async () => null,
      spawnFreshSupervisor: async () => {},
      healthCheck: async () => true,
      healthPollIntervalMs: 5,
    },
  });
}

test("runUpgrade: preflight fail (spec_changed) → phase=preflight; no snapshot/.prev; staging cleaned; current untouched", async () => {
  await withHome(async (home) => {
    const { current } = await setupFakeUpgradeEnv(home);
    const r = await runUpgradeWithMockedTarball(
      home,
      current,
      preflightDepsForRunUpgrade("^0.42.0", "^0.41.0", "0.41.5"),
    );
    assert.equal(r.ok, false);
    assert.equal(r.phase, "preflight");
    assert.equal(r.preflight?.reason, "spec_changed");
    assert.equal(r.preflight?.currentSpec, "^0.41.0");
    assert.equal(r.preflight?.targetSpec, "^0.42.0");
    assert.match(r.reason ?? "", /dependency spec changed/);
    // State invariants
    await assert.rejects(() => stat(upgradeSnapshotPath(home)));
    await assert.rejects(() => stat(`${current}.prev`));
    await assert.rejects(() => stat(upgradeStagingDir(home, "0.99.0")));
    // Current binary untouched
    const old = await readFile(join(current, "old-marker.txt"), "utf8");
    assert.equal(old, "OLD");
  });
});

test("runUpgrade: preflight fail (installed_unsatisfied) → phase=preflight; no snapshot/.prev; staging cleaned", async () => {
  await withHome(async (home) => {
    const { current } = await setupFakeUpgradeEnv(home);
    const r = await runUpgradeWithMockedTarball(
      home,
      current,
      preflightDepsForRunUpgrade("^0.42.0", "^0.42.0", "0.41.5"),
    );
    assert.equal(r.ok, false);
    assert.equal(r.phase, "preflight");
    assert.equal(r.preflight?.reason, "installed_unsatisfied");
    assert.equal(r.preflight?.installedVersion, "0.41.5");
    assert.match(r.reason ?? "", /does not satisfy/);
    await assert.rejects(() => stat(upgradeSnapshotPath(home)));
    await assert.rejects(() => stat(`${current}.prev`));
    await assert.rejects(() => stat(upgradeStagingDir(home, "0.99.0")));
    const old = await readFile(join(current, "old-marker.txt"), "utf8");
    assert.equal(old, "OLD");
  });
});

test("runUpgrade: preflight fail (unsafe_spec workspace:*) → phase=preflight; no snapshot/.prev; staging cleaned", async () => {
  await withHome(async (home) => {
    const { current } = await setupFakeUpgradeEnv(home);
    const r = await runUpgradeWithMockedTarball(
      home,
      current,
      preflightDepsForRunUpgrade("workspace:*", "workspace:*", "0.41.5"),
    );
    assert.equal(r.ok, false);
    assert.equal(r.phase, "preflight");
    assert.equal(r.preflight?.reason, "unsafe_spec");
    assert.match(r.reason ?? "", /not a safe semver/);
    await assert.rejects(() => stat(upgradeSnapshotPath(home)));
    await assert.rejects(() => stat(`${current}.prev`));
    await assert.rejects(() => stat(upgradeStagingDir(home, "0.99.0")));
    const old = await readFile(join(current, "old-marker.txt"), "utf8");
    assert.equal(old, "OLD");
  });
});

test("runUpgrade: preflight fail (read_failed: missing daemon entry on target) → phase=preflight; staging cleaned", async () => {
  await withHome(async (home) => {
    const { current } = await setupFakeUpgradeEnv(home);
    const r = await runUpgrade(home, {
      targetVersion: "0.99.0",
      fromVersion: "0.52.2",
      channel: "latest",
      currentBinaryDir: current,
      deps: {
        preflight: {
          readTarballPackageJson: async () => ({ dependencies: {} }),
          readCurrentPackageJson: async () => ({
            dependencies: { "@slock-ai/daemon": "^0.41.0" },
          }),
          readInstalledDaemonVersion: async () => "0.41.0",
        },
        npmPack: async (cwd) => {
          const filename = `slock-ai-computer-0.99.0.tgz`;
          await writeFile(join(cwd, filename), Buffer.from("x"));
          return { tarballPath: join(cwd, filename), exitCode: 0, stderr: "" };
        },
        fetchAdvertisedHash: async () =>
          createHash("sha1").update(Buffer.from("x")).digest("hex"),
      },
    });
    assert.equal(r.ok, false);
    assert.equal(r.phase, "preflight");
    assert.equal(r.preflight?.reason, "read_failed");
    await assert.rejects(() => stat(upgradeSnapshotPath(home)));
    await assert.rejects(() => stat(`${current}.prev`));
    await assert.rejects(() => stat(upgradeStagingDir(home, "0.99.0")));
  });
});

test("runUpgrade: preflight ok → flow proceeds to cleanup (sanity check for happy preflight path)", async () => {
  await withHome(async (home) => {
    const { current } = await setupFakeUpgradeEnv(home);
    const r = await runUpgradeWithMockedTarball(
      home,
      current,
      preflightDepsForRunUpgrade("^0.41.0", "^0.41.0", "0.41.5"),
    );
    assert.equal(r.ok, true, `expected ok, got ${JSON.stringify(r)}`);
    assert.equal(r.phase, "cleanup");
  });
});

test("runUpgrade: hydrate fail → ok=false phase=hydrate; no swap; staging/snapshot cleaned", async () => {
  await withHome(async (home) => {
    const { current, tarballBytes, expectedSha } = await setupFakeUpgradeEnv(home);
    const r = await runUpgrade(home, {
      targetVersion: "0.99.0",
      fromVersion: "0.52.2",
      channel: "latest",
      currentBinaryDir: current,
      deps: {
        preflight: passingPreflight(),
        npmPack: async (cwd) => {
          const filename = `slock-ai-computer-0.99.0.tgz`;
          await writeFile(join(cwd, filename), tarballBytes);
          return { tarballPath: join(cwd, filename), exitCode: 0, stderr: "" };
        },
        fetchAdvertisedHash: async () => expectedSha,
        tarSpawn: async (_t, destDir) => {
          await mkdir(join(destDir, "package"), { recursive: true });
          await writeFile(join(destDir, "package", "marker.txt"), "NEW");
          return { exitCode: 0, stderr: "" };
        },
        npmInstall: async () => ({ exitCode: 1, stderr: "registry down" }),
      },
    });
    assert.equal(r.ok, false);
    assert.equal(r.phase, "hydrate");
    assert.match(r.reason ?? "", /npm install failed/);
    await assert.rejects(() => stat(upgradeSnapshotPath(home)));
    await assert.rejects(() => stat(`${current}.prev`));
    await assert.rejects(() => stat(upgradeStagingDir(home, "0.99.0")));
    const old = await readFile(join(current, "old-marker.txt"), "utf8");
    assert.equal(old, "OLD");
  });
});

test("runUpgrade: restart fail (health timeout) → operational rollback (new stopped, .prev restored, old respawned + healthy)", async () => {
  await withHome(async (home) => {
    const { current, tarballBytes, expectedSha } = await setupFakeUpgradeEnv(home);
    let spawnCalls = 0;
    const r = await runUpgrade(home, {
      targetVersion: "0.99.0",
      fromVersion: "0.52.2",
      channel: "latest",
      currentBinaryDir: current,
      deps: {
        preflight: passingPreflight(),
        npmPack: async (cwd) => {
          const filename = `slock-ai-computer-0.99.0.tgz`;
          await writeFile(join(cwd, filename), tarballBytes);
          return { tarballPath: join(cwd, filename), exitCode: 0, stderr: "" };
        },
        fetchAdvertisedHash: async () => expectedSha,
        tarSpawn: async (_t, destDir) => {
          await mkdir(join(destDir, "package"), { recursive: true });
          await writeFile(join(destDir, "package", "marker.txt"), "NEW");
          return { exitCode: 0, stderr: "" };
        },
        npmInstall: hydrateOk,
        readSupervisorPid: async () => null,
        spawnFreshSupervisor: async () => {
          spawnCalls += 1;
        },
        // Health is false while the new-version supervisor is the only
        // process that has spawned (spawnCalls===1). After rollback
        // respawns the old supervisor (spawnCalls===2), it returns true.
        healthCheck: async () => spawnCalls >= 2,
        healthTimeoutMs: 30,
        healthPollIntervalMs: 5,
      },
    });
    assert.equal(r.ok, false);
    assert.equal(r.phase, "restart");
    assert.equal(r.restart?.reason, "health_check_timeout");
    // rolledBack=true is now operational, not just disk.
    assert.equal(r.rolledBack, true);
    assert.equal(r.rollback?.binaryRestored, true);
    assert.equal(r.rollback?.supervisorStopped, true);
    assert.equal(r.rollback?.supervisorRespawned, true);
    assert.equal(r.rollback?.supervisorHealthy, true);
    // New-version supervisor spawn + rollback respawn ⇒ 2 spawns total.
    assert.equal(spawnCalls, 2);
    // Snapshot + staging KEPT for forensic
    await assert.doesNotReject(() => stat(upgradeSnapshotPath(home)));
    await assert.doesNotReject(() => stat(upgradeStagingDir(home, "0.99.0")));
    // Current restored to OLD
    const old = await readFile(join(current, "old-marker.txt"), "utf8");
    assert.equal(old, "OLD");
  });
});

test("runUpgrade: restart fail + rollback respawn ALSO fails → rolledBack=false, rollback.failedStep=respawn", async () => {
  await withHome(async (home) => {
    const { current, tarballBytes, expectedSha } = await setupFakeUpgradeEnv(home);
    let spawnCalls = 0;
    const r = await runUpgrade(home, {
      targetVersion: "0.99.0",
      fromVersion: "0.52.2",
      channel: "latest",
      currentBinaryDir: current,
      deps: {
        preflight: passingPreflight(),
        npmPack: async (cwd) => {
          const filename = `slock-ai-computer-0.99.0.tgz`;
          await writeFile(join(cwd, filename), tarballBytes);
          return { tarballPath: join(cwd, filename), exitCode: 0, stderr: "" };
        },
        fetchAdvertisedHash: async () => expectedSha,
        tarSpawn: async (_t, destDir) => {
          await mkdir(join(destDir, "package"), { recursive: true });
          return { exitCode: 0, stderr: "" };
        },
        npmInstall: hydrateOk,
        readSupervisorPid: async () => null,
        spawnFreshSupervisor: async () => {
          spawnCalls += 1;
          // Both initial spawn AND rollback respawn fail.
          if (spawnCalls === 2) throw new Error("simulated rollback respawn failure");
        },
        healthCheck: async () => false,
        healthTimeoutMs: 30,
        healthPollIntervalMs: 5,
      },
    });
    assert.equal(r.ok, false);
    assert.equal(r.phase, "restart");
    // Operational rollback failed at respawn step.
    assert.equal(r.rolledBack, false, "rollback respawn failed → rolledBack must be false");
    assert.equal(r.rollback?.binaryRestored, true, "binary disk restore still succeeds");
    assert.equal(r.rollback?.supervisorStopped, true);
    assert.equal(r.rollback?.supervisorRespawned, false);
    assert.equal(r.rollback?.supervisorHealthy, false);
    assert.equal(r.rollback?.failedStep, "respawn");
  });
});

test("runUpgrade: restart fail + rollback respawn succeeds but old health probe times out → rolledBack=false, failedStep=health", async () => {
  await withHome(async (home) => {
    const { current, tarballBytes, expectedSha } = await setupFakeUpgradeEnv(home);
    const r = await runUpgrade(home, {
      targetVersion: "0.99.0",
      fromVersion: "0.52.2",
      channel: "latest",
      currentBinaryDir: current,
      deps: {
        preflight: passingPreflight(),
        npmPack: async (cwd) => {
          const filename = `slock-ai-computer-0.99.0.tgz`;
          await writeFile(join(cwd, filename), tarballBytes);
          return { tarballPath: join(cwd, filename), exitCode: 0, stderr: "" };
        },
        fetchAdvertisedHash: async () => expectedSha,
        tarSpawn: async (_t, destDir) => {
          await mkdir(join(destDir, "package"), { recursive: true });
          return { exitCode: 0, stderr: "" };
        },
        npmInstall: hydrateOk,
        readSupervisorPid: async () => null,
        spawnFreshSupervisor: async () => {},
        // Both probes time out — initial new-version AND rollback old-version.
        healthCheck: async () => false,
        healthTimeoutMs: 30,
        healthPollIntervalMs: 5,
      },
    });
    assert.equal(r.ok, false);
    assert.equal(r.phase, "restart");
    assert.equal(r.rolledBack, false);
    assert.equal(r.rollback?.binaryRestored, true);
    assert.equal(r.rollback?.supervisorRespawned, true);
    assert.equal(r.rollback?.supervisorHealthy, false);
    assert.equal(r.rollback?.failedStep, "health");
  });
});

test("runUpgrade: stage fail (npm pack exit 1) → ok=false phase=stage; nothing partial", async () => {
  await withHome(async (home) => {
    const { current } = await setupFakeUpgradeEnv(home);
    const r = await runUpgrade(home, {
      targetVersion: "9.9.9",
      fromVersion: "0.52.2",
      channel: "latest",
      currentBinaryDir: current,
      deps: {
        preflight: passingPreflight(),
        npmPack: async () => ({ tarballPath: "", exitCode: 1, stderr: "404 not found" }),
      },
    });
    assert.equal(r.ok, false);
    assert.equal(r.phase, "stage");
    // Snapshot not written
    await assert.rejects(() => stat(upgradeSnapshotPath(home)));
  });
});

// --- §2.4 rolling daemon health-check ---

test("rollingDaemonHealthCheck: no managed servers → ok=true, empty daemons", async () => {
  const r = await rollingDaemonHealthCheck("/tmp/fake", {
    listManagedServerIds: async () => [],
  });
  assert.equal(r.ok, true);
  assert.deepEqual(r.daemons, []);
});

test("rollingDaemonHealthCheck: all daemons live → ok=true, entries with ms timing", async () => {
  const r = await rollingDaemonHealthCheck("/tmp/fake", {
    listManagedServerIds: async () => ["srv-a", "srv-b"],
    readDaemonPid: async () => 12345,
    isProcessAlive: () => true,
    pollIntervalMs: 5,
  });
  assert.equal(r.ok, true);
  assert.equal(r.daemons.length, 2);
  assert.equal(r.daemons[0]?.serverId, "srv-a");
  assert.equal(r.daemons[0]?.ok, true);
  assert.equal(r.daemons[1]?.serverId, "srv-b");
  assert.equal(r.daemons[1]?.ok, true);
});

test("rollingDaemonHealthCheck: second daemon fails → short-circuits with first OK + second failed", async () => {
  const r = await rollingDaemonHealthCheck("/tmp/fake", {
    listManagedServerIds: async () => ["srv-a", "srv-b", "srv-c"],
    readDaemonPid: async (_h, sid) => (sid === "srv-b" ? null : 12345),
    isProcessAlive: () => true,
    perDaemonTimeoutMs: 30,
    pollIntervalMs: 5,
  });
  assert.equal(r.ok, false);
  assert.equal(r.daemons.length, 2);
  assert.equal(r.daemons[0]?.serverId, "srv-a");
  assert.equal(r.daemons[0]?.ok, true);
  assert.equal(r.daemons[1]?.serverId, "srv-b");
  assert.equal(r.daemons[1]?.ok, false);
  assert.equal(r.daemons[1]?.reason, "pidfile_missing");
});

test("rollingDaemonHealthCheck: pid file present but process dead → process_dead", async () => {
  const r = await rollingDaemonHealthCheck("/tmp/fake", {
    listManagedServerIds: async () => ["srv-a"],
    readDaemonPid: async () => 99999,
    isProcessAlive: () => false,
    perDaemonTimeoutMs: 20,
    pollIntervalMs: 5,
  });
  assert.equal(r.ok, false);
  assert.equal(r.daemons[0]?.reason, "process_dead");
});

test("rollingDaemonHealthCheck: pidfile only appears after a few polls → eventually OK", async () => {
  let polls = 0;
  const r = await rollingDaemonHealthCheck("/tmp/fake", {
    listManagedServerIds: async () => ["srv-a"],
    readDaemonPid: async () => {
      polls += 1;
      return polls >= 3 ? 12345 : null;
    },
    isProcessAlive: () => true,
    perDaemonTimeoutMs: 1000,
    pollIntervalMs: 5,
  });
  assert.equal(r.ok, true);
  assert.equal(r.daemons[0]?.ok, true);
});

// --- runUpgrade §2.4 integration ---

test("runUpgrade: rolling-health fail → ok=false phase=rolling_health; swap rolled back", async () => {
  await withHome(async (home) => {
    const tarballBytes = Buffer.from("fake tarball bytes", "utf8");
    const expectedSha = createHash("sha1").update(tarballBytes).digest("hex");
    const current = join(home, "current-binary");
    await mkdir(current, { recursive: true });
    await writeFile(join(current, "old-marker.txt"), "OLD");

    const r = await runUpgrade(home, {
      targetVersion: "0.99.0",
      fromVersion: "0.52.2",
      channel: "latest",
      currentBinaryDir: current,
      deps: {
        preflight: passingPreflight(),
        npmPack: async (cwd) => {
          const filename = `slock-ai-computer-0.99.0.tgz`;
          await writeFile(join(cwd, filename), tarballBytes);
          return { tarballPath: join(cwd, filename), exitCode: 0, stderr: "" };
        },
        fetchAdvertisedHash: async () => expectedSha,
        tarSpawn: async (_t, destDir) => {
          await mkdir(join(destDir, "package"), { recursive: true });
          await writeFile(join(destDir, "package", "marker.txt"), "NEW");
          return { exitCode: 0, stderr: "" };
        },
        npmInstall: hydrateOk,
        readSupervisorPid: async () => null,
        spawnFreshSupervisor: async () => {},
        healthCheck: async () => true,
        // Managed servers exist but daemons never come up
        listManagedServerIds: async () => ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"],
        readDaemonPid: async () => null,
        perDaemonTimeoutMs: 20,
        daemonPollIntervalMs: 5,
        healthPollIntervalMs: 5,
      },
    });
    assert.equal(r.ok, false);
    assert.equal(r.phase, "rolling_health");
    assert.equal(r.rolledBack, true);
    assert.equal(r.rolling?.daemons[0]?.ok, false);
    // Current restored to OLD
    const old = await readFile(join(current, "old-marker.txt"), "utf8");
    assert.equal(old, "OLD");
  });
});

// Avoid TS unused-import warning for readFile (referenced in test above via stat)
void readFile;

// --- §2.7 drain modes ---

test("runUpgrade: drainMode='defer' + busy → ok=false phase=drain (no stage/snapshot side effects)", async () => {
  await withHome(async (home) => {
    let npmPackCalled = false;
    const r = await runUpgrade(home, {
      targetVersion: "0.99.0",
      fromVersion: "0.52.2",
      channel: "latest",
      currentBinaryDir: join(home, "current"),
      drainMode: "defer",
      deps: {
        preflight: passingPreflight(),
        isDaemonBusy: async () => true,
        npmPack: async () => {
          npmPackCalled = true;
          return { tarballPath: "", exitCode: 0, stderr: "" };
        },
      },
    });
    assert.equal(r.ok, false);
    assert.equal(r.phase, "drain");
    assert.match(r.reason ?? "", /deferred/);
    assert.equal(npmPackCalled, false);
  });
});

test("runUpgrade: drainMode='defer' + idle → proceeds normally", async () => {
  await withHome(async (home) => {
    const tarballBytes = Buffer.from("fake tarball bytes", "utf8");
    const expectedSha = createHash("sha1").update(tarballBytes).digest("hex");
    const current = join(home, "current-binary");
    await mkdir(current, { recursive: true });

    const r = await runUpgrade(home, {
      targetVersion: "0.99.0",
      fromVersion: "0.52.2",
      channel: "latest",
      currentBinaryDir: current,
      drainMode: "defer",
      deps: {
        preflight: passingPreflight(),
        isDaemonBusy: async () => false,
        npmPack: async (cwd) => {
          const filename = `slock-ai-computer-0.99.0.tgz`;
          await writeFile(join(cwd, filename), tarballBytes);
          return { tarballPath: join(cwd, filename), exitCode: 0, stderr: "" };
        },
        fetchAdvertisedHash: async () => expectedSha,
        tarSpawn: async (_t, destDir) => {
          await mkdir(join(destDir, "package"), { recursive: true });
          return { exitCode: 0, stderr: "" };
        },
        npmInstall: hydrateOk,
        readSupervisorPid: async () => null,
        spawnFreshSupervisor: async () => {},
        healthCheck: async () => true,
        listManagedServerIds: async () => [],
        healthPollIntervalMs: 5,
      },
    });
    assert.equal(r.ok, true);
    assert.equal(r.phase, "cleanup");
  });
});

test("runUpgrade: drainMode='force' → restartPhase uses force-kill path (SIGKILL, no waitForExit)", async () => {
  await withHome(async (home) => {
    const tarballBytes = Buffer.from("fake tarball bytes", "utf8");
    const expectedSha = createHash("sha1").update(tarballBytes).digest("hex");
    const current = join(home, "current-binary");
    await mkdir(current, { recursive: true });

    let sigTermCalled = false;
    let sigKillCalled = false;
    let waitForExitCalled = false;

    const r = await runUpgrade(home, {
      targetVersion: "0.99.0",
      fromVersion: "0.52.2",
      channel: "latest",
      currentBinaryDir: current,
      drainMode: "force",
      deps: {
        preflight: passingPreflight(),
        npmPack: async (cwd) => {
          const filename = `slock-ai-computer-0.99.0.tgz`;
          await writeFile(join(cwd, filename), tarballBytes);
          return { tarballPath: join(cwd, filename), exitCode: 0, stderr: "" };
        },
        fetchAdvertisedHash: async () => expectedSha,
        tarSpawn: async (_t, destDir) => {
          await mkdir(join(destDir, "package"), { recursive: true });
          return { exitCode: 0, stderr: "" };
        },
        npmInstall: hydrateOk,
        readSupervisorPid: async () => 99999,
        killSupervisor: async () => {
          sigTermCalled = true;
        },
        forceKillSupervisor: async () => {
          sigKillCalled = true;
        },
        waitForExit: async () => {
          waitForExitCalled = true;
          return true;
        },
        spawnFreshSupervisor: async () => {},
        healthCheck: async () => true,
        listManagedServerIds: async () => [],
        healthPollIntervalMs: 5,
      },
    });
    assert.equal(r.ok, true);
    assert.equal(sigKillCalled, true, "force mode must invoke forceKillSupervisor");
    assert.equal(sigTermCalled, false, "force mode must NOT invoke graceful SIGTERM");
    assert.equal(waitForExitCalled, false, "force mode must NOT waitForExit");
  });
});

test("runUpgrade: default drainMode → restartPhase uses graceful SIGTERM + waitForExit", async () => {
  await withHome(async (home) => {
    const tarballBytes = Buffer.from("fake tarball bytes", "utf8");
    const expectedSha = createHash("sha1").update(tarballBytes).digest("hex");
    const current = join(home, "current-binary");
    await mkdir(current, { recursive: true });

    let sigTermCalled = false;
    let sigKillCalled = false;
    let waitForExitCalled = false;

    const r = await runUpgrade(home, {
      targetVersion: "0.99.0",
      fromVersion: "0.52.2",
      channel: "latest",
      currentBinaryDir: current,
      deps: {
        preflight: passingPreflight(),
        npmPack: async (cwd) => {
          const filename = `slock-ai-computer-0.99.0.tgz`;
          await writeFile(join(cwd, filename), tarballBytes);
          return { tarballPath: join(cwd, filename), exitCode: 0, stderr: "" };
        },
        fetchAdvertisedHash: async () => expectedSha,
        tarSpawn: async (_t, destDir) => {
          await mkdir(join(destDir, "package"), { recursive: true });
          return { exitCode: 0, stderr: "" };
        },
        npmInstall: hydrateOk,
        readSupervisorPid: async () => 99999,
        killSupervisor: async () => {
          sigTermCalled = true;
        },
        forceKillSupervisor: async () => {
          sigKillCalled = true;
        },
        waitForExit: async () => {
          waitForExitCalled = true;
          return true;
        },
        spawnFreshSupervisor: async () => {},
        healthCheck: async () => true,
        listManagedServerIds: async () => [],
        healthPollIntervalMs: 5,
      },
    });
    assert.equal(r.ok, true);
    assert.equal(sigTermCalled, true, "default mode must SIGTERM gracefully");
    assert.equal(sigKillCalled, false, "default mode must NOT SIGKILL");
    assert.equal(waitForExitCalled, true, "default mode must waitForExit");
  });
});

test("runUpgrade: drainMode='defer' + isDaemonBusy throws → falls through (busy probe failure must not block)", async () => {
  await withHome(async (home) => {
    const tarballBytes = Buffer.from("fake tarball bytes", "utf8");
    const expectedSha = createHash("sha1").update(tarballBytes).digest("hex");
    const current = join(home, "current-binary");
    await mkdir(current, { recursive: true });

    const r = await runUpgrade(home, {
      targetVersion: "0.99.0",
      fromVersion: "0.52.2",
      channel: "latest",
      currentBinaryDir: current,
      drainMode: "defer",
      deps: {
        preflight: passingPreflight(),
        isDaemonBusy: async () => {
          throw new Error("busy probe crashed");
        },
        npmPack: async (cwd) => {
          const filename = `slock-ai-computer-0.99.0.tgz`;
          await writeFile(join(cwd, filename), tarballBytes);
          return { tarballPath: join(cwd, filename), exitCode: 0, stderr: "" };
        },
        fetchAdvertisedHash: async () => expectedSha,
        tarSpawn: async (_t, destDir) => {
          await mkdir(join(destDir, "package"), { recursive: true });
          return { exitCode: 0, stderr: "" };
        },
        npmInstall: hydrateOk,
        readSupervisorPid: async () => null,
        spawnFreshSupervisor: async () => {},
        healthCheck: async () => true,
        listManagedServerIds: async () => [],
        healthPollIntervalMs: 5,
      },
    });
    assert.equal(r.ok, true);
    assert.equal(r.phase, "cleanup");
  });
});

test("restartPhase: forceKill=true → forceKillSupervisor invoked, killSupervisor + waitForExit skipped", async () => {
  await withHome(async (home) => {
    let sigTerm = false;
    let sigKill = false;
    let waited = false;
    const r = await restartPhase(home, {
      readSupervisorPid: async () => 42,
      killSupervisor: async () => {
        sigTerm = true;
      },
      forceKillSupervisor: async () => {
        sigKill = true;
      },
      waitForExit: async () => {
        waited = true;
        return true;
      },
      spawnFreshSupervisor: async () => {},
      healthCheck: async () => true,
      forceKill: true,
      healthPollIntervalMs: 5,
    });
    assert.equal(r.ok, true);
    assert.equal(sigKill, true);
    assert.equal(sigTerm, false);
    assert.equal(waited, false);
  });
});
