// Slock Computer auto-upgrade — phase 1.5 dependency-drift preflight.
// PR-E 18/n. Cross-thread anchor: #wg-slock-computer:b43b36fb
// msg=f4539e9d (Dayu blocker) + msg=18117731 / cab2b6f7 (Jianwei +
// Dayu narrow-v1 sign-off).
//
// WHY THIS EXISTS
// ===============
// `swapPhase` only renames the Computer package-root dir
// (`node_modules/@slock-ai/computer`). The dependency tree under the
// shared `node_modules/` (notably `@slock-ai/daemon`, externalized by
// `tsup.config.ts`) is unchanged across A→B. If the target version of
// `@slock-ai/computer` declares a different `@slock-ai/daemon` version
// than is currently installed, the swapped-in B will resolve A's daemon
// at runtime — a silent runtime-dependency mismatch.
//
// v1 explicitly does NOT do a full install-tree refresh (that requires
// a re-architect of stage/swap/snapshot/rollback around `npm install`
// semantics, prepare/postinstall, lockfile, optional deps, and partial-
// install rollback — incompatible with the single-rename atomicity that
// makes the current flow safe). Instead, v1 detects the drift early and
// fail-closes with a stable error code so the operator runs
// `npm install -g @slock-ai/computer@<version>` manually.
//
// JIANWEI'S THREE-WAY PREDICATE (msg=18117731)
// --------------------------------------------
// Continue only when ALL of:
//   1. target package's declared spec for `@slock-ai/daemon`
//      === current package's declared spec, AND
//   2. currently-installed `@slock-ai/daemon` version satisfies the
//      target spec.
// Anything else (mismatch, unsafe spec, missing read) → fail-closed.
//
// DAYU'S UNSAFE-SPEC RULE (msg=cab2b6f7)
// --------------------------------------
// `workspace:`, `file:`, `git+`, `path:`, URL-shaped, and any non-range
// spec is REJECTED in user-facing `upgrade` (production mode). Hidden
// QA harnesses MAY opt out via `allowUnsafeSpec` so install-smoke
// tarballs (built from workspace) still work.
//
// FAIL-CLOSED INVARIANTS (cross-checked in upgrade.ts)
// ----------------------------------------------------
// Detected drift must reach the orchestrator BEFORE phase 3 (snapshot)
// so no snapshot or `.prev` is ever created on the fail path. Staging
// dir is cleaned up by the orchestrator. `.lock` releases normally
// (preflight does not touch it). Per-server `attachment.json` /
// `managed.flag` are never touched.

import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export const DAEMON_PACKAGE_NAME = "@slock-ai/daemon";

/**
 * Stable reason enums surfaced on `DepDriftResult.reason` and folded
 * into the upgrade outcome's `reason` string. The CLI maps the outer
 * phase to the stable error code `UPGRADE_DEPS_CHANGED` (single code,
 * multiple reasons — same shape as `verifyPhase`'s reason enum).
 */
export type DepDriftReason =
  | "spec_changed"
  | "installed_unsatisfied"
  | "unsafe_spec"
  | "read_failed";

export interface DepDriftResult {
  ok: boolean;
  reason?: DepDriftReason;
  /** Human-readable detail for the CLI / logs. */
  detail?: string;
  /** Declared spec on the currently-installed Computer's `package.json`. */
  currentSpec?: string;
  /** Declared spec on the target tarball's `package.json`. */
  targetSpec?: string;
  /** Actual version of `@slock-ai/daemon` currently resolved on disk. */
  installedVersion?: string;
}

export interface PreflightDeps {
  /** Read the target tarball's `package/package.json` (npm-pack layout). */
  readTarballPackageJson?: (tarballPath: string) => Promise<TargetPackageJsonShape>;
  /** Read `<currentBinaryDir>/package.json`. */
  readCurrentPackageJson?: (currentBinaryDir: string) => Promise<TargetPackageJsonShape>;
  /** Read the on-disk daemon's `package.json#version`. */
  readInstalledDaemonVersion?: (currentBinaryDir: string) => Promise<string | null>;
  /** Predicate `semver.satisfies(version, range)`. */
  semverSatisfies?: (version: string, range: string) => boolean;
  /**
   * When true, `workspace:`, `file:`, `git+`, URL-shaped, etc. are
   * accepted (hidden QA harness only). Production `upgrade` keeps this
   * `false` so untrusted/unsafe specs fail-close.
   */
  allowUnsafeSpec?: boolean;
}

export interface TargetPackageJsonShape {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
}

/**
 * Phase 1.5 — dep-drift preflight.
 *
 * Runs AFTER verify (so we know the tarball bytes match the registry)
 * and BEFORE snapshot (so a failed preflight leaves zero pre-swap state
 * on disk). Reads three pieces of evidence and applies Jianwei's
 * three-way predicate. Production callers pass `allowUnsafeSpec=false`
 * (default); the hidden install-smoke harness sets it to `true` so
 * workspace-built tarballs work.
 */
export async function preflightDepDriftCheck(
  currentBinaryDir: string,
  stagedTarballPath: string,
  deps: PreflightDeps = {},
): Promise<DepDriftResult> {
  const readTarball = deps.readTarballPackageJson ?? defaultReadTarballPackageJson;
  const readCurrent = deps.readCurrentPackageJson ?? defaultReadCurrentPackageJson;
  const readInstalled = deps.readInstalledDaemonVersion ?? defaultReadInstalledDaemonVersion;
  const satisfies = deps.semverSatisfies ?? defaultSemverSatisfies;
  const allowUnsafe = deps.allowUnsafeSpec === true;

  let targetPkg: TargetPackageJsonShape;
  let currentPkg: TargetPackageJsonShape;
  let installedVersion: string | null;
  try {
    targetPkg = await readTarball(stagedTarballPath);
  } catch (e) {
    return {
      ok: false,
      reason: "read_failed",
      detail: `cannot read target tarball package.json: ${errMsg(e)}`,
    };
  }
  try {
    currentPkg = await readCurrent(currentBinaryDir);
  } catch (e) {
    return {
      ok: false,
      reason: "read_failed",
      detail: `cannot read current binary package.json: ${errMsg(e)}`,
    };
  }
  try {
    installedVersion = await readInstalled(currentBinaryDir);
  } catch (e) {
    return {
      ok: false,
      reason: "read_failed",
      detail: `cannot read installed ${DAEMON_PACKAGE_NAME} version: ${errMsg(e)}`,
    };
  }

  const targetSpec = targetPkg.dependencies?.[DAEMON_PACKAGE_NAME];
  const currentSpec = currentPkg.dependencies?.[DAEMON_PACKAGE_NAME];

  if (typeof targetSpec !== "string" || targetSpec.length === 0) {
    return {
      ok: false,
      reason: "read_failed",
      detail: `target tarball package.json has no ${DAEMON_PACKAGE_NAME} dependency entry`,
      currentSpec,
    };
  }
  if (typeof currentSpec !== "string" || currentSpec.length === 0) {
    return {
      ok: false,
      reason: "read_failed",
      detail: `current binary package.json has no ${DAEMON_PACKAGE_NAME} dependency entry`,
      targetSpec,
    };
  }
  if (installedVersion === null || installedVersion.length === 0) {
    return {
      ok: false,
      reason: "read_failed",
      detail: `${DAEMON_PACKAGE_NAME} is not installed at the expected location next to the current binary`,
      currentSpec,
      targetSpec,
    };
  }

  // Unsafe spec gate — applied to BOTH current and target. A spec is
  // "unsafe" if it carries a non-semver prefix (workspace:/file:/git:/
  // etc — `isUnsafeSpec`) OR if its operator-free portion does not
  // parse as a semver range (`isUnparseableRange`). Both shapes mean
  // we can't reduce to a satisfaction predicate, so production fails
  // closed; the hidden harness opts in via `allowUnsafeSpec`.
  //
  // Dayu nit (msg=e25c0cd6): without the parseability check, a garbage
  // range string like "abc" would slip past the prefix check and then
  // surface as `installed_unsatisfied` from the satisfies() fallback.
  // Classifying it as `unsafe_spec` matches the v8 §11 wording.
  const unsafeCurrent = isUnsafeSpec(currentSpec) || isUnparseableRange(currentSpec);
  const unsafeTarget = isUnsafeSpec(targetSpec) || isUnparseableRange(targetSpec);
  const anyUnsafe = unsafeCurrent || unsafeTarget;
  if (!allowUnsafe && anyUnsafe) {
    return {
      ok: false,
      reason: "unsafe_spec",
      detail:
        `${DAEMON_PACKAGE_NAME} spec is not a safe semver range ` +
        `(current="${currentSpec}", target="${targetSpec}"). ` +
        `v1 auto-upgrade only supports semver ranges; ` +
        `re-install manually with \`npm install -g @slock-ai/computer@<version>\`.`,
      currentSpec,
      targetSpec,
      installedVersion,
    };
  }

  // Jianwei predicate, leg 1: target spec must equal current spec
  // verbatim. We compare string-equal (not semver-range equal) because
  // the published-tarball spec strings come from the same publish-time
  // workspace rewrite — they ARE byte-identical when no daemon bump
  // occurred. Any difference is itself the signal we need to refuse.
  if (currentSpec !== targetSpec) {
    return {
      ok: false,
      reason: "spec_changed",
      detail:
        `${DAEMON_PACKAGE_NAME} dependency spec changed from "${currentSpec}" to "${targetSpec}". ` +
        `Auto-upgrade only swaps the Computer package root; the runtime ` +
        `dependency tree is not refreshed. Run \`npm install -g @slock-ai/computer@<version>\` manually.`,
      currentSpec,
      targetSpec,
      installedVersion,
    };
  }

  // Jianwei predicate, leg 2: installed version must satisfy target
  // spec. Defensive against hand-edited node_modules or stale installs.
  //
  // Harness escape hatch (Dayu msg=11f705cc): when `allowUnsafeSpec`
  // is true AND the spec is unsafe AND leg 1 (string equality) already
  // passed, we have no way to reduce the spec to a satisfaction
  // predicate (workspace:* / file:./… don't carry a version range).
  // Skip leg 2 in that case — the install-smoke harness only needs
  // proof of package-root swap and active-version, not production
  // dependency-tree compatibility. Production never sets the flag, so
  // this branch is dead on the user-facing path.
  if (allowUnsafe && anyUnsafe) {
    return { ok: true, currentSpec, targetSpec, installedVersion };
  }
  if (!satisfies(installedVersion, targetSpec)) {
    return {
      ok: false,
      reason: "installed_unsatisfied",
      detail:
        `installed ${DAEMON_PACKAGE_NAME}@${installedVersion} does not satisfy ` +
        `target spec "${targetSpec}". Re-install with ` +
        `\`npm install -g @slock-ai/computer@<version>\`.`,
      currentSpec,
      targetSpec,
      installedVersion,
    };
  }

  return { ok: true, currentSpec, targetSpec, installedVersion };
}

/**
 * "Range is unparseable" = the spec has no exotic prefix (so
 * `isUnsafeSpec` returned false), but `defaultSemverSatisfies` cannot
 * find a valid version to compare against. Without this gate, garbage
 * strings like `"abc"`, `"^abc"`, or `"~xxx"` slip past the prefix
 * check and reach the satisfies() fallback where they surface as
 * `installed_unsatisfied` — which is the wrong stable reason per
 * v8 §11. Classify them as `unsafe_spec`.
 *
 * Implementation: try to parse the operator-free remainder as a
 * semver core; if that fails, the range is unparseable.
 */
function isUnparseableRange(spec: string): boolean {
  const s = spec.trim();
  if (s.length === 0) return true;
  // Compound `A B` AND-list — every part must be parseable.
  if (/\s/.test(s) && !s.includes("||")) {
    return s.split(/\s+/).some((p) => isUnparseableRange(p));
  }
  // OR-list — at least one branch must be parseable; otherwise unparseable.
  if (s.includes("||")) {
    return s.split("||").every((p) => isUnparseableRange(p.trim()));
  }
  // x-range: "0.41.x" / "0.41" — canonicalize and re-check.
  if (s.includes("x") || s.split(".").length < 3) {
    const canon = s.replace(/\.x/g, ".0");
    const padded = canon.split(".").length < 3
      ? `${canon}.0.0`.split(".").slice(0, 3).join(".")
      : canon;
    return parseSemver(padded) === null;
  }
  // Strip leading operator.
  let core = s;
  if (core.startsWith(">=") || core.startsWith("<=")) core = core.slice(2);
  else if (core.startsWith("^") || core.startsWith("~") || core.startsWith(">") || core.startsWith("<") || core.startsWith("=")) {
    core = core.slice(1);
  }
  return parseSemver(core) === null;
}

/**
 * "Unsafe" = anything we cannot reduce to a pure semver-range
 * satisfaction. Conservatively rejects:
 *   - workspace protocol (workspace:*, workspace:^x.y.z)
 *   - file: / link: protocol
 *   - git / git+ssh / git+https
 *   - tarball URLs (http://, https://)
 *   - npm: alias (`npm:other-pkg@^1.0.0`)
 *   - path-shaped (`./` or `../` or absolute)
 *   - `latest` / `*` / empty (range too broad to detect drift safely)
 */
function isUnsafeSpec(spec: string): boolean {
  const s = spec.trim();
  if (s.length === 0) return true;
  if (s === "*" || s === "latest") return true;
  if (s.startsWith("workspace:")) return true;
  if (s.startsWith("file:") || s.startsWith("link:")) return true;
  if (s.startsWith("git+") || s.startsWith("git:")) return true;
  if (s.startsWith("github:") || /^[^/\s]+\/[^/\s]+(?:#.*)?$/.test(s)) {
    // shorthand `user/repo` or `user/repo#ref`
    return true;
  }
  if (s.startsWith("http://") || s.startsWith("https://")) return true;
  if (s.startsWith("npm:")) return true;
  if (s.startsWith("./") || s.startsWith("../") || s.startsWith("/")) return true;
  return false;
}

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

// --- production default deps ---

/**
 * Stream-extract just `package/package.json` from the npm-pack tarball
 * (`-O` writes to stdout; `tar` exits 0 even on early-stop because we
 * specify the path). Avoids unpacking the full tarball just to read a
 * few hundred bytes of metadata.
 */
async function defaultReadTarballPackageJson(
  tarballPath: string,
): Promise<TargetPackageJsonShape> {
  const raw = await new Promise<string>((resolve, reject) => {
    const child = spawn("tar", ["-xzOf", tarballPath, "package/package.json"], {
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
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`tar -xzOf exited ${code}: ${stderrBuf.slice(0, 300)}`));
        return;
      }
      resolve(stdoutBuf);
    });
  });
  return JSON.parse(raw) as TargetPackageJsonShape;
}

async function defaultReadCurrentPackageJson(
  currentBinaryDir: string,
): Promise<TargetPackageJsonShape> {
  const raw = await readFile(join(currentBinaryDir, "package.json"), "utf8");
  return JSON.parse(raw) as TargetPackageJsonShape;
}

/**
 * Resolve the installed `@slock-ai/daemon` package's version using
 * Node's `node_modules` lookup paths anchored at the Computer's own
 * package root. Covers all real-world npm/pnpm layouts:
 *
 *   - npm global (nested):
 *       <prefix>/lib/node_modules/@slock-ai/computer/        ← currentBinaryDir
 *       <prefix>/lib/node_modules/@slock-ai/computer/node_modules/@slock-ai/daemon/
 *   - pnpm / project-scoped / disposable QA install (sibling-hoisted):
 *       <root>/node_modules/@slock-ai/computer/              ← currentBinaryDir
 *       <root>/node_modules/@slock-ai/daemon/
 *
 * Why `resolve.paths()`, NOT `resolve(subpath)` (PR-E 20/n blocker,
 * Jianwei msg=fd238c00 + Dayu fix msg=0f5f066b): the published daemon
 * `package.json` declares `exports: { "./core": { import: ... } }` —
 * `import` condition only. `createRequire` is CJS resolution and uses
 * the CJS condition set (`require` / `node` / `default`), so it does
 * not match `import`-only exports. `req.resolve("@slock-ai/daemon/core")`
 * therefore throws `ERR_PACKAGE_PATH_NOT_EXPORTED` even though
 * `await import("@slock-ai/daemon/core")` succeeds at runtime.
 * `req.resolve("@slock-ai/daemon/package.json")` fails for the same
 * reason — package.json is not in the exports map. Using `resolve.paths`
 * sidesteps the exports gate entirely because it returns the list of
 * `node_modules` directories Node WOULD search before any exports
 * negotiation happens. We then look for `<path>/@slock-ai/daemon/
 * package.json` on disk in each. That's what Node does internally
 * before condition matching, and it's the canonical way to find the
 * package root without depending on the exports map shape.
 *
 * Correctness invariant (Dayu msg=45b32f0b, liuliu msg=c049ded7):
 * the daemon `package.json` the preflight inspects MUST be the same
 * file Node would land on for `import("@slock-ai/daemon/core")` from
 * the post-swap Computer install. `resolve.paths` is anchored at the
 * SAME `package.json` that drives the runtime resolution, so the
 * `node_modules` walk order is identical.
 *
 * Returns null when resolution fails OR no `name === "@slock-ai/daemon"`
 * `package.json` is found in any search path OR the version field is
 * missing/malformed.
 */
async function defaultReadInstalledDaemonVersion(
  currentBinaryDir: string,
): Promise<string | null> {
  let searchPaths: readonly string[] | null;
  try {
    const anchor = pathToFileURL(join(currentBinaryDir, "package.json"));
    const req = createRequire(anchor);
    searchPaths = req.resolve.paths(DAEMON_PACKAGE_NAME);
  } catch {
    return null;
  }
  if (!searchPaths || searchPaths.length === 0) return null;

  // Iterate in the order Node would: inner `node_modules` first
  // (nested layout), then walk outward (sibling-hoisted, parent walk).
  const subPath = DAEMON_PACKAGE_NAME.split("/");
  for (const base of searchPaths) {
    const candidate = join(base, ...subPath, "package.json");
    try {
      const raw = await readFile(candidate, "utf8");
      const parsed = JSON.parse(raw) as { name?: string; version?: string };
      if (parsed.name !== DAEMON_PACKAGE_NAME) continue;
      if (typeof parsed.version === "string" && parsed.version.length > 0) {
        return parsed.version;
      }
      return null;
    } catch {
      // No package.json at this lookup path; keep searching.
    }
  }
  return null;
}

/**
 * Minimal semver range satisfier. Supports the cases real published
 * specs use after pnpm's workspace-rewrite at publish time:
 *
 *   - exact: "0.41.0"
 *   - caret: "^0.41.0", "^1.2.3"
 *   - tilde: "~0.41.0"
 *   - >= / > / <= / <:  ">=0.41.0", ">=0.41.0 <0.42.0"
 *   - x-range: "0.41.x", "0.41" (treated as caret on the trailing-zero)
 *
 * Pre-release tags (e.g. `0.41.0-rc.1`) are compared lexicographically
 * after the numeric core, matching npm semver for the simple cases v1
 * needs. Anything we can't parse → return false (treat as unsatisfied;
 * dep-drift refusal is the right default when in doubt).
 *
 * NB: this is deliberately minimal — `semver` the npm package is the
 * canonical reference but pulling it adds a transitive dep for a single
 * predicate call. Tests assert the exact set of cases supported; if a
 * release ever uses a spec shape we don't handle, the harness will
 * fail-closed and an operator can re-install manually.
 */
function defaultSemverSatisfies(version: string, range: string): boolean {
  const ver = parseSemver(version);
  if (ver === null) return false;
  const trimmed = range.trim();
  if (trimmed.length === 0) return false;

  // Compound `>=A <B` (space-separated AND-list).
  if (/\s/.test(trimmed) && !trimmed.includes("||")) {
    return trimmed.split(/\s+/).every((part) => defaultSemverSatisfies(version, part));
  }
  // `||` OR-list.
  if (trimmed.includes("||")) {
    return trimmed.split("||").some((part) => defaultSemverSatisfies(version, part.trim()));
  }

  if (trimmed.startsWith("^")) {
    return satisfiesCaret(ver, trimmed.slice(1));
  }
  if (trimmed.startsWith("~")) {
    return satisfiesTilde(ver, trimmed.slice(1));
  }
  if (trimmed.startsWith(">=")) return cmp(ver, trimmed.slice(2)) >= 0;
  if (trimmed.startsWith("<=")) return cmp(ver, trimmed.slice(2)) <= 0;
  if (trimmed.startsWith(">")) return cmp(ver, trimmed.slice(1)) > 0;
  if (trimmed.startsWith("<")) return cmp(ver, trimmed.slice(1)) < 0;
  if (trimmed.startsWith("=")) return cmp(ver, trimmed.slice(1)) === 0;
  // x-range: "0.41.x" / "0.41" — treat as caret on the trailing-zero
  // canonicalized version.
  if (trimmed.includes("x") || trimmed.split(".").length < 3) {
    const canon = trimmed.replace(/\.x/g, ".0");
    const padded = canon.split(".").length < 3 ? `${canon}.0.0`.split(".").slice(0, 3).join(".") : canon;
    return satisfiesCaret(ver, padded);
  }
  // Exact version match (no operator).
  return cmp(ver, trimmed) === 0;
}

interface ParsedSemver {
  major: number;
  minor: number;
  patch: number;
  pre: string;
}

function parseSemver(s: string): ParsedSemver | null {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(s.trim());
  if (!m) return null;
  return {
    major: Number.parseInt(m[1], 10),
    minor: Number.parseInt(m[2], 10),
    patch: Number.parseInt(m[3], 10),
    pre: m[4] ?? "",
  };
}

function cmp(a: ParsedSemver, bStr: string): number {
  const b = parseSemver(bStr);
  if (b === null) return Number.NaN; // unsatisfiable
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  if (a.patch !== b.patch) return a.patch - b.patch;
  // Pre-release: a version WITHOUT pre is GREATER than one with pre.
  if (a.pre === "" && b.pre !== "") return 1;
  if (a.pre !== "" && b.pre === "") return -1;
  if (a.pre === b.pre) return 0;
  return a.pre < b.pre ? -1 : 1;
}

function satisfiesCaret(ver: ParsedSemver, base: string): boolean {
  const b = parseSemver(base);
  if (b === null) return false;
  if (cmp(ver, base) < 0) return false;
  // Caret allows changes that do not modify the left-most non-zero element.
  if (b.major > 0) return ver.major === b.major;
  if (b.minor > 0) return ver.major === 0 && ver.minor === b.minor;
  // ^0.0.x → only patch can vary.
  return ver.major === 0 && ver.minor === 0 && ver.patch === b.patch;
}

function satisfiesTilde(ver: ParsedSemver, base: string): boolean {
  const b = parseSemver(base);
  if (b === null) return false;
  if (cmp(ver, base) < 0) return false;
  return ver.major === b.major && ver.minor === b.minor;
}
