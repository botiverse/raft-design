/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { BRAND_ILLUSTRATION_NAMES, BrandIllustration } from "./brand-illustration";
import { BRAND_ILLUSTRATION_ART } from "./brand-illustration-art";

afterEach(cleanup);

test("the ten drawings, each on an integer grid", () => {
  expect(BRAND_ILLUSTRATION_NAMES).toEqual([
    "award",
    "deliver",
    "fist-bump",
    "hand-off",
    "idea",
    "raft",
    "review",
    "shared-data",
    "sync",
    "task-collab",
  ]);
  for (const name of BRAND_ILLUSTRATION_NAMES) {
    const { width, height, ink, paper } = BRAND_ILLUSTRATION_ART[name];
    for (const d of [ink, paper]) {
      for (const [, x, y, w, h] of d.matchAll(/M(\d+) (\d+)h(\d+)v(\d+)h-\3z/g)) {
        expect(Number(x) + Number(w)).toBeLessThanOrEqual(width);
        expect(Number(y) + Number(h)).toBeLessThanOrEqual(height);
      }
      expect(d.replace(/M\d+ \d+h(\d+)v\d+h-\1z/g, "")).toBe("");
    }
  }
});

test("one cell is a whole number of pixels: the size is the grid times the cell", () => {
  const { container, rerender } = render(<BrandIllustration name="raft" />);
  const svg = container.querySelector("svg")!;
  expect(svg.getAttribute("viewBox")).toBe("0 0 37 20");
  expect([svg.getAttribute("width"), svg.getAttribute("height")]).toEqual(["296", "160"]);
  expect(svg.getAttribute("shape-rendering")).toBe("crispEdges");
  rerender(<BrandIllustration name="raft" cell={4} />);
  expect([svg.getAttribute("width"), svg.getAttribute("height")]).toEqual(["148", "80"]);
});

test("drawn in the pane's tokens, overridable by variable, never in the files' hex", () => {
  const { container } = render(<BrandIllustration name="idea" />);
  const [paper, ink] = Array.from(container.querySelectorAll("path"));
  expect(paper!.getAttribute("class")).toBe("fill-(--illustration-paper,var(--layer-frame))");
  expect(ink!.getAttribute("class")).toBe("fill-(--illustration-ink,var(--foreground-on-frame))");
  expect(container.innerHTML).not.toMatch(/#[0-9a-f]{6}/i);
});

test("decorative by default; a label makes it a named image", () => {
  const { container, rerender } = render(<BrandIllustration name="sync" />);
  const svg = container.querySelector("svg")!;
  expect(svg.getAttribute("aria-hidden")).toBe("true");
  expect(svg.hasAttribute("role")).toBe(false);
  rerender(<BrandIllustration name="sync" aria-label="Information flows" />);
  expect(svg.hasAttribute("aria-hidden")).toBe(false);
  expect(svg.getAttribute("role")).toBe("img");
  expect(svg.getAttribute("aria-label")).toBe("Information flows");
});
