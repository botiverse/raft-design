import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

/**
 * Positioner wrappers follow their trigger by default
 * (packages/ui/AGENTS.md, Base UI, Overlays, and Portals;
 * design/foundations/elevation.md#popups):
 *
 * 1. They pass `disableAnchorTracking` through with no default of its own and
 *    never set it to `true`. Wrappers once defaulted it to `true`, and 18
 *    popups on the docs site drifted 40-160px on scroll.
 * 2. Every positioner defaults `positionMethod` to `"fixed"`, so popups keep
 *    the same viewport coordinates and WebKit visual-viewport boundary math.
 * 3. Every anchored positioner (all except `context-menu`, which belongs to
 *    the click point) hides when Base UI marks `data-anchor-hidden` (trigger
 *    scrolled out of its clipping ancestor or detached).
 */
const SRC = fileURLToPath(new URL(".", import.meta.url));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

// `disableAnchorTracking = true` (a destructuring default),
// `disableAnchorTracking: true` (an object default) and
// `disableAnchorTracking={true}` (a JSX prop).
const TURNS_TRACKING_OFF = /disableAnchorTracking\s*(=\s*true\b|:\s*true\b|=\{\s*true\s*\})/;
const USES_BASE_POSITIONER = /<Base\w+\.Positioner(?:\s|\/?>)/;
const DEFAULTS_FIXED_POSITION = /positionMethod\s*=\s*"fixed"/;
const HIDES_ON_ANCHOR_HIDDEN = /data-anchor-hidden:invisible|\[data-anchor-hidden\]/;
const WIRES_ANCHOR_DISMISS = /\busePopupAnchorDismiss\(/;

// ContextMenu is anchored to the pointer's click point rather than a scrolling
// trigger (design/foundations/elevation.md#popups).
const POINT_ANCHORED = new Set(["components/context-menu/context-menu.tsx"]);
// Positioners whose open lifecycle belongs solely to an external owner:
// - ContextMenu is point-anchored.
// - Toast lifecycle belongs to ToastManager; an anchored Toast hides while out of view.
// - ComposerSuggestionList has no open state of its own (the composer mounts it
//   while typing); it hides via data-anchor-hidden while scrolled out of view.
const HIDE_ONLY_ANCHORED = new Set([
  "components/composer/composer-suggestion-list.tsx",
  "components/context-menu/context-menu.tsx",
  "components/toast/toast.tsx",
]);

function fileWithStyles(file: string): string {
  const source = readFileSync(file, "utf8");
  const cssFile = file.replace(/\.tsx?$/, ".css");
  try {
    return `${source}\n${readFileSync(cssFile, "utf8")}`;
  } catch {
    return source;
  }
}

test("no wrapper turns Base UI's anchor tracking off", () => {
  const offenders = sourceFiles(SRC)
    .filter((file) => TURNS_TRACKING_OFF.test(readFileSync(file, "utf8")))
    .map((file) => relative(SRC, file));
  expect(offenders).toEqual([]);
});

test("every Base UI positioner wrapper defaults positionMethod to fixed", () => {
  const offenders = sourceFiles(SRC)
    .filter((file) => USES_BASE_POSITIONER.test(readFileSync(file, "utf8")))
    .filter((file) => !DEFAULTS_FIXED_POSITION.test(readFileSync(file, "utf8")))
    .map((file) => relative(SRC, file));
  expect(offenders).toEqual([]);
});

test("every anchored positioner hides when Base UI sets data-anchor-hidden", () => {
  const offenders = sourceFiles(SRC)
    .filter((file) => USES_BASE_POSITIONER.test(readFileSync(file, "utf8")))
    .filter((file) => !POINT_ANCHORED.has(relative(SRC, file)))
    .filter((file) => !HIDES_ON_ANCHOR_HIDDEN.test(fileWithStyles(file)))
    .map((file) => relative(SRC, file));
  expect(offenders).toEqual([]);
});

test("every interactive anchored positioner wires usePopupAnchorDismiss", () => {
  const offenders = sourceFiles(SRC)
    .filter((file) => USES_BASE_POSITIONER.test(readFileSync(file, "utf8")))
    .filter((file) => !HIDE_ONLY_ANCHORED.has(relative(SRC, file)))
    .filter((file) => !WIRES_ANCHOR_DISMISS.test(readFileSync(file, "utf8")))
    .map((file) => relative(SRC, file));
  expect(offenders).toEqual([]);
});
