import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

import {
  preflightDepDriftCheck,
  DAEMON_PACKAGE_NAME,
  type PreflightDeps,
  type TargetPackageJsonShape,
} from "./preflightDepDrift.js";

// PR-E 18/n unit tests for the dependency-drift preflight.
// Three fixture groups, matching Jianwei's gate breakdown (msg=18117731):
//   A. happy path  — current/target specs equal AND installed satisfies
//   B. spec drift  — currentSpec !== targetSpec (any difference)
//   C. unsatisfied — specs agree, but installed version is out of range
//   D. unsafe spec — workspace:/file:/git: etc; production rejects,
//                    harness (allowUnsafeSpec) accepts
// Plus read_failed coverage (missing package.json, missing daemon entry,
// missing installed daemon). Production default deps are exercised in a
// dedicated "real fs" group at the bottom.

async function withHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = await mkdtemp(join(tmpdir(), "slock-pr-e-preflight-"));
  try {
    return await fn(home);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
}

function stubDeps(
  target: TargetPackageJsonShape,
  current: TargetPackageJsonShape,
  installed: string | null,
  opts: Partial<PreflightDeps> = {},
): PreflightDeps {
  return {
    readTarballPackageJson: async () => target,
    readCurrentPackageJson: async () => current,
    readInstalledDaemonVersion: async () => installed,
    ...opts,
  };
}

// --- Group A: happy path -----------------------------------------------------

test("preflight (A): current/target spec equal + installed satisfies → ok", async () => {
  const r = await preflightDepDriftCheck(
    "/does-not-matter",
    "/does-not-matter.tgz",
    stubDeps(
      { dependencies: { [DAEMON_PACKAGE_NAME]: "^0.41.0" } },
      { dependencies: { [DAEMON_PACKAGE_NAME]: "^0.41.0" } },
      "0.41.3",
    ),
  );
  assert.equal(r.ok, true);
  assert.equal(r.reason, undefined);
  assert.equal(r.currentSpec, "^0.41.0");
  assert.equal(r.targetSpec, "^0.41.0");
  assert.equal(r.installedVersion, "0.41.3");
});

test("preflight (A): exact-version spec equal + installed exact → ok", async () => {
  const r = await preflightDepDriftCheck(
    "/x",
    "/x.tgz",
    stubDeps(
      { dependencies: { [DAEMON_PACKAGE_NAME]: "0.41.0" } },
      { dependencies: { [DAEMON_PACKAGE_NAME]: "0.41.0" } },
      "0.41.0",
    ),
  );
  assert.equal(r.ok, true);
});

// --- Group B: spec drift -----------------------------------------------------

test("preflight (B): spec changed minor (^0.41 → ^0.42) → spec_changed", async () => {
  const r = await preflightDepDriftCheck(
    "/x",
    "/x.tgz",
    stubDeps(
      { dependencies: { [DAEMON_PACKAGE_NAME]: "^0.42.0" } },
      { dependencies: { [DAEMON_PACKAGE_NAME]: "^0.41.0" } },
      "0.41.3",
    ),
  );
  assert.equal(r.ok, false);
  assert.equal(r.reason, "spec_changed");
  assert.equal(r.currentSpec, "^0.41.0");
  assert.equal(r.targetSpec, "^0.42.0");
  assert.match(r.detail ?? "", /dependency spec changed/);
});

test("preflight (B): spec changed even though installed would satisfy both → spec_changed", async () => {
  // Demonstrates that leg 1 (string equality) is stricter than "ranges
  // overlap" — by design, per Jianwei.
  const r = await preflightDepDriftCheck(
    "/x",
    "/x.tgz",
    stubDeps(
      { dependencies: { [DAEMON_PACKAGE_NAME]: ">=0.41.0 <0.43.0" } },
      { dependencies: { [DAEMON_PACKAGE_NAME]: "^0.41.0" } },
      "0.41.5",
    ),
  );
  assert.equal(r.ok, false);
  assert.equal(r.reason, "spec_changed");
});

// --- Group C: installed unsatisfied ------------------------------------------

test("preflight (C): specs agree but installed too old → installed_unsatisfied", async () => {
  const r = await preflightDepDriftCheck(
    "/x",
    "/x.tgz",
    stubDeps(
      { dependencies: { [DAEMON_PACKAGE_NAME]: "^0.42.0" } },
      { dependencies: { [DAEMON_PACKAGE_NAME]: "^0.42.0" } },
      "0.41.5",
    ),
  );
  assert.equal(r.ok, false);
  assert.equal(r.reason, "installed_unsatisfied");
  assert.equal(r.installedVersion, "0.41.5");
  assert.equal(r.targetSpec, "^0.42.0");
  assert.match(r.detail ?? "", /does not satisfy/);
});

test("preflight (C): exact spec, installed differs → installed_unsatisfied", async () => {
  const r = await preflightDepDriftCheck(
    "/x",
    "/x.tgz",
    stubDeps(
      { dependencies: { [DAEMON_PACKAGE_NAME]: "0.41.0" } },
      { dependencies: { [DAEMON_PACKAGE_NAME]: "0.41.0" } },
      "0.41.1",
    ),
  );
  assert.equal(r.ok, false);
  assert.equal(r.reason, "installed_unsatisfied");
});

// --- Group D: unsafe spec ----------------------------------------------------

for (const spec of [
  "workspace:*",
  "workspace:^0.41.0",
  "file:../daemon",
  "link:../daemon",
  "git+https://github.com/slock-ai/daemon.git",
  "git:somewhere",
  "http://example.com/daemon-0.41.0.tgz",
  "https://example.com/daemon-0.41.0.tgz",
  "npm:other-daemon@^0.41.0",
  "./local-daemon",
  "../local-daemon",
  "/abs/path/daemon",
  "*",
  "latest",
  "",
  "user/repo",
  "user/repo#branch",
  "github:user/repo",
]) {
  test(`preflight (D): unsafe spec "${spec}" rejected in production mode`, async () => {
    const r = await preflightDepDriftCheck(
      "/x",
      "/x.tgz",
      stubDeps(
        { dependencies: { [DAEMON_PACKAGE_NAME]: spec } },
        { dependencies: { [DAEMON_PACKAGE_NAME]: spec } },
        "0.41.0",
      ),
    );
    if (spec.length === 0) {
      // Empty spec also triggers read_failed at the spec-present gate
      // before isUnsafeSpec runs.
      assert.equal(r.ok, false);
      assert.ok(r.reason === "unsafe_spec" || r.reason === "read_failed", `got ${r.reason}`);
    } else {
      assert.equal(r.ok, false);
      assert.equal(r.reason, "unsafe_spec");
    }
  });
}

test("preflight (D): unsafe spec on target side only (current OK) → unsafe_spec", async () => {
  const r = await preflightDepDriftCheck(
    "/x",
    "/x.tgz",
    stubDeps(
      { dependencies: { [DAEMON_PACKAGE_NAME]: "workspace:*" } },
      { dependencies: { [DAEMON_PACKAGE_NAME]: "^0.41.0" } },
      "0.41.3",
    ),
  );
  assert.equal(r.ok, false);
  assert.equal(r.reason, "unsafe_spec");
});

test("preflight (D): unsafe spec accepted under allowUnsafeSpec (harness opt-in)", async () => {
  const r = await preflightDepDriftCheck(
    "/x",
    "/x.tgz",
    stubDeps(
      { dependencies: { [DAEMON_PACKAGE_NAME]: "workspace:*" } },
      { dependencies: { [DAEMON_PACKAGE_NAME]: "workspace:*" } },
      "0.0.0-harness",
      { allowUnsafeSpec: true, semverSatisfies: () => true },
    ),
  );
  assert.equal(r.ok, true);
});

test("preflight (D): allowUnsafeSpec does NOT bypass spec-equality gate", async () => {
  const r = await preflightDepDriftCheck(
    "/x",
    "/x.tgz",
    stubDeps(
      { dependencies: { [DAEMON_PACKAGE_NAME]: "workspace:*" } },
      { dependencies: { [DAEMON_PACKAGE_NAME]: "workspace:^0.41.0" } },
      "0.41.3",
      { allowUnsafeSpec: true, semverSatisfies: () => true },
    ),
  );
  assert.equal(r.ok, false);
  assert.equal(r.reason, "spec_changed");
});

// --- read_failed paths -------------------------------------------------------

test("preflight (read_failed): target tarball has no daemon dependency entry", async () => {
  const r = await preflightDepDriftCheck(
    "/x",
    "/x.tgz",
    stubDeps(
      { dependencies: {} },
      { dependencies: { [DAEMON_PACKAGE_NAME]: "^0.41.0" } },
      "0.41.0",
    ),
  );
  assert.equal(r.ok, false);
  assert.equal(r.reason, "read_failed");
  assert.match(r.detail ?? "", /target tarball.*no.*dependency/);
});

test("preflight (read_failed): current binary has no daemon dependency entry", async () => {
  const r = await preflightDepDriftCheck(
    "/x",
    "/x.tgz",
    stubDeps(
      { dependencies: { [DAEMON_PACKAGE_NAME]: "^0.41.0" } },
      { dependencies: {} },
      "0.41.0",
    ),
  );
  assert.equal(r.ok, false);
  assert.equal(r.reason, "read_failed");
  assert.match(r.detail ?? "", /current binary.*no.*dependency/);
});

test("preflight (read_failed): installed daemon version null", async () => {
  const r = await preflightDepDriftCheck(
    "/x",
    "/x.tgz",
    stubDeps(
      { dependencies: { [DAEMON_PACKAGE_NAME]: "^0.41.0" } },
      { dependencies: { [DAEMON_PACKAGE_NAME]: "^0.41.0" } },
      null,
    ),
  );
  assert.equal(r.ok, false);
  assert.equal(r.reason, "read_failed");
  assert.match(r.detail ?? "", /not installed/);
});

test("preflight (read_failed): readTarballPackageJson throws → read_failed", async () => {
  const r = await preflightDepDriftCheck("/x", "/x.tgz", {
    readTarballPackageJson: async () => {
      throw new Error("tar -xzOf exited 2: not in gzip format");
    },
    readCurrentPackageJson: async () => ({
      dependencies: { [DAEMON_PACKAGE_NAME]: "^0.41.0" },
    }),
    readInstalledDaemonVersion: async () => "0.41.0",
  });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "read_failed");
  assert.match(r.detail ?? "", /cannot read target tarball/);
});

test("preflight (read_failed): readCurrentPackageJson throws → read_failed", async () => {
  const r = await preflightDepDriftCheck("/x", "/x.tgz", {
    readTarballPackageJson: async () => ({
      dependencies: { [DAEMON_PACKAGE_NAME]: "^0.41.0" },
    }),
    readCurrentPackageJson: async () => {
      throw new Error("ENOENT");
    },
    readInstalledDaemonVersion: async () => "0.41.0",
  });
  assert.equal(r.ok, false);
  assert.equal(r.reason, "read_failed");
  assert.match(r.detail ?? "", /cannot read current binary/);
});

// --- production defaults exercise (real fs, real tar) ------------------------
//
// PR-E 19/n (Dayu blocker msg=e25c0cd6): cover BOTH real-world install
// layouts via the production `createRequire` resolver:
//   - nested: `<scope>/computer/node_modules/@slock-ai/daemon/`
//     (npm install -g default)
//   - sibling-hoisted: `<root>/node_modules/@slock-ai/{computer,daemon}/`
//     (pnpm / disposable QA fixture)

async function buildTarball(home: string, depSpec: string): Promise<string> {
  const stage = join(home, "stage");
  const pkgDir = join(stage, "package");
  await mkdir(pkgDir, { recursive: true });
  await writeFile(
    join(pkgDir, "package.json"),
    JSON.stringify(
      {
        name: "@slock-ai/computer",
        version: "0.99.0",
        dependencies: { [DAEMON_PACKAGE_NAME]: depSpec },
      },
      null,
      2,
    ),
  );
  const tarballPath = join(home, "test.tgz");
  const r = spawnSync("tar", ["-czf", tarballPath, "-C", stage, "package"], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  assert.equal(r.status, 0, "tar must succeed for the test setup");
  return tarballPath;
}

async function writeComputerPackageJson(dir: string, depSpec: string): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(
    join(dir, "package.json"),
    JSON.stringify(
      {
        name: "@slock-ai/computer",
        version: "0.98.0",
        dependencies: { [DAEMON_PACKAGE_NAME]: depSpec },
      },
      null,
      2,
    ),
  );
}

/**
 * Build a synthetic `@slock-ai/daemon` install. Mirrors the published
 * shape just enough for Node's resolver to find `/core`:
 *
 *   <dir>/package.json   — declares `exports` for `./core` (and ONLY
 *                          `./core`, mirroring the real package — so
 *                          tests catch any regression that depends on
 *                          `./package.json` being exported, per the
 *                          PR-E 20/n Jianwei blocker msg=fd238c00).
 *   <dir>/dist/core.js   — empty stub at the resolver target.
 *
 * If `exportsOverride` is provided, it replaces the default exports
 * field — used by the regression fixture that proves the walk-up still
 * finds the daemon version even when `package.json` is NOT exported.
 */
async function writeDaemonPackageJson(
  dir: string,
  version: string,
  exportsOverride?: Record<string, unknown>,
): Promise<void> {
  await mkdir(dir, { recursive: true });
  const exportsField = exportsOverride ?? {
    "./core": { import: "./dist/core.js" },
  };
  await writeFile(
    join(dir, "package.json"),
    JSON.stringify(
      { name: DAEMON_PACKAGE_NAME, version, type: "module", exports: exportsField },
      null,
      2,
    ),
  );
  await mkdir(join(dir, "dist"), { recursive: true });
  await writeFile(join(dir, "dist", "core.js"), "// stub for resolver tests\n");
}

test("preflight (default deps): nested layout (npm global) → ok", async () => {
  await withHome(async (home) => {
    const tarballPath = await buildTarball(home, "^0.41.0");
    // npm install -g layout:
    //   <prefix>/lib/node_modules/@slock-ai/computer/                ← currentBinaryDir
    //   <prefix>/lib/node_modules/@slock-ai/computer/node_modules/@slock-ai/daemon/
    const currentBinaryDir = join(home, "prefix", "lib", "node_modules", "@slock-ai", "computer");
    await writeComputerPackageJson(currentBinaryDir, "^0.41.0");
    await writeDaemonPackageJson(
      join(currentBinaryDir, "node_modules", DAEMON_PACKAGE_NAME),
      "0.41.5",
    );

    const result = await preflightDepDriftCheck(currentBinaryDir, tarballPath);
    assert.equal(result.ok, true, `expected ok, got ${JSON.stringify(result)}`);
    assert.equal(result.installedVersion, "0.41.5");
  });
});

test("preflight (default deps): sibling-hoisted layout (pnpm / disposable) → ok", async () => {
  await withHome(async (home) => {
    const tarballPath = await buildTarball(home, "^0.41.0");
    // pnpm / project hoist layout:
    //   <root>/node_modules/@slock-ai/computer/    ← currentBinaryDir
    //   <root>/node_modules/@slock-ai/daemon/
    const nodeModules = join(home, "root", "node_modules");
    const currentBinaryDir = join(nodeModules, "@slock-ai", "computer");
    await writeComputerPackageJson(currentBinaryDir, "^0.41.0");
    await writeDaemonPackageJson(join(nodeModules, "@slock-ai", "daemon"), "0.41.5");

    const result = await preflightDepDriftCheck(currentBinaryDir, tarballPath);
    assert.equal(result.ok, true, `expected ok, got ${JSON.stringify(result)}`);
    assert.equal(result.installedVersion, "0.41.5");
  });
});

test("preflight (default deps): tarball not a gzip → read_failed", async () => {
  await withHome(async (home) => {
    const tarballPath = join(home, "bad.tgz");
    await writeFile(tarballPath, "not a real tarball");
    const nodeModules = join(home, "root", "node_modules");
    const currentBinaryDir = join(nodeModules, "@slock-ai", "computer");
    await writeComputerPackageJson(currentBinaryDir, "^0.41.0");
    await writeDaemonPackageJson(join(nodeModules, "@slock-ai", "daemon"), "0.41.5");
    const result = await preflightDepDriftCheck(currentBinaryDir, tarballPath);
    assert.equal(result.ok, false);
    assert.equal(result.reason, "read_failed");
    assert.match(result.detail ?? "", /cannot read target tarball/);
  });
});

test("preflight (default deps): missing daemon (unresolvable) → read_failed (installed=null)", async () => {
  await withHome(async (home) => {
    const tarballPath = await buildTarball(home, "^0.41.0");
    // Computer pkg present, but no daemon anywhere on the resolution path.
    const currentBinaryDir = join(home, "root", "node_modules", "@slock-ai", "computer");
    await writeComputerPackageJson(currentBinaryDir, "^0.41.0");
    const result = await preflightDepDriftCheck(currentBinaryDir, tarballPath);
    assert.equal(result.ok, false);
    assert.equal(result.reason, "read_failed");
    assert.match(result.detail ?? "", /not installed/);
  });
});

test("preflight (default deps): pnpm-style hoist (@slock-ai/daemon in nested node_modules walk) → ok", async () => {
  // pnpm global often produces an additional walk hop:
  //   <root>/lib/node_modules/@slock-ai/computer/                ← currentBinaryDir
  //   <root>/lib/node_modules/@slock-ai/daemon/                  ← resolved via parent node_modules walk
  // `createRequire` will walk up `node_modules` looking for the daemon —
  // covered by the sibling-hoisted case above, but also pinned here at
  // a deeper level to prove the walk traverses multiple parent dirs.
  await withHome(async (home) => {
    const tarballPath = await buildTarball(home, "^0.41.0");
    const deepRoot = join(home, "deep", "nested", "lib", "node_modules");
    const currentBinaryDir = join(deepRoot, "@slock-ai", "computer");
    await writeComputerPackageJson(currentBinaryDir, "^0.41.0");
    await writeDaemonPackageJson(join(deepRoot, "@slock-ai", "daemon"), "0.41.7");

    const result = await preflightDepDriftCheck(currentBinaryDir, tarballPath);
    assert.equal(result.ok, true, `expected ok, got ${JSON.stringify(result)}`);
    assert.equal(result.installedVersion, "0.41.7");
  });
});

test("preflight (default deps): nested layout shadows sibling (Node resolution wins inner-first)", async () => {
  // Sanity: when both layouts exist, Node resolves the nested one first.
  // Prevents accidental regressions if someone "helpfully" reintroduces a
  // sibling-only walk.
  await withHome(async (home) => {
    const tarballPath = await buildTarball(home, "^0.41.0");
    const nodeModules = join(home, "root", "node_modules");
    const currentBinaryDir = join(nodeModules, "@slock-ai", "computer");
    await writeComputerPackageJson(currentBinaryDir, "^0.41.0");
    // Sibling daemon at v0.41.9
    await writeDaemonPackageJson(join(nodeModules, "@slock-ai", "daemon"), "0.41.9");
    // Nested daemon at v0.41.1 — should be picked.
    await writeDaemonPackageJson(
      join(currentBinaryDir, "node_modules", DAEMON_PACKAGE_NAME),
      "0.41.1",
    );

    const result = await preflightDepDriftCheck(currentBinaryDir, tarballPath);
    assert.equal(result.ok, true);
    assert.equal(result.installedVersion, "0.41.1");
  });
});

// PR-E 20/n regression fixture (Jianwei msg=fd238c00 + Dayu msg=0f5f066b
// + Jianwei ack msg=039ab43c): real daemon exports map allows `./core`
// but NOT `./package.json`. The v1 shape of this function
// (`req.resolve("@slock-ai/daemon/package.json")`) crashed with
// `ERR_PACKAGE_PATH_NOT_EXPORTED` on the published package. The fix
// resolves `/core` (the runtime-exported subpath) and walks up to find
// the package root. This fixture explicitly blocks `./package.json`
// from the exports map so a future regression that re-introduces direct
// `package.json` resolution would fail here.
test("preflight (default deps): exports blocks ./package.json AND ./core (real daemon shape) — still resolves via node_modules paths walk", async () => {
  await withHome(async (home) => {
    const tarballPath = await buildTarball(home, "^0.52.0");
    const nodeModules = join(home, "root", "node_modules");
    const currentBinaryDir = join(nodeModules, "@slock-ai", "computer");
    await writeComputerPackageJson(currentBinaryDir, "^0.52.0");
    // PR-E 20/n: mirrors the real published daemon. ONLY `./core` is
    // listed in exports, and it ONLY has the `import` condition.
    // `createRequire().resolve("@slock-ai/daemon/core")` would fail
    // here with ERR_PACKAGE_PATH_NOT_EXPORTED (CJS condition set
    // doesn't match `import`-only); `req.resolve("@slock-ai/daemon/
    // package.json")` would fail for the same reason. The fix uses
    // `resolve.paths` which bypasses exports entirely.
    await writeDaemonPackageJson(
      join(nodeModules, "@slock-ai", "daemon"),
      "0.52.2",
      { "./core": { import: "./dist/core.js" } },
    );

    const result = await preflightDepDriftCheck(currentBinaryDir, tarballPath);
    assert.equal(result.ok, true, `expected ok, got ${JSON.stringify(result)}`);
    assert.equal(result.installedVersion, "0.52.2");
  });
});

test("preflight (default deps): daemon has NO exports map → still resolves via node_modules paths walk", async () => {
  // Defensive: not every daemon shape will have an exports map.
  // `resolve.paths` doesn't depend on one anyway.
  await withHome(async (home) => {
    const tarballPath = await buildTarball(home, "^0.41.0");
    const nodeModules = join(home, "root", "node_modules");
    const currentBinaryDir = join(nodeModules, "@slock-ai", "computer");
    await writeComputerPackageJson(currentBinaryDir, "^0.41.0");
    const daemonDir = join(nodeModules, "@slock-ai", "daemon");
    await mkdir(daemonDir, { recursive: true });
    // No `exports` field, no `main` — purely a directory with
    // `package.json`. `resolve.paths` doesn't care; it just needs the
    // directory at the right node_modules path.
    await writeFile(
      join(daemonDir, "package.json"),
      JSON.stringify({ name: DAEMON_PACKAGE_NAME, version: "0.41.2" }, null, 2),
    );

    const result = await preflightDepDriftCheck(currentBinaryDir, tarballPath);
    assert.equal(result.ok, true, `expected ok, got ${JSON.stringify(result)}`);
    assert.equal(result.installedVersion, "0.41.2");
  });
});

// PR-E 19/n: harness escape hatch (Dayu msg=11f705cc). When the install-
// smoke harness drives unchanged `file:` specs on both sides, leg 1
// (string-equality) passes, but leg 2 (semver satisfaction) has no way
// to reduce the spec to a predicate. `allowUnsafeSpec` must skip leg 2
// in that case. Production never sets the flag → branch is dead on the
// user-facing path.
test("preflight (default deps + allowUnsafeSpec): file: spec unchanged on both sides → ok", async () => {
  await withHome(async (home) => {
    const fileSpec = `file:./slock-ai-daemon-0.52.2.tgz`;
    const tarballPath = await buildTarball(home, fileSpec);
    const nodeModules = join(home, "root", "node_modules");
    const currentBinaryDir = join(nodeModules, "@slock-ai", "computer");
    await writeComputerPackageJson(currentBinaryDir, fileSpec);
    // Installed daemon version is irrelevant under the escape hatch.
    await writeDaemonPackageJson(join(nodeModules, "@slock-ai", "daemon"), "0.0.0-disposable");

    const result = await preflightDepDriftCheck(currentBinaryDir, tarballPath, {
      allowUnsafeSpec: true,
    });
    assert.equal(result.ok, true, `expected ok, got ${JSON.stringify(result)}`);
    assert.equal(result.installedVersion, "0.0.0-disposable");
  });
});

test("preflight (default deps + allowUnsafeSpec): file: spec changed → spec_changed (escape hatch only fires on equality)", async () => {
  await withHome(async (home) => {
    const tarballPath = await buildTarball(home, "file:./slock-ai-daemon-0.52.2.tgz");
    const nodeModules = join(home, "root", "node_modules");
    const currentBinaryDir = join(nodeModules, "@slock-ai", "computer");
    await writeComputerPackageJson(currentBinaryDir, "file:./slock-ai-daemon-0.52.1.tgz");
    await writeDaemonPackageJson(join(nodeModules, "@slock-ai", "daemon"), "0.0.0-disposable");

    const result = await preflightDepDriftCheck(currentBinaryDir, tarballPath, {
      allowUnsafeSpec: true,
    });
    assert.equal(result.ok, false);
    assert.equal(result.reason, "spec_changed");
  });
});

// --- minimal semver satisfier smoke (covered indirectly above; explicit here) ---

test("preflight (semver): ^0.41.0 satisfied by 0.41.0, 0.41.3, NOT 0.42.0 nor 0.40.9", async () => {
  const mk = (installed: string) =>
    preflightDepDriftCheck(
      "/x",
      "/x.tgz",
      stubDeps(
        { dependencies: { [DAEMON_PACKAGE_NAME]: "^0.41.0" } },
        { dependencies: { [DAEMON_PACKAGE_NAME]: "^0.41.0" } },
        installed,
      ),
    );
  assert.equal((await mk("0.41.0")).ok, true);
  assert.equal((await mk("0.41.3")).ok, true);
  assert.equal((await mk("0.42.0")).ok, false);
  assert.equal((await mk("0.40.9")).ok, false);
});

test("preflight (semver): ~0.41.0 allows 0.41.x, not 0.42.0", async () => {
  const mk = (installed: string) =>
    preflightDepDriftCheck(
      "/x",
      "/x.tgz",
      stubDeps(
        { dependencies: { [DAEMON_PACKAGE_NAME]: "~0.41.0" } },
        { dependencies: { [DAEMON_PACKAGE_NAME]: "~0.41.0" } },
        installed,
      ),
    );
  assert.equal((await mk("0.41.5")).ok, true);
  assert.equal((await mk("0.42.0")).ok, false);
});

test("preflight (semver): >=A <B compound range", async () => {
  const mk = (installed: string) =>
    preflightDepDriftCheck(
      "/x",
      "/x.tgz",
      stubDeps(
        { dependencies: { [DAEMON_PACKAGE_NAME]: ">=0.41.0 <0.43.0" } },
        { dependencies: { [DAEMON_PACKAGE_NAME]: ">=0.41.0 <0.43.0" } },
        installed,
      ),
    );
  assert.equal((await mk("0.41.0")).ok, true);
  assert.equal((await mk("0.42.9")).ok, true);
  assert.equal((await mk("0.43.0")).ok, false);
  assert.equal((await mk("0.40.9")).ok, false);
});

test("preflight (semver): OR-list ^0.41.0 || ^0.42.0", async () => {
  const mk = (installed: string) =>
    preflightDepDriftCheck(
      "/x",
      "/x.tgz",
      stubDeps(
        { dependencies: { [DAEMON_PACKAGE_NAME]: "^0.41.0 || ^0.42.0" } },
        { dependencies: { [DAEMON_PACKAGE_NAME]: "^0.41.0 || ^0.42.0" } },
        installed,
      ),
    );
  assert.equal((await mk("0.41.3")).ok, true);
  assert.equal((await mk("0.42.1")).ok, true);
  assert.equal((await mk("0.43.0")).ok, false);
});
