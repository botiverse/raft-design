import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SegmentedControlDisabledComposition } from "#/modules/segmented-control/compositions/disabled.composition.tsx";
import { SegmentedControlFiltersComposition } from "#/modules/segmented-control/compositions/filters.composition.tsx";
import { SegmentedControlSearchSortComposition } from "#/modules/segmented-control/compositions/search-sort.composition.tsx";
import { SegmentedControlTimeFormatComposition } from "#/modules/segmented-control/compositions/time-format.composition.tsx";
import { SegmentedControlViewModeComposition } from "#/modules/segmented-control/compositions/view-mode.composition.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `<SegmentedControl>
  <SegmentedControlItem>
    <SegmentedControlLabel />
    <SegmentedControlCount />
  </SegmentedControlItem>
</SegmentedControl>`,
  filters: `import { useState } from "react";
import { AtSign, Inbox } from "lucide-react";
import {
  SegmentedControl,
  SegmentedControlCount,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "raft-ui";

const [filter, setFilter] = useState("all");

<SegmentedControl
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
  value={searchSort}
  onValueChange={setSearchSort}
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
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview>
          <Preview.Canvas>
            <SegmentedControlFiltersExample />
          </Preview.Canvas>
          <Preview.Code html={code.filters} collapsedHtml={code.filtersBody} />
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
        <div className="grid gap-10">
          <DocNote>
            Segment items own icon sizing, label truncation, and count line-height. Compose plain
            icons, SegmentedControlLabel, and SegmentedControlCount unless a specific custom size is
            intentional.
          </DocNote>
          <DocSubsection parentId="usage" id="filters-with-counts" title="Filters with counts">
            <Preview>
              <Preview.Canvas>
                <SegmentedControlFiltersExample />
              </Preview.Canvas>
              <Preview.Code html={code.filters} collapsedHtml={code.filtersBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="view-mode" title="View mode">
            <Preview>
              <Preview.Canvas>
                <SegmentedControlViewModeExample />
              </Preview.Canvas>
              <Preview.Code html={code.viewMode} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="search-sort" title="Search sort">
            <Preview>
              <Preview.Canvas>
                <SegmentedControlSearchSortExample />
              </Preview.Canvas>
              <Preview.Code html={code.searchSort} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="preference-choice" title="Preference choice">
            <Preview>
              <Preview.Canvas>
                <SegmentedControlTimeFormatExample />
              </Preview.Canvas>
              <Preview.Code html={code.preferences} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="usage" id="disabled-state" title="Disabled state">
            <Preview>
              <Preview.Canvas>
                <SegmentedControlDisabledComposition />
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
