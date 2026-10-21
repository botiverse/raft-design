import { expect, test } from "vite-plus/test";

import { roomBelowIsShort } from "./combobox-select.list-side";

const viewport = { top: 0, height: 844 };

test("room for three rows below the field is enough", () => {
  expect(roomBelowIsShort({ bottom: 100 }, viewport)).toBe(false);
  // 844 - 720 - 4 = 120 = 3 × 36 + 12: exactly three rows.
  expect(roomBelowIsShort({ bottom: 720 }, viewport)).toBe(false);
});

test("less than three rows below the field is short", () => {
  expect(roomBelowIsShort({ bottom: 721 }, viewport)).toBe(true);
  // The keyboard is up: the visual viewport is the top 420px.
  expect(roomBelowIsShort({ bottom: 380 }, { top: 0, height: 420 })).toBe(true);
});

test("measured against the visual viewport, wherever it has scrolled to", () => {
  expect(roomBelowIsShort({ bottom: 900 }, { top: 800, height: 400 })).toBe(false);
  expect(roomBelowIsShort({ bottom: 1100 }, { top: 800, height: 400 })).toBe(true);
});
