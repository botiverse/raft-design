import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
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
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SEARCH_COMPOSITION_PATH =
  "apps/doc/src/modules/search/compositions/brutal-search-panel.composition.tsx";
const SEARCH_PARTS_PATH = "apps/doc/src/modules/search/search-panel/search-panel.parts.tsx";
const SEARCH_FILTERS_PATH = "apps/doc/src/modules/search/search-panel/search-panel.filters.tsx";
const SEARCH_RESULTS_PATH = "apps/doc/src/modules/search/search-panel/search-panel.results.tsx";

const SNIPPETS = {
  anatomy: `<SearchResultsSummary />

<SearchResultsSection>
  <SearchResultsSectionHeading />
  <SearchResultsList>
    <SearchEntityResult>
      <SearchEntityResultOpen />
      {/* caller-owned trailing content */}
    </SearchEntityResult>

    <SearchMessageResult>
      <SearchMessageResultHeader />
      <SearchMessageResultBody />
    </SearchMessageResult>

    <SearchThreadResult>
      <SearchThreadResultHeader />
      <SearchThreadResultMessages>
        <SearchThreadMessageResult />
      </SearchThreadResultMessages>
    </SearchThreadResult>
  </SearchResultsList>
</SearchResultsSection>

{/* consumer-chosen result states */}
<EmptyState>
  <EmptyStateContent>
    <EmptyStateIcon />
    <EmptyStateTitle />
    <EmptyStateDescription />
  </EmptyStateContent>
</EmptyState>
<SearchResultsError />`,
  composition: searchPanelCompositionSource,
  parts: searchPanelPartsSource,
  filters: searchPanelFiltersSource,
  results: searchPanelResultsSource,
} as const;

const SEARCH_RESULTS_SUMMARY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Compact summary line for the result count or current search progress.",
  },
];

const SEARCH_RESULTS_SECTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Groups one result family, such as server entities or message results.",
  },
];

const SEARCH_RESULTS_SECTION_HEADING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Visual heading for a result section; the consumer supplies its label.",
  },
];

const SEARCH_RESULTS_LIST_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Vertical list layout shared by entity, message, and thread result rows.",
  },
];

const SEARCH_ENTITY_RESULT_PROPS: readonly PropRow[] = [
  {
    name: "selected",
    type: "boolean",
    description: "Applies the selected border and shadow treatment via data-selected.",
  },
  {
    name: "...props",
    type: "div props",
    description: "Entity result frame; the consumer composes its identity and metadata.",
  },
];

const SEARCH_ENTITY_RESULT_OPEN_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "button props",
    description: "Interactive button surface inside an entity result frame.",
  },
];

const SEARCH_MESSAGE_RESULT_PROPS: readonly PropRow[] = [
  {
    name: "selected",
    type: "boolean",
    description: "Applies the selected border and shadow treatment via data-selected.",
  },
  {
    name: "...props",
    type: "button props",
    description: "Standalone interactive message result row.",
  },
];

const SEARCH_MESSAGE_RESULT_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Meta row for caller-owned channel, sender, and timestamp content.",
  },
];

const SEARCH_MESSAGE_RESULT_BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Content region holding the matched message text.",
  },
];

const SEARCH_THREAD_MESSAGE_RESULT_PROPS: readonly PropRow[] = [
  {
    name: "selected",
    type: "boolean",
    description: "Applies the nested selected treatment via data-selected.",
  },
  {
    name: "...props",
    type: "button props",
    description:
      "Nested interactive message row with the spacing and borders used inside a thread result.",
  },
];

const SEARCH_THREAD_RESULT_PROPS: readonly PropRow[] = [
  {
    name: "selected",
    type: "boolean",
    description: "Applies the selected border and shadow treatment via data-selected.",
  },
  {
    name: "...props",
    type: "div props",
    description: "Thread result frame around the header and nested message rows.",
  },
];

const SEARCH_THREAD_RESULT_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Header region for caller-owned thread title and message-count content.",
  },
];

const SEARCH_THREAD_RESULT_MESSAGES_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Stacking region for nested SearchThreadMessageResult rows.",
  },
];

const SEARCH_RESULTS_ERROR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Framed layout for caller-owned search failure content and recovery actions.",
  },
];

const API_SUBSECTIONS = [
  { id: "api-summary", title: "SearchResultsSummary", rows: SEARCH_RESULTS_SUMMARY_PROPS },
  { id: "api-section", title: "SearchResultsSection", rows: SEARCH_RESULTS_SECTION_PROPS },
  {
    id: "api-section-heading",
    title: "SearchResultsSectionHeading",
    rows: SEARCH_RESULTS_SECTION_HEADING_PROPS,
  },
  { id: "api-list", title: "SearchResultsList", rows: SEARCH_RESULTS_LIST_PROPS },
  { id: "api-entity", title: "SearchEntityResult", rows: SEARCH_ENTITY_RESULT_PROPS },
  {
    id: "api-entity-open",
    title: "SearchEntityResultOpen",
    rows: SEARCH_ENTITY_RESULT_OPEN_PROPS,
  },
  { id: "api-message", title: "SearchMessageResult", rows: SEARCH_MESSAGE_RESULT_PROPS },
  {
    id: "api-message-header",
    title: "SearchMessageResultHeader",
    rows: SEARCH_MESSAGE_RESULT_HEADER_PROPS,
  },
  {
    id: "api-message-body",
    title: "SearchMessageResultBody",
    rows: SEARCH_MESSAGE_RESULT_BODY_PROPS,
  },
  {
    id: "api-thread-message",
    title: "SearchThreadMessageResult",
    rows: SEARCH_THREAD_MESSAGE_RESULT_PROPS,
  },
  { id: "api-thread", title: "SearchThreadResult", rows: SEARCH_THREAD_RESULT_PROPS },
  {
    id: "api-thread-header",
    title: "SearchThreadResultHeader",
    rows: SEARCH_THREAD_RESULT_HEADER_PROPS,
  },
  {
    id: "api-thread-messages",
    title: "SearchThreadResultMessages",
    rows: SEARCH_THREAD_RESULT_MESSAGES_PROPS,
  },
  { id: "api-error", title: "SearchResultsError", rows: SEARCH_RESULTS_ERROR_PROPS },
] as const;

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
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function SearchPreview({ code }: { code: Record<string, string> }) {
  return (
    <Preview previewInset="flush" previewClassName="h-[42rem] items-stretch overflow-hidden p-0">
      <Preview.Canvas>
        <SearchComparisonPreviewFrame>
          <BrutalSearchPanelComposition
            defaultQuery="preview"
            onBack={() => window.history.back()}
          />
        </SearchComparisonPreviewFrame>
      </Preview.Canvas>
      <Preview.Code codeBlock={<SearchSourceFiles code={code} collapsible={false} />} />
    </Preview>
  );
}

function SearchDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Search"
      description="Search result card family; the surrounding panel shell is composed from the generic Panel container."
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
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <SearchPreview code={code} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <p>
          raft-ui owns the Search result family: the summary and section grouping vocabulary, the
          entity, message, and thread result cards, and the empty and error state frames. The panel
          shell around them — header, filter row, and results viewport — is assembled in the docs
          module from the generic Panel container and local panel parts. Production consumers remain
          responsible for URL search params, server requests, permissions, result navigation, detail
          panes, caching, pagination policy, and the source app&apos;s shared pinyin/fuzzy ranker.
        </p>
        <DocSubsection parentId="usage" id="states" title="States">
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
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          {API_SUBSECTIONS.map((subsection) => (
            <DocSubsection
              key={subsection.id}
              parentId="api"
              id={subsection.id}
              title={subsection.title}
            >
              <PropsTable rows={subsection.rows} />
            </DocSubsection>
          ))}
        </div>
      </DocSection>

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
              elegant: (
                <SearchComparisonPreviewFrame>
                  <BrutalSearchPanelComposition
                    defaultQuery="preview"
                    onBack={() => window.history.back()}
                  />
                </SearchComparisonPreviewFrame>
              ),
              elegantDark: (
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
    </DocPage>
  );
}

/** Canonical composition plus the panel helpers and raft-ui result parts it renders. */
function SearchSourceFiles({
  code,
  collapsible = true,
}: {
  code: Record<string, string>;
  collapsible?: boolean;
}) {
  return (
    <DocsCodeBlock.Files
      collapsible={collapsible}
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
