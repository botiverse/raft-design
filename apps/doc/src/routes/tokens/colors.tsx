import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";

const TOC = [
  { id: "grammar", title: "Token grammar" },
  { id: "foreground", title: "Foreground" },
  { id: "layer", title: "Layer" },
  { id: "fill", title: "Fill" },
  { id: "line", title: "Line" },
  { id: "ink", title: "Ink ramp" },
  { id: "brand", title: "Brand families" },
  { id: "state", title: "State families" },
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

const RAMP_SHADES = [
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

type TokenGroup = {
  label: string;
  tokens: readonly (readonly [label: string, token: string])[];
};

function rampTokens(prefix: string): TokenGroup["tokens"] {
  return RAMP_SHADES.map((shade) => [shade, `${prefix}-${shade}`] as const);
}

const FOREGROUND_GROUPS: readonly TokenGroup[] = [
  {
    label: "Intensity",
    tokens: [
      ["strong", "--foreground-strong"],
      ["default", "--foreground"],
      ["muted", "--foreground-muted"],
    ],
  },
  {
    label: "Purpose",
    tokens: [
      ["hint", "--foreground-hint"],
      ["icon", "--foreground-icon"],
      ["placeholder", "--foreground-placeholder"],
      ["disabled", "--foreground-disabled"],
      ["inverse", "--foreground-inverse"],
      ["active", "--foreground-active"],
      ["hover", "--foreground-hover"],
    ],
  },
];

const LAYER_GROUPS: readonly TokenGroup[] = [
  {
    label: "Surface",
    tokens: [
      ["page", "--layer-page"],
      ["panel", "--layer-panel"],
      ["popover", "--layer-popover"],
      ["inset", "--layer-inset"],
      ["card", "--layer-card"],
      ["hud", "--layer-hud"],
      ["hud foreground", "--layer-hud-foreground"],
    ],
  },
  {
    label: "Overlay",
    tokens: [["backdrop", "--layer-backdrop"]],
  },
];

const FILL_GROUPS: readonly TokenGroup[] = [
  {
    label: "Interaction fills",
    tokens: [
      ["muted", "--fill-muted"],
      ["strong", "--fill-strong"],
    ],
  },
];

const LINE_GROUPS: readonly TokenGroup[] = [
  {
    label: "Ladder",
    tokens: [
      ["strong", "--line-strong"],
      ["default", "--line"],
      ["muted", "--line-muted"],
    ],
  },
  {
    label: "Purpose",
    tokens: [
      ["hairline", "--line-hairline"],
      ["field", "--line-field"],
      ["field hover", "--line-field-hover"],
    ],
  },
];

const INK_GROUPS: readonly TokenGroup[] = [
  {
    label: "Ramp",
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
];

const BRAND_GROUPS: readonly TokenGroup[] = [
  {
    label: "Primary slots",
    tokens: [
      ["primary", "--color-primary"],
      ["strong", "--primary-strong"],
      ["soft", "--primary-soft"],
      ["edge", "--primary-edge"],
      ["hover", "--primary-hover"],
      ["active", "--primary-active"],
    ],
  },
  {
    label: "Accent slots",
    tokens: [
      ["accent", "--color-accent"],
      ["strong", "--accent-strong"],
      ["soft", "--accent-soft"],
      ["hover", "--accent-hover"],
      ["active", "--accent-active"],
    ],
  },
  {
    label: "Primary ramp",
    tokens: rampTokens("--primary"),
  },
  {
    label: "Accent ramp",
    tokens: rampTokens("--accent"),
  },
  {
    label: "Secondary ramp",
    tokens: [["secondary", "--color-secondary"], ...rampTokens("--secondary")],
  },
];

function stateTokens(
  role: string,
  hasInteraction: boolean,
  hasForeground = true,
): TokenGroup["tokens"] {
  const slots: (readonly [string, string])[] = [
    [role, `--color-${role}`],
    ...(hasForeground ? [["foreground", `--color-${role}-foreground`] as const] : []),
    ["strong", `--color-${role}-strong`],
    ["muted", `--color-${role}-muted`],
    ["soft", `--color-${role}-soft`],
  ];
  if (hasInteraction) {
    slots.push(["hover", `--color-${role}-hover`], ["active", `--color-${role}-active`]);
  }
  return slots;
}

const STATE_GROUPS: readonly TokenGroup[] = [
  {
    label: "inactive",
    tokens: [
      ["inactive", "--color-inactive"],
      ["foreground", "--color-inactive-foreground"],
    ],
  },
  { label: "info", tokens: stateTokens("info", true, false) },
  { label: "success", tokens: stateTokens("success", false) },
  { label: "warning", tokens: stateTokens("warning", true) },
  { label: "danger", tokens: stateTokens("danger", true) },
];

const TOKEN_SECTIONS = [
  { id: "foreground", title: "Foreground", groups: FOREGROUND_GROUPS },
  { id: "layer", title: "Layer", groups: LAYER_GROUPS },
  { id: "fill", title: "Fill", groups: FILL_GROUPS },
  { id: "line", title: "Line", groups: LINE_GROUPS },
  { id: "ink", title: "Ink ramp", groups: INK_GROUPS },
  { id: "brand", title: "Brand families", groups: BRAND_GROUPS },
  { id: "state", title: "State families", groups: STATE_GROUPS },
] as const;

export const Route = createFileRoute("/tokens/colors")({
  component: ColorsDoc,
});

function ColorsDoc() {
  return (
    <TokenThemeScope>
      <DocPage
        title="Colors"
        description="Semantic neutrals, the ink overlay ramp, and the brand and state color families."
        articleClassName="max-w-none xl:max-w-6xl 2xl:max-w-7xl"
        toc={TOC}
      >
        <DocSection id="grammar" title="Token grammar" showThemeSwitcher={false}>
          <TokenGrammar />
        </DocSection>

        {TOKEN_SECTIONS.map((section) => (
          <DocSection
            key={section.id}
            id={section.id}
            title={section.title}
            showThemeSwitcher={false}
          >
            <div className="space-y-10">
              {THEME_CONTEXTS.map((context) => (
                <ThemeContextScales key={context.label} context={context} groups={section.groups} />
              ))}
            </div>
          </DocSection>
        ))}
      </DocPage>
    </TokenThemeScope>
  );
}

function TokenGrammar() {
  return (
    <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-foreground-muted">
      <p>
        Neutrals follow <GrammarCode>{"{role}(-{purpose})(-{intensity})"}</GrammarCode> where the
        role is <GrammarCode>foreground</GrammarCode>, <GrammarCode>layer</GrammarCode>,{" "}
        <GrammarCode>line</GrammarCode>, or <GrammarCode>fill</GrammarCode>. The intensity ladder is
        strictly ordered: <GrammarCode>strong</GrammarCode> &gt; default (bare) &gt;{" "}
        <GrammarCode>muted</GrammarCode>.
      </p>
      <p>
        <GrammarCode>layer</GrammarCode> tokens name places on the elevation ladder;{" "}
        <GrammarCode>fill</GrammarCode> tokens are the opaque neutral interaction fills
        (resting/hover/active/disabled surfaces) — the opaque counterpart of the translucent ink
        washes.
      </p>
      <p>
        Color families — <GrammarCode>primary</GrammarCode>, <GrammarCode>accent</GrammarCode>,{" "}
        <GrammarCode>secondary</GrammarCode>, <GrammarCode>info</GrammarCode>,{" "}
        <GrammarCode>success</GrammarCode>, <GrammarCode>warning</GrammarCode>, and{" "}
        <GrammarCode>danger</GrammarCode> — share the same intensity ladder as neutrals:{" "}
        <GrammarCode>-strong</GrammarCode> (deep shade for readable text and rings) &gt; the bare
        solid fill &gt; <GrammarCode>-muted</GrammarCode> (strong wash) &gt;{" "}
        <GrammarCode>-soft</GrammarCode> (soft wash), plus <GrammarCode>-foreground</GrammarCode>{" "}
        for text on the solid. The solid interaction pair <GrammarCode>-hover</GrammarCode>/
        <GrammarCode>-active</GrammarCode> is opt-in: primary, accent, info, warning, and danger
        define it; success and secondary do not.
      </p>
      <p>
        The ink ramp <GrammarCode>ink-2</GrammarCode> … <GrammarCode>ink-40</GrammarCode> is a
        neutral overlay scale for hairlines, washes, and hover/pressed fills on transparent surfaces
        — the suffix is the alpha percentage.
      </p>
      <p>
        Escape hatch: one-off precision values stay as inline <GrammarCode>oklch()</GrammarCode>{" "}
        literals. Promote a value to a token only when it repeats across components (rule of three).
      </p>
    </div>
  );
}

function GrammarCode({ children }: { children: ReactNode }) {
  return <code className="font-mono text-xs text-foreground">{children}</code>;
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
  textClassName,
  themeToken,
}: {
  name: string;
  label: string;
  value: string;
  displayValue?: string;
  textClassName: string;
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

function ThemeContextScales({
  context,
  groups,
}: {
  context: (typeof THEME_CONTEXTS)[number];
  groups: readonly TokenGroup[];
}) {
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
  }, [context.mode, context.theme, groups]);

  return (
    <section
      ref={themeContextRef}
      data-theme={context.theme}
      className={`${context.mode === "dark" ? "dark -mx-3 bg-layer-page px-3" : "light"} min-w-0 py-6 text-foreground-strong`}
    >
      <div className="mb-8">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">{context.label}</h3>
      </div>

      <div className="grid gap-x-8 gap-y-12 lg:grid-cols-2">
        {groups.map((group) => (
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
  group: TokenGroup;
  context: (typeof THEME_CONTEXTS)[number];
  resolvedColors: ReadonlyMap<string, ResolvedThemeColor>;
}) {
  return (
    <section className="min-w-0">
      <div className="mb-4 min-w-0">
        <h4 className="text-lg font-semibold capitalize tracking-tight text-foreground">
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
