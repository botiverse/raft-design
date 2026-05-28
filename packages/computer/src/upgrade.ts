// Slock Computer auto-upgrade (RFC v0.8 contract v7 §6 + RFC v0.1 §2.3 / PR-E).
//
// Atomic 6-phase upgrade flow:
//   1. Stage    — fetch + extract target version to scratch dir
//   2. Verify   — checksum match vs registry-advertised hash
//   2.5 Hydrate — install target package runtime deps inside staging
//   3. Snapshot — capture current binary path + version + channel
//   4. Swap     — atomic binary swap (current → .prev, staged → current)
//   5. Restart  — supervisor self-replacement + health-check
//   6. Cleanup  — success → delete snapshot + .prev + staging;
//                 failure → keep for forensic + manual gc
//
// State files (under `~/.slock/computer/`):
//   - `upgrade-staging/<version>/` — transient per-attempt scratch dir
//   - `upgrade-snapshot.json`      — pre-swap state for rollback
//   - `<binary>.prev`              — old binary kept until health-check OK
//
// This module owns phases 1-2 (stage + verify) as the foundational
// primitives. Phases 3-6 land in subsequent PR-E commits and call into
// these primitives.
//
// Test-injectable: every external side effect (npm pack spawn, fetch
// for checksum lookup, fs writes) is passed as a callback so tests can
// mock without touching real npm/network/disk.

import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile, rm, rename } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";
import {
  computerDir,
  supervisorPidPath,
  serverDaemonPidPath,
  upgradeStagingDir,
  upgradeSnapshotPath,
} from "./paths.js";

// v8.3 §4.4 (10): upgrade lifecycle paths are owned by paths.ts. This
// module re-exports them so existing consumers (upgrade.test.ts /
// upgradeCli.test.ts) keep working without churning their imports;
// new callers should import directly from "./paths.js".
export { upgradeStagingDir, upgradeSnapshotPath };
import { listManagedServerIds } from "./serverState.js";
import {
  preflightDepDriftCheck,
  type DepDriftResult,
  type PreflightDeps,
} from "./preflightDepDrift.js";

// --- types ---

export interface StageResult {
  /** Absolute path to the staged version directory. */
  stagedPath: string;
  /** Version that was staged (echoed for caller's audit). */
  version: string;
  /** sha1 of the staged tarball, hex-encoded — matches npm `dist.shasum`. */
  tarballSha1: string;
}

export interface VerifyResult {
  ok: boolean;
  /** When ok=false, this is the failure cause. */
  reason?: "checksum_mismatch" | "registry_fetch_failed" | "no_advertised_sha";
  /** The hash actually computed from the staged tarball. */
  actual?: string;
  /** The hash advertised by the source-of-truth registry (when fetched). */
  advertised?: string;
}

// --- phase 1: stage ---

/**
 * Phase 1 — Stage the target version to a scratch dir. Spawns
 * `npm pack @slock-ai/computer@<version>` under the scratch dir,
 * captures the tarball path, computes its sha1 (matching npm's
 * `dist.shasum` field) for §2 verify.
 *
 * Test-injectable via `npmPack` (mock spawn) and `fsReadFile` (mock
 * tarball read for sha256). Production path uses real spawn + node fs.
 *
 * Failure modes:
 *   - npm pack exits non-zero → throw with `UPGRADE_DOWNLOAD_FAILED` code
 *   - tarball file missing post-pack → throw with `UPGRADE_DOWNLOAD_FAILED`
 *
 * The caller is responsible for cleanup of the staging dir if verify
 * or later phases fail (per phase 6 cleanup contract).
 */
export async function stagePhase(
  slockHome: string,
  version: string,
  deps: {
    npmPack?: (cwd: string, packageRef: string) => Promise<{ tarballPath: string; exitCode: number; stderr: string }>;
    fsReadFile?: (path: string) => Promise<Buffer>;
  } = {},
): Promise<StageResult> {
  const npmPack = deps.npmPack ?? defaultNpmPack;
  const fsReadFile = deps.fsReadFile ?? readFile;

  const stagedPath = upgradeStagingDir(slockHome, version);
  await mkdir(stagedPath, { recursive: true });

  const packageRef = `@slock-ai/computer@${version}`;
  const result = await npmPack(stagedPath, packageRef);
  if (result.exitCode !== 0) {
    const err = new Error(
      `npm pack failed for ${packageRef}: exit ${result.exitCode}. stderr: ${result.stderr.slice(0, 500)}`,
    );
    (err as unknown as { code: string }).code = "UPGRADE_DOWNLOAD_FAILED";
    throw err;
  }

  // Compute sha1 of the staged tarball — matches npm registry `dist.shasum`.
  let tarballBytes: Buffer;
  try {
    tarballBytes = await fsReadFile(result.tarballPath);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const err = new Error(`staged tarball missing at ${result.tarballPath}: ${msg}`);
    (err as unknown as { code: string }).code = "UPGRADE_DOWNLOAD_FAILED";
    throw err;
  }
  const tarballSha1 = createHash("sha1").update(tarballBytes).digest("hex");

  return { stagedPath, version, tarballSha1 };
}

function defaultNpmPack(
  cwd: string,
  packageRef: string,
): Promise<{ tarballPath: string; exitCode: number; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn("npm", ["pack", packageRef, "--json"], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdoutBuf = "";
    let stderrBuf = "";
    child.stdout.on("data", (chunk) => {
      stdoutBuf += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderrBuf += String(chunk);
    });
    child.on("error", (err) => {
      resolve({ tarballPath: "", exitCode: 1, stderr: String(err) });
    });
    child.on("close", (code) => {
      if (code !== 0) {
        resolve({ tarballPath: "", exitCode: code ?? 1, stderr: stderrBuf });
        return;
      }
      // npm pack --json emits an array of records with `filename` key
      try {
        const parsed = JSON.parse(stdoutBuf) as Array<{ filename: string }>;
        const filename = parsed[0]?.filename;
        if (!filename) {
          resolve({ tarballPath: "", exitCode: 1, stderr: "npm pack returned no filename" });
          return;
        }
        resolve({ tarballPath: join(cwd, filename), exitCode: 0, stderr: stderrBuf });
      } catch (e) {
        resolve({ tarballPath: "", exitCode: 1, stderr: `parse npm pack output: ${e}` });
      }
    });
  });
}

// --- phase 2: verify ---

/**
 * Phase 2 — Verify the staged tarball's sha256 matches the registry-
 * advertised hash. The advertised hash comes from
 * `https://registry.npmjs.org/@slock-ai/computer` → versions[ver].dist.shasum
 * for v1 (sha1) or `.integrity` (sha512 base64) for newer entries.
 *
 * For v1 we use sha256 (most resistant + npm registry support varies);
 * future: switch to sha512+integrity when npm advertises consistently.
 *
 * Test-injectable via `fetchAdvertisedHash` callback so tests can
 * inject the expected advertised hash without hitting the npm registry.
 *
 * Returns a `VerifyResult` with ok=true on match, ok=false + reason on
 * mismatch / fetch failure / missing advertised hash. Caller decides
 * whether to abort the upgrade flow (typically yes — corrupt download
 * or registry mismatch means we don't trust the tarball).
 */
export async function verifyPhase(
  staged: StageResult,
  deps: {
    fetchAdvertisedHash?: (version: string) => Promise<string | null>;
  } = {},
): Promise<VerifyResult> {
  const fetchAdvertisedHash = deps.fetchAdvertisedHash ?? defaultFetchAdvertisedHash;
  let advertised: string | null;
  try {
    advertised = await fetchAdvertisedHash(staged.version);
  } catch (e) {
    void e;
    return { ok: false, reason: "registry_fetch_failed" };
  }
  if (advertised === null) {
    return { ok: false, reason: "no_advertised_sha" };
  }
  if (staged.tarballSha1 !== advertised) {
    return {
      ok: false,
      reason: "checksum_mismatch",
      actual: staged.tarballSha1,
      advertised,
    };
  }
  return { ok: true, actual: staged.tarballSha1, advertised };
}

/**
 * Production registry fetch. GETs the npm registry packument for
 * `@slock-ai/computer` and returns `dist.shasum` (sha1) for the target
 * version, or null when missing/unreachable.
 *
 * sha1 is npm's canonical integrity field on `dist.shasum`; sha512
 * lives under `dist.integrity` (base64) and is a future upgrade — for
 * v1 sha1 is sufficient because we compute it ourselves from the
 * locally-fetched tarball post-npm-pack (the integrity proof is end-to-
 * end: registry sha1 == our sha1 of the tarball npm just gave us).
 *
 * Failure modes (all return null so verifyPhase reports
 * `no_advertised_sha` or `registry_fetch_failed`; orchestrator decides
 * whether to proceed):
 *   - timeout > 10s (AbortController-cancelled)
 *   - non-2xx response
 *   - bad JSON
 *   - version not in the versions map
 */
async function defaultFetchAdvertisedHash(version: string): Promise<string | null> {
  const url = "https://registry.npmjs.org/@slock-ai/computer";
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      versions?: Record<string, { dist?: { shasum?: string } }>;
    };
    const shasum = data.versions?.[version]?.dist?.shasum;
    return typeof shasum === "string" && shasum.length > 0 ? shasum : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Clean up a staged version dir. Used by phase 6 success path and by
 * caller-initiated cleanup after a failed phase. Best-effort: missing
 * dir is a no-op.
 */
export async function cleanupStaged(slockHome: string, version: string): Promise<void> {
  try {
    await rm(upgradeStagingDir(slockHome, version), { recursive: true, force: true });
  } catch {
    /* best-effort */
  }
}

// --- phase 3: snapshot (basic; full flow lands in commit 3) ---

export interface UpgradeSnapshot {
  /** ISO timestamp at snapshot time. */
  at: string;
  /** The version we're upgrading FROM (current binary). */
  fromVersion: string;
  /** The version we're upgrading TO (target). */
  toVersion: string;
  /** Channel that triggered this upgrade. */
  channel: string;
}

/**
 * Phase 3 — Capture pre-swap state to disk for rollback. The snapshot
 * is written atomically (write to temp then rename) so a crash mid-write
 * leaves the previous snapshot intact (or none).
 */
export async function snapshotPhase(slockHome: string, snap: UpgradeSnapshot): Promise<void> {
  const path = upgradeSnapshotPath(slockHome);
  const tmp = `${path}.tmp`;
  await mkdir(computerDir(slockHome), { recursive: true });
  await writeFile(tmp, JSON.stringify(snap, null, 2), { mode: 0o600 });
  await rename(tmp, path);
}

export async function readUpgradeSnapshot(slockHome: string): Promise<UpgradeSnapshot | null> {
  try {
    const raw = await readFile(upgradeSnapshotPath(slockHome), "utf8");
    return JSON.parse(raw) as UpgradeSnapshot;
  } catch {
    return null;
  }
}

export async function clearUpgradeSnapshot(slockHome: string): Promise<void> {
  try {
    const { unlink } = await import("node:fs/promises");
    await unlink(upgradeSnapshotPath(slockHome));
  } catch {
    /* best-effort */
  }
}

// --- tarball extraction helper (used by phase 4 swap input) ---

/**
 * Extract a `.tgz` tarball into `destDir`. The npm-pack tarball
 * top-level entry is always `package/`, so callers should treat
 * `<destDir>/package` as the unpacked binary root.
 *
 * Test-injectable via `tarSpawn` (mock spawn) so unit tests don't shell
 * out to system tar. Production path uses `tar -xzf <tarball> -C <dest>`.
 */
export async function extractTarball(
  tarballPath: string,
  destDir: string,
  deps: {
    tarSpawn?: (tarballPath: string, destDir: string) => Promise<{ exitCode: number; stderr: string }>;
  } = {},
): Promise<{ extractedPackageDir: string }> {
  const tarSpawn = deps.tarSpawn ?? defaultTarSpawn;
  await mkdir(destDir, { recursive: true });
  const result = await tarSpawn(tarballPath, destDir);
  if (result.exitCode !== 0) {
    const err = new Error(
      `tar -xzf failed for ${tarballPath}: exit ${result.exitCode}. stderr: ${result.stderr.slice(0, 500)}`,
    );
    (err as unknown as { code: string }).code = "UPGRADE_EXTRACT_FAILED";
    throw err;
  }
  return { extractedPackageDir: join(destDir, "package") };
}

function defaultTarSpawn(
  tarballPath: string,
  destDir: string,
): Promise<{ exitCode: number; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn("tar", ["-xzf", tarballPath, "-C", destDir], {
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderrBuf = "";
    child.stderr.on("data", (chunk) => {
      stderrBuf += String(chunk);
    });
    child.on("error", (err) => {
      resolve({ exitCode: 1, stderr: String(err) });
    });
    child.on("close", (code) => {
      resolve({ exitCode: code ?? 1, stderr: stderrBuf });
    });
  });
}

// --- staged dependency hydration helper (post-extract, pre-swap) ---

/**
 * Populate runtime dependencies inside the extracted package root before
 * it is swapped into place.
 *
 * Why this exists: `swapPhase` renames only the Computer package root.
 * A tarball extracted from `npm pack` contains `dist/` + package metadata,
 * not the `node_modules` tree that a normal `npm install -g` creates.
 * Without this pre-swap hydration, the new root can boot into
 * `ERR_MODULE_NOT_FOUND` for runtime deps after a successful upgrade.
 *
 * Test-injectable via `npmInstall` so unit tests never hit the network.
 */
export async function hydrateStagedDependencies(
  extractedPackageDir: string,
  deps: {
    npmInstall?: (cwd: string) => Promise<{ exitCode: number; stderr: string }>;
  } = {},
): Promise<void> {
  const npmInstall = deps.npmInstall ?? defaultNpmInstallProductionDeps;
  const result = await npmInstall(extractedPackageDir);
  if (result.exitCode !== 0) {
    const err = new Error(
      `npm install failed for staged package dependencies: exit ${result.exitCode}`,
    );
    (err as unknown as { code: string }).code = "UPGRADE_DEPENDENCY_INSTALL_FAILED";
    throw err;
  }
}

function defaultNpmInstallProductionDeps(cwd: string): Promise<{ exitCode: number; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(
      "npm",
      [
        "install",
        "--omit=dev",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        "--package-lock=false",
      ],
      {
        cwd,
        stdio: ["ignore", "ignore", "pipe"],
      },
    );
    let stderrBuf = "";
    child.stderr.on("data", (chunk) => {
      stderrBuf += String(chunk);
    });
    child.on("error", (err) => {
      resolve({ exitCode: 1, stderr: String(err) });
    });
    child.on("close", (code) => {
      resolve({ exitCode: code ?? 1, stderr: stderrBuf });
    });
  });
}

// --- phase 4: swap ---

export interface SwapResult {
  /**
   * Where the old binary was moved to. Used by rollback (rename back)
   * and by phase 6 cleanup-success (delete after health-check OK).
   */
  prevBinaryDir: string;
  /**
   * Where the new binary now lives. Always equals `currentBinaryDir`
   * (we swap into the same install location).
   */
  newBinaryDir: string;
}

/**
 * Phase 4 — Atomic binary swap: move `currentBinaryDir` aside to
 * `<currentBinaryDir>.prev`, then move the staged extracted package
 * tree into `currentBinaryDir`. Both renames are single-rename
 * operations, atomic on the same filesystem.
 *
 * Rollback: if the second rename fails (e.g. cross-FS staging), we
 * attempt to restore the original by renaming `.prev` back. If THAT
 * also fails we leave the system in a half-swapped state and throw —
 * the snapshot + `.prev` dir are the operator's recovery handle.
 *
 * A stale `.prev` from a prior failed upgrade is removed first.
 *
 * Test-injectable via `fsRename` so tests can simulate rename failures
 * without touching real binaries.
 */
export async function swapPhase(
  currentBinaryDir: string,
  stagedBinaryDir: string,
  deps: {
    fsRename?: (from: string, to: string) => Promise<void>;
    fsRm?: (path: string) => Promise<void>;
  } = {},
): Promise<SwapResult> {
  const fsRename = deps.fsRename ?? rename;
  const fsRm = deps.fsRm ?? ((p: string) => rm(p, { recursive: true, force: true }));
  const prevBinaryDir = `${currentBinaryDir}.prev`;

  // Clear any stale `.prev` from a prior failed upgrade.
  try {
    await fsRm(prevBinaryDir);
  } catch {
    /* best-effort */
  }

  // current → .prev
  await fsRename(currentBinaryDir, prevBinaryDir);

  // staged → current
  try {
    await fsRename(stagedBinaryDir, currentBinaryDir);
  } catch (e) {
    // Best-effort rollback. If this also throws, the operator has
    // `.prev` + the snapshot to recover manually.
    try {
      await fsRename(prevBinaryDir, currentBinaryDir);
    } catch {
      /* leave half-swapped; snapshot + .prev are forensic anchors */
    }
    const msg = e instanceof Error ? e.message : String(e);
    const err = new Error(`swap failed (staged → current): ${msg}`);
    (err as unknown as { code: string }).code = "UPGRADE_SWAP_FAILED";
    throw err;
  }

  return { prevBinaryDir, newBinaryDir: currentBinaryDir };
}

/**
 * Rollback the phase 4 swap: restore `<currentBinaryDir>.prev` back to
 * `currentBinaryDir`. Used by `rollbackRestart` as its disk step.
 * Idempotent: missing `.prev` is treated as already-rolled-back.
 */
export async function rollbackSwap(
  currentBinaryDir: string,
  deps: {
    fsRename?: (from: string, to: string) => Promise<void>;
    fsRm?: (path: string) => Promise<void>;
  } = {},
): Promise<{ rolledBack: boolean }> {
  const fsRename = deps.fsRename ?? rename;
  const fsRm = deps.fsRm ?? ((p: string) => rm(p, { recursive: true, force: true }));
  const prevBinaryDir = `${currentBinaryDir}.prev`;
  try {
    // Remove the (failed) new binary first so the rename target is clear.
    await fsRm(currentBinaryDir);
    await fsRename(prevBinaryDir, currentBinaryDir);
    return { rolledBack: true };
  } catch {
    return { rolledBack: false };
  }
}

/**
 * Operational rollback after phase-5 (restart) or phase-5.5 (rolling
 * daemon health) failure. Disk-only rollback is not enough: a new-version
 * supervisor process may still be running while `currentBinaryDir` is
 * restored to old bits — leaving the active process version out of sync
 * with file state. This drives a full process-level rollback:
 *
 *   1. Stop the (failed) new-version supervisor if it is alive.
 *   2. Restore `.prev` → `currentBinaryDir` (calls `rollbackSwap`).
 *   3. Spawn the old supervisor fresh from the restored binary.
 *   4. Health-check the respawned old supervisor.
 *
 * Outcome surfaces per-step status so the orchestrator can flag a
 * rollback that itself partially failed (e.g. disk restored but old
 * supervisor failed to come back). `rolledBack=true` (the boolean kept
 * on `UpgradeOutcome`) means BOTH `binaryRestored` AND `supervisorHealthy`.
 */
export interface RollbackResult {
  /** `.prev` successfully renamed back to `currentBinaryDir`. */
  binaryRestored: boolean;
  /** Stale new-version supervisor was killed (or was already absent). */
  supervisorStopped: boolean;
  /** Old supervisor process was respawned post-disk-restore. */
  supervisorRespawned: boolean;
  /** Respawned old supervisor passed health probe. */
  supervisorHealthy: boolean;
  /** First step that failed (when any step failed). */
  failedStep?: "stop" | "binary" | "respawn" | "health";
  /** Human-readable detail of the first failure. */
  reason?: string;
}

export async function rollbackRestart(
  slockHome: string,
  currentBinaryDir: string,
  deps: {
    readSupervisorPid?: () => Promise<number | null>;
    isProcessAlive?: (pid: number) => boolean;
    killSupervisor?: (pid: number) => Promise<void>;
    forceKillSupervisor?: (pid: number) => Promise<void>;
    waitForExit?: (pid: number, timeoutMs: number) => Promise<boolean>;
    spawnFreshSupervisor?: () => Promise<void>;
    healthCheck?: () => Promise<boolean>;
    healthTimeoutMs?: number;
    healthPollIntervalMs?: number;
    fsRename?: (from: string, to: string) => Promise<void>;
    fsRm?: (path: string) => Promise<void>;
  } = {},
): Promise<RollbackResult> {
  const readSupervisorPid = deps.readSupervisorPid ?? (() => defaultReadSupervisorPid(slockHome));
  const isProcessAlive = deps.isProcessAlive ?? defaultIsProcessAlive;
  const killSupervisor = deps.killSupervisor ?? defaultKillSupervisor;
  const forceKillSupervisor = deps.forceKillSupervisor ?? defaultForceKillSupervisor;
  const waitForExit = deps.waitForExit ?? defaultWaitForExit;
  const spawnFreshSupervisor = deps.spawnFreshSupervisor;
  const healthCheck = deps.healthCheck ?? (() => defaultHealthCheck(slockHome));
  const healthTimeoutMs = deps.healthTimeoutMs ?? 30_000;
  const healthPollIntervalMs = deps.healthPollIntervalMs ?? 500;

  // Step 1: stop any live (new-version) supervisor before reverting bits.
  let supervisorStopped = false;
  try {
    const pid = await readSupervisorPid();
    if (pid === null || !isProcessAlive(pid)) {
      // Nothing to stop; treat as success so we still proceed to disk +
      // respawn the old supervisor.
      supervisorStopped = true;
    } else {
      await killSupervisor(pid);
      const exited = await waitForExit(pid, 10_000);
      if (!exited) {
        // Graceful kill timed out — escalate so rollback is not stalled
        // by a wedged new-version supervisor.
        await forceKillSupervisor(pid);
        const escalatedExit = await waitForExit(pid, 5_000);
        supervisorStopped = escalatedExit;
      } else {
        supervisorStopped = true;
      }
    }
  } catch (e) {
    return {
      binaryRestored: false,
      supervisorStopped: false,
      supervisorRespawned: false,
      supervisorHealthy: false,
      failedStep: "stop",
      reason: e instanceof Error ? e.message : String(e),
    };
  }
  if (!supervisorStopped) {
    return {
      binaryRestored: false,
      supervisorStopped: false,
      supervisorRespawned: false,
      supervisorHealthy: false,
      failedStep: "stop",
      reason: "new-version supervisor did not exit (graceful + SIGKILL both timed out)",
    };
  }

  // Step 2: restore .prev → currentBinaryDir.
  const swapRb = await rollbackSwap(currentBinaryDir, {
    fsRename: deps.fsRename,
    fsRm: deps.fsRm,
  });
  if (!swapRb.rolledBack) {
    return {
      binaryRestored: false,
      supervisorStopped: true,
      supervisorRespawned: false,
      supervisorHealthy: false,
      failedStep: "binary",
      reason: "could not restore .prev → currentBinaryDir",
    };
  }

  // Step 3: respawn old supervisor (from the now-restored bits). When no
  // spawn callback is wired, rollback completes the disk restore but does
  // not attempt to respawn — orchestrator surfaces this as "binary back,
  // supervisor not respawned" so an operator (or external supervisor)
  // can decide how to revive the process.
  if (!spawnFreshSupervisor) {
    return {
      binaryRestored: true,
      supervisorStopped: true,
      supervisorRespawned: false,
      supervisorHealthy: false,
      failedStep: "respawn",
      reason: "no spawnFreshSupervisor callback wired; old supervisor not respawned",
    };
  }
  try {
    await spawnFreshSupervisor();
  } catch (e) {
    return {
      binaryRestored: true,
      supervisorStopped: true,
      supervisorRespawned: false,
      supervisorHealthy: false,
      failedStep: "respawn",
      reason: e instanceof Error ? e.message : String(e),
    };
  }

  // Step 4: health-check the respawned old supervisor.
  const start = Date.now();
  let healthy = false;
  while (Date.now() - start < healthTimeoutMs) {
    if (await healthCheck()) {
      healthy = true;
      break;
    }
    await new Promise((r) => setTimeout(r, healthPollIntervalMs));
  }
  if (!healthy) {
    return {
      binaryRestored: true,
      supervisorStopped: true,
      supervisorRespawned: true,
      supervisorHealthy: false,
      failedStep: "health",
      reason: "old supervisor failed health check after rollback respawn",
    };
  }

  return {
    binaryRestored: true,
    supervisorStopped: true,
    supervisorRespawned: true,
    supervisorHealthy: true,
  };
}

// --- phase 5: restart ---

export interface RestartResult {
  ok: boolean;
  reason?: "supervisor_kill_failed" | "spawn_failed" | "health_check_timeout";
  /** Milliseconds elapsed before health became OK (when ok=true). */
  healthAfterMs?: number;
}

/**
 * Phase 5 — Restart the supervisor with the freshly-swapped binary and
 * health-check it. Steps:
 *   1. Read the current supervisor PID (if any).
 *   2. SIGTERM it; wait for the process to exit.
 *   3. Spawn a fresh detached supervisor process.
 *   4. Poll the health check until OK or timeout.
 *
 * When the supervisor isn't running (no pidfile / dead pid), step 1+2
 * are no-ops — we still spawn fresh in step 3.
 *
 * Test-injectable: every external effect (read pid, kill, spawn, health)
 * is a deps callback. The orchestrator's caller is responsible for
 * deciding what "healthy" means (typically: pidfile present + process
 * alive + supervisor's reconcile loop has had one tick).
 */
export async function restartPhase(
  slockHome: string,
  deps: {
    readSupervisorPid?: () => Promise<number | null>;
    killSupervisor?: (pid: number) => Promise<void>;
    waitForExit?: (pid: number, timeoutMs: number) => Promise<boolean>;
    spawnFreshSupervisor?: () => Promise<void>;
    healthCheck?: () => Promise<boolean>;
    healthTimeoutMs?: number;
    healthPollIntervalMs?: number;
    /**
     * §2.7 force-mode kill. When true, the supervisor is sent SIGKILL
     * instead of SIGTERM and we do not wait for graceful exit. In-flight
     * daemon turns are dropped. Default false.
     */
    forceKill?: boolean;
    forceKillSupervisor?: (pid: number) => Promise<void>;
  } = {},
): Promise<RestartResult> {
  const readSupervisorPid = deps.readSupervisorPid ?? (() => defaultReadSupervisorPid(slockHome));
  const killSupervisor = deps.killSupervisor ?? defaultKillSupervisor;
  const forceKillSupervisor = deps.forceKillSupervisor ?? defaultForceKillSupervisor;
  const waitForExit = deps.waitForExit ?? defaultWaitForExit;
  const spawnFreshSupervisor = deps.spawnFreshSupervisor;
  const healthCheck = deps.healthCheck ?? (() => defaultHealthCheck(slockHome));
  const healthTimeoutMs = deps.healthTimeoutMs ?? 30_000;
  const healthPollIntervalMs = deps.healthPollIntervalMs ?? 500;
  const forceKill = deps.forceKill === true;

  // Step 1+2: stop the old supervisor (best-effort; might not be running).
  // Dayu blocker (#wg-slock-computer:b43b36fb msg=911eb84e): the previous
  // version dropped the `waitForExit` boolean, so a wedged old supervisor
  // would silently survive into step 3. Spawn would then race the still-
  // alive pid; the default health probe (pidfile + kill(pid, 0)) would see
  // the OLD process alive and report HEALTHY, leading to a "successful
  // upgrade" that is actually still running the old bits. Fix: treat
  // waitForExit=false as the escalation trigger — SIGKILL + waitForExit
  // again, and only proceed if the OS confirms the pid is gone.
  const oldPid = await readSupervisorPid();
  if (oldPid !== null) {
    try {
      if (forceKill) {
        // §2.7 force: SIGKILL, no waitForExit. Operator opted in to
        // dropping in-flight turns to recover a stuck daemon.
        await forceKillSupervisor(oldPid);
      } else {
        await killSupervisor(oldPid);
        const exited = await waitForExit(oldPid, 10_000);
        if (!exited) {
          await forceKillSupervisor(oldPid);
          const escalatedExit = await waitForExit(oldPid, 5_000);
          if (!escalatedExit) {
            return { ok: false, reason: "supervisor_kill_failed" };
          }
        }
      }
    } catch {
      return { ok: false, reason: "supervisor_kill_failed" };
    }
  }

  // Step 3: spawn the fresh one. If no spawn callback is provided, the
  // orchestrator's caller is expected to spawn separately (e.g. when the
  // upgrade is initiated by a CLI that itself will re-exec).
  if (spawnFreshSupervisor) {
    try {
      await spawnFreshSupervisor();
    } catch {
      return { ok: false, reason: "spawn_failed" };
    }
  }

  // Step 4: poll health.
  const start = Date.now();
  while (Date.now() - start < healthTimeoutMs) {
    if (await healthCheck()) {
      return { ok: true, healthAfterMs: Date.now() - start };
    }
    await new Promise((r) => setTimeout(r, healthPollIntervalMs));
  }
  return { ok: false, reason: "health_check_timeout" };
}

async function defaultReadSupervisorPid(slockHome: string): Promise<number | null> {
  try {
    const raw = (await readFile(supervisorPidPath(slockHome), "utf8")).trim();
    const pid = Number.parseInt(raw, 10);
    return Number.isInteger(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

async function defaultKillSupervisor(pid: number): Promise<void> {
  try {
    process.kill(pid, "SIGTERM");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ESRCH") return; // already dead
    throw err;
  }
}

async function defaultForceKillSupervisor(pid: number): Promise<void> {
  try {
    process.kill(pid, "SIGKILL");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ESRCH") return; // already dead
    throw err;
  }
}

/**
 * §2.7 defer pre-check (v1 stub). Reports whether any managed daemon is
 * currently serving an agent turn or in-flight RPC. v1 returns false
 * unconditionally because the daemon side does not yet expose a busy
 * surface (tracked as an RFC v0.8 §11 follow-up). The orchestrator wires
 * this through `deps.isDaemonBusy` so the real probe — once it lands —
 * can be swapped in without touching upgrade.ts.
 */
async function defaultIsDaemonBusy(_slockHome: string): Promise<boolean> {
  return false;
}

async function defaultWaitForExit(pid: number, timeoutMs: number): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      process.kill(pid, 0);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ESRCH") return true;
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

async function defaultHealthCheck(slockHome: string): Promise<boolean> {
  const pid = await defaultReadSupervisorPid(slockHome);
  if (pid === null) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return (err as NodeJS.ErrnoException).code === "EPERM";
  }
}

// --- phase 6: cleanup ---

/**
 * Phase 6 (success path) — Delete staging dir, snapshot, and `.prev`
 * after the new binary is verified healthy. All operations are best-
 * effort: a missing file is fine, an undeletable file logs nothing
 * (it'll be picked up by the next supervisor startup recovery pass).
 */
export async function cleanupSuccessPhase(
  slockHome: string,
  version: string,
  prevBinaryDir: string,
): Promise<void> {
  await cleanupStaged(slockHome, version);
  await clearUpgradeSnapshot(slockHome);
  try {
    await rm(prevBinaryDir, { recursive: true, force: true });
  } catch {
    /* best-effort; next supervisor cleanup will retry */
  }
}

// --- orchestrator: runUpgrade ---

/**
 * §2.7 drain modes — controls how an in-progress daemon workload
 * (active agent turns, in-flight RPCs) is handled before the
 * supervisor + daemons are restarted with the new binary.
 *
 *   drain  (default) — Send SIGTERM, allow each daemon's graceful
 *                      shutdown path (DaemonCore.stop()) to finish in-
 *                      flight work, then proceed with swap + restart.
 *                      Bounded by the existing waitForExit timeout in
 *                      restartPhase.
 *   defer  — Pre-flight check: if `isDaemonBusy()` reports any managed
 *            daemon is currently serving a turn / in-flight call, abort
 *            the upgrade with UPGRADE_DEFERRED. Operator can retry
 *            later when the system is quieter. v1 wiring uses a stub
 *            `isDaemonBusy` that always returns false until daemon
 *            exposes a real busy surface (RFC v0.8 §11 follow-up).
 *   force  — Skip graceful drain. Use SIGKILL (not SIGTERM) on the
 *            supervisor + daemons, with no waitForExit. Intended ONLY
 *            for stuck-daemon recovery; in-flight turns are dropped.
 *            Use `--force` on the CLI to opt in.
 */
export type DrainMode = "drain" | "defer" | "force";

export interface UpgradeOptions {
  /** Semver of the target version to install. */
  targetVersion: string;
  /** Semver of the currently-running binary (used in snapshot). */
  fromVersion: string;
  /** Channel that triggered this upgrade ("latest" / "alpha" / "pinned:..."). */
  channel: string;
  /**
   * Absolute path to the install root of the currently-running binary
   * (the dir that will be renamed to `.prev`). For an npm global install
   * this is `<npm-root>/@slock-ai/computer`.
   */
  currentBinaryDir: string;
  /**
   * §2.7 drain mode. Defaults to "drain". `defer` aborts if any daemon
   * is busy; `force` SIGKILLs without graceful shutdown.
   */
  drainMode?: DrainMode;
  /** Dependency callbacks for test injection (all optional). */
  deps?: {
    npmPack?: (cwd: string, packageRef: string) => Promise<{ tarballPath: string; exitCode: number; stderr: string }>;
    fsReadFile?: (path: string) => Promise<Buffer>;
    fetchAdvertisedHash?: (version: string) => Promise<string | null>;
    tarSpawn?: (tarballPath: string, destDir: string) => Promise<{ exitCode: number; stderr: string }>;
    npmInstall?: (cwd: string) => Promise<{ exitCode: number; stderr: string }>;
    fsRename?: (from: string, to: string) => Promise<void>;
    fsRm?: (path: string) => Promise<void>;
    readSupervisorPid?: () => Promise<number | null>;
    killSupervisor?: (pid: number) => Promise<void>;
    waitForExit?: (pid: number, timeoutMs: number) => Promise<boolean>;
    spawnFreshSupervisor?: () => Promise<void>;
    healthCheck?: () => Promise<boolean>;
    healthTimeoutMs?: number;
    healthPollIntervalMs?: number;
    // §2.4 rolling daemon health-check
    listManagedServerIds?: (slockHome: string) => Promise<string[]>;
    readDaemonPid?: (slockHome: string, serverId: string) => Promise<number | null>;
    isProcessAlive?: (pid: number) => boolean;
    perDaemonTimeoutMs?: number;
    daemonPollIntervalMs?: number;
    // §2.7 force-mode kill (forwarded to restartPhase)
    forceKillSupervisor?: (pid: number) => Promise<void>;
    // §2.7 defer pre-check
    isDaemonBusy?: (slockHome: string) => Promise<boolean>;
    // PR-E 18/n phase 1.5 dep-drift preflight (forwarded to
    // preflightDepDriftCheck).
    preflight?: PreflightDeps;
  };
}

export interface UpgradeOutcome {
  ok: boolean;
  /** The phase that decided the outcome (last successful phase if ok=true). */
  phase:
    | "drain"
    | "stage"
    | "verify"
    | "preflight"
    | "hydrate"
    | "snapshot"
    | "extract"
    | "swap"
    | "restart"
    | "rolling_health"
    | "cleanup";
  reason?: string;
  staged?: StageResult;
  verify?: VerifyResult;
  /** PR-E 18/n dep-drift preflight detail (only present when preflight ran). */
  preflight?: DepDriftResult;
  swap?: SwapResult;
  restart?: RestartResult;
  /** §2.4 rolling daemon health-check result (post-supervisor-restart). */
  rolling?: RollingHealthResult;
  /**
   * True when phase 5 OR rolling-health failed AND the orchestrator's
   * operational rollback (stop new supervisor → restore .prev → respawn
   * old supervisor → health-check) completed FULLY. Disk-only restore
   * with a still-stale process is reported as `rolledBack=false` —
   * inspect `rollback` for per-step status.
   */
  rolledBack?: boolean;
  /** Per-step rollback detail (only present when rollback was attempted). */
  rollback?: RollbackResult;
}

/**
 * Run the full 6-phase upgrade flow:
 *   1. stage → 2. verify → preflight → 3. snapshot → extract → hydrate → 4. swap → 5. restart → 6. cleanup
 *
 * Failure handling per phase:
 *   - 1 (stage): no state to clean; return ok=false.
 *   - 2 (verify): drop staging dir; return ok=false.
 *   - extract: drop staging dir; return ok=false.
 *   - hydrate: drop staging dir; return ok=false.
 *   - 3 (snapshot): drop staging dir; return ok=false.
 *   - 4 (swap): swap itself attempts internal rollback; snapshot is kept
 *               for forensic; staging dir is kept (operator inspection).
 *   - 5 (restart) / rolling_health: operational rollback —
 *                  stop the new-version supervisor → restore .prev →
 *                  respawn the old supervisor → health-check the
 *                  respawned process. Disk + process must both come back;
 *                  per-step status is surfaced on `outcome.rollback`.
 *                  Snapshot + staging are kept for forensic.
 *   - 6 (cleanup): best-effort; any partial state is retried by the
 *                  supervisor's next startup cleanup pass.
 */
export async function runUpgrade(slockHome: string, opts: UpgradeOptions): Promise<UpgradeOutcome> {
  const deps = opts.deps ?? {};
  const drainMode: DrainMode = opts.drainMode ?? "drain";

  // Phase 0 (§2.7): defer pre-check. Only `defer` mode aborts on busy;
  // `drain` and `force` proceed regardless.
  if (drainMode === "defer") {
    const isBusy = deps.isDaemonBusy ?? defaultIsDaemonBusy;
    let busy = false;
    try {
      busy = await isBusy(slockHome);
    } catch {
      // If the busy probe itself fails, fall through to upgrade — better
      // to upgrade than block forever on a broken probe.
      busy = false;
    }
    if (busy) {
      return {
        ok: false,
        phase: "drain",
        reason: "deferred: daemon busy (--drain defer)",
      };
    }
  }

  // Phase 1: stage
  let staged: StageResult;
  try {
    staged = await stagePhase(slockHome, opts.targetVersion, {
      npmPack: deps.npmPack,
      fsReadFile: deps.fsReadFile,
    });
  } catch (e) {
    // Drop any partial staging dir so retry is safe. stagePhase may have
    // created the dir before the throw (e.g. mid-tarball-write).
    await cleanupStaged(slockHome, opts.targetVersion);
    return { ok: false, phase: "stage", reason: e instanceof Error ? e.message : String(e) };
  }

  // Phase 2: verify
  const verify = await verifyPhase(staged, { fetchAdvertisedHash: deps.fetchAdvertisedHash });
  if (!verify.ok) {
    await cleanupStaged(slockHome, opts.targetVersion);
    return { ok: false, phase: "verify", reason: verify.reason, staged, verify };
  }

  // Phase 2.5 (PR-E 18/n): dep-drift preflight. Runs AFTER verify (we
  // trust the bytes match the registry) and BEFORE snapshot/swap (no
  // pre-swap state is created on fail). Refuses with stable code
  // `UPGRADE_DEPS_CHANGED` when:
  //   - target package's `@slock-ai/daemon` spec != current's, OR
  //   - currently-installed daemon version doesn't satisfy target spec, OR
  //   - either spec is non-semver-range (workspace:/file:/url/…) and
  //     `deps.preflight.allowUnsafeSpec` is not explicitly true.
  let stagedTarballPath: string;
  try {
    stagedTarballPath = await locateStagedTarball(staged.stagedPath);
  } catch (e) {
    await cleanupStaged(slockHome, opts.targetVersion);
    return {
      ok: false,
      phase: "preflight",
      reason: e instanceof Error ? e.message : String(e),
      staged,
      verify,
    };
  }
  const preflight = await preflightDepDriftCheck(
    opts.currentBinaryDir,
    stagedTarballPath,
    deps.preflight ?? {},
  );
  if (!preflight.ok) {
    // Fail-closed cleanup: drop staging dir, never write snapshot, leave
    // attachment/managed/.lock state untouched. The orchestrator
    // contract (Jianwei msg=18117731 / Dayu msg=cab2b6f7) requires that
    // a preflight failure looks identical on disk to "upgrade was never
    // attempted" from the perspective of attachments and the supervisor.
    await cleanupStaged(slockHome, opts.targetVersion);
    return {
      ok: false,
      phase: "preflight",
      reason: preflight.detail ?? preflight.reason ?? "dep_drift",
      staged,
      verify,
      preflight,
    };
  }

  // Phase 3: snapshot
  const snap: UpgradeSnapshot = {
    at: new Date().toISOString(),
    fromVersion: opts.fromVersion,
    toVersion: opts.targetVersion,
    channel: opts.channel,
  };
  try {
    await snapshotPhase(slockHome, snap);
  } catch (e) {
    await cleanupStaged(slockHome, opts.targetVersion);
    return {
      ok: false,
      phase: "snapshot",
      reason: e instanceof Error ? e.message : String(e),
      staged,
      verify,
    };
  }

  // Extract tarball so phase 4 has a binary tree to rename. We already
  // located the tarball during phase 2.5 preflight; reuse that path.
  let extractedPackageDir: string;
  try {
    const ex = await extractTarball(
      stagedTarballPath,
      join(staged.stagedPath, "extracted"),
      { tarSpawn: deps.tarSpawn },
    );
    extractedPackageDir = ex.extractedPackageDir;
  } catch (e) {
    await cleanupStaged(slockHome, opts.targetVersion);
    await clearUpgradeSnapshot(slockHome);
    return {
      ok: false,
      phase: "extract",
      reason: e instanceof Error ? e.message : String(e),
      staged,
      verify,
    };
  }

  try {
    await hydrateStagedDependencies(extractedPackageDir, { npmInstall: deps.npmInstall });
  } catch (e) {
    await cleanupStaged(slockHome, opts.targetVersion);
    await clearUpgradeSnapshot(slockHome);
    return {
      ok: false,
      phase: "hydrate",
      reason: e instanceof Error ? e.message : String(e),
      staged,
      verify,
    };
  }

  // Phase 4: swap
  let swap: SwapResult;
  try {
    swap = await swapPhase(opts.currentBinaryDir, extractedPackageDir, {
      fsRename: deps.fsRename,
      fsRm: deps.fsRm,
    });
  } catch (e) {
    // Snapshot + staging kept for forensic per docstring.
    return {
      ok: false,
      phase: "swap",
      reason: e instanceof Error ? e.message : String(e),
      staged,
      verify,
    };
  }

  // Phase 5: restart + supervisor health-check
  const restart = await restartPhase(slockHome, {
    readSupervisorPid: deps.readSupervisorPid,
    killSupervisor: deps.killSupervisor,
    forceKillSupervisor: deps.forceKillSupervisor,
    waitForExit: deps.waitForExit,
    spawnFreshSupervisor: deps.spawnFreshSupervisor,
    healthCheck: deps.healthCheck,
    healthTimeoutMs: deps.healthTimeoutMs,
    healthPollIntervalMs: deps.healthPollIntervalMs,
    forceKill: drainMode === "force",
  });
  if (!restart.ok) {
    const rb = await rollbackRestart(slockHome, opts.currentBinaryDir, {
      readSupervisorPid: deps.readSupervisorPid,
      isProcessAlive: deps.isProcessAlive,
      killSupervisor: deps.killSupervisor,
      forceKillSupervisor: deps.forceKillSupervisor,
      waitForExit: deps.waitForExit,
      spawnFreshSupervisor: deps.spawnFreshSupervisor,
      healthCheck: deps.healthCheck,
      healthTimeoutMs: deps.healthTimeoutMs,
      healthPollIntervalMs: deps.healthPollIntervalMs,
      fsRename: deps.fsRename,
      fsRm: deps.fsRm,
    });
    return {
      ok: false,
      phase: "restart",
      reason: restart.reason,
      staged,
      verify,
      swap,
      restart,
      rolledBack: rb.binaryRestored && rb.supervisorHealthy,
      rollback: rb,
    };
  }

  // §2.4 rolling daemon health — confirm each managed daemon comes up
  // one-at-a-time before declaring the upgrade healthy.
  const rolling = await rollingDaemonHealthCheck(slockHome, {
    listManagedServerIds: deps.listManagedServerIds,
    readDaemonPid: deps.readDaemonPid,
    isProcessAlive: deps.isProcessAlive,
    perDaemonTimeoutMs: deps.perDaemonTimeoutMs,
    pollIntervalMs: deps.daemonPollIntervalMs,
  });
  if (!rolling.ok) {
    const rb = await rollbackRestart(slockHome, opts.currentBinaryDir, {
      readSupervisorPid: deps.readSupervisorPid,
      isProcessAlive: deps.isProcessAlive,
      killSupervisor: deps.killSupervisor,
      forceKillSupervisor: deps.forceKillSupervisor,
      waitForExit: deps.waitForExit,
      spawnFreshSupervisor: deps.spawnFreshSupervisor,
      healthCheck: deps.healthCheck,
      healthTimeoutMs: deps.healthTimeoutMs,
      healthPollIntervalMs: deps.healthPollIntervalMs,
      fsRename: deps.fsRename,
      fsRm: deps.fsRm,
    });
    const failed = rolling.daemons.find((d) => !d.ok);
    return {
      ok: false,
      phase: "rolling_health",
      reason: failed
        ? `daemon ${failed.serverId} unhealthy after restart: ${failed.reason ?? "unknown"}`
        : "rolling daemon health failed",
      staged,
      verify,
      swap,
      restart,
      rolling,
      rolledBack: rb.binaryRestored && rb.supervisorHealthy,
      rollback: rb,
    };
  }

  // Phase 6: cleanup-success
  await cleanupSuccessPhase(slockHome, opts.targetVersion, swap.prevBinaryDir);

  return { ok: true, phase: "cleanup", staged, verify, swap, restart, rolling };
}

// --- §2.4 rolling daemon health-check (post-restart, pre-cleanup) ---

export interface PerDaemonHealth {
  serverId: string;
  ok: boolean;
  reason?: "pidfile_missing" | "process_dead" | "timeout";
  healthAfterMs?: number;
}

export interface RollingHealthResult {
  ok: boolean;
  /** Per-daemon health entries in the order they were checked. */
  daemons: PerDaemonHealth[];
}

/**
 * §2.4 rolling daemon health check. After phase 5 brings the supervisor
 * back up with the new binary, the supervisor's reconcile loop spawns
 * a daemon child per managed server. We confirm each daemon is live
 * (pidfile present + process alive) one-at-a-time in sequence:
 *
 *   - "Rolling" = sequential, not parallel. A daemon must reach OK
 *     before the next is checked. This gives the operator a clear
 *     "which server failed to come up" signal instead of a confused
 *     "some daemons didn't make it" lump.
 *   - First failure short-circuits to ok=false. The orchestrator can
 *     decide whether to still report the partial-success daemon list.
 *   - When no managed servers exist (fresh install / detach-all),
 *     returns ok=true with an empty daemons array.
 *
 * Test-injectable: pidfile reads + liveness probes go through deps so
 * tests can simulate "daemon X never came up" without spawning real
 * processes. The default `listManagedServerIds` lookup is also a deps
 * callback for the same reason.
 */
export async function rollingDaemonHealthCheck(
  slockHome: string,
  deps: {
    listManagedServerIds?: (slockHome: string) => Promise<string[]>;
    readDaemonPid?: (slockHome: string, serverId: string) => Promise<number | null>;
    isProcessAlive?: (pid: number) => boolean;
    perDaemonTimeoutMs?: number;
    pollIntervalMs?: number;
  } = {},
): Promise<RollingHealthResult> {
  const list = deps.listManagedServerIds ?? listManagedServerIds;
  const readDaemonPid = deps.readDaemonPid ?? defaultReadDaemonPid;
  const isProcessAlive = deps.isProcessAlive ?? defaultIsProcessAlive;
  const perDaemonTimeoutMs = deps.perDaemonTimeoutMs ?? 30_000;
  const pollIntervalMs = deps.pollIntervalMs ?? 500;

  const managed = await list(slockHome);
  const daemons: PerDaemonHealth[] = [];

  for (const serverId of managed) {
    const start = Date.now();
    let lastReason: PerDaemonHealth["reason"] = "timeout";
    let healthy = false;
    while (Date.now() - start < perDaemonTimeoutMs) {
      const pid = await readDaemonPid(slockHome, serverId);
      if (pid === null) {
        lastReason = "pidfile_missing";
      } else if (!isProcessAlive(pid)) {
        lastReason = "process_dead";
      } else {
        healthy = true;
        break;
      }
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }
    const entry: PerDaemonHealth = healthy
      ? { serverId, ok: true, healthAfterMs: Date.now() - start }
      : { serverId, ok: false, reason: lastReason };
    daemons.push(entry);
    if (!healthy) {
      return { ok: false, daemons };
    }
  }

  return { ok: true, daemons };
}

async function defaultReadDaemonPid(slockHome: string, serverId: string): Promise<number | null> {
  try {
    const raw = (await readFile(serverDaemonPidPath(slockHome, serverId), "utf8")).trim();
    const pid = Number.parseInt(raw, 10);
    return Number.isInteger(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

function defaultIsProcessAlive(pid: number): boolean {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return (err as NodeJS.ErrnoException).code === "EPERM";
  }
}

/**
 * Locate the `.tgz` tarball produced by `npm pack` inside the staging
 * dir. npm pack writes exactly one file named like
 * `slock-ai-computer-<version>.tgz`; we read the dir and return the
 * first match. Throws when none found (orchestrator maps to UPGRADE_
 * EXTRACT_FAILED via the extract phase wrapper).
 */
async function locateStagedTarball(stagedPath: string): Promise<string> {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(stagedPath);
  const tgz = entries.find((e) => e.endsWith(".tgz"));
  if (!tgz) {
    throw new Error(`no .tgz tarball found in staged dir ${stagedPath}`);
  }
  return join(stagedPath, tgz);
}
