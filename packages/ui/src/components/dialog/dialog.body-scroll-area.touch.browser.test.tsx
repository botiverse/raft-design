import "./dialog.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Dialog, DialogBody, DialogClose, DialogHeader, DialogTitle } from "./dialog";
import { DialogSheetContent } from "./dialog-sheet";

// A finger on DialogBody in a phone sheet, with `unstable_scrollArea` (dialog.md, "Scrolling in
// a ScrollArea"): a drag along a line wider than the body scrolls the body sideways, as the
// native body does, a vertical drag scrolls it down, and a body with nothing wider than itself
// only scrolls down.
// Chromium's touch emulation, one finger, at an iPhone's 390 x 844.

const it = test.skipIf(typeof window === "undefined");

// The sheet slides up over 240ms, and the area measures in the next frame.
const settle = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

async function emulateTouch(enabled: boolean) {
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled, maxTouchPoints: 1 });
}

/** One finger down at `from`, moved to `to` in steps, and lifted. */
async function drag(from: { x: number; y: number }, to: { x: number; y: number }) {
  const { cdp } = await import("vite-plus/test/browser/context");
  const steps = 12;
  await cdp().send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [from] });
  for (let step = 1; step <= steps; step += 1) {
    const point = {
      x: from.x + ((to.x - from.x) * step) / steps,
      y: from.y + ((to.y - from.y) * step) / steps,
    };
    await cdp().send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [point] });
    await settle(16);
  }
  await cdp().send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  await emulateTouch(false);
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

function Scene({ scrollArea, wide }: { scrollArea: boolean; wide: boolean }) {
  return (
    <ThemeProvider>
      <Dialog open>
        <DialogSheetContent>
          <DialogHeader>
            <DialogTitle>Terms</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody data-testid="body" unstable_scrollArea={scrollArea}>
            {wide ? (
              <div data-testid="wide" style={{ width: 800, whiteSpace: "nowrap" }}>
                A line that is wider than the body and does not wrap
              </div>
            ) : null}
            {Array.from({ length: 80 }, (_, index) => (
              <p key={index} data-testid={`line-${index}`}>
                Line {index + 1} of the terms, which is only read.
              </p>
            ))}
          </DialogBody>
        </DialogSheetContent>
      </Dialog>
    </ThemeProvider>
  );
}

async function open(scrollArea: boolean, wide: boolean) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(390, 844);
  await emulateTouch(true);
  render(<Scene scrollArea={scrollArea} wide={wide} />);
  await settle();
  return screen.getByTestId("body");
}

// Revert to fail: dialog.tsx, DialogBodyScrollArea without `orientation: "both"` (the ScrollArea
// body is `overflow-x: hidden`: the sideways drag scrolls nothing).
it.each([
  ["ScrollArea", true],
  ["native", false],
] as const)(
  "with a %s body a sideways drag on a wide line scrolls it sideways, and a vertical drag down",
  async (_name, scrollArea) => {
    const body = await open(scrollArea, true);
    const box = screen.getByTestId("wide").getBoundingClientRect();
    expect(body.getBoundingClientRect().width).toBe(390);
    expect(body.scrollWidth).toBeGreaterThan(body.clientWidth);

    const y = box.top + box.height / 2;
    await drag({ x: 340, y }, { x: 40, y });
    await waitFor(() => expect(body.scrollLeft).toBeGreaterThan(100));
    await settle();
    expect(body.scrollTop).toBe(0);
    const left = body.scrollLeft;

    await drag({ x: 195, y: box.top + 500 }, { x: 195, y: box.top + 100 });
    await waitFor(() => expect(body.scrollTop).toBeGreaterThan(100));
    await settle();
    expect(body.scrollLeft).toBe(left);
  },
);

// Revert to fail: dialog.tsx, `orientation: "both"` to `"horizontal"` (the vertical drag scrolls
// nothing).
it.each([
  ["ScrollArea", true],
  ["native", false],
] as const)(
  "with a %s body that has nothing wider than itself a sideways drag moves nothing, and a vertical drag scrolls it",
  async (_name, scrollArea) => {
    const body = await open(scrollArea, false);
    const box = screen.getByTestId("line-0").getBoundingClientRect();
    expect(body.scrollWidth).toBe(body.clientWidth);

    const y = box.top + box.height / 2;
    await drag({ x: 340, y }, { x: 40, y });
    await settle();
    expect(body.scrollLeft).toBe(0);
    expect(body.scrollTop).toBe(0);
    expect(screen.getByTestId("line-0").getBoundingClientRect().left).toBe(box.left);

    await drag({ x: 195, y: box.top + 500 }, { x: 195, y: box.top + 100 });
    await waitFor(() => expect(body.scrollTop).toBeGreaterThan(100));
    await settle();
    expect(body.scrollLeft).toBe(0);
  },
);
