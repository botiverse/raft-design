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

function Scene({ scrollArea }: { scrollArea: boolean }) {
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
