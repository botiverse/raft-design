import { createFileRoute } from "@tanstack/react-router";
import { InlineCode } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { CompositionPreview } from "#/components/composition-preview.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SearchErrorComposition } from "#/modules/search/compositions/search-error.composition.tsx";
import searchErrorCompositionSource from "#/modules/search/compositions/search-error.composition.tsx?raw";
import { SearchLoadingComposition } from "#/modules/search/compositions/search-loading.composition.tsx";
import searchLoadingCompositionSource from "#/modules/search/compositions/search-loading.composition.tsx?raw";
import { SearchNoResultsComposition } from "#/modules/search/compositions/search-no-results.composition.tsx";
import searchNoResultsCompositionSource from "#/modules/search/compositions/search-no-results.composition.tsx?raw";
import { SearchPreviewComposition } from "#/modules/search/compositions/search-preview.composition.tsx";
import searchPreviewCompositionSource from "#/modules/search/compositions/search-preview.composition.tsx?raw";
import { SearchSelectedComposition } from "#/modules/search/compositions/search-selected.composition.tsx";
import searchSelectedCompositionSource from "#/modules/search/compositions/search-selected.composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;

const SEARCH_COMPOSITION_PATH =
  "apps/doc/src/modules/search/compositions/search-preview.composition.tsx";

const SNIPPETS = {
  shellAnatomy: `import {
  SearchShellContent,
  SearchShellFilters,
  SearchShellHeader,
  SearchShellResults,
  SearchShellResultsContent,
  SearchShellRoot,
} from "raft-ui/wip";

<SearchShellRoot>
  <SearchShellHeader>{/* search input */}</SearchShellHeader>
  <SearchShellContent>
    <SearchShellFilters>{/* filter controls */}</SearchShellFilters>
    <SearchShellResults>
      <SearchShellResultsContent>{/* result parts */}</SearchShellResultsContent>
    </SearchShellResults>
  </SearchShellContent>
</SearchShellRoot>`,
  resultAnatomy: `import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "raft-ui";
import {
  SearchEntityResult,
  SearchEntityResultAttentionBadge,
  SearchEntityResultBadge,
  SearchEntityResultDescription,
  SearchEntityResultLeading,
  SearchEntityResultOpen,
  SearchEntityResultTitle,
  SearchMessageResult,
  SearchMessageResultBadge,
  SearchMessageResultBody,
  SearchMessageResultHeader,
  SearchMessageResultMatch,
  SearchMessageResultMeta,
  SearchMessageResultSender,
  SearchMessageResultThreadMeta,
  SearchMessageResultTimestamp,
  SearchResultsError,
  SearchResultsErrorAction,
  SearchResultsErrorDescription,
  SearchResultsErrorTitle,
  SearchResultsList,
  SearchResultsSection,
  SearchResultsSectionHeading,
  SearchResultsSummary,
  SearchThreadMessageResult,
  SearchThreadResult,
  SearchThreadResultBadge,
  SearchThreadResultHeader,
  SearchThreadResultMeta,
  SearchThreadResultMessages,
  SearchThreadResultTimestamp,
  SearchThreadResultTitle,
} from "raft-ui/wip";

<SearchResultsSummary />

<SearchResultsSection>
  <SearchResultsSectionHeading />
  <SearchResultsList>
    <SearchEntityResult>
      <SearchEntityResultOpen>
        <SearchEntityResultLeading>{/* caller-owned identity */}</SearchEntityResultLeading>
        <SearchEntityResultTitle>Project Orbit</SearchEntityResultTitle>
        <SearchEntityResultBadge>Channel</SearchEntityResultBadge>
        <SearchEntityResultAttentionBadge>Archived</SearchEntityResultAttentionBadge>
        <SearchEntityResultDescription>Archived channel</SearchEntityResultDescription>
      </SearchEntityResultOpen>
    </SearchEntityResult>

    <SearchMessageResult>
      <SearchMessageResultHeader>
        <SearchMessageResultMeta>#design</SearchMessageResultMeta>
        <SearchMessageResultThreadMeta>thread</SearchMessageResultThreadMeta>
        <SearchMessageResultBadge>Archived</SearchMessageResultBadge>
        <SearchMessageResultSender>Ari</SearchMessageResultSender>
        <SearchMessageResultTimestamp>yesterday</SearchMessageResultTimestamp>
      </SearchMessageResultHeader>
      <SearchMessageResultBody>
        Matched <SearchMessageResultMatch>message</SearchMessageResultMatch>
      </SearchMessageResultBody>
    </SearchMessageResult>

    <SearchThreadResult>
      <SearchThreadResultHeader>
        <SearchThreadResultMeta>
          <SearchThreadResultBadge>Thread</SearchThreadResultBadge>
          <SearchThreadResultTimestamp>yesterday</SearchThreadResultTimestamp>
        </SearchThreadResultMeta>
        <SearchThreadResultTitle>Planning discussion</SearchThreadResultTitle>
      </SearchThreadResultHeader>
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
<SearchResultsError>
  <SearchResultsErrorTitle>Search failed</SearchResultsErrorTitle>
  <SearchResultsErrorDescription>Try again shortly.</SearchResultsErrorDescription>
  <SearchResultsErrorAction>Retry</SearchResultsErrorAction>
</SearchResultsError>`,
  composition: searchPreviewCompositionSource,
  error: searchErrorCompositionSource,
  loading: searchLoadingCompositionSource,
  noResults: searchNoResultsCompositionSource,
  selected: searchSelectedCompositionSource,
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

const SEARCH_ENTITY_RESULT_TEXT_PROPS: readonly PropRow[] = [
  {
    name: "muted",
    type: "boolean",
    description:
      "Uses the muted visual treatment while the caller keeps the text and state choice.",
  },
  { name: "...props", type: "span props", description: "Caller-owned entity text content." },
];

const SEARCH_ENTITY_RESULT_BADGE_PROPS: readonly PropRow[] = [
  {
    name: "muted",
    type: "boolean",
    description: "Uses the muted visual treatment for an otherwise caller-owned badge.",
  },
  { name: "...props", type: "span props", description: "Caller-owned badge content." },
];

const SEARCH_SLOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "native element props",
    description: "Caller-owned content and native props.",
  },
];

function searchShellProps(type: string, description = "Caller-owned content and native props.") {
  return [{ name: "...props", type, description }] satisfies readonly PropRow[];
}

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
  {
    id: "api-shell-root",
    title: "SearchShellRoot · SearchShellRootProps",
    rows: searchShellProps("SearchShellRootProps", "Panel props for the outer search frame."),
  },
  {
    id: "api-shell-header",
    title: "SearchShellHeader · SearchShellHeaderProps",
    rows: searchShellProps(
      "SearchShellHeaderProps",
      "PanelHeaderRoot props for the search header.",
    ),
  },
  {
    id: "api-shell-content",
    title: "SearchShellContent · SearchShellContentProps",
    rows: searchShellProps(
      "SearchShellContentProps",
      "ConversationPanelContent props for the main section.",
    ),
  },
  {
    id: "api-shell-header-back",
    title: "SearchShellHeaderBack · SearchShellHeaderBackProps",
    rows: searchShellProps("SearchShellHeaderBackProps"),
  },
  {
    id: "api-shell-header-icon",
    title: "SearchShellHeaderIcon · SearchShellHeaderIconProps",
    rows: searchShellProps("SearchShellHeaderIconProps"),
  },
  {
    id: "api-shell-input-group",
    title: "SearchShellInputGroup · SearchShellInputGroupProps",
    rows: searchShellProps("SearchShellInputGroupProps"),
  },
  {
    id: "api-shell-filters",
    title: "SearchShellFilters · SearchShellFiltersProps",
    rows: searchShellProps("SearchShellFiltersProps"),
  },
  {
    id: "api-shell-active-filter",
    title: "SearchShellActiveFilter · SearchShellActiveFilterProps",
    rows: searchShellProps("SearchShellActiveFilterProps"),
  },
  {
    id: "api-shell-clear-filters",
    title: "SearchShellClearFilters · SearchShellClearFiltersProps",
    rows: searchShellProps("SearchShellClearFiltersProps"),
  },
  {
    id: "api-shell-results",
    title: "SearchShellResults · SearchShellResultsProps",
    rows: searchShellProps("SearchShellResultsProps"),
  },
  {
    id: "api-shell-results-content",
    title: "SearchShellResultsContent · SearchShellResultsContentProps",
    rows: searchShellProps("SearchShellResultsContentProps"),
  },
  {
    id: "api-shell-load-more",
    title: "SearchShellLoadMore · SearchShellLoadMoreProps",
    rows: searchShellProps("SearchShellLoadMoreProps"),
  },
  {
    id: "api-shell-entity-icon",
    title: "SearchShellEntityIcon · SearchShellEntityIconProps",
    rows: searchShellProps("SearchShellEntityIconProps"),
  },
  {
    id: "api-shell-computer-icon",
    title: "SearchShellComputerIcon · SearchShellComputerIconProps",
    rows: searchShellProps("SearchShellComputerIconProps"),
  },
  {
    id: "api-shell-archived-icon",
    title: "SearchShellArchivedIcon · SearchShellArchivedIconProps",
    rows: searchShellProps("SearchShellArchivedIconProps"),
  },
  {
    id: "api-shell-activity",
    title: "SearchShellActivity · SearchShellActivityProps",
    rows: searchShellProps("SearchShellActivityProps"),
  },
  {
    id: "api-shell-skeleton-card",
    title: "SearchShellSkeletonCard · SearchShellSkeletonCardProps",
    rows: searchShellProps("SearchShellSkeletonCardProps"),
  },
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
  { id: "api-entity-leading", title: "SearchEntityResultLeading", rows: SEARCH_SLOT_PROPS },
  {
    id: "api-entity-title",
    title: "SearchEntityResultTitle",
    rows: SEARCH_ENTITY_RESULT_TEXT_PROPS,
  },
  {
    id: "api-entity-description",
    title: "SearchEntityResultDescription",
    rows: SEARCH_ENTITY_RESULT_TEXT_PROPS,
  },
  {
    id: "api-entity-badge",
    title: "SearchEntityResultBadge",
    rows: SEARCH_ENTITY_RESULT_BADGE_PROPS,
  },
  {
    id: "api-entity-attention-badge",
    title: "SearchEntityResultAttentionBadge",
    rows: SEARCH_SLOT_PROPS,
  },
  { id: "api-message", title: "SearchMessageResult", rows: SEARCH_MESSAGE_RESULT_PROPS },
  {
    id: "api-message-header",
    title: "SearchMessageResultHeader",
    rows: SEARCH_MESSAGE_RESULT_HEADER_PROPS,
  },
  { id: "api-message-meta", title: "SearchMessageResultMeta", rows: SEARCH_SLOT_PROPS },
  {
    id: "api-message-thread-meta",
    title: "SearchMessageResultThreadMeta",
    rows: SEARCH_SLOT_PROPS,
  },
  { id: "api-message-sender", title: "SearchMessageResultSender", rows: SEARCH_SLOT_PROPS },
  { id: "api-message-badge", title: "SearchMessageResultBadge", rows: SEARCH_SLOT_PROPS },
  {
    id: "api-message-timestamp",
    title: "SearchMessageResultTimestamp",
    rows: SEARCH_SLOT_PROPS,
  },
  { id: "api-message-match", title: "SearchMessageResultMatch", rows: SEARCH_SLOT_PROPS },
  {
    id: "api-message-body",
    title: "SearchMessageResultBody",
    rows: SEARCH_MESSAGE_RESULT_BODY_PROPS,
  },
  { id: "api-thread-meta", title: "SearchThreadResultMeta", rows: SEARCH_SLOT_PROPS },
  { id: "api-thread-badge", title: "SearchThreadResultBadge", rows: SEARCH_SLOT_PROPS },
  {
    id: "api-thread-timestamp",
    title: "SearchThreadResultTimestamp",
    rows: SEARCH_SLOT_PROPS,
  },
  { id: "api-thread-title", title: "SearchThreadResultTitle", rows: SEARCH_SLOT_PROPS },
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
  { id: "api-error-title", title: "SearchResultsErrorTitle", rows: SEARCH_SLOT_PROPS },
  {
    id: "api-error-description",
    title: "SearchResultsErrorDescription",
    rows: SEARCH_SLOT_PROPS,
  },
  { id: "api-error-action", title: "SearchResultsErrorAction", rows: SEARCH_SLOT_PROPS },
] as const;

export const Route = createFileRoute("/components/search")({
  component: SearchDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function SearchPreview({ code }: { code: Record<string, string> }) {
  return (
    <Preview previewInset="flush" previewClassName="h-[42rem] items-stretch overflow-hidden p-0">
      <Preview.Canvas>
        <CompositionPreview className="h-full p-0">
          <SearchPreviewComposition />
        </CompositionPreview>
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
      description="Business-agnostic search shell and result parts for composing entity, message, and thread search experiences."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <SearchPreview code={code} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocSubsection parentId="anatomy" id="shell-anatomy" title="Shell">
          <DocsCodeBlock>
            <DocsCodeBlock.Body>
              <DocsCodeBlock.Content
                html={code.shellAnatomy}
                collapsedHtml={code.shellAnatomyBody}
              />
            </DocsCodeBlock.Body>
          </DocsCodeBlock>
        </DocSubsection>
        <DocSubsection parentId="anatomy" id="result-anatomy" title="Result">
          <DocsCodeBlock>
            <DocsCodeBlock.Body>
              <DocsCodeBlock.Content
                html={code.resultAnatomy}
                collapsedHtml={code.resultAnatomyBody}
              />
            </DocsCodeBlock.Body>
          </DocsCodeBlock>
        </DocSubsection>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <p>
          <InlineCode>raft-ui</InlineCode> owns the <InlineCode>Search</InlineCode> result family:
          the summary and section grouping vocabulary, the entity, message, and thread result cards,
          and the empty and error state frames. The WIP search shell provides explicit header,
          filter, viewport, and content parts while consumers retain their own controls. Production
          consumers remain responsible for URL search params, server requests, permissions, result
          navigation, detail panes, caching, pagination policy, and the source app&apos;s shared
          pinyin/fuzzy ranker.
        </p>
        <div className="grid gap-10">
          <SearchUsage
            title="Loading"
            id="loading"
            preview={<SearchLoadingComposition />}
            html={code.loading}
            collapsedHtml={code.loadingBody}
          />
          <SearchUsage
            title="No results"
            id="no-results"
            preview={<SearchNoResultsComposition />}
            html={code.noResults}
            collapsedHtml={code.noResultsBody}
          />
          <SearchUsage
            title="Request error"
            id="request-error"
            preview={<SearchErrorComposition />}
            html={code.error}
            collapsedHtml={code.errorBody}
          />
          <SearchUsage
            title="Selected result"
            id="selected-result"
            preview={<SearchSelectedComposition />}
            html={code.selected}
            collapsedHtml={code.selectedBody}
          />
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-shell" title="Shell">
            <div className="space-y-6">
              {API_SUBSECTIONS.slice(0, 17).map((subsection) => (
                <DocSubsection
                  key={subsection.id}
                  parentId="api-shell"
                  id={subsection.id}
                  title={subsection.title}
                >
                  <PropsTable rows={subsection.rows} />
                </DocSubsection>
              ))}
            </div>
          </DocSubsection>
          <DocSubsection parentId="api" id="api-result" title="Result">
            <div className="space-y-6">
              {API_SUBSECTIONS.slice(17).map((subsection) => (
                <DocSubsection
                  key={subsection.id}
                  parentId="api-result"
                  id={subsection.id}
                  title={subsection.title}
                >
                  <PropsTable rows={subsection.rows} />
                </DocSubsection>
              ))}
            </div>
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}

function SearchUsage({
  title,
  id,
  preview,
  html,
  collapsedHtml,
}: {
  title: string;
  id: string;
  preview: React.ReactNode;
  html: string;
  collapsedHtml: string;
}) {
  return (
    <DocSubsection parentId="usage" id={id} title={title}>
      <Preview previewClassName="h-[42rem] items-stretch overflow-hidden p-0" previewInset="flush">
        <Preview.Canvas>{preview}</Preview.Canvas>
        <Preview.Code html={html} collapsedHtml={collapsedHtml} />
      </Preview>
    </DocSubsection>
  );
}

/** Canonical executable composition shown in the preview. */
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
          source: searchPreviewCompositionSource,
          html: code.composition,
          collapsedHtml: code.compositionBody,
        },
      ]}
    />
  );
}
