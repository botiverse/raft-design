/**
 * @vitest-environment jsdom
 *
 * A sheet's popup boundary (dialog.md, "Popups in a sheet"): the area under
 * its head, read each time the popup is placed, taken by a popup that has no
 * `collisionBoundary` of its own; and the WebKit correction every boundary
 * rect raft-ui builds carries. @floating-ui/dom 1.8 subtracts the visual
 * viewport's offset from a rect boundary and adds it to the trigger, so a rect
 * in window coordinates is twice the offset off while iOS has the page panned
 * under the keyboard. jsdom has no layout and no WebKit: the rects, the visual
 * viewport and `CSS.supports` are stubbed. Not run on a real iOS device.
 */
import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import type { ReactNode } from "react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { DialogSheetReset } from "../components/dialog/dialog-sheet-context";
import { frameCollisionBoundary, usePopupCollision } from "./frame-insets";
import {
  PopupBoundaryContext,
  SheetPopupBoundary,
  sheetPopupBoundary,
  visualViewportShift,
} from "./popup-boundary";

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.style.removeProperty("--raft-frame-inset-top");
});

/** The browser as floating-ui sees it: WebKit or not, the visual viewport panned or not. */
function stubBrowser({ webKit, offsetTop = 0, offsetLeft = 0 }: Record<string, number | boolean>) {
  vi.stubGlobal("CSS", {
    supports: (property: string) => webKit === true && property === "-webkit-backdrop-filter",
  });
  vi.stubGlobal("visualViewport", { offsetTop, offsetLeft });
}

function box(top: number, bottom: number): Element {
  const element = document.createElement("div");
  element.getBoundingClientRect = () => new DOMRect(0, top, 390, bottom - top);
  return element;
}

/** What Base UI does with a rect boundary: copies its four fields. */
const copy = (rect: { x: number; y: number; width: number; height: number }) => ({
  x: rect.x,
  y: rect.y,
  width: rect.width,
  height: rect.height,
});

test("no shift outside WebKit, whatever the visual viewport's offset", () => {
  stubBrowser({ webKit: false, offsetTop: 120, offsetLeft: 4 });
  expect(visualViewportShift()).toEqual({ x: 0, y: 0 });
});

test("no shift in WebKit while the visual viewport isn't panned", () => {
  stubBrowser({ webKit: true });
  expect(visualViewportShift()).toEqual({ x: 0, y: 0 });
});

test("twice the visual viewport's offset in WebKit", () => {
  stubBrowser({ webKit: true, offsetTop: 120, offsetLeft: 4 });
  expect(visualViewportShift()).toEqual({ x: 8, y: 240 });
});

test("a sheet's boundary runs from the bottom of its head to the bottom of the sheet", () => {
  stubBrowser({ webKit: false });
  const head = box(84, 140);
  const surface = box(84, 844);
  const rect = copy(
    sheetPopupBoundary(
      () => head,
      () => surface,
    ),
  );
  expect(rect.y).toBe(140);
  expect(rect.height).toBe(704);
  // The window's own sides: floating-ui cuts the rect to the viewport.
  expect(rect.x).toBeLessThan(-10000);
  expect(rect.x + rect.width).toBeGreaterThan(10000);
});

test("in WebKit the boundary lands where floating-ui puts the trigger", () => {
  stubBrowser({ webKit: true, offsetTop: 120 });
  const head = box(120, 176);
  const surface = box(120, 520);
  const rect = copy(
    sheetPopupBoundary(
      () => head,
      () => surface,
    ),
  );
  // floating-ui reads a rect boundary as `y - offsetTop` and the trigger as
  // `top + offsetTop`: in its coordinates the head's bottom edge is 176 + 120.
  const floatingUiReads = rect.y - 120;
  expect(floatingUiReads).toBe(176 + 120);
  expect(rect.height).toBe(344);
});

test("the boundary follows the sheet: it is measured each time it is read", () => {
  stubBrowser({ webKit: false });
  let top = 84;
  const head = document.createElement("div");
  head.getBoundingClientRect = () => new DOMRect(0, top, 390, 56);
  const surface = box(0, 844);
  const boundary = sheetPopupBoundary(
    () => head,
    () => surface,
  );
  expect(boundary.y).toBe(140);
  top = 0;
  expect(boundary.y).toBe(56);
  expect(boundary.height).toBe(788);
});

test("with no head, or less than the minimum under it, the boundary is the viewport's", () => {
  stubBrowser({ webKit: true, offsetTop: 120 });
  const surface = box(500, 844);
  for (const rect of [
    sheetPopupBoundary(
      () => null,
      () => surface,
    ),
    sheetPopupBoundary(
      () => box(500, 556),
      () => surface,
      320,
    ),
  ]) {
    expect(rect.y).toBeLessThan(-10000);
    expect(rect.y + rect.height).toBeGreaterThan(10000);
  }
  const tall = sheetPopupBoundary(
    () => box(500, 524),
    () => surface,
    320,
  );
  expect(tall.height).toBe(320);
});

test("the frame-inset boundary is shifted in WebKit too", () => {
  stubBrowser({ webKit: true, offsetTop: 120, offsetLeft: 4 });
  const rect = copy(frameCollisionBoundary({ top: 32, right: 0, bottom: 0, left: 72 }) as never);
  expect(rect.x).toBe(72 + 8);
  expect(rect.y).toBe(32 + 240);
  stubBrowser({ webKit: false, offsetTop: 120, offsetLeft: 4 });
  expect(
    copy(frameCollisionBoundary({ top: 32, right: 0, bottom: 0, left: 72 }) as never),
  ).toMatchObject({ x: 72, y: 32 });
});

const SHEET = { x: 0, y: 140, width: 390, height: 704 };

function inSheet({ children }: { children: ReactNode }) {
  return <PopupBoundaryContext.Provider value={SHEET}>{children}</PopupBoundaryContext.Provider>;
}

test("a popup in a sheet takes the sheet's boundary, with its usual padding", () => {
  const { result } = renderHook(() => usePopupCollision(undefined, undefined, 8), {
    wrapper: inSheet,
  });
  expect(result.current).toEqual({ collisionPadding: 8, collisionBoundary: SHEET });
});

test("it takes it whatever its portal container, and with a padding of its own", () => {
  const container = { current: document.createElement("div") };
  const { result } = renderHook(() => usePopupCollision(12, undefined, 8, container), {
    wrapper: inSheet,
  });
  expect(result.current).toEqual({ collisionPadding: 12, collisionBoundary: SHEET });
});

test("a collisionBoundary the caller passes wins over the sheet's", () => {
  const own = document.createElement("div");
  const { result } = renderHook(() => usePopupCollision(undefined, own, 8), { wrapper: inSheet });
  expect(result.current.collisionBoundary).toBe(own);
  const { result: ancestors } = renderHook(
    () => usePopupCollision(undefined, "clipping-ancestors", 8),
    { wrapper: inSheet },
  );
  expect(ancestors.current.collisionBoundary).toBe("clipping-ancestors");
});

test("outside a sheet a popup has no boundary, as before", () => {
  const { result } = renderHook(() => usePopupCollision(undefined, undefined, 8));
  expect(result.current).toEqual({ collisionPadding: 8, collisionBoundary: undefined });
});

test("a dialog or drawer surface opened from a sheet starts without its boundary", () => {
  const { result } = renderHook(() => usePopupCollision(undefined, undefined, 8), {
    wrapper: ({ children }: { children: ReactNode }) =>
      inSheet({ children: <DialogSheetReset>{children}</DialogSheetReset> }),
  });
  expect(result.current.collisionBoundary).toBeUndefined();
});

test("in a sheet the frame insets go into the padding: the sheet is the boundary", () => {
  document.documentElement.style.setProperty("--raft-frame-inset-top", "32px");
  const { result } = renderHook(() => usePopupCollision(undefined, undefined, 8), {
    wrapper: inSheet,
  });
  expect(result.current.collisionBoundary).toBe(SHEET);
  expect(result.current.collisionPadding).toMatchObject({ top: 40 });
});

test("SheetPopupBoundary bounds by the head it is given, under its parent by default", () => {
  stubBrowser({ webKit: false });
  const surface = box(84, 844);
  const head = box(84, 140);
  surface.append(head);
  const ref = createRef<Element>();
  ref.current = head;
  const { result } = renderHook(() => usePopupCollision(undefined, undefined, 8), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <SheetPopupBoundary head={ref}>{children}</SheetPopupBoundary>
    ),
  });
  const rect = result.current.collisionBoundary as { y: number; height: number };
  expect(rect.y).toBe(140);
  expect(rect.height).toBe(704);
});
