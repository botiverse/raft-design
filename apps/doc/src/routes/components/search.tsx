import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { Preview } from "#/components/preview.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SearchDisabledSortComposition } from "#/modules/search/compositions/search-disabled-sort.composition.tsx";
import searchDisabledSortCompositionSource from "#/modules/search/compositions/search-disabled-sort.composition.tsx?raw";
import { SearchErrorComposition } from "#/modules/search/compositions/search-error.composition.tsx";
import searchErrorCompositionSource from "#/modules/search/compositions/search-error.composition.tsx?raw";
import { SearchFilterOnlyEmptyComposition } from "#/modules/search/compositions/search-filter-only-empty.composition.tsx";
import searchFilterOnlyEmptyCompositionSource from "#/modules/search/compositions/search-filter-only-empty.composition.tsx?raw";
import { SearchLoadingComposition } from "#/modules/search/compositions/search-loading.composition.tsx";
import searchLoadingCompositionSource from "#/modules/search/compositions/search-loading.composition.tsx?raw";
import { SearchNoIntentComposition } from "#/modules/search/compositions/search-no-intent.composition.tsx";
import searchNoIntentCompositionSource from "#/modules/search/compositions/search-no-intent.composition.tsx?raw";
import { SearchNoResultsComposition } from "#/modules/search/compositions/search-no-results.composition.tsx";
import searchNoResultsCompositionSource from "#/modules/search/compositions/search-no-results.composition.tsx?raw";
import { BrutalSearchPanelComposition } from "#/modules/search/compositions/brutal-search-panel.composition.tsx";
import searchPanelCompositionSource from "#/modules/search/compositions/brutal-search-panel.composition.tsx?raw";
import { SearchPopupNoMatchesComposition } from "#/modules/search/compositions/search-popup-no-matches.composition.tsx";
import searchPopupNoMatchesCompositionSource from "#/modules/search/compositions/search-popup-no-matches.composition.tsx?raw";
import { SearchSelectedComposition } from "#/modules/search/compositions/search-selected.composition.tsx";
import searchSelectedCompositionSource from "#/modules/search/compositions/search-selected.composition.tsx?raw";
import { SearchComparisonPreviewFrame } from "#/modules/search/source-comparison/search-comparison-preview-frame.tsx";
import { SearchSourcePreview } from "#/modules/search/source-comparison/search-source-preview.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";
import sourceSearchPage from "../../../../../packages/ui/source/search/MessageSearchPage.tsx?raw";

const TOC = [
  { id: "source-comparison", title: "Source comparison" },
  { id: "states", title: "Search states" },
  { id: "ownership", title: "Ownership" },
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
  { label: "No search intent", preview: <SearchNoIntentComposition />, code: "noIntent" },
  { label: "Loading", preview: <SearchLoadingComposition />, code: "loading" },
  { label: "No query matches", preview: <SearchNoResultsComposition />, code: "noResults" },
  {
    label: "Filter-only empty",
    preview: <SearchFilterOnlyEmptyComposition />,
    code: "filterOnlyEmpty",
  },
  { label: "Request error and retry", preview: <SearchErrorComposition />, code: "error" },
  { label: "Selected result", preview: <SearchSelectedComposition />, code: "selected" },
  { label: "Disabled sort", preview: <SearchDisabledSortComposition />, code: "disabledSort" },
  {
    label: "Filter popup with no matches",
    preview: <SearchPopupNoMatchesComposition />,
    code: "popupNoMatches",
  },
] as const;

export const Route = createFileRoute("/components/search")({
  component: SearchDoc,
  loader: () =>
    highlightSnippets({
      data: {
        composition: searchPanelCompositionSource,
        source: sourceSearchPage,
        noIntent: searchNoIntentCompositionSource,
        loading: searchLoadingCompositionSource,
        noResults: searchNoResultsCompositionSource,
        filterOnlyEmpty: searchFilterOnlyEmptyCompositionSource,
        error: searchErrorCompositionSource,
        selected: searchSelectedCompositionSource,
        disabledSort: searchDisabledSortCompositionSource,
        popupNoMatches: searchPopupNoMatchesCompositionSource,
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
            preserves the source header, filters, popovers, result cards, message hits, and thread
            groups without restyling them through generic recipes
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
              note: "The independent frozen source renderer and Brutal composition preserve the source DOM and class contract while keeping the current raft-ui fonts. The docs fixture ranker covers exact, prefix, token-prefix, and substring ordering; product pinyin and fuzzy ranking stay in the source app.",
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
              sourceCode: code.source,
              brutalCode: code.composition,
              compositionCode: code.composition,
              compositionCollapsedCode: code.compositionBody,
              compositionPath:
                "apps/doc/src/modules/search/compositions/brutal-search-panel.composition.tsx",
              compositionSource: searchPanelCompositionSource,
              previewClassName: "items-stretch p-0",
            },
          ]}
        />
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
                <Preview.Code
                  html={code[example.code]}
                  collapsedHtml={code[`${example.code}Body`]}
                />
              </Preview>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="ownership" title="Ownership">
        <div className="prose prose-sm max-w-none text-foreground-muted">
          <p>
            This module is the executable Brutal product composition. Module-private parts preserve
            the source DOM and classes while the composition owns deterministic search filtering and
            visible business structure.
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
