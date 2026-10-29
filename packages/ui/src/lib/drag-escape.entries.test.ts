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
