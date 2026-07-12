import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";

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
    "50": "oklch(0.995 0.006 87.5)",
    "100": "oklch(0.991 0.01 87.41)",
    "200": "oklch(0.986 0.015 86.39)",
    "300": "oklch(0.946 0.041 88)",
    "400": "oklch(0.871 0.09 91)",
    "500": "oklch(0.766 0.158 95.1)",
    "600": "oklch(0.646 0.133 95)",
    "700": "oklch(0.521 0.107 95.2)",
    "800": "oklch(0.396 0.082 95)",
    "900": "oklch(0.276 0.057 95.1)",
    "950": "oklch(0.19 0.039 94.7)",
  },
} as const satisfies Record<string, Record<Shade, string>>;

const TOC = [
  { id: "primitive", title: "Primitive palette" },
  { id: "aliases", title: "Theme aliases" },
  { id: "states", title: "State tones" },
  { id: "theme", title: "Theme tokens" },
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
    summary: "Primary action fill.",
  },
  {
    role: "accent",
    scale: "pink",
    baseShade: "400",
    summary: "Secondary emphasis.",
  },
  {
    role: "secondary",
    scale: "stone",
    baseShade: "400",
    summary: "Neutral support scale.",
  },
  {
    role: "cream surface",
    scale: "cream",
    baseShade: "200",
    summary: "Warm brutal surface.",
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
        value: PALETTE_VALUES.cyan["800"],
      },
      {
        label: "base",
        token: "--state-info-base",
        value: PALETTE_VALUES.cyan["400"],
      },
      {
        label: "light",
        token: "--state-info-light",
        value: PALETTE_VALUES.cyan["200"],
      },
      {
        label: "lighter",
        token: "--state-info-lighter",
        value: PALETTE_VALUES.cyan["100"],
      },
    ],
  },
  {
    role: "success",
    scale: "green",
    tones: [
      {
        label: "dark",
        token: "--state-success-dark",
        value: "oklch(0.366 0.09 153.079)",
      },
      {
        label: "base",
        token: "--state-success-base",
        value: "oklch(0.714 0.176 153.079)",
      },
      {
        label: "light",
        token: "--state-success-light",
        value: "oklch(0.91 0.149 153.079)",
      },
      {
        label: "lighter",
        token: "--state-success-lighter",
        value: "oklch(0.949 0.079 153.079)",
      },
    ],
  },
  {
    role: "warning",
    scale: "amber",
    tones: [
      {
        label: "dark",
        token: "--state-warning-dark",
        value: "oklch(0.366 0.106 44.441)",
      },
      {
        label: "base",
        token: "--state-warning-base",
        value: "oklch(0.7 0.202 44.441)",
      },
      {
        label: "light",
        token: "--state-warning-light",
        value: "oklch(0.91 0.05 44.441)",
      },
      {
        label: "lighter",
        token: "--state-warning-lighter",
        value: "oklch(0.949 0.027 44.441)",
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
        value: PALETTE_VALUES.red["800"],
      },
      {
        label: "base",
        token: "--state-danger-base",
        value: "oklch(0.616 0.249 26.758)",
      },
      {
        label: "light",
        token: "--state-danger-light",
        value: PALETTE_VALUES.red["200"],
      },
      {
        label: "lighter",
        token: "--state-danger-lighter",
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
  },
  {
    label: "Elegant",
    theme: "elegant",
    mode: undefined,
  },
  {
    label: "Elegant dark",
    theme: "elegant",
    mode: "dark",
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
      ["hover", "--layer-hover"],
      ["active", "--layer-active"],
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
      ["field", "--line-field"],
      ["field hover", "--line-field-hover"],
    ],
  },
  {
    label: "Ink",
    tokens: [
      ["anchor", "--ink"],
      ["2", "--ink-2"],
      ["4", "--ink-4"],
      ["6", "--ink-6"],
      ["8", "--ink-8"],
      ["10", "--ink-10"],
      ["16", "--ink-16"],
      ["20", "--ink-20"],
      ["30", "--ink-30"],
      ["40", "--ink-40"],
    ],
  },
  {
    label: "Interaction",
    tokens: [
      ["primary hover", "--primary-hover"],
      ["primary active", "--primary-active"],
      ["accent hover", "--accent-hover"],
      ["accent active", "--accent-active"],
      ["info hover", "--state-info-hover"],
      ["info active", "--state-info-active"],
      ["warning hover", "--state-warning-hover"],
      ["warning active", "--state-warning-active"],
      ["danger hover", "--state-danger-hover"],
      ["danger active", "--state-danger-active"],
    ],
  },
] as const;

export const Route = createFileRoute("/tokens/colors")({
  component: ColorsDoc,
});

function ColorsDoc() {
  const contexts = getThemeContexts();

  return (
    <TokenThemeScope>
      <DocPage
        title="Colors"
        description="Core color scales, semantic aliases, state tones, and theme-aware surface tokens."
        articleClassName="max-w-none xl:max-w-6xl 2xl:max-w-7xl"
        toc={TOC}
      >
        <DocSection id="primitive" title="Primitive palette" showThemeSwitcher={false}>
          <div className="space-y-14">
            {PALETTES.map((palette) => (
              <PaletteSection key={palette.name} palette={palette} />
            ))}
          </div>
        </DocSection>

        <DocSection id="aliases" title="Theme aliases" showThemeSwitcher={false}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {ALIASES.map((alias) => (
              <AliasCard key={alias.role} alias={alias} />
            ))}
          </div>
        </DocSection>

        <DocSection id="states" title="State tones" showThemeSwitcher={false}>
          <div className="space-y-10">
            {STATES.map((state) => (
              <StateSection key={state.role} state={state} />
            ))}
          </div>
        </DocSection>

        <DocSection id="theme" title="Theme tokens" showThemeSwitcher={false}>
          <div className="space-y-14">
            {THEME_TOKEN_GROUPS.map((group) => (
              <ThemeTokenSection key={group.label} group={group} contexts={contexts} />
            ))}
          </div>
        </DocSection>
      </DocPage>
    </TokenThemeScope>
  );
}

function TokenThemeScope({ children }: { children: ReactNode }) {
  return (
    <div
      data-theme="elegant"
      className="light min-h-screen bg-layer-panel"
      style={{
        color: "var(--foreground)",
        fontFamily: "var(--sans-font)",
      }}
    >
      {children}
    </div>
  );
}

function getThemeContexts() {
  return THEME_CONTEXTS.filter((context) => context.mode !== "dark");
}

function PaletteSection({ palette }: { palette: (typeof PALETTES)[number] }) {
  const familyToken = `--color-brutal-${palette.name}`;

  return (
    <section className="border-t border-line-subtle pt-8 first:border-t-0 first:pt-0">
      <div className="mb-6">
        <div>
          <h3 className="text-xl font-semibold capitalize tracking-tight text-foreground-strong">
            {palette.name}
          </h3>
          <p className="mt-1 font-mono text-xs text-foreground-muted">{familyToken}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {SHADES.map((shade) => {
          const value = PALETTE_VALUES[palette.name][shade];
          return <ColorTokenCard key={shade} name={`${palette.name}-${shade}`} value={value} />;
        })}
      </div>
    </section>
  );
}

function AliasCard({ alias }: { alias: (typeof ALIASES)[number] }) {
  const value = PALETTE_VALUES[alias.scale][alias.baseShade];

  return (
    <ColorTokenCard
      name={alias.role}
      value={value}
      description={alias.summary}
      showValue={false}
      swatchClassName="h-28"
    />
  );
}

function StateSection({ state }: { state: (typeof STATES)[number] }) {
  return (
    <section className="border-t border-line-subtle pt-8 first:border-t-0 first:pt-0">
      <div className="mb-6">
        <h3 className="text-xl font-semibold capitalize tracking-tight text-foreground-strong">
          {state.role}
        </h3>
        <p className="mt-1 font-mono text-xs text-foreground-muted">{state.scale}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {state.tones.map((tone) => (
          <ColorTokenCard
            key={tone.token}
            name={`${state.role}-${tone.label}`}
            value={tone.value}
            swatchClassName="h-28"
          />
        ))}
      </div>
    </section>
  );
}

function ColorTokenCard({
  name,
  value,
  description,
  meta,
  showValue = true,
  swatchClassName = "h-24",
}: {
  name: string;
  value: string;
  description?: string;
  meta?: string;
  showValue?: boolean;
  swatchClassName?: string;
}) {
  return (
    <article className="min-w-0 overflow-hidden rounded-md bg-layer-panel shadow-[0_0_0_1px_color-mix(in_oklch,var(--line-subtle)_75%,transparent),var(--theme-shadow-sm)]">
      <div className={swatchClassName} style={{ background: value }} />
      <div className="border-t border-line-muted px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold capitalize text-foreground-strong">{name}</p>
        </div>

        {showValue || meta ? (
          <div className="mt-3 grid min-w-0 gap-1">
            {showValue ? (
              <p className="truncate font-mono text-[11px] leading-4 text-foreground-muted">
                {value}
              </p>
            ) : null}
            {meta ? (
              <p className="truncate font-mono text-[11px] leading-4 text-foreground-muted">
                {meta}
              </p>
            ) : null}
          </div>
        ) : null}

        {description ? (
          <p className="mt-3 line-clamp-3 text-xs leading-5 text-foreground-muted">{description}</p>
        ) : null}
      </div>
    </article>
  );
}

function ThemeTokenSection({
  group,
  contexts,
}: {
  group: (typeof THEME_TOKEN_GROUPS)[number];
  contexts: ReturnType<typeof getThemeContexts>;
}) {
  return (
    <section className="border-t border-line-subtle pt-8 first:border-t-0 first:pt-0">
      <div className="mb-6">
        <h3 className="text-xl font-semibold capitalize tracking-tight text-foreground-strong">
          {group.label}
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {group.tokens.map(([label, token]) => (
          <ThemeTokenCard key={token} label={label} token={token} contexts={contexts} />
        ))}
      </div>
    </section>
  );
}

function ThemeTokenCard({
  label,
  token,
  contexts,
}: {
  label: string;
  token: string;
  contexts: ReturnType<typeof getThemeContexts>;
}) {
  return (
    <article className="min-w-0 overflow-hidden rounded-md bg-layer-panel shadow-[0_0_0_1px_color-mix(in_oklch,var(--line-subtle)_75%,transparent),var(--theme-shadow-sm)]">
      <div className={contexts.length > 1 ? "grid grid-cols-2" : "grid"}>
        {contexts.map((context) => (
          <div
            key={context.label}
            data-theme={context.theme}
            className={context.mode === "dark" ? "dark h-28" : "h-28"}
            style={{ background: `var(${token})` }}
            title={`${context.label}: ${token}`}
          />
        ))}
      </div>

      <div className="border-t border-line-muted px-4 py-3">
        <p className="truncate text-sm font-semibold capitalize text-foreground-strong">{label}</p>
        <p className="mt-3 truncate font-mono text-[11px] leading-4 text-foreground-muted">
          {token}
        </p>
        {contexts.length > 1 ? (
          <div className="mt-3 grid gap-1">
            {contexts.map((context) => (
              <p
                key={context.label}
                className="truncate font-mono text-[11px] leading-4 text-foreground-muted"
              >
                {context.label}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
