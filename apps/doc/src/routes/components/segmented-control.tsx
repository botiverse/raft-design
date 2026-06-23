import { createFileRoute } from "@tanstack/react-router";
import { Columns3 as LucideColumns3, LayoutList as LucideLayoutList } from "lucide-react";
import { useState } from "react";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SegmentedControlDisabledComposition } from "#/compositions/segmented-control/disabled-composition.tsx";
import segmentedControlDisabledCompositionSource from "#/compositions/segmented-control/disabled-composition.tsx?raw";
import { SegmentedControlFiltersComposition } from "#/compositions/segmented-control/filters-composition.tsx";
import segmentedControlFiltersCompositionSource from "#/compositions/segmented-control/filters-composition.tsx?raw";
import { SegmentedControlTimeFormatComposition } from "#/compositions/segmented-control/time-format-composition.tsx";
import segmentedControlTimeFormatCompositionSource from "#/compositions/segmented-control/time-format-composition.tsx?raw";
import { SegmentedControlViewModeComposition } from "#/compositions/segmented-control/view-mode-composition.tsx";
import segmentedControlViewModeCompositionSource from "#/compositions/segmented-control/view-mode-composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";
import LegacySegmentedControl from "../../../../../packages/ui/src/legacy/SegmentedControl.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  anatomy: `import {
  SegmentedControl,
  SegmentedControlCount,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "@raft/ui";

<SegmentedControl
  ariaLabel="Filter messages"
  value={value}
  onValueChange={setValue}
>
  <SegmentedControlItem value="all">
    <SegmentedControlLabel>All</SegmentedControlLabel>
    <SegmentedControlCount>12</SegmentedControlCount>
  </SegmentedControlItem>
  <SegmentedControlItem value="unread">
    <SegmentedControlLabel>Unread</SegmentedControlLabel>
    <SegmentedControlCount>3</SegmentedControlCount>
  </SegmentedControlItem>
</SegmentedControl>`,
  filters: `<SegmentedControl
  ariaLabel="Filter messages"
  value={filter}
  onValueChange={setFilter}
>
  <SegmentedControlItem value="all">
    <Inbox />
    <SegmentedControlLabel>All</SegmentedControlLabel>
    <SegmentedControlCount>12</SegmentedControlCount>
  </SegmentedControlItem>
  <SegmentedControlItem value="unread">
    <SegmentedControlLabel>Unread</SegmentedControlLabel>
    <SegmentedControlCount>3</SegmentedControlCount>
  </SegmentedControlItem>
  <SegmentedControlItem value="mentions">
    <AtSign />
    <SegmentedControlLabel>Mentions</SegmentedControlLabel>
  </SegmentedControlItem>
</SegmentedControl>`,
  viewMode: `<SegmentedControl
  ariaLabel="Task view"
  value={view}
  onValueChange={setView}
>
  <SegmentedControlItem value="board">
    <IconGridLayoutCols3Outline18 />
    <SegmentedControlLabel>Board</SegmentedControlLabel>
  </SegmentedControlItem>
  <SegmentedControlItem value="list">
    <IconBulletListOutline18 />
    <SegmentedControlLabel>List</SegmentedControlLabel>
  </SegmentedControlItem>
</SegmentedControl>`,
  preferences: `<SegmentedControl
  ariaLabel="Time format"
  value={timeFormat}
  onValueChange={setTimeFormat}
>
  <SegmentedControlItem value="12h">
    <SegmentedControlLabel>12h</SegmentedControlLabel>
  </SegmentedControlItem>
  <SegmentedControlItem value="24h">
    <SegmentedControlLabel>24h</SegmentedControlLabel>
  </SegmentedControlItem>
</SegmentedControl>`,
  disabled: `<SegmentedControl
  disabled
  ariaLabel="Translation mode"
  value="translated"
  onValueChange={() => {}}
>
  <SegmentedControlItem value="translated">
    <Languages />
    <SegmentedControlLabel>Translated</SegmentedControlLabel>
  </SegmentedControlItem>
  <SegmentedControlItem value="original">
    <SegmentedControlLabel>Original</SegmentedControlLabel>
  </SegmentedControlItem>
</SegmentedControl>`,
  sourceFilters: `<SegmentedControl
  ariaLabel="Filter messages"
  value="all"
  onChange={setValue}
  options={[
    { value: "all", label: "All", count: 12 },
    { value: "unread", label: "Unread", count: 3 },
    { value: "mentions", label: "Mentions" },
  ]}
/>`,
  sourceViewMode: `<SegmentedControl
  ariaLabel="Task view"
  value="board"
  onChange={setValue}
  options={[
    { value: "board", label: "Board", icon: <Columns3 size={12} /> },
    { value: "list", label: "List", icon: <LayoutList size={12} /> },
  ]}
/>`,
  sourcePreferences: `<SegmentedControl
  ariaLabel="Time format"
  value="24h"
  onChange={setValue}
  options={[
    { value: "12h", label: "12h" },
    { value: "24h", label: "24h" },
  ]}
/>`,
  sourceDisabled: `<SegmentedControl
  disabled
  value="translated"
  onChange={() => {}}
  options={[
    { value: "translated", label: "Translated" },
    { value: "original", label: "Original" },
  ]}
/>`,
} as const;

const SEGMENTED_CONTROL_COMPOSITION_PATHS = {
  disabled: "apps/doc/src/compositions/segmented-control/disabled-composition.tsx",
  filters: "apps/doc/src/compositions/segmented-control/filters-composition.tsx",
  timeFormat: "apps/doc/src/compositions/segmented-control/time-format-composition.tsx",
  viewMode: "apps/doc/src/compositions/segmented-control/view-mode-composition.tsx",
} as const;

const SEGMENTED_CONTROL_COMPOSITION_SOURCES = {
  disabled: segmentedControlDisabledCompositionSource,
  filters: segmentedControlFiltersCompositionSource,
  timeFormat: segmentedControlTimeFormatCompositionSource,
  viewMode: segmentedControlViewModeCompositionSource,
} as const;

const PROPS: readonly PropRow[] = [
  { name: "value", type: "T", description: "The controlled selected item value." },
  {
    name: "defaultValue",
    type: "T",
    description: "The initial selected value for uncontrolled use.",
  },
  {
    name: "onValueChange",
    type: "(value: T) => void",
    description: "Called when a segment is selected.",
  },
  { name: "ariaLabel", type: "string", description: "Accessible label for the radiogroup." },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Disables and dims the whole control.",
  },
  {
    name: "name",
    type: "string",
    description: "Native form field name passed to Base UI RadioGroup.",
  },
  { name: "className", type: "string", description: "Additional classes on the group." },
];

export const Route = createFileRoute("/components/segmented-control")({
  component: SegmentedControlDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        disabledComposition: SEGMENTED_CONTROL_COMPOSITION_SOURCES.disabled,
        filtersComposition: SEGMENTED_CONTROL_COMPOSITION_SOURCES.filters,
        timeFormatComposition: SEGMENTED_CONTROL_COMPOSITION_SOURCES.timeFormat,
        viewModeComposition: SEGMENTED_CONTROL_COMPOSITION_SOURCES.viewMode,
      },
    }),
});

const FILTER_OPTIONS = [
  { value: "all", label: "All", count: 12 },
  { value: "unread", label: "Unread", count: 3 },
  { value: "mentions", label: "Mentions" },
] as const;

function SegmentedControlDoc() {
  const code = Route.useLoaderData();
  const composition = (key: keyof typeof SEGMENTED_CONTROL_COMPOSITION_SOURCES) => {
    const snippetId = `${key}Composition` as const;

    return {
      compositionCode: code[snippetId],
      compositionCollapsedCode: code[`${snippetId}Body`],
      compositionPath: SEGMENTED_CONTROL_COMPOSITION_PATHS[key],
      compositionSource: SEGMENTED_CONTROL_COMPOSITION_SOURCES[key],
    };
  };
  const [filter, setFilter] = useState<string>("all");
  const [view, setView] = useState<string>("board");
  const [timeFormat, setTimeFormat] = useState<string>("24h");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [brutalFilter, setBrutalFilter] = useState<string>("all");
  const [elegantFilter, setElegantFilter] = useState<string>("all");
  const [elegantDarkFilter, setElegantDarkFilter] = useState<string>("all");
  const [sourceView, setSourceView] = useState<string>("board");
  const [brutalView, setBrutalView] = useState<string>("board");
  const [elegantView, setElegantView] = useState<string>("board");
  const [elegantDarkView, setElegantDarkView] = useState<string>("board");
  const [sourceTime, setSourceTime] = useState<string>("24h");
  const [brutalTime, setBrutalTime] = useState<string>("24h");
  const [elegantTime, setElegantTime] = useState<string>("24h");
  const [elegantDarkTime, setElegantDarkTime] = useState<string>("24h");

  return (
    <DocPage
      title="SegmentedControl"
      description="A compact single-choice control for filters, view modes, and persistent preference choices."
      overview={
        <Differences from="source SegmentedControl">
          <li>keeps the source radiogroup semantics instead of modeling the control as tabs</li>
          <li>
            replaces the source <code>options</code> array with explicit item composition for icons,
            counts, and labels
          </li>
          <li>
            brutal preserves the source bordered yellow segment; elegant adds a quiet inset rail
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview">
        <Example html={code.filters}>
          <SegmentedControlFiltersComposition value={filter} onValueChange={setFilter} />
        </Example>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="SegmentedControl.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="grid gap-10">
          <section className="grid gap-3">
            <h3 className="text-sm font-medium text-foreground-strong">Filters with counts</h3>
            <Example html={code.filters}>
              <SegmentedControlFiltersComposition value={filter} onValueChange={setFilter} />
            </Example>
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-medium text-foreground-strong">View mode</h3>
            <Example html={code.viewMode}>
              <SegmentedControlViewModeComposition value={view} onValueChange={setView} />
            </Example>
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-medium text-foreground-strong">Preference choice</h3>
            <Example html={code.preferences}>
              <SegmentedControlTimeFormatComposition
                value={timeFormat}
                onValueChange={setTimeFormat}
              />
            </Example>
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-medium text-foreground-strong">Disabled state</h3>
            <Example html={code.disabled}>
              <SegmentedControlDisabledComposition />
            </Example>
          </section>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Filters with counts",
              status: "match",
              note: "Used by inbox and task filters. The migration keeps visible counts and compact wrapping, while moving each segment into explicit children.",
              source: (
                <LegacySegmentedControl
                  ariaLabel="Filter messages"
                  value={sourceFilter}
                  onChange={setSourceFilter}
                  options={FILTER_OPTIONS.map((option) => ({ ...option }))}
                />
              ),
              brutal: (
                <SegmentedControlFiltersComposition
                  value={brutalFilter}
                  onValueChange={setBrutalFilter}
                />
              ),
              elegant: (
                <SegmentedControlFiltersComposition
                  value={elegantFilter}
                  onValueChange={setElegantFilter}
                />
              ),
              elegantDark: (
                <SegmentedControlFiltersComposition
                  value={elegantDarkFilter}
                  onValueChange={setElegantDarkFilter}
                />
              ),
              ...composition("filters"),
            },
            {
              label: "View mode",
              status: "match",
              note: "Used by task board/list controls. Icons remain part of the segment label, not separate icon buttons.",
              source: (
                <LegacySegmentedControl
                  ariaLabel="Task view"
                  value={sourceView}
                  onChange={setSourceView}
                  options={[
                    { value: "board", label: "Board", icon: <LucideColumns3 size={12} /> },
                    { value: "list", label: "List", icon: <LucideLayoutList size={12} /> },
                  ]}
                />
              ),
              brutal: (
                <SegmentedControlViewModeComposition
                  value={brutalView}
                  onValueChange={setBrutalView}
                />
              ),
              elegant: (
                <SegmentedControlViewModeComposition
                  value={elegantView}
                  onValueChange={setElegantView}
                />
              ),
              elegantDark: (
                <SegmentedControlViewModeComposition
                  value={elegantDarkView}
                  onValueChange={setElegantDarkView}
                />
              ),
              ...composition("viewMode"),
            },
            {
              label: "Persistent preference",
              status: "match",
              note: "Used by settings such as translated/original and 12h/24h. SegmentedControl is for immediate persistent choice changes, not deferred form submission.",
              source: (
                <LegacySegmentedControl
                  ariaLabel="Time format"
                  value={sourceTime}
                  onChange={setSourceTime}
                  options={[
                    { value: "12h", label: "12h" },
                    { value: "24h", label: "24h" },
                  ]}
                />
              ),
              brutal: (
                <SegmentedControlTimeFormatComposition
                  value={brutalTime}
                  onValueChange={setBrutalTime}
                />
              ),
              elegant: (
                <SegmentedControlTimeFormatComposition
                  value={elegantTime}
                  onValueChange={setElegantTime}
                />
              ),
              elegantDark: (
                <SegmentedControlTimeFormatComposition
                  value={elegantDarkTime}
                  onValueChange={setElegantDarkTime}
                />
              ),
              ...composition("timeFormat"),
            },
            {
              label: "Disabled",
              status: "match",
              note: "Disabled remains group-owned so every segment dims and ignores interaction together.",
              source: (
                <LegacySegmentedControl
                  disabled
                  value="translated"
                  onChange={() => {}}
                  options={[
                    { value: "translated", label: "Translated" },
                    { value: "original", label: "Original" },
                  ]}
                />
              ),
              brutal: <SegmentedControlDisabledComposition />,
              elegant: <SegmentedControlDisabledComposition />,
              elegantDark: <SegmentedControlDisabledComposition />,
              ...composition("disabled"),
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
