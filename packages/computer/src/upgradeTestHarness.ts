// `slock-computer __upgrade-test` — hidden harness for PR-E (8/n).
//
// Lets QA + the staging regression suite exercise the full 1→6 upgrade
// flow against controlled, deterministic failure injection — without
// needing real npm-pack tarballs, a real registry, or a real supervisor
// process. The harness composes the same `runUpgrade` primitives the
// production CLI uses; only the deps callbacks are swapped for in-memory
// stubs.
//
// Dayu's weak-network gate (msg=0bba2c49) lists the simulation surface
// every release must verify before promotion:
//
//   --simulate-fail <phase>            inject a deterministic failure
//                                      at the named phase
//   --simulate-network-loss-at <phase> abort the fetch right when that
//                                      phase begins (stage = npm pack,
//                                      verify = registry shasum fetch)
//   --simulate-sleep-wake <ms>         insert a `setTimeout`-driven
//                                      pause inside `restart` / health
//                                      poll loops; surfaces clock-skew
//                                      bugs and re-entry behaviour
//   --drain <mode>                     forward to runUpgrade
//
// Output: a single JSON line on stdout, then exit 0 (harness completed
// the simulation) regardless of the simulated outcome — exit code
// represents harness health, not the upgrade result. The QA suite reads
// the JSON and asserts `{ ok, phase, reason, rolledBack }`.
//
// NOT for end-user invocation: gated behind `__upgrade-test` so it
// never appears in `--help`. Production CLI is `slock-computer upgrade`.

import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import {
  runUpgrade,
  upgradeStagingDir,
  upgradeSnapshotPath,
  type DrainMode,
  type UpgradeOutcome,
  type UpgradeOptions,
} from "./upgrade.js";
import {
  computerDir,
  serverAttachmentPath,
  serverManagedFlagPath,
  serversDir,
  supervisorPidPath,
} from "./paths.js";

type Phase =
  | "stage"
  | "verify"
  | "snapshot"
  | "extract"
  | "swap"
  | "restart"
  | "rolling_health"
  | "cleanup";

const PHASES: ReadonlySet<Phase> = new Set([
  "stage",
  "verify",
  "snapshot",
  "extract",
  "swap",
  "restart",
  "rolling_health",
  "cleanup",
]);

export interface HarnessOptions {
  simulateFail?: Phase;
  simulateNetworkLossAt?: Extract<Phase, "stage" | "verify">;
  simulateSleepWakeMs?: number;
  drain?: DrainMode;
  /** Target version label for the simulated upgrade. Defaults to 0.99.0. */
  targetVersion?: string;
  /** From version label. Defaults to 0.0.0-test. */
  fromVersion?: string;
}

/**
 * Validate harness flag values. Returns null if OK, or an error message.
 * Validation happens before any filesystem side effects so a typo doesn't
 * leave staging dirs behind.
 */
export function validateHarnessOptions(opts: HarnessOptions): string | null {
  if (opts.simulateFail !== undefined && !PHASES.has(opts.simulateFail)) {
    return `--simulate-fail: unknown phase "${opts.simulateFail}". Accepted: ${[...PHASES].join(" | ")}.`;
  }
  if (
    opts.simulateNetworkLossAt !== undefined &&
    opts.simulateNetworkLossAt !== "stage" &&
    opts.simulateNetworkLossAt !== "verify"
  ) {
    return `--simulate-network-loss-at: only "stage" or "verify" are network-bound phases (got "${opts.simulateNetworkLossAt}").`;
  }
  if (opts.simulateSleepWakeMs !== undefined) {
    if (!Number.isFinite(opts.simulateSleepWakeMs) || opts.simulateSleepWakeMs < 0) {
      return `--simulate-sleep-wake: must be a non-negative number of ms (got ${opts.simulateSleepWakeMs}).`;
    }
    if (opts.simulateSleepWakeMs > 60_000) {
      return `--simulate-sleep-wake: max 60000ms to keep the harness bounded (got ${opts.simulateSleepWakeMs}).`;
    }
  }
  return null;
}

/**
 * Build a `runUpgrade` deps object that simulates the requested failure
 * surface. Each callback is a controlled stub:
 *
 *   - `npmPack`: writes a deterministic tarball with known sha1.
 *   - `fetchAdvertisedHash`: returns the matching sha1.
 *   - `tarSpawn`: materializes a stub `package/` dir.
 *   - `npmInstall`: no-op; dependency hydration is tested separately.
 *   - `readSupervisorPid`: pretends no prior supervisor is running.
 *   - `spawnFreshSupervisor`: no-op.
 *   - `healthCheck`: returns true unless `restart` is the targeted phase.
 *   - `listManagedServerIds`: empty unless `rolling_health` is targeted.
 *
 * Simulation precedence:
 *   network-loss-at overrides the corresponding phase's happy stub.
 *   simulate-fail short-circuits the targeted phase with a thrown/false
 *     result. The sleep-wake delay is added before `spawnFreshSupervisor`
 *     and before each health poll, simulating an OS-level suspend window.
 */
export function buildSimulatedDeps(
  slockHome: string,
  opts: HarnessOptions,
): { opts: UpgradeOptions } {
  const targetVersion = opts.targetVersion ?? "0.99.0";
  const fromVersion = opts.fromVersion ?? "0.0.0-test";
  const tarballBytes = Buffer.from(`harness-tarball-${targetVersion}`, "utf8");
  const expectedSha = createHash("sha1").update(tarballBytes).digest("hex");
  const sleepMs = opts.simulateSleepWakeMs ?? 0;

  const maybeSleep = async () => {
    if (sleepMs > 0) {
      await new Promise((r) => setTimeout(r, sleepMs));
    }
  };

  // Track which run of spawn/health we're in. For `--simulate-fail
  // restart`, the FIRST spawn (the new-version supervisor) fails, but
  // the SECOND spawn — driven by rollbackRestart — succeeds, since it
  // represents bringing the old known-good supervisor back. Same shape
  // for healthCheck: new-version probe times out, old-version probe
  // succeeds after rollback. Without this distinction, the simulation
  // would force operational rollback to fail too, which would mask the
  // production semantic: restart failure → rollback DOES recover.
  let spawnCalls = 0;
  let healthCalls = 0;

  return {
    opts: {
      targetVersion,
      fromVersion,
      channel: "latest",
      currentBinaryDir: join(slockHome, "harness-current"),
      drainMode: opts.drain,
      deps: {
        npmPack: async (cwd) => {
          if (opts.simulateNetworkLossAt === "stage") {
            throw new Error("simulated network loss during stage (npm pack)");
          }
          if (opts.simulateFail === "stage") {
            return { tarballPath: "", exitCode: 1, stderr: "simulated stage failure" };
          }
          const filename = `slock-ai-computer-${targetVersion}.tgz`;
          await writeFile(join(cwd, filename), tarballBytes);
          return { tarballPath: join(cwd, filename), exitCode: 0, stderr: "" };
        },
        fetchAdvertisedHash: async () => {
          if (opts.simulateNetworkLossAt === "verify") return null;
          if (opts.simulateFail === "verify") return "deadbeef";
          return expectedSha;
        },
        tarSpawn: async (_t, destDir) => {
          if (opts.simulateFail === "extract") {
            return { exitCode: 1, stderr: "simulated extract failure" };
          }
          await mkdir(join(destDir, "package"), { recursive: true });
          await writeFile(join(destDir, "package", "marker.txt"), `NEW@${targetVersion}`);
          return { exitCode: 0, stderr: "" };
        },
        npmInstall: async () => ({ exitCode: 0, stderr: "" }),
        fsRename: opts.simulateFail === "swap"
          ? async () => {
              throw new Error("simulated swap failure: fsRename");
            }
          : undefined,
        readSupervisorPid: async () => null,
        spawnFreshSupervisor: async () => {
          await maybeSleep();
          spawnCalls += 1;
          if (opts.simulateFail === "restart" && spawnCalls === 1) {
            throw new Error("simulated spawn failure");
          }
        },
        healthCheck: async () => {
          await maybeSleep();
          healthCalls += 1;
          // For `--simulate-fail restart`, the new supervisor never
          // becomes healthy. Once the rollback respawns the OLD
          // supervisor (spawnCalls advances past 1), health flips true.
          if (opts.simulateFail === "restart" && spawnCalls <= 1) return false;
          return true;
        },
        healthTimeoutMs: opts.simulateFail === "restart" ? 200 : 5_000,
        healthPollIntervalMs: 10,
        listManagedServerIds: async () => {
          if (opts.simulateFail === "rolling_health") {
            return ["aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"];
          }
          return [];
        },
        readDaemonPid: async () => null,
        perDaemonTimeoutMs: 50,
        daemonPollIntervalMs: 10,
        // PR-E 18/n phase 1.5 dep-drift preflight: the harness mocks
        // `npmPack` to write fake tarball BYTES (not a real tar archive),
        // so the production preflight's `tar -xzOf` would fail. Inject
        // an always-passing predicate so the harness keeps exercising
        // phases 3-6 (the surface it was built to cover). Dep-drift
        // refusal semantics are covered by `preflightDepDrift.test.ts`
        // and the new `runUpgrade: preflight fail …` integration tests
        // in `upgrade.test.ts`, not here.
        preflight: {
          readTarballPackageJson: async () => ({
            dependencies: { "@slock-ai/daemon": "^0.0.0-harness" },
          }),
          readCurrentPackageJson: async () => ({
            dependencies: { "@slock-ai/daemon": "^0.0.0-harness" },
          }),
          readInstalledDaemonVersion: async () => "0.0.0-harness",
          semverSatisfies: () => true,
          allowUnsafeSpec: true,
        },
        // snapshot-phase failure: caller arranges that `mkdir` on the
        // snapshot path fails. We don't have a snapshot-phase dep hook,
        // so we instead pre-create the snapshot file as a directory:
        // that's handled outside `deps` via `arrangeSnapshotFailure`.
      },
    },
  };
}

/**
 * `simulateFail=snapshot` does not have a deps hook (snapshotPhase
 * writes through node:fs directly). We arrange a failure by pre-creating
 * the snapshot path as a directory so the JSON write errors.
 */
async function arrangeSnapshotFailure(slockHome: string): Promise<void> {
  const snapshotPath = join(slockHome, "computer", "upgrade-snapshot.json");
  await mkdir(snapshotPath, { recursive: true });
}

/**
 * `simulateFail=cleanup`: phase 6 is best-effort and currently swallows
 * failures, so this flag is a no-op observable; the harness records it
 * in the JSON output for visibility but the outcome is still ok=true.
 * Documented limitation; future RFC may add a strict-cleanup mode.
 */

/**
 * Per Dayu's weak-network gate (msg=23bb14b2): branch coverage ≠
 * state-continuity proof. A failure path can return the correct error
 * AND still leak inconsistent filesystem state (stale staging, missing
 * snapshot rollback, leftover .prev, etc.). Production gate PASS requires
 * the staging regression to verify the post-failure tree matches the
 * documented contract for each phase.
 *
 * `captureStateSnapshot` records the presence + size of every state file
 * the contract names, plus the staging dir tree and `.prev` (if any), so
 * the JSON output can drive contract assertions like:
 *
 *   - phase=verify  → staging dropped, snapshot absent (no rollback yet).
 *   - phase=swap    → snapshot + staging kept (forensic), .prev present.
 *   - phase=restart → swap rolled back (.prev removed, current restored),
 *                     snapshot + staging kept (forensic).
 *
 * Reads only — never mutates state. Missing files report `null`, not an
 * error, so a contract assertion can use ===null without try/catch.
 */
async function pathInfo(
  path: string,
): Promise<{ kind: "file" | "dir"; size: number } | null> {
  try {
    const s = await stat(path);
    if (s.isDirectory()) return { kind: "dir", size: 0 };
    if (s.isFile()) return { kind: "file", size: s.size };
    return null;
  } catch {
    return null;
  }
}

interface StateSnapshot {
  upgradeSnapshot: { kind: "file" | "dir"; size: number } | null;
  stagingDir: { kind: "file" | "dir"; size: number } | null;
  stagingEntries: string[] | null;
  supervisorPid: { kind: "file" | "dir"; size: number } | null;
  channelFile: { kind: "file" | "dir"; size: number } | null;
  computerDir: { kind: "file" | "dir"; size: number } | null;
  servers: Array<{
    serverId: string;
    attachment: { kind: "file" | "dir"; size: number } | null;
    managed: { kind: "file" | "dir"; size: number } | null;
  }>;
  /** Sibling `.prev` snapshot of the currentBinaryDir if swap left one behind. */
  prevBinary: { kind: "file" | "dir"; size: number } | null;
  currentBinary: { kind: "file" | "dir"; size: number } | null;
}

async function captureStateSnapshot(
  slockHome: string,
  version: string,
  currentBinaryDir: string,
): Promise<StateSnapshot> {
  const stagingPath = upgradeStagingDir(slockHome, version);
  const stagingExists = await pathInfo(stagingPath);
  let stagingEntries: string[] | null = null;
  if (stagingExists?.kind === "dir") {
    try {
      stagingEntries = (await readdir(stagingPath)).sort();
    } catch {
      stagingEntries = null;
    }
  }

  let servers: StateSnapshot["servers"] = [];
  try {
    const ids = await readdir(serversDir(slockHome));
    servers = await Promise.all(
      ids.map(async (serverId) => ({
        serverId,
        attachment: await pathInfo(serverAttachmentPath(slockHome, serverId)),
        managed: await pathInfo(serverManagedFlagPath(slockHome, serverId)),
      })),
    );
  } catch {
    /* no servers dir → empty list */
  }

  return {
    upgradeSnapshot: await pathInfo(upgradeSnapshotPath(slockHome)),
    stagingDir: stagingExists,
    stagingEntries,
    supervisorPid: await pathInfo(supervisorPidPath(slockHome)),
    channelFile: await pathInfo(join(computerDir(slockHome), "channel")),
    computerDir: await pathInfo(computerDir(slockHome)),
    servers,
    prevBinary: await pathInfo(currentBinaryDir + ".prev"),
    currentBinary: await pathInfo(currentBinaryDir),
  };
}

/**
 * Entry point for `slock-computer __upgrade-test`. Writes a single JSON
 * line to stdout. Exit code 0 = harness completed (regardless of upgrade
 * outcome); exit code 1 = invalid flags.
 */
export async function runUpgradeTestHarness(
  slockHome: string,
  opts: HarnessOptions,
  writer: (line: string) => void = (s) => process.stdout.write(s),
): Promise<void> {
  const err = validateHarnessOptions(opts);
  if (err !== null) {
    process.stderr.write(`__upgrade-test: ${err}\n`);
    process.exitCode = 1;
    return;
  }

  // Pre-clean any staging dir from a prior run so back-to-back harness
  // invocations don't interfere.
  await mkdir(slockHome, { recursive: true });

  if (opts.simulateFail === "snapshot") {
    await arrangeSnapshotFailure(slockHome);
  }

  const { opts: upgradeOpts } = buildSimulatedDeps(slockHome, opts);
  // Make sure currentBinaryDir exists so swap has something to rename.
  await mkdir(upgradeOpts.currentBinaryDir, { recursive: true });

  let outcome: UpgradeOutcome;
  try {
    outcome = await runUpgrade(slockHome, upgradeOpts);
  } catch (e) {
    outcome = {
      ok: false,
      phase: "stage",
      reason: `harness_exception: ${e instanceof Error ? e.message : String(e)}`,
    };
  }

  const state = await captureStateSnapshot(
    slockHome,
    upgradeOpts.targetVersion,
    upgradeOpts.currentBinaryDir,
  );

  const payload = {
    ok: outcome.ok,
    phase: outcome.phase,
    reason: outcome.reason ?? null,
    rolledBack: outcome.rolledBack ?? false,
    // Operational rollback per-step status, surfaced so QA can assert
    // that disk + process both recovered (not just disk). null when no
    // rollback was attempted (phases ≤ swap, or ok=true).
    rollback: outcome.rollback ?? null,
    simulated: {
      fail: opts.simulateFail ?? null,
      networkLossAt: opts.simulateNetworkLossAt ?? null,
      sleepWakeMs: opts.simulateSleepWakeMs ?? null,
      drain: opts.drain ?? null,
    },
    state,
  };
  writer(JSON.stringify(payload) + "\n");
}
