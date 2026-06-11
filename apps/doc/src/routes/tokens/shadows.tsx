import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { CodeBlock } from "#/components/code-block.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";

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
    name: "2xs",
    utility: "shadow-2xs",
    themeToken: "--shadow-2xs",
    sourceToken: "--theme-shadow-2xs",
    brutal: "1px 1px 0px var(--line-strong)",
    elegant: "none",
  },
  {
    name: "xs",
    utility: "shadow-xs",
    themeToken: "--shadow-xs",
    sourceToken: "--theme-shadow-xs",
    brutal: "1px 1px 0px var(--line-strong)",
    elegant:
      "0 2px 4px oklch(0 0 0 / 0.015), 0 1px 2px oklch(0 0 0 / 0.01), 0 0 0 0.75px oklch(0 0 0 / 0.04)",
  },
  {
    name: "sm",
    utility: "shadow-sm",
    themeToken: "--shadow-sm",
    sourceToken: "--theme-shadow-sm",
    brutal: "2px 2px 0px var(--line-strong)",
    elegant: "0 1px 2px 0 oklch(0 0 0 / 0.05)",
  },
  {
    name: "md",
    utility: "shadow-md",
    themeToken: "--shadow-md",
    sourceToken: "--theme-shadow-md",
    brutal: "4px 4px 0px var(--line-strong)",
    elegant: "0 4px 12px -4px oklch(0 0 0 / 0.12)",
  },
  {
    name: "lg",
    utility: "shadow-lg",
    themeToken: "--shadow-lg",
    sourceToken: "--theme-shadow-lg",
    brutal: "4px 4px 0px var(--line-strong)",
    elegant:
      "0 0 0 1px oklch(0 0 0 / 0.09), 0 1px 1px -1px oklch(0 0 0 / 0.04), 0 1px 2px oklch(0 0 0 / 0.03)",
  },
  {
    name: "xl",
    utility: "shadow-xl",
    themeToken: "--shadow-xl",
    sourceToken: "--theme-shadow-xl",
    brutal: "6px 6px 0px var(--line-strong)",
    elegant: "0 10px 24px -12px oklch(0 0 0 / 0.18)",
  },
  {
    name: "2xl",
    utility: "shadow-2xl",
    themeToken: "--shadow-2xl",
    sourceToken: "--theme-shadow-2xl",
    brutal: "6px 6px 0px var(--line-strong)",
    elegant: "0 24px 48px -20px oklch(0 0 0 / 0.28)",
  },
] as const;

const THEME_PREVIEWS = [{ theme: "brutal" }, { theme: "elegant" }] as const;

export const SHADOW_SNIPPETS = {
  usage: `<div className="border border-line bg-layer-panel shadow-sm" />

<button className="border-2 border-line-strong bg-primary-400 shadow-sm hover:shadow-md active:shadow-2xs">
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
      data-theme={theme}
      className="light min-h-screen"
      style={{
        background: "var(--layer-page)",
        color: "var(--foreground)",
        fontFamily: "var(--sans-font)",
      }}
    >
      {children}
    </div>
  );
}

function ThemeScaleCard({ theme }: { theme: (typeof THEME_PREVIEWS)[number] }) {
  return (
    <div
      data-theme={theme.theme}
      className="p-4"
      style={{
        background: "var(--layer-panel)",
        color: "var(--foreground)",
        fontFamily: "var(--display-font)",
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        {SHADOW_TOKENS.map((shadow) => (
          <div key={shadow.sourceToken} className="flex h-28 items-center justify-center">
            <div
              className="flex h-16 w-24 items-center justify-center border text-xs font-semibold"
              style={{
                background: "var(--layer-panel)",
                borderColor: "var(--line-strong)",
                boxShadow: `var(${shadow.sourceToken})`,
                color: "var(--foreground-strong)",
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
