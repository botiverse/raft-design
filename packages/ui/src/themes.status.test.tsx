/**
 * @vitest-environment jsdom
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Badge } from "./components/badge";
import { MessageActionCardStatus } from "./components/message-action-card";
import { Status } from "./components/status";
import { PRESENCE_COLOR } from "./lib/presence";
import type { Presence } from "./lib/presence";

// A status keeps its colour in every theme (design/foundations/themes.md#signals):
// Boring Gray grays `brand`, and a working agent must not turn gray with it.
// Each light and the Working chip's tint is resolved, through the theme's
// overrides, to the colour it paints, and held to its Raft Yellow value.
const here = dirname(fileURLToPath(import.meta.url));
const themes = JSON.parse(readFileSync(join(here, "themes.json"), "utf8")) as {
  themes: Record<string, { light: Record<string, string>; dark: Record<string, string> }>;
};
const foundation = readFileSync(join(here, "foundation.css"), "utf8");

function block(selector: string): Record<string, string> {
  const start = foundation.indexOf(`${selector} {`);
  if (start < 0) throw new Error(`foundation.css has no ${selector} block`);
  const body = foundation.slice(start, foundation.indexOf("\n}", start));
  return Object.fromEntries(
    [...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
  );
}

/** Every custom property in foundation.css at its first declaration: the light one. */
const LIGHT: Record<string, string> = {};
for (const m of foundation.matchAll(/(--[\w-]+):\s*([^;]+);/g)) LIGHT[m[1]] ??= m[2].trim();
// The Tailwind colours (`bg-presence-busy-soft` paints `--color-presence-busy-soft`).
const utilities = readFileSync(join(here, "styles.css"), "utf8");
for (const m of utilities.matchAll(/(--color-[\w-]+):\s*(var\(--[\w-]+\));/g)) {
  LIGHT[m[1]] ??= m[2];
}
const MODES = { light: LIGHT, dark: { ...LIGHT, ...block(".dark") } };

/** A custom property followed through `var()` to the colour it holds. */
function resolve(name: string, vars: Record<string, string>, depth = 0): string {
  const value = vars[name];
  if (value === undefined) throw new Error(`${name} is not declared`);
  if (depth > 10) throw new Error(`${name} doesn't resolve`);
  return value.replace(/var\((--[\w-]+)\)/g, (_, ref: string) => resolve(ref, vars, depth + 1));
}

afterEach(cleanup);

/** The custom property an element paints with: Status's light, Badge's tint. */
function paint(element: HTMLElement): string {
  const classes = element.className.split(/\s+/);
  const light = classes
    .map((cls) => cls.match(/^\[--status-color:var\((--[\w-]+)\)\]$/)?.[1])
    .filter(Boolean);
  if (light.length) return light.at(-1)!;
  const pixel = classes.map((cls) => cls.match(/^before:bg-([\w-]+)$/)?.[1]).filter(Boolean);
  if (pixel.length) return `--color-${pixel.at(-1)}`;
  const tint = classes.map((cls) => cls.match(/^bg-([\w-]+)$/)?.[1]).filter(Boolean);
  if (tint.length !== 1) throw new Error(`no single tint in ${element.className}`);
  return `--color-${tint[0]}`;
}

const STATUS_VARIANTS = [
  "default",
  "primary",
  "information",
  "muted",
  "accent",
  "success",
  "warning",
  "danger",
] as const;

const cases: [string, () => HTMLElement][] = [
  ...STATUS_VARIANTS.map((variant): [string, () => HTMLElement] => [
    `Status variant="${variant}"`,
    () => {
      render(<Status variant={variant} data-testid="x" />);
      return screen.getByTestId("x");
    },
  ]),
  ...(Object.keys(PRESENCE_COLOR) as Presence[]).map((presence): [string, () => HTMLElement] => [
    `Status presence="${presence}"`,
    () => {
      render(<Status presence={presence} data-testid="x" />);
      return screen.getByTestId("x");
    },
  ]),
  ...(["primary", "busy", "you"] as const).map((variant): [string, () => HTMLElement] => [
    `MessageActionCardStatus variant="${variant}"'s pixel`,
    () => {
      render(
        <MessageActionCardStatus variant={variant} data-testid="x">
          Waiting
        </MessageActionCardStatus>,
      );
      return screen.getByTestId("x");
    },
  ]),
  [
    "the Working chip's tint",
    () => {
      render(
        <Badge appearance="soft" variant="busy" data-testid="x">
          <Status aria-hidden presence="busy" />
          Working…
        </Badge>,
      );
      return screen.getByTestId("x");
    },
  ],
];

test.each(cases)("%s is the same colour in every theme as in Raft Yellow", (_, mount) => {
  const name = paint(mount());
  const drift = Object.entries(themes.themes).flatMap(([id, theme]) =>
    (["light", "dark"] as const).flatMap((mode) => {
      const base = resolve(name, MODES[mode]);
      const themed = resolve(name, { ...MODES[mode], ...theme[mode] });
      return themed === base ? [] : [`${id} ${mode}: ${name} is ${themed}, not ${base}`];
    }),
  );
  expect(drift).toEqual([]);
});

test("Status primary and the Working chip keep the yellow they had from brand", () => {
  for (const vars of Object.values(MODES)) {
    expect(resolve("--presence-busy", vars)).toBe(resolve("--brand-400", vars));
    expect(resolve("--presence-busy-soft", vars)).toBe(resolve("--brand-soft", vars));
  }
});

test("Boring Gray does gray brand, so the checks above can tell", () => {
  const boring = themes.themes.boring;
  for (const mode of ["light", "dark"] as const) {
    const vars = { ...MODES[mode], ...boring[mode] };
    expect(resolve("--brand-400", vars)).not.toBe(resolve("--brand-400", MODES[mode]));
    expect(resolve("--brand-soft", vars)).not.toBe(resolve("--brand-soft", MODES[mode]));
  }
});

test("no theme sets a status colour", () => {
  const set = Object.entries(themes.themes).flatMap(([id, theme]) =>
    (["light", "dark"] as const).flatMap((mode) =>
      Object.keys(theme[mode])
        .filter((name) => /^--(presence|task-status)-/.test(name))
        .map((name) => `${id} ${mode}: ${name}`),
    ),
  );
  expect(set).toEqual([]);
});
