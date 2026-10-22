#!/usr/bin/env node
// Keeps the translations in i18n/<locale>/ in step with the English pages
// they translate (i18n/README.md).
//
//   node scripts/i18n.mjs check           fails on a broken or stale translation
//   node scripts/i18n.mjs sync            gives every heading the English anchor, and a new
//                                         translation the hash of its English file
//   node scripts/i18n.mjs sync --mark <path>...
//                                         records that these translations match their English
//                                         file now (after bringing them up to date)
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sourceHash } from "../apps/doc/src/lib/i18n/source-hash.ts";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const i18nDir = path.join(root, "i18n");
const [command, ...rest] = process.argv.slice(2);
const marked = new Set(rest.filter((arg) => arg !== "--mark").map((arg) => path.resolve(arg)));

/** GitHub's anchor for a heading, as apps/doc/src/lib/content/slug.ts writes it. */
function headingSlug(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s/g, "-");
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/** `## Title {#id}` lines outside code fences: their line index, depth, text and anchor. */
function headingsOf(lines) {
  const headings = [];
  let inFence = false;
  lines.forEach((line, index) => {
    if (line.startsWith("```")) inFence = !inFence;
    if (inFence) return;
    const match = line.match(/^(#{2,6}) (.+)$/);
    if (!match) return;
    const explicit = match[2].match(/^(.*?)\s*\{#([\w-]+)\}\s*$/);
    headings.push({
      index,
      depth: match[1].length,
      text: explicit ? explicit[1] : match[2],
      id: explicit ? explicit[2] : headingSlug(match[2]),
      explicit: Boolean(explicit),
    });
  });
  return headings;
}

const fencesOf = (source) => source.match(/^```[^\n]*\n[\s\S]*?^```/gm) ?? [];

function splitFrontMatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { keys: [], lines: [], body: source };
  const lines = match[1].split(/\r?\n/);
  const keys = lines.map((line) => line.match(/^([\w-]+):/)?.[1]).filter(Boolean);
  return { keys, lines, body: source.slice(match[0].length) };
}

const translations = walk(i18nDir).filter(
  (file) => file.endsWith(".md") && /^i18n\/[\w-]+\/(design|packages)\//.test(rel(file)),
);
function rel(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

const errors = [];
let written = 0;

for (const file of translations) {
  const name = rel(file);
  const englishPath = name.replace(/^i18n\/[\w-]+\//, "");
  const englishFile = path.join(root, englishPath);
  if (!existsSync(englishFile)) {
    errors.push(`${name}: ${englishPath} does not exist; move or delete the translation`);
    continue;
  }
  const english = readFileSync(englishFile, "utf8").replace(/\r\n/g, "\n");
  let source = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const front = splitFrontMatter(source);
  const englishHeadings = headingsOf(english.split("\n"));
  let lines = source.split("\n");
  let headings = headingsOf(lines);

  const sameShape =
    headings.length === englishHeadings.length &&
    headings.every((heading, index) => heading.depth === englishHeadings[index].depth);

  if (command === "sync" && sameShape) {
    headings.forEach((heading, index) => {
      const id = englishHeadings[index].id;
      lines[heading.index] = `${"#".repeat(heading.depth)} ${heading.text.trim()} {#${id}}`;
    });
    let next = lines.join("\n");
    const hash = sourceHash(english);
    const hasHash = front.keys.includes("sourceHash");
    if (!hasHash || marked.has(file)) {
      next = hasHash
        ? next.replace(/^sourceHash: .*$/m, `sourceHash: ${hash}`)
        : next.replace(
            /^---\r?\n([\s\S]*?)\r?\n---/,
            (all, inner) => `---\n${inner}\nsourceHash: ${hash}\n---`,
          );
    }
    if (next !== source) {
      writeFileSync(file, next);
      written++;
      source = next;
      lines = next.split("\n");
      headings = headingsOf(lines);
    }
  }

  if (!sameShape) {
    errors.push(
      `${name}: its headings (${headings.map((h) => h.depth).join(",")}) do not match ${englishPath} (${englishHeadings.map((h) => h.depth).join(",")}); keep the same headings in the same order`,
    );
  } else {
    headings.forEach((heading, index) => {
      if (!heading.explicit) {
        errors.push(`${name}: "${heading.text}" has no anchor; run node scripts/i18n.mjs sync`);
      } else if (heading.id !== englishHeadings[index].id) {
        errors.push(
          `${name}: "${heading.text}" has the anchor #${heading.id}, the English heading #${englishHeadings[index].id}`,
        );
      }
    });
  }

  const extra = front.keys.filter((key) => !["title", "summary", "sourceHash"].includes(key));
  if (extra.length) {
    errors.push(
      `${name}: front matter has ${extra.join(", ")}; a translation holds only title, summary and sourceHash`,
    );
  }
  for (const key of ["title", "summary"]) {
    if (!front.keys.includes(key)) errors.push(`${name}: front matter has no ${key}`);
  }

  const englishFences = fencesOf(english).filter((fence) => /^```(example|tokens)/.test(fence));
  const fences = fencesOf(source).filter((fence) => /^```(example|tokens)/.test(fence));
  if (englishFences.join("\n") !== fences.join("\n")) {
    errors.push(
      `${name}: its example and tokens blocks differ from ${englishPath}; copy them as they are`,
    );
  }

  const recorded = source.match(/^sourceHash: (\w+)$/m)?.[1];
  if (!recorded) {
    errors.push(`${name}: no sourceHash; run node scripts/i18n.mjs sync`);
  } else if (recorded !== sourceHash(english)) {
    errors.push(
      `${name}: ${englishPath} changed since it was translated; bring the translation up to date in the same pull request, then node scripts/i18n.mjs sync --mark ${name}`,
    );
  }
}

if (command === "sync")
  console.log(`i18n: updated ${written} of ${translations.length} translations`);
for (const error of errors) console.error(`error: ${error}`);
if (command === "check" || errors.length) {
  console.log(`i18n: ${translations.length} translations, ${errors.length} errors`);
}
if (command !== "check" && command !== "sync") {
  console.error("usage: node scripts/i18n.mjs check | sync [--mark <path>...]");
  process.exit(2);
}
process.exit(errors.length ? 1 : 0);
