// `slock-computer __upgrade-install-smoke` — hidden harness for PR-E 17/n.
//
// QA-only entrypoint that exercises the FULL `runUpgrade` 1→6 flow
// against a caller-supplied LOCAL tarball, bypassing the npm registry.
// Used by the disposable-install QA harness (see
// scripts/build-disposable-install.mjs) to prove that:
//
//   (a) installed-package contents on disk switch from A → B after
//       `runUpgrade` completes; and
//   (b) the supervisor that gets re-execed during phase 5 actually runs
//       the new bits (asserted by reading the supervisor-written
//       `supervisor-version.json` evidence file after spawn).
//
// Why this lives in a hidden subcommand (Dayu msg=a4aca63b):
//   - Production `slock-computer upgrade` MUST NOT learn about local
//     tarball overrides. Even hidden flags on the user-facing command
//     leak into the surface contract; QA bypasses live in a dedicated
//     `__`-prefixed harness instead.
//   - The harness composes the same `runUpgrade` primitives the
//     production CLI uses. Only `deps.npmPack` is swapped — for the
//     local-tarball copy + `deps.fetchAdvertisedHash` returning that
//     sha1 (so verify always matches the bytes we just put on disk).
//   - `deps.spawnFreshSupervisor` defaults to the SAME production
//     `spawnDetachedSupervisor`, so the smoke really does fork a fresh
//     supervisor against the swapped-in bits. That's how the active-
//     version evidence file ends up reflecting B instead of A.
//
// Cross-thread anchor: #wg-slock-computer:b43b36fb msg=a4aca63b
// (Dayu hidden-surface boundary) + msg=dd55ada2 (liuliu §3.2 mutex +
// QA-only docstring requirements).

import { copyFile, mkdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, isAbsolute, join, resolve as pathResolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runUpgrade, type UpgradeOutcome } from "./upgrade.js";
import { spawnDetachedSupervisor, readSupervisorVersionEvidence } from "./supervisor.js";

export interface InstallSmokeOptions {
  /** Absolute or relative path to the local `slock-ai-computer-*.tgz` tarball. */
  packageTarball: string;
  /** Semver label for the upgrade target. The smoke uses this in staging dir + snapshot. */
  targetVersion: string;
  /** Optional from-version label. Defaults to the current binary's `package.json` version. */
  fromVersion?: string;
  /** Optional channel label (for the snapshot only). Defaults to "latest". */
  channel?: string;
  /**
   * Optional override of the install root to upgrade. Defaults to the
   * currently-running binary's install root. The harness is typically
   * invoked from the disposable install whose contents are the upgrade
   * target's "current" state, so the default is correct.
   */
  currentBinaryDir?: string;
}

export interface InstallSmokeReport {
  outcome: UpgradeOutcome;
  /**
   * Snapshot of `supervisor-version.json` AFTER the upgrade flow returned.
   * Null if the file is missing/unreadable (e.g. upgrade failed before
   * spawn, or the spawned supervisor has not yet written its evidence).
   * The QA assertion is `report.activeVersion.version === <target>`.
   */
  activeVersion: Awaited<ReturnType<typeof readSupervisorVersionEvidence>>;
}

/**
 * Run the install-smoke flow. Invoked by the hidden CLI subcommand and
 * by unit tests; production code paths must NOT call this.
 *
 * Behavior:
 *   1. Resolve + validate the local tarball; compute its sha1.
 *   2. Resolve fromVersion + currentBinaryDir (caller may override).
 *   3. Call `runUpgrade` with:
 *        - npmPack:            copy the local tarball into staging.
 *        - fetchAdvertisedHash: return the just-computed sha1.
 *        - spawnFreshSupervisor: production `spawnDetachedSupervisor`
 *                                 (or caller-injected stub for tests).
 *      All other deps fall back to production defaults (real tar, real
 *      fs.rename, etc.) so the swap really happens on disk.
 *   4. After `runUpgrade` returns, read `supervisor-version.json` so
 *      the caller can assert which install root is actually running.
 *
 * The smoke does NOT poll or block on the new supervisor's readiness —
 * `runUpgrade`'s phase 5 already does that via the injected health
 * check. By the time control returns, the new supervisor has been
 * confirmed healthy (or rollback has restored the old one).
 */
export async function runUpgradeInstallSmoke(
  slockHome: string,
  opts: InstallSmokeOptions,
  deps: {
    spawnFreshSupervisor?: (slockHome: string) => Promise<void>;
    currentVersion?: () => Promise<string>;
    currentBinaryDir?: () => string;
  } = {},
): Promise<InstallSmokeReport> {
  if (typeof opts.packageTarball !== "string" || opts.packageTarball.trim().length === 0) {
    throw new Error("__upgrade-install-smoke: --package-tarball is required.");
  }
  const tarballPath = isAbsolute(opts.packageTarball)
    ? opts.packageTarball
    : pathResolve(opts.packageTarball);

  let tarballBytes: Buffer;
  try {
    tarballBytes = await readFile(tarballPath);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`__upgrade-install-smoke: cannot read --package-tarball ${tarballPath}: ${msg}`);
  }
  const tarballSha1 = createHash("sha1").update(tarballBytes).digest("hex");

  const currentBinaryDir =
    opts.currentBinaryDir ?? (deps.currentBinaryDir ?? defaultCurrentBinaryDirLocal)();
  const fromVersion =
    opts.fromVersion ?? (await (deps.currentVersion ?? defaultCurrentVersionLocal)());
  const channel = opts.channel ?? "latest";

  const spawnFreshSupervisor =
    deps.spawnFreshSupervisor ?? (async (h: string) => {
      await spawnDetachedSupervisor(h);
    });

  await mkdir(slockHome, { recursive: true });

  const outcome = await runUpgrade(slockHome, {
    targetVersion: opts.targetVersion,
    fromVersion,
    channel,
    currentBinaryDir,
    deps: {
      // QA-only bypass of `npm pack <pkg>@<ver>`: copy the caller-supplied
      // tarball into the staging dir under the expected filename. This is
      // the ONLY deviation from production `runUpgrade` plumbing — every
      // other dep falls back to its production default.
      npmPack: async (cwd) => {
        const filename = `slock-ai-computer-${opts.targetVersion}.tgz`;
        const stagedTarball = join(cwd, filename);
        await copyFile(tarballPath, stagedTarball);
        return { tarballPath: stagedTarball, exitCode: 0, stderr: "" };
      },
      // We trust the local tarball (caller built it from source via
      // build-disposable-install.mjs). Return its sha1 as the
      // "advertised" hash so verify is always satisfied.
      fetchAdvertisedHash: async () => tarballSha1,
      // Local QA tarballs are built from the workspace and may still
      // carry workspace/file specs. The production upgrade path hydrates
      // dependencies from the registry; this smoke isolates the swap /
      // restart mechanics and keeps dependency hydration out of scope.
      npmInstall: async () => ({ exitCode: 0, stderr: "" }),
      spawnFreshSupervisor: () => spawnFreshSupervisor(slockHome),
      // PR-E 18/n: the workspace-built tarball still carries
      // `workspace:*` (or `file:` after pack-rewrite in some workflows)
      // for `@slock-ai/daemon`, which production preflight rejects as
      // unsafe. The harness opts in to `allowUnsafeSpec` so the smoke
      // can run; production `runUpgrade` never sets this flag. The
      // spec-equality + installed-satisfies checks still run on
      // semver-shaped specs.
      preflight: { allowUnsafeSpec: true },
    },
  });

  const activeVersion = await readSupervisorVersionEvidence(slockHome);
  return { outcome, activeVersion };
}

/**
 * CLI adapter. Writes a single JSON line to stdout (parseable by the QA
 * driver). Always exits 0 — the JSON's `outcome.ok` field carries the
 * upgrade result; harness liveness is independent of the upgrade
 * outcome (matches `__upgrade-test`'s contract).
 */
export async function runUpgradeInstallSmokeCli(
  slockHome: string,
  opts: InstallSmokeOptions,
  writer: (line: string) => void = (s) => process.stdout.write(s),
): Promise<void> {
  let report: InstallSmokeReport;
  try {
    report = await runUpgradeInstallSmoke(slockHome, opts);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    writer(
      JSON.stringify({
        outcome: { ok: false, phase: "stage", reason: `harness_exception: ${msg}` },
        activeVersion: null,
      }) + "\n",
    );
    return;
  }
  writer(JSON.stringify(report) + "\n");
}

function defaultCurrentBinaryDirLocal(): string {
  // <install>/dist/upgradeInstallSmoke.js → two dirnames up = <install>.
  const here = fileURLToPath(import.meta.url);
  return dirname(dirname(here));
}

async function defaultCurrentVersionLocal(): Promise<string> {
  const pkgPath = join(defaultCurrentBinaryDirLocal(), "package.json");
  try {
    const raw = await readFile(pkgPath, "utf8");
    const parsed = JSON.parse(raw) as { version?: string };
    if (typeof parsed.version === "string" && parsed.version.length > 0) {
      return parsed.version;
    }
  } catch {
    /* fallthrough */
  }
  throw new Error(
    "__upgrade-install-smoke: cannot read current binary version from package.json; pass --from-version explicitly.",
  );
}
