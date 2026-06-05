import { createFileRoute } from "@tanstack/react-router";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { StatusBadge } from "#/components/status-badge.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "themes", title: "Theme elevation" },
  { id: "brutal", title: "Levels" },
  { id: "radius", title: "Radius" },
  { id: "usage", title: "Usage" },
] as const;

const TODOS = [
  "Rename shadow tokens into a two-layer semantic scale without changing behavior.",
] as const;

const EXECUTION_PLAN = [
  "Define raw elevation scale tokens first, following shadcn-style organization: shadow-xs, shadow-sm, shadow-md, shadow-lg, shadow-xl.",
  "Define semantic alias tokens second: shadow-card, shadow-hover, shadow-active, shadow-panel, and similar component or state roles.",
  "Map the semantic aliases to the raw scale tokens per theme so brutal and elegant can share names but resolve to different physical styles.",
  "Update component usage to reference semantic aliases, keeping raw scale tokens available for low-level composition.",
] as const;

const THEME_ELEVATION = [
  {
    label: "Brutal",
    theme: "brutal",
    mode: undefined,
    status: undefined,
    token: "--shadow",
    radius: "0px",
    description: "Hard offset shadow and square corners make elevation graphic and tactile.",
  },
  {
    label: "Elegant",
    theme: "elegant",
    mode: undefined,
    status: "in-progress",
    token: "--shadow",
    radius: "0.5rem",
    description: "A quiet hairline lift supports low-noise product surfaces.",
  },
  {
    label: "Elegant dark",
    theme: "elegant",
    mode: "dark",
    status: "in-progress",
    token: "--shadow",
    radius: "0.5rem",
    description: "Dark elegant keeps the same soft geometry and relies more on border contrast.",
  },
] as const;

const BRUTAL_SHADOWS = [
  {
    name: "resting",
    token: "--shadow",
    value: "2px 2px 0px oklch(0.18 0.006 25)",
    description: "Default hard offset shadow for controls and cards.",
  },
  {
    name: "hover",
    token: "--shadow-hover",
    value: "4px 4px 0px oklch(0.18 0.006 25)",
    description: "Raised interaction tier for hover or expanded emphasis.",
  },
  {
    name: "active",
    token: "--shadow-active",
    value: "1px 1px 0px oklch(0.18 0.006 25)",
    description: "Pressed tier for active states.",
  },
  {
    name: "large",
    token: "--shadow-lg",
    value: "6px 6px 0px oklch(0.18 0.006 25)",
    description: "Largest offset tier for raised panels such as BottomSheet.",
  },
] as const;

const RADIUS_TOKENS = [
  {
    theme: "Brutal",
    status: undefined,
    token: "--radius",
    value: "0px",
    description: "Squared-off controls and surfaces.",
  },
  {
    theme: "Elegant",
    status: "in-progress",
    token: "--radius",
    value: "0.5rem",
    description: "Small rounded corners for quieter product UI.",
  },
] as const;

const SNIPPETS = {
  usage: `<div
  className="border border-border bg-background"
  style={{ borderRadius: "var(--radius)", boxShadow: "var(--shadow)" }}
/>

<button
  className="border border-border bg-primary text-primary-foreground"
  style={{ boxShadow: "var(--shadow-hover)" }}
>
  Raised
</button>`,
} as const;

export const Route = createFileRoute("/tokens/shadows")({
  component: ShadowsDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ShadowsDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage title="Shadows" description="The elevation and shadow scale." toc={TOC}>
      <DocSection id="todo" title="Todo">
        <div className="space-y-5">
          <TodoList items={TODOS} />
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-900">Execution plan</p>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-gray-600">
              {EXECUTION_PLAN.map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="font-mono text-xs text-gray-400">{index + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
          <Callout>
            This is documentation-only for now. Do not rename <code>--shadow</code>,{" "}
            <code>--shadow-hover</code>, <code>--shadow-active</code>, or <code>--shadow-lg</code>{" "}
            until the scale and alias layer are agreed.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="themes" title="Theme elevation">
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {THEME_ELEVATION.map((theme) => (
              <ElevationThemeCard key={theme.label} theme={theme} />
            ))}
          </div>
          <Callout>
            <code>--shadow</code> is a semantic elevation token. The same component can keep one
            class or style hook while brutal and elegant render very different physical behavior.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="brutal" title="Levels">
        <div className="grid gap-4 sm:grid-cols-2">
          {BRUTAL_SHADOWS.map((shadow) => (
            <ShadowCard key={shadow.token} theme="brutal" shadow={shadow} />
          ))}
        </div>
      </DocSection>

      <DocSection id="radius" title="Radius">
        <div className="grid gap-4 sm:grid-cols-2">
          {RADIUS_TOKENS.map((radius) => (
            <div key={radius.theme} className="rounded-lg border border-gray-200 bg-white p-4">
              <div
                className="h-24 border border-gray-900 bg-brutal-yellow"
                style={{ borderRadius: radius.value }}
              />
              <div className="mt-4 flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">{radius.theme}</p>
                <StatusBadge status={radius.status} />
              </div>
              <p className="mt-1 font-mono text-xs text-gray-500">
                {radius.token}: {radius.value}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{radius.description}</p>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <CodeBlock html={code.usage} />
      </DocSection>
    </DocPage>
  );
}

function ElevationThemeCard({ theme }: { theme: (typeof THEME_ELEVATION)[number] }) {
  return (
    <div
      data-theme={theme.theme}
      className={theme.mode === "dark" ? "dark" : undefined}
      style={{
        background: "var(--background)",
        color: "var(--foreground)",
        borderColor: "var(--border)",
        borderRadius: "var(--radius)",
        fontFamily: "var(--display-font)",
      }}
    >
      <div className="rounded-[inherit] border p-4" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{theme.label}</p>
          <StatusBadge status={theme.status} />
        </div>
        <div className="mt-5 flex h-32 items-center justify-center">
          <div
            className="flex h-20 w-32 items-center justify-center border text-sm font-semibold"
            style={{
              background: "var(--secondary)",
              borderColor: "var(--border)",
              borderRadius: "var(--radius)",
              boxShadow: "var(--shadow)",
              color: "var(--secondary-foreground)",
            }}
          >
            surface
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed opacity-70">{theme.description}</p>
        <div className="mt-4 grid gap-2 font-mono text-xs opacity-60">
          <span>{theme.token}</span>
          <span>--radius: {theme.radius}</span>
        </div>
      </div>
    </div>
  );
}

type ShadowToken = (typeof BRUTAL_SHADOWS)[number];

function ShadowCard({ theme, shadow }: { theme: "brutal" | "elegant"; shadow: ShadowToken }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex h-36 items-center justify-center rounded-md bg-gray-50">
        <div
          data-theme={theme}
          className="flex h-20 w-32 items-center justify-center border text-sm font-semibold"
          style={{
            background: "var(--background)",
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: `var(${shadow.token})`,
            color: "var(--foreground)",
            fontFamily: "var(--display-font)",
          }}
        >
          {shadow.name}
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-gray-900">{shadow.name}</p>
      <p className="mt-1 font-mono text-xs text-gray-500">{shadow.token}</p>
      <p className="mt-2 font-mono text-xs leading-relaxed text-gray-500">{shadow.value}</p>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{shadow.description}</p>
    </div>
  );
}
