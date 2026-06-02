import { createFileRoute } from "@tanstack/react-router";
import { BadgeButton, type BadgeButtonProps } from "@slock-ui/ui";
import { X } from "lucide-react";

import { Callout } from "#/components/callout.tsx";
import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.ts";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "tones", title: "Tones" },
  { id: "api", title: "API" },
] as const;

const TONES = [
  "white",
  "yellow",
  "pink",
  "cyan",
  "lavender",
  "orange",
  "lime",
  "red",
  "stone",
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { BadgeButton } from "@slock-ui/ui";

<BadgeButton tone="lime" onClick={apply}>
  Filter
</BadgeButton>`,
  tones: `<BadgeButton tone="cyan">Filter</BadgeButton>
<BadgeButton tone="red" uppercase={false}>remove @bugen</BadgeButton>`,
} as const;

type PlaygroundValues = {
  tone: NonNullable<BadgeButtonProps["tone"]>;
  uppercase: boolean;
  label: string;
  disabled: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "tone",
    type: TONES.map((tone) => `"${tone}"`).join(" | "),
    default: '"white"',
    description: "Background color from the brutal palette. Same as Badge.",
  },
  {
    name: "uppercase",
    type: "boolean",
    default: "true",
    description: "Brutal uppercase transform. Pass false next to case-sensitive identifiers.",
  },
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Replace the rendered element or compose with another component (Base UI).",
  },
  {
    name: "...props",
    type: "Base UI Button.Props",
    description: "All native button attributes (onClick, disabled, type, etc.) plus Base UI props.",
  },
];

export const Route = createFileRoute("/components/badge-button")({
  component: BadgeButtonDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function BadgeButtonDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="BadgeButton"
      description="A clickable badge chip — the Badge visual on an interactive button."
      overview={
        <>
          The <code>Badge</code> chip rendered on Base UI&rsquo;s <code>Button</code>, for filters,
          toggles, and dismissable chips. It shares Badge&rsquo;s tone palette and{" "}
          <code>uppercase</code> axis.
          <p className="mt-2">
            Unlike the original (a bare feedback-less <code>button</code>), it adds a brutal
            hover/active press and a focus-visible ring — affordances expected of a real control.
          </p>
        </>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <ComponentPlayground<PlaygroundValues>
          initial={{ tone: "lime", uppercase: true, label: "Filter", disabled: false }}
          controls={[
            { name: "tone", label: "Tone", type: "select", options: TONES },
            { name: "uppercase", label: "Uppercase", type: "boolean" },
            { name: "label", label: "Label", type: "text" },
            { name: "disabled", label: "Disabled", type: "boolean" },
          ]}
          render={(values) => (
            <BadgeButton tone={values.tone} uppercase={values.uppercase} disabled={values.disabled}>
              {values.label}
            </BadgeButton>
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="tones" title="Tones">
        <div className="space-y-4">
          <Example html={code.tones}>
            <BadgeButton tone="cyan">Filter</BadgeButton>
            <BadgeButton tone="red" uppercase={false}>
              remove @bugen
              <X className="size-3" />
            </BadgeButton>
          </Example>
          <Callout>
            Hover and press a chip to see the brutal motion and focus ring. The press and ring are
            additions beyond the original, which rendered a plain button with no feedback.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
