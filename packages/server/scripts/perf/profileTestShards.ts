/**
 * Profile server unit-test files individually, then bin-pack them into N
 * shards via LPT-greedy so each CI shard finishes in roughly the same time.
 * Without this manifest, Node's built-in `--test-shard=I/N` slices by file
 * index (round-robin over the sorted file list), which on this codebase
 * yields a ~2.2x max/min imbalance — one shard runs ~520s while the
 * fastest finishes ~240s.
 *
 * Run: pnpm --filter @slock-ai/server tsx scripts/perf/profileTestShards.ts
 *
 * Output: writes `packages/server/test-shard-manifest.json` next to the
 * server package. The workflow reads that file to drive the matrix.
 *
 * Shard count is NOT hard-coded — it is recommended from the data:
 *   N* = clamp(ceil(T_total / T_max_file), MIN_SHARDS, MAX_SHARDS)
 * Rationale: T_max_file is a hard floor on any shard's runtime (you can't
 * subdivide a file), so the smallest N for which T_total/N ≤ T_max_file
 * is also the smallest N at which wall-clock has bottomed out. Beyond N*,
 * adding shards only raises CI cost without reducing wall-clock. The
 * clamp guards against churn from transient outliers and from GitHub's
 * concurrent-runner cap.
 *
 * Cadence: a scheduled GitHub Actions job re-runs this daily and opens a
 * PR if the assignment drifts (new tests added, durations shifted, or N*
 * changed). Manual runs are also fine when you want to refresh before
 * adding heavy tests.
 *
 * Notes:
 * - Serial execution (no parallel contention). Local timings reflect
 *   intrinsic per-file cost; CI then re-introduces parallelism only at the
 *   shard-runner level, where each shard runs on its own VM with no shared
 *   contention. Serial-local + parallel-CI shapes match.
 * - Per-file durations vary run-to-run by a few %, but the bin-pack is
 *   robust to that noise — sorting by historical duration descending then
 *   placing each file on the currently shortest shard converges to a
 *   near-optimal partition for any reasonable variance.
 * - Manifest carries per-file timings (`fileTimings`) so future refresh
 *   logic / N-recomputation can reason about the data without re-profiling.
 */

import { spawn, spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Bump when the manifest shape changes in a way that callers must adapt to.
// Today: runTestShard.ts + .github/workflows/test.yml read .shardCount and
// .shards[].files; refresh-test-shard-manifest.yml reads .totalDurationMsLocal
// and .maxFileDurationMsLocal for the PR body. A consumer pinning to
// schemaVersion = 1 should be safe across daily refreshes that only
// re-balance files or change shardCount.
const MANIFEST_SCHEMA_VERSION = 1;

// Bounds for the recommended-N computation. These are NOT a math optimum —
// the math optimum is `ceil(T_total / T_max_file)` (smallest N at which the
// T_max_file floor dominates wall-clock; past that, adding shards only raises
// CI cost). The bounds are a cost/concurrency POLICY:
//   - MIN guards against transient outliers from collapsing N below a useful
//     parallelism level (e.g. one slow file dragging the recommendation to
//     N=2 for a day).
//   - MAX guards against (a) per-shard checkout+install overhead becoming a
//     larger share of wall-clock than test work, (b) the workflow as a whole
//     pressing the GitHub free-tier ~20-concurrent-runner cap once stacked
//     against e2e (4) + unit-fast (1) + typecheck (1) + the two daemon-cli
//     contract jobs.
// Revisit the bounds after a week of CI data; if the steady-state
// recommendation hugs MAX_SHARDS, raising it (and accepting more runner-min
// spend) is a deliberate trade.
const MIN_SHARDS = 4;
const MAX_SHARDS = 12;
const SERVER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC_DIR = path.join(SERVER_DIR, "src");
const MANIFEST_PATH = path.join(SERVER_DIR, "test-shard-manifest.json");

function recommendShardCount(totalMs: number, maxFileMs: number): number {
  if (maxFileMs <= 0) return MIN_SHARDS;
  const ideal = Math.ceil(totalMs / maxFileMs);
  return Math.max(MIN_SHARDS, Math.min(MAX_SHARDS, ideal));
}

// All file paths emitted into the manifest are POSIX-style ('/'-separated),
// relative to packages/server. This keeps daily refresh diffs stable even if
// a future refresh happens to run on a Windows runner — the alternative
// (mixed '\' and '/' separators) would make the diff look like every file
// was renamed.
function toManifestPath(absPath: string): string {
  return path.relative(SERVER_DIR, absPath).split(path.sep).join("/");
}

async function listTestFiles(root: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(p);
      } else if (entry.isFile() && p.endsWith(".test.ts")) {
        out.push(toManifestPath(p));
      }
    }
  }
  await walk(root);
  out.sort();
  return out;
}

function tryGitHeadCommit(): string | null {
  try {
    const r = spawnSync("git", ["rev-parse", "HEAD"], { cwd: SERVER_DIR, encoding: "utf8" });
    if (r.status === 0 && r.stdout) return r.stdout.trim();
  } catch {
    // Non-fatal: a manifest without sourceCommit is still usable.
  }
  return null;
}

function runOne(file: string): Promise<{ file: string; durationMs: number; ok: boolean }> {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const child = spawn(
      "node",
      ["--import", "tsx", "--test", file],
      {
        cwd: SERVER_DIR,
        env: { ...process.env, TZ: "Asia/Singapore" },
        stdio: ["ignore", "ignore", "ignore"],
      },
    );
    child.on("exit", (code) => {
      resolve({ file, durationMs: Math.round(performance.now() - t0), ok: code === 0 });
    });
  });
}

function lptAssign(timings: Array<{ file: string; durationMs: number }>, shardCount: number) {
  const shards = Array.from({ length: shardCount }, () => ({ totalMs: 0, files: [] as string[] }));
  // Tie-breaker by path keeps assignment deterministic across V8 versions /
  // refresh runs when two files have equal (or near-equal, post-rounding)
  // durations — avoids spurious diff churn in the daily refresh PR.
  for (const r of [...timings].sort((a, b) => b.durationMs - a.durationMs || a.file.localeCompare(b.file))) {
    let target = 0;
    for (let i = 1; i < shards.length; i++) {
      if (shards[i].totalMs < shards[target].totalMs) target = i;
    }
    shards[target].totalMs += r.durationMs;
    shards[target].files.push(r.file);
  }
  for (const s of shards) s.files.sort();
  return shards;
}

function ensureDepsInstalled() {
  // A stale node_modules masks as test failures (e.g. ERR_MODULE_NOT_FOUND
  // for a dep added by a recent merge). Profile bails with "Refusing to
  // write manifest from a partial / failing profile" after ~10 min, when
  // a 1.8s `pnpm install --frozen-lockfile` up-front would have caught it.
  // Frozen-lockfile is intentional: this script must never mutate the
  // lockfile — if pnpm-lock.yaml drifted on disk, the daily refresh PR
  // should fail loud rather than silently rewrite locks.
  const repoRoot = path.resolve(SERVER_DIR, "../..");
  const r = spawnSync("pnpm", ["install", "--frozen-lockfile"], {
    cwd: repoRoot,
    stdio: "inherit",
  });
  if (r.status !== 0) {
    console.error("pnpm install --frozen-lockfile failed; aborting profile.");
    process.exit(1);
  }
}

async function main() {
  ensureDepsInstalled();
  const files = await listTestFiles(SRC_DIR);
  if (files.length === 0) {
    console.error("No *.test.ts files found under", SRC_DIR);
    process.exit(1);
  }
  console.log(`Profiling ${files.length} test files (serial; ETA ~6-10 min on a modern laptop)...`);

  const timings: Array<{ file: string; durationMs: number; ok: boolean }> = [];
  const tStart = performance.now();
  for (let i = 0; i < files.length; i++) {
    const r = await runOne(files[i]);
    timings.push(r);
    const elapsedS = Math.round((performance.now() - tStart) / 1000);
    const etaS = Math.round((elapsedS / (i + 1)) * (files.length - i - 1));
    process.stdout.write(
      `[${i + 1}/${files.length}] ${r.durationMs.toString().padStart(6)}ms ${r.ok ? "ok " : "FAIL"} ${r.file}  (eta ${etaS}s)\n`,
    );
  }

  const failed = timings.filter((t) => !t.ok);
  if (failed.length > 0) {
    console.error(`\n${failed.length} test file(s) failed during profiling:`);
    for (const f of failed) console.error("  ", f.file);
    console.error("Refusing to write manifest from a partial / failing profile.");
    process.exit(1);
  }

  const totalMs = timings.reduce((a, r) => a + r.durationMs, 0);
  const maxFileMs = Math.max(...timings.map((t) => t.durationMs));
  const shardCount = recommendShardCount(totalMs, maxFileMs);

  const shards = lptAssign(timings, shardCount);
  const manifest = {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    sourceCommit: tryGitHeadCommit(),
    nodeVersion: process.version,
    shardCount,
    totalFiles: timings.length,
    totalDurationMsLocal: totalMs,
    maxFileDurationMsLocal: maxFileMs,
    // Per-file timings retained so the next refresh can re-derive shardCount
    // without re-profiling, and so PR reviewers can see which files dominate.
    fileTimings: [...timings]
      .sort((a, b) => b.durationMs - a.durationMs || a.file.localeCompare(b.file))
      .map((t) => ({ file: t.file, durationMs: t.durationMs })),
    shards: shards.map((s, i) => ({
      shard: i + 1,
      expectedDurationMs: s.totalMs,
      files: s.files,
    })),
  };
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n");

  const max = Math.max(...shards.map((s) => s.totalMs));
  const min = Math.min(...shards.map((s) => s.totalMs));
  console.log("\nWrote", MANIFEST_PATH);
  console.log(
    `Summary: T_total ${(totalMs / 1000).toFixed(1)}s  T_max_file ${(maxFileMs / 1000).toFixed(1)}s  ` +
      `N* ${shardCount} (clamped to [${MIN_SHARDS}, ${MAX_SHARDS}], raw ceil=${Math.ceil(totalMs / maxFileMs)})  ` +
      `max ${(max / 1000).toFixed(1)}s  min ${(min / 1000).toFixed(1)}s  max/min ${(max / min).toFixed(2)}x`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
