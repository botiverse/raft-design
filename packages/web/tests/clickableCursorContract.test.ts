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

test("cursor contract is documented and defaults app chrome to the arrow cursor", () => {
  const doctrine = readSource("../../CLAUDE.md");
  const css = readSource("src/index.css");

  assert.match(doctrine, /### Interaction Patterns[\s\S]*\*\*Cursor contract:\*\*/);
  assert.match(doctrine, /Slock app chrome keeps the normal arrow cursor/);
  assert.match(doctrine, /Do not add `cursor-pointer` to in-app buttons, rail\/sidebar items/);
  assert.match(
    css,
    /button,\s*\[role="button"\],\s*label,\s*a\[href="#"\]\s*\{\s*cursor:\s*default;\s*\}/,
  );
});

test("app chrome does not opt into browser link-hand cursor", () => {
  const offenders: string[] = [];
  const files = [
    ...sourceFilesUnder("src/components"),
    ...sourceFilesUnder("src/pages"),
    ...sourceFilesUnder("src/utils"),
  ];

  for (const sourcePath of files) {
    const source = readSource(sourcePath);
    if (!source.includes("cursor-pointer")) continue;
    const matchingLines = source
      .split("\n")
      .filter((line) => line.includes("cursor-pointer"));
    offenders.push(`${sourcePath}: ${matchingLines.join(" | ")}`);
  }

  assert.deepEqual(offenders, []);
});
