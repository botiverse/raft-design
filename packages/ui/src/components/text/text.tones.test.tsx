// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vite-plus/test";
import { helperText } from "../../lib/helper-text";
import { Text } from "./text";
import type { TextTone } from "./text";

// Every tone of Text is text, so it keeps WCAG 4.5:1 on every surface text
// sits on (the canvas, the sidebar, a card, a popover), in both modes and every
// theme (themes may repaint the surfaces). A colour tone takes its family's
// `-strong` ink: the sticker colours (`success`, `warning`, `danger`) and
// `attention-700` are fills, and fail as text (color.md#contrast).
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

function wcag(a: Rgb, b: Rgb): number {
  const lum = (rgb: Rgb) => {
    const [r, g, bl] = rgb.map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** `ink` as painted on the opaque `surface` (the muted and hint inks are translucent). */
function contrast(ink: string, surface: string, vars: Record<string, string>): number {
  const [bg] = colour(vars[surface]!, vars);
  const [fg, alpha] = colour(vars[ink]!, vars);
  return wcag(fg.map((x, i) => x * alpha + bg[i]! * (1 - alpha)) as Rgb, bg);
}

/** The colour token behind the one `text-*` colour class `element` renders. */
function ink(element: ReactElement): string {
  const className = renderToStaticMarkup(element).match(/class="([^"]*)"/)?.[1] ?? "";
  const inks = className
    .split(/\s+/)
    .filter((c) => c.startsWith("text-") && `--${c.slice(5)}` in LIGHT)
    .map((c) => `--${c.slice(5)}`);
  expect(inks, className).toHaveLength(1);
  return inks[0]!;
}

const TONES = [
  "default",
  "primary",
  "information",
  "note",
  "accent",
  "success",
  "warning",
  "danger",
] as const satisfies readonly Exclude<TextTone, "muted">[];

const muted = helperText("Only people in this channel can see it.", {
  why: "audience",
  about: "visibility",
});

const RENDERED: Array<[name: string, ink: string]> = [
  ...TONES.flatMap((tone): Array<[string, string]> => [
    [`Text.Heading ${tone}`, ink(<Text.Heading variant={tone}>Title</Text.Heading>)],
    [`Text.Sans ${tone}`, ink(<Text.Sans variant={tone}>Words</Text.Sans>)],
    [`Text.Mono ${tone}`, ink(<Text.Mono variant={tone}>#25</Text.Mono>)],
  ]),
  ["Text.Sans muted", ink(<Text.Sans variant="muted">{muted}</Text.Sans>)],
  ["Text.Mono muted", ink(<Text.Mono variant="muted">{muted}</Text.Mono>)],
];

test("a colour tone takes its family's -strong ink, never the sticker colour", () => {
  const byTone = (tone: string) => [
    ...new Set(RENDERED.filter(([name]) => name.endsWith(` ${tone}`)).map(([, v]) => v)),
  ];
  expect(byTone("success")).toEqual(["--success-strong"]);
  expect(byTone("warning")).toEqual(["--warning-strong"]);
  expect(byTone("danger")).toEqual(["--danger-strong"]);
  expect(byTone("accent")).toEqual(["--attention-strong"]);
  expect(byTone("information")).toEqual(["--info-strong"]);
  expect(byTone("primary")).toEqual(["--brand-strong"]);
});

const SURFACES = ["--layer-canvas", "--layer-sidebar", "--layer-card", "--layer-popover"];
const cases: Array<[name: string, vars: Record<string, string>]> = [];
for (const [mode, vars] of Object.entries({ light: LIGHT, dark: DARK })) {
  cases.push([`raft ${mode}`, vars]);
  for (const [id, theme] of Object.entries(themes.themes)) {
    cases.push([`${id} ${mode}`, { ...vars, ...theme[mode as "light" | "dark"] }]);
  }
}

for (const [name, vars] of cases) {
  test(`${name}: every tone of Text keeps 4.5:1 on the canvas, sidebar, card and popover`, () => {
    const low = RENDERED.flatMap(([part, token]) =>
      SURFACES.flatMap((surface) => {
        const ratio = contrast(token, surface, vars);
        return ratio < 4.5 ? [`${part} (${token}) on ${surface}: ${ratio.toFixed(2)}:1`] : [];
      }),
    );
    expect(low).toEqual([]);
  });
}

test("the inks the tones used before would not do: they fail as text", () => {
  expect(contrast("--warning", "--layer-canvas", LIGHT)).toBeLessThan(4.5);
  expect(contrast("--success", "--layer-canvas", LIGHT)).toBeLessThan(4.5);
  expect(contrast("--danger", "--layer-canvas", LIGHT)).toBeLessThan(4.5);
  expect(contrast("--attention-700", "--layer-canvas", DARK)).toBeLessThan(4.5);
});
