import "../dialog/dialog.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/index";
import { ScrollArea } from "../scroll-area/scroll-area";
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

// A bottom sheet's DrawerBody scrolls by its own classes (drawer.md, Anatomy):
// a body taller than the sheet's 82% of the window scrolls between the header
// and the footer, which stay in the sheet. What must not move: a short sheet,
// and a body whose caller already made it scroll, with classes of its own or
// by rendering a ScrollArea as the body. Measured in a real browser, on a
// phone (390 x 844) and on a desktop (1280 x 800).

const it = test.skipIf(typeof window === "undefined");

async function setViewport(width: number, height: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
}

// The sheet slides in over 240ms.
const settle = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

/** A real wheel turn over the middle of `element`, as the browser's own input. */
async function wheelOver(element: Element, deltaY: number) {
  const { cdp } = await import("vite-plus/test/browser/context");
  // CDP's coordinates are the top page's; the test runs in an iframe of it.
  const frame = window.frameElement?.getBoundingClientRect() ?? { left: 0, top: 0 };
  const box = element.getBoundingClientRect();
  await cdp().send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: frame.left + box.left + box.width / 2,
    y: frame.top + box.top + box.height / 2,
    deltaX: 0,
    deltaY,
  });
  // A wheel scroll animates; let it end before anything is read.
  await settle(300);
}

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  await setViewport(414, 896);
});

const VIEWPORTS = [
  ["a phone", 390, 844],
  ["a desktop", 1280, 800],
] as const;

function Lines({ lines }: { lines: number }) {
  return (
    <>
      {Array.from({ length: lines }, (_, index) => (
        <p key={index} data-testid={`line-${index}`}>
          Line {index + 1} of the terms, which is only read.
        </p>
      ))}
    </>
  );
}

function Scene({
  lines = 80,
  children,
  ...body
}: { lines?: number; children?: ReactNode } & ComponentProps<typeof DrawerBody>) {
  return (
    <ThemeProvider>
      <Drawer open>
        <DrawerContent>
          <DrawerHeader data-testid="header">
            <DrawerTitle>Terms</DrawerTitle>
          </DrawerHeader>
          <DrawerBody data-testid="body" {...body}>
            {children ?? <Lines lines={lines} />}
          </DrawerBody>
          <DrawerFooter data-testid="footer">
            <DrawerActions>
              <DrawerClose render={<Button variant="primary" />}>Got it</DrawerClose>
            </DrawerActions>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </ThemeProvider>
  );
}

const popup = () => document.querySelector("[data-slot=drawer-popup]") as HTMLElement;
const rect = (element: Element) => element.getBoundingClientRect();

/** Where the header, the body and the footer sit in the window, and the sheet itself. */
function layout() {
  const box = (element: Element) => {
    const { top, left, width, height } = rect(element);
    return { top, left, width, height };
  };
  return {
    sheet: box(popup()),
    header: box(screen.getByTestId("header")),
    body: box(screen.getByTestId("body")),
    footer: box(screen.getByTestId("footer")),
  };
}

/** Every element in the sheet that scrolls down, by its computed overflow. */
function scrollers() {
  return [...popup().querySelectorAll<HTMLElement>("*")].filter((element) =>
    ["auto", "scroll"].includes(getComputedStyle(element).overflowY),
  );
}

// Revert to fail: drawer.recipe.ts, `axis.y.body` without `min-h-0 overflow-y-auto` (the body is as
// tall as its 80 lines, the footer is under the window's bottom edge and the wheel moves nothing).
it.each(VIEWPORTS)(
  "on %s a long body scrolls between the header and the footer, which stay in the sheet",
  async (_name, width, height) => {
    await setViewport(width, height);
    render(<Scene />);
    await settle();
    const body = screen.getByTestId("body");
    const sheet = rect(popup());
    const atRest = layout();

    expect(sheet.height).toBeLessThanOrEqual(height * 0.82 + 0.5);
    expect(Math.round(sheet.bottom)).toBe(height);
    expect(rect(screen.getByTestId("header")).top).toBeGreaterThanOrEqual(sheet.top);
    expect(rect(screen.getByTestId("footer")).bottom).toBeLessThanOrEqual(sheet.bottom + 0.5);
    expect(rect(body).top).toBeGreaterThanOrEqual(rect(screen.getByTestId("header")).bottom - 0.5);
    expect(rect(body).bottom).toBeLessThanOrEqual(rect(screen.getByTestId("footer")).top + 0.5);
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    expect(scrollers()).toEqual([body]);

    await wheelOver(body, 300);
    expect(body.scrollTop).toBeGreaterThan(100);
    // The header and the footer are where they were: only the body moved.
    expect(layout()).toEqual(atRest);

    // The end of the content can be reached, with the body's bottom padding under it.
    body.scrollTop = body.scrollHeight;
    expect(Math.round(body.scrollTop)).toBe(body.scrollHeight - body.clientHeight);
    const last = screen.getByTestId("line-79");
    expect(Math.round(rect(body).bottom - rect(last).bottom)).toBe(
      Math.round(parseFloat(getComputedStyle(body).paddingBottom)),
    );
    expect(Math.round(parseFloat(getComputedStyle(body).paddingBottom))).toBe(16);
  },
);

// The classes of a sheet's body before it scrolled by itself: the box a short sheet must keep.
const NO_SCROLLER = "min-h-auto overflow-visible";

// Revert to fail: drawer.recipe.ts, `axis.y.body` without `overflow-y-auto` (the body is no
// scroller), or with `overflow-y-scroll` (a short body draws a scrollbar on a platform with classic
// ones) or `shrink-0` beside it (nothing changes here; the long test fails).
it.each(VIEWPORTS)(
  "on %s a short body is a scroller with nothing to scroll, in the same box as one that isn't",
  async (_name, width, height) => {
    await setViewport(width, height);
    render(<Scene lines={3} className={NO_SCROLLER} />);
    await settle();
    expect(getComputedStyle(screen.getByTestId("body")).overflowY).toBe("visible");
    const before = layout();
    cleanup();

    render(<Scene lines={3} />);
    await settle();
    const body = screen.getByTestId("body");
    expect(getComputedStyle(body).overflowY).toBe("auto");
    expect(layout()).toEqual(before);
    // The sheet's least height, with the footer at its bottom edge.
    expect(Math.round(rect(popup()).height)).toBe(256);
    expect(Math.round(rect(screen.getByTestId("footer")).bottom)).toBe(height);
    expect(body.scrollHeight).toBe(body.clientHeight);
    expect(body.offsetWidth).toBe(body.clientWidth);
    // No Tab stop of its own: a scroller with nothing to scroll takes no focus from the keyboard.
    expect(body.hasAttribute("tabindex")).toBe(false);
    expect(body.tabIndex).toBe(-1);
    const { userEvent } = await import("vite-plus/test/browser/context");
    const button = screen.getByRole("button", { name: "Got it" });
    for (let presses = 0; presses < 3; presses += 1) {
      await userEvent.keyboard("{Tab}");
      expect(document.activeElement).toBe(button);
    }
  },
);

// A caller that made the body scroll itself before the sheet's body did.
const CALLER_SCROLLS = "min-h-0 overflow-y-auto";

// Revert to fail: drawer.recipe.ts, `axis.y.body` without `min-h-0 overflow-y-auto` (the plain body
// doesn't scroll, so its box isn't the caller-scrolled one's).
it("a body the caller made scroll is the same box and the same scroller as the plain one", async () => {
  await setViewport(390, 844);
  render(<Scene />);
  await settle();
  const plain = layout();
  const plainScroll = screen.getByTestId("body").scrollHeight;
  cleanup();

  render(<Scene className={CALLER_SCROLLS} />);
  await settle();
  const body = screen.getByTestId("body");
  expect(layout()).toEqual(plain);
  expect(body.scrollHeight).toBe(plainScroll);
  expect(scrollers()).toEqual([body]);
  // Each class once: the caller's replace the sheet's own.
  const classes = body.className.split(" ");
  expect(classes.filter((name) => name === "overflow-y-auto")).toHaveLength(1);
  expect(classes.filter((name) => name === "min-h-0")).toHaveLength(1);
  await wheelOver(body, 300);
  expect(body.scrollTop).toBeGreaterThan(100);
});

// Revert to fail: drawer.recipe.ts, `axis.y.body` with `overflow-auto` in place of
// `overflow-y-auto` (the ScrollArea can then be scrolled sideways too), or with `overflow-y-scroll`
// and `[scrollbar-width:auto]` (the platform's scrollbar is drawn beside raft-ui's).
it("a ScrollArea rendered as the body is still the one scroller, with one scrollbar", async () => {
  await setViewport(390, 844);
  render(
    <Scene render={<ScrollArea />} className="block">
      <Lines lines={80} />
    </Scene>,
  );
  await settle();
  const body = screen.getByTestId("body");
  const sheet = rect(popup());

  expect(body.classList.contains("r-scroll-area")).toBe(true);
  expect(scrollers()).toEqual([body]);
  const style = getComputedStyle(body);
  expect(style.overflowY).toBe("auto");
  expect(style.overflowX).toBe("hidden");
  // The platform's scrollbar stays hidden, and raft-ui's is drawn once.
  expect(style.scrollbarWidth).toBe("none");
  expect(body.offsetWidth).toBe(body.clientWidth);
  expect(popup().querySelectorAll("[data-slot=scroll-area-scrollbar]")).toHaveLength(1);

  expect(sheet.height).toBeLessThanOrEqual(844 * 0.82 + 0.5);
  expect(rect(screen.getByTestId("footer")).bottom).toBeLessThanOrEqual(sheet.bottom + 0.5);
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  await wheelOver(body, 300);
  expect(body.scrollTop).toBeGreaterThan(100);
  body.scrollTop = body.scrollHeight;
  expect(Math.round(body.scrollTop)).toBe(body.scrollHeight - body.clientHeight);
});

// Revert to fail: drawer.recipe.ts, `axis.y.body` without `min-h-0 overflow-y-auto` (the list is
// as tall as its rows and its end is under the window's bottom edge).
it.each([
  ["p-0", 0, 0],
  ["px-0", 0, 16],
] as const)(
  "a long body with %s scrolls, and its rows reach the sheet's edges",
  async (className, inline, bottom) => {
    await setViewport(390, 844);
    render(<Scene className={className} />);
    await settle();
    const body = screen.getByTestId("body");
    const sheet = rect(popup());
    const first = screen.getByTestId("line-0");
    const last = screen.getByTestId("line-79");

    expect(rect(first).left - sheet.left).toBe(inline);
    expect(sheet.right - rect(first).right).toBe(inline);
    expect(rect(screen.getByTestId("footer")).bottom).toBeLessThanOrEqual(sheet.bottom + 0.5);
    expect(sheet.height).toBeLessThanOrEqual(844 * 0.82 + 0.5);
    await wheelOver(body, 300);
    expect(body.scrollTop).toBeGreaterThan(100);
    body.scrollTop = body.scrollHeight;
    expect(Math.round(rect(body).bottom - rect(last).bottom)).toBe(bottom);
  },
);
