import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

/**
 * The elegant light backdrop has to read as blocking.
 *
 * It was `oklch(0 0 0 / 0.15)`. Over the elegant light canvas — pure white —
 * that composites to roughly greyscale 217 against a 255 dialog surface: a
 * 38-level separation, which is not enough for a surface whose whole job is to
 * say "you cannot touch what is behind me" (@cindyz, 2026-09-01).
 *
 * Do NOT read the dark value as the reference this was brought into line with.
 * Alphas are not comparable across themes, because what matters is the gap left
 * between the dimmed canvas and the panel on top of it. Elegant dark carries a
 * much higher 0.6, but over a canvas that is already dark (L 0.19) with a
 * popover at 0.24 it clears roughly 0.16 — about what light had at 0.15. Dark
 * has the same weakness wearing a bigger number, and deepening its scrim cannot
 * fix it: even a fully opaque backdrop caps at the popover's own lightness. That
 * is a separate change against `--layer-popover`, deliberately not bundled here.
 *
 * This is asserted against the stylesheet source rather than a rendered pixel so
 * it runs on the node side with the rest of CI. A token value is a source fact,
 * and checking it where it is written keeps the guard next to the decision.
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
