/**
 * Run server unit tests for a specific shard, using the assignment in
 * `test-shard-manifest.json`. Used by the unit-server CI job.
 *
 * Why this exists: Node's built-in `--test-shard=I/N` partitions by file
 * index (round-robin) which produces a ~2.2x max/min imbalance on this
 * codebase. The manifest groups files into balanced buckets by historical
 * duration so each shard finishes in roughly the same wall-clock time.
 *
 * Usage:
 *   tsx scripts/runTestShard.ts <shard-index>
 * Example:
 *   tsx scripts/runTestShard.ts 3        # run shard 3 from manifest
 *
 * Coverage safety: any `*.test.ts` file present on disk but absent from
 * the manifest (added since the manifest was last refreshed) is appended
 * to shard 1 so it always runs. This guarantees no test silently drops
 * out between manifest refreshes; worst case the slowest shard takes a
 * bit longer until the next daily refresh.
 */

import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

interface ShardManifest {
  generatedAt: string;
  shardCount: number;
  totalFiles: number;
  shards: Array<{ shard: number; expectedDurationMs: number; files: string[] }>;
}

const SERVER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = path.join(SERVER_DIR, "test-shard-manifest.json");

function toManifestPath(file: string): string {
  return file.split(path.sep).join("/");
}

async function listAllTestFiles(): Promise<string[]> {
  const out: string[] = [];
  const SRC_DIR = path.join(SERVER_DIR, "src");
  async function walk(dir: string) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(p);
      else if (entry.isFile() && p.endsWith(".test.ts")) {
        out.push(toManifestPath(path.relative(SERVER_DIR, p)));
      }
    }
  }
  await walk(SRC_DIR);
  return out;
}

async function main() {
  const arg = process.argv[2];
  const shardIndex = Number(arg);
  if (!Number.isInteger(shardIndex) || shardIndex < 1) {
    console.error("Usage: tsx scripts/runTestShard.ts <shard-index>");
    process.exit(2);
  }

  const manifest: ShardManifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  if (shardIndex > manifest.shardCount) {
    console.error(`Shard ${shardIndex} out of range (manifest has ${manifest.shardCount}).`);
    process.exit(2);
  }

  const allOnDisk = new Set(await listAllTestFiles());
  const claimed = new Set<string>();
  for (const s of manifest.shards) for (const f of s.files) claimed.add(f);
  const orphans = [...allOnDisk].filter((f) => !claimed.has(f)).sort();

  const myShard = manifest.shards.find((s) => s.shard === shardIndex)!;
  const myFiles = [...myShard.files];
  if (shardIndex === 1 && orphans.length > 0) {
    console.log(
      `[runTestShard] manifest is stale; ${orphans.length} test file(s) not in manifest, appending to shard 1:`,
    );
    for (const f of orphans) console.log("  ", f);
    myFiles.push(...orphans);
  }

  // Also detect files in the manifest that no longer exist on disk
  // (renamed / deleted). Drop them with a warning rather than asking
  // `node --test` to read a missing file.
  const present = myFiles.filter((f) => allOnDisk.has(f));
  const missing = myFiles.filter((f) => !allOnDisk.has(f));
  if (missing.length > 0) {
    console.log(`[runTestShard] manifest references ${missing.length} missing file(s); skipping:`);
    for (const f of missing) console.log("  ", f);
  }

  console.log(
    `[runTestShard] shard ${shardIndex}/${manifest.shardCount}: ${present.length} files (expected ~${(myShard.expectedDurationMs / 1000).toFixed(1)}s)`,
  );

  const child = spawn("node", ["--import", "tsx", "--test", ...present], {
    cwd: SERVER_DIR,
    env: { ...process.env, TZ: process.env.TZ || "Asia/Singapore" },
    stdio: "inherit",
  });
  child.on("exit", (code) => process.exit(code ?? 1));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
