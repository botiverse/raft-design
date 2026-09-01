import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

/**
 * The elegant light backdrop has to read as blocking.
 *
 * It was `oklch(0 0 0 / 0.15)`. Over the elegant light canvas — pure white —
 * that composites to roughly greyscale 217 against a 255 dialog surface: a
 * 38-level separation, which is not enough for a surface whose whole job is to
 * say "you cannot touch what is behind me". Its own dark counterpart was already
 * 0.6, so light was the outlier rather than the rule (@cindyz, 2026-09-01).
 *
 * This is asserted against the stylesheet source rather than a rendered pixel
 * because the browser-mode tests in this package do not execute under the CI
 * command (`vp run -r test` runs the node pool, where every
 * `skipIf(typeof window === "undefined")` file skips). A computed-style version
 * of this test would look stronger and check nothing.
 *
 * Scope note: `--layer-backdrop` is shared. In elegant light it also backs
 * AlertDialog, Drawer, Popover's backdrop, Lightbox and the composer drop
 * overlay, so this value moves all of them together — deliberately, since they
 * are all blocking surfaces, but it is not a dialog-local change.
 */

const CSS = readFileSync(fileURLToPath(new URL("./styles.css", import.meta.url)), "utf8");

/** The `--layer-backdrop` declared under a given selector block. */
function backdropAlphaFor(selector: string): number {
  const start = CSS.indexOf(`${selector} {`);
  expect(start, `selector ${selector} must exist in styles.css`).toBeGreaterThan(-1);
  const end = CSS.indexOf("\n}", start);
  const block = CSS.slice(start, end);
  const match = block.match(/--layer-backdrop:\s*oklch\(0 0 0 \/ ([0-9.]+)\)/);
  expect(match, `${selector} must declare --layer-backdrop as an oklch alpha`).not.toBeNull();
  return Number(match![1]);
}

test("elegant light backdrop is opaque enough to read as blocking", () => {
  const alpha = backdropAlphaFor('[data-theme="elegant"]');
  expect(
    alpha,
    `elegant light backdrop is ${alpha}; at 0.15 it composited to ~217 against a 255 dialog and did not read as blocking`,
  ).toBeGreaterThanOrEqual(0.3);
});

test("elegant light stays lighter than brutal, which is the point of the two themes", () => {
  const elegant = backdropAlphaFor('[data-theme="elegant"]');
  const brutal = backdropAlphaFor('[data-theme="brutal"]');
  expect(brutal).toBeGreaterThan(elegant);
});

test("brutal backdrop is untouched", () => {
  // Brutal must stay pixel-identical through token work (repo styling contract).
  expect(backdropAlphaFor('[data-theme="brutal"]')).toBe(0.65);
});
