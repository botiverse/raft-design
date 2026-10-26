import { expect, test } from "vite-plus/test";
import { placeRefusalHint } from "./drop-placeholder";

// Where the refusal chip goes (design/patterns/drag-and-drop.md#refused-places):
// right of and below the pointer, flipped left and up at the window's edges,
// never under the lifted copy, and always 8px inside the window.

const VIEWPORT = { width: 1000, height: 800 };
const SIZE = { width: 180, height: 24 };

type Box = { left: number; top: number; right: number; bottom: number };
const box = (left: number, top: number, width: number, height: number): Box => ({
  left,
  top,
  right: left + width,
  bottom: top + height,
});
const chip = (at: { x: number; y: number }) => box(at.x, at.y, SIZE.width, SIZE.height);
const overlaps = (a: Box, b: Box) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

function inside(at: { x: number; y: number }) {
  const rect = chip(at);
  expect(rect.left).toBeGreaterThanOrEqual(8);
  expect(rect.top).toBeGreaterThanOrEqual(8);
  expect(rect.right).toBeLessThanOrEqual(VIEWPORT.width - 8);
  expect(rect.bottom).toBeLessThanOrEqual(VIEWPORT.height - 8);
}

test("away from the edges it sits 14px right of and 16px below the pointer", () => {
  // A compact proxy held near its right end, as keepGrabInside leaves it.
  const lift = box(300, 290, 140, 32);
  expect(placeRefusalHint({ x: 420, y: 306 }, SIZE, lift, VIEWPORT)).toEqual({ x: 434, y: 322 });
});

test("near the right edge it goes left of the pointer and of the copy", () => {
  // The copy reaches left of the pointer (keepGrabInside): the chip clears it.
  const lift = box(700, 290, 240, 32);
  const at = placeRefusalHint({ x: 920, y: 306 }, SIZE, lift, VIEWPORT);
  expect(at).toEqual({ x: 700 - 14 - SIZE.width, y: 322 });
  inside(at);
  expect(overlaps(chip(at), lift)).toBe(false);
});

test("near the bottom edge it goes above the pointer, clear of the copy", () => {
  const lift = box(300, 740, 140, 32);
  const at = placeRefusalHint({ x: 420, y: 756 }, SIZE, lift, VIEWPORT);
  expect(at.y + SIZE.height).toBeLessThanOrEqual(740);
  inside(at);
  expect(overlaps(chip(at), lift)).toBe(false);
});

test("in the bottom-right corner it goes left and up, inside the window and off the copy", () => {
  const lift = box(740, 750, 240, 32);
  const at = placeRefusalHint({ x: 960, y: 770 }, SIZE, lift, VIEWPORT);
  expect(at.x + SIZE.width).toBeLessThanOrEqual(740);
  expect(at.y).toBeLessThan(770);
  inside(at);
  expect(overlaps(chip(at), lift)).toBe(false);
});

test("a tall copy under the pointer pushes the chip below it, not under it", () => {
  const lift = box(200, 100, 260, 160);
  const at = placeRefusalHint({ x: 260, y: 140 }, SIZE, lift, VIEWPORT);
  expect(overlaps(chip(at), lift)).toBe(false);
  inside(at);
});

test("past the top-left corner it is still held 8px inside", () => {
  expect(placeRefusalHint({ x: -200, y: -200 }, SIZE, null, VIEWPORT)).toEqual({ x: 8, y: 8 });
});
