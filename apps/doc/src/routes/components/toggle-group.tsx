import { createFileRoute } from "@tanstack/react-router";
import { ToggleGroup, ToggleGroupCount, ToggleGroupItem, ToggleGroupLabel } from "raft-ui/wip";
import { useState } from "react";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import {
  createCompositionSnippetMap,
  createCompositionSourceMap,
} from "#/lib/source-comparison-code.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";
import defaultCompositionSource from "#/modules/toggle-group/compositions/default.composition.tsx?raw";
import { ToggleGroupDefaultComposition } from "#/modules/toggle-group/compositions/default.composition.tsx";
import disabledCompositionSource from "#/modules/toggle-group/compositions/disabled.composition.tsx?raw";
import { ToggleGroupDisabledComposition } from "#/modules/toggle-group/compositions/disabled.composition.tsx";
import LegacySegmentedControl from "../../../../../packages/ui/src/legacy/SegmentedControl.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const TODOS = ["Add elegant family styling"] as const;

const SNIPPETS = {
  anatomy: `<ToggleGroup>
  <ToggleGroupItem>
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
  sourceDisabled: `<SegmentedControl
  disabled
  value="all"
  onChange={() => {}}
  options={[
    { value: "all", label: "All" },
    { value: "unread", label: "Unread" },
  ]}
/>`,
} as const;

const COMPOSITION_SOURCES = createCompositionSourceMap({
  Default: defaultCompositionSource,
  Disabled: disabledCompositionSource,
});

const COMPOSITION_SNIPPETS = createCompositionSnippetMap(COMPOSITION_SOURCES, {
  Default: "toggleGroupDefaultComposition",
  Disabled: "toggleGroupDisabledComposition",
});

const COMPOSITION_PATHS = {
  Default: "apps/doc/src/modules/toggle-group/compositions/default.composition.tsx",
  Disabled: "apps/doc/src/modules/toggle-group/compositions/disabled.composition.tsx",
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
  loader: () => highlightSnippets({ data: { ...SNIPPETS, ...COMPOSITION_SNIPPETS } }),
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

  return (
    <DocPage
      title="ToggleGroup"
      description="A controlled single-select toggle group rendered as a row of bordered segments."
      overview={
        <div className="grid gap-4">
          <Differences from="SegmentedControl">
            <li>brutal styling reproduced 1:1 (active yellow + shadow, yellow/30 hover)</li>
            <li>
              source <code>SegmentedControl</code> is renamed to Base UI terminology:{" "}
              <code>ToggleGroup</code> / <code>ToggleGroupItem</code> /{" "}
              <code>ToggleGroupLabel</code> / <code>ToggleGroupCount</code>
            </li>
          </Differences>
          <TodoList items={TODOS} />
        </div>
      }
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
              current: <ToggleGroupDefaultComposition />,
              sourceCode: code.sourceDefault,
              currentCode: code.toggleGroupDefaultComposition,
              compositionCode: code.toggleGroupDefaultComposition,
              compositionCollapsedCode: code.toggleGroupDefaultCompositionBody,
              compositionPath: COMPOSITION_PATHS.Default,
              compositionSource: COMPOSITION_SOURCES.Default,
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
              current: <ToggleGroupDisabledComposition />,
              sourceCode: code.sourceDisabled,
              currentCode: code.toggleGroupDisabledComposition,
              compositionCode: code.toggleGroupDisabledComposition,
              compositionPath: COMPOSITION_PATHS.Disabled,
              compositionSource: COMPOSITION_SOURCES.Disabled,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
