import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { CodeBlock } from "#/components/code-block.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import { isMarkdownMode } from "#/lib/markdown-mode.ts";

const TOC = [
  { id: "scale", title: "Scale" },
  { id: "values", title: "Values" },
  { id: "usage", title: "Usage" },
] as const;

/** Controls never cast a shadow; only overlays float (foundation.css). */
const NO_SHADOW = "0 0 #0000";
const FLOAT_LIGHT =
  "0 1px 0 oklch(0.1813 0.005 17.62 / 0.039), 0 12px 32px -12px oklch(0.1813 0.005 17.62 / 0.322)";
const FLOAT_DARK =
  "0 0 0 1px oklch(0.9843 0.004 106.47 / 0.078), 0 16px 40px -12px oklch(0 0 0 / 0.8)";

const SHADOW_TOKENS = [
  {
    name: "xs",
    utility: "shadow-raft-xs",
    sourceToken: "--theme-shadow-xs",
    light: NO_SHADOW,
    dark: NO_SHADOW,
  },
  {
    name: "sm",
    utility: "shadow-raft-sm",
    sourceToken: "--theme-shadow-sm",
    light: NO_SHADOW,
    dark: NO_SHADOW,
  },
  {
    name: "md",
    utility: "shadow-raft-md",
    sourceToken: "--theme-shadow-md",
    light: NO_SHADOW,
    dark: NO_SHADOW,
  },
  {
    name: "lg",
    utility: "shadow-raft-lg",
    sourceToken: "--theme-shadow-lg",
    light: FLOAT_LIGHT,
    dark: FLOAT_DARK,
  },
  {
    name: "xl",
    utility: "shadow-raft-xl",
    sourceToken: "--theme-shadow-xl",
    light: FLOAT_LIGHT,
    dark: FLOAT_DARK,
  },
  {
    name: "float",
    utility: "shadow-raft-float",
    sourceToken: "--theme-shadow-float",
    light: FLOAT_LIGHT,
    dark: FLOAT_DARK,
  },
] as const;

const MODE_PREVIEWS = [
  { mode: "light", label: "Light" },
  { mode: "dark", label: "Dark" },
] as const;

export const SHADOW_SNIPPETS = {
  usage: `<div className="bg-layer-popover ring-1 ring-line-seam shadow-raft-float" />`,
} as const;

export const Route = createFileRoute("/tokens/shadows")({
  component: ShadowsDoc,
  loader: () => highlightSnippets({ data: SHADOW_SNIPPETS }),
});

function ShadowsDoc() {
  const code = Route.useLoaderData();

  // The scale cards are visual only; Markdown keeps the values and usage.
  if (isMarkdownMode()) {
    return (
      <DocPage title="Shadows" description="The shadow contract." toc={TOC}>
        <DocSection id="values" title="Values">
          <ul>
            {SHADOW_TOKENS.map((shadow) => (
              <li key={shadow.sourceToken}>
                <code>{shadow.name}</code> (<code>{shadow.sourceToken}</code>): light{" "}
                <code>{shadow.light}</code>, dark <code>{shadow.dark}</code>
              </li>
            ))}
          </ul>
        </DocSection>
        <DocSection id="usage" title="Usage">
          <CodeBlock html={code.usage} />
        </DocSection>
      </DocPage>
    );
  }

  return (
    <ShadowsPageScope>
      <DocPage title="Shadows" description="The shadow contract." toc={TOC}>
        <DocSection id="scale" title="Scale">
          <div className="grid gap-4">
            {MODE_PREVIEWS.map((preview) => (
              <ScaleCard key={preview.mode} preview={preview} />
            ))}
          </div>
        </DocSection>

        <DocSection id="values" title="Values">
          <div className="grid gap-0 [&>*+*]:border-t [&>*+*]:border-line-muted">
            {SHADOW_TOKENS.map((shadow) => (
              <div
                key={shadow.sourceToken}
                className="grid gap-4 px-8 py-4 lg:grid-cols-[5rem_1fr]"
              >
                <div>
                  <p className="font-mono text-xs font-semibold text-gray-950">{shadow.name}</p>
                </div>
                <div className="grid gap-2">
                  <ShadowValue label="light" value={shadow.light} />
                  <ShadowValue label="dark" value={shadow.dark} />
                </div>
              </div>
            ))}
          </div>
        </DocSection>

        <DocSection id="usage" title="Usage">
          <CodeBlock html={code.usage} />
        </DocSection>
      </DocPage>
    </ShadowsPageScope>
  );
}

function ShadowsPageScope({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen bg-layer-panel"
      style={{
        color: "var(--foreground-strong)",
        fontFamily: "var(--sans-font)",
      }}
    >
      {children}
    </div>
  );
}

function ScaleCard({ preview }: { preview: (typeof MODE_PREVIEWS)[number] }) {
  return (
    <div
      className={`${preview.mode} p-4`}
      style={{
        background: "var(--layer-panel)",
        color: "var(--foreground-strong)",
        fontFamily: "var(--heading-font)",
        colorScheme: preview.mode,
      }}
    >
      <p className="mb-2 font-mono text-xs" style={{ color: "var(--foreground-muted)" }}>
        {preview.label}
      </p>
      <div className="grid grid-cols-2 gap-4">
        {SHADOW_TOKENS.map((shadow) => (
          <div key={shadow.sourceToken} className="flex h-28 items-center justify-center">
            <div
              className="flex h-16 w-24 items-center justify-center rounded-sm text-xs font-normal"
              style={{
                background: "var(--fill-muted)",
                boxShadow: `var(${shadow.sourceToken})`,
                color: "var(--foreground)",
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

function ShadowValue({ value, label }: { value: string; label?: string }) {
  return (
    <div>
      {label ? (
        <p className="mb-0.5 font-mono text-[11px] text-foreground-placeholder">{label}</p>
      ) : null}
      <p className="wrap-break-word font-mono text-xs leading-relaxed text-gray-600">{value}</p>
    </div>
  );
}
