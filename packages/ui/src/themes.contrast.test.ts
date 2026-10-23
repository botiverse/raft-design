import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

// Every theme keeps its text readable (APCA Lc, design/foundations/themes.md):
// body text on each surface, and type on the frame and its selected item.
// themes.json is edited by hand, so a new theme is checked here.
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
