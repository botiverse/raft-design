import "./chip-ink.test.css";
import { afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "./lib/theme/theme-provider";
import {
  FieldChips,
  MESSAGE_CHIPS,
  MessageChipSentences,
  ROW_CHIPS,
  RowChips,
  chipOf,
  inkGaps,
} from "./chip-ink.test-catalog";

// A chip's ink sits as far from its left edge as from its right
// (design/foundations/alignment.md#chips): a reference in a message, a task
// chip, a reaction, a footer chip, a tag in a field. The gaps are measured on
// the ink, not the boxes: an icon's drawn strokes, a glyph's outline less its
// side bearing, a status pixel's square. Real layout only: jsdom has no boxes.
//
// Chips whose both ends are letters (inline code, a mention, a text badge) take
// equal padding and are left out: what differs there is only the two letters'
// own side bearings, which change with every word. So is the channel chip with
// a `#` icon: Lucide draws `#` 1.75px inside its 14px box where most icons
// leave 0.6px, and a reference chip cannot see which icon it was given, so it
// keeps that 1-2px (alignment.md#chips). The product writes `#` as text.
// Tags with a remove button in a field are left out too: matching their ends
// would take padding they don't have or move the button off its 2px inset, so
// they keep their padding (alignment.md#chips).
//
// Every chip keeps its total padding, and so its width: only the split between
// the two ends moved.

const it = test.skipIf(typeof window === "undefined");

const LETTERS_AT_BOTH_ENDS = new Set([
  "mention-self",
  "code",
  "badge-count",
  "badge-text",
  "badge-mono",
  "badge-outline",
  "quoted-files",
  "history-limited",
]);
const NARROW_ICON = new Set(["ref-channel"]);

beforeAll(async () => {
  if (typeof window === "undefined") return;
  // `load` resolves to the faces it loaded: none means the test CSS lost them.
  const loaded = await Promise.all(
    [
      '400 16px "Space Grotesk"',
      '600 16px "Space Grotesk"',
      '400 14px "Space Mono"',
      '700 14px "Space Mono"',
    ].map((font) => document.fonts.load(font)),
  );
  for (const faces of loaded) expect(faces.length).toBeGreaterThan(0);
});

afterEach(cleanup);

// A desktop with a mouse (the desktop type scale, 20px field chips) and a phone
// (the phone scale, 32px field chips with a larger remove button).
for (const [name, width] of [
  ["desktop", 1280],
  ["phone", 390],
] as const) {
  it(`${name}: the ink at both ends of every chip sits the same distance from its edge`, async () => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(width, 1600);
    render(
      <ThemeProvider mode="light">
        <div style={{ width: Math.min(width, 420) }}>
          <MessageChipSentences />
          <RowChips />
          <FieldChips />
        </div>
      </ThemeProvider>,
    );
    const kinds = [...MESSAGE_CHIPS, ...ROW_CHIPS]
      .map((c) => c.kind)
      .filter((kind) => !LETTERS_AT_BOTH_ENDS.has(kind) && !NARROW_ICON.has(kind));
    const rows = kinds.map((kind) => {
      const gaps = inkGaps(chipOf(document.querySelector(`[data-chip="${kind}"]`)!));
      return { kind, ...gaps };
    });
    expect(rows.length).toBe(kinds.length);
    for (const row of rows) {
      expect(
        Math.abs(row.left - row.right),
        `${row.kind}: ink ${row.left.toFixed(2)}px from the left edge, ${row.right.toFixed(2)}px from the right`,
      ).toBeLessThanOrEqual(1);
    }
  });
}

// The baseline of the text in an element: a zero-size probe sits on it.
function baselineOf(el: Element) {
  const probe = document.createElement("span");
  probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
  el.append(probe);
  const y = probe.getBoundingClientRect().top;
  probe.remove();
  return y;
}

// The middle of the x-height, measured on the glyph `x` in the element's face.
function xMiddleOf(el: Element) {
  const cs = getComputedStyle(el);
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.font = `${cs.fontStyle} ${cs.fontWeight} 1000px ${cs.fontFamily}`;
  const xHeight = (ctx.measureText("x").actualBoundingBoxAscent * parseFloat(cs.fontSize)) / 1000;
  return baselineOf(el) - xHeight / 2;
}

const MESSAGE_LINK = ["ref-message"];

// A smaller note after a chip's label (`msg` in machine type) keeps the label's
// baseline in the layout but is drawn so the middles of the two x-heights meet
// (alignment.md#chips); the label itself stays on the sentence's baseline.
for (const [name, width] of [
  ["desktop", 1280],
  ["phone", 390],
] as const) {
  it(`${name}: a note after a chip's label centres its letters on the label's`, async () => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(width, 900);
    render(
      <ThemeProvider mode="light">
        <div style={{ width: Math.min(width, 420) }}>
          <MessageChipSentences only={MESSAGE_LINK} />
        </div>
      </ThemeProvider>,
    );
    const chip = chipOf(document.querySelector('[data-chip="ref-message"]')!);
    const label = chip.querySelector("[data-slot=message-reference-label]")!;
    const suffix = chip.querySelector("[data-slot=message-reference-suffix]")!;
    const sentence = chip.closest("p")!;
    const beside = document.createElement("span");
    sentence.insertBefore(beside, chip.parentElement);
    const sentenceBaseline = baselineOf(beside);
    beside.remove();
    expect(
      Math.abs(baselineOf(label) - sentenceBaseline),
      "label on the sentence baseline",
    ).toBeLessThanOrEqual(0.5);
    expect(
      Math.abs(xMiddleOf(suffix) - xMiddleOf(label)),
      "the note's x-height middle against the label's",
    ).toBeLessThanOrEqual(0.15);
  });
}
