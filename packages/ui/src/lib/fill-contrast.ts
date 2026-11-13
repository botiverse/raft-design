/**
 * The colour math for a fill Raft doesn't choose, such as an app's colour for
 * its badge (app-link-card.md, Rules): which type reads on it, and whether it
 * needs a ring to part from the surface it lies on. Pure, so a component
 * computes it from the token values without measuring the page.
 *
 * Colours are gamma-encoded sRGB channels from 0 to 1. Contrast is WCAG 2's
 * ratio of relative luminances.
 */

export type Rgb = readonly [r: number, g: number, b: number];

/** The type on a fill: whichever of black and white has the higher contrast. */
export type FillText = "black" | "white";

/**
 * Below this contrast against the surface, a fill gets a hairline ring.
 * 1.5:1 is where a flat fill stops reading as a shape of its own: a pale
 * yellow on a white card, a near-black on a dark one.
 */
export const FILL_RING_CONTRAST = 1.5;

/** `#RRGGBB` (either case) as sRGB channels; anything else is null. */
export function parseHexColor(value: string): Rgb | null {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(value);
  if (!match) return null;
  return [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255];
}

/** An `oklch(l c h)` token value (as tokens.json stores its components) in sRGB, clamped. */
export function oklchToRgb(l: number, c: number, h: number): Rgb {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
  const [r, g, bl] = linear.map((x) => {
    const y = Math.min(1, Math.max(0, x));
    return y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055;
  });
  return [r, g, bl];
}

/** WCAG 2 relative luminance. */
export function relativeLuminance([r, g, b]: Rgb): number {
  const linear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** WCAG 2 contrast ratio, from 1 to 21, in either order. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * The type and the ring for `fill` lying on `surface`: black or white type,
 * whichever has the higher contrast (one of them always reaches 4.58:1), and
 * a ring when the fill's contrast with the surface is below
 * `FILL_RING_CONTRAST`.
 */
export function fillOnSurface(fill: Rgb, surface: Rgb): { text: FillText; ring: boolean } {
  const luminance = relativeLuminance(fill);
  const onBlack = (luminance + 0.05) / 0.05;
  const onWhite = 1.05 / (luminance + 0.05);
  return {
    text: onBlack >= onWhite ? "black" : "white",
    ring: contrastRatio(fill, surface) < FILL_RING_CONTRAST,
  };
}
