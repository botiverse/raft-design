#!/usr/bin/env node
/**
 * Package-boundary lint (task #30 PR-B, RFC v0.8 contract v3 §2/§10).
 *
 * The agent-facing `@slock-ai/cli` and the human/Computer control-plane
 * `@slock-ai/computer` are SEPARATE entrypoints and MUST NOT import each
 * other in EITHER direction. PR #1573 was reverted for exactly this class
 * of package-boundary violation — this check is the durable guard so it
 * cannot regress silently. Lightweight static import scan (no heavy
 * tooling), runnable locally + in CI, by design (mirrors the repo's
 * inline-node check pattern, e.g. check-migrations.yml).
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const FORBIDDEN = [
  { dir: "packages/computer/src", banned: "@slock-ai/cli", who: "@slock-ai/computer" },
  { dir: "packages/cli/src", banned: "@slock-ai/computer", who: "@slock-ai/cli" },
];
const IMPORT_RE = /(?:import|export)[^;]*?from\s*["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)/g;

function walk(d) {
  const out = [];
  if (!existsSync(d)) return out;
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(ts|mts|cts|js|mjs|cjs)$/.test(e)) out.push(p);
  }
  return out;
}

let violations = 0;
for (const { dir, banned, who } of FORBIDDEN) {
  for (const file of walk(join(repoRoot, dir))) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(IMPORT_RE)) {
      const spec = m[1] ?? m[2] ?? "";
      if (spec === banned || spec.startsWith(`${banned}/`)) {
        console.error(`BOUNDARY VIOLATION: ${who} file ${file} imports forbidden "${spec}"`);
        violations += 1;
      }
    }
  }
}
if (violations > 0) {
  console.error(`\n${violations} package-boundary violation(s). @slock-ai/cli <-> @slock-ai/computer must stay decoupled (see #1573).`);
  process.exit(1);
}
console.log("✓ package boundary: @slock-ai/cli <-> @slock-ai/computer decoupled (both directions).");
