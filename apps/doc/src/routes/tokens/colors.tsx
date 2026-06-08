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
  { id: "surface", title: "Surface roles" },
  { id: "tones", title: "Brutal tones" },
  { id: "usage", title: "Usage" },
] as const;

const TODOS = [
  "Migrate Badge, Banner, Status, and form validation styling from raw brutal utilities to semantic tone utilities.",
  "Audit remaining component recipes for direct bg-brutal-* usage after each component has a semantic API.",
] as const;

const TOKEN_MODEL = [
  "Primitive palette: fixed color ingredients such as --color-brutal-yellow and --color-brutal-pink.",
  "Semantic tones: reusable state roles such as --information-default, --success-soft, and --destructive-border.",
  "Action tokens: button-specific roles such as --action-primary-default and --action-destructive-hover.",
  "Surface roles: reusable container colors such as --surface, --surface-muted, and --surface-elevated.",
  "Component variants consume semantic, action, or surface utilities; raw brutal utilities are reserved for legacy, demos, and unfinished migrations.",
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
  { label: "information", token: "--information-default" },
  { label: "destructive", token: "--destructive-default" },
  { label: "action primary", token: "--action-primary-default" },
  { label: "surface", token: "--surface" },
  { label: "elevated surface", token: "--surface-elevated" },
  { label: "border", token: "--border" },
  { label: "ring", token: "--ring" },
] as const;

type ColorDocToken = {
  name: string;
  token: string;
  utility: string;
  description: string;
};

const SEMANTIC_COLORS: readonly ColorDocToken[] = [
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
    name: "information default",
    token: "--information-default",
    utility: "bg-information-default",
    description: "Informational emphasis. Brutal maps this to yellow; Elegant maps it to blue.",
  },
  {
    name: "information soft",
    token: "--information-soft",
    utility: "bg-information-soft",
    description: "Soft informational surface for banners, selected rows, and low-emphasis hints.",
  },
  {
    name: "success default",
    token: "--success-default",
    utility: "bg-success-default",
    description: "Successful or healthy state. Brutal maps this to lime.",
  },
  {
    name: "warning default",
    token: "--warning-default",
    utility: "bg-warning-default",
    description: "Warning state. Brutal maps this to orange to match existing Banner usage.",
  },
  {
    name: "destructive default",
    token: "--destructive-default",
    utility: "bg-destructive-default",
    description: "Dangerous or destructive state. Also feeds destructive Button variants.",
  },
  {
    name: "action primary",
    token: "--action-primary-default",
    utility: "bg-action-primary",
    description: "Primary Button fill. It maps through semantic tones instead of raw color names.",
  },
  {
    name: "action default",
    token: "--action-default-default",
    utility: "bg-action-default",
    description: "Default Button fill for neutral actions and cancel controls.",
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

const SURFACE_COLORS: readonly ColorDocToken[] = [
  {
    name: "surface",
    token: "--surface",
    utility: "bg-surface",
    description: "Default content container fill.",
  },
  {
    name: "surface muted",
    token: "--surface-muted",
    utility: "bg-surface-muted",
    description: "Low-emphasis container fill for unavailable, nested, or quiet surfaces.",
  },
  {
    name: "surface elevated",
    token: "--surface-elevated",
    utility: "bg-surface-elevated",
    description: "Raised container fill for floating or layered content.",
  },
  {
    name: "surface foreground",
    token: "--surface-foreground",
    utility: "text-surface-foreground",
    description: "Readable text on default surface fills.",
  },
  {
    name: "surface muted foreground",
    token: "--surface-muted-foreground",
    utility: "text-surface-muted-foreground",
    description: "Secondary text on surface primitives.",
  },
  {
    name: "surface border",
    token: "--surface-border",
    utility: "border-surface-border",
    description: "Strong surface frame. Brutal maps this to black ink.",
  },
  {
    name: "surface border subtle",
    token: "--surface-border-subtle",
    utility: "border-surface-border-subtle",
    description: "Quiet preview frame, matching the current PreviewShell resting border.",
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
  --color-information-default: var(--information-default);
  --color-information-soft: var(--information-soft);
  --color-success-default: var(--success-default);
  --color-warning-default: var(--warning-default);
  --color-destructive-default: var(--destructive-default);
  --color-action-primary: var(--action-primary-default);
  --color-action-default: var(--action-default-default);
  --color-surface: var(--surface);
  --color-surface-muted: var(--surface-muted);
  --color-surface-elevated: var(--surface-elevated);
  --color-surface-border-subtle: var(--surface-border-subtle);
  --color-border: var(--border);
  --color-ring: var(--ring);
}`,
  surface: `<div className="border border-surface-border bg-surface text-surface-foreground">
  <div className="border border-surface-border-subtle bg-surface-muted text-surface-muted-foreground">
    Muted nested surface
  </div>
  <div className="border border-surface-border bg-surface-elevated">Elevated surface</div>
</div>`,
  usage: `<div className="border border-border bg-background text-foreground">
  <button className="bg-action-primary text-action-primary-foreground ring-ring">
    Confirm
  </button>
  <div className="bg-information-soft text-information-foreground">
    Informational hint
  </div>
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
            <p className="text-sm font-semibold text-gray-900">Token model</p>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-gray-600">
              {TOKEN_MODEL.map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="font-mono text-xs text-gray-400">{index + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
          <Callout>
            The first pass is wired into the theme files and Tailwind utilities. The next work is
            component migration: Button consumes action tokens now, while status-style components
            still need to move off raw brutal utilities.
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

      <DocSection id="surface" title="Surface roles">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {SURFACE_COLORS.map((color) => (
              <ColorTokenCard key={color.token} color={color} />
            ))}
          </div>
          <CodeBlock html={code.surface} />
          <Callout>
            Surface tokens describe reusable container fills and borders. Interaction states such as
            selected, highlighted, hover, and active stay in component recipes and semantic intent
            tokens.
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
            Brutal tones are fixed palette colors, not semantic roles. New component recipes should
            consume semantic utilities. Button keeps <code>tone</code> only as a deprecated
            migration escape hatch.
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

function ColorTokenCard({ color }: { color: ColorDocToken }) {
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
