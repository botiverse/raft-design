import "../dialog/dialog.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/index";
import {
  Drawer,
  DrawerActions,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./drawer";

// A bottom sheet's body scrolls and the sheet is still swiped away (drawer.md,
// Behavior). Base UI's drawer gives a touch to the scroller under the finger
// unless that scroller is at its top and the finger moves down: so a drag up
// scrolls the body, a drag down at the top of the body closes the sheet, and a
// drag down further in scrolls the body back. A sheet with snap points is
// raised by a drag on its body, so its body scrolls only at its full height.
// Chromium's touch emulation, one finger, at a phone's 390 x 844.

const it = test.skipIf(typeof window === "undefined");

const settle = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

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

const PARTIAL = "20rem";
const SNAP_POINTS = [PARTIAL, 1];

function Scene({ snapPoint }: { snapPoint?: string | number }) {
  const [open, setOpen] = useState(true);
  const [point, setPoint] = useState<string | number | null>(snapPoint ?? null);
  const snap =
    snapPoint === undefined
      ? {}
      : { snapPoints: SNAP_POINTS, snapPoint: point, onSnapPointChange: setPoint };
  return (
    <ThemeProvider>
      <output data-testid="state">{open ? "open" : "closed"}</output>
      <output data-testid="snap">{String(point)}</output>
      <Drawer open={open} onOpenChange={setOpen} {...snap}>
        <DrawerContent>
          <DrawerHeader data-testid="header">
            <DrawerTitle>Terms</DrawerTitle>
          </DrawerHeader>
          <DrawerBody data-testid="body">
            {Array.from({ length: 80 }, (_, index) => (
              <p key={index}>Line {index + 1} of the terms, which is only read.</p>
            ))}
          </DrawerBody>
          <DrawerFooter>
            <DrawerActions>
              <DrawerClose render={<Button variant="primary" />}>Got it</DrawerClose>
            </DrawerActions>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </ThemeProvider>
  );
}

const state = () => screen.getByTestId("state").textContent;
const snap = () => screen.getByTestId("snap").textContent;
const popup = () => document.querySelector("[data-slot=drawer-popup]") as HTMLElement;

async function open(snapPoint?: string | number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(390, 844);
  await emulateTouch(true);
  render(<Scene snapPoint={snapPoint} />);
  await settle();
  return screen.getByTestId("body");
}

/** A drag of `dy` that starts `inset` under the top of `element`, at its middle across. */
async function dragOn(element: Element, inset: number, dy: number) {
  const box = element.getBoundingClientRect();
  const x = box.left + box.width / 2;
  const y = box.top + inset;
  await drag({ x, y }, { x, y: y + dy });
}

// Revert to fail: drawer.recipe.ts, `axis.y.body` without `min-h-0 overflow-y-auto` (the body is
// no scroller: the drag up moves nothing).
it("a drag up on a long body scrolls it and the sheet stays open", async () => {
  const body = await open();
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);

  await dragOn(body, 330, -300);
  await waitFor(() => expect(body.scrollTop).toBeGreaterThan(100));
  await settle();
  expect(state()).toBe("open");
  expect(Math.round(popup().getBoundingClientRect().bottom)).toBe(844);
});

// Revert to fail: drawer.tsx, `"data-base-ui-swipe-ignore": ""` among the native body's props
// (Base UI leaves a drag that starts on the body alone, and the sheet stays open). It holds without
// the body's own scrolling too: it is what the scrolling must not take away.
it("with the body at its top, a drag down that starts on the body closes the sheet", async () => {
  const body = await open();
  expect(getComputedStyle(body).overflowY).toBe("auto");
  expect(body.scrollTop).toBe(0);

  await dragOn(body, 30, 400);
  await waitFor(() => expect(state()).toBe("closed"));
});

// Revert to fail: drawer.recipe.ts, `axis.y.body` without `min-h-0 overflow-y-auto` (the body
// can't be scrolled down in the first place, and the drag closes the sheet).
it("with the body scrolled down, a drag down scrolls it back and the sheet stays open", async () => {
  const body = await open();
  body.scrollTop = 600;
  expect(body.scrollTop).toBe(600);

  await dragOn(body, 30, 300);
  await waitFor(() => expect(body.scrollTop).toBeLessThan(500));
  await settle();
  expect(body.scrollTop).toBeGreaterThan(0);
  expect(state()).toBe("open");
  expect(Math.round(popup().getBoundingClientRect().bottom)).toBe(844);
});

// Revert to fail: drawer.recipe.ts, `axis.y.body` without `min-h-0 overflow-y-auto` (the body
// can't be scrolled down before the drag). The drag itself closes the sheet without it too.
it.each([
  ["header", "[data-slot=drawer-header]"],
  ["grab handle", "[data-slot=drawer-swipe-handle]"],
] as const)(
  "with the body scrolled down, a drag down on the %s still closes the sheet",
  async (_name, selector) => {
    const body = await open();
    body.scrollTop = 600;
    expect(body.scrollTop).toBe(600);
    const part = popup().querySelector(selector) as HTMLElement;

    await dragOn(part, part.getBoundingClientRect().height / 2, 450);
    await waitFor(() => expect(state()).toBe("closed"));
  },
);

// Revert to fail: drawer.recipe.ts, the `axis: "y", snapPoints: true` compound variant without its
// `body` (the body scrolls under the finger, and the sheet stays at its partial snap point with
// its lower part under the window's edge).
it("at a partial snap point a drag up on the body raises the sheet and scrolls nothing", async () => {
  const body = await open(PARTIAL);
  expect(Math.round(popup().getBoundingClientRect().top)).toBe(844 - 320);
  expect(getComputedStyle(body).overflowY).toBe("hidden");

  await dragOn(body, 200, -300);
  await waitFor(() => expect(snap()).toBe("1"));
  await settle();
  expect(body.scrollTop).toBe(0);
  expect(state()).toBe("open");
  expect(Math.round(popup().getBoundingClientRect().bottom)).toBe(844);
  // At its full height the body scrolls.
  expect(getComputedStyle(body).overflowY).toBe("auto");
});

// Revert to fail: drawer.recipe.ts, the same compound variant's `body` without
// `group-data-expanded/drawer-popup:overflow-y-auto` (at its full height the body still doesn't
// scroll: the drag up moves nothing).
it("at the full snap point a drag up scrolls the body, and a drag down scrolls it back", async () => {
  const body = await open(1);
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);

  await dragOn(body, 330, -300);
  await waitFor(() => expect(body.scrollTop).toBeGreaterThan(100));
  await settle();
  expect(snap()).toBe("1");

  body.scrollTop = 600;
  await dragOn(body, 30, 300);
  await waitFor(() => expect(body.scrollTop).toBeLessThan(500));
  await settle();
  expect(body.scrollTop).toBeGreaterThan(0);
  expect(snap()).toBe("1");
  expect(state()).toBe("open");
});

// Revert to fail: drawer.tsx, `"data-base-ui-swipe-ignore": ""` among the native body's props (the
// sheet stays at its full height). It holds without the body's own scrolling too.
it("at the full snap point with the body at its top, a drag down lowers or closes the sheet", async () => {
  const body = await open(1);
  expect(body.scrollTop).toBe(0);

  await dragOn(body, 30, 300);
  // A fast release closes the sheet and a slow one stops at the partial snap point.
  await waitFor(() => expect(state() === "closed" || snap() === PARTIAL).toBe(true));
  if (state() === "open") expect(body.scrollTop).toBe(0);
});
