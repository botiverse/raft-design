import { createFileRoute } from "@tanstack/react-router";
import { ToggleGroup, ToggleGroupCount, ToggleGroupItem, ToggleGroupLabel } from "raft-ui/wip";
import { useState } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import { ToggleGroup, ToggleGroupItem, ToggleGroupLabel } from "raft-ui/wip";

<ToggleGroup value="all" onValueChange={() => {}} ariaLabel="Filter">
  <ToggleGroupItem value="all">
    <ToggleGroupLabel />
  </ToggleGroupItem>
</ToggleGroup>`,
  counts: `<ToggleGroup
  ariaLabel="Filter"
  value={value}
  onValueChange={setValue}
>
  <ToggleGroupItem value="all">
    <ToggleGroupLabel>All</ToggleGroupLabel>
    <ToggleGroupCount>12</ToggleGroupCount>
  </ToggleGroupItem>
  <ToggleGroupItem value="unread">
    <ToggleGroupLabel>Unread</ToggleGroupLabel>
    <ToggleGroupCount>3</ToggleGroupCount>
  </ToggleGroupItem>
  <ToggleGroupItem value="mentions">
    <ToggleGroupLabel>Mentions</ToggleGroupLabel>
  </ToggleGroupItem>
</ToggleGroup>`,
  disabled: `<ToggleGroup disabled ariaLabel="Filter" value="all" onValueChange={() => {}}>
  <ToggleGroupItem value="all">
    <ToggleGroupLabel>All</ToggleGroupLabel>
  </ToggleGroupItem>
  <ToggleGroupItem value="unread">
    <ToggleGroupLabel>Unread</ToggleGroupLabel>
  </ToggleGroupItem>
</ToggleGroup>`,
} as const;

const PROPS: readonly PropRow[] = [
  { name: "value", type: "T", description: "The currently selected option value." },
  {
    name: "onValueChange",
    type: "(value: T) => void",
    description: "Called with the picked value.",
  },
  { name: "ariaLabel", type: "string", description: "Accessible label for the toggle group." },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Dims and disables all segments.",
  },
  { name: "className", type: "string", description: "Additional classes on the wrapper." },
];

export const Route = createFileRoute("/components/toggle-group")({
  component: ToggleGroupDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

const OPTIONS = [
  { value: "all", label: "All", count: 12 },
  { value: "unread", label: "Unread", count: 3 },
  { value: "mentions", label: "Mentions" },
] as const;

function ToggleGroupDoc() {
  const code = Route.useLoaderData();
  const [value, setValue] = useState<string>("all");

  return (
    <DocPage
      title="ToggleGroup"
      description="A controlled single-select toggle group rendered as a row of bordered segments."
      overview={<TodoList items={TODOS} />}
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <ToggleGroup ariaLabel="Filter" value={value} onValueChange={setValue}>
              {OPTIONS.map((option) => (
                <ToggleGroupItem key={option.value} value={option.value}>
                  <ToggleGroupLabel>{option.label}</ToggleGroupLabel>
                  {"count" in option && option.count > 0 ? (
                    <ToggleGroupCount>{option.count}</ToggleGroupCount>
                  ) : null}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Preview.Canvas>
          <Preview.Code html={code.counts} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-10">
          <DocSubsection parentId="usage" id="disabled" title="Disabled">
            <Preview>
              <Preview.Canvas>
                <ToggleGroup disabled ariaLabel="Filter" value="all" onValueChange={() => {}}>
                  <ToggleGroupItem value="all">
                    <ToggleGroupLabel>All</ToggleGroupLabel>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="unread">
                    <ToggleGroupLabel>Unread</ToggleGroupLabel>
                  </ToggleGroupItem>
                </ToggleGroup>
              </Preview.Canvas>
              <Preview.Code html={code.disabled} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
