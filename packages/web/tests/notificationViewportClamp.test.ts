import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { calculateViewportClampStyle } from "../src/components/layout/useViewportClamp.js";

const triggerRect = {
  top: 700,
  right: 64,
  bottom: 740,
  width: 40,
  height: 40,
};

test("right-side popover repositions when measured height changes", () => {
  const tall = calculateViewportClampStyle({
    triggerRect,
    popoverRect: {
      top: 0,
      right: 0,
      bottom: 0,
      width: 320,
      height: 260,
    },
    viewport: { width: 1024, height: 800 },
    placement: "right",
    gutter: 8,
  });

  const compact = calculateViewportClampStyle({
    triggerRect,
    popoverRect: {
      top: 0,
      right: 0,
      bottom: 0,
      width: 320,
      height: 120,
    },
    viewport: { width: 1024, height: 800 },
    placement: "right",
    gutter: 8,
  });

  assert.equal(tall.top, 480);
  assert.equal(compact.top, 620);
  assert.equal(Number(compact.top) + 120, triggerRect.bottom);
});

test("notification popup observes content-size changes while open", () => {
  const source = readFileSync(
    resolve(import.meta.dirname, "../src/components/layout/useViewportClamp.ts"),
    "utf8",
  );

  assert.match(source, /new ResizeObserver\(\(\) => measure\(\)\)/);
  assert.match(source, /observer\.observe\(popover\)/);
});
