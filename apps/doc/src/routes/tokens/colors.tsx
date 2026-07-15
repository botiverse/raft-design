import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
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
    tokenPrefix: "--primary",
    summary: "Primary action fill.",
  },
  {
    role: "accent",
    scale: "pink",
    tokenPrefix: "--accent",
    summary: "Secondary emphasis.",
  },
  {
    role: "secondary",
    scale: "stone",
    tokenPrefix: "--secondary",
    summary: "Neutral support scale.",
  },
] as const;

const STATES = [
  {
    role: "info",
    scale: "cyan",
    tones: [
      {
        label: "lighter",
        token: "--state-info-lighter",
        value: PALETTE_VALUES.cyan["100"],
      },
      {
        label: "light",
        token: "--state-info-light",
        value: PALETTE_VALUES.cyan["200"],
      },
      {
        label: "base",
        token: "--state-info-base",
        value: PALETTE_VALUES.cyan["400"],
      },
      {
        label: "dark",
        token: "--state-info-dark",
        value: PALETTE_VALUES.cyan["800"],
      },
    ],
  },
  {
    role: "success",
    scale: "green",
    tones: [
      {
        label: "lighter",
        token: "--state-success-lighter",
        value: "oklch(0.949 0.079 153.079)",
      },
      {
        label: "light",
        token: "--state-success-light",
        value: "oklch(0.91 0.149 153.079)",
      },
      {
        label: "base",
        token: "--state-success-base",
        value: "oklch(0.714 0.176 153.079)",
      },
      {
        label: "dark",
        token: "--state-success-dark",
        value: "oklch(0.366 0.09 153.079)",
      },
    ],
  },
  {
    role: "warning",
    scale: "amber",
    tones: [
      {
        label: "lighter",
        token: "--state-warning-lighter",
        value: "oklch(0.949 0.027 44.441)",
      },
      {
        label: "light",
        token: "--state-warning-light",
        value: "oklch(0.91 0.05 44.441)",
      },
      {
        label: "base",
        token: "--state-warning-base",
        value: "oklch(0.7 0.202 44.441)",
      },
      {
        label: "dark",
        token: "--state-warning-dark",
        value: "oklch(0.366 0.106 44.441)",
      },
    ],
  },
  {
    role: "danger",
    scale: "red",
    tones: [
      {
        label: "lighter",
        token: "--state-danger-lighter",
        value: PALETTE_VALUES.red["100"],
      },
      {
        label: "light",
        token: "--state-danger-light",
        value: PALETTE_VALUES.red["200"],
      },
      {
        label: "base",
        token: "--state-danger-base",
        value: "oklch(0.616 0.249 26.758)",
      },
      {
        label: "dark",
        token: "--state-danger-dark",
        value: PALETTE_VALUES.red["800"],
      },
    ],
  },
] as const;

const THEME_CONTEXTS = [
  {
    label: "Brutal",
    theme: "brutal",
    mode: "light",
  },
  {
    label: "Elegant light",
    theme: "elegant",
    mode: "light",
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
  return (
    <TokenThemeScope>
      <DocPage
        title="Colors"
        description="Core color scales, semantic aliases, state tones, and theme-aware surface tokens."
        articleClassName="max-w-none xl:max-w-6xl 2xl:max-w-7xl"
        toc={TOC}
      >
        <DocSection id="primitive" title="Primitive palette" showThemeSwitcher={false}>
          <div className="grid gap-x-8 gap-y-12 lg:grid-cols-2">
            {PALETTES.map((palette) => (
              <PaletteSection key={palette.name} palette={palette} />
            ))}
          </div>
        </DocSection>

        <DocSection id="aliases" title="Theme aliases" showThemeSwitcher={false}>
          <div className="space-y-10">
            {THEME_CONTEXTS.map((context) => (
              <SharedThemeContext key={context.label} context={context}>
                <div className="grid gap-x-8 gap-y-12 lg:grid-cols-2">
                  {ALIASES.map((alias) => (
                    <AliasScale key={alias.role} alias={alias} context={context} />
                  ))}
                </div>
              </SharedThemeContext>
            ))}
          </div>
        </DocSection>

        <DocSection id="states" title="State tones" showThemeSwitcher={false}>
          <div className="space-y-10">
            {THEME_CONTEXTS.map((context) => (
              <SharedThemeContext key={context.label} context={context}>
                <div className="grid gap-x-8 gap-y-12 lg:grid-cols-2">
                  {STATES.map((state) => (
                    <StateScale key={state.role} state={state} context={context} />
                  ))}
                </div>
              </SharedThemeContext>
            ))}
          </div>
        </DocSection>

        <DocSection id="theme" title="Theme tokens" showThemeSwitcher={false}>
          <div className="space-y-10">
            {THEME_CONTEXTS.map((context) => (
              <ThemeContextScales key={context.label} context={context} />
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

function PaletteSection({ palette }: { palette: (typeof PALETTES)[number] }) {
  const familyToken = `--color-brutal-${palette.name}`;

  return (
    <section className="min-w-0">
      <div className="mb-4 min-w-0">
        <h3 className="text-lg font-semibold capitalize tracking-tight text-foreground-strong">
          {palette.name}
        </h3>
        <p className="mt-1 truncate font-mono text-xs text-foreground-muted">{familyToken}</p>
      </div>

      <ColorScale>
        {SHADES.map((shade) => {
          const value = PALETTE_VALUES[palette.name][shade];
          return (
            <ColorScaleRow
              key={shade}
              name={`${palette.name}-${shade}`}
              label={shade}
              value={value}
            />
          );
        })}
      </ColorScale>
    </section>
  );
}

function ColorScale({
  mode = "light",
  children,
}: {
  mode?: (typeof THEME_CONTEXTS)[number]["mode"];
  children: ReactNode;
}) {
  const borderClassName =
    mode === "dark" ? "border-[oklch(0.274_0.006_286)]" : "border-[oklch(0.92_0.004_106.42)]";

  return (
    <ol className={`isolate list-none overflow-hidden rounded-lg border ${borderClassName}`}>
      {children}
    </ol>
  );
}

function ColorScaleRow({
  name,
  label,
  value,
  displayValue = value,
  textClassName = getSwatchTextClass(value),
  themeToken,
}: {
  name: string;
  label: string;
  value: string;
  displayValue?: string;
  textClassName?: string;
  themeToken?: string;
}) {
  return (
    <li
      data-theme-token={themeToken}
      className={`group flex h-12 min-w-0 items-center px-4 ${textClassName}`}
      style={{ backgroundColor: value }}
    >
      <span className="sr-only">
        {name}: {displayValue}
      </span>
      <span aria-hidden="true" className="relative min-w-0 flex-1">
        <span className="block truncate font-mono text-xs leading-5 tabular-nums group-hover:opacity-0 [@media(hover:none)]:hidden">
          {label}
        </span>
        <span className="absolute inset-0 truncate font-mono text-xs leading-5 opacity-0 group-hover:opacity-100 [@media(hover:none)]:hidden">
          {displayValue}
        </span>
        <span className="hidden truncate font-mono text-xs leading-5 tabular-nums [@media(hover:none)]:block">
          {label} · {displayValue}
        </span>
      </span>
    </li>
  );
}

function getSwatchTextClass(value: string) {
  const [, lightnessString = "0", chromaString = "0", hueString = "0"] =
    value.match(/^oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)$/) ?? [];
  const lightness = Number(lightnessString);
  const chroma = Number(chromaString);
  const hue = (Number(hueString) * Math.PI) / 180;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const light = Math.pow(lightness + 0.3963377774 * a + 0.2158037573 * b, 3);
  const medium = Math.pow(lightness - 0.1055613458 * a - 0.0638541728 * b, 3);
  const short = Math.pow(lightness - 0.0894841775 * a - 1.291485548 * b, 3);
  const red = clamp(4.0767416621 * light - 3.3077115913 * medium + 0.2309699292 * short);
  const green = clamp(-1.2684380046 * light + 2.6097574011 * medium - 0.3413193965 * short);
  const blue = clamp(-0.0041960863 * light - 0.7034186147 * medium + 1.707614701 * short);
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  const blackContrast = (luminance + 0.05) / 0.05;
  const whiteContrast = 1.05 / (luminance + 0.05);

  return blackContrast >= whiteContrast ? "text-black" : "text-white";
}

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function SharedThemeContext({
  context,
  children,
}: {
  context: (typeof THEME_CONTEXTS)[number];
  children: ReactNode;
}) {
  return (
    <section
      data-theme={context.theme}
      className={`${context.mode === "dark" ? "dark -mx-3 bg-layer-page px-3" : "light"} min-w-0 py-6 text-foreground`}
    >
      <div className="mb-8">
        <h3 className="text-xl font-semibold tracking-tight text-foreground-strong">
          {context.label}
        </h3>
      </div>
      {children}
    </section>
  );
}

function AliasScale({
  alias,
  context,
}: {
  alias: (typeof ALIASES)[number];
  context: (typeof THEME_CONTEXTS)[number];
}) {
  return (
    <section className="min-w-0">
      <div className="mb-4 min-w-0">
        <h4 className="text-lg font-semibold capitalize tracking-tight text-foreground-strong">
          {alias.role}
        </h4>
        <p className="mt-1 text-xs text-foreground-muted">{alias.summary}</p>
        <p className="mt-1 truncate font-mono text-xs text-foreground-muted">
          {alias.tokenPrefix}-*
        </p>
      </div>

      <ColorScale mode={context.mode}>
        {SHADES.map((shade) => (
          <ColorScaleRow
            key={shade}
            name={`${context.label} ${alias.tokenPrefix}-${shade}`}
            label={shade}
            value={PALETTE_VALUES[alias.scale][shade]}
          />
        ))}
      </ColorScale>
    </section>
  );
}

function StateScale({
  state,
  context,
}: {
  state: (typeof STATES)[number];
  context: (typeof THEME_CONTEXTS)[number];
}) {
  return (
    <section className="min-w-0">
      <div className="mb-4 min-w-0">
        <h4 className="text-lg font-semibold capitalize tracking-tight text-foreground-strong">
          {state.role}
        </h4>
        <p className="mt-1 truncate font-mono text-xs text-foreground-muted">
          {state.scale} · --state-{state.role}-*
        </p>
      </div>

      <ColorScale mode={context.mode}>
        {state.tones.map((tone) => (
          <ColorScaleRow
            key={tone.token}
            name={`${context.label} ${tone.token}`}
            label={tone.label}
            value={tone.value}
          />
        ))}
      </ColorScale>
    </section>
  );
}

function ThemeContextScales({ context }: { context: (typeof THEME_CONTEXTS)[number] }) {
  const themeContextRef = useRef<HTMLElement>(null);
  const [resolvedColors, setResolvedColors] = useState(() => new Map<string, ResolvedThemeColor>());

  useEffect(() => {
    const themeContext = themeContextRef.current;
    if (!themeContext) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const canvasContext = canvas.getContext("2d", { willReadFrequently: true });
    if (!canvasContext) return;

    const backdrop = getBackdropColor(themeContext, canvasContext);
    const nextColors = new Map<string, ResolvedThemeColor>();
    for (const swatch of themeContext.querySelectorAll<HTMLElement>("[data-theme-token]")) {
      const token = swatch.dataset.themeToken;
      if (!token) continue;

      nextColors.set(
        token,
        resolveThemeColor(getComputedStyle(swatch).backgroundColor, backdrop, canvasContext),
      );
    }
    setResolvedColors(nextColors);
  }, [context.mode, context.theme]);

  return (
    <section
      ref={themeContextRef}
      data-theme={context.theme}
      className={`${context.mode === "dark" ? "dark -mx-3 bg-layer-page px-3" : "light"} min-w-0 py-6 text-foreground`}
    >
      <div className="mb-8">
        <h3 className="text-xl font-semibold tracking-tight text-foreground-strong">
          {context.label}
        </h3>
      </div>

      <div className="grid gap-x-8 gap-y-12 lg:grid-cols-2">
        {THEME_TOKEN_GROUPS.map((group) => (
          <ThemeTokenScale
            key={group.label}
            group={group}
            context={context}
            resolvedColors={resolvedColors}
          />
        ))}
      </div>
    </section>
  );
}

function ThemeTokenScale({
  group,
  context,
  resolvedColors,
}: {
  group: (typeof THEME_TOKEN_GROUPS)[number];
  context: (typeof THEME_CONTEXTS)[number];
  resolvedColors: ReadonlyMap<string, ResolvedThemeColor>;
}) {
  return (
    <section className="min-w-0">
      <div className="mb-4 min-w-0">
        <h4 className="text-lg font-semibold tracking-tight text-foreground-strong">
          {group.label}
        </h4>
      </div>

      <ColorScale mode={context.mode}>
        {group.tokens.map(([label, token]) => (
          <ThemeTokenScaleRow
            key={token}
            label={label}
            token={token}
            context={context}
            resolvedColor={resolvedColors.get(token)}
          />
        ))}
      </ColorScale>
    </section>
  );
}

function ThemeTokenScaleRow({
  label,
  token,
  context,
  resolvedColor,
}: {
  label: string;
  token: string;
  context: (typeof THEME_CONTEXTS)[number];
  resolvedColor?: ResolvedThemeColor;
}) {
  return (
    <ColorScaleRow
      themeToken={token}
      name={`${context.label} ${token}`}
      label={label}
      value={`var(${token})`}
      displayValue={resolvedColor?.value ?? token}
      textClassName={resolvedColor?.textClassName ?? "text-transparent"}
    />
  );
}

type RgbaColor = {
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

type ResolvedThemeColor = {
  value: string;
  textClassName: string;
};

function getBackdropColor(element: HTMLElement, canvasContext: CanvasRenderingContext2D): string {
  let currentElement: HTMLElement | null = element;
  while (currentElement) {
    const backgroundColor = getComputedStyle(currentElement).backgroundColor;
    if (readCanvasColor(canvasContext, backgroundColor).alpha === 1) return backgroundColor;
    currentElement = currentElement.parentElement;
  }

  return "oklch(1 0 0)";
}

function resolveThemeColor(
  color: string,
  backdrop: string,
  canvasContext: CanvasRenderingContext2D,
): ResolvedThemeColor {
  const rawColor = readCanvasColor(canvasContext, color);
  const compositedColor = readCanvasColor(canvasContext, color, backdrop);

  return {
    value: color.startsWith("oklch(") ? color : formatOklch(rawColor),
    textClassName: getSrgbTextClass(compositedColor),
  };
}

function readCanvasColor(
  context: CanvasRenderingContext2D,
  color: string,
  backdrop?: string,
): RgbaColor {
  context.clearRect(0, 0, 1, 1);

  if (backdrop) {
    context.fillStyle = backdrop;
    context.fillRect(0, 0, 1, 1);
  }

  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);

  const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
  return {
    red: red / 255,
    green: green / 255,
    blue: blue / 255,
    alpha: alpha / 255,
  };
}

function formatOklch(color: RgbaColor) {
  const red = srgbToLinear(color.red);
  const green = srgbToLinear(color.green);
  const blue = srgbToLinear(color.blue);
  const light = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const medium = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const short = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  const lightness = 0.2104542553 * light + 0.793617785 * medium - 0.0040720468 * short;
  const a = 1.9779984951 * light - 2.428592205 * medium + 0.4505937099 * short;
  const b = 0.0259040371 * light + 0.7827717662 * medium - 0.808675766 * short;
  const chroma = Math.hypot(a, b);
  const hue = chroma < 0.0005 ? 0 : (Math.atan2(b, a) * 180) / Math.PI + 360;
  const channels = [lightness, chroma, hue % 360].map(formatColorChannel).join(" ");
  const alpha = formatColorChannel(color.alpha);

  return color.alpha < 0.9995 ? `oklch(${channels} / ${alpha})` : `oklch(${channels})`;
}

function getSrgbTextClass(color: RgbaColor) {
  const luminance =
    0.2126 * srgbToLinear(color.red) +
    0.7152 * srgbToLinear(color.green) +
    0.0722 * srgbToLinear(color.blue);
  const blackContrast = (luminance + 0.05) / 0.05;
  const whiteContrast = 1.05 / (luminance + 0.05);

  return blackContrast >= whiteContrast ? "text-black" : "text-white";
}

function srgbToLinear(channel: number) {
  return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
}

function formatColorChannel(value: number) {
  return Number(value.toFixed(3)).toString();
}
