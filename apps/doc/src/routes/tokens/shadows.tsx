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
  { id: "surface", title: "Surface elevation" },
  { id: "scale", title: "Brutal scale" },
  { id: "radius", title: "Radius" },
  { id: "usage", title: "Usage" },
] as const;

const TODOS = [
  "Audit component recipes and migrate eligible container surfaces from raw shadow variables to semantic surface elevation tokens.",
] as const;

const EXECUTION_PLAN = [
  "Keep the brutal source shadow scale stable: --shadow, --shadow-hover, --shadow-active, and --shadow-lg.",
  "Use surface elevation tokens for reusable container primitives: --surface-shadow-sm, --surface-shadow-md, and --surface-shadow-lg.",
  "Map surface elevation per theme so brutal and elegant can share names but resolve to different physical styles.",
  "Keep the source scale available for low-level composition and legacy comparisons.",
] as const;

const THEME_ELEVATION = [
  {
    label: "Brutal",
    theme: "brutal",
    mode: undefined,
    status: undefined,
    token: "--surface-shadow-sm",
    radius: "0px",
    description: "Hard offset shadow and square corners make elevation graphic and tactile.",
  },
  {
    label: "Elegant",
    theme: "elegant",
    mode: undefined,
    status: "in-progress",
    token: "--surface-shadow-sm",
    radius: "0.5rem",
    description: "A quiet hairline lift supports low-noise product surfaces.",
  },
  {
    label: "Elegant dark",
    theme: "elegant",
    mode: "dark",
    status: "in-progress",
    token: "--surface-shadow-sm",
    radius: "0.5rem",
    description: "Dark elegant keeps the same soft geometry and relies more on border contrast.",
  },
] as const;

const BRUTAL_SHADOW_SCALE = [
  {
    name: "resting",
    token: "--shadow",
    value: "2px 2px 0px oklch(0.18 0.006 25)",
    description: "Default hard offset shadow for controls and cards.",
  },
  {
    name: "raised",
    token: "--shadow-hover",
    value: "4px 4px 0px oklch(0.18 0.006 25)",
    description: "Raised source tier. Historically exposed as the hover shadow.",
  },
  {
    name: "pressed",
    token: "--shadow-active",
    value: "1px 1px 0px oklch(0.18 0.006 25)",
    description: "Pressed source tier. Historically exposed as the active shadow.",
  },
  {
    name: "elevated",
    token: "--shadow-lg",
    value: "6px 6px 0px oklch(0.18 0.006 25)",
    description: "Largest source tier for sheets and prominent panels.",
  },
] as const;

const SURFACE_ELEVATION = [
  {
    name: "sm",
    token: "--surface-shadow-sm",
    utility: "shadow-surface-sm",
    description: "Subtle container elevation for resting cards and framed content.",
  },
  {
    name: "md",
    token: "--surface-shadow-md",
    utility: "shadow-surface-md",
    description: "Raised container elevation for hover, expanded, or emphasized states.",
  },
  {
    name: "lg",
    token: "--surface-shadow-lg",
    utility: "shadow-surface-lg",
    description: "Largest reusable container elevation for sheets and prominent panels.",
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
  usage: `<div className="rounded-md border border-surface-border bg-surface shadow-surface-sm" />

<button className="rounded-md border border-surface-border bg-primary text-primary-foreground shadow-surface-sm hover:shadow-surface-md active:shadow-none">
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
            Surface elevation is now wired into theme files and Tailwind utilities. Keep the brutal
            source scale stable for legacy parity; use surface elevation for new reusable
            containers.
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
            <code>--surface-shadow-sm/md/lg</code> are reusable container elevation tokens. The same
            component can keep one class while brutal and elegant render different physical
            behavior.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="surface" title="Surface elevation">
        <div className="grid gap-4 sm:grid-cols-2">
          {SURFACE_ELEVATION.map((shadow) => (
            <SurfaceElevationCard key={shadow.token} shadow={shadow} />
          ))}
        </div>
      </DocSection>

      <DocSection id="scale" title="Brutal shadow scale">
        <div className="grid gap-4 sm:grid-cols-2">
          {BRUTAL_SHADOW_SCALE.map((shadow) => (
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
              background: "var(--surface)",
              borderColor: "var(--surface-border-subtle)",
              borderRadius: "var(--radius)",
              boxShadow: "var(--surface-shadow-sm)",
              color: "var(--surface-foreground)",
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

type ShadowToken = (typeof BRUTAL_SHADOW_SCALE)[number];

function SurfaceElevationCard({ shadow }: { shadow: (typeof SURFACE_ELEVATION)[number] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {THEME_ELEVATION.map((theme) => (
          <div
            key={theme.label}
            data-theme={theme.theme}
            className={theme.mode === "dark" ? "dark" : undefined}
          >
            <div className="flex h-24 items-center justify-center rounded-md bg-gray-50">
              <div
                className="flex h-14 w-24 items-center justify-center border text-xs font-semibold"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--surface-border-subtle)",
                  borderRadius: "var(--radius)",
                  boxShadow: `var(${shadow.token})`,
                  color: "var(--surface-foreground)",
                  fontFamily: "var(--display-font)",
                }}
              >
                {theme.label}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm font-semibold text-gray-900">{shadow.name}</p>
      <p className="mt-1 font-mono text-xs text-gray-500">{shadow.token}</p>
      <p className="mt-1 font-mono text-xs text-gray-500">{shadow.utility}</p>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{shadow.description}</p>
    </div>
  );
}

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
