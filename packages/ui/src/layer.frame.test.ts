import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

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
