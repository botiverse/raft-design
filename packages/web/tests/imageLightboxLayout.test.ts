/**
 * Layout contract for ImageLightbox.
 *
 * Regression: title bar was `absolute top-0` and the image stage used
 * `calc(100vh - 140px)` — a fixed offset that didn't account for
 * `safe-area-inset-top`, causing the title bar to cover the top of the
 * image on Android devices with variable browser chrome.
 *
 * Fix: title bar in normal flex flow (shrink-0), image stage flex-1.
 * These tests pin the fixed layout so the regression cannot re-land.
 *
 * 2026-05-16: backdrop / portal / ESC / scroll-lock moved into
 * <Lightbox> primitive (task #10, PR #1788). The flex-col + non-centered
 * structure now lives on Lightbox's `className` prop instead of inline.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const source = readFileSync(
  resolve(repoRoot, "src/components/ImageLightbox.tsx"),
  "utf8",
);

test("ImageLightbox uses Lightbox primitive with flex-col layout (not centered)", () => {
  // Must wrap in <Lightbox> primitive (which provides fixed inset-0 + bg-black/75
  // + ESC + scroll-lock + portal). Layout passed via className must be flex-col,
  // never items-center justify-center on the root — centering caused the image
  // stage to overlap the title bar.
  assert.match(
    source,
    /<Lightbox[\s\S]{0,300}className="flex flex-col"[\s\S]{0,200}data-testid="image-lightbox"/,
  );
  // Explicitly must NOT have items-center justify-center on the Lightbox className
  assert.doesNotMatch(
    source,
    /<Lightbox[\s\S]{0,300}flex flex-col items-center justify-center/,
  );
});

test("ImageLightbox title bar is in normal flex flow, not absolute positioned", () => {
  // Title bar must use shrink-0 (flow), not absolute/top-0 (overlay).
  // absolute top-0 caused the title bar to float over the image content.
  assert.match(
    source,
    /safe-top safe-left safe-right pointer-events-auto shrink-0 border-b-2 border-black bg-white/,
  );
  // Must NOT have absolute positioning on the title bar
  assert.doesNotMatch(
    source,
    /safe-top safe-left safe-right pointer-events-auto absolute/,
  );
});

test("ImageLightbox image stage uses flex-1 not a fixed calc height", () => {
  // flex-1 fills the space below the title bar dynamically, regardless of
  // safe-area-inset-top or browser chrome height on mobile.
  assert.match(
    source,
    /data-testid="image-lightbox-stage"[\s\S]{0,200}className="relative flex flex-1 items-center justify-center overflow-hidden"/,
  );
  // Must NOT use fixed calc(100vh - Npx) which ignores safe-area
  assert.doesNotMatch(
    source,
    /data-testid="image-lightbox-stage"[\s\S]{0,400}calc\(100vh/,
  );
});

test("ImageLightbox image uses max-h-full max-w-full not stale calc constraints", () => {
  // Image constraints should be relative to the stage (max-h-full / max-w-full),
  // not hardcoded calc values that drift from the actual available space.
  assert.match(
    source,
    /data-testid="image-lightbox-image"[\s\S]{0,200}max-h-full max-w-full object-contain/,
  );
  assert.doesNotMatch(
    source,
    /data-testid="image-lightbox-image"[\s\S]{0,200}max-h-\[calc/,
  );
});

test("ImageLightbox title bar controls use the PanelHeader icon button size", () => {
  assert.match(source, /import Button from "\.\/ui\/Button";/);
  assert.match(
    source,
    /<Button[\s\S]{0,120}onClick=\{handleDownload\}[\s\S]{0,80}shape="icon"[\s\S]{0,120}<Download size=\{14\}/,
  );
  assert.match(
    source,
    /<Button[\s\S]{0,120}onClick=\{close\}[\s\S]{0,80}shape="icon"[\s\S]{0,120}<X size=\{14\}/,
  );
  assert.doesNotMatch(source, /const controlBtn = "btn-brutal-sm bg-white p-1"/);
  assert.doesNotMatch(source, /<Download size=\{20\}/);
  assert.doesNotMatch(source, /<X size=\{20\}/);
});
