/**
 * @vitest-environment jsdom
 *
 * Android's indicator is Material 3's own: an arc that grows with the pull
 * up to 0.8 of the circle with an arrowhead, faint until the pull is armed
 * (and again once it is disarmed), an indeterminate arc while refreshing.
 * Every other platform keeps the DS Spinner.
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { PullToRefreshIndicator } from "./pull-to-refresh-indicator";
import { MATERIAL_MAX_ARC, materialArc } from "./pull-to-refresh-material-progress";
import type { PullToRefresh } from "./use-pull-to-refresh";

afterEach(cleanup);

describe("materialArc", () => {
  test("shows nothing for the first 40% of the pull", () => {
    for (const progress of [0, 0.2, 0.4]) {
      const arc = materialArc(progress);
      expect(arc.endAngle - arc.startAngle).toBeCloseTo(0);
      expect(arc.arrowScale).toBe(0);
    }
  });

  test("grows to 0.8 of the circle at the threshold, with the arrow at full size", () => {
    const arc = materialArc(1);
    expect(arc.endAngle - arc.startAngle).toBeCloseTo(MATERIAL_MAX_ARC * 360);
    expect(arc.arrowScale).toBe(1);
    expect(materialArc(2)).toEqual(arc);
  });

  test("turns a little with the pull, its start from -45° to +27°", () => {
    expect(materialArc(0.4).startAngle).toBeCloseTo(-45);
    expect(materialArc(0.7).startAngle).toBeCloseTo(-9);
    expect(materialArc(1).startAngle).toBeCloseTo(27);
  });

  test("only grows as the pull goes on", () => {
    let last = materialArc(0);
    for (let progress = 0.05; progress <= 1; progress += 0.05) {
      const next = materialArc(progress);
      expect(next.endAngle - next.startAngle).toBeGreaterThanOrEqual(
        last.endAngle - last.startAngle,
      );
      expect(next.arrowScale).toBeGreaterThanOrEqual(last.arrowScale);
      last = next;
    }
  });
});

const pull = (overrides: Partial<PullToRefresh>): PullToRefresh => ({
  state: "pulling",
  distance: 70,
  progress: 0.7,
  platform: "android",
  ...overrides,
});

function renderIndicator(value: PullToRefresh) {
  const { container } = render(<PullToRefreshIndicator pull={value} label="Refreshing…" />);
  return {
    spinner: container.querySelector('[data-slot="spinner"]'),
    material: container.querySelector('[data-slot="pull-to-refresh-material-progress"]'),
    arc: container.querySelector("[data-material-arc]"),
    arrow: container.querySelector("[data-material-arrow]"),
    determinate: container.querySelector("g"),
    indeterminate: container.querySelector("[data-material-indeterminate]"),
  };
}

describe("PullToRefreshIndicator on Android", () => {
  test("draws Material's arc and arrow, not the DS Spinner", () => {
    const parts = renderIndicator(pull({}));
    expect(parts.spinner).toBeNull();
    expect(parts.material).not.toBeNull();
    expect(parts.arc?.getAttribute("d")).toMatch(/^M .* A /);
    expect(parts.arrow).not.toBeNull();
  });

  test("is faint until armed, solid once armed, and faint again once disarmed", () => {
    const before = renderIndicator(pull({ progress: 0.7 }));
    expect(before.determinate?.hasAttribute("data-armed")).toBe(false);
    expect(before.determinate?.getAttribute("class")).toContain("opacity-30");
    cleanup();

    const armed = renderIndicator(pull({ progress: 1, distance: 120 }));
    expect(armed.determinate?.hasAttribute("data-armed")).toBe(true);
    expect(armed.determinate?.getAttribute("class")).toContain("data-armed:opacity-100");
    expect(armed.arrow).not.toBeNull();
    cleanup();

    const disarmed = renderIndicator(pull({ progress: 0.95, distance: 95 }));
    expect(disarmed.determinate?.hasAttribute("data-armed")).toBe(false);
    expect(disarmed.arrow).not.toBeNull();
  });

  test("runs the indeterminate arc while refreshing, with no arrow", () => {
    const parts = renderIndicator(pull({ state: "refreshing", distance: 60, progress: 1 }));
    expect(parts.indeterminate).not.toBeNull();
    expect(parts.arc).toBeNull();
    expect(parts.arrow).toBeNull();
  });
});

describe("PullToRefreshIndicator elsewhere", () => {
  test("keeps the DS Spinner", () => {
    const parts = renderIndicator(pull({ platform: "default" }));
    expect(parts.spinner).not.toBeNull();
    expect(parts.material).toBeNull();
  });
});
