import { createFileRoute } from "@tanstack/react-router";
import { SegmentedControl } from "@slock-ui/ui";
import { useState } from "react";

import { CodeBlock } from "#/components/code-block.tsx";
import { Differences } from "#/components/differences.tsx";
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
  { id: "counts", title: "Counts" },
  { id: "disabled", title: "Disabled" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { SegmentedControl } from "@slock-ui/ui";

<SegmentedControl
  value={value}
  onChange={setValue}
  options={[
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
  ]}
/>`,
  counts: `<SegmentedControl
  value={value}
  onChange={setValue}
  options={[
    { value: "all", label: "All", count: 12 },
    { value: "unread", label: "Unread", count: 3 },
  ]}
/>`,
  disabled: `<SegmentedControl disabled value="all" onChange={() => {}} options={...} />`,
} as const;

const PROPS: readonly PropRow[] = [
  { name: "value", type: "T", description: "The currently selected option value." },
  {
    name: "options",
    type: "SegmentedControlOption<T>[]",
    description: "Each: { value, label, count?, icon?, testId? }.",
  },
  { name: "onChange", type: "(value: T) => void", description: "Called with the picked value." },
  { name: "ariaLabel", type: "string", description: "Accessible label for the radiogroup." },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Dims and disables all segments.",
  },
  { name: "className", type: "string", description: "Additional classes on the wrapper." },
];

export const Route = createFileRoute("/components/segmented-control")({
  component: SegmentedControlDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

const OPTIONS = [
  { value: "all", label: "All", count: 12 },
  { value: "unread", label: "Unread", count: 3 },
  { value: "mentions", label: "Mentions" },
] as const;

function SegmentedControlDoc() {
  const code = Route.useLoaderData();
  const [value, setValue] = useState<string>("all");

  return (
    <DocPage
      title="SegmentedControl"
      description="A controlled single-select group rendered as a row of bordered segments."
      overview={
        <Differences from="SegmentedControl">
          <li>brutal styling reproduced 1:1 (active yellow + shadow, yellow/30 hover)</li>
          <li>
            kept the generic <code>value</code> / <code>options</code> / <code>onChange</code> API
            while each segment is built on Base UI&rsquo;s <code>Button</code>
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <Example html={code.counts}>
          <SegmentedControl
            ariaLabel="Filter"
            value={value}
            onChange={setValue}
            options={OPTIONS.map((o) => ({ ...o }))}
          />
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="counts" title="Counts">
        <CodeBlock html={code.counts} />
      </DocSection>

      <DocSection id="disabled" title="Disabled">
        <Example html={code.disabled}>
          <SegmentedControl
            disabled
            value="all"
            onChange={() => {}}
            options={[
              { value: "all", label: "All" },
              { value: "unread", label: "Unread" },
            ]}
          />
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
