// Color maths for the row-hover browser tests (design/foundations/states.md#row-hover):
// tokens read as the browser serializes them, composited over their surface,
// then measured as an OKLab step, WCAG contrast and APCA Lc.

export async function settled(read: () => string): Promise<string> {
  let prev = "";
  let next = read();
  for (let i = 0; i < 40 && next !== prev; i += 1) {
    prev = next;
    await new Promise((r) => setTimeout(r, 50));
    next = read();
  }
  return next;
}

export type Rgba = [number, number, number, number];

// oklch() -> sRGB (0..1) with alpha; Chrome serializes these tokens as oklch.
export function parseOklch(value: string): Rgba {
  const m = /oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/.exec(value);
  if (!m) throw new Error(`not an oklch color: ${value}`);
  const [L, C, h] = [Number(m[1]), Number(m[2]), (Number(m[3]) * Math.PI) / 180];
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s,
  ];
  const enc = lin.map((x) => {
    const v = Math.min(1, Math.max(0, x));
    return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
  });
  return [enc[0]!, enc[1]!, enc[2]!, m[4] === undefined ? 1 : Number(m[4])];
}

export function over(top: Rgba, base: Rgba): Rgba {
  const t = top[3];
  return [0, 1, 2].map((i) => top[i]! * t + base[i]! * (1 - t)).concat(1) as Rgba;
}

function srgbToOklab(c: Rgba) {
  const [r, g, b] = c
    .slice(0, 3)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)) as [
    number,
    number,
    number,
  ];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

// OKLab distance x 100, the visibility measure in states.md#row-hover.
export function deltaE(x: Rgba, y: Rgba) {
  const [p, q] = [srgbToOklab(x), srgbToOklab(y)];
  return 100 * Math.hypot(p[0]! - q[0]!, p[1]! - q[1]!, p[2]! - q[2]!);
}

function wcagY(c: Rgba) {
  const [r, g, b] = c
    .slice(0, 3)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

export function wcag(a: Rgba, b: Rgba) {
  const [hi, lo] = [wcagY(a), wcagY(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

// APCA-W3 0.1.9, |Lc|.
export function apca(text: Rgba, bg: Rgba) {
  const ys = (c: Rgba) =>
    0.2126729 * c[0] ** 2.4 + 0.7151522 * c[1] ** 2.4 + 0.072175 * c[2] ** 2.4;
  const clamp = (y: number) => (y > 0.022 ? y : y + (0.022 - y) ** 1.414);
  const yt = clamp(ys(text));
  const yb = clamp(ys(bg));
  const s = yb > yt ? (yb ** 0.56 - yt ** 0.57) * 1.14 : (yb ** 0.65 - yt ** 0.62) * 1.14;
  if (Math.abs(s) < 0.1) return 0;
  return Math.abs(s > 0 ? s - 0.027 : s + 0.027) * 100;
}

// The value a token resolves to in this mode, as Chrome serializes it.
export function token(scope: HTMLElement, name: string) {
  const probe = document.createElement("div");
  probe.style.backgroundColor = `var(--${name})`;
  scope.append(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  return value;
}

export const firstOklch = (value: string) => /oklch\([^)]*\)/.exec(value)?.[0] ?? value;
