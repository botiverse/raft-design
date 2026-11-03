import "./kbd.test.css";
import { afterEach, beforeAll, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { KbdShortcut } from "./kbd-shortcut";
import type { KbdKeyName } from "./kbd-keys";

// md caps of a KbdShortcut, under real layout: every cap one height, a
// single key square, and the text in a cap (trimmed to cap height) centred on
// the same line as the icons in its neighbours. jsdom has no boxes.

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

/** The vertical centre of what each cap draws: its icon or its trimmed text. */
const inkCentres = (testId: string) =>
  [
    ...screen
      .getByTestId(testId)
      .querySelectorAll<Element>('[data-slot="kbd-icon"], [data-slot="kbd-text"]'),
  ].map((ink) => {
    const box = ink.getBoundingClientRect();
    return box.top + box.height / 2;
  });

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

  it("centres icons and text on one line, within 1px", () => {
    renderShortcuts();
    for (const id of ["mac-letter", "other-arrow"]) {
      const centres = inkCentres(id);
      expect(centres.length, id).toBeGreaterThan(1);
      const capBox = caps(id)[0]!;
      const capCentre = capBox.top + capBox.height / 2;
      for (const centre of centres) expect(Math.abs(centre - capCentre), id).toBeLessThanOrEqual(1);
    }
    // Across shortcuts too: a letter cap and an icon cap on the same row line up.
    const letter = inkCentres("letter")[0]! - caps("letter")[0]!.top;
    const icon = inkCentres("icon")[0]! - caps("icon")[0]!.top;
    expect(Math.abs(letter - icon)).toBeLessThanOrEqual(1);
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
