import "../dialog/dialog.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "./drawer";

// Swipe to dismiss with a side drawer's DrawerBody in a ScrollArea (drawer.md,
// "Scrolling in a ScrollArea"): Base UI's drawer tells a swipe toward its edge
// from a scroll by the scrollers under the finger. The body must stay one of
// them: a vertical drag scrolls it and leaves the drawer open, and a drag
// toward the edge still closes the drawer, as with the native body.
// Chromium's touch emulation, one finger, at an iPad's 820 x 1180.

const it = test.skipIf(typeof window === "undefined");

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

function Scene({ scrollArea, wide = false }: { scrollArea: boolean; wide?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <ThemeProvider>
      <output data-testid="state">{open ? "open" : "closed"}</output>
      <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Terms</DrawerTitle>
            <DrawerClose />
          </DrawerHeader>
          <DrawerBody data-testid="body" className="gap-4" unstable_scrollArea={scrollArea}>
            {wide ? (
              <div data-testid="wide" style={{ width: 800, whiteSpace: "nowrap" }}>
                A line that is wider than the body and does not wrap
              </div>
            ) : null}
            {Array.from({ length: 80 }, (_, index) => (
              <p key={index}>Line {index + 1} of the terms, which is only read.</p>
            ))}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </ThemeProvider>
  );
}

// Revert to fail: drawer.recipe.ts, `bodyScroll` with `overflow-hidden` (the body is no scroller:
// the vertical drag scrolls nothing).
it.each([
  ["ScrollArea", true],
  ["native", false],
] as const)(
  "with a %s body a vertical drag scrolls it and the drawer stays open",
  async (_name, scrollArea) => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(820, 1180);
    await emulateTouch(true);
    render(<Scene scrollArea={scrollArea} />);
    await settle();
    const body = screen.getByTestId("body");
    const box = body.getBoundingClientRect();
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);

    const x = box.left + box.width / 2;
    await drag({ x, y: box.top + 500 }, { x, y: box.top + 100 });
    await waitFor(() => expect(body.scrollTop).toBeGreaterThan(100));
    await settle();
    expect(screen.getByTestId("state").textContent).toBe("open");
    expect(document.querySelector("[data-slot=drawer-popup]")).not.toBeNull();
  },
);

// Revert to fail: drawer.tsx, `"data-base-ui-swipe-ignore": ""` among the body's props (Base UI
// leaves a drag that starts on the body alone, and the drawer stays open).
it.each([
  ["ScrollArea", true],
  ["native", false],
] as const)(
  "with a %s body a drag toward the drawer's edge still closes it",
  async (_name, scrollArea) => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(820, 1180);
    await emulateTouch(true);
    render(<Scene scrollArea={scrollArea} />);
    await settle();
    const body = screen.getByTestId("body");
    const box = body.getBoundingClientRect();

    const y = box.top + 300;
    await drag({ x: box.left + 40, y }, { x: box.left + 360, y });
    await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("closed"));
    expect(body.scrollTop).toBe(0);
  },
);

// A body that holds something wider than itself scrolls sideways (drawer.md, "Scrolling in a
// ScrollArea"), and sideways is also the way a side drawer is swiped away. Base UI's drawer
// settles it by the scroller under the finger (DrawerViewport's touch handlers,
// `findScrollableTouchTarget` on the swipe's axis): a drag away from the edge scrolls the body,
// a drag toward the edge closes the drawer only while the body is at its start, and scrolls it
// back otherwise.

// Revert to fail: drawer.tsx, DrawerBodyScrollArea without `orientation: "both"` (the ScrollArea
// body is `overflow-x: hidden` and the drag scrolls nothing), or drawer.recipe.ts, `content`
// without `min-w-0` (either body is as wide as the line and has nothing to scroll).
it.each([
  ["ScrollArea", true],
  ["native", false],
] as const)(
  "with a %s body a drag away from the edge scrolls a wide line sideways and the drawer stays open",
  async (_name, scrollArea) => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(820, 1180);
    await emulateTouch(true);
    render(<Scene scrollArea={scrollArea} wide />);
    await settle();
    const body = screen.getByTestId("body");
    const box = screen.getByTestId("wide").getBoundingClientRect();
    expect(body.scrollWidth).toBeGreaterThan(body.clientWidth);

    const y = box.top + box.height / 2;
    await drag({ x: box.left + 340, y }, { x: box.left + 40, y });
    await waitFor(() => expect(body.scrollLeft).toBeGreaterThan(100));
    await settle();
    expect(body.scrollTop).toBe(0);
    expect(screen.getByTestId("state").textContent).toBe("open");

    // A vertical drag still scrolls it down.
    const x = body.getBoundingClientRect().left + 200;
    await drag({ x, y: box.top + 500 }, { x, y: box.top + 100 });
    await waitFor(() => expect(body.scrollTop).toBeGreaterThan(100));
    await settle();
    expect(screen.getByTestId("state").textContent).toBe("open");
  },
);

// Revert to fail: drawer.tsx, `"data-base-ui-swipe-ignore": ""` among the body's props (Base UI
// leaves a drag that starts on the body alone, and the drawer stays open).
it.each([
  ["ScrollArea", true],
  ["native", false],
] as const)(
  "with a %s body at its start a drag toward the edge on a wide line still closes the drawer",
  async (_name, scrollArea) => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(820, 1180);
    await emulateTouch(true);
    render(<Scene scrollArea={scrollArea} wide />);
    await settle();
    const body = screen.getByTestId("body");
    const box = screen.getByTestId("wide").getBoundingClientRect();
    expect(body.scrollWidth).toBeGreaterThan(body.clientWidth);
    expect(body.scrollLeft).toBe(0);

    const y = box.top + box.height / 2;
    await drag({ x: box.left + 40, y }, { x: box.left + 360, y });
    await waitFor(() => expect(screen.getByTestId("state").textContent).toBe("closed"));
    expect(body.scrollLeft).toBe(0);
  },
);

// Revert to fail: drawer.tsx, DrawerBodyScrollArea without `orientation: "both"` (the ScrollArea
// body is no sideways scroller for Base UI: the drag closes the drawer with the line's end
// still showing).
it.each([
  ["ScrollArea", true],
  ["native", false],
] as const)(
  "with a %s body scrolled sideways a drag toward the edge scrolls it back and the drawer stays open",
  async (_name, scrollArea) => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(820, 1180);
    await emulateTouch(true);
    render(<Scene scrollArea={scrollArea} wide />);
    await settle();
    const body = screen.getByTestId("body");
    const box = screen.getByTestId("wide").getBoundingClientRect();
    body.scrollLeft = body.scrollWidth;
    await settle(100);
    const end = body.scrollLeft;
    expect(end).toBeGreaterThan(300);

    const y = box.top + box.height / 2;
    await drag({ x: box.left + 40, y }, { x: box.left + 240, y });
    await waitFor(() => expect(body.scrollLeft).toBeLessThan(end - 100));
    await settle();
    expect(body.scrollLeft).toBeGreaterThan(0);
    expect(screen.getByTestId("state").textContent).toBe("open");
    expect(document.querySelector("[data-slot=drawer-popup]")).not.toBeNull();
  },
);
