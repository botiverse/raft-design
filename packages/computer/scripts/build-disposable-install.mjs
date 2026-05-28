#!/usr/bin/env node
/**
 * Disposable @slock-ai/computer install builder — PR-E §QA harness.
 *
 * Builds a self-contained, real `npm install`-style fixture of the
 * `@slock-ai/computer` package at a caller-specified version, in an
 * isolated temp directory with FULL dependency resolution (commander /
 * proper-lockfile / undici / @slock-ai/daemon all properly resolved).
 *
 * QA path for PR-E final production gate (Jianwei msg=645c49fd + Dayu
 * msg=73312d23): we need to prove `slock-computer upgrade` actually
 * swaps the installed-package binary on disk AND that the running
 * supervisor reflects the new version. A copied workspace path won't do
 * — pnpm symlinks break out of the monorepo. This builder produces TWO
 * such installs (call twice with `--version A` and `--version B`) so
 * the upgrade flow can be exercised with real bits, not workspace tree.
 *
 * Important: this script is intentionally NOT inside the runtime source
 * tree. It's a QA/release harness, not a user-facing feature. The
 * production `upgrade` command continues to fetch from npm registry; it
 * has no knowledge of locally-staged tarballs.
 *
 * Usage:
 *   node packages/computer/scripts/build-disposable-install.mjs \
 *     --version 0.0.1-fixtureA \
 *     --out /tmp/pr-e-fixtureA
 *
 * Output (single line of JSON on stdout for easy `eval`-style capture):
 *   {"installRoot":"/tmp/pr-e-fixtureA","binPath":".../bin/slock-computer","version":"0.0.1-fixtureA","tarballPath":".../slock-ai-computer-0.0.1-fixtureA.tgz"}
 *
 * The `--out` dir is created if missing and must not contain a prior
 * install (refuses to overwrite — fail-closed to protect against
 * accidental `rm -rf` of an unintended dir).
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, rmSync, cpSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const computerPkgDir = resolve(here, "..");
const repoRoot = resolve(computerPkgDir, "..", "..");

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--version") out.version = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--help" || a === "-h") {
      out.help = true;
    } else {
      process.stderr.write(`Unknown arg: ${a}\n`);
      process.exit(2);
    }
  }
  return out;
}

function usage() {
  process.stdout.write(
    `Usage: node packages/computer/scripts/build-disposable-install.mjs --version <semver> --out <dir>\n`,
  );
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (r.status !== 0) {
    process.stderr.write(`Command failed: ${cmd} ${args.join(" ")} (exit ${r.status})\n`);
    process.exit(r.status ?? 1);
  }
  return r;
}

function runCapture(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: "utf8", ...opts });
  if (r.status !== 0) {
    process.stderr.write(`Command failed: ${cmd} ${args.join(" ")} (exit ${r.status})\n`);
    process.stderr.write(r.stderr ?? "");
    process.exit(r.status ?? 1);
  }
  return r.stdout;
}

const args = parseArgs(process.argv);
if (args.help || !args.version || !args.out) {
  usage();
  process.exit(args.help ? 0 : 2);
}

const SEMVER_RE = /^\d+\.\d+\.\d+(?:[-+][\w.-]+)?$/;
if (!SEMVER_RE.test(args.version)) {
  process.stderr.write(`--version "${args.version}" is not valid semver-ish.\n`);
  process.exit(2);
}

const outDir = resolve(args.out);
if (existsSync(outDir)) {
  const entries = readdirSync(outDir);
  if (entries.length > 0) {
    process.stderr.write(`--out "${outDir}" exists and is not empty. Refusing to overwrite.\n`);
    process.exit(2);
  }
}
mkdirSync(outDir, { recursive: true });

// Stage area for the version-bumped package source we'll pack.
const stageDir = join(tmpdir(), `slock-computer-fixture-stage-${args.version}-${process.pid}`);
if (existsSync(stageDir)) rmSync(stageDir, { recursive: true, force: true });
mkdirSync(stageDir, { recursive: true });

process.stderr.write(`[1/5] Build @slock-ai/computer (workspace) so dist/ is current...\n`);
run("pnpm", ["--filter", "@slock-ai/computer", "build"], { cwd: repoRoot });

process.stderr.write(`[2/5] Copy package files into stage dir + bump version to ${args.version}...\n`);
// Mirror `files` whitelist from package.json: dist + package.json (and README if present).
cpSync(join(computerPkgDir, "dist"), join(stageDir, "dist"), { recursive: true });
const pkgRaw = JSON.parse(readFileSync(join(computerPkgDir, "package.json"), "utf8"));
pkgRaw.version = args.version;
// Pin @slock-ai/daemon workspace dep to a real version string so npm install can resolve it.
// We bundle a built daemon tarball alongside; rewrite the dep to file: reference below.
const daemonPkgDir = resolve(repoRoot, "packages", "daemon");
process.stderr.write(`[3/5] Build + pack @slock-ai/daemon for bundled file: dep...\n`);
run("pnpm", ["--filter", "@slock-ai/daemon", "build"], { cwd: repoRoot });
const daemonPackOut = runCapture("pnpm", ["pack", "--pack-destination", stageDir], {
  cwd: daemonPkgDir,
});
const daemonTgzMatch = daemonPackOut.match(/(slock-ai-daemon-[\d.]+[\w.-]*\.tgz)/);
if (!daemonTgzMatch) {
  process.stderr.write(`Could not parse daemon tarball name from pnpm pack output:\n${daemonPackOut}\n`);
  process.exit(1);
}
const daemonTgz = daemonTgzMatch[1];
pkgRaw.dependencies["@slock-ai/daemon"] = `file:./${daemonTgz}`;
writeFileSync(join(stageDir, "package.json"), JSON.stringify(pkgRaw, null, 2) + "\n");

process.stderr.write(`[4/5] pnpm pack the staged computer package...\n`);
const computerPackOut = runCapture("pnpm", ["pack", "--pack-destination", stageDir], { cwd: stageDir });
const computerTgzMatch = computerPackOut.match(/(slock-ai-computer-[\w.+-]+\.tgz)/);
if (!computerTgzMatch) {
  process.stderr.write(`Could not parse computer tarball name from pnpm pack output:\n${computerPackOut}\n`);
  process.exit(1);
}
const computerTgz = join(stageDir, computerTgzMatch[1]);

process.stderr.write(`[5/5] npm install ${computerTgzMatch[1]} into ${outDir} (isolated)...\n`);
writeFileSync(join(outDir, "package.json"), JSON.stringify({
  name: "slock-computer-fixture-host",
  version: "0.0.0",
  private: true,
}, null, 2) + "\n");
run("npm", ["install", "--no-audit", "--no-fund", "--prefix", outDir, computerTgz], {
  cwd: outDir,
});

const installRoot = join(outDir, "node_modules", "@slock-ai", "computer");
const binPath = join(outDir, "node_modules", ".bin", "slock-computer");
if (!existsSync(binPath)) {
  process.stderr.write(`Expected bin at ${binPath} but not found after install.\n`);
  process.exit(1);
}
if (!existsSync(join(installRoot, "package.json"))) {
  process.stderr.write(`Expected ${installRoot}/package.json but not found.\n`);
  process.exit(1);
}

// Sanity-check the installed version matches what we asked for.
const installedPkg = JSON.parse(readFileSync(join(installRoot, "package.json"), "utf8"));
if (installedPkg.version !== args.version) {
  process.stderr.write(
    `Installed version ${installedPkg.version} != requested ${args.version}.\n`,
  );
  process.exit(1);
}

const result = {
  installRoot,
  binPath,
  version: args.version,
  tarballPath: computerTgz,
};
process.stdout.write(JSON.stringify(result) + "\n");
