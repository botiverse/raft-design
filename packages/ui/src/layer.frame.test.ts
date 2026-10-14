import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";
import { appRail } from "./components/app-rail/app-rail.recipe";

// The app frame (top bar + rail) is the outermost and darkest place in every
// theme (cindyz, slock #proj-frontend:1c6f0e50): frame < canvas-muted (sidebar)
// < panel (content). Brutal keeps its yellow frame.
const foundation = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "foundation.css"),
  "utf8",
);

function block(selector: string): string {
  const start = foundation.indexOf(`${selector} {`);
  expect(start, selector).toBeGreaterThanOrEqual(0);
  return foundation.slice(start, foundation.indexOf("}", start));
}

function lightness(css: string, token: string): number {
  const match = new RegExp(`${token}:\\s*oklch\\(([\\d.]+)`).exec(css);
  expect(match, token).not.toBeNull();
  return Number(match![1]);
}

const ELEGANT_BLOCKS = {
  light: block('[data-theme="elegant"]'),
  dark: block('[data-theme="elegant"].dark'),
  "dark (system)": block('  [data-theme="elegant"]:not(.light):not(.dark)'),
};

for (const [mode, css] of Object.entries(ELEGANT_BLOCKS)) {
  test(`elegant ${mode}: frame is darker than the sidebar, which is darker than content`, () => {
    const frame = lightness(css, "--layer-frame");
    expect(frame).toBeLessThan(lightness(css, "--layer-canvas-muted"));
    expect(lightness(css, "--layer-canvas-muted")).toBeLessThan(lightness(css, "--layer-panel"));
  });
}

test("cindyz's chosen frame values", () => {
  expect(lightness(ELEGANT_BLOCKS.light, "--layer-frame")).toBe(0.949);
  expect(lightness(ELEGANT_BLOCKS.dark, "--layer-frame")).toBe(0.13);
  expect(lightness(ELEGANT_BLOCKS["dark (system)"], "--layer-frame")).toBe(0.13);
});

test("brutal frame is its yellow", () => {
  expect(block('[data-theme="brutal"]')).toContain(
    "--layer-frame: var(--color-brutal-yellow-400);",
  );
});

test("the elegant rail paints the frame, and its count badge ring matches it", () => {
  const rail = appRail({ theme: "elegant" });
  const root = new Set(rail.root().split(/\s+/));
  expect(root.has("bg-layer-frame")).toBe(true);
  expect(root.has("bg-layer-canvas-muted")).toBe(false);
  expect(new Set(rail.itemBadge().split(/\s+/)).has("ring-layer-frame")).toBe(true);
});

test("on the light frame, a selected rail item is white and hover is a white tint (fill-strong equals the frame there)", () => {
  const item = new Set(appRail({ theme: "elegant" }).item().split(/\s+/));
  expect(item.has("data-[selected=true]:bg-layer-panel")).toBe(true);
  expect(item.has("hover:bg-layer-panel/60")).toBe(true);
  expect(item.has("data-[selected=true]:bg-fill-strong")).toBe(false);
  expect(item.has("hover:bg-fill-strong/80")).toBe(false);
  // Dark keeps its own states.
  expect(item.has("dark:data-[selected=true]:bg-layer-card")).toBe(true);
  expect(item.has("dark:hover:bg-ink-6")).toBe(true);
});
