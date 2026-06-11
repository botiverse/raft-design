import { createFileRoute } from "@tanstack/react-router";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { StatusBadge } from "#/components/status-badge.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";

const SHADES = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const;

type Shade = (typeof SHADES)[number];

const PALETTE_VALUES = {
  yellow: {
    "50": "oklch(0.984 0.017 84.56)",
    "100": "oklch(0.975 0.027 85.64)",
    "200": "oklch(0.94 0.066 86.23)",
    "300": "oklch(0.913 0.103 88.02)",
    "400": "oklch(0.883 0.162 91.89)",
    "500": "oklch(0.759 0.155 92.93)",
    "600": "oklch(0.637 0.13 92.64)",
    "700": "oklch(0.508 0.104 92.9)",
    "800": "oklch(0.388 0.08 93.41)",
    "900": "oklch(0.26 0.053 92.86)",
    "950": "oklch(0.199 0.041 93.21)",
  },
  pink: {
    "50": "oklch(0.968 0.017 359.4)",
    "100": "oklch(0.936 0.034 2.02)",
    "200": "oklch(0.871 0.073 0.34)",
    "300": "oklch(0.808 0.116 0.76)",
    "400": "oklch(0.749 0.162 0.71)",
    "500": "oklch(0.662 0.244 0.59)",
    "600": "oklch(0.565 0.226 0.56)",
    "700": "oklch(0.456 0.182 0.91)",
    "800": "oklch(0.354 0.142 0.38)",
    "900": "oklch(0.246 0.098 0.96)",
    "950": "oklch(0.198 0.08 359.99)",
  },
  purple: {
    "50": "oklch(0.976 0.008 294.09)",
    "100": "oklch(0.949 0.018 296.72)",
    "200": "oklch(0.891 0.037 294.17)",
    "300": "oklch(0.84 0.056 294.36)",
    "400": "oklch(0.783 0.078 294.55)",
    "500": "oklch(0.682 0.117 294)",
    "600": "oklch(0.575 0.157 293.61)",
    "700": "oklch(0.475 0.168 293)",
    "800": "oklch(0.367 0.131 293.06)",
    "900": "oklch(0.25 0.09 293.19)",
    "950": "oklch(0.195 0.07 292.41)",
  },
  cyan: {
    "50": "oklch(0.974 0.016 226.9)",
    "100": "oklch(0.945 0.033 226.27)",
    "200": "oklch(0.892 0.07 224.23)",
    "300": "oklch(0.835 0.114 220.86)",
    "400": "oklch(0.783 0.135 219.2)",
    "500": "oklch(0.672 0.116 219.07)",
    "600": "oklch(0.569 0.099 219.95)",
    "700": "oklch(0.46 0.079 219.13)",
    "800": "oklch(0.348 0.06 219.02)",
    "900": "oklch(0.246 0.043 221.18)",
    "950": "oklch(0.185 0.032 217.82)",
  },
  orange: {
    "50": "oklch(0.976 0.011 45.81)",
    "100": "oklch(0.941 0.028 40.23)",
    "200": "oklch(0.892 0.053 43.23)",
    "300": "oklch(0.835 0.087 46.56)",
    "400": "oklch(0.785 0.123 50.11)",
    "500": "oklch(0.685 0.145 54.68)",
    "600": "oklch(0.57 0.121 54.53)",
    "700": "oklch(0.465 0.099 54.58)",
    "800": "oklch(0.361 0.076 55.55)",
    "900": "oklch(0.246 0.052 55.54)",
    "950": "oklch(0.191 0.042 54.31)",
  },
  lime: {
    "50": "oklch(0.98 0.029 132.52)",
    "100": "oklch(0.949 0.081 130.41)",
    "200": "oklch(0.91 0.149 130.12)",
    "300": "oklch(0.867 0.142 130.1)",
    "400": "oklch(0.827 0.135 130.07)",
    "500": "oklch(0.715 0.118 130.4)",
    "600": "oklch(0.596 0.099 130.36)",
    "700": "oklch(0.485 0.08 129.92)",
    "800": "oklch(0.366 0.06 130.11)",
    "900": "oklch(0.256 0.041 130.57)",
    "950": "oklch(0.196 0.032 130.49)",
  },
  red: {
    "50": "oklch(0.968 0.014 22.88)",
    "100": "oklch(0.926 0.034 20.05)",
    "200": "oklch(0.854 0.072 22.92)",
    "300": "oklch(0.781 0.118 25.18)",
    "400": "oklch(0.711 0.168 28.04)",
    "500": "oklch(0.627 0.209 32.98)",
    "600": "oklch(0.528 0.176 33.04)",
    "700": "oklch(0.431 0.144 33.03)",
    "800": "oklch(0.331 0.11 33.1)",
    "900": "oklch(0.243 0.081 33.19)",
    "950": "oklch(0.185 0.061 34.2)",
  },
  stone: {
    "50": "oklch(0.974 0.002 67.9)",
    "100": "oklch(0.947 0.003 67.83)",
    "200": "oklch(0.896 0.008 73.73)",
    "300": "oklch(0.845 0.014 71.31)",
    "400": "oklch(0.789 0.014 71.29)",
    "500": "oklch(0.682 0.012 76.55)",
    "600": "oklch(0.569 0.01 67.63)",
    "700": "oklch(0.466 0.008 67.63)",
    "800": "oklch(0.354 0.007 67.62)",
    "900": "oklch(0.249 0.005 67.61)",
    "950": "oklch(0.187 0.003 67.68)",
  },
  cream: {
    "50": "oklch(1 0 0)",
    "100": "oklch(0.991 0.01 87.41)",
    "200": "oklch(0.986 0.015 86.39)",
    "300": "oklch(0.878 0.18 95.13)",
    "400": "oklch(0.777 0.16 95.27)",
    "500": "oklch(0.663 0.136 95.2)",
    "600": "oklch(0.561 0.115 95.02)",
    "700": "oklch(0.457 0.094 95.72)",
    "800": "oklch(0.352 0.072 94.83)",
    "900": "oklch(0.242 0.05 95.07)",
    "950": "oklch(0.189 0.039 94.73)",
  },
} as const satisfies Record<string, Record<Shade, string>>;

const TOC = [
  { id: "contract", title: "Contract" },
  { id: "primitive", title: "Primitive palette" },
  { id: "aliases", title: "Theme aliases" },
  { id: "states", title: "State tones" },
  { id: "theme", title: "Theme tokens" },
  { id: "usage", title: "Usage" },
] as const;

const CONTRACT = [
  {
    label: "Primitive scales",
    value: "brutal-*",
    detail:
      "Raw color ingredients live under --color-brutal-{name}-{shade}. Components may use them only when the tone itself is part of the component contract.",
  },
  {
    label: "Base shade",
    value: "400",
    detail:
      "Every saturated brutal family uses 400 as its tints.dev locked base. Cream is the only exception: cream-200 is the cotton surface base.",
  },
  {
    label: "Theme aliases",
    value: "runtime",
    detail:
      "primary, accent, secondary, and state roles resolve through CSS variables so brutal and elegant share class names.",
  },
] as const;

const PALETTES = [
  {
    name: "yellow",
    baseShade: "400",
  },
  {
    name: "pink",
    baseShade: "400",
  },
  {
    name: "purple",
    baseShade: "400",
  },
  {
    name: "cyan",
    baseShade: "400",
  },
  {
    name: "orange",
    baseShade: "400",
  },
  {
    name: "lime",
    baseShade: "400",
  },
  {
    name: "red",
    baseShade: "400",
  },
  {
    name: "stone",
    baseShade: "400",
  },
  {
    name: "cream",
    baseShade: "200",
  },
] as const;

const ALIASES = [
  {
    role: "primary",
    scale: "yellow",
    baseShade: "400",
    utilities: "bg-primary-400, text-primary-950",
    note: "Default brutal action fill. Button, tabs, toggles, and highlighted rows consume this role.",
  },
  {
    role: "accent",
    scale: "pink",
    baseShade: "400",
    utilities: "bg-accent-400, text-accent-950",
    note: "Secondary emphasis. Use only when the product meaning is accent, not state.",
  },
  {
    role: "secondary",
    scale: "stone",
    baseShade: "400",
    utilities: "bg-secondary-400, text-secondary-950",
    note: "Neutral support scale. Good for quiet grouping and subdued controls.",
  },
  {
    role: "cream surface",
    scale: "cream",
    baseShade: "200",
    utilities: "bg-brutal-cream",
    note: "Cream's unsuffixed base resolves to cream-200 for warm brutal cotton surfaces.",
  },
] as const;

const STATES = [
  {
    role: "info",
    scale: "cyan",
    tones: [
      {
        label: "dark",
        token: "--state-info-dark",
        primitive: "--color-brutal-cyan-800",
        value: PALETTE_VALUES.cyan["800"],
      },
      {
        label: "base",
        token: "--state-info-base",
        primitive: "--color-brutal-cyan",
        value: PALETTE_VALUES.cyan["400"],
      },
      {
        label: "light",
        token: "--state-info-light",
        primitive: "--color-brutal-cyan-200",
        value: PALETTE_VALUES.cyan["200"],
      },
      {
        label: "lighter",
        token: "--state-info-lighter",
        primitive: "--color-brutal-cyan-100",
        value: PALETTE_VALUES.cyan["100"],
      },
    ],
  },
  {
    role: "success",
    scale: "lime",
    tones: [
      {
        label: "dark",
        token: "--state-success-dark",
        primitive: "--color-brutal-lime-800",
        value: PALETTE_VALUES.lime["800"],
      },
      {
        label: "base",
        token: "--state-success-base",
        primitive: "--color-brutal-lime",
        value: PALETTE_VALUES.lime["400"],
      },
      {
        label: "light",
        token: "--state-success-light",
        primitive: "--color-brutal-lime-200",
        value: PALETTE_VALUES.lime["200"],
      },
      {
        label: "lighter",
        token: "--state-success-lighter",
        primitive: "--color-brutal-lime-100",
        value: PALETTE_VALUES.lime["100"],
      },
    ],
  },
  {
    role: "warning",
    scale: "orange",
    tones: [
      {
        label: "dark",
        token: "--state-warning-dark",
        primitive: "--color-brutal-orange-800",
        value: PALETTE_VALUES.orange["800"],
      },
      {
        label: "base",
        token: "--state-warning-base",
        primitive: "--color-brutal-orange",
        value: PALETTE_VALUES.orange["400"],
      },
      {
        label: "light",
        token: "--state-warning-light",
        primitive: "--color-brutal-orange-200",
        value: PALETTE_VALUES.orange["200"],
      },
      {
        label: "lighter",
        token: "--state-warning-lighter",
        primitive: "--color-brutal-orange-100",
        value: PALETTE_VALUES.orange["100"],
      },
    ],
  },
  {
    role: "danger",
    scale: "red",
    tones: [
      {
        label: "dark",
        token: "--state-danger-dark",
        primitive: "--color-brutal-red-800",
        value: PALETTE_VALUES.red["800"],
      },
      {
        label: "base",
        token: "--state-danger-base",
        primitive: "--color-brutal-red",
        value: PALETTE_VALUES.red["400"],
      },
      {
        label: "light",
        token: "--state-danger-light",
        primitive: "--color-brutal-red-200",
        value: PALETTE_VALUES.red["200"],
      },
      {
        label: "lighter",
        token: "--state-danger-lighter",
        primitive: "--color-brutal-red-100",
        value: PALETTE_VALUES.red["100"],
      },
    ],
  },
] as const;

const THEME_CONTEXTS = [
  {
    label: "Brutal",
    theme: "brutal",
    mode: undefined,
    status: undefined,
    description: "White page, hard black ink, tints.dev brutal palette scales, square geometry.",
  },
  {
    label: "Elegant",
    theme: "elegant",
    mode: undefined,
    status: "in-progress",
    description:
      "Neutral product surfaces while primary/accent/state still point at the same brutal palette.",
  },
  {
    label: "Elegant dark",
    theme: "elegant",
    mode: "dark",
    status: "in-progress",
    description:
      "Dark foreground, layer, and line tokens. Palette aliases remain shared with light themes.",
  },
] as const;

const THEME_TOKEN_GROUPS = [
  {
    label: "Layer",
    tokens: [
      ["page", "--layer-page"],
      ["panel", "--layer-panel"],
      ["muted", "--layer-muted"],
      ["field", "--layer-field"],
      ["popover", "--layer-popover"],
    ],
  },
  {
    label: "Foreground",
    tokens: [
      ["default", "--foreground"],
      ["strong", "--foreground-strong"],
      ["muted", "--foreground-muted"],
      ["placeholder", "--foreground-placeholder"],
      ["disabled", "--foreground-disabled"],
      ["inverse", "--foreground-inverse"],
    ],
  },
  {
    label: "Line",
    tokens: [
      ["strong", "--line-strong"],
      ["default", "--line"],
      ["subtle", "--line-subtle"],
      ["muted", "--line-muted"],
      ["focus", "--line-focus"],
    ],
  },
] as const;

const SNIPPETS = {
  palette: `@theme {
  --color-brutal-yellow-400: oklch(0.883 0.162 91.89);
  --color-brutal-yellow: var(--color-brutal-yellow-400);

  --color-brutal-pink-400: oklch(0.749 0.162 0.71);
  --color-brutal-pink: var(--color-brutal-pink-400);

  --color-brutal-purple-400: oklch(0.783 0.078 294.55);
  --color-brutal-purple: var(--color-brutal-purple-400);

  --color-brutal-cyan-400: oklch(0.783 0.135 219.2);
  --color-brutal-cyan: var(--color-brutal-cyan-400);

  --color-brutal-orange-400: oklch(0.785 0.123 50.11);
  --color-brutal-orange: var(--color-brutal-orange-400);

  --color-brutal-lime-400: oklch(0.827 0.135 130.07);
  --color-brutal-lime: var(--color-brutal-lime-400);

  --color-brutal-red-400: oklch(0.711 0.168 28.04);
  --color-brutal-red: var(--color-brutal-red-400);

  --color-brutal-stone-400: oklch(0.789 0.014 71.29);
  --color-brutal-stone: var(--color-brutal-stone-400);

  --color-brutal-cream-200: oklch(0.986 0.015 86.39);
  --color-brutal-cream: var(--color-brutal-cream-200);
}`,
  aliases: `[data-theme="brutal"] {
  --primary-400: var(--color-brutal-yellow);
  --accent-400: var(--color-brutal-pink);
  --secondary-400: var(--color-brutal-stone);

  --state-info-base: var(--color-brutal-cyan);
  --state-success-base: var(--color-brutal-lime);
  --state-warning-base: var(--color-brutal-orange);
  --state-danger-base: var(--color-brutal-red);
}`,
  usage: `<Button variant="primary">Confirm</Button>

<Badge variant="success">Active</Badge>

<Avatar type="human" />

<div className="border-line-strong bg-brutal-cream text-foreground-strong">
  Notification header
</div>`,
} as const;

export const Route = createFileRoute("/tokens/colors")({
  component: ColorsDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ColorsDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage title="Colors" description="The v2 color token contract." toc={TOC}>
      <DocSection id="contract" title="Contract">
        <div className="space-y-5">
          <div className="grid gap-3 lg:grid-cols-3">
            {CONTRACT.map((item) => (
              <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {item.label}
                </p>
                <p className="mt-2 font-mono text-lg font-semibold text-gray-950">{item.value}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.detail}</p>
              </div>
            ))}
          </div>
          <Callout>
            This page documents the v2 contract exported by <code>styles.css</code>.{" "}
            <code>styles-v2.css</code> remains the explicit v2 alias.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="primitive" title="Primitive palette">
        <div className="space-y-5">
          <div className="grid gap-4">
            {PALETTES.map((palette) => (
              <PaletteRow key={palette.name} palette={palette} />
            ))}
          </div>
          <CodeBlock html={code.palette} />
        </div>
      </DocSection>

      <DocSection id="aliases" title="Theme aliases">
        <div className="space-y-5">
          <div className="grid gap-3 lg:grid-cols-2">
            {ALIASES.map((alias) => (
              <AliasCard key={alias.role} alias={alias} />
            ))}
          </div>
          <CodeBlock html={code.aliases} />
          <Callout>
            <code>primary</code>, <code>accent</code>, and <code>secondary</code> are theme aliases.
            They are not separate palettes. Elegant currently references the same brutal palette
            scales; its visual polish can lag without changing component class names.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="states" title="State tones">
        <div className="grid gap-3 lg:grid-cols-2">
          {STATES.map((state) => (
            <StateCard key={state.role} state={state} />
          ))}
        </div>
      </DocSection>

      <DocSection id="theme" title="Theme tokens">
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-3">
            {THEME_CONTEXTS.map((theme) => (
              <ThemePreview key={theme.label} theme={theme} />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {THEME_TOKEN_GROUPS.map((group) => (
              <ThemeTokenGroup key={group.label} group={group} />
            ))}
          </div>
        </div>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-5">
          <CodeBlock html={code.usage} />
          <Callout>
            Prefer semantic aliases for reusable component recipes. Use raw brutal palette utilities
            only when the component contract is intentionally tied to a brutal palette family.
          </Callout>
        </div>
      </DocSection>
    </DocPage>
  );
}

function PaletteRow({ palette }: { palette: (typeof PALETTES)[number] }) {
  const baseValue = PALETTE_VALUES[palette.name][palette.baseShade];
  const familyToken = `--color-brutal-${palette.name}`;
  const shadeToken = `${familyToken}-${palette.baseShade}`;

  return (
    <div className="overflow-hidden bg-white">
      <div className="grid gap-4 py-3 lg:grid-cols-[400px_minmax(0,1fr)]">
        <div className="flex items-start gap-3">
          <div
            className="size-16 shrink-0 border border-gray-200"
            style={{ background: baseValue }}
            title={`${familyToken}: var(${shadeToken})`}
          />
          <div className="min-w-0">
            <p className="whitespace-nowrap text-sm font-semibold capitalize text-gray-950">
              {palette.name}
            </p>
            <p className="mt-1 overflow-x-auto whitespace-nowrap font-mono text-[11px] text-gray-500">
              {familyToken}
              {" -> "}
              {shadeToken}
            </p>
            <p className="mt-1 overflow-x-auto whitespace-nowrap font-mono text-[11px] leading-tight text-gray-700">
              {baseValue}
            </p>
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-11 overflow-hidden rounded border border-gray-200">
          {SHADES.map((shade) => {
            const value = PALETTE_VALUES[palette.name][shade];

            return (
              <div key={shade} className="min-w-0">
                <div
                  className="h-14 border-b border-gray-200"
                  style={{ background: value }}
                  title={`--color-brutal-${palette.name}-${shade}: ${value}`}
                />
                <div className="bg-white px-1.5 py-1 text-center font-mono text-[10px] text-gray-500">
                  {shade}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AliasCard({ alias }: { alias: (typeof ALIASES)[number] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div
          className="h-12 w-12 shrink-0 border border-gray-200"
          style={{
            background: PALETTE_VALUES[alias.scale][alias.baseShade],
          }}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-950">{alias.role}</p>
          <p className="mt-1 font-mono text-xs text-gray-500">{alias.utilities}</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">{alias.note}</p>
        </div>
      </div>
    </div>
  );
}

function StateCard({ state }: { state: (typeof STATES)[number] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold capitalize text-gray-950">{state.role}</p>
          <p className="mt-1 font-mono text-xs text-gray-500">brutal {state.scale}</p>
        </div>
        <span
          className="border px-2 py-1 font-mono text-xs"
          style={{
            background: state.tones[1].value,
            borderColor: "var(--line-strong)",
            color: "var(--foreground-strong)",
          }}
        >
          base
        </span>
      </div>
      <div className="mt-4 grid grid-cols-4 overflow-hidden rounded border border-gray-200">
        {state.tones.map((tone) => (
          <div key={tone.token}>
            <div
              className="h-12 border-b border-gray-200"
              style={{ background: tone.value }}
              title={`${tone.token}: ${tone.primitive}`}
            />
            <div className="min-h-11 bg-white px-1 py-1.5">
              <p className="text-center text-[10px] font-semibold text-gray-600">{tone.label}</p>
              <p className="break-all text-center font-mono text-[9px] leading-tight text-gray-400">
                {tone.token}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThemePreview({ theme }: { theme: (typeof THEME_CONTEXTS)[number] }) {
  return (
    <div data-theme={theme.theme} className={theme.mode === "dark" ? "dark" : undefined}>
      <div
        className="border p-4"
        style={{
          background: "var(--layer-panel)",
          borderColor: "var(--line)",
          color: "var(--foreground)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{theme.label}</p>
              <StatusBadge status={theme.status} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[color:var(--foreground-muted)]">
              {theme.description}
            </p>
          </div>
          <span
            className="inline-flex shrink-0 border px-2 py-1 text-xs font-semibold"
            style={{
              background: "var(--primary-400)",
              borderColor: "var(--line-strong)",
              color: "var(--primary-950)",
            }}
          >
            primary
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["primary", "accent", "secondary"].map((name) => (
            <div key={name}>
              <div
                className="h-8 border"
                style={{ background: `var(--${name}-400)`, borderColor: "var(--line)" }}
              />
              <p className="mt-1 text-[10px] text-[color:var(--foreground-muted)]">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThemeTokenGroup({ group }: { group: (typeof THEME_TOKEN_GROUPS)[number] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm font-semibold text-gray-950">{group.label}</p>
      <div className="mt-3 space-y-2">
        {group.tokens.map(([label, token]) => (
          <div key={token} className="flex items-center gap-2">
            <div className="grid grid-cols-3 gap-1">
              {THEME_CONTEXTS.map((theme) => (
                <span
                  key={theme.label}
                  data-theme={theme.theme}
                  className={
                    theme.mode === "dark"
                      ? "dark size-5 border border-gray-200"
                      : "size-5 border border-gray-200"
                  }
                  style={{ background: `var(${token})` }}
                  title={`${theme.label}: ${token}`}
                />
              ))}
            </div>
            <span className="min-w-0 flex-1 text-xs text-gray-600">{label}</span>
            <span className="font-mono text-[10px] text-gray-400">{token}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
