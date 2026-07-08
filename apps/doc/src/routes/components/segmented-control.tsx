import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Differences } from "#/components/differences.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SegmentedControlDisabledComposition } from "#/compositions/segmented-control/disabled-composition.tsx";
import { SegmentedControlFiltersComposition } from "#/compositions/segmented-control/filters-composition.tsx";
import { SegmentedControlSearchSortComposition } from "#/compositions/segmented-control/search-sort-composition.tsx";
import { SegmentedControlTimeFormatComposition } from "#/compositions/segmented-control/time-format-composition.tsx";
import { SegmentedControlViewModeComposition } from "#/compositions/segmented-control/view-mode-composition.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import {
  SegmentedControl,
  SegmentedControlCount,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "raft-ui";

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
    <Columns3 />
    <SegmentedControlLabel>Board</SegmentedControlLabel>
  </SegmentedControlItem>
  <SegmentedControlItem value="list">
    <List />
    <SegmentedControlLabel>List</SegmentedControlLabel>
  </SegmentedControlItem>
</SegmentedControl>`,
  searchSort: `<SegmentedControl
  ariaLabel="Sort search results"
  value={sort}
  onValueChange={setSort}
>
  <SegmentedControlItem value="relevance">
    <SegmentedControlLabel>Relevant</SegmentedControlLabel>
  </SegmentedControlItem>
  <SegmentedControlItem value="recent">
    <SegmentedControlLabel>Recent</SegmentedControlLabel>
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
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function SegmentedControlDoc() {
  const code = Route.useLoaderData();

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
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Example html={code.filters}>
          <SegmentedControlFiltersExample />
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
          <DocNote>
            Segment items own icon sizing, label truncation, and count line-height. Compose plain
            icons, SegmentedControlLabel, and SegmentedControlCount unless a specific custom size is
            intentional.
          </DocNote>
          <section className="grid gap-3">
            <h3 className="text-sm font-medium text-foreground-strong">Filters with counts</h3>
            <Example html={code.filters}>
              <SegmentedControlFiltersExample />
            </Example>
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-medium text-foreground-strong">View mode</h3>
            <Example html={code.viewMode}>
              <SegmentedControlViewModeExample />
            </Example>
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-medium text-foreground-strong">Search sort</h3>
            <Example html={code.searchSort}>
              <SegmentedControlSearchSortExample />
            </Example>
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-medium text-foreground-strong">Preference choice</h3>
            <Example html={code.preferences}>
              <SegmentedControlTimeFormatExample />
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
    </DocPage>
  );
}

function SegmentedControlFiltersExample() {
  const [filter, setFilter] = useState<string>("all");
  return <SegmentedControlFiltersComposition value={filter} onValueChange={setFilter} />;
}

function SegmentedControlViewModeExample() {
  const [view, setView] = useState<string>("board");
  return <SegmentedControlViewModeComposition value={view} onValueChange={setView} />;
}

function SegmentedControlSearchSortExample() {
  const [searchSort, setSearchSort] = useState<string>("relevance");
  return <SegmentedControlSearchSortComposition value={searchSort} onValueChange={setSearchSort} />;
}

function SegmentedControlTimeFormatExample() {
  const [timeFormat, setTimeFormat] = useState<string>("24h");
  return <SegmentedControlTimeFormatComposition value={timeFormat} onValueChange={setTimeFormat} />;
}
