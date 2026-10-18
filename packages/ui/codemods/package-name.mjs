#!/usr/bin/env node
// Moves a project from the unscoped `raft-ui` package to `@botiverse/raft-ui`.
//
//   pnpm add @botiverse/raft-ui      # or npm install, yarn add
//   node node_modules/@botiverse/raft-ui/codemods/package-name.mjs <dir>... [--version 0.7.0] [--dry]
//
// Rewrites import and require specifiers, CSS `@import` / `@source` /
// `@reference` paths, `node_modules/raft-ui` paths, and the `raft-ui`
// dependency in package.json files (to `--version`, default the version of the
// package this script ships in). It lists, without changing, any other place
// that names the bare string "raft-ui" (a bundler alias, a tsconfig path), so
// you can check those by hand. Run `token-names.mjs` afterwards to move to the
// current token names.
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const NEW = "@botiverse/raft-ui";
const SOURCE = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".mts",
  ".cts",
  ".css",
  ".html",
  ".vue",
  ".svelte",
]);
const SKIP = new Set(["node_modules", "dist", "build", ".git", ".next", ".turbo", "coverage"]);

const RULES = [
  // `(?<!@)import`: a CSS `@import` is the next rule's, not a JS import.
  [/(from\s+|import\(\s*|require\(\s*|(?<!@)import\s+)(["'])raft-ui(?=["'/])/g, `$1$2${NEW}`],
  [
    /(@import|@source|@reference|@plugin)(\s+(?:url\()?["'])([^"']*?)(?<![\w@/-])raft-ui(?=["'/])/g,
    `$1$2$3${NEW}`,
  ],
  [/node_modules\/raft-ui(?=["'/\s)])/g, `node_modules/${NEW}`],
];

export function renameSpecifiers(source) {
  let out = source;
  for (const [pattern, replacement] of RULES) out = out.replace(pattern, replacement);
  return out;
}

export function renameDependency(json, version) {
  let changed = false;
  for (const field of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    const deps = json[field];
    if (!deps || !("raft-ui" in deps)) continue;
    const next = {};
    for (const [name, range] of Object.entries(deps)) {
      if (name === "raft-ui")
        next[NEW] = range.startsWith("workspace:") || range.startsWith("link:") ? range : version;
      else next[name] = range;
    }
    json[field] = next;
    changed = true;
  }
  return changed;
}

function* walk(target) {
  const stat = statSync(target);
  if (stat.isFile()) {
    yield target;
    return;
  }
  for (const name of readdirSync(target)) {
    if (SKIP.has(name)) continue;
    yield* walk(path.join(target, name));
  }
}

function main(argv) {
  const dry = argv.includes("--dry");
  const versionIndex = argv.indexOf("--version");
  const ownPackage = JSON.parse(
    readFileSync(
      path.join(path.dirname(fileURLToPath(import.meta.url)), "../package.json"),
      "utf8",
    ),
  );
  const version = versionIndex >= 0 ? argv[versionIndex + 1] : ownPackage.version;
  const targets = argv.filter(
    (arg, index) => !arg.startsWith("--") && argv[index - 1] !== "--version",
  );
  if (targets.length === 0) {
    console.error("usage: package-name.mjs <dir>... [--version x.y.z] [--dry]");
    process.exit(1);
  }
  let changed = 0;
  const review = [];
  for (const target of targets) {
    for (const file of walk(target)) {
      const base = path.basename(file);
      const before = readFileSync(file, "utf8");
      let after = before;
      if (base === "package.json") {
        const json = JSON.parse(before);
        if (renameDependency(json, version)) after = `${JSON.stringify(json, null, 2)}\n`;
      } else if (SOURCE.has(path.extname(file))) {
        after = renameSpecifiers(before);
      } else continue;
      if (after !== before) {
        changed += 1;
        console.log(`${dry ? "would update" : "updated"} ${file}`);
        if (!dry) writeFileSync(file, after);
      }
      after.split("\n").forEach((line, index) => {
        if (/(?<![\w@/-])["']raft-ui["']/.test(line) && base !== "package.json") {
          review.push(`${file}:${index + 1}: ${line.trim()}`);
        }
      });
    }
  }
  console.log(`${changed} file${changed === 1 ? "" : "s"} ${dry ? "to update" : "updated"}`);
  if (review.length) {
    console.log(
      `\nCheck these by hand (a bare "raft-ui" string, such as an alias or a path mapping):`,
    );
    for (const line of review) console.log(`  ${line}`);
  }
  if (!dry && changed)
    console.log("\nNext: install dependencies, then run token-names.mjs on the same directories.");
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv.slice(2));
