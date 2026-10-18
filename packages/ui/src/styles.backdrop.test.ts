import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

/**
 * The light backdrop has to read as blocking.
 *
 * An elegant-era value of `oklch(0 0 0 / 0.15)` over a pure white canvas
 * composited to roughly greyscale 217 against a 255 dialog surface: a 38-level
 * separation, which is not enough for a surface whose whole job is to say "you
 * cannot touch what is behind me".
 *
 * Do NOT read the dark value as the reference for light. Alphas are not
 * comparable across modes, because what matters is the gap left between the
 * dimmed canvas and the panel on top of it; in dark even a fully opaque
 * backdrop caps at the popover's own lightness, so dark separation is carried
 * by `--layer-popover` instead (asserted below).
 *
 * This is asserted against the stylesheet source rather than a rendered pixel so
 * it runs on the node side with the rest of CI. A token value is a source fact,
 * and checking it where it is written keeps the guard next to the decision.
 *
 * Scope note: `--layer-backdrop` is shared. It also backs AlertDialog, Drawer,
 * Popover's backdrop, Lightbox and the composer drop overlay, so this value
 * moves all of them together — deliberately, since they are all blocking
 * surfaces, but it is not a dialog-local change.
 */

const CSS = readFileSync(fileURLToPath(new URL("./foundation.css", import.meta.url)), "utf8");

/** The light block (`:where(:root), .light`), the explicit dark block, and the
 *  pre-hydration system fallback that mirrors it. */
const LIGHT = ".light";
const DARK = ".dark";
const AUTO_DARK = ":root:not(.light):not(.dark)";

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

test("light backdrop is opaque enough to read as blocking", () => {
  const alpha = backdropAlphaFor(LIGHT);
  expect(
    alpha,
    `light backdrop is ${alpha}; at 0.15 it composited to ~217 against a 255 dialog and did not read as blocking`,
  ).toBeGreaterThanOrEqual(0.3);
});

/**
 * Dark: floating surfaces must sit ABOVE the panel, not below it.
 *
 * The scrim cannot carry separation in dark — dimming an already-dark canvas
 * has little room to work, and even a fully opaque backdrop caps at the
 * popover's own lightness. So the lever is the popover: a floating surface
 * rendered DARKER than the panel beneath it inverts elevation.
 *
 * Scope: every consumer of this token is a floating surface — dialog,
 * alert-dialog, drawer, popover, combobox, select, dropdown/context menu,
 * tooltip, toast, preview-card, notification-center, composer suggestions, and
 * the reaction quick row and picker.
 */
function lightnessFor(selector: string, token: string): number {
  const start = CSS.indexOf(`${selector} {`);
  expect(start, `selector ${selector} must exist`).toBeGreaterThan(-1);
  const block = CSS.slice(start, CSS.indexOf("\n}", start));
  const match = block.match(new RegExp(`--${token}:\\s*oklch\\(([0-9.]+)`));
  expect(match, `${selector} must declare --${token}`).not.toBeNull();
  return Number(match![1]);
}

test("dark: the popover sits above the panel", () => {
  const panel = lightnessFor(DARK, "layer-canvas");
  const popover = lightnessFor(DARK, "layer-popover");
  expect(
    popover,
    `popover ${popover} vs panel ${panel}: a floating surface darker than the panel inverts elevation`,
  ).toBeGreaterThan(panel);
});

test("dark: the auto-dark block tracks the explicit dark block", () => {
  // Two selectors carry the dark palette. A value changed in one and missed in
  // the other splits the look by how the reader's OS is set rather than by
  // design, and nothing else in the suite would notice.
  for (const token of ["layer-canvas", "layer-popover"]) {
    expect(lightnessFor(AUTO_DARK, token), token).toBe(lightnessFor(DARK, token));
  }
  expect(backdropAlphaFor(AUTO_DARK)).toBe(backdropAlphaFor(DARK));
});
