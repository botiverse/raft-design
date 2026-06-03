import { createFileRoute } from "@tanstack/react-router";
import { SelectionPopover } from "@slock-ui/ui";
import { useState } from "react";

import { Callout } from "#/components/callout.tsx";
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
  { id: "anatomy", title: "Anatomy" },
  { id: "basic", title: "Basic" },
  { id: "searchable", title: "Searchable" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { SelectionPopover } from "@slock-ui/ui";

<SelectionPopover title="Filter" options={options} />`,
  searchable: `<SelectionPopover
  searchable
  title="Channels"
  search={query}
  onSearchChange={setQuery}
  options={filtered}
/>`,
} as const;

const PROPS: readonly PropRow[] = [
  { name: "title", type: "string", description: "Header eyebrow label." },
  {
    name: "options",
    type: "SelectionPopoverOption[]",
    description: "Each: { key, checked, label, onClick, disabled?, italic?, leading?/avatar? }.",
  },
  {
    name: "showClear / onClear",
    type: "boolean / () => void",
    description: "Optional Clear action in the header.",
  },
  { name: "showHeader", type: "boolean", default: "true", description: "Toggle the header row." },
  { name: "emptyLabel", type: "string", default: '"No matches"', description: "Empty-list text." },
  {
    name: "searchable",
    type: "boolean",
    description: "Adds a search input (with search/onSearchChange).",
  },
  {
    name: "className",
    type: "string",
    description: "Positioning + sizing (place in a Popover.Positioner).",
  },
];

export const Route = createFileRoute("/components/selection-popover")({
  component: SelectionPopoverDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

const BASE = ["All", "Unread", "Mentions", "Archived"];

function SelectionPopoverDoc() {
  const code = Route.useLoaderData();
  const [checked, setChecked] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = BASE.filter((label) => label.toLowerCase().includes(search.toLowerCase()));

  return (
    <DocPage
      title="SelectionPopover"
      description="Single-select popover content — a header, optional search, and checkable rows."
      overview={
        <Differences from="SelectionPopover">
          <li>brutal styling reproduced 1:1 (yellow/30 hover, trailing ✓, header)</li>
          <li>
            option rows and Clear are built on Base UI&rsquo;s <code>Button</code> (the source used
            native buttons)
          </li>
          <li>
            presentational — place it inside a base-ui <code>Popover.Positioner</code>; the search
            box reuses the brutal field skin
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <CodeBlock html={code.anatomy} />
      </DocSection>

      <DocSection id="basic" title="Basic">
        <Example html={code.anatomy}>
          <SelectionPopover
            className="relative w-56 border-2 border-black bg-white shadow-[var(--shadow-hover)]"
            title="Filter"
            options={BASE.map((label) => ({
              key: label,
              label,
              checked: checked === label,
              onClick: () => setChecked(label),
            }))}
          />
        </Example>
      </DocSection>

      <DocSection id="searchable" title="Searchable">
        <div className="space-y-4">
          <Example html={code.searchable}>
            <SelectionPopover
              searchable
              search={search}
              onSearchChange={setSearch}
              className="relative w-56 border-2 border-black bg-white shadow-[var(--shadow-hover)]"
              title="Channels"
              options={filtered.map((label) => ({
                key: label,
                label,
                checked: checked === label,
                onClick: () => setChecked(label),
              }))}
            />
          </Example>
          <Callout>
            The original had no portal or effects — it&rsquo;s caller-positioned. Wrap it in a
            base-ui Popover for open/close, focus, and dismiss.
          </Callout>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
