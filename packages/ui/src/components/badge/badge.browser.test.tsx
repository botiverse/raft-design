import "./badge.test.css";
import { afterAll, afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Badge } from "./badge";

// A Badge rendered as a button keeps a 44px touch target on a touch screen,
// though it draws 20-22px and clips its label (overflow-hidden). Its ::after
// is anchored to it rather than inset in it, so the clip doesn't cut the
// target down. Measured with elementFromPoint in a browser; jsdom has no layout.

const it = test.skipIf(typeof window === "undefined");

beforeAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 800);
});

afterEach(cleanup);

function renderBadges() {
  render(
    <div className="relative flex flex-col items-start gap-16 p-16">
      <Badge data-testid="soft" appearance="soft" render={<button type="button" />}>
        v7
      </Badge>
      <Badge data-testid="solid" render={<button type="button" />}>
        3
      </Badge>
      <Badge data-testid="static" appearance="soft">
        v7
      </Badge>
      <Badge data-testid="disabled" appearance="soft" render={<button type="button" disabled />}>
        v7
      </Badge>
      <div className="w-16">
        <Badge data-testid="long" appearance="outline" render={<button type="button" />}>
          a scope label far longer than its room
        </Badge>
      </div>
    </div>,
  );
}

const hits = (testId: string, x: number, y: number) =>
  document.elementFromPoint(x, y) === screen.getByTestId(testId);

/** The target's reach past the drawing on each side, probed in 1px steps. */
function reach(testId: string) {
  const box = screen.getByTestId(testId).getBoundingClientRect();
  const midX = box.left + box.width / 2;
  const midY = box.top + box.height / 2;
  const probe = (step: (n: number) => [number, number]) => {
    let n = 0;
    while (n < 40 && hits(testId, ...step(n + 1))) n += 1;
    return n;
  };
  return {
    box,
    top: probe((n) => [midX, box.top - n + 0.5]),
    bottom: probe((n) => [midX, box.bottom + n - 0.5]),
    left: probe((n) => [box.left - n + 0.5, midY]),
    right: probe((n) => [box.right + n - 0.5, midY]),
  };
}

function expectTruncated() {
  const long = screen.getByTestId("long");
  expect(long.scrollWidth).toBeGreaterThan(long.clientWidth);
  expect(long.getBoundingClientRect().width).toBe(64);
  expect(getComputedStyle(long).overflowX).toBe("hidden");
  expect(getComputedStyle(long).overflowY).toBe("hidden");
}

it("with a mouse no badge reaches past its drawing", () => {
  renderBadges();
  for (const testId of ["soft", "solid", "static", "long"]) {
    const box = screen.getByTestId(testId).getBoundingClientRect();
    expect(hits(testId, box.left + box.width / 2, box.top - 10)).toBe(false);
    expect(getComputedStyle(screen.getByTestId(testId), "::after").content).toBe("none");
  }
  expectTruncated();
});

// Touch runs last: turning touch emulation off again leaves Chromium
// reporting `pointer: none`, not `fine` (panel-action.browser.test.tsx).
it("on a touch screen a badge rendered as a button has a 44px target; a static or disabled one doesn't", async () => {
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: "coarse" }],
  });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  renderBadges();

  for (const testId of ["soft", "solid"]) {
    const { box, top, bottom, left, right } = reach(testId);
    expect(box.height).toBeLessThanOrEqual(22);
    expect(box.width).toBeLessThan(44);
    expect(hits(testId, box.left + box.width / 2, box.top - 10)).toBe(true);
    expect(box.height + top + bottom).toBeGreaterThanOrEqual(44);
    expect(box.width + left + right).toBeGreaterThanOrEqual(44);
  }

  const long = reach("long");
  expect(long.box.height + long.top + long.bottom).toBeGreaterThanOrEqual(44);
  // Already wider than 44px, it reaches no further sideways (within a
  // subpixel of its edge).
  expect(long.left).toBeLessThanOrEqual(1);
  expect(long.right).toBeLessThanOrEqual(1);
  expectTruncated();

  for (const testId of ["static", "disabled"]) {
    const box = screen.getByTestId(testId).getBoundingClientRect();
    expect(hits(testId, box.left + box.width / 2, box.top - 10)).toBe(false);
    expect(hits(testId, box.left + box.width / 2, box.bottom + 10)).toBe(false);
  }
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
  await page.viewport(414, 896);
});
