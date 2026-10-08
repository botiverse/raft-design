import "./checkbox.test.css";
/**
 * Browser-mode contrast guard for task #724 (2026-10-08). In the elegant dark
 * theme the unchecked checkbox ring was a hardcoded `oklch(0 0 0 / 0.4)` —
 * black 40% over a dark card, measured ≈1.1:1, so the box read as invisible
 * (user report: "the ToS checkbox is nearly invisible in dark theme").
 *
 * The ring must stay a light-alpha boundary in dark — the same `--line-field`
 * token the Input and Textarea use — so the box is visible and the form
 * language stays consistent. The ring lives in the root's box-shadow; this
 * test normalizes the computed color through a canvas (oklch/oklab/rgba all
 * work), composites it over the rendered card background and scores it with
 * WCAG relative luminance. In dark it additionally pins the ring to the
 * field-boundary token so a future override cannot silently go dark again.
 *
 * Run: `vp test run --browser.enabled src/components/checkbox/checkbox.ring-contrast.browser.test.tsx`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Checkbox } from "./checkbox";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

type Rgba = [number, number, number, number];

/** Straight-alpha RGBA bytes for any CSS color, via canvas normalization. */
function toRgba(color: string): Rgba {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no 2d context");
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a / 255];
}

/** The `<color> 0 0 0 1px` component of a computed box-shadow, if present. */
function ringColor(shadow: string): string | null {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of shadow) {
    if (ch === "(") depth += 1;
    if (ch === ")") depth -= 1;
    if (ch === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  parts.push(current.trim());
  const ring = parts.find((part) => /0px\s+0px\s+0px\s+1px/.test(part));
  if (!ring) return null;
  const match = ring.match(
    /(rgba?\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\)|hsla?\([^)]*\)|color\([^)]*\)|#[0-9a-fA-F]+)/,
  );
  return match ? match[1] : null;
}

const luminance = ([r, g, b]: Rgba) => {
  const lin = (byte: number) => {
    const c = byte / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

const composited = (fg: Rgba, bg: Rgba): Rgba => [
  fg[0] * fg[3] + bg[0] * (1 - fg[3]),
  fg[1] * fg[3] + bg[1] * (1 - fg[3]),
  fg[2] * fg[3] + bg[2] * (1 - fg[3]),
  1,
];

const contrast = (a: Rgba, b: Rgba) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const THEMES = [
  { mode: undefined, label: "elegant-light", minContrast: 1.1 },
  { mode: "dark" as const, label: "elegant-dark", minContrast: 1.5 },
];

for (const { mode, label, minContrast } of THEMES) {
  it(`${label}: the unchecked checkbox ring stays visible against the card`, () => {
    render(
      <ThemeProvider theme="elegant" {...(mode ? { mode } : {})}>
        <div data-testid="card" className="bg-layer-card p-4">
          <Checkbox size="md" aria-label="accept terms" />
          <span data-testid="field" className="border border-line-field" aria-hidden="true" />
        </div>
      </ThemeProvider>,
    );

    const root = screen.getByRole("checkbox");
    const card = screen.getByTestId("card");
    const shadow = getComputedStyle(root).boxShadow;
    const raw = ringColor(shadow);
    expect(raw, `ring color found in computed box-shadow: "${shadow}"`).toBeTruthy();

    const ring = toRgba(raw!);
    const bg = toRgba(getComputedStyle(card).backgroundColor);
    const onCard = composited(ring, bg);

    // The reported bug: a black 40% ring over a dark card scored ≈1.1:1.
    expect(contrast(onCard, bg), `ring ${raw} over card`).toBeGreaterThanOrEqual(minContrast);

    if (mode === "dark") {
      // A dark-on-dark ring was the bug: in dark the ring must lighten the card.
      expect(luminance(onCard)).toBeGreaterThan(luminance(bg));

      // Same token as the field boundaries (Input/Textarea `border-line-field`).
      const field = toRgba(getComputedStyle(screen.getByTestId("field")).borderTopColor);
      for (let i = 0; i < 3; i += 1) {
        expect(
          Math.abs(ring[i] - field[i]),
          `ring channel ${i} vs field boundary`,
        ).toBeLessThanOrEqual(1);
      }
      expect(Math.abs(ring[3] - field[3])).toBeLessThanOrEqual(0.01);
    }
  });
}
