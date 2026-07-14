import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { CodeBlock } from "#/components/code-block.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "scale", title: "Theme scale" },
  { id: "values", title: "Values" },
  { id: "usage", title: "Usage" },
] as const;

export type ShadowTheme = "brutal" | "elegant";

const THEME_LABELS = {
  brutal: "Brutal",
  elegant: "Elegant",
} as const satisfies Record<ShadowTheme, string>;

const SHADOW_TOKENS = [
  {
    name: "xs",
    role: "Pressed",
    utility: "shadow-xs",
    themeToken: "--shadow-xs",
    sourceToken: "--theme-shadow-xs",
    brutal: "1px 1px 0px var(--line-strong)",
    elegant: "oklch(0.145 0.002 106.42 / 0.071) 0px 0.5px 0px",
  },
  {
    name: "sm",
    role: "Resting",
    utility: "shadow-sm",
    themeToken: "--shadow-sm",
    sourceToken: "--theme-shadow-sm",
    brutal: "2px 2px 0px var(--line-strong)",
    elegant:
      "oklch(0.145 0.002 106.42 / 0.071) 0px 0.5px 0px, oklch(0.145 0.002 106.42 / 0.012) 0px 5px 4px -2px, oklch(0.145 0.002 106.42 / 0.02) 0px 3px 3px -1px, oklch(0.145 0.002 106.42 / 0.039) 0px 1px 2px -1px",
  },
  {
    name: "md",
    role: "Hover / focus",
    utility: "shadow-md",
    themeToken: "--shadow-md",
    sourceToken: "--theme-shadow-md",
    brutal: "4px 4px 0px var(--line-strong)",
    elegant:
      "oklch(0.145 0.002 106.42 / 0.071) 0px 0.5px 0px, oklch(0.145 0.002 106.42 / 0.02) 0px 8px 8px -4px, oklch(0.145 0.002 106.42 / 0.027) 0px 5px 5px -2px, oklch(0.145 0.002 106.42 / 0.039) 0px 2px 3px -1px",
  },
  {
    name: "lg",
    role: "Floating overlay",
    utility: "shadow-lg",
    themeToken: "--shadow-lg",
    sourceToken: "--theme-shadow-lg",
    brutal: "4px 4px 0px var(--color-black)",
    elegant:
      "0px 1px 1px oklch(0.21 0.006 106.42 / 0.1), 0px 0px 0px 1px oklch(0.21 0.006 106.42 / 0.04), 0px 2px 12px -4px oklch(0.21 0.006 106.42 / 0.16)",
  },
  {
    name: "xl",
    role: "Modal",
    utility: "shadow-xl",
    themeToken: "--shadow-xl",
    sourceToken: "--theme-shadow-xl",
    brutal: "6px 6px 0px var(--line-strong)",
    elegant:
      "oklch(0.145 0.002 106.42 / 0.071) 0px 0.5px 0px, oklch(0.145 0.002 106.42 / 0.031) 0px 18px 24px -12px, oklch(0.145 0.002 106.42 / 0.039) 0px 12px 12px -6px, oklch(0.145 0.002 106.42 / 0.039) 0px 4px 6px -3px",
  },
] as const;

const THEME_PREVIEWS = [{ theme: "brutal" }, { theme: "elegant" }] as const;

export const SHADOW_SNIPPETS = {
  usage: `<div className="border border-line bg-layer-panel shadow-sm" />

<button className="border-2 border-line-strong bg-primary-400 shadow-sm hover:shadow-md active:shadow-xs">
  Raised
</button>`,
} as const;

export const Route = createFileRoute("/tokens/shadows")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/tokens/shadows") {
      throw redirect({ to: "/tokens/shadows/brutal" });
    }
  },
  component: TokenOutlet,
  loader: () => highlightSnippets({ data: SHADOW_SNIPPETS }),
});

function TokenOutlet() {
  return <Outlet />;
}

export function ShadowsDoc({ theme, code }: { theme: ShadowTheme; code: Record<string, string> }) {
  const previews = THEME_PREVIEWS.filter((preview) => preview.theme === theme);
  const title = `${THEME_LABELS[theme]} shadows`;

  return (
    <TokenThemeScope theme={theme}>
      <DocPage title={title} description="The theme shadow contract." toc={TOC}>
        <DocSection id="scale" title="Theme scale">
          <div className="grid gap-4">
            {previews.map((preview) => (
              <ThemeScaleCard key={preview.theme} theme={preview} />
            ))}
          </div>
        </DocSection>

        <DocSection id="values" title="Values">
          <div className="grid gap-0 [&>*+*]:border-t [&>*+*]:border-line-subtle">
            {SHADOW_TOKENS.map((shadow) => (
              <div
                key={shadow.sourceToken}
                className="grid gap-4 px-8 py-4 lg:grid-cols-[5rem_1fr]"
              >
                <div>
                  <p className="font-mono text-xs font-semibold text-gray-950">{shadow.name}</p>
                </div>
                <ShadowValue value={shadow[theme]} />
              </div>
            ))}
          </div>
        </DocSection>

        <DocSection id="usage" title="Usage">
          <CodeBlock html={code.usage} />
        </DocSection>
      </DocPage>
    </TokenThemeScope>
  );
}

function TokenThemeScope({ theme, children }: { theme: ShadowTheme; children: ReactNode }) {
  return (
    <div
      data-token-theme-scope={theme}
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

function ThemeScaleCard({ theme }: { theme: (typeof THEME_PREVIEWS)[number] }) {
  const isBrutal = theme.theme === "brutal";

  return (
    <div
      data-theme={theme.theme}
      className="p-4"
      style={{
        background: "var(--layer-panel)",
        color: "var(--foreground)",
        fontFamily: "var(--heading-font)",
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        {SHADOW_TOKENS.map((shadow) => (
          <div key={shadow.sourceToken} className="flex h-28 items-center justify-center">
            <div
              className={`flex h-16 w-24 items-center justify-center text-xs font-normal ${
                isBrutal ? "rounded-none" : "rounded"
              }`}
              style={{
                background: isBrutal ? "var(--layer-panel)" : "var(--layer-muted)",
                boxShadow: `var(${shadow.sourceToken})`,
                color: "var(--foreground-strong)",
                fontFamily: "var(--sans-font)",
              }}
            >
              {shadow.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShadowValue({ value }: { value: string }) {
  return (
    <div>
      <p className="break-words font-mono text-xs leading-relaxed text-gray-600">{value}</p>
    </div>
  );
}
