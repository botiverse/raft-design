/**
 * @vitest-environment jsdom
 *
 * A sheet's popup boundary (dialog.md, "Popups in a sheet"): the visible area
 * under its head, decided for each popup each time it is placed, taken by a
 * popup that has no `collisionBoundary` of its own; and the WebKit correction
 * every boundary rect raft-ui builds carries. @floating-ui/dom 1.8 subtracts
 * the visual viewport's offset from a rect boundary and adds it to the trigger
 * of a popup fixed to the window, so a rect in window coordinates is twice the
 * offset off while iOS has the page panned under the keyboard. jsdom has no
 * layout and no WebKit: the rects, the visual viewport and `CSS.supports` are
 * stubbed, and the last tests run the real floating-ui on them. Not run on a
 * real iOS device.
 */
import { createRequire } from "node:module";
import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import type { ReactNode } from "react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { DialogSheetReset } from "../components/dialog/dialog-sheet-context";
import { frameCollisionBoundary, usePopupCollision } from "./frame-insets";
import { OverlayLayer, OverlayLayerProvider } from "./overlay-depth";
import {
  POPUP_ROOM_MIN_PX,
  PopupSheetContext,
  PopupSheetReset,
  SheetPopupBoundary,
  findPopupAnchor,
  sheetPopupBoundary,
  visualViewportShift,
} from "./popup-boundary";
import type { PopupSheet } from "./popup-boundary";

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.style.removeProperty("--raft-frame-inset-top");
  document.body.replaceChildren();
});

type Browser = {
  webKit: boolean;
  offsetTop?: number;
  offsetLeft?: number;
  /** The visual viewport's height: what the keyboard leaves. */
  height?: number;
};

/** The browser as floating-ui sees it: WebKit or not, the visual viewport panned or not. */
function stubBrowser({ webKit, offsetTop = 0, offsetLeft = 0, height = 844 }: Browser) {
  vi.stubGlobal("CSS", {
    supports: (property: string) => webKit && property === "-webkit-backdrop-filter",
  });
  vi.stubGlobal("visualViewport", { offsetTop, offsetLeft, width: 390, height });
}

function box(top: number, bottom: number, parent: Element = document.body): HTMLElement {
  const element = document.createElement("div");
  element.getBoundingClientRect = () => new DOMRect(0, top, 390, bottom - top);
  parent.append(element);
  return element;
}

function sheetOf(head: Element | null, surface: Element | null): PopupSheet {
  return { head: () => head, surface: () => surface };
}

/** A select-like popup: an open trigger that names the list inside the positioner. */
function linkedPopup(trigger: Element) {
  const positioner = document.createElement("div");
  positioner.style.position = "fixed";
  const list = document.createElement("div");
  list.id = `list-${document.querySelectorAll("[id]").length}`;
  positioner.append(list);
  document.body.append(positioner);
  trigger.setAttribute("data-popup-open", "");
  trigger.setAttribute("aria-controls", list.id);
  return positioner;
}

/** What Base UI does with a rect boundary: copies its four fields. */
const copy = (rect: { x: number; y: number; width: number; height: number }) => ({
  x: rect.x,
  y: rect.y,
  width: rect.width,
  height: rect.height,
});

const isUnbounded = (rect: { y: number; height: number }) =>
  rect.y < -10000 && rect.y + rect.height > 10000;

/** The caller yields: a boundary's next read measures again. */
const yielded = () => Promise.resolve();
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

test("no shift outside WebKit, whatever the visual viewport's offset", () => {
  stubBrowser({ webKit: false, offsetTop: 120, offsetLeft: 4 });
  expect(visualViewportShift()).toEqual({ x: 0, y: 0 });
});

test("no shift in WebKit while the visual viewport isn't panned", () => {
  stubBrowser({ webKit: true });
  expect(visualViewportShift()).toEqual({ x: 0, y: 0 });
});

test("twice the visual viewport's offset in WebKit, for a popup fixed to the window", () => {
  stubBrowser({ webKit: true, offsetTop: 120, offsetLeft: 4 });
  expect(visualViewportShift()).toEqual({ x: 8, y: 240 });
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  document.body.append(popup);
  expect(visualViewportShift(popup)).toEqual({ x: 8, y: 240 });
});

test("once for a popup that isn't: positioned absolute, or inside a transformed element", () => {
  stubBrowser({ webKit: true, offsetTop: 120, offsetLeft: 4 });
  const absolute = document.createElement("div");
  absolute.style.position = "absolute";
  document.body.append(absolute);
  expect(visualViewportShift(absolute)).toEqual({ x: 4, y: 120 });

  const drawer = document.createElement("div");
  drawer.style.transform = "translate3d(0px, 0px, 0px)";
  const inside = document.createElement("div");
  inside.style.position = "fixed";
  drawer.append(inside);
  document.body.append(drawer);
  expect(visualViewportShift(inside)).toEqual({ x: 4, y: 120 });
});

test("a sheet's boundary runs from the bottom of its head to the bottom of the sheet", () => {
  stubBrowser({ webKit: false });
  const rect = copy(sheetPopupBoundary(sheetOf(box(84, 140), box(84, 844))));
  expect(rect.y).toBe(140);
  expect(rect.height).toBe(704);
  // The window's own sides: floating-ui cuts the rect to the viewport.
  expect(rect.x).toBeLessThan(-10000);
  expect(rect.x + rect.width).toBeGreaterThan(10000);
});

test("it ends where the on-screen keyboard starts, when that is above the sheet's bottom", () => {
  // The visual viewport is 400px tall and panned 120px: it ends at 520.
  stubBrowser({ webKit: false, offsetTop: 120, height: 400 });
  const rect = copy(sheetPopupBoundary(sheetOf(box(120, 176), box(120, 844))));
  expect(rect.y).toBe(176);
  expect(rect.height).toBe(520 - 176);
});

test("in WebKit the boundary is moved by twice the offset", () => {
  stubBrowser({ webKit: true, offsetTop: 120, height: 400 });
  const rect = copy(sheetPopupBoundary(sheetOf(box(120, 176), box(120, 520))));
  expect(rect.y).toBe(176 + 240);
  expect(rect.height).toBe(344);
});

test("the boundary follows the sheet: it is measured each time floating-ui reads it", async () => {
  stubBrowser({ webKit: false });
  let top = 84;
  const head = document.createElement("div");
  head.getBoundingClientRect = () => new DOMRect(0, top, 390, 56);
  const boundary = sheetPopupBoundary(sheetOf(head, box(0, 844)));
  expect(boundary.y).toBe(140);
  top = 0;
  // In the same frame: the sheet resized, or the keyboard came up.
  await yielded();
  expect(boundary.y).toBe(56);
  expect(boundary.height).toBe(788);
});

test("y and height, read one after the other, come from one measurement", () => {
  stubBrowser({ webKit: false });
  let reads = 0;
  const head = document.createElement("div");
  head.getBoundingClientRect = () => {
    reads += 1;
    return new DOMRect(0, 84, 390, 56);
  };
  expect(copy(sheetPopupBoundary(sheetOf(head, box(0, 844))))).toMatchObject({
    y: 140,
    height: 704,
  });
  expect(reads).toBe(1);
});

test("one placement looks the anchor up in the page once, and the next frame looks again", async () => {
  stubBrowser({ webKit: false });
  const surface = box(84, 844);
  const head = box(84, 140, surface);
  let fieldTop = 300;
  const field = box(0, 0, surface);
  field.getBoundingClientRect = () => new DOMRect(0, fieldTop, 390, 44);
  const positioner = linkedPopup(field);
  const boundary = sheetPopupBoundary(sheetOf(head, surface), () => positioner);
  const lookups = vi.spyOn(document, "querySelectorAll");
  // Flip, shift, size and hide each read the boundary, with a yield between.
  for (let read = 0; read < 4; read += 1) {
    expect(copy(boundary).y).toBe(140);
    await yielded();
  }
  expect(lookups).toHaveBeenCalledTimes(1);
  // The anchor is kept, its place isn't: the field scrolled into the head's
  // row in the same frame, with under 150px on either side.
  surface.getBoundingClientRect = () => new DOMRect(0, 84, 390, 300);
  fieldTop = 200;
  expect(isUnbounded(boundary)).toBe(true);
  expect(lookups).toHaveBeenCalledTimes(1);
  await nextFrame();
  expect(isUnbounded(boundary)).toBe(true);
  expect(lookups).toHaveBeenCalledTimes(2);
  lookups.mockRestore();
});

test("an anchor that closed or left the page isn't kept, nor is a lookup that found nothing", async () => {
  stubBrowser({ webKit: false });
  const surface = box(84, 844);
  const head = box(84, 140, surface);
  const button = box(90, 134, head);
  const positioner = linkedPopup(button);
  const boundary = sheetPopupBoundary(sheetOf(head, surface), () => positioner);
  expect(isUnbounded(boundary)).toBe(true);
  await yielded();
  button.removeAttribute("data-popup-open");
  const lookups = vi.spyOn(document, "querySelectorAll");
  expect(boundary.y).toBe(140);
  await yielded();
  expect(boundary.y).toBe(140);
  expect(lookups).toHaveBeenCalledTimes(2);
  // Base UI names the list a moment after it mounts: found on the next read.
  button.setAttribute("data-popup-open", "");
  await yielded();
  expect(isUnbounded(boundary)).toBe(true);
  lookups.mockRestore();
});

test("with no head, or nothing visible under it, the boundary is the viewport's", () => {
  stubBrowser({ webKit: true, offsetTop: 120 });
  expect(isUnbounded(sheetPopupBoundary(sheetOf(null, box(500, 844))))).toBe(true);
  stubBrowser({ webKit: false, height: 300 });
  expect(isUnbounded(sheetPopupBoundary(sheetOf(box(500, 556), box(500, 844))))).toBe(true);
});

test("finds a popup's anchor: the open trigger that names an element inside its positioner", () => {
  const trigger = box(300, 344);
  const other = box(400, 444);
  const positioner = linkedPopup(trigger);
  const otherPositioner = linkedPopup(other);
  expect(findPopupAnchor(positioner)).toBe(trigger);
  expect(findPopupAnchor(otherPositioner)).toBe(other);
  trigger.removeAttribute("data-popup-open");
  expect(findPopupAnchor(positioner)).toBeNull();
  expect(findPopupAnchor(null)).toBeNull();
});

test("finds a tooltip's anchor, which nothing names, while one tooltip is open", () => {
  const trigger = box(300, 344);
  trigger.setAttribute("data-base-ui-tooltip-trigger", "");
  trigger.setAttribute("data-popup-open", "");
  const closed = box(400, 444);
  closed.setAttribute("data-base-ui-tooltip-trigger", "");
  const positioner = document.createElement("div");
  positioner.innerHTML = '<div data-slot="tooltip-content"></div>';
  document.body.append(positioner);
  expect(findPopupAnchor(positioner)).toBe(trigger);
  closed.setAttribute("data-popup-open", "");
  expect(findPopupAnchor(positioner)).toBeNull();
});

test("a popup anchored in the sheet's head isn't bounded by the sheet", () => {
  stubBrowser({ webKit: false });
  const surface = box(84, 844);
  const head = box(84, 140, surface);
  const button = box(90, 134, head);
  const field = box(300, 344, surface);
  const sheet = sheetOf(head, surface);
  const onHead = linkedPopup(button);
  const onField = linkedPopup(field);
  expect(isUnbounded(sheetPopupBoundary(sheet, () => onHead))).toBe(true);
  expect(sheetPopupBoundary(sheet, () => onField).y).toBe(140);
});

test("a popup with under four rows on both sides of its anchor isn't bounded; with them on one side it is", () => {
  stubBrowser({ webKit: false });
  // 340px under the head (140 to 480).
  const surface = box(84, 480);
  const sheet = sheetOf(box(84, 140, surface), surface);
  // In the middle: 148px above and 148px below.
  const middle = linkedPopup(box(288, 332, surface));
  expect(POPUP_ROOM_MIN_PX).toBe(150);
  expect(isUnbounded(sheetPopupBoundary(sheet, () => middle))).toBe(true);
  // Lower down: 180px above.
  const lower = linkedPopup(box(320, 364, surface));
  const rect = copy(sheetPopupBoundary(sheet, () => lower));
  expect(rect.y).toBe(140);
  expect(rect.height).toBe(340);
});

test("the room is what the keyboard leaves visible, not the sheet's own height", () => {
  // The sheet runs to 844, but the visual viewport ends at 480.
  stubBrowser({ webKit: false, height: 480 });
  const surface = box(84, 844);
  const sheet = sheetOf(box(84, 140, surface), surface);
  const middle = linkedPopup(box(288, 332, surface));
  expect(isUnbounded(sheetPopupBoundary(sheet, () => middle))).toBe(true);
  stubBrowser({ webKit: false, height: 844 });
  expect(sheetPopupBoundary(sheet, () => middle).y).toBe(140);
});

test("an anchor the popup is given decides, not the trigger found in the page: an element, a ref, a function", () => {
  stubBrowser({ webKit: false });
  const surface = box(84, 844);
  const head = box(84, 140, surface);
  const sheet = sheetOf(head, surface);
  const headButton = box(90, 134, head);
  const field = box(300, 344, surface);
  // The trigger is a field in the body; the popup is anchored to a head button.
  const fromField = linkedPopup(field);
  const fromHead = linkedPopup(box(90, 134, head));
  const lookups = vi.spyOn(document, "querySelectorAll");
  const shapes = (element: Element) => [element, { current: element }, () => element];
  for (const anchor of shapes(headButton)) {
    const boundary = sheetPopupBoundary(
      sheet,
      () => fromField,
      () => anchor,
    );
    expect(isUnbounded(boundary)).toBe(true);
  }
  // And the other way round: the trigger in the head, the anchor in the body.
  for (const anchor of shapes(field)) {
    const boundary = sheetPopupBoundary(
      sheet,
      () => fromHead,
      () => anchor,
    );
    expect(boundary.y).toBe(140);
  }
  expect(lookups).not.toHaveBeenCalled();
  lookups.mockRestore();
});

test("a virtual anchor is placed by its rect: in the head, in the body, and with no room", () => {
  stubBrowser({ webKit: false });
  // 340px under the head (140 to 480).
  const surface = box(84, 480);
  const sheet = sheetOf(box(84, 140, surface), surface);
  const at = (top: number, bottom: number) => ({
    getBoundingClientRect: () => new DOMRect(40, top, 100, bottom - top),
  });
  const bounded = (anchor: ReturnType<typeof at> | (() => ReturnType<typeof at>)) =>
    sheetPopupBoundary(
      sheet,
      () => null,
      () => anchor,
    );
  expect(isUnbounded(bounded(at(90, 134)))).toBe(true);
  expect(bounded(at(320, 364)).y).toBe(140);
  expect(bounded(() => at(320, 364)).y).toBe(140);
  // In the middle: 148px above and 148px below.
  expect(isUnbounded(bounded(at(288, 332)))).toBe(true);
});

test("an anchor that resolves to nothing falls back to the trigger found in the page", () => {
  stubBrowser({ webKit: false });
  const surface = box(84, 844);
  const head = box(84, 140, surface);
  const sheet = sheetOf(head, surface);
  const onHead = linkedPopup(box(90, 134, head));
  for (const anchor of [null, undefined, { current: null }, () => null]) {
    const boundary = sheetPopupBoundary(
      sheet,
      () => onHead,
      () => anchor,
    );
    expect(isUnbounded(boundary)).toBe(true);
  }
});

test("a popup whose anchor can't be found stays bounded", () => {
  stubBrowser({ webKit: false });
  const surface = box(84, 300);
  const sheet = sheetOf(box(84, 140, surface), surface);
  const positioner = document.createElement("div");
  document.body.append(positioner);
  expect(sheetPopupBoundary(sheet, () => positioner).y).toBe(140);
});

test("the frame-inset boundary is shifted in WebKit too", () => {
  const insets = { top: 32, right: 0, bottom: 0, left: 72 };
  stubBrowser({ webKit: true, offsetTop: 120, offsetLeft: 4 });
  const rect = copy(frameCollisionBoundary(insets) as never);
  expect(rect.x).toBe(72 + 8);
  expect(rect.y).toBe(32 + 240);
  stubBrowser({ webKit: false, offsetTop: 120, offsetLeft: 4 });
  expect(copy(frameCollisionBoundary(insets) as never)).toMatchObject({ x: 72, y: 32 });
});

const SHEET_HEAD = box(84, 140);
const SHEET = sheetOf(SHEET_HEAD, box(84, 844));

function inSheet({ children }: { children: ReactNode }) {
  return <PopupSheetContext.Provider value={SHEET}>{children}</PopupSheetContext.Provider>;
}

const boundaryOf = (collision: { collisionBoundary?: unknown }) =>
  collision.collisionBoundary as { y: number; height: number } | undefined;

test("a popup in a sheet takes the sheet's boundary, with its usual padding, and gives its positioner a ref", () => {
  stubBrowser({ webKit: false });
  const { result } = renderHook(() => usePopupCollision(undefined, undefined, 8), {
    wrapper: inSheet,
  });
  expect(result.current.collisionPadding).toBe(8);
  expect(boundaryOf(result.current)?.y).toBe(140);
  expect(result.current.ref).toEqual({ current: null });
});

test("it takes it whatever its portal container, and with a padding of its own", () => {
  stubBrowser({ webKit: false });
  const container = createRef<HTMLElement>();
  const { result } = renderHook(() => usePopupCollision(12, undefined, 8, container), {
    wrapper: inSheet,
  });
  expect(result.current.collisionPadding).toBe(12);
  expect(boundaryOf(result.current)?.y).toBe(140);
});

test("a popup's own anchor reaches the sheet's boundary, the one of the latest render, with the boundary kept", async () => {
  stubBrowser({ webKit: false });
  const inHead = box(90, 134, SHEET_HEAD);
  const inBody = box(300, 344);
  const { result, rerender } = renderHook(
    ({ anchor }: { anchor: Element }) =>
      usePopupCollision(undefined, undefined, 8, undefined, undefined, anchor),
    { wrapper: inSheet, initialProps: { anchor: inHead } },
  );
  const first = result.current.collisionBoundary;
  expect(isUnbounded(boundaryOf(result.current)!)).toBe(true);
  rerender({ anchor: inBody });
  await yielded();
  // The same object: Base UI doesn't rebuild its middleware for a new anchor.
  expect(result.current.collisionBoundary).toBe(first);
  expect(boundaryOf(result.current)?.y).toBe(140);
});

test("a collisionBoundary the caller passes wins over the sheet's, 'clipping-ancestors' included", () => {
  const own = document.createElement("div");
  const { result } = renderHook(() => usePopupCollision(undefined, own, 8), { wrapper: inSheet });
  expect(result.current).toEqual({ collisionPadding: 8, collisionBoundary: own });
  const { result: ancestors } = renderHook(
    () => usePopupCollision(undefined, "clipping-ancestors", 8),
    { wrapper: inSheet },
  );
  expect(ancestors.current).toEqual({
    collisionPadding: 8,
    collisionBoundary: "clipping-ancestors",
  });
});

test("outside a sheet a popup has no boundary and no ref, as before", () => {
  const { result } = renderHook(() => usePopupCollision(undefined, undefined, 8));
  expect(result.current).toEqual({ collisionPadding: 8, collisionBoundary: undefined });
});

test("a dialog, a drawer, a lightbox, an app's own modal layer and a sheet's head start without the sheet", () => {
  const resets: ((children: ReactNode) => ReactNode)[] = [
    (children) => <DialogSheetReset>{children}</DialogSheetReset>,
    (children) => <PopupSheetReset>{children}</PopupSheetReset>,
    (children) => (
      <OverlayLayerProvider kind="dialog" modal>
        {children}
      </OverlayLayerProvider>
    ),
    (children) => (
      <OverlayLayerProvider kind="dialog" modal={false}>
        {children}
      </OverlayLayerProvider>
    ),
  ];
  for (const reset of resets) {
    const { result } = renderHook(() => usePopupCollision(undefined, undefined, 8), {
      wrapper: ({ children }: { children: ReactNode }) => inSheet({ children: reset(children) }),
    });
    expect(result.current.collisionBoundary).toBeUndefined();
  }
});

test("a raft-ui root's own layer keeps the sheet: its trigger is still in the sheet", () => {
  stubBrowser({ webKit: false });
  const { result } = renderHook(() => usePopupCollision(undefined, undefined, 8), {
    wrapper: ({ children }: { children: ReactNode }) =>
      inSheet({
        children: (
          <OverlayLayer kind="dialog" modal>
            {children}
          </OverlayLayer>
        ),
      }),
  });
  expect(boundaryOf(result.current)?.y).toBe(140);
});

test("in a sheet the frame insets go into the padding: the sheet is the boundary", () => {
  stubBrowser({ webKit: false });
  document.documentElement.style.setProperty("--raft-frame-inset-top", "32px");
  const { result } = renderHook(() => usePopupCollision(undefined, undefined, 8), {
    wrapper: inSheet,
  });
  expect(boundaryOf(result.current)?.y).toBe(140);
  expect(result.current.collisionPadding).toMatchObject({ top: 40 });
});

test("SheetPopupBoundary bounds by the head it is given, under its parent by default", () => {
  stubBrowser({ webKit: false });
  const surface = box(84, 844);
  const head = box(84, 140, surface);
  const ref = createRef<Element>();
  ref.current = head;
  const { result } = renderHook(() => usePopupCollision(undefined, undefined, 8), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <SheetPopupBoundary head={ref}>{children}</SheetPopupBoundary>
    ),
  });
  expect(boundaryOf(result.current)?.y).toBe(140);
  expect(boundaryOf(result.current)?.height).toBe(704);
});

// The correction mirrors @floating-ui/dom's own arithmetic, so it is checked
// against the copy Base UI runs, not against a description of it: when an
// upgrade changes how the library treats the visual viewport, these fail.
type FloatingUi = {
  computePosition: (
    reference: Element,
    floating: HTMLElement,
    options: object,
  ) => Promise<{ y: number }>;
  detectOverflow: (state: unknown, options: object) => Promise<{ top: number; bottom: number }>;
};

function loadFloatingUi(): FloatingUi {
  const fromUi = createRequire(import.meta.url);
  const fromBaseUi = createRequire(fromUi.resolve("@base-ui/react/package.json"));
  const fromReactDom = createRequire(fromBaseUi.resolve("@floating-ui/react-dom"));
  // A fresh copy each time: the library caches its WebKit test per module.
  for (const id of Object.keys(fromReactDom.cache)) {
    if (id.includes("@floating-ui")) delete fromReactDom.cache[id];
  }
  return fromReactDom("@floating-ui/dom") as FloatingUi;
}

/**
 * How far a popup placed above a field at 200-244 runs over a sheet's
 * boundary, as floating-ui measures it. jsdom lays nothing out, so the popup
 * has no height and sits on the field's top edge, at 200; the head ends at
 * 176, so the popup is 24px clear of it (-24), however the page is panned.
 */
async function overflowOverHead(popupParent: HTMLElement, position: "fixed" | "absolute") {
  const surface = box(120, 520);
  const sheet = sheetOf(box(120, 176, surface), surface);
  const field = box(200, 244, surface);
  const popup = document.createElement("div");
  popup.style.position = position;
  popupParent.append(popup);
  const { computePosition, detectOverflow } = loadFloatingUi();
  let overflow = { top: Number.NaN, bottom: Number.NaN };
  await computePosition(field, popup, {
    strategy: position,
    placement: "top",
    middleware: [
      {
        name: "probe",
        async fn(state: unknown) {
          overflow = await detectOverflow(state, {
            boundary: sheetPopupBoundary(sheet, () => popup),
          });
          return {};
        },
      },
    ],
  });
  return overflow;
}

test("floating-ui itself, in WebKit with the page panned: a popup fixed to the window is measured against the head", async () => {
  stubBrowser({ webKit: true, offsetTop: 120, height: 400 });
  const overflow = await overflowOverHead(document.body, "fixed");
  expect(overflow.top).toBe(-24);
});

test("floating-ui itself: a popup inside a transformed element, and an absolute one, are too", async () => {
  stubBrowser({ webKit: true, offsetTop: 120, height: 400 });
  const drawer = document.createElement("div");
  drawer.style.transform = "translate3d(0px, 0px, 0px)";
  document.body.append(drawer);
  expect((await overflowOverHead(drawer, "fixed")).top).toBe(-24);
  document.body.replaceChildren();
  expect((await overflowOverHead(document.body, "absolute")).top).toBe(-24);
});

test("floating-ui itself, outside WebKit: the boundary needs no correction", async () => {
  stubBrowser({ webKit: false, offsetTop: 120, height: 400 });
  const overflow = await overflowOverHead(document.body, "fixed");
  expect(overflow.top).toBe(-24);
});
