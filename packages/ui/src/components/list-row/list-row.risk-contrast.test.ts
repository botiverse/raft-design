import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

// An action row's risk tone (list-row.md#an-actions-risk) colours its title
// and leading icon `warning-strong` or `danger-strong`. They are text, so they
// keep WCAG 4.5:1 wherever a row sits (the canvas, a card, a popover, the
// sidebar), at rest, hovered (`fill-subtle`) and pressed (`fill-medium`), in
// both modes and every theme (themes may repaint the surfaces in dark mode).
// The sticker `warning` and `danger` are fills for ink type and would fail.
const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "../..");
const foundation = readFileSync(join(src, "foundation.css"), "utf8");
const themes = JSON.parse(readFileSync(join(src, "themes.json"), "utf8")) as {
  themes: Record<string, { light: Record<string, string>; dark: Record<string, string> }>;
};

/** The custom properties declared in the first block that opens with `selector {`. */
function block(selector: string): Record<string, string> {
  const start = foundation.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`foundation.css has no ${selector} block`);
  const body = foundation.slice(start, foundation.indexOf("\n}", start));
  return Object.fromEntries(
    [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
  );
}

const ROOT = block(":where(:root)");
const LIGHT = { ...ROOT, ...block(":where(:root),\n.light") };
const DARK = { ...LIGHT, ...block(".dark") };

type Rgb = [number, number, number];

/** An `oklch(l c h)` or `oklch(l c h / a)` value, following `var()`s, as gamma-encoded sRGB and alpha. */
function colour(value: string, vars: Record<string, string>, depth = 0): [Rgb, number] {
  if (depth > 10) throw new Error(`unresolved ${value}`);
  const v = value.trim();
  const ref = v.match(/^var\((--[\w-]+)\)$/);
  if (ref) return colour(vars[ref[1]!]!, vars, depth + 1);
  const m = v.match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/);
  if (!m) throw new Error(`can't read colour ${v}`);
  const [l, c, h] = [Number(m[1]), Number(m[2]), (Number(m[3]) * Math.PI) / 180];
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ].map((x) => {
    const y = Math.min(1, Math.max(0, x));
    return y <= 0.0031308 ? 12.92 * y : 1.055 * y ** (1 / 2.4) - 0.055;
  }) as Rgb;
  return [rgb, m[4] === undefined ? 1 : Number(m[4])];
}

/** `fill` laid over the opaque `surface`, as the browser paints a hovered row. */
function painted(surface: string, fill: string | null, vars: Record<string, string>): Rgb {
  const [base] = colour(vars[surface]!, vars);
  if (!fill) return base;
  const [top, alpha] = colour(vars[fill]!, vars);
  return base.map((x, i) => top[i]! * alpha + x * (1 - alpha)) as Rgb;
}

function wcag(a: Rgb, b: Rgb): number {
  const lum = (rgb: Rgb) => {
    const [r, g, bl] = rgb.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

const INKS = ["--warning-strong", "--danger-strong"];
const SURFACES = ["--layer-canvas", "--layer-card", "--layer-popover", "--layer-sidebar"];
const FILLS = [null, "--fill-subtle", "--fill-medium"];

const modes = { light: LIGHT, dark: DARK };
const cases: Array<[name: string, vars: Record<string, string>]> = [];
for (const [mode, vars] of Object.entries(modes)) {
  cases.push([`raft ${mode}`, vars]);
  for (const [id, theme] of Object.entries(themes.themes)) {
    cases.push([`${id} ${mode}`, { ...vars, ...theme[mode as "light" | "dark"] }]);
  }
}

for (const [name, vars] of cases) {
  test(`${name}: a risk tone's title and icon keep 4.5:1, at rest, hovered and pressed`, () => {
    const low = INKS.flatMap((ink) =>
      SURFACES.flatMap((surface) =>
        FILLS.flatMap((fill) => {
          const ratio = wcag(colour(vars[ink]!, vars)[0], painted(surface, fill, vars));
          return ratio < 4.5
            ? [`${ink} on ${surface}${fill ? ` + ${fill}` : ""}: ${ratio.toFixed(2)}:1`]
            : [];
        }),
      ),
    );
    expect(low).toEqual([]);
  });
}

test("the sticker colours would not do: they fail as text on paper", () => {
  const ratio = wcag(colour(LIGHT["--warning"]!, LIGHT)[0], painted("--layer-card", null, LIGHT));
  expect(ratio).toBeLessThan(4.5);
});
