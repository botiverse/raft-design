import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { runUpgradeInstallSmoke, runUpgradeInstallSmokeCli } from "./upgradeInstallSmoke.js";
import { readSupervisorVersionEvidence } from "./supervisor.js";
import { supervisorVersionPath, supervisorPidPath, computerDir } from "./paths.js";

// PR-E 17/n regression guard — `__upgrade-install-smoke` harness +
// supervisor-version evidence file. Pins:
//   - smoke flow swaps real bytes on disk (currentBinaryDir contents
//     come from the local tarball)
//   - active-version evidence is propagated through to the caller via
//     `readSupervisorVersionEvidence` after the smoke completes
//   - missing/invalid `supervisor-version.json` reads return null (no
//     crash) per liuliu lenient-read requirement (msg=dd55ada2)
//   - missing `--package-tarball` is rejected before any side effect

async function withHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = await mkdtemp(join(tmpdir(), "slock-pr-e-install-smoke-"));
  try {
    return await fn(home);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
}

// Daemon spec used by the synthetic smoke setup. PR-E 18/n preflight
// requires both sides (target tarball + current binary package.json) to
// declare the same `@slock-ai/daemon` spec, and an on-disk sibling
// daemon `package.json` whose version satisfies the spec.
const SMOKE_DAEMON_SPEC = "0.0.0-smoke";
const SMOKE_DAEMON_VERSION = "0.0.0-smoke";

/**
 * Build a tiny synthetic tarball that satisfies the smoke's needs:
 *   - top-level `package/` directory (mirrors npm-pack layout)
 *   - `package/package.json` so QA can inspect the swapped bytes
 *
 * Returns the absolute path to the .tgz on disk.
 */
async function makeSyntheticTarball(
  root: string,
  filename: string,
  version: string,
): Promise<string> {
  const stage = join(root, "stage");
  const pkgDir = join(stage, "package");
  await mkdir(pkgDir, { recursive: true });
  await writeFile(
    join(pkgDir, "package.json"),
    JSON.stringify(
      {
        name: "@slock-ai/computer",
        version,
        dependencies: { "@slock-ai/daemon": SMOKE_DAEMON_SPEC },
      },
      null,
      2,
    ) + "\n",
  );
  await writeFile(join(pkgDir, "marker.txt"), `version=${version}\n`);
  const tarballPath = join(root, filename);
  const r = spawnSync("tar", ["-czf", tarballPath, "-C", stage, "package"], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  if (r.status !== 0) {
    throw new Error(`tar -czf failed: ${r.stderr?.toString() ?? "no stderr"}`);
  }
  return tarballPath;
}

/**
 * Stand up the on-disk layout the PR-E 18/n preflight expects:
 *   <currentBinaryDir>/package.json     — same daemon spec as the tarball
 *   <scopeDir>/daemon/package.json      — installed daemon version
 *
 * Mirrors the global-install layout: `<scope>/computer` and `<scope>/daemon`
 * are siblings. `defaultReadInstalledDaemonVersion` walks dirname() once
 * to find the sibling daemon dir.
 */
/**
 * Build the disposable QA install layout the PR-E 19/n preflight
 * expects. Note (Dayu blocker msg=e25c0cd6): `currentBinaryDir` must
 * actually live under a `node_modules/@slock-ai/` directory so the
 * production `createRequire(...).resolve("@slock-ai/daemon/package.json")`
 * resolver can find the sibling daemon. Layout produced:
 *
 *   <currentBinaryDir>/package.json                         (computer)
 *   <currentBinaryDir>/../daemon/package.json               (sibling daemon)
 *
 * Callers must therefore pass `currentBinaryDir` ending in
 * `node_modules/@slock-ai/computer`.
 */
async function seedPreflightLayout(currentBinaryDir: string, version: string): Promise<void> {
  await mkdir(currentBinaryDir, { recursive: true });
  await writeFile(
    join(currentBinaryDir, "package.json"),
    JSON.stringify(
      {
        name: "@slock-ai/computer",
        version,
        dependencies: { "@slock-ai/daemon": SMOKE_DAEMON_SPEC },
      },
      null,
      2,
    ) + "\n",
  );
  // PR-E 20/n: real daemon exports map allows `./core` only. The
  // preflight resolves `@slock-ai/daemon/core` (not `/package.json`)
  // and walks up to the package root. Mirror that shape here so the
  // smoke fixture exercises the same code path the real install does.
  const scopeDir = join(currentBinaryDir, "..");
  const daemonDir = join(scopeDir, "daemon");
  await mkdir(join(daemonDir, "dist"), { recursive: true });
  await writeFile(
    join(daemonDir, "package.json"),
    JSON.stringify(
      {
        name: "@slock-ai/daemon",
        version: SMOKE_DAEMON_VERSION,
        type: "module",
        exports: { "./core": { import: "./dist/core.js" } },
      },
      null,
      2,
    ) + "\n",
  );
  await writeFile(join(daemonDir, "dist", "core.js"), "// smoke stub\n");
}

test("runUpgradeInstallSmoke: missing --package-tarball is rejected", async () => {
  await withHome(async (home) => {
    await assert.rejects(
      runUpgradeInstallSmoke(home, {
        packageTarball: "",
        targetVersion: "0.99.0",
        fromVersion: "0.0.0",
        currentBinaryDir: join(home, "current"),
      }),
      /--package-tarball is required/,
    );
  });
});

test("runUpgradeInstallSmoke: missing tarball path surfaces a clear error", async () => {
  await withHome(async (home) => {
    await assert.rejects(
      runUpgradeInstallSmoke(home, {
        packageTarball: join(home, "no-such.tgz"),
        targetVersion: "0.99.0",
        fromVersion: "0.0.0",
        currentBinaryDir: join(home, "current"),
      }),
      /cannot read --package-tarball/,
    );
  });
});

test("runUpgradeInstallSmoke: swaps tarball contents into currentBinaryDir + surfaces active-version evidence", async () => {
  await withHome(async (home) => {
    const targetVersion = "0.99.0-smoke";
    const tarballPath = await makeSyntheticTarball(
      home,
      `slock-ai-computer-${targetVersion}.tgz`,
      targetVersion,
    );

    const currentBinaryDir = join(home, "node_modules", "@slock-ai", "computer");
    await seedPreflightLayout(currentBinaryDir, "0.0.0-old");
    // Mark the original install with a sentinel so we can prove the swap
    // actually replaced its contents.
    await writeFile(join(currentBinaryDir, "OLD_MARKER"), "old\n");

    // Pre-write evidence as if an "old" supervisor were running so the
    // post-upgrade readSupervisorVersionEvidence has something to find.
    // (The smoke does not start a real supervisor; the injected
    // spawnFreshSupervisor stub rewrites the evidence to mimic the
    // new supervisor's startup write.)
    await mkdir(computerDir(home), { recursive: true });

    let spawnCalls = 0;
    const report = await runUpgradeInstallSmoke(
      home,
      {
        packageTarball: tarballPath,
        targetVersion,
        fromVersion: "0.0.0-old",
        currentBinaryDir,
      },
      {
        // Stand in for the production `spawnDetachedSupervisor`: write
        // both the pidfile (so `defaultHealthCheck`'s kill(0) probe
        // succeeds against THIS test process) and the version-evidence
        // file the way a real new supervisor would on startup.
        spawnFreshSupervisor: async (h) => {
          spawnCalls += 1;
          await writeFile(supervisorPidPath(h), String(process.pid), { mode: 0o600 });
          await writeFile(
            supervisorVersionPath(h),
            JSON.stringify({
              version: targetVersion,
              installRoot: currentBinaryDir,
              pid: process.pid,
              writtenAt: new Date().toISOString(),
            }) + "\n",
          );
        },
      },
    );

    assert.equal(report.outcome.ok, true, `upgrade should succeed: ${JSON.stringify(report.outcome)}`);
    assert.equal(report.outcome.phase, "cleanup");

    // The currentBinaryDir contents should now be the tarball's contents,
    // not the original sentinel.
    const swappedPkg = JSON.parse(
      await readFile(join(currentBinaryDir, "package.json"), "utf8"),
    ) as { version?: string };
    assert.equal(swappedPkg.version, targetVersion);
    // The original OLD_MARKER from before swap should be gone.
    await assert.rejects(stat(join(currentBinaryDir, "OLD_MARKER")));

    // Active-version evidence reflects the new version.
    assert.ok(report.activeVersion, "expected supervisor-version.json to be present");
    assert.equal(report.activeVersion?.version, targetVersion);
    assert.equal(report.activeVersion?.installRoot, currentBinaryDir);
    assert.equal(spawnCalls, 1);
  });
});

test("runUpgradeInstallSmokeCli: writes a single JSON line on success", async () => {
  await withHome(async (home) => {
    const targetVersion = "0.99.1-smoke";
    const tarballPath = await makeSyntheticTarball(
      home,
      `slock-ai-computer-${targetVersion}.tgz`,
      targetVersion,
    );

    const currentBinaryDir = join(home, "node_modules", "@slock-ai", "computer");
    await seedPreflightLayout(currentBinaryDir, "0.0.0-old");
    await mkdir(computerDir(home), { recursive: true });

    let buf = "";
    await runUpgradeInstallSmokeCli(
      home,
      {
        packageTarball: tarballPath,
        targetVersion,
        fromVersion: "0.0.0-old",
        currentBinaryDir,
      },
      (s) => {
        buf += s;
      },
    );

    // One newline-terminated JSON record.
    const lines = buf.trim().split("\n").filter((l) => l.length > 0);
    assert.equal(lines.length, 1);
    const parsed = JSON.parse(lines[0]) as {
      outcome: { ok?: boolean; phase?: string };
      activeVersion: unknown;
    };
    // No spawn was injected for the CLI test; runUpgrade will try the
    // production spawnDetachedSupervisor and the smoke proceeds through
    // restart phase or fails on it. The CLI must produce a JSON record
    // either way; we only assert structural shape, not outcome.
    assert.equal(typeof parsed.outcome.ok, "boolean");
    assert.equal(typeof parsed.outcome.phase, "string");
  });
});

test("runUpgradeInstallSmokeCli: emits JSON on harness exception (bad tarball)", async () => {
  await withHome(async (home) => {
    let buf = "";
    await runUpgradeInstallSmokeCli(
      home,
      {
        packageTarball: join(home, "missing.tgz"),
        targetVersion: "0.99.0",
        fromVersion: "0.0.0",
        currentBinaryDir: join(home, "current"),
      },
      (s) => {
        buf += s;
      },
    );
    const parsed = JSON.parse(buf.trim()) as { outcome: { ok: boolean; reason?: string } };
    assert.equal(parsed.outcome.ok, false);
    assert.match(parsed.outcome.reason ?? "", /harness_exception/);
  });
});

// --- supervisor-version evidence reader (lenient-read invariant) ---

test("readSupervisorVersionEvidence: returns null when file missing", async () => {
  await withHome(async (home) => {
    const got = await readSupervisorVersionEvidence(home);
    assert.equal(got, null);
  });
});

test("readSupervisorVersionEvidence: returns null when JSON is malformed", async () => {
  await withHome(async (home) => {
    await mkdir(computerDir(home), { recursive: true });
    await writeFile(supervisorVersionPath(home), "{ not json");
    const got = await readSupervisorVersionEvidence(home);
    assert.equal(got, null);
  });
});

test("readSupervisorVersionEvidence: returns null when shape is wrong (missing required fields)", async () => {
  await withHome(async (home) => {
    await mkdir(computerDir(home), { recursive: true });
    // version may be null, but pid / installRoot / writtenAt are required.
    await writeFile(
      supervisorVersionPath(home),
      JSON.stringify({ version: "0.1.0" }),
    );
    const got = await readSupervisorVersionEvidence(home);
    assert.equal(got, null);
  });
});

test("readSupervisorVersionEvidence: parses a well-formed evidence file", async () => {
  await withHome(async (home) => {
    await mkdir(computerDir(home), { recursive: true });
    const payload = {
      version: "1.2.3",
      installRoot: "/opt/slock-computer",
      pid: 99,
      writtenAt: "2026-05-21T12:00:00.000Z",
    };
    await writeFile(supervisorVersionPath(home), JSON.stringify(payload));
    const got = await readSupervisorVersionEvidence(home);
    assert.deepEqual(got, payload);
  });
});

test("readSupervisorVersionEvidence: accepts version=null (dev mode)", async () => {
  await withHome(async (home) => {
    await mkdir(computerDir(home), { recursive: true });
    const payload = {
      version: null,
      installRoot: "/tmp/dev-install",
      pid: 12345,
      writtenAt: "2026-05-21T12:00:00.000Z",
    };
    await writeFile(supervisorVersionPath(home), JSON.stringify(payload));
    const got = await readSupervisorVersionEvidence(home);
    assert.deepEqual(got, payload);
  });
});
