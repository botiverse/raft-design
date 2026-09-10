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

const CSS = readFileSync(fileURLToPath(new URL("./foundation.css", import.meta.url)), "utf8");

/** The `--layer-backdrop` declared under a given selector block. */
function backdropAlphaFor(selector: string): number {
  const start = CSS.indexOf(`${selector} {`);
  expect(start, `selector ${selector} must exist in foundation.css`).toBeGreaterThan(-1);
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

/**
 * Elegant dark: floating surfaces must sit ABOVE the panel, not below it.
 *
 * The scrim cannot carry separation in dark — dimming an already-dark canvas
 * (L 0.19) has little room to work, and even a fully opaque backdrop caps at the
 * popover's own lightness. So the lever is the panel. `--layer-popover` was 0.24
 * against `--layer-panel` 0.26: a floating surface rendered DARKER than the panel
 * beneath it, which inverts elevation. 0.28 puts it above.
 *
 * @cindyz chose 0.28 from a rendered five-step preview (0.24/0.28/0.33/0.38/0.43,
 * 2026-09-01). The arithmetic alternative — matching elegant light's 0.35
 * separation — needed 0.43, and on screen that read as a grey card rather than a
 * dark surface. This is the case for previewing rather than solving for a number.
 *
 * Scope: every consumer of this token in elegant dark is a floating surface —
 * dialog, alert-dialog, drawer, popover, combobox, select, dropdown/context menu,
 * tooltip, toast, preview-card, notification-center, composer suggestions, and
 * the reaction quick row and picker. The switch thumb also names the token but
 * carries its own `dark:` override, so it does not move.
 */
function lightnessFor(selector: string, token: string): number {
  const start = CSS.indexOf(`${selector} {`);
  expect(start, `selector ${selector} must exist`).toBeGreaterThan(-1);
  const block = CSS.slice(start, CSS.indexOf("\n}", start));
  const match = block.match(new RegExp(`--${token}:\\s*oklch\\(([0-9.]+)`));
  expect(match, `${selector} must declare --${token}`).not.toBeNull();
  return Number(match![1]);
}

test("elegant dark: popover sits above panel, which sits above canvas", () => {
  const sel = '[data-theme="elegant"].dark';
  const canvas = lightnessFor(sel, "layer-canvas");
  const panel = lightnessFor(sel, "layer-panel");
  const popover = lightnessFor(sel, "layer-popover");
  expect(panel, "panel must be lighter than the canvas it sits on").toBeGreaterThan(canvas);
  expect(
    popover,
    `popover ${popover} vs panel ${panel}: a floating surface darker than the panel inverts elevation`,
  ).toBeGreaterThan(panel);
});

test("elegant dark: the auto-dark block tracks the explicit dark block", () => {
  // Two selectors carry the dark palette. A value changed in one and missed in
  // the other splits the theme by how the reader's OS is set rather than by
  // design, and nothing else in the suite would notice.
  const explicit = lightnessFor('[data-theme="elegant"].dark', "layer-popover");
  const auto = lightnessFor('[data-theme="elegant"]:not(.light):not(.dark)', "layer-popover");
  expect(auto).toBe(explicit);
});
