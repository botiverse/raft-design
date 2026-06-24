import { createFileRoute } from "@tanstack/react-router";
import { ToggleGroup, ToggleGroupCount, ToggleGroupItem, ToggleGroupLabel } from "raft-ui/wip";
import { useState } from "react";

import { CodeBlock } from "#/components/code-block.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacySegmentedControl from "../../../../../packages/ui/src/legacy/SegmentedControl.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "counts", title: "Counts" },
  { id: "disabled", title: "Disabled" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `import {
  ToggleGroupCount,
  ToggleGroupItem,
  ToggleGroupLabel,
  ToggleGroup,
} from "raft-ui";

<ToggleGroup
  ariaLabel="Filter"
  value={value}
  onValueChange={setValue}
>
  <ToggleGroupItem value="all">
    <ToggleGroupLabel>All</ToggleGroupLabel>
  </ToggleGroupItem>
  <ToggleGroupItem value="unread">
    <ToggleGroupLabel>Unread</ToggleGroupLabel>
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
</ToggleGroup>`,
  disabled: `<ToggleGroup disabled ariaLabel="Filter" value="all" onValueChange={() => {}}>
  <ToggleGroupItem value="all">
    <ToggleGroupLabel>All</ToggleGroupLabel>
  </ToggleGroupItem>
  <ToggleGroupItem value="unread">
    <ToggleGroupLabel>Unread</ToggleGroupLabel>
  </ToggleGroupItem>
</ToggleGroup>`,
  sourceDefault: `<SegmentedControl
  ariaLabel="Filter"
  value="all"
  onChange={setValue}
  options={[
    { value: "all", label: "All", count: 12 },
    { value: "unread", label: "Unread", count: 3 },
    { value: "mentions", label: "Mentions" },
  ]}
/>`,
  currentDefault: `<ToggleGroup
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
  sourceDisabled: `<SegmentedControl
  disabled
  value="all"
  onChange={() => {}}
  options={[
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
  ]}
/>`,
  currentDisabled: `<ToggleGroup
  disabled
  value="all"
  onValueChange={() => {}}
>
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
  const [sourceComparisonValue, setSourceComparisonValue] = useState<string>("all");
  const [currentComparisonValue, setCurrentComparisonValue] = useState<string>("all");

  return (
    <DocPage
      title="ToggleGroup"
      description="A controlled single-select toggle group rendered as a row of bordered segments."
      overview={
        <Differences from="SegmentedControl">
          <li>brutal styling reproduced 1:1 (active yellow + shadow, yellow/30 hover)</li>
          <li>
            source <code>SegmentedControl</code> is renamed to Base UI terminology:{" "}
            <code>ToggleGroup</code> / <code>ToggleGroupItem</code> / <code>ToggleGroupLabel</code>{" "}
            / <code>ToggleGroupCount</code>
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
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="ToggleGroup.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="counts" title="Counts">
        <CodeBlock html={code.counts} />
      </DocSection>

      <DocSection id="disabled" title="Disabled">
        <Example html={code.disabled}>
          <ToggleGroup disabled ariaLabel="Filter" value="all" onValueChange={() => {}}>
            <ToggleGroupItem value="all">
              <ToggleGroupLabel>All</ToggleGroupLabel>
            </ToggleGroupItem>
            <ToggleGroupItem value="unread">
              <ToggleGroupLabel>Unread</ToggleGroupLabel>
            </ToggleGroupItem>
          </ToggleGroup>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          items={[
            {
              label: "Default",
              status: "match",
              note: "Source uses the original SegmentedControl value/options/onChange API. Current uses ToggleGroup composition over Base UI ToggleGroup while preserving the same active yellow segment, shadow, counts, and hover visual.",
              source: (
                <LegacySegmentedControl
                  ariaLabel="Filter"
                  value={sourceComparisonValue}
                  onChange={setSourceComparisonValue}
                  options={OPTIONS.map((o) => ({ ...o }))}
                />
              ),
              current: (
                <ToggleGroup
                  ariaLabel="Filter"
                  value={currentComparisonValue}
                  onValueChange={setCurrentComparisonValue}
                >
                  {OPTIONS.map((option) => (
                    <ToggleGroupItem key={option.value} value={option.value}>
                      <ToggleGroupLabel>{option.label}</ToggleGroupLabel>
                      {"count" in option && option.count > 0 ? (
                        <ToggleGroupCount>{option.count}</ToggleGroupCount>
                      ) : null}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              ),
              sourceCode: code.sourceDefault,
              currentCode: code.currentDefault,
            },
            {
              label: "Disabled",
              status: "match",
              note: "Disabled keeps the source opacity and cursor behavior while Base UI disables the composed ToggleGroup.",
              source: (
                <LegacySegmentedControl
                  disabled
                  value="all"
                  onChange={() => {}}
                  options={[
                    { value: "all", label: "All" },
                    { value: "unread", label: "Unread" },
                  ]}
                />
              ),
              current: (
                <ToggleGroup disabled ariaLabel="Filter" value="all" onValueChange={() => {}}>
                  <ToggleGroupItem value="all">
                    <ToggleGroupLabel>All</ToggleGroupLabel>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="unread">
                    <ToggleGroupLabel>Unread</ToggleGroupLabel>
                  </ToggleGroupItem>
                </ToggleGroup>
              ),
              sourceCode: code.sourceDisabled,
              currentCode: code.currentDisabled,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
