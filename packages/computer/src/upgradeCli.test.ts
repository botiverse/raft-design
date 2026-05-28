import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { Command } from "commander";

import { runUpgradeCli, isEphemeralNpxContext } from "./upgradeCli.js";
import { upgradeLogPath } from "./paths.js";
import { writeChannel } from "./channel.js";
import { CliExit } from "./output.js";
import { upgradeStagingDir } from "./upgrade.js";

// PR-E §2.5 regression guard — `slock-computer upgrade` CLI.

async function withHome<T>(fn: (home: string) => Promise<T>): Promise<T> {
  const home = await mkdtemp(join(tmpdir(), "slock-pr-e-upgradecli-"));
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
  const oo = process.stdout.write.bind(process.stdout);
  const oe = process.stderr.write.bind(process.stderr);
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

// --- channel + version resolution ---

// --- §2.5 CLI parser regression: --target-version NOT --version ---

// Commander treats `--version` as the root program version flag when the
// program declares `.version(...)`. A subcommand `--version` is silently
// shadowed: the program prints "0.0.1" and exits 0 before the subcommand
// handler runs. This was a real PR-E blocker (Jianwei msg=0e58c34f).
// These tests lock in the rename to `--target-version`.

test("commander parser: subcommand --target-version reaches action handler with the value", async () => {
  const program = new Command();
  program.name("slock-computer").version("0.0.1");
  let received: string | undefined;
  program
    .command("upgrade")
    .option("--target-version <semver>", "explicit target version")
    .action((opts: { targetVersion?: string }) => {
      received = opts.targetVersion;
    });
  await program.parseAsync(["node", "test", "upgrade", "--target-version", "0.99.0"]);
  assert.equal(received, "0.99.0");
});

test("commander parser: bare --version on `upgrade` subcommand is shadowed by root (regression guard)", async () => {
  // This test documents WHY we renamed: with `--version <semver>` as a
  // subcommand option AND `.version("0.0.1")` on the root, Commander
  // intercepts `--version` and exits 0 before the action fires.
  const program = new Command();
  program.exitOverride();
  program.name("slock-computer").version("0.0.1");
  let actionRan = false;
  program
    .command("upgrade")
    .option("--version <semver>", "the shadowed name")
    .action(() => {
      actionRan = true;
    });
  // Capture output so the version print doesn't pollute test stdout.
  const oo = process.stdout.write.bind(process.stdout);
  process.stdout.write = (() => true) as typeof process.stdout.write;
  try {
    await assert.rejects(() =>
      program.parseAsync(["node", "test", "upgrade", "--version", "0.99.0"]),
    );
  } finally {
    process.stdout.write = oo;
  }
  assert.equal(actionRan, false, "root --version handler ran first; subcommand action never fired");
});

test("runUpgradeCli: --target-version invalid → UPGRADE_VERSION_INVALID + CliExit", async () => {
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await assert.rejects(
        () =>
          runUpgradeCli(
            home,
            { targetVersion: "not-a-semver" },
            { currentVersion: async () => "0.52.2", currentBinaryDir: () => home },
          ),
        (e) => e instanceof CliExit && e.exitCode === 1,
      );
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /UPGRADE_VERSION_INVALID/);
  });
});

test("runUpgradeCli: --channel invalid → CHANNEL_INVALID + CliExit", async () => {
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await assert.rejects(
        () =>
          runUpgradeCli(
            home,
            { channel: "staging" },
            { currentVersion: async () => "0.52.2", currentBinaryDir: () => home },
          ),
        (e) => e instanceof CliExit && e.exitCode === 1,
      );
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /CHANNEL_INVALID/);
  });
});

test("runUpgradeCli: pinned channel resolves to literal version (no registry round-trip)", async () => {
  await withHome(async (home) => {
    await writeChannel(home, "pinned:0.99.0");
    let runCalledWith: { target?: string; channel?: string } = {};
    const cap = captureOut();
    try {
      await runUpgradeCli(
        home,
        {},
        {
          currentVersion: async () => "0.52.2",
          currentBinaryDir: () => home,
          fetchDistTags: async () => {
            throw new Error("should not be called for pinned");
          },
          runUpgradeFn: async (_home, opts) => {
            runCalledWith = { target: opts.targetVersion, channel: opts.channel };
            return { ok: true, phase: "cleanup" };
          },
        },
      );
    } finally {
      cap.restore();
    }
    assert.equal(runCalledWith.target, "0.99.0");
    assert.equal(runCalledWith.channel, "pinned:0.99.0");
  });
});

test("runUpgradeCli: latest channel → dist-tags.latest fetched", async () => {
  await withHome(async (home) => {
    let runCalledWith: { target?: string } = {};
    const cap = captureOut();
    try {
      await runUpgradeCli(
        home,
        {},
        {
          currentVersion: async () => "0.52.2",
          currentBinaryDir: () => home,
          fetchDistTags: async () => ({ latest: "0.60.0", alpha: "0.61.0-alpha.1" }),
          runUpgradeFn: async (_home, opts) => {
            runCalledWith = { target: opts.targetVersion };
            return { ok: true, phase: "cleanup" };
          },
        },
      );
    } finally {
      cap.restore();
    }
    assert.equal(runCalledWith.target, "0.60.0");
  });
});

test("runUpgradeCli: alpha channel → dist-tags.alpha fetched", async () => {
  await withHome(async (home) => {
    await writeChannel(home, "alpha");
    let runCalledWith: { target?: string } = {};
    const cap = captureOut();
    try {
      await runUpgradeCli(
        home,
        {},
        {
          currentVersion: async () => "0.52.2",
          currentBinaryDir: () => home,
          fetchDistTags: async () => ({ latest: "0.60.0", alpha: "0.61.0-alpha.1" }),
          runUpgradeFn: async (_home, opts) => {
            runCalledWith = { target: opts.targetVersion };
            return { ok: true, phase: "cleanup" };
          },
        },
      );
    } finally {
      cap.restore();
    }
    assert.equal(runCalledWith.target, "0.61.0-alpha.1");
  });
});

test("runUpgradeCli: registry unreachable → UPGRADE_VERSION_RESOLVE_FAILED", async () => {
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await assert.rejects(
        () =>
          runUpgradeCli(
            home,
            {},
            {
              currentVersion: async () => "0.52.2",
              currentBinaryDir: () => home,
              fetchDistTags: async () => null,
            },
          ),
        (e) => e instanceof CliExit && e.exitCode === 1,
      );
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /UPGRADE_VERSION_RESOLVE_FAILED/);
  });
});

test("runUpgradeCli: channel has no published dist-tag → UPGRADE_VERSION_RESOLVE_FAILED", async () => {
  await withHome(async (home) => {
    await writeChannel(home, "alpha");
    const cap = captureOut();
    try {
      await assert.rejects(
        () =>
          runUpgradeCli(
            home,
            {},
            {
              currentVersion: async () => "0.52.2",
              currentBinaryDir: () => home,
              fetchDistTags: async () => ({ latest: "0.60.0" }), // no `alpha`
            },
          ),
        (e) => e instanceof CliExit && e.exitCode === 1,
      );
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /UPGRADE_VERSION_RESOLVE_FAILED/);
  });
});

test("runUpgradeCli: already-at target → UPGRADE_NO_TARGET audit entry + exit 0 (v8.3.3 Slice 2)", async () => {
  // v8.3.3 §4.4 (6) Slice 2: already-at-version no longer silent.
  // Emits an audit entry with `outcome: "err"`, `errorCode: "UPGRADE_NO_TARGET"`,
  // `fromBundle === toBundle`. Unique closed-set code that exits 0
  // (steady-state condition, not attempt failure).
  await withHome(async (home) => {
    let called = false;
    const cap = captureOut();
    try {
      await runUpgradeCli(
        home,
        { targetVersion: "0.52.2" },
        {
          currentVersion: async () => "0.52.2",
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
    assert.equal(called, false, "orchestrator must not run on already-at-version path");
    const out = cap.text();
    // Updated wording per Slice 2 byte-pin table: "No upgrade target."
    assert.match(out, /Already at 0\.52\.2/);
    assert.match(out, /No upgrade target/);
    // Regression guard: pre-v8.3.3 wording "Nothing to do" must NOT appear.
    assert.doesNotMatch(out, /Nothing to do/);
    // Audit log entry emitted with NO_TARGET shape.
    const raw = await readFile(upgradeLogPath(home), "utf8");
    const parsed = JSON.parse(raw.trim());
    assert.equal(parsed.outcome, "err");
    assert.equal(parsed.errorCode, "UPGRADE_NO_TARGET");
    assert.deepEqual(parsed.fromBundle, { computerVersion: "0.52.2" });
    assert.deepEqual(parsed.toBundle, { computerVersion: "0.52.2" });
    assert.equal(parsed.trigger, "cli");
  });
});

test("runUpgradeCli: UPGRADE_NO_TARGET path with explicit trigger=web → audit entry carries trigger", async () => {
  // Slice 2 byte-pin: trigger source attribution preserved through the
  // NO_TARGET path so web/tray UIs can disambiguate label rendering.
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await runUpgradeCli(
        home,
        { targetVersion: "0.0.7", trigger: "web" },
        {
          currentVersion: async () => "0.0.7",
          currentBinaryDir: () => home,
        },
      );
    } finally {
      cap.restore();
    }
    const raw = await readFile(upgradeLogPath(home), "utf8");
    const parsed = JSON.parse(raw.trim());
    assert.equal(parsed.outcome, "err");
    assert.equal(parsed.errorCode, "UPGRADE_NO_TARGET");
    assert.equal(parsed.trigger, "web");
  });
});

// --- ephemeral-npx context gate (#wg-slock-computer msg=59670ea6 hotfix) ---
//
// Field bug (tygg 2026-05-24): `npx @slock-ai/computer upgrade` silently
// no-oped the persistent install because the swap target was the npx hash
// dir, not the persistent install root. Fix: gate `runUpgradeCli` early
// when `currentBinaryDir` lives in an npx ephemeral cache; fail-loud with
// an actionable redirect; do NOT emit an audit log entry (Tier-2 stderr
// only per §4.4 dual-tier note v8.3.4 draft).

test("isEphemeralNpxContext: detects POSIX npx hash dir layout", () => {
  assert.equal(
    isEphemeralNpxContext("/home/tygg/.npm/_npx/abc123/node_modules/@slock-ai/computer"),
    true,
  );
});

test("isEphemeralNpxContext: detects Windows npx hash dir layout (backslash separators)", () => {
  assert.equal(
    isEphemeralNpxContext(String.raw`C:\Users\tygg\.npm\_npx\abc123\node_modules\@slock-ai\computer`),
    true,
  );
});

test("isEphemeralNpxContext: persistent install path is not ephemeral (regression guard)", () => {
  assert.equal(
    isEphemeralNpxContext("/opt/slock/computer/0.0.7"),
    false,
  );
  assert.equal(
    isEphemeralNpxContext("/home/tygg/.local/lib/node_modules/@slock-ai/computer"),
    false,
  );
  assert.equal(
    isEphemeralNpxContext("/tmp/scratch/computer-install"),
    false,
  );
});

test("isEphemeralNpxContext: substring match guard — `_npx` only matches a real path segment", () => {
  // A file literally named `prefix_npx_suffix` should NOT trip the gate.
  // The segment check splits on path separators, so substring matches
  // inside a single segment are excluded.
  assert.equal(
    isEphemeralNpxContext("/home/tygg/some_npx_thing/computer"),
    false,
  );
});

test("runUpgradeCli: ephemeral-npx context → fail-loud with UPGRADE_EPHEMERAL_CONTEXT (no orchestrator call, no audit log entry)", async () => {
  await withHome(async (home) => {
    let orchestratorCalled = false;
    const cap = captureOut();
    try {
      await assert.rejects(
        () =>
          runUpgradeCli(
            home,
            {},
            {
              currentVersion: async () => "0.0.7",
              currentBinaryDir: () => "/home/tygg/.npm/_npx/abc123/node_modules/@slock-ai/computer",
              fetchDistTags: async () => ({ latest: "0.0.7" }),
              runUpgradeFn: async () => {
                orchestratorCalled = true;
                return { ok: true, phase: "cleanup" };
              },
            },
          ),
        (e) => e instanceof CliExit && e.exitCode === 1,
      );
    } finally {
      cap.restore();
    }
    // T1: ephemeral detection fired (orchestrator never reached).
    assert.equal(orchestratorCalled, false, "orchestrator must not run in ephemeral npx context");
    const out = cap.text();
    // T2 (simplified per Hao msg=f4d8f9f0 + tygg msg=0a0eb057 narrowed scope):
    // Error includes the closed-set token + actionable redirect pointing
    // at the canonical installed `slock-computer upgrade` + npm install
    // fallback. NO `<persistent-hash>` placeholder, NO `rm -rf` instruction
    // (regression guards below).
    assert.match(out, /UPGRADE_EPHEMERAL_CONTEXT/);
    assert.match(out, /npx ephemeral entrypoint/);
    assert.match(out, /slock-computer upgrade/);
    assert.match(out, /npm i -g @slock-ai\/computer@latest/);
    // Regression guards: the old hash-find + rm-rf instructions must be gone.
    assert.doesNotMatch(out, /persistent-hash/);
    assert.doesNotMatch(out, /rm -rf/);
    // T4: persistent install invariant — no audit log entry emitted
    // (pre-pre-condition reject; the upgrade attempt never happened).
    await assert.rejects(
      () => readFile(upgradeLogPath(home), "utf8"),
      (e) => (e as NodeJS.ErrnoException).code === "ENOENT",
      "audit log file must not exist after ephemeral-npx fail-loud",
    );
  });
});

test("runUpgradeCli: ephemeral-npx gate fires BEFORE 'already at' early return (silent no-op regression guard)", async () => {
  // The field bug was that target===from in an npx hash dir hit the
  // "Already at" silent return path. With the gate, even target===from
  // gets fail-loud in ephemeral context. This test pins that ordering.
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await assert.rejects(
        () =>
          runUpgradeCli(
            home,
            { targetVersion: "0.0.7" },
            {
              currentVersion: async () => "0.0.7", // target === from
              currentBinaryDir: () => "/home/tygg/.npm/_npx/abc123/node_modules/@slock-ai/computer",
            },
          ),
        (e) => e instanceof CliExit && e.exitCode === 1,
      );
    } finally {
      cap.restore();
    }
    const out = cap.text();
    // Must hit ephemeral gate, NOT the "Already at" early return.
    assert.match(out, /UPGRADE_EPHEMERAL_CONTEXT/);
    assert.doesNotMatch(out, /Already at 0\.0\.7/);
  });
});

test("runUpgradeCli: non-ephemeral persistent install path proceeds past gate (T5 positive-path guard)", async () => {
  await withHome(async (home) => {
    let orchestratorCalled = false;
    const cap = captureOut();
    try {
      await runUpgradeCli(
        home,
        {},
        {
          currentVersion: async () => "0.0.6",
          // Persistent install dir — no `_npx` segment.
          currentBinaryDir: () => home,
          fetchDistTags: async () => ({ latest: "0.0.7" }),
          runUpgradeFn: async () => {
            orchestratorCalled = true;
            return { ok: true, phase: "cleanup" };
          },
        },
      );
    } finally {
      cap.restore();
    }
    assert.equal(orchestratorCalled, true, "orchestrator must run when binaryDir is non-ephemeral");
  });
});

// --- dry-run path ---

test("runUpgradeCli: --dry-run stage+verify OK → no swap, staging cleaned", async () => {
  await withHome(async (home) => {
    let stageCalls = 0;
    let verifyCalls = 0;
    let runUpgradeCalls = 0;
    const cap = captureOut();
    try {
      await runUpgradeCli(
        home,
        { dryRun: true, targetVersion: "0.99.0" },
        {
          currentVersion: async () => "0.52.2",
          currentBinaryDir: () => home,
          stagePhaseFn: async (h, v) => {
            stageCalls += 1;
            // Create the staging dir so cleanupStaged has something to remove.
            const dir = upgradeStagingDir(h, v);
            await mkdir(dir, { recursive: true });
            await writeFile(join(dir, "fake.tgz"), "x");
            return { stagedPath: dir, version: v, tarballSha1: "abc123" };
          },
          verifyPhaseFn: async () => {
            verifyCalls += 1;
            return { ok: true, actual: "abc123", advertised: "abc123" };
          },
          runUpgradeFn: async () => {
            runUpgradeCalls += 1;
            return { ok: true, phase: "cleanup" };
          },
        },
      );
    } finally {
      cap.restore();
    }
    assert.equal(stageCalls, 1);
    assert.equal(verifyCalls, 1);
    assert.equal(runUpgradeCalls, 0);
    assert.match(cap.text(), /Dry run OK/);
  });
});

test("runUpgradeCli: --dry-run verify fail → UPGRADE_VERIFY_FAILED", async () => {
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await assert.rejects(
        () =>
          runUpgradeCli(
            home,
            { dryRun: true, targetVersion: "0.99.0" },
            {
              currentVersion: async () => "0.52.2",
              currentBinaryDir: () => home,
              stagePhaseFn: async (h, v) => {
                const dir = upgradeStagingDir(h, v);
                await mkdir(dir, { recursive: true });
                return { stagedPath: dir, version: v, tarballSha1: "abc123" };
              },
              verifyPhaseFn: async () => ({
                ok: false,
                reason: "checksum_mismatch",
                actual: "abc123",
                advertised: "deadbeef",
              }),
            },
          ),
        (e) => e instanceof CliExit && e.exitCode === 1,
      );
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /UPGRADE_VERIFY_FAILED/);
  });
});

// --- full flow + failure mapping ---

test("runUpgradeCli: full flow happy → success message + no error", async () => {
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await runUpgradeCli(
        home,
        { targetVersion: "0.99.0" },
        {
          currentVersion: async () => "0.52.2",
          currentBinaryDir: () => home,
          runUpgradeFn: async () => ({
            ok: true,
            phase: "cleanup",
            restart: { ok: true, healthAfterMs: 42 },
          }),
        },
      );
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /Upgrade 0\.52\.2 → 0\.99\.0 succeeded/);
    assert.match(cap.text(), /health-OK in 42ms/);
  });
});

test("runUpgradeCli: orchestrator restart-fail → UPGRADE_RESTART_FAILED + rolledBack note", async () => {
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await assert.rejects(
        () =>
          runUpgradeCli(
            home,
            { targetVersion: "0.99.0" },
            {
              currentVersion: async () => "0.52.2",
              currentBinaryDir: () => home,
              runUpgradeFn: async () => ({
                ok: false,
                phase: "restart",
                reason: "health_check_timeout",
                rolledBack: true,
              }),
            },
          ),
        (e) => e instanceof CliExit && e.exitCode === 1,
      );
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /UPGRADE_RESTART_FAILED/);
    assert.match(cap.text(), /swap rolled back/);
  });
});

test("runUpgradeCli: orchestrator stage-fail → UPGRADE_NETWORK_FAILED (v8.3.3 closed-set)", async () => {
  // v8.3.3 §4.4 (6) renamed `UPGRADE_DOWNLOAD_FAILED` → `UPGRADE_NETWORK_FAILED`
  // (tarball download is the network class). `mapFailurePhaseToCode` returns
  // the new RFC-locked value.
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await assert.rejects(
        () =>
          runUpgradeCli(
            home,
            { targetVersion: "0.99.0" },
            {
              currentVersion: async () => "0.52.2",
              currentBinaryDir: () => home,
              runUpgradeFn: async () => ({
                ok: false,
                phase: "stage",
                reason: "npm pack failed",
              }),
            },
          ),
        (e) => e instanceof CliExit && e.exitCode === 1 && e.code === "UPGRADE_NETWORK_FAILED",
      );
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /UPGRADE_NETWORK_FAILED/);
    // Regression guard: the pre-v8.3.3 token must not appear.
    assert.doesNotMatch(cap.text(), /UPGRADE_DOWNLOAD_FAILED/);
  });
});

test("runUpgradeCli: orchestrator hydrate-fail → UPGRADE_NETWORK_FAILED (dependency install network class)", async () => {
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await assert.rejects(
        () =>
          runUpgradeCli(
            home,
            { targetVersion: "0.99.0" },
            {
              currentVersion: async () => "0.52.2",
              currentBinaryDir: () => home,
              runUpgradeFn: async () => ({
                ok: false,
                phase: "hydrate",
                reason: "npm install failed for staged package dependencies: exit 1",
              }),
            },
          ),
        (e) => e instanceof CliExit && e.exitCode === 1 && e.code === "UPGRADE_NETWORK_FAILED",
      );
    } finally {
      cap.restore();
    }
    assert.match(cap.text(), /UPGRADE_NETWORK_FAILED/);
    assert.match(cap.text(), /phase=hydrate/);
  });
});

test("runUpgradeCli: --force → drainMode='force' forwarded to runUpgrade", async () => {
  await withHome(async (home) => {
    let seenDrain: string | undefined;
    const cap = captureOut();
    try {
      await runUpgradeCli(
        home,
        { targetVersion: "0.99.0", force: true },
        {
          currentVersion: async () => "0.52.2",
          currentBinaryDir: () => home,
          runUpgradeFn: async (_h, o) => {
            seenDrain = o.drainMode;
            return { ok: true, phase: "cleanup", restart: { ok: true, healthAfterMs: 1 } };
          },
        },
      );
    } finally {
      cap.restore();
    }
    assert.equal(seenDrain, "force");
    assert.match(cap.text(), /Drain mode: force/);
    assert.match(cap.text(), /in-flight turns will be dropped/);
  });
});

// --- §2.7 drain modes ---

test("runUpgradeCli: --drain defer + daemon busy → silenced (no audit emit, no UpgradeErrorCode, exit 0)", async () => {
  // v8.3.3 cleanup (per Jianwei msg=9239533b Q1): drain=defer + daemons busy
  // is user-action, NOT a failure. Pre-v8.3.3 emitted `UPGRADE_DEFERRED`
  // which isn't in the RFC 7-value closed-set. Post-cleanup: silence the
  // audit log entirely + info() to stderr + exit 0. The schema has no
  // "deferred" value; encoding user-action as outcome=err would mis-classify.
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      // Must NOT throw — drain-defer exits 0 cleanly now.
      await runUpgradeCli(
        home,
        { targetVersion: "0.99.0", drain: "defer" },
        {
          currentVersion: async () => "0.52.2",
          currentBinaryDir: () => home,
          runUpgradeFn: async () => ({
            ok: false,
            phase: "drain",
            reason: "deferred: daemon busy (--drain defer)",
          }),
        },
      );
    } finally {
      cap.restore();
    }
    const out = cap.text();
    assert.match(out, /Drain mode: defer/);
    assert.match(out, /Upgrade deferred/);
    // Regression guard: pre-v8.3.3 token must NOT appear (not in closed-set).
    assert.doesNotMatch(out, /UPGRADE_DEFERRED/);
    // Invariant: no audit log entry emitted (drain-defer is silenced).
    await assert.rejects(
      () => readFile(upgradeLogPath(home), "utf8"),
      (e) => (e as NodeJS.ErrnoException).code === "ENOENT",
    );
  });
});

test("runUpgradeCli: default → drainMode=undefined (no Drain mode breadcrumb)", async () => {
  await withHome(async (home) => {
    let seenDrain: string | undefined = "sentinel";
    const cap = captureOut();
    try {
      await runUpgradeCli(
        home,
        { targetVersion: "0.99.0" },
        {
          currentVersion: async () => "0.52.2",
          currentBinaryDir: () => home,
          runUpgradeFn: async (_h, o) => {
            seenDrain = o.drainMode;
            return { ok: true, phase: "cleanup", restart: { ok: true, healthAfterMs: 1 } };
          },
        },
      );
    } finally {
      cap.restore();
    }
    assert.equal(seenDrain, undefined);
    assert.doesNotMatch(cap.text(), /Drain mode:/);
  });
});

test("runUpgradeCli: --drain wins over --force when both passed", async () => {
  await withHome(async (home) => {
    let seenDrain: string | undefined;
    const cap = captureOut();
    try {
      await runUpgradeCli(
        home,
        { targetVersion: "0.99.0", drain: "defer", force: true },
        {
          currentVersion: async () => "0.52.2",
          currentBinaryDir: () => home,
          runUpgradeFn: async (_h, o) => {
            seenDrain = o.drainMode;
            return { ok: true, phase: "cleanup", restart: { ok: true, healthAfterMs: 1 } };
          },
        },
      );
    } finally {
      cap.restore();
    }
    assert.equal(seenDrain, "defer");
  });
});

// Dayu blocker #1 (msg=911eb84e): runUpgradeCli must wire a
// spawnFreshSupervisor callback into runUpgrade's deps so the production
// CLI's restart phase (and operational rollback) can actually spawn a
// supervisor. Without this, `restartPhase`'s "no spawn callback wired"
// branch swallows the spawn step and the upgrade only health-polls a
// dead pidfile → timeout → rollback respawn fails for the same reason.

test("runUpgradeCli: full flow wires deps.spawnFreshSupervisor into runUpgrade", async () => {
  await withHome(async (home) => {
    let seenSpawnCallback: undefined | (() => Promise<void>);
    let stubSpawnCalls = 0;
    const cap = captureOut();
    try {
      await runUpgradeCli(
        home,
        { targetVersion: "0.99.0" },
        {
          currentVersion: async () => "0.52.2",
          currentBinaryDir: () => home,
          spawnFreshSupervisor: async () => {
            stubSpawnCalls += 1;
          },
          runUpgradeFn: async (_h, o) => {
            seenSpawnCallback = o.deps?.spawnFreshSupervisor;
            // Exercise the wired callback to prove it reaches the stub.
            if (o.deps?.spawnFreshSupervisor) {
              await o.deps.spawnFreshSupervisor();
            }
            return { ok: true, phase: "cleanup", restart: { ok: true, healthAfterMs: 1 } };
          },
        },
      );
    } finally {
      cap.restore();
    }
    assert.ok(seenSpawnCallback, "runUpgradeCli must pass deps.spawnFreshSupervisor");
    assert.equal(stubSpawnCalls, 1, "wired callback must reach the production helper");
  });
});

test("runUpgradeCli: default deps wire spawnDetachedSupervisor (production path)", async () => {
  await withHome(async (home) => {
    let seenSpawnCallback: undefined | (() => Promise<void>);
    const cap = captureOut();
    try {
      // No spawnFreshSupervisor stub → the default wiring (production
      // `spawnDetachedSupervisor`) is selected. We intercept it through
      // runUpgradeFn so we can observe that the dep is non-undefined
      // without actually forking a child process.
      await runUpgradeCli(
        home,
        { targetVersion: "0.99.0" },
        {
          currentVersion: async () => "0.52.2",
          currentBinaryDir: () => home,
          runUpgradeFn: async (_h, o) => {
            seenSpawnCallback = o.deps?.spawnFreshSupervisor;
            return { ok: true, phase: "cleanup", restart: { ok: true, healthAfterMs: 1 } };
          },
        },
      );
    } finally {
      cap.restore();
    }
    assert.ok(seenSpawnCallback, "production wiring must pass spawnFreshSupervisor by default");
  });
});

// PR-E 21/n — narrow v1 safety guard (Dayu msg=1fab1fa6).
//
// `allowUnsafeSpec` is the harness-only escape hatch on
// `preflightDepDriftCheck` that lets `__upgrade-install-smoke` accept
// workspace/file-spec tarballs. Production `slock-computer upgrade`
// (i.e. `runUpgradeCli`) MUST NEVER set it: if it leaks into the
// production path, the narrow v1 safety argument collapses — unsafe
// daemon specs would no longer fail-closed under `UPGRADE_DEPS_CHANGED`
// with reason `unsafe_spec`. Two checks (defense in depth):
//
//   1. Source-level grep on `upgradeCli.ts` itself — the substring
//      `allowUnsafeSpec` must not appear there. A future refactor
//      smuggling it in fails the test before the dep is ever passed.
//   2. Runtime observation through the `runUpgradeFn` test seam — call
//      `runUpgradeCli` and assert the options it forwards into
//      `runUpgrade` carry no preflight escape hatch.
//
// This is a code-only regression guard. It is not a contract addition;
// the contract (v8 patch §11) already states production never sets the
// flag (Dayu msg=cab2b6f7). The guard pins that wording in code.
test("runUpgradeCli source: must not reference allowUnsafeSpec (narrow-v1 safety guard)", async () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = await readFile(join(here, "upgradeCli.ts"), "utf8");
  assert.equal(
    src.includes("allowUnsafeSpec"),
    false,
    "upgradeCli.ts must not reference the harness-only allowUnsafeSpec escape hatch",
  );
});

test("runUpgradeCli runtime: no preflight escape hatch forwarded into runUpgrade", async () => {
  await withHome(async (home) => {
    let seenOpts: unknown = null;
    const cap = captureOut();
    try {
      await runUpgradeCli(
        home,
        { targetVersion: "0.99.0" },
        {
          currentVersion: async () => "0.52.2",
          currentBinaryDir: () => home,
          runUpgradeFn: async (_h, o) => {
            seenOpts = o;
            return { ok: true, phase: "cleanup", restart: { ok: true, healthAfterMs: 1 } };
          },
        },
      );
    } finally {
      cap.restore();
    }
    assert.ok(seenOpts, "runUpgradeFn must be invoked");
    const deps = (seenOpts as { deps?: Record<string, unknown> }).deps;
    const preflight = deps?.preflight as Record<string, unknown> | undefined;
    // `preflight` may be undefined (default-resolved inside runUpgrade) OR
    // an object — but if it IS provided, it must NOT carry allowUnsafeSpec.
    if (preflight !== undefined) {
      assert.notEqual(
        preflight.allowUnsafeSpec,
        true,
        "production runUpgradeCli must not forward allowUnsafeSpec=true",
      );
    }
  });
});

// --- v8.3.3 PR-2c Slice 4: bundledDaemonVersion hydration ---
//
// `readBundledDaemonVersion(binaryDir)` reads the published Computer
// package's `dependencies["@slock-ai/daemon"]` pin (npm publish replaces
// `workspace:*` with a concrete semver). Audit log `bundledDaemonVersion`
// field hydrates from this for forensic evidence per v8.3.2 §4.4 (7).
//
// Best-effort: dev mode (`workspace:*`), missing package.json, malformed
// JSON, or missing key all return null + omit the field from the audit
// entry. Hydration error never blocks upgrade outcome.

test("readBundledDaemonVersion: concrete semver pin hydrates", async () => {
  const { readBundledDaemonVersion } = await import("./upgradeCli.js");
  await withHome(async (home) => {
    await writeFile(
      join(home, "package.json"),
      JSON.stringify({
        name: "@slock-ai/computer",
        version: "0.0.8",
        dependencies: { "@slock-ai/daemon": "0.53.0" },
      }),
    );
    assert.equal(await readBundledDaemonVersion(home), "0.53.0");
  });
});

test("readBundledDaemonVersion: workspace:* (dev mode) returns null (no sentinel in audit log)", async () => {
  const { readBundledDaemonVersion } = await import("./upgradeCli.js");
  await withHome(async (home) => {
    await writeFile(
      join(home, "package.json"),
      JSON.stringify({
        name: "@slock-ai/computer",
        version: "0.0.8",
        dependencies: { "@slock-ai/daemon": "workspace:*" },
      }),
    );
    assert.equal(await readBundledDaemonVersion(home), null);
  });
});

test("readBundledDaemonVersion: missing package.json returns null", async () => {
  const { readBundledDaemonVersion } = await import("./upgradeCli.js");
  await withHome(async (home) => {
    assert.equal(await readBundledDaemonVersion(home), null);
  });
});

test("readBundledDaemonVersion: malformed JSON returns null", async () => {
  const { readBundledDaemonVersion } = await import("./upgradeCli.js");
  await withHome(async (home) => {
    await writeFile(join(home, "package.json"), "{not valid json");
    assert.equal(await readBundledDaemonVersion(home), null);
  });
});

test("readBundledDaemonVersion: dependencies key absent returns null", async () => {
  const { readBundledDaemonVersion } = await import("./upgradeCli.js");
  await withHome(async (home) => {
    await writeFile(
      join(home, "package.json"),
      JSON.stringify({
        name: "@slock-ai/computer",
        version: "0.0.8",
        dependencies: { commander: "^12.1.0" },
      }),
    );
    assert.equal(await readBundledDaemonVersion(home), null);
  });
});

test("runUpgradeCli: audit log entry hydrates bundledDaemonVersion when present", async () => {
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await runUpgradeCli(
        home,
        { targetVersion: "0.99.0" },
        {
          currentVersion: async () => "0.52.2",
          currentBinaryDir: () => home,
          readBundledDaemonVersion: async () => "0.53.0",
          runUpgradeFn: async () => ({
            ok: true,
            phase: "cleanup",
            restart: { ok: true, healthAfterMs: 5 },
          }),
        },
      );
    } finally {
      cap.restore();
    }
    const raw = await readFile(upgradeLogPath(home), "utf8");
    const parsed = JSON.parse(raw.trim());
    assert.equal(parsed.outcome, "ok");
    assert.deepEqual(parsed.fromBundle, { computerVersion: "0.52.2", bundledDaemonVersion: "0.53.0" });
    assert.deepEqual(parsed.toBundle, { computerVersion: "0.99.0", bundledDaemonVersion: "0.53.0" });
  });
});

test("runUpgradeCli: bundledDaemonVersion omitted when readBundledDaemonVersion returns null", async () => {
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await runUpgradeCli(
        home,
        { targetVersion: "0.99.0" },
        {
          currentVersion: async () => "0.52.2",
          currentBinaryDir: () => home,
          readBundledDaemonVersion: async () => null,
          runUpgradeFn: async () => ({
            ok: true,
            phase: "cleanup",
            restart: { ok: true, healthAfterMs: 5 },
          }),
        },
      );
    } finally {
      cap.restore();
    }
    const raw = await readFile(upgradeLogPath(home), "utf8");
    const parsed = JSON.parse(raw.trim());
    assert.deepEqual(parsed.fromBundle, { computerVersion: "0.52.2" });
    assert.deepEqual(parsed.toBundle, { computerVersion: "0.99.0" });
    assert.equal(parsed.fromBundle.bundledDaemonVersion, undefined);
    assert.equal(parsed.toBundle.bundledDaemonVersion, undefined);
  });
});

test("runUpgradeCli: bundledDaemonVersion hydrates on failure-path audit entry too (UPGRADE_NETWORK_FAILED)", async () => {
  await withHome(async (home) => {
    const cap = captureOut();
    try {
      await assert.rejects(
        () =>
          runUpgradeCli(
            home,
            { targetVersion: "0.99.0" },
            {
              currentVersion: async () => "0.52.2",
              currentBinaryDir: () => home,
              readBundledDaemonVersion: async () => "0.53.0",
              runUpgradeFn: async () => ({
                ok: false,
                phase: "stage",
                reason: "npm pack failed",
              }),
            },
          ),
        (e) => e instanceof CliExit && e.exitCode === 1,
      );
    } finally {
      cap.restore();
    }
    const raw = await readFile(upgradeLogPath(home), "utf8");
    const parsed = JSON.parse(raw.trim());
    assert.equal(parsed.outcome, "err");
    assert.equal(parsed.errorCode, "UPGRADE_NETWORK_FAILED");
    assert.deepEqual(parsed.fromBundle, { computerVersion: "0.52.2", bundledDaemonVersion: "0.53.0" });
    assert.deepEqual(parsed.toBundle, { computerVersion: "0.99.0", bundledDaemonVersion: "0.53.0" });
  });
});
