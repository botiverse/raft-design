import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

function readSource(path: string): string {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

function sourceFilesUnder(path: string): string[] {
  const root = resolve(repoRoot, path);
  if (!existsSync(root)) return [];
  const results: string[] = [];
  const visit = (entry: string) => {
    const stat = statSync(entry);
    if (stat.isDirectory()) {
      for (const child of readdirSync(entry)) visit(resolve(entry, child));
      return;
    }
    if (/\.(tsx?|jsx?)$/.test(entry)) results.push(relative(repoRoot, entry));
  };
  visit(root);
  return results.sort();
}

test("time format setting uses the canonical segmented control", () => {
  const source = readSource("src/components/settings/SettingsPanel.tsx");

  assert.match(source, /import SegmentedControl from "\.\.\/ui\/SegmentedControl";/);
  assert.match(source, /ariaLabel="Time format"/);
  assert.match(source, /testId: "time-format-12h"/);
  assert.match(source, /testId: "time-format-24h"/);
  assert.doesNotMatch(source, /Checkbox[\s\S]{0,800}Time format|Time format[\s\S]{0,800}Checkbox/);
});

test("search sort uses the canonical segmented control", () => {
  const source = readSource("src/components/search/MessageSearchPage.tsx");

  assert.match(source, /import SegmentedControl from "\.\.\/ui\/SegmentedControl";/);
  assert.match(source, /<SegmentedControl<SearchSort>/);
  assert.match(source, /ariaLabel="Sort search results"/);
  assert.match(source, /testId: "search-sort-relevance"/);
  assert.match(source, /testId: "search-sort-recent"/);
  assert.doesNotMatch(source, /aria-pressed=\{sort === mode\}/);
  assert.doesNotMatch(source, /inline-flex border-2 border-black bg-white text-xs font-bold uppercase tracking-wide/);
});

test("server translation checkbox aligns with the first label line", () => {
  const source = readSource("src/components/settings/SettingsPanel.tsx");

  assert.match(
    source,
    /<Checkbox\s+size="md"[\s\S]*checked=\{enabled\}[\s\S]*className="mt-0\.5"[\s\S]*Enable message translation for this server/,
  );
});

test("form select uses the shared selection popover without yellow chrome", () => {
  const source = readSource("src/components/Select.tsx");
  const popoverSource = readSource("src/components/ui/SelectionPopover.tsx");

  assert.match(source, /import SelectionPopover from "\.\/ui\/SelectionPopover";/);
  assert.match(source, /<SelectionPopover[\s\S]*showHeader=\{false\}/);
  // Per stdrc msg=32e323aa + msg=832c2c02 + msg=b0b92c1c (2026-05-25):
  // Selection family (Select / SelectionPopover / InlineBadgeEditor
  // dropdown) shares one chrome — no yellow-fill selected; check on the
  // right; hover = `bg-brutal-yellow/30` (shared with SegmentedControl
  // unselected hover and the new MenuItem pure-action row).
  assert.doesNotMatch(source, /bg-brutal-yellow(?!\/30)/);
  assert.doesNotMatch(popoverSource, /bg-brutal-yellow(?!\/30)/);
  assert.match(popoverSource, /hover:bg-brutal-yellow\/30/);
});

test("components do not hand-roll switch primitives before a canonical Toggle exists", () => {
  const offenders: string[] = [];
  // role="switch" is the strongest signal of a hand-rolled toggle. We don't
  // ban bare `Toggle` / `Switch` identifiers because those names are now
  // legitimately reusable post-Brutal-prefix-drop (multi-theme prep,
  // #proj-theme:ac79cf20 stdrc msg=876c1102); reserve the canonical name for
  // the future primitive without poisoning the namespace.
  const switchPattern = /role=["']switch["']/;

  for (const sourcePath of sourceFilesUnder("src/components")) {
    const source = readSource(sourcePath);
    if (switchPattern.test(source)) offenders.push(sourcePath);
  }

  assert.deepEqual(offenders, []);
});

test("12-hour and 24-hour segmented labels stay centralized in SettingsPanel", () => {
  const offenders: string[] = [];
  const timeFormatLiteralPattern = /12-hour|24-hour/;
  const allowed = new Set(["src/components/settings/SettingsPanel.tsx"]);

  for (const sourcePath of [
    ...sourceFilesUnder("src/components"),
    ...sourceFilesUnder("src/pages"),
  ]) {
    if (allowed.has(sourcePath)) continue;
    const source = readSource(sourcePath);
    if (timeFormatLiteralPattern.test(source)) offenders.push(sourcePath);
  }

  assert.deepEqual(offenders, []);
});
