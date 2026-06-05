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
  { id: "families", title: "Theme systems" },
  { id: "scale", title: "Type scale" },
  { id: "weights", title: "Weights" },
  { id: "usage", title: "Usage" },
] as const;

const TODOS = [
  "Rename font-display to a token name that represents the theme's default UI font.",
] as const;

const EXECUTION_PLAN = [
  "Replace the current display naming with a primary UI font token such as font-sans or font-ui.",
  "Keep font-mono as the monospace token, and reserve font-display for a future large heading or brand display face if needed.",
  "Map each theme to the same semantic names: brutal can resolve font-sans/font-ui to Space Grotesk, elegant can resolve it to Inter.",
  "Update component usage after the token name is agreed, rather than renaming --display-font or font-display immediately.",
] as const;

const FAMILIES = [
  {
    theme: "Brutal",
    themeId: "brutal",
    status: undefined,
    display: "Space Grotesk",
    mono: "Space Mono",
    description: "Bold, compact, and intentionally graphic. Good for expressive component chrome.",
  },
  {
    theme: "Elegant",
    themeId: "elegant",
    status: "in-progress",
    display: "Inter",
    mono: "ui-monospace",
    description: "Neutral system-doc typography for quiet product surfaces.",
  },
] as const;

const TYPE_SCALE = [
  { name: "xs", className: "text-xs", size: "0.75rem", lineHeight: "1rem" },
  { name: "sm", className: "text-sm", size: "0.875rem", lineHeight: "1.25rem" },
  { name: "base", className: "text-base", size: "1rem", lineHeight: "1.5rem" },
  { name: "lg", className: "text-lg", size: "1.125rem", lineHeight: "1.75rem" },
  { name: "xl", className: "text-xl", size: "1.25rem", lineHeight: "1.75rem" },
  { name: "2xl", className: "text-2xl", size: "1.5rem", lineHeight: "2rem" },
  { name: "3xl", className: "text-3xl", size: "1.875rem", lineHeight: "2.25rem" },
] as const;

const WEIGHTS = [
  { name: "regular", className: "font-normal", value: 400 },
  { name: "medium", className: "font-medium", value: 500 },
  { name: "semibold", className: "font-semibold", value: 600 },
  { name: "bold", className: "font-bold", value: 700 },
] as const;

const SNIPPETS = {
  families: `@theme inline {
  --font-display: var(--display-font);
  --font-mono: var(--mono-font);
}`,
  usage: `<h1 className="font-display text-3xl font-bold text-foreground">
  Component title
</h1>

<code className="font-mono text-sm text-gray-500">
  --color-primary
</code>`,
} as const;

export const Route = createFileRoute("/tokens/typography")({
  component: TypographyDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function TypographyDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage title="Typography" description="Font families, sizes, and weight scale." toc={TOC}>
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
            This is documentation-only for now. Do not rename <code>--display-font</code>,{" "}
            <code>font-display</code>, or component usages until the replacement token name is
            agreed.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="families" title="Theme type systems">
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
            {FAMILIES.map((family) => (
              <FamilyCard key={family.theme} family={family} />
            ))}
          </div>
          <CodeBlock html={code.families} />
          <Callout>
            Components should use <code>font-display</code> and <code>font-mono</code> instead of
            naming the font directly. Theme files decide which actual family those utilities resolve
            to.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="scale" title="Type scale">
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {TYPE_SCALE.map((item) => (
            <div
              key={item.name}
              className="grid gap-3 border-t border-gray-100 p-4 first:border-t-0 sm:grid-cols-[7rem_1fr_10rem]"
            >
              <div>
                <p className="font-mono text-xs text-gray-500">{item.className}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {item.size} / {item.lineHeight}
                </p>
              </div>
              <p className={`${item.className} font-display font-semibold text-gray-900`}>
                The quick brown fox jumps over the lazy dog.
              </p>
              <p className="self-center text-sm text-gray-500">{item.name}</p>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="weights" title="Weights">
        <div className="grid gap-3 sm:grid-cols-2">
          {WEIGHTS.map((weight) => (
            <div key={weight.name} className="rounded-lg border border-gray-200 bg-white p-4">
              <p className={`${weight.className} font-display text-2xl text-gray-900`}>
                {weight.name}
              </p>
              <p className="mt-2 font-mono text-xs text-gray-500">
                {weight.className} / {weight.value}
              </p>
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

function FamilyCard({ family }: { family: (typeof FAMILIES)[number] }) {
  return (
    <div
      data-theme={family.themeId}
      className="border p-5"
      style={{
        background: "var(--background)",
        borderColor: "var(--border)",
        borderRadius: "var(--radius)",
        color: "var(--foreground)",
        fontFamily: "var(--display-font)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold opacity-60">{family.theme}</p>
            <StatusBadge status={family.status} />
          </div>
          <p className="mt-3 text-3xl font-bold">{family.display}</p>
        </div>
        <span
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center border text-2xl font-bold"
          style={{
            background: "var(--primary)",
            borderColor: "var(--border)",
            borderRadius: "calc(var(--radius) * 0.75)",
            color: "var(--primary-foreground)",
          }}
        >
          Aa
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed opacity-70">{family.description}</p>
      <div
        className="mt-5 border p-3 text-sm"
        style={{
          background: "var(--secondary)",
          borderColor: "var(--border)",
          borderRadius: "calc(var(--radius) * 0.75)",
          color: "var(--secondary-foreground)",
          fontFamily: "var(--mono-font)",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <span>{family.mono}</span>
          <span className="opacity-60">font-mono</span>
        </div>
      </div>
    </div>
  );
}
