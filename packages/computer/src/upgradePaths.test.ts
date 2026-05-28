import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import {
  computerDir,
  upgradeStagingDir,
  upgradeSnapshotPath,
  upgradeLogPath,
  upgradeInstallLogPath,
} from "./paths.js";

// v8.3 §4.4 (10) regression guard — upgrade lifecycle paths must derive
// from paths.ts::* helpers. Asserts each helper produces the path shape
// the v8.3 contract names, and that all upgrade-related files live
// under computerDir() (Computer-global scope, not per-server).

const HOME = "/tmp/slock-test-home";

test("upgradeStagingDir: <slockHome>/computer/upgrade-staging/<version>/", () => {
  const got = upgradeStagingDir(HOME, "0.0.5");
  assert.equal(got, path.join(HOME, "computer", "upgrade-staging", "0.0.5"));
});

test("upgradeStagingDir: lives under computerDir() (Computer-global, not per-server)", () => {
  const got = upgradeStagingDir(HOME, "0.0.5");
  assert.ok(got.startsWith(computerDir(HOME) + path.sep));
});

test("upgradeStagingDir: distinct versions land in distinct dirs", () => {
  const a = upgradeStagingDir(HOME, "0.0.5");
  const b = upgradeStagingDir(HOME, "0.0.6-alpha.1");
  assert.notEqual(a, b);
});

test("upgradeSnapshotPath: <slockHome>/computer/upgrade-snapshot.json", () => {
  const got = upgradeSnapshotPath(HOME);
  assert.equal(got, path.join(HOME, "computer", "upgrade-snapshot.json"));
});

test("upgradeSnapshotPath: lives under computerDir()", () => {
  const got = upgradeSnapshotPath(HOME);
  assert.ok(got.startsWith(computerDir(HOME) + path.sep));
});

test("upgradeLogPath: <slockHome>/computer/upgrade.log", () => {
  const got = upgradeLogPath(HOME);
  assert.equal(got, path.join(HOME, "computer", "upgrade.log"));
});

test("upgradeLogPath: lives under computerDir()", () => {
  const got = upgradeLogPath(HOME);
  assert.ok(got.startsWith(computerDir(HOME) + path.sep));
});

test("upgradeInstallLogPath: <slockHome>/computer/upgrade-install-<timestamp>.log", () => {
  const got = upgradeInstallLogPath(HOME, "20260524T1430Z");
  assert.equal(got, path.join(HOME, "computer", "upgrade-install-20260524T1430Z.log"));
});

test("upgradeInstallLogPath: distinct timestamps land in distinct files", () => {
  const a = upgradeInstallLogPath(HOME, "20260524T1430Z");
  const b = upgradeInstallLogPath(HOME, "20260524T1500Z");
  assert.notEqual(a, b);
});

test("upgradeInstallLogPath: lives under computerDir()", () => {
  const got = upgradeInstallLogPath(HOME, "20260524T1430Z");
  assert.ok(got.startsWith(computerDir(HOME) + path.sep));
});

// All 4 helpers respect SLOCK_HOME override — the resolveSlockHome()
// function determines the base, so callers pass an already-resolved
// slockHome and the helpers just join() from there. This guard ensures
// no helper accidentally hard-codes ~/.slock or sniffs env vars.
test("upgrade paths respect explicit slockHome (no env sniff)", () => {
  const customHome = "/var/lib/slock-test";
  assert.equal(
    upgradeStagingDir(customHome, "1.0.0"),
    path.join(customHome, "computer", "upgrade-staging", "1.0.0"),
  );
  assert.equal(
    upgradeSnapshotPath(customHome),
    path.join(customHome, "computer", "upgrade-snapshot.json"),
  );
  assert.equal(
    upgradeLogPath(customHome),
    path.join(customHome, "computer", "upgrade.log"),
  );
  assert.equal(
    upgradeInstallLogPath(customHome, "T1"),
    path.join(customHome, "computer", "upgrade-install-T1.log"),
  );
});

// v8.3 §4.4 (10) + Jianwei QA gate (msg=a9805dc5 item 5): upgrade.ts
// must not contain inline path string literals for upgrade lifecycle
// artifacts — all such paths must be derived through paths.ts helpers.
// This guards against drift where a future code change re-introduces
// `~/.slock/computer/...` literals bypassing the paths.ts contract.
test("upgrade.ts contains no inline path literals for upgrade lifecycle artifacts (regression guard)", async () => {
  const { readFile } = await import("node:fs/promises");
  const upgradeSource = await readFile(
    new URL("./upgrade.ts", import.meta.url),
    "utf8",
  );

  // Strip header doc-comment block (lines 1-25 contain a documentation
  // overview that legitimately references the paths by name in prose;
  // those aren't runtime path constructions).
  const codeSection = upgradeSource.split("\n").slice(25).join("\n");

  // Banned patterns: literal segments that would construct an upgrade
  // lifecycle path inline. Each must be derived via paths.ts::* helper.
  const bannedPatterns: { pattern: RegExp; helper: string }[] = [
    {
      pattern: /"upgrade-staging"/,
      helper: "upgradeStagingDir(slockHome, version)",
    },
    {
      pattern: /"upgrade-snapshot\.json"/,
      helper: "upgradeSnapshotPath(slockHome)",
    },
    {
      pattern: /"upgrade\.log"/,
      helper: "upgradeLogPath(slockHome)",
    },
    {
      pattern: /"upgrade-install-/,
      helper: "upgradeInstallLogPath(slockHome, timestamp)",
    },
  ];

  for (const { pattern, helper } of bannedPatterns) {
    assert.ok(
      !pattern.test(codeSection),
      `upgrade.ts contains inline path literal matching ${pattern} — use paths.ts::${helper} instead`,
    );
  }
});
