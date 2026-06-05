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
  { id: "themes", title: "Theme matrix" },
  { id: "semantic", title: "Semantic roles" },
  { id: "tones", title: "Brutal tones" },
  { id: "usage", title: "Usage" },
] as const;

const TODOS = [
  "Refactor the color token model so Elegant can fully redefine the visual language without changing component code.",
] as const;

const EXECUTION_PLAN = [
  "Use shadcn's semantic token organization as a reference, but optimize for slock-ui's two very different visual families rather than copying the full shadcn token list.",
  "Keep primitive palettes separate from component semantics: brutal tones remain explicit color picks, and Elegant can introduce a completely different neutral or brand palette.",
  "Define the core surface hierarchy first: background/foreground, surface/surface-foreground, panel/panel-foreground, and overlay/overlay-foreground.",
  "Define action and state roles next: primary/primary-foreground, secondary/secondary-foreground, muted/muted-foreground, accent/accent-foreground, destructive/destructive-foreground, border, input, and ring.",
  "Add component aliases only when a component needs a dedicated role: card can alias to surface, popover can alias to overlay, and sidebar or chart tokens should wait for app-shell or chart components.",
  "Expose approved semantic roles through @theme inline as --color-* utilities after the role names are agreed, so component code consumes semantic roles instead of brutal or elegant primitives.",
] as const;

const THEME_CONTEXTS = [
  {
    label: "Brutal",
    theme: "brutal",
    mode: undefined,
    status: undefined,
    description: "Flat white canvas, black ink, yellow primary, square geometry.",
  },
  {
    label: "Elegant",
    theme: "elegant",
    mode: undefined,
    status: "in-progress",
    description: "Neutral light surfaces with subtle borders and a restrained primary.",
  },
  {
    label: "Elegant dark",
    theme: "elegant",
    mode: "dark",
    status: "in-progress",
    description: "The same elegant roles remapped for dark surfaces and focus contrast.",
  },
] as const;

const THEME_TOKENS = [
  { label: "background", token: "--background" },
  { label: "foreground", token: "--foreground" },
  { label: "primary", token: "--primary" },
  { label: "secondary", token: "--secondary" },
  { label: "border", token: "--border" },
  { label: "ring", token: "--ring" },
] as const;

const SEMANTIC_COLORS = [
  {
    name: "background",
    token: "--background",
    utility: "bg-background",
    description: "App surface color. Use it for the root canvas and large quiet surfaces.",
  },
  {
    name: "foreground",
    token: "--foreground",
    utility: "text-foreground",
    description: "Primary readable text color on background surfaces.",
  },
  {
    name: "primary",
    token: "--primary",
    utility: "bg-primary",
    description: "Main action or emphasized fill for the active theme.",
  },
  {
    name: "primary foreground",
    token: "--primary-foreground",
    utility: "text-primary-foreground",
    description: "Text and icon color intended to sit on primary.",
  },
  {
    name: "secondary",
    token: "--secondary",
    utility: "bg-secondary",
    description: "Subtle fill for quieter controls and grouped content.",
  },
  {
    name: "secondary foreground",
    token: "--secondary-foreground",
    utility: "text-secondary-foreground",
    description: "Text and icon color intended to sit on secondary.",
  },
  {
    name: "border",
    token: "--border",
    utility: "border-border",
    description: "Theme-aware stroke for components and separators.",
  },
  {
    name: "ring",
    token: "--ring",
    utility: "ring-ring",
    description: "Focus indicator color. The elegant dark value is tuned for contrast.",
  },
] as const;

const BRUTAL_TONES = [
  { name: "yellow", token: "--color-brutal-yellow", value: "oklch(0.8829 0.1623 91.9)" },
  { name: "pink", token: "--color-brutal-pink", value: "oklch(0.7489 0.1623 0.7)" },
  { name: "lavender", token: "--color-brutal-lavender", value: "oklch(0.783 0.0783 294.53)" },
  { name: "cyan", token: "--color-brutal-cyan", value: "oklch(0.7833 0.1353 219.21)" },
  { name: "orange", token: "--color-brutal-orange", value: "oklch(0.7855 0.1227 50.11)" },
  { name: "lime", token: "--color-brutal-lime", value: "oklch(0.8272 0.1354 130.07)" },
  { name: "red", token: "--color-brutal-red", value: "oklch(0.711 0.1682 28.04)" },
  { name: "stone", token: "--color-brutal-stone", value: "oklch(0.7892 0.0137 71.29)" },
  { name: "cream", token: "--color-brutal-cream", value: "oklch(0.986 0.0154 86.42)" },
] as const;

const SNIPPETS = {
  semantic: `@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-border: var(--border);
  --color-ring: var(--ring);
}`,
  usage: `<div className="border border-border bg-background text-foreground">
  <button className="bg-primary text-primary-foreground ring-ring">
    Confirm
  </button>
</div>`,
} as const;

export const Route = createFileRoute("/tokens/colors")({
  component: ColorsDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ColorsDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage title="Colors" description="The slock-ui color palette and semantic tokens." toc={TOC}>
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
            This is documentation-only for now. The goal is theme independence: Brutal and Elegant
            can map the same semantic roles to completely different palettes while components keep
            the same class names.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="themes" title="Theme matrix">
        <div className="grid gap-4 lg:grid-cols-3">
          {THEME_CONTEXTS.map((theme) => (
            <ThemeMatrixCard key={theme.label} theme={theme} />
          ))}
        </div>
      </DocSection>

      <DocSection id="semantic" title="Semantic roles">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {SEMANTIC_COLORS.map((color) => (
              <ColorTokenCard key={color.token} color={color} />
            ))}
          </div>
          <CodeBlock html={code.semantic} />
          <Callout>
            Semantic color utilities emit <code>var(--token)</code> references, so one component can
            move between <code>brutal</code>, <code>elegant</code>, and elegant dark mode without
            changing class names.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="tones" title="Brutal tones">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {BRUTAL_TONES.map((tone) => (
              <ToneCard key={tone.token} tone={tone} />
            ))}
          </div>
          <Callout>
            Brutal tones are fixed palette colors, not semantic roles. Components such as{" "}
            <code>Button</code> and <code>Badge</code> expose them through a <code>tone</code> prop.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <CodeBlock html={code.usage} />
      </DocSection>
    </DocPage>
  );
}

function ThemeMatrixCard({ theme }: { theme: (typeof THEME_CONTEXTS)[number] }) {
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">{theme.label}</p>
              <StatusBadge status={theme.status} />
            </div>
            <p className="mt-2 text-xs leading-relaxed opacity-70">{theme.description}</p>
          </div>
          <span
            className="inline-flex shrink-0 border px-2 py-1 text-xs font-semibold"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              borderColor: "var(--border)",
              borderRadius: "calc(var(--radius) * 0.75)",
            }}
          >
            primary
          </span>
        </div>
        <div className="mt-4 grid gap-2">
          {THEME_TOKENS.map((token) => (
            <div key={token.token} className="flex items-center gap-2 text-xs">
              <span
                className="h-5 w-5 shrink-0 border"
                style={{
                  background: `var(${token.token})`,
                  borderColor: token.token === "--border" ? "var(--foreground)" : "var(--border)",
                  borderRadius: "calc(var(--radius) * 0.5)",
                }}
              />
              <span className="min-w-0 flex-1 opacity-75">{token.label}</span>
              <span className="font-mono opacity-60">{token.token}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ColorTokenCard({ color }: { color: (typeof SEMANTIC_COLORS)[number] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-start gap-3 p-4">
        <TokenSwatches token={color.token} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{color.name}</p>
          <p className="mt-1 font-mono text-xs text-gray-500">{color.token}</p>
        </div>
      </div>
      <div className="border-t border-gray-100 px-4 py-3">
        <p className="text-sm leading-relaxed text-gray-600">{color.description}</p>
        <p className="mt-2 font-mono text-xs text-gray-500">{color.utility}</p>
      </div>
    </div>
  );
}

function TokenSwatches({ token }: { token: string }) {
  return (
    <div className="grid shrink-0 grid-cols-3 gap-1" aria-label={`${token} by theme`}>
      {THEME_CONTEXTS.map((theme) => (
        <div
          key={theme.label}
          data-theme={theme.theme}
          className={theme.mode === "dark" ? "dark" : undefined}
          title={`${theme.label}: ${token}`}
        >
          <div
            className="h-11 w-8 border border-gray-200"
            style={{
              background: `var(${token})`,
              borderRadius: "var(--radius)",
            }}
          />
          <div className="mt-1 h-1 w-8" style={{ background: "var(--primary)" }} />
        </div>
      ))}
    </div>
  );
}

function ToneCard({ tone }: { tone: (typeof BRUTAL_TONES)[number] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="h-20 border-b border-gray-200" style={{ background: tone.value }} />
      <div className="p-4">
        <p className="text-sm font-semibold text-gray-900">{tone.name}</p>
        <p className="mt-1 font-mono text-xs text-gray-500">{tone.token}</p>
        <p className="mt-2 font-mono text-xs text-gray-500">{tone.value}</p>
      </div>
    </div>
  );
}
