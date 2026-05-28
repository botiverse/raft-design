// `slock-computer upgrade` CLI runner — PR-E §2.5 (auto-upgrade UX).
//
// Composes the lower-level primitives in upgrade.ts into a user-facing
// command. The CLI is intentionally a thin wrapper: all decisions and
// side-effects live in upgrade.ts primitives so the same orchestrator
// powers the upcoming weak-network test harness (8/n).
//
// Surface:
//   slock-computer upgrade
//     [--dry-run]                  — stage + verify only; no swap/restart.
//     [--channel <name>]           — override channel for this invocation.
//     [--target-version <semver>]  — override target version explicitly.
//                                   (NOT `--version`: Commander reserves
//                                    that as the root program version flag.)
//     [--drain <mode>]             — drain | defer | force (§2.7).
//     [--force]                    — alias for `--drain force`.
//
// Resolution order for target version:
//   1. `--target-version` if given (validated as semver).
//   2. Channel resolves to a registry pointer:
//        latest        → `dist-tags.latest`
//        alpha         → `dist-tags.alpha`
//        pinned:X.Y.Z  → `X.Y.Z` (no registry round-trip)
//
// fromVersion = the running binary's `package.json` version. Discovered
// once at invocation; never inferred from the snapshot file (which is
// pre-swap state, not "what's running now").

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { fail, info, CliExit } from "./output.js";
import { readChannel, parseChannel, type Channel, SEMVER_RE } from "./channel.js";
import {
  runUpgrade,
  stagePhase,
  verifyPhase,
  cleanupStaged,
  type DrainMode,
  type UpgradeOutcome,
} from "./upgrade.js";
import { spawnDetachedSupervisor } from "./supervisor.js";
import {
  appendUpgradeLogEntry,
  type UpgradeBundle,
  type UpgradeErrorCode,
  type UpgradeTrigger,
} from "./upgradeLog.js";

/**
 * Detect whether `binaryDir` lives inside an ephemeral npx cache.
 *
 * npx (npm-cli) stages one-shot packages into `~/.npm/_npx/<hash>/`
 * directories. When a user invokes `npx @slock-ai/computer upgrade`,
 * the running binary lives in such a hash dir; the upgrade
 * subcommand's swap target is that hash dir, NOT the persistent
 * install root that the user's `slock-computer start` service is
 * spawned from. Running upgrade in this context silently no-ops the
 * persistent install — see field bug #wg-slock-computer msg=59670ea6
 * (tygg, 2026-05-24): user ran `npx ... upgrade`, saw daemon stay
 * at 0.52.2, expected 0.53.0, no audit log entry was emitted because
 * the upgrade hit the "Already at <version>" early-return on the
 * ephemeral hash dir while the persistent install was never touched.
 *
 * Detection: presence of an `_npx` path segment. This matches both
 * POSIX (`~/.npm/_npx/<hash>/...`) and Windows
 * (`%USERPROFILE%\.npm\_npx\<hash>\...`) layouts. The segment name
 * is npm-cli-defined and stable across npm versions.
 */
export function isEphemeralNpxContext(binaryDir: string): boolean {
  return binaryDir.split(/[\\/]/).includes("_npx");
}

/**
 * v8.3.3 PR-2c Slice 4 — read the bundled daemon version from the
 * Computer package's `package.json#dependencies["@slock-ai/daemon"]`.
 *
 * npm publish replaces source-time `"workspace:*"` with a concrete
 * semver pin at pack time, so a published `@slock-ai/computer@0.0.7`
 * carries `"@slock-ai/daemon": "0.53.0"` (verified by Jianwei smoke).
 * This helper reads that pin at runtime + returns it for `upgrade.log`
 * audit forensic emit. Sole consumer is `bundle()` in `runUpgradeCli`.
 *
 * Best-effort — returns `null` (omit the field) on:
 *   - `binaryDir/package.json` missing
 *   - JSON parse failure
 *   - `dependencies` missing or `dependencies["@slock-ai/daemon"]` absent
 *   - Value is literal `"workspace:*"` (dev mode — never inject the
 *     unresolved sentinel into the audit log)
 *
 * Any other thrown error is also caught and returns null; this writer
 * must never block the upgrade outcome on observability concerns.
 */
export async function readBundledDaemonVersion(binaryDir: string): Promise<string | null> {
  try {
    const pkgPath = join(binaryDir, "package.json");
    const raw = await readFile(pkgPath, "utf8");
    const parsed = JSON.parse(raw) as { dependencies?: Record<string, string> };
    const pinned = parsed.dependencies?.["@slock-ai/daemon"];
    if (typeof pinned !== "string" || pinned.length === 0) return null;
    // Dev-mode sentinel guard — never write `workspace:*` to audit log.
    if (pinned === "workspace:*") return null;
    return pinned;
  } catch {
    return null;
  }
}

export interface UpgradeCliOptions {
  dryRun?: boolean;
  channel?: string;
  /**
   * Explicit target version (bypasses channel resolution). Surfaced on
   * the CLI as `--target-version`, NOT `--version` — Commander treats
   * `--version` as the root program version flag and silently shadows
   * any subcommand option of the same name.
   */
  targetVersion?: string;
  /**
   * §2.7 alias for `--drain force`. Kept as a top-level flag so the
   * stuck-daemon recovery incantation is one word ("force") instead of
   * two ("--drain force"). When both `--force` and `--drain` are given,
   * `--drain` wins (explicit beats implicit).
   */
  force?: boolean;
  /** §2.7 drain mode. drain (default) | defer | force. */
  drain?: DrainMode;
  /**
   * §4.4 (4) trigger source attribution for upgrade.log audit trail.
   * Defaults to "cli" when invoked through the bare CLI entry point;
   * web button + tray menu callsites pass "web" / "tray" so the log
   * line records which surface initiated the upgrade.
   */
  trigger?: UpgradeTrigger;
}

/**
 * Production wiring of the supervisor-spawn callback consumed by
 * `runUpgrade` during phase 5 (restart) and during operational rollback
 * after phase 5/rolling-health failure. Both code paths re-exec the
 * `slock-computer __supervise` binary detached so the supervisor
 * survives the upgrade CLI process exit. Same helper, same log sink,
 * same pidfile invariant — the new bits get spawned on the happy path
 * and the restored old bits get spawned on the rollback path.
 *
 * Dayu blocker (msg=911eb84e): the previous wiring omitted this
 * callback, so `restartPhase`'s "no spawn callback wired" branch would
 * fall through to a health probe that read the dead pidfile and
 * timed out, then rollback would fail respawn for the identical
 * reason. The production CLI is effectively unable to complete a real
 * upgrade until this is wired.
 */
async function defaultSpawnFreshSupervisor(slockHome: string): Promise<void> {
  await spawnDetachedSupervisor(slockHome);
}

/**
 * `slock-computer upgrade` entrypoint. Validates inputs, resolves
 * channel + target version + current binary dir, and dispatches to
 * either `runUpgrade` (full 1→6 flow) or a stage+verify-only dry run.
 *
 * Test-injectable via deps for the registry fetch (latest/alpha tag
 * resolution) and for the discovery of the running binary's dir +
 * version (so tests don't depend on a real install location).
 */
export async function runUpgradeCli(
  slockHome: string,
  opts: UpgradeCliOptions,
  deps: {
    fetchDistTags?: () => Promise<Record<string, string> | null>;
    currentBinaryDir?: () => string;
    currentVersion?: () => Promise<string>;
    runUpgradeFn?: typeof runUpgrade;
    stagePhaseFn?: typeof stagePhase;
    verifyPhaseFn?: typeof verifyPhase;
    /**
     * Production: `spawnDetachedSupervisor(slockHome)`. Tests stub to a
     * no-op so the upgrade flow doesn't actually fork a child process.
     * Wired into `runUpgrade.deps.spawnFreshSupervisor` for both phase 5
     * (happy path) and rollback respawn.
     */
    spawnFreshSupervisor?: (slockHome: string) => Promise<void>;
    /**
     * Test-injectable predicate for npx-ephemeral context detection.
     * Production uses the module-level `isEphemeralNpxContext` (path
     * segment check on `_npx`). Tests override with a function that
     * returns a fixed boolean so the gate can be exercised against
     * both branches without depending on the test runner's actual
     * binary location.
     */
    isEphemeralNpxContext?: (binaryDir: string) => boolean;
    /**
     * Test-injectable bundled-daemon-version resolver (PR-2c Slice 4).
     * Production reads `<binaryDir>/package.json#dependencies
     * ["@slock-ai/daemon"]`. Tests stub to a fixed value (or `null`)
     * so the audit-log hydration branches can be exercised without
     * touching a real package.json.
     */
    readBundledDaemonVersion?: (binaryDir: string) => Promise<string | null>;
  } = {},
): Promise<void> {
  // 1. Resolve channel.
  let channel: Channel;
  if (opts.channel !== undefined) {
    const parsed = parseChannel(opts.channel);
    if (parsed === null) {
      fail(
        "CHANNEL_INVALID",
        `Invalid --channel "${opts.channel}". Accepted: latest | alpha | pinned:<semver>.`,
      );
    }
    channel = parsed;
  } else {
    channel = await readChannel(slockHome);
  }

  // 2. Resolve target version.
  let targetVersion: string;
  if (opts.targetVersion !== undefined) {
    if (!SEMVER_RE.test(opts.targetVersion)) {
      fail(
        "UPGRADE_VERSION_INVALID",
        `Invalid --target-version "${opts.targetVersion}". Expected semver like 0.53.0 or 1.0.0-alpha.`,
      );
    }
    targetVersion = opts.targetVersion;
  } else if (channel.startsWith("pinned:")) {
    targetVersion = channel.slice("pinned:".length);
  } else {
    const fetchDistTags = deps.fetchDistTags ?? defaultFetchDistTags;
    const tags = await fetchDistTags();
    if (!tags) {
      fail(
        "UPGRADE_VERSION_RESOLVE_FAILED",
        `Could not reach npm registry to resolve ${channel} dist-tag. Check connectivity or pass --target-version <semver>.`,
      );
    }
    const tagName = channel;
    const resolved = tags[tagName];
    if (typeof resolved !== "string" || resolved.length === 0) {
      fail(
        "UPGRADE_VERSION_RESOLVE_FAILED",
        `Channel "${channel}" has no published dist-tag on the registry. Pass --target-version <semver> or switch channels.`,
      );
    }
    targetVersion = resolved;
  }

  // 3. Resolve fromVersion + currentBinaryDir.
  const fromVersion = await (deps.currentVersion ?? defaultCurrentVersion)();
  const currentBinaryDir = (deps.currentBinaryDir ?? defaultCurrentBinaryDir)();

  // 3.5. Ephemeral-npx context gate. If the running binary lives in an
  // npx hash dir (~/.npm/_npx/<hash>/), the upgrade subcommand's swap
  // target is that hash dir — NOT the persistent Computer service
  // install root. Running here silently no-ops the persistent install,
  // which surfaces to the user as "I ran upgrade but daemon stayed at
  // old version" (#wg-slock-computer msg=59670ea6, tygg 2026-05-24).
  //
  // Fail-loud with an actionable redirect: tell the user the stop +
  // rm-rf + start sequence so they can manually replace the persistent
  // install with a fresh npx pull. Long-term resolution is a v8.4
  // service/client split where the client can resolve the persistent
  // install root via SLOCK_HOME state.
  //
  // `UPGRADE_EPHEMERAL_CONTEXT` is a stderr-only Tier-2 token per
  // §4.4 dual-tier note (v8.3.4 draft, Adspectum-owned) — NOT in the
  // §4.4 (6) 7-value programmatic closed-set. It never reaches
  // `appendUpgradeLogEntry`; the audit log records nothing because no
  // upgrade attempt happens.
  const isEphemeralFn = deps.isEphemeralNpxContext ?? isEphemeralNpxContext;
  if (isEphemeralFn(currentBinaryDir)) {
    // v8.3.3 follow-up (#wg-slock-computer:f83dbaed msg=f4d8f9f0 Hao
    // narrowed scope + tygg msg=0a0eb057 "don't overcomplicate"):
    // simplified ephemeral-context error to point users at the canonical
    // installed entrypoint instead of asking them to find an npx hash
    // and rm -rf it. Computer service is meant to be installed globally
    // (`npm i -g @slock-ai/computer@latest`) so users get a stable
    // `slock-computer` on PATH; `npx @slock-ai/computer` is for
    // bootstrap / first-install only, not for upgrade.
    fail(
      "UPGRADE_EPHEMERAL_CONTEXT",
      `You're running upgrade via the npx ephemeral entrypoint, which can't reach your installed Computer service. Please run the installed \`slock-computer upgrade\` instead. If \`slock-computer\` isn't on your PATH, install it globally first: \`npm i -g @slock-ai/computer@latest\`.`,
    );
  }

  if (targetVersion === fromVersion) {
    // v8.3.3 §4.4 (6) — already-at-version path now emits an audit log
    // entry with `UPGRADE_NO_TARGET` (Slice 2 of PR-2c). This is the
    // unique closed-set code that exits 0 (steady-state condition, not
    // an attempt failure); the other 6 codes all exit non-zero. Audit
    // entry has `fromBundle === toBundle` since no version movement
    // happened — the field's purpose is trigger-source attribution for
    // web / tray UX label mapping ("you're up to date" pill).
    info(`Already at ${fromVersion} (channel ${channel}). No upgrade target.`);
    await appendUpgradeLogEntry(slockHome, {
      fromBundle: { computerVersion: fromVersion },
      toBundle: { computerVersion: fromVersion },
      channel,
      trigger: opts.trigger ?? "cli",
      outcome: "err",
      errorCode: "UPGRADE_NO_TARGET",
    }).catch(() => {});
    return;
  }

  info(`Planning upgrade: ${fromVersion} → ${targetVersion} (channel ${channel}).`);

  // 4a. Dry run path — stage + verify only.
  if (opts.dryRun) {
    const stagePhaseFn = deps.stagePhaseFn ?? stagePhase;
    const verifyPhaseFn = deps.verifyPhaseFn ?? verifyPhase;
    let staged;
    try {
      staged = await stagePhaseFn(slockHome, targetVersion);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      fail("UPGRADE_DOWNLOAD_FAILED", `Dry run aborted: stage failed: ${msg}`);
    }
    const verify = await verifyPhaseFn(staged);
    // Clean up the staging dir — dry run never proceeds to swap.
    await cleanupStaged(slockHome, targetVersion);
    if (!verify.ok) {
      fail(
        "UPGRADE_VERIFY_FAILED",
        `Dry run: verify failed (${verify.reason}). actual=${verify.actual ?? "?"} advertised=${verify.advertised ?? "?"}.`,
      );
    }
    info(
      `Dry run OK: ${targetVersion} downloaded + verified (sha1 ${verify.actual}). No swap performed.`,
    );
    return;
  }

  // 4b. Full flow.
  // §2.7 drain-mode resolution. Explicit `--drain` wins; `--force` is an
  // alias for `--drain force` so the stuck-daemon recovery incantation
  // stays one flag.
  let drainMode: DrainMode | undefined = opts.drain;
  if (drainMode === undefined && opts.force === true) {
    drainMode = "force";
  }
  if (drainMode !== undefined && drainMode !== "drain") {
    info(`Drain mode: ${drainMode}${drainMode === "force" ? " (in-flight turns will be dropped)" : ""}.`);
  }

  const runUpgradeFn = deps.runUpgradeFn ?? runUpgrade;
  const spawnFreshSupervisor = deps.spawnFreshSupervisor ?? defaultSpawnFreshSupervisor;
  const outcome: UpgradeOutcome = await runUpgradeFn(slockHome, {
    targetVersion,
    fromVersion,
    channel,
    currentBinaryDir,
    drainMode,
    deps: {
      // Wire the production supervisor-spawn into BOTH phase 5 (happy)
      // and the operational-rollback respawn path inside `runUpgrade`.
      // Without this, phase 5 falls through to a no-spawn health-poll
      // and rollback later trips `failedStep="respawn"`. See Dayu
      // blocker (#wg-slock-computer:b43b36fb msg=911eb84e).
      spawnFreshSupervisor: () => spawnFreshSupervisor(slockHome),
    },
  });

  // §4.4 (7) upgrade.log emission — best-effort, never blocks user
  // outcome. Writer-side errors (disk full / permission denied) are
  // swallowed: if the audit log fails we still complete the upgrade
  // path (success or failure as the user perceives it), since the
  // structured log is observability, not part of the upgrade
  // transaction itself.
  //
  // v8.3.3 Slice 4 — bundle hydrates the forensic `bundledDaemonVersion`
  // field from the running Computer's `package.json#dependencies
  // ["@slock-ai/daemon"]` (npm publish resolves `workspace:*` to a
  // concrete semver at pack time, as Jianwei smoke confirmed `0.53.0`
  // for `@slock-ai/computer@0.0.7`). Hydration is best-effort: on dev
  // mode (`workspace:*`), missing package.json, malformed JSON, or
  // missing key, the optional field is omitted — never inject a dev
  // sentinel into the audit log.
  const readBundledFn = deps.readBundledDaemonVersion ?? readBundledDaemonVersion;
  const bundledDaemonVersion = await readBundledFn(currentBinaryDir);
  const bundle = (version: string): UpgradeBundle =>
    bundledDaemonVersion !== null
      ? { computerVersion: version, bundledDaemonVersion }
      : { computerVersion: version };
  const logTrigger: UpgradeTrigger = opts.trigger ?? "cli";

  if (outcome.ok) {
    info(
      `Upgrade ${fromVersion} → ${targetVersion} succeeded (health-OK in ${outcome.restart?.healthAfterMs ?? 0}ms).`,
    );
    await appendUpgradeLogEntry(slockHome, {
      fromBundle: bundle(fromVersion),
      toBundle: bundle(targetVersion),
      channel,
      trigger: logTrigger,
      outcome: "ok",
    }).catch(() => {});
    return;
  }

  // v8.3.3 §4.4 (6) — phase → 7-value RFC closed-set mapping. Two
  // special-case silences (Jianwei sign msg=9239533b):
  //
  //   - `drain` phase fail = user-action (drain=defer + daemons busy);
  //     not a contract failure. Skip audit-log emit; surface to user
  //     via `info()` and exit 0. RFC closed-set schema has no
  //     "deferred" value; encoding user-action as `outcome=err` would
  //     mis-classify it.
  //
  //   - `cleanup` phase fail (theoretical — current `upgrade.ts` never
  //     returns ok=false on cleanup, but defensive against future
  //     change): upgrade is already committed forward-only + runner is
  //     healthy. User-perspective outcome = success; emit `outcome=ok`
  //     entry with an info warning rather than mis-signaling failure.
  const rolledBack = outcome.rolledBack === true ? " (swap rolled back)" : "";

  if (outcome.phase === "drain") {
    info(
      `Upgrade deferred: --drain=defer and daemons are busy. Re-run when idle, or use --force to interrupt in-flight turns.`,
    );
    // No audit-log emit, no fail() — drain-defer is a clean user-action exit.
    return;
  }

  if (outcome.phase === "cleanup") {
    info(
      `Upgrade ${fromVersion} → ${targetVersion} succeeded; cleanup phase reported a non-fatal issue: ${outcome.reason ?? "unknown"}. Active layout + supervisor are healthy.`,
    );
    await appendUpgradeLogEntry(slockHome, {
      fromBundle: bundle(fromVersion),
      toBundle: bundle(targetVersion),
      channel,
      trigger: logTrigger,
      outcome: "ok",
    }).catch(() => {});
    return;
  }

  // All remaining phases map to one of the RFC 7-value closed set.
  const code = mapFailurePhaseToCode(outcome);
  await appendUpgradeLogEntry(slockHome, {
    fromBundle: bundle(fromVersion),
    toBundle: bundle(targetVersion),
    channel,
    trigger: logTrigger,
    outcome: "err",
    errorCode: code,
  }).catch(() => {});
  fail(
    code,
    `Upgrade failed at phase=${outcome.phase}: ${outcome.reason ?? "unknown"}${rolledBack}.`,
  );
}

/**
 * v8.3.3 §4.4 (6) phase → closed-set 7-value mapping.
 *
 * Constraint: the return type is `UpgradeErrorCode` (TS-enforced), so
 * any code value drift fails at compile time. The map collapses the
 * orchestrator's 10 phases to 6 of the 7 RFC values:
 *
 *   - `drain` / `cleanup` are handled by the caller (silenced; not in
 *     this map). Passing them here is a bug (caller missed special-case)
 *     — we throw rather than emit a wrong code.
 *   - `stage` → NETWORK_FAILED (tarball download is network class)
 *   - `verify` → INTEGRITY_FAILED (sha verify is integrity class)
 *   - `preflight` → DEPS_CHANGED (RFC-exact; PR-E 18/n collapsed
 *     spec_changed / installed_unsatisfied / unsafe_spec / read_failed
 *     into single code already)
 *   - `snapshot` → SWAP_FAILED (snapshot prepares for swap; fail =
 *     swap can't begin; user-facing active-layout invariant unchanged
 *     per Hao two-concept split)
 *   - `extract` → INTEGRITY_FAILED (tarball extract fail = artifact
 *     integrity, corrupt tarball / disk error)
 *   - `hydrate` → NETWORK_FAILED (npm install dependency hydration is
 *     registry/network class; active layout is untouched)
 *   - `swap` → SWAP_FAILED (exact)
 *   - `restart` → RESTART_FAILED (exact)
 *   - `rolling_health` → RESTART_FAILED (per Jianwei "已被 RESTART_FAILED
 *     吃了" — runner ready timeout is restart-class semantically)
 *
 * The 7th RFC value (`UPGRADE_NO_TARGET`) is emitted by the
 * already-at-version early return, not by phase mapping.
 * `UPGRADE_ALREADY_RUNNING` is emitted by the supervisor mutation-lock
 * contention wrap in `index.ts`, also not by phase mapping.
 */
export function mapFailurePhaseToCode(outcome: UpgradeOutcome): UpgradeErrorCode {
  switch (outcome.phase) {
    case "stage":
      return "UPGRADE_NETWORK_FAILED";
    case "verify":
      return "UPGRADE_INTEGRITY_FAILED";
    case "preflight":
      return "UPGRADE_DEPS_CHANGED";
    case "snapshot":
      return "UPGRADE_SWAP_FAILED";
    case "extract":
      return "UPGRADE_INTEGRITY_FAILED";
    case "hydrate":
      return "UPGRADE_NETWORK_FAILED";
    case "swap":
      return "UPGRADE_SWAP_FAILED";
    case "restart":
      return "UPGRADE_RESTART_FAILED";
    case "rolling_health":
      return "UPGRADE_RESTART_FAILED";
    case "drain":
    case "cleanup":
      // These phases are handled by the caller with silence + special
      // success semantics; reaching the mapping function with them
      // means the caller's special-case branch was missed.
      throw new Error(
        `mapFailurePhaseToCode: phase=${outcome.phase} should be handled by caller (silenced), not mapped to a closed-set code`,
      );
  }
}

/**
 * Production registry fetch for `dist-tags`. Used to resolve channels
 * `latest` / `alpha` (and any future custom dist-tag the release flow
 * might publish). Returns null on any failure (caller maps to
 * UPGRADE_VERSION_RESOLVE_FAILED).
 */
async function defaultFetchDistTags(): Promise<Record<string, string> | null> {
  const url = "https://registry.npmjs.org/@slock-ai/computer";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { "dist-tags"?: Record<string, string> };
    return data["dist-tags"] ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Locate the install root of the currently-running `slock-computer`
 * binary. In a published package this is `<install>/dist/index.js`,
 * so the install root is `<install>` (two levels up from this module
 * via `dist/`).
 *
 * In dev-mode (pnpm monorepo / tsx loader), `import.meta.url` resolves
 * inside `packages/computer/src/`, and the upgrade flow shouldn't run
 * (the binary isn't an npm install). Callers can detect dev mode by
 * checking whether the resolved dir contains `package.json` with the
 * expected name; v1 does not enforce this — operator is responsible.
 */
export function defaultCurrentBinaryDir(): string {
  // import.meta.url points at this very file. In a packed install:
  //   <install>/dist/upgradeCli.js
  // so dirname() → <install>/dist, and another dirname() → <install>.
  const here = fileURLToPath(import.meta.url);
  return dirname(dirname(here));
}

export async function defaultCurrentVersion(): Promise<string> {
  const pkgPath = join(defaultCurrentBinaryDir(), "package.json");
  try {
    const raw = await readFile(pkgPath, "utf8");
    const parsed = JSON.parse(raw) as { version?: string };
    if (typeof parsed.version === "string" && parsed.version.length > 0) {
      return parsed.version;
    }
  } catch {
    /* fallthrough */
  }
  throw new CliExit(1);
}
