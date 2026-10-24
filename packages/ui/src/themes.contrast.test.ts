import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

// Every theme keeps its text readable (APCA Lc, design/foundations/themes.md):
// body text on each surface, and type on the frame and its selected item. And
// it keeps its signals: the selected sticker and what is addressed to you stay
// as far from their surroundings as in Raft Yellow (OKLab ΔE). themes.json is
// edited by hand, so a new theme is checked here.
const here = dirname(fileURLToPath(import.meta.url));
const themes = JSON.parse(readFileSync(join(here, "themes.json"), "utf8")) as {
  themes: Record<string, { light: Record<string, string>; dark: Record<string, string> }>;
};
const foundation = readFileSync(join(here, "foundation.css"), "utf8");

/** The custom properties declared in the first block that opens with `selector {`. */
function block(selector: string): Record<string, string> {
  const start = foundation.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`foundation.css has no ${selector} block`);
  const body = foundation.slice(start, foundation.indexOf("\n}", start));
  return Object.fromEntries(
    [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
  );
}

const LIGHT = block(":where(:root),\n.light");
const DARK = { ...LIGHT, ...block(".dark") };

type Oklch = [number, number, number];

function parse(value: string, vars: Record<string, string>, depth = 0): Oklch {
  if (depth > 10) throw new Error(`unresolved ${value}`);
  const v = value.trim();
  const ref = v.match(/^var\((--[\w-]+)\)$/);
  if (ref) return parse(vars[ref[1]], vars, depth + 1);
  const ok = v.match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/);
  if (ok) return [Number(ok[1]), Number(ok[2]), Number(ok[3])];
  const mix = v.match(/^color-mix\(in oklch, (.+) (\d+)%, (.+)\)$/);
  if (mix) {
    const a = parse(mix[1], vars, depth + 1);
    const b = parse(mix[3], vars, depth + 1);
    const p = Number(mix[2]) / 100;
    let dh = b[2] - a[2];
    if (dh > 180) dh -= 360;
    if (dh < -180) dh += 360;
    return [a[0] * p + b[0] * (1 - p), a[1] * p + b[1] * (1 - p), a[2] + dh * (1 - p)];
  }
  throw new Error(`can't read colour ${v}`);
}

/** Gamma-encoded sRGB, clamped. */
function srgb([l, c, h]: Oklch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
  return lin.map((x) => {
    const y = Math.min(1, Math.max(0, x));
    return y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055;
  }) as [number, number, number];
}

/** An `oklch(l c h / a)` value with its alpha, or an opaque colour. */
function parseAlpha(value: string, vars: Record<string, string>): [Oklch, number] {
  const v = value.trim();
  const ref = v.match(/^var\((--[\w-]+)\)$/);
  if (ref) return parseAlpha(vars[ref[1]], vars);
  const ok = v.match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+) \/ ([\d.]+)\)$/);
  if (ok) return [[Number(ok[1]), Number(ok[2]), Number(ok[3])], Number(ok[4])];
  return [parse(v, vars), 1];
}

/** `top` laid over `bottom` in gamma-encoded sRGB, as the browser paints it. */
function over(top: string, bottom: string, vars: Record<string, string>): [number, number, number] {
  const [colour, alpha] = parseAlpha(vars[top], vars);
  const a = srgb(colour);
  const b = srgb(parse(vars[bottom], vars));
  return a.map((x, i) => x * alpha + b[i] * (1 - alpha)) as [number, number, number];
}

/** Gamma-encoded sRGB to OKLab. */
function oklab(rgb: [number, number, number]): [number, number, number] {
  const [r, g, b] = rgb.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** OKLab ΔE × 100: about 2 is just noticeable; the hover tiers are 2.1 to 8.4 (states.md). */
function deltaE(a: [number, number, number], b: [number, number, number]): number {
  const [x, y] = [oklab(a), oklab(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) * 100;
}

/** APCA 0.0.98G-4g lightness contrast, as a positive Lc. */
function apca(text: Oklch, background: Oklch): number {
  const lum = (rgb: [number, number, number]) => {
    const y = 0.2126729 * rgb[0] ** 2.4 + 0.7151522 * rgb[1] ** 2.4 + 0.072175 * rgb[2] ** 2.4;
    return y < 0.022 ? y + (0.022 - y) ** 1.414 : y;
  };
  const yt = lum(srgb(text));
  const yb = lum(srgb(background));
  if (Math.abs(yb - yt) < 0.0005) return 0;
  if (yb > yt) {
    const s = (yb ** 0.56 - yt ** 0.57) * 1.14;
    return s < 0.1 ? 0 : (s - 0.027) * 100;
  }
  const s = (yb ** 0.65 - yt ** 0.62) * 1.14;
  return s > -0.1 ? 0 : -(s + 0.027) * 100;
}

const PAIRS: Array<[text: string, background: string, min: number]> = [
  ["--foreground", "--layer-canvas", 75],
  ["--foreground", "--layer-card", 75],
  ["--foreground", "--layer-popover", 75],
  ["--foreground", "--layer-sidebar", 75],
  ["--foreground-on-frame", "--layer-frame", 60],
  ["--foreground-on-frame-active", "--layer-frame-active", 60],
  ["--foreground-on-frame-muted", "--layer-frame", 45],
];

for (const [id, theme] of Object.entries(themes.themes)) {
  for (const mode of ["light", "dark"] as const) {
    test(`${id} ${mode}: text keeps its contrast`, () => {
      const vars = { ...(mode === "light" ? LIGHT : DARK), ...theme[mode] };
      const low = PAIRS.flatMap(([text, bg, min]) => {
        const lc = apca(parse(vars[text], vars), parse(vars[bg], vars));
        return lc < min ? [`${text} on ${bg}: Lc ${lc.toFixed(1)} < ${min}`] : [];
      });
      expect(low).toEqual([]);
    });
  }
}

// The signals a theme never grays (themes.md): each must stand off what is
// around it by ΔE 10 or more. Raft Yellow's are 16.5 to 20 in light mode; the
// gray Boring Gray used to paint them with was 1.4 to 7.5. Each entry is the
// opaque `fill` against `against` laid over `backdrop` (a translucent hover
// over its track; a surface over itself).
const SIGNALS: Array<[name: string, fill: string, against: string, backdrop: string]> = [
  ["selected segment vs a hovered segment", "--selected", "--fill-medium", "--fill-muted"],
  ["selected sidebar row vs the sidebar", "--selected", "--layer-sidebar", "--layer-sidebar"],
  ["mention of you vs the canvas", "--you", "--layer-canvas", "--layer-canvas"],
];

for (const [id, theme] of Object.entries(themes.themes)) {
  for (const mode of ["light", "dark"] as const) {
    test(`${id} ${mode}: you and selected stay apart from their surroundings`, () => {
      const vars = { ...(mode === "light" ? LIGHT : DARK), ...theme[mode] };
      const low = SIGNALS.flatMap(([name, fill, against, backdrop]) => {
        const d = deltaE(srgb(parse(vars[fill], vars)), over(against, backdrop, vars));
        return d < 10 ? [`${name}: ΔE ${d.toFixed(1)} < 10`] : [];
      });
      expect(low).toEqual([]);
    });
  }
}

// The signal tokens are Raft yellow, as `brand` is in Raft Yellow, and no theme
// sets them (themes.md#signals): the three literals can't drift apart, and
// Boring Gray can't gray them by accident.
test("you and selected are brand's yellow in Raft Yellow, in both modes", () => {
  for (const vars of [LIGHT, DARK]) {
    expect(parse(vars["--you"], vars)).toEqual(parse(vars["--brand-400"], vars));
    expect(parse(vars["--selected"], vars)).toEqual(parse(vars["--brand-400"], vars));
  }
});

test("no theme sets you or selected", () => {
  const set = Object.entries(themes.themes).flatMap(([id, theme]) =>
    (["light", "dark"] as const).flatMap((mode) =>
      ["--you", "--selected"]
        .filter((name) => name in theme[mode])
        .map((name) => `${id} ${mode}: ${name}`),
    ),
  );
  expect(set).toEqual([]);
});
