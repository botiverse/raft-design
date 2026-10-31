/**
 * @vitest-environment jsdom
 *
 * The frame insets (design/patterns/page-structure.md#frame-insets) read as
 * physical px: unset is 0, -start and -end swap in right to left, any other
 * CSS length is measured, and the collision padding only grows where there is
 * an inset. A popup keeps out of them by its collision boundary, not by its
 * padding, which Base UI also sizes its shift limiter from.
 */
import { renderHook } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import {
  NO_FRAME_INSETS,
  frameCollision,
  frameCollisionPadding,
  frameInsetsFrom,
  readFrameInsets,
  usePopupCollision,
} from "./frame-insets";

const root = document.documentElement;

afterEach(() => {
  for (const side of ["top", "start", "end"])
    root.style.removeProperty(`--raft-frame-inset-${side}`);
  root.removeAttribute("dir");
  document.body.replaceChildren();
});

function setInsets(values: { top?: string; start?: string; end?: string }) {
  for (const [side, value] of Object.entries(values)) {
    root.style.setProperty(`--raft-frame-inset-${side}`, value);
  }
}

test("reads 0 on every side when no shell sets the variables", () => {
  expect(readFrameInsets()).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
});

test("maps -start to the left and -end to the right in left to right", () => {
  setInsets({ top: "32px", start: "72px", end: "140px" });
  expect(readFrameInsets()).toEqual({ top: 32, right: 140, bottom: 0, left: 72 });
});

test("maps -start to the right and -end to the left with dir=rtl on the document", () => {
  root.setAttribute("dir", "rtl");
  setInsets({ top: "32px", start: "72px", end: "140px" });
  expect(readFrameInsets()).toEqual({ top: 32, right: 72, bottom: 0, left: 140 });
});

test("takes the direction from the nearest ancestor of the portal container", () => {
  setInsets({ end: "140px" });
  const rtl = document.createElement("div");
  rtl.setAttribute("dir", "rtl");
  const container = document.createElement("div");
  rtl.append(container);
  document.body.append(rtl);
  expect(readFrameInsets(container)).toMatchObject({ right: 0, left: 140 });
  expect(readFrameInsets({ current: container })).toMatchObject({ right: 0, left: 140 });

  root.setAttribute("dir", "rtl");
  const ltr = document.createElement("div");
  ltr.setAttribute("dir", "ltr");
  document.body.append(ltr);
  expect(readFrameInsets(ltr)).toMatchObject({ right: 140, left: 0 });
});

test("only one side set leaves the others at 0", () => {
  setInsets({ start: "72px" });
  expect(readFrameInsets()).toEqual({ top: 0, right: 0, bottom: 0, left: 72 });
});

test("measures a value that isn't plain px, along the axis it reserves", () => {
  const measure = vi.fn((value: string) => (value === "calc(40px + 8px)" ? 48 : 32));
  const insets = frameInsetsFrom(
    { top: "calc(40px + 8px)", start: " 12px ", end: "2rem" },
    false,
    measure,
  );
  expect(insets).toEqual({ top: 48, right: 32, bottom: 0, left: 12 });
  expect(measure.mock.calls).toEqual([
    ["calc(40px + 8px)", "block"],
    ["2rem", "inline"],
  ]);
});

test("clamps a negative inset to 0 and returns the shared empty insets", () => {
  const measure = vi.fn(() => Number.NaN);
  expect(frameInsetsFrom({ top: "-4px", start: "", end: "nonsense" }, true, measure)).toBe(
    NO_FRAME_INSETS,
  );
});

test("leaves the padding as it is, the same value, when there is no inset", () => {
  const padding = { top: 4, right: 4, bottom: 4, left: 4 };
  expect(frameCollisionPadding(padding, NO_FRAME_INSETS, 8)).toBe(padding);
  expect(frameCollisionPadding(5, NO_FRAME_INSETS, 8)).toBe(5);
});

test("keeps the gap from each inset and the padding on the sides without one", () => {
  const insets = { top: 32, right: 140, bottom: 0, left: 0 };
  expect(frameCollisionPadding(5, insets, 8)).toEqual({ top: 40, right: 148, bottom: 5, left: 5 });
  expect(frameCollisionPadding(5, insets, 0)).toEqual({ top: 32, right: 140, bottom: 5, left: 5 });
});

test("never lowers a padding larger than the inset and its gap", () => {
  const insets = { top: 0, right: 2, bottom: 0, left: 0 };
  expect(frameCollisionPadding({ top: 6, right: 20 }, insets, 8)).toEqual({
    top: 6,
    right: 20,
    bottom: 0,
    left: 0,
  });
});

test("bounds the popup by the window inset by the insets, and pads only past them", () => {
  const insets = { top: 40, right: 136, bottom: 0, left: 70 };
  const width = vi.spyOn(root, "clientWidth", "get").mockReturnValue(1280);
  const height = vi.spyOn(root, "clientHeight", "get").mockReturnValue(800);
  const { collisionPadding, collisionBoundary } = frameCollision(5, undefined, insets, 8);
  expect(collisionPadding).toEqual({ top: 8, right: 8, bottom: 5, left: 8 });
  expect(collisionBoundary).toEqual({
    x: 70,
    y: 40,
    width: 1280 - 70 - 136,
    height: 800 - 40,
  });
  width.mockRestore();
  height.mockRestore();
  expect(frameCollision({ left: 100 }, undefined, insets, 0).collisionPadding).toEqual({
    top: 0,
    right: 0,
    bottom: 0,
    left: 30,
  });
});

test("reads the boundary's size from the window each time", () => {
  const { collisionBoundary } = frameCollision(
    5,
    undefined,
    { top: 40, right: 0, bottom: 0, left: 0 },
    8,
  );
  const width = vi.spyOn(root, "clientWidth", "get").mockReturnValue(1000);
  expect((collisionBoundary as { width: number }).width).toBe(1000);
  width.mockReturnValue(600);
  expect((collisionBoundary as { width: number }).width).toBe(600);
  width.mockRestore();
});

test("keeps the padding path with no inset, or with a boundary of the caller's own", () => {
  expect(frameCollision(5, undefined, NO_FRAME_INSETS, 8)).toEqual({
    collisionPadding: 5,
    collisionBoundary: undefined,
  });
  const own = document.createElement("div");
  const insets = { top: 32, right: 140, bottom: 0, left: 0 };
  expect(frameCollision(5, own, insets, 8)).toEqual({
    collisionPadding: { top: 40, right: 148, bottom: 5, left: 5 },
    collisionBoundary: own,
  });
});

// A dialog's scrolling body: a popup portaled into it is clipped by it, so it
// keeps Base UI's default boundary (the clipping ancestors) and the insets go
// into its padding, as before.
function containerInScroller() {
  const scroller = document.createElement("div");
  scroller.style.overflow = "auto";
  const container = document.createElement("div");
  scroller.append(container);
  document.body.append(scroller);
  return container;
}

test("keeps the padding path for a popup portaled into a container inside a scroller", () => {
  const insets = { top: 40, right: 136, bottom: 0, left: 70 };
  const container = containerInScroller();
  const padded = { top: 48, right: 144, bottom: 8, left: 78 };
  expect(frameCollision(8, undefined, insets, 8, container)).toEqual({
    collisionPadding: padded,
    collisionBoundary: undefined,
  });
  expect(frameCollision(8, undefined, insets, 8, { current: container })).toEqual({
    collisionPadding: padded,
    collisionBoundary: undefined,
  });
  const host = document.createElement("div");
  container.append(host);
  expect(
    frameCollision(8, undefined, insets, 8, host.attachShadow({ mode: "open" })).collisionBoundary,
  ).toBeUndefined();
});

test("takes the boundary for a popup portaled to the body or the root element", () => {
  const insets = { top: 40, right: 136, bottom: 0, left: 70 };
  for (const container of [undefined, null, document.body, document.documentElement]) {
    expect(frameCollision(8, undefined, insets, 8, container).collisionBoundary).toBeDefined();
  }
});

test("keeps the padding for any ref, even one still empty", () => {
  const insets = { top: 40, right: 136, bottom: 0, left: 70 };
  for (const container of [{ current: null }, { current: document.body }]) {
    expect(frameCollision(8, undefined, insets, 8, container).collisionBoundary).toBeUndefined();
  }
});

test("passes the popup's container through usePopupCollision", () => {
  setInsets({ top: "40px", start: "70px", end: "136px" });
  const container = containerInScroller();
  const inScroller = renderHook(() => usePopupCollision(undefined, undefined, 8, container));
  expect(inScroller.result.current).toEqual({
    collisionPadding: { top: 48, right: 144, bottom: 8, left: 78 },
    collisionBoundary: undefined,
  });
  const inBody = renderHook(() => usePopupCollision(undefined, undefined, 8));
  expect(inBody.result.current.collisionBoundary).toBeDefined();
  expect(inBody.result.current.collisionPadding).toEqual({ top: 8, right: 8, bottom: 8, left: 8 });
});
