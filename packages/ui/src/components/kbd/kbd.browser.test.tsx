import "./kbd.test.css";
import { afterEach, beforeAll, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { KbdShortcut } from "./kbd-shortcut";
import type { KbdKeyName } from "./kbd-keys";

// md caps of a KbdShortcut, under real layout: every cap one height, a
// single key square, and the text in a cap trimmed to cap height
// (text-box: trim-both cap alphabetic) so its ink centres on the same line as
// the icons in its neighbours. jsdom has no boxes. Chromium only: Firefox has
// no text-box, where the text centres on its line box instead.

const it = test.skipIf(typeof window === "undefined");

beforeAll(async () => {
  if (typeof window === "undefined") return;
  await document.fonts.load('13px "Space Mono"');
  await document.fonts.ready;
});

afterEach(cleanup);

const MOD_SHIFT_ENTER: KbdKeyName[] = ["mod", "shift", "enter"];
const ESCAPE: KbdKeyName[] = ["escape"];
const K: KbdKeyName[] = ["k"];
const MOD_ALT_M: KbdKeyName[] = ["mod", "alt", "m"];
const MOD_UP: KbdKeyName[] = ["mod", "up"];
const UP: KbdKeyName[] = ["up"];

const caps = (testId: string) =>
  [...screen.getByTestId(testId).querySelectorAll<HTMLElement>('[data-slot="kbd"]')].map((cap) =>
    cap.getBoundingClientRect(),
  );

function renderShortcuts() {
  render(
    <div className="flex flex-col items-start gap-4 p-8">
      <KbdShortcut data-testid="mac" size="md" platform="mac" keys={MOD_SHIFT_ENTER} />
      <KbdShortcut data-testid="mac-letter" size="md" platform="mac" keys={MOD_ALT_M} />
      <KbdShortcut data-testid="other" size="md" platform="other" keys={MOD_SHIFT_ENTER} />
      <KbdShortcut data-testid="other-arrow" size="md" platform="other" keys={MOD_UP} />
      <KbdShortcut data-testid="letter" size="md" platform="mac" keys={K} />
      <KbdShortcut data-testid="icon" size="md" platform="mac" keys={UP} />
      <KbdShortcut data-testid="esc" size="md" platform="other" keys={ESCAPE} />
    </div>,
  );
}

const SHORTCUTS = ["mac", "mac-letter", "other", "other-arrow", "letter", "icon", "esc"];

describe("KbdShortcut md", () => {
  it("draws every cap 24px tall", () => {
    renderShortcuts();
    for (const id of SHORTCUTS) {
      for (const cap of caps(id)) expect(cap.height, id).toBe(24);
    }
  });

  it("trims text to cap height and centres it on the icons' line, within 1px", () => {
    renderShortcuts();
    // Space Mono's cap height at the cap's font size, from the font itself.
    const sample = screen
      .getByTestId("letter")
      .querySelector<HTMLElement>('[data-slot="kbd-text"]')!;
    const style = getComputedStyle(sample);
    const fontSize = parseFloat(style.fontSize);
    const context = document.createElement("canvas").getContext("2d")!;
    context.font = `${style.fontSize} ${style.fontFamily}`;
    const capHeight = context.measureText("H").actualBoundingBoxAscent;
    expect(fontSize).toBe(13);
    expect(capHeight).toBeGreaterThan(fontSize * 0.5);
    expect(capHeight).toBeLessThan(fontSize * 0.8);

    for (const id of ["mac-letter", "other-arrow", "letter", "esc"]) {
      for (const text of screen
        .getByTestId(id)
        .querySelectorAll<HTMLElement>('[data-slot="kbd-text"]')) {
        // Untrimmed, the text's box is its 13px line box (leading-none); trimmed,
        // it is the cap height, so its box is the letters' ink.
        const box = text.getBoundingClientRect();
        expect(Math.abs(box.height - capHeight), `${id} "${text.textContent}"`).toBeLessThanOrEqual(
          1,
        );
        expect(box.height).toBeLessThan(fontSize * 0.8);
      }
    }

    // The letters' ink and the icons centre on the same line, within 1px.
    for (const id of ["mac-letter", "other-arrow"]) {
      const root = screen.getByTestId(id);
      const icon = root.querySelector('[data-slot="kbd-icon"]')!.getBoundingClientRect();
      const iconCentre = icon.top + icon.height / 2;
      for (const text of root.querySelectorAll('[data-slot="kbd-text"]')) {
        const box = text.getBoundingClientRect();
        expect(Math.abs(box.top + box.height / 2 - iconCentre), id).toBeLessThanOrEqual(1);
      }
    }
  });

  it("draws a single key square", () => {
    renderShortcuts();
    for (const id of ["letter", "icon"]) {
      const [cap] = caps(id);
      expect(cap!.width, id).toBe(cap!.height);
    }
    // One-glyph caps inside a shortcut are square too.
    for (const cap of caps("mac")) expect(cap.width).toBe(cap.height);
  });
});
