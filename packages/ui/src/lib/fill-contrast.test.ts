import { expect, test } from "vite-plus/test";
import {
  FILL_RING_CONTRAST,
  contrastRatio,
  fillOnSurface,
  oklchToRgb,
  parseHexColor,
  relativeLuminance,
} from "./fill-contrast";
import type { Rgb } from "./fill-contrast";

// The colour rule for an app's badge (app-link-card.md, Rules): black or white
// type, whichever has the higher WCAG 2 contrast on the fill, and a hairline
// ring when the fill is below 1.5:1 against the card's surface.

const BLACK: Rgb = [0, 0, 0];
const WHITE: Rgb = [1, 1, 1];
const hex = (value: string) => parseHexColor(value) as Rgb;

test("reads #RRGGBB in either case and nothing else", () => {
  expect(parseHexColor("#218358")).toEqual([0x21 / 255, 0x83 / 255, 0x58 / 255]);
  expect(parseHexColor("#f5d90a")).toEqual(parseHexColor("#F5D90A"));
  for (const bad of ["", "218358", "#fff", "#2183588", "#21835g", "#21835880", "red", " #218358"]) {
    expect(parseHexColor(bad)).toBeNull();
  }
});

test("contrast is WCAG 2's: 21:1 for black on white, 1:1 for a colour on itself", () => {
  expect(contrastRatio(BLACK, WHITE)).toBeCloseTo(21, 5);
  expect(contrastRatio(WHITE, BLACK)).toBeCloseTo(21, 5);
  expect(contrastRatio(hex("#218358"), hex("#218358"))).toBe(1);
  // WebAIM's reference value for #767676 on white.
  expect(contrastRatio(hex("#767676"), WHITE)).toBeCloseTo(4.54, 2);
});

test("oklch white and black are sRGB white and black", () => {
  expect(oklchToRgb(1, 0, 0).map((v) => Math.round(v * 255))).toEqual([255, 255, 255]);
  expect(oklchToRgb(0, 0, 0)).toEqual([0, 0, 0]);
});

test("the type is whichever of black and white reads better", () => {
  const white = oklchToRgb(1, 0, 0);
  expect(fillOnSurface(hex("#218358"), white).text).toBe("white");
  expect(fillOnSurface(hex("#111111"), white).text).toBe("white");
  expect(fillOnSurface(hex("#F5D90A"), white).text).toBe("black");
  // Either side of the crossing (luminance 0.179): #767676 is just above it.
  expect(fillOnSurface(hex("#767676"), white).text).toBe("black");
  expect(fillOnSurface(hex("#757575"), white).text).toBe("white");
  for (const fill of ["#218358", "#111111", "#F5D90A", "#767676", "#757575"]) {
    const rgb = hex(fill);
    const { text } = fillOnSurface(rgb, white);
    const chosen = contrastRatio(rgb, text === "black" ? BLACK : WHITE);
    const other = contrastRatio(rgb, text === "black" ? WHITE : BLACK);
    expect(chosen).toBeGreaterThanOrEqual(other);
  }
});

test("one of black and white always reaches 4.58:1", () => {
  let worst = Infinity;
  for (let r = 0; r < 256; r += 5) {
    for (let g = 0; g < 256; g += 5) {
      for (let b = 0; b < 256; b += 5) {
        const fill: Rgb = [r / 255, g / 255, b / 255];
        const { text } = fillOnSurface(fill, WHITE);
        worst = Math.min(worst, contrastRatio(fill, text === "black" ? BLACK : WHITE));
      }
    }
  }
  expect(worst).toBeGreaterThanOrEqual(4.58);
});

test("a fill below 1.5:1 against the surface gets a ring, one above it doesn't", () => {
  expect(FILL_RING_CONTRAST).toBe(1.5);
  const light = oklchToRgb(1, 0, 0);
  const dark = oklchToRgb(0.2596, 0.0037, 106.65);
  // Stamp's green parts from both cards.
  expect(fillOnSurface(hex("#218358"), light).ring).toBe(false);
  expect(fillOnSurface(hex("#218358"), dark).ring).toBe(false);
  // A near-black needs the ring only in dark mode, a pale yellow only in light.
  expect(fillOnSurface(hex("#111111"), light).ring).toBe(false);
  expect(fillOnSurface(hex("#111111"), dark).ring).toBe(true);
  expect(fillOnSurface(hex("#F5D90A"), light).ring).toBe(true);
  expect(fillOnSurface(hex("#F5D90A"), dark).ring).toBe(false);
  // The threshold itself: a gray whose luminance gives exactly 1.5:1 on white.
  const atThreshold = 1.05 / 1.5 - 0.05;
  const grayAt = (luminance: number): Rgb => {
    const v = luminance <= 0.0031308 ? 12.92 * luminance : 1.055 * luminance ** (1 / 2.4) - 0.055;
    return [v, v, v];
  };
  expect(relativeLuminance(grayAt(atThreshold))).toBeCloseTo(atThreshold, 6);
  expect(fillOnSurface(grayAt(atThreshold - 0.01), WHITE).ring).toBe(false);
  expect(fillOnSurface(grayAt(atThreshold + 0.01), WHITE).ring).toBe(true);
});
