/**
 * @vitest-environment jsdom
 *
 * The frame insets (design/patterns/page-structure.md#frame-insets) read as
 * physical px: unset is 0, -start and -end swap in right to left, any other
 * CSS length is measured, and the collision padding only grows where there is
 * an inset.
 */
import { afterEach, expect, test, vi } from "vite-plus/test";
import {
  NO_FRAME_INSETS,
  frameCollisionPadding,
  frameInsetsFrom,
  readFrameInsets,
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
