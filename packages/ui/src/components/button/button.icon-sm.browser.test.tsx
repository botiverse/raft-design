import "./button.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "./button";

// `icon-sm`, a row's action (Button › Row actions): a 28px square with a 16px
// icon on a line of a row or a card. With a mouse it is drawn 28px; on a touch
// screen it keeps the same drawing, and its hit area (a transparent ::after)
// reaches 44px in both directions. Probed with elementFromPoint in a real
// browser; jsdom has no layout.

const it = test.skipIf(typeof window === "undefined");

let coarse = false;

afterEach(async () => {
  cleanup();
  if (typeof window === "undefined" || !coarse) return;
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
  coarse = false;
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

async function viewport(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
}

function renderRowAction() {
  render(
    <ThemeProvider mode="light">
      <div className="flex items-center gap-2 p-16">
        <span className="text-body font-bold">Wug</span>
        <Button data-testid="more" variant="ghost" size="icon-sm" aria-label="More">
          <svg data-testid="icon" viewBox="0 0 24 24" />
        </Button>
      </div>
    </ThemeProvider>,
  );
  return screen.getByTestId("more");
}

const hits = (x: number, y: number) => {
  const hit = document.elementFromPoint(x, y);
  return hit !== null && screen.getByTestId("more").contains(hit);
};

/** The target's reach past the drawing on each side, probed in 1px steps. */
function reach() {
  const box = screen.getByTestId("more").getBoundingClientRect();
  const midX = box.left + box.width / 2;
  const midY = box.top + box.height / 2;
  const probe = (step: (n: number) => [number, number]) => {
    let n = 0;
    while (n < 40 && hits(...step(n + 1))) n += 1;
    return n;
  };
  const top = probe((n) => [midX, box.top - n + 0.5]);
  const bottom = probe((n) => [midX, box.bottom + n - 0.5]);
  const left = probe((n) => [box.left - n + 0.5, midY]);
  const right = probe((n) => [box.right + n - 0.5, midY]);
  return { box, height: box.height + top + bottom, width: box.width + left + right };
}

function expectDrawing() {
  const box = screen.getByTestId("more").getBoundingClientRect();
  expect(box.width).toBe(28);
  expect(box.height).toBe(28);
  const icon = screen.getByTestId("icon").getBoundingClientRect();
  expect(icon.width).toBe(16);
  expect(icon.height).toBe(16);
}

it("with a mouse on a desktop it is a 28px square with a 16px icon and a 44px target", async () => {
  await viewport(1280);
  expect(window.matchMedia("(pointer: fine)").matches).toBe(true);
  renderRowAction();
  expectDrawing();
  const { height, width } = reach();
  expect(height).toBeGreaterThanOrEqual(44);
  expect(width).toBeGreaterThanOrEqual(44);
});

it("with a mouse on a narrow window it is still 28px", async () => {
  await viewport(390);
  renderRowAction();
  expectDrawing();
});

// Touch runs last in the file: turning touch emulation off again leaves
// Chromium reporting no pointer (badge.browser.test.tsx).
for (const width of [390, 1280]) {
  it(`on a touch screen ${width}px wide it keeps the 28px drawing and reaches a 44px target`, async () => {
    await viewport(width);
    const { cdp } = await import("vite-plus/test/browser/context");
    coarse = true;
    await cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "pointer", value: "coarse" }],
    });
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
    expect(window.matchMedia("(pointer: coarse)").matches).toBe(true);
    renderRowAction();
    expectDrawing();
    const { height, width: across } = reach();
    expect(height).toBeGreaterThanOrEqual(44);
    expect(across).toBeGreaterThanOrEqual(44);
  });
}
