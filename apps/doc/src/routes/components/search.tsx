import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SearchDisabledSortComposition } from "#/modules/search/compositions/search-disabled-sort.composition.tsx";
import { SearchErrorComposition } from "#/modules/search/compositions/search-error.composition.tsx";
import { SearchFilterOnlyEmptyComposition } from "#/modules/search/compositions/search-filter-only-empty.composition.tsx";
import { SearchLoadingComposition } from "#/modules/search/compositions/search-loading.composition.tsx";
import { SearchNoIntentComposition } from "#/modules/search/compositions/search-no-intent.composition.tsx";
import { SearchNoResultsComposition } from "#/modules/search/compositions/search-no-results.composition.tsx";
import { BrutalSearchPanelComposition } from "#/modules/search/compositions/brutal-search-panel.composition.tsx";
import searchPanelCompositionSource from "#/modules/search/compositions/brutal-search-panel.composition.tsx?raw";
import { SearchPopupNoMatchesComposition } from "#/modules/search/compositions/search-popup-no-matches.composition.tsx";
import { SearchSelectedComposition } from "#/modules/search/compositions/search-selected.composition.tsx";
import searchPanelFiltersSource from "#/modules/search/search-panel/search-panel.filters.tsx?raw";
import searchPanelPartsSource from "#/modules/search/search-panel/search-panel.parts.tsx?raw";
import searchPanelResultsSource from "#/modules/search/search-panel/search-panel.results.tsx?raw";
import { SearchComparisonPreviewFrame } from "#/modules/search/source-comparison/search-comparison-preview-frame.tsx";
import { SearchSourcePreview } from "#/modules/search/source-comparison/search-source-preview.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "source-comparison", title: "Source comparison" },
  { id: "states", title: "Search states" },
  { id: "api", title: "API" },
  { id: "ownership", title: "Ownership" },
] as const;

const SEARCH_COMPOSITION_PATH =
  "apps/doc/src/modules/search/compositions/brutal-search-panel.composition.tsx";
const SEARCH_PARTS_PATH = "apps/doc/src/modules/search/search-panel/search-panel.parts.tsx";
const SEARCH_FILTERS_PATH = "apps/doc/src/modules/search/search-panel/search-panel.filters.tsx";
const SEARCH_RESULTS_PATH = "apps/doc/src/modules/search/search-panel/search-panel.results.tsx";

const SEARCH_RESULT_PART_ROWS: readonly PropRow[] = [
  {
    name: "SearchResultsSummary",
    type: "SearchResultsSummaryProps",
    description: "Compact summary line for the result count or current search progress.",
  },
  {
    name: "SearchResultsSection",
    type: "SearchResultsSectionProps",
    description: "Groups one result family, such as server entities or message results.",
  },
  {
    name: "SearchResultsSectionHeading",
    type: "SearchResultsSectionHeadingProps",
    description: "Visual heading for a result section; the consumer supplies its label.",
  },
  {
    name: "SearchResultsList",
    type: "SearchResultsListProps",
    description: "Vertical list layout shared by entity, message, and thread result rows.",
  },
  {
    name: "SearchEntityResult",
    type: "SearchEntityResultProps",
    description:
      "Entity result frame with an optional selected state; the consumer composes its identity and metadata.",
  },
  {
    name: "SearchEntityResultOpen",
    type: "SearchEntityResultOpenProps",
    description: "Interactive button surface inside an entity result frame.",
  },
  {
    name: "SearchMessageResult",
    type: "SearchMessageResultProps",
    description: "Standalone interactive message result with an optional selected state.",
  },
  {
    name: "SearchThreadMessageResult",
    type: "SearchThreadMessageResultProps",
    description:
      "Nested interactive message row with the spacing and borders used inside a thread result.",
  },
  {
    name: "SearchThreadResult",
    type: "SearchThreadResultProps",
    description: "Thread result frame with an optional selected state.",
  },
  {
    name: "SearchThreadResultHeader",
    type: "SearchThreadResultHeaderProps",
    description: "Header region for caller-owned thread title and message-count content.",
  },
  {
    name: "SearchThreadResultMessages",
    type: "SearchThreadResultMessagesProps",
    description: "Stacking region for nested SearchThreadMessageResult rows.",
  },
  {
    name: "SearchResultsEmpty",
    type: "SearchResultsEmptyProps",
    description: "Centered layout for caller-owned no-intent and no-results content.",
  },
  {
    name: "SearchResultsError",
    type: "SearchResultsErrorProps",
    description: "Framed layout for caller-owned search failure content and recovery actions.",
  },
];

const SOURCE_SCENES = [
  {
    label: "Slock Search",
    scenes: [
      {
        label: "MessageSearchPage.tsx",
        path: "packages/ui/source/search/MessageSearchPage.tsx",
      },
      {
        label: "searchEntities.ts",
        path: "packages/ui/source/search/searchEntities.ts",
      },
      {
        label: "searchGrouping.ts",
        path: "packages/ui/source/search/searchGrouping.ts",
      },
    ],
  },
] as const;

const STATE_EXAMPLES = [
  { label: "No search intent", preview: <SearchNoIntentComposition /> },
  { label: "Loading", preview: <SearchLoadingComposition /> },
  { label: "No query matches", preview: <SearchNoResultsComposition /> },
  {
    label: "Filter-only empty",
    preview: <SearchFilterOnlyEmptyComposition />,
  },
  { label: "Request error and retry", preview: <SearchErrorComposition /> },
  { label: "Selected result", preview: <SearchSelectedComposition /> },
  { label: "Disabled sort", preview: <SearchDisabledSortComposition /> },
  {
    label: "Filter popup with no matches",
    preview: <SearchPopupNoMatchesComposition />,
  },
] as const;

export const Route = createFileRoute("/components/search")({
  component: SearchDoc,
  loader: () =>
    highlightSnippets({
      data: {
        composition: searchPanelCompositionSource,
        parts: searchPanelPartsSource,
        filters: searchPanelFiltersSource,
        results: searchPanelResultsSource,
      },
    }),
});

function SearchDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Search"
      description="Source-structured global search composition for the Brutal theme family."
      overview={
        <ul className="list-disc space-y-1 pl-4">
          <li>
            maps the source header, filters, result cards, message hits, and thread groups onto
            canonical raft-ui primitives and the Search result family
          </li>
          <li>
            keeps URL state, API requests, caches, routing, and workspace drag behavior in the
            consumer
          </li>
        </ul>
      }
      toc={TOC}
    >
      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          previewSize="tall"
          items={[
            {
              label: "Global Search panel",
              status: "difference",
              note: "The independent frozen source renderer and Brutal composition keep the source visual hierarchy while using canonical raft-ui behavior primitives and the current raft-ui fonts. The docs fixture ranker covers exact, prefix, token-prefix, and substring ordering; product pinyin and fuzzy ranking stay in the source app.",
              sourceScenes: SOURCE_SCENES,
              source: <SearchSourcePreview />,
              brutal: (
                <SearchComparisonPreviewFrame>
                  <BrutalSearchPanelComposition
                    defaultQuery="preview"
                    onBack={() => window.history.back()}
                  />
                </SearchComparisonPreviewFrame>
              ),
              previewClassName: "items-stretch p-0",
            },
          ]}
        />
        <SearchSourceFiles code={code} />
      </DocSection>

      <DocSection id="states" title="Search states">
        <div className="grid gap-8">
          {STATE_EXAMPLES.map((example) => (
            <div key={example.label} className="grid gap-3">
              <h3 className="text-sm font-medium text-foreground-strong">{example.label}</h3>
              <Preview
                previewClassName="h-[42rem] items-stretch overflow-hidden p-0"
                previewInset="flush"
                previewTheme="brutal"
              >
                <Preview.Canvas>{example.preview}</Preview.Canvas>
              </Preview>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={SEARCH_RESULT_PART_ROWS} nameColumnLabel="Export" />
      </DocSection>

      <DocSection id="ownership" title="Ownership">
        <div className="prose prose-sm max-w-none text-foreground-muted">
          <p>
            This module is the executable Brutal product composition. Packages own generic panel,
            selection, and Search result-family parts; the composition owns deterministic search
            filtering and visible business structure.
          </p>
          <p>
            Production consumers remain responsible for URL search params, server requests,
            permissions, result navigation, detail panes, caching, pagination policy, and the source
            app&apos;s shared pinyin/fuzzy ranker.
          </p>
        </div>
      </DocSection>
    </DocPage>
  );
}

/** Canonical composition plus the panel helpers and raft-ui result parts it renders. */
function SearchSourceFiles({ code }: { code: Record<string, string> }) {
  return (
    <DocsCodeBlock.Files
      showLineNumbers={false}
      files={[
        {
          path: SEARCH_COMPOSITION_PATH,
          source: searchPanelCompositionSource,
          html: code.composition,
          collapsedHtml: code.compositionBody,
        },
        {
          path: SEARCH_PARTS_PATH,
          source: searchPanelPartsSource,
          html: code.parts,
          collapsedHtml: code.partsBody,
        },
        {
          path: SEARCH_FILTERS_PATH,
          source: searchPanelFiltersSource,
          html: code.filters,
          collapsedHtml: code.filtersBody,
        },
        {
          path: SEARCH_RESULTS_PATH,
          source: searchPanelResultsSource,
          html: code.results,
          collapsedHtml: code.resultsBody,
        },
      ]}
    />
  );
}
