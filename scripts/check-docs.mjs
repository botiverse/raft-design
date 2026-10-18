#!/usr/bin/env node
// Checks the design system's documentation against the code it describes:
// front matter, component status against the exports, `example` and `tokens`
// blocks, relative links and their anchors, token names, and the language.
//
//   node scripts/check-docs.mjs            errors fail; coverage gaps are warnings
//   node scripts/check-docs.mjs --strict   coverage gaps fail too
//
// The rules it enforces are in design/authoring/README.md.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const strict = process.argv.includes("--strict");
const componentsDir = path.join(root, "packages/ui/src/components");
const modulesDir = path.join(root, "apps/doc/src/modules");

const STATUSES = new Set(["experimental", "stable", "deprecated"]);
const CATEGORIES = new Set([
  "actions",
  "inputs",
  "navigation",
  "identity",
  "status",
  "content",
  "agents",
  "overlays",
  "feedback",
  "layout",
]);
const MARKETING =
  /\b(powerful|beautiful|delightful|seamless(ly)?|best-in-class|stunning|effortless(ly)?|build something bold)\b/i;
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uff00-\uffef]/;

// Templates hold placeholders, not pages.
const SKIPPED = [/^design\/authoring\/templates\//];

const errors = [];
const warnings = [];
const fail = (file, message) => errors.push(`${file}: ${message}`);
const warn = (file, message) => warnings.push(`${file}: ${message}`);

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const rel = (file) => path.relative(root, file).split(path.sep).join("/");

const designDocs = walk(path.join(root, "design")).filter(
  (file) => file.endsWith(".md") && !SKIPPED.some((pattern) => pattern.test(rel(file))),
);
const componentDirs = readdirSync(componentsDir).filter((name) =>
  statSync(path.join(componentsDir, name)).isDirectory(),
);
const componentDocs = componentDirs
  .map((dir) => path.join(componentsDir, dir, `${dir}.md`))
  .filter((file) => existsSync(file));

// Token names, from the same paths the generator turns into custom properties.
const tokens = JSON.parse(readFileSync(path.join(root, "packages/ui/src/tokens.json"), "utf8"));
const tokenGroups = new Set(Object.keys(tokens).filter((key) => !key.startsWith("$")));
const currentTokens = new Set();
const deprecatedTokens = new Set();
(function collect(node, trail) {
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith("$") && key !== "$root") continue;
    if (!child || typeof child !== "object") continue;
    if ("$value" in child) {
      const parts = [...trail, key].filter((part) => part !== "$root");
      if (parts[0] === "deprecated") deprecatedTokens.add(parts.slice(1).join("-"));
      else currentTokens.add(parts.join("-"));
    } else collect(child, [...trail, key]);
  }
})(tokens, []);

const indexSource = readFileSync(path.join(root, "packages/ui/src/index.ts"), "utf8");
const wipSource = readFileSync(path.join(root, "packages/ui/src/wip.ts"), "utf8");
const exportsFrom = (source, dir) =>
  new RegExp(`from "\\./components/${dir}(?:/[^"]*)?"`).test(source);
const deprecatedIn = (dir) =>
  walk(path.join(componentsDir, dir)).some(
    (file) =>
      /\.tsx?$/.test(file) &&
      !/\.test\.tsx?$/.test(file) &&
      readFileSync(file, "utf8").includes("@deprecated"),
  );

function frontMatter(file, source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    fail(file, "missing front matter");
    return {};
  }
  const data = {};
  // A value may continue on indented lines (the formatter wraps long lists).
  const lines = match[1]
    .replace(/:\s*\n\s+(?=\S)/g, ": ")
    .replace(/\n\s+(?=[\]\w,])/g, " ")
    .split("\n");
  for (const line of lines) {
    const field = line.match(/^([A-Za-z]+):\s*(.*?)\s*(?:#.*)?$/);
    if (!field) continue;
    const [, key, raw] = field;
    data[key] = raw.startsWith("[")
      ? raw
          .slice(1, -1)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : raw;
  }
  return data;
}

function slug(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_~[\]()]/g, "")
    .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
    .replace(/\s/g, "-");
}

const anchorCache = new Map();
function anchorsOf(file) {
  if (!anchorCache.has(file)) {
    const seen = new Map();
    const anchors = new Set();
    let fenced = false;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      if (/^(```|~~~)/.test(line)) fenced = !fenced;
      const heading = !fenced && line.match(/^#{1,6}\s+(.*)$/);
      if (!heading) continue;
      const base = slug(heading[1]);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      anchors.add(count ? `${base}-${count}` : base);
    }
    anchorCache.set(file, anchors);
  }
  return anchorCache.get(file);
}

function checkBody(file, source, absolute) {
  // Four-backtick fences show Markdown source (an example of an `example` block), not blocks.
  const body = source.replace(/^---\n[\s\S]*?\n---\n/, "").replace(/^````[\s\S]*?^````/gm, "");
  if (CJK.test(body)) fail(file, "contains Chinese text; the docs are in English");
  // The writing guide lists the words it bans.
  const marketing = file === "design/authoring/writing.md" ? null : body.match(MARKETING);
  if (marketing) warn(file, `promotional wording "${marketing[0]}"; describe instead`);

  for (const block of body.matchAll(/^```example\n([\s\S]*?)^```/gm)) {
    for (const target of block[1]
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)) {
      const base = path.join(modulesDir, target);
      if (![".tsx", ".composition.tsx", ".preview.tsx"].some((ext) => existsSync(base + ext))) {
        fail(file, `example "${target}" has no composition under apps/doc/src/modules`);
      }
    }
  }
  for (const block of body.matchAll(/^```tokens\n([\s\S]*?)^```/gm)) {
    for (const group of block[1]
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)) {
      if (!tokenGroups.has(group)) fail(file, `tokens block names unknown group "${group}"`);
    }
  }

  const prose = body
    .replace(/^```[\s\S]*?^```/gm, "")
    .replace(/`[^`\n]*`/g, (span) => (span.includes("](") ? "``" : span));
  for (const link of prose.matchAll(/\]\(([^)\s]+)\)/g)) {
    const href = link[1];
    if (/^[a-z]+:/i.test(href) || href.startsWith("//")) continue;
    const [target, anchor] = href.split("#");
    const resolved = target ? path.resolve(path.dirname(absolute), target) : absolute;
    if (!existsSync(resolved)) {
      fail(file, `link to missing ${href}`);
      continue;
    }
    if (anchor && resolved.endsWith(".md") && !anchorsOf(resolved).has(anchor)) {
      fail(file, `link to missing anchor ${href}`);
    }
  }
  for (const code of prose.matchAll(/`([a-z][a-z0-9-]*)`/g)) {
    const name = code[1];
    if (deprecatedTokens.has(name) && !currentTokens.has(name)) {
      fail(file, `uses the deprecated token \`${name}\``);
    }
  }
}

for (const absolute of designDocs) {
  const file = rel(absolute);
  const source = readFileSync(absolute, "utf8");
  const data = frontMatter(file, source);
  if (!data.title) fail(file, "front matter has no title");
  if (!data.summary) fail(file, "front matter has no summary");
  checkBody(file, source, absolute);
}

for (const absolute of componentDocs) {
  const file = rel(absolute);
  const dir = path.basename(path.dirname(absolute));
  const source = readFileSync(absolute, "utf8");
  const data = frontMatter(file, source);
  if (!data.title) fail(file, "front matter has no title");
  if (!data.summary) fail(file, "front matter has no summary");
  if (!STATUSES.has(data.status))
    fail(file, `status "${data.status}" is not experimental, stable or deprecated`);
  if (!CATEGORIES.has(data.category))
    fail(file, `category "${data.category}" is not one of ${[...CATEGORIES].join(", ")}`);
  if (data.aliases !== undefined && !Array.isArray(data.aliases))
    fail(file, "aliases must be a list");
  for (const related of Array.isArray(data.related) ? data.related : []) {
    if (!componentDirs.includes(related)) fail(file, `related "${related}" is not a component`);
  }
  const stable = exportsFrom(indexSource, dir);
  const experimental = exportsFrom(wipSource, dir);
  if (data.status === "stable" && !stable)
    fail(file, "status is stable, but raft-ui does not export it");
  if (data.status === "experimental" && !experimental)
    fail(file, "status is experimental, but raft-ui/wip does not export it");
  if (data.status === "deprecated" && !deprecatedIn(dir))
    fail(file, "status is deprecated, but the code has no @deprecated");
  if (data.status !== "deprecated" && deprecatedIn(dir) && stable)
    warn(file, "the code is @deprecated; set status: deprecated");
  checkBody(file, source, absolute);
}

for (const dir of componentDirs) {
  if (!(exportsFrom(indexSource, dir) || exportsFrom(wipSource, dir))) continue;
  if (!existsSync(path.join(componentsDir, dir, `${dir}.md`))) {
    (strict ? fail : warn)(`packages/ui/src/components/${dir}`, "exported but has no doc");
  }
}

for (const message of warnings) console.warn(`warning  ${message}`);
for (const message of errors) console.error(`error    ${message}`);
console.log(
  `${designDocs.length + componentDocs.length} docs checked: ${errors.length} error(s), ${warnings.length} warning(s)`,
);
process.exit(errors.length ? 1 : 0);
