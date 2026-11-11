import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";

// The drag Escape guard must be on the window before any app listener
// (drag-escape.ts), including when the drag parts load lazily: every entry
// imports it for its side effect, and package.json "sideEffects" lists the
// entries and the guard so a tree-shaking bundler keeps that import. The
// src/ path is for vp pack itself, which reads the same field and would
// otherwise drop the import from dist/index.mjs.

test("every entry loads the drag Escape guard", () => {
  for (const entry of ["../index.ts", "../wip.ts"]) {
    const source = readFileSync(new URL(entry, import.meta.url), "utf8");
    expect(source, entry).toMatch(/^import "\.\/lib\/drag-escape";$/m);
  }
});

test("package.json keeps the guard through tree shaking", () => {
  const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
  expect(pkg.sideEffects).toEqual(
    expect.arrayContaining([
      "./dist/index.mjs",
      "./dist/wip.mjs",
      "./dist/lib/drag-escape.mjs",
      "./src/lib/drag-escape.ts",
    ]),
  );
});

// The entry is the guard and nothing else of its own: its names come from a
// side-effect-free barrel (src/index-exports.ts, src/wip-exports.ts). A barrel
// listed in "sideEffects" keeps every import it has, so a consumer's bundler
// put each component the app used on any lazy page in the chunk that loads
// raft-ui first.
test("each entry re-exports a barrel that has no side effects", () => {
  const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
  for (const name of ["index", "wip"]) {
    const source = readFileSync(new URL(`../${name}.ts`, import.meta.url), "utf8");
    const statements = source
      .replace(/^\s*\/\/.*$/gm, "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    expect(statements, name).toEqual([
      'import "./lib/drag-escape";',
      `export * from "./${name}-exports";`,
    ]);
    expect(pkg.sideEffects, name).not.toContain(`./dist/${name}-exports.mjs`);
  }
});
