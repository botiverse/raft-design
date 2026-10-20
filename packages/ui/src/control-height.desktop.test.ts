// @vitest-environment node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";
import { cn } from "./lib/cn";

// A default control is 44px on a phone, for a finger, and Feishu's 32px from
// 768px, where the desktop layout begins. The values switch once, in
// foundation.css; recipes write `h-control` and never a breakpoint.
// design/foundations/spacing.md#heights.

const sourceDirectory = dirname(fileURLToPath(import.meta.url));
const foundation = readFileSync(join(sourceDirectory, "foundation.css"), "utf8");
const styles = readFileSync(join(sourceDirectory, "styles.css"), "utf8");

const PHONE = {
  "--control-height": "44px",
  "--control-height-cta": "52px",
  "--control-icon-size": "22px",
  "--control-hit-inset": "0px",
};
const DESKTOP = {
  "--control-height": "32px",
  "--control-height-cta": "40px",
  "--control-icon-size": "18px",
  "--control-hit-inset": "6px",
};

const desktopStart = foundation.indexOf("@media (width >= 48rem)");
const phone = foundation.slice(0, desktopStart);
const desktop = foundation.slice(desktopStart);

function declared(css: string, name: string) {
  return css.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]?.trim();
}

test("a phone keeps 44px controls with 22px icons", () => {
  for (const [name, value] of Object.entries(PHONE)) {
    expect(declared(phone, name), name).toBe(value);
  }
});

test("from 768px a control is 32px with an 18px icon, and its hit area reaches 44px", () => {
  expect(desktopStart).toBeGreaterThan(-1);
  for (const [name, value] of Object.entries(DESKTOP)) {
    expect(declared(desktop, name), name).toBe(value);
  }
  const height = Number.parseFloat(DESKTOP["--control-height"]);
  expect(height + 2 * Number.parseFloat(DESKTOP["--control-hit-inset"])).toBe(44);
});

test("the control utilities read the tokens", () => {
  expect(declared(styles, "--spacing-control")).toBe("var(--control-height)");
  expect(declared(styles, "--spacing-control-cta")).toBe("var(--control-height-cta)");
  expect(declared(styles, "--spacing-control-icon")).toBe("var(--control-icon-size)");
  expect(declared(styles, "--spacing-control-hit")).toBe("var(--control-hit-inset)");
});

test("tailwind-merge treats the control utilities as sizes", () => {
  expect(cn("h-11", "h-control")).toBe("h-control");
  expect(cn("size-11", "size-control")).toBe("size-control");
  expect(cn("min-h-11", "min-h-control")).toBe("min-h-control");
  expect(cn("after:-inset-y-1.5", "after:-inset-y-control-hit")).toBe("after:-inset-y-control-hit");
});
