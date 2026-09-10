import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { SearchErrorComposition } from "#/modules/search/compositions/search-error.composition.tsx";
import searchErrorCompositionSource from "#/modules/search/compositions/search-error.composition.tsx?raw";
import { SearchLoadingComposition } from "#/modules/search/compositions/search-loading.composition.tsx";
import searchLoadingCompositionSource from "#/modules/search/compositions/search-loading.composition.tsx?raw";
import { SearchMutedEntityComposition } from "#/modules/search/compositions/search-muted-entity.composition.tsx";
import searchMutedEntityCompositionSource from "#/modules/search/compositions/search-muted-entity.composition.tsx?raw";
import { SearchNoResultsComposition } from "#/modules/search/compositions/search-no-results.composition.tsx";
import searchNoResultsCompositionSource from "#/modules/search/compositions/search-no-results.composition.tsx?raw";
import { SearchPreviewComposition } from "#/modules/search/compositions/search-preview.composition.tsx";
import searchPreviewCompositionSource from "#/modules/search/compositions/search-preview.composition.tsx?raw";
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
  resultAnatomy: `import {
  Badge,
  SearchEntityResult,
  SearchEntityResultActivity,
  SearchEntityResultContent,
  SearchEntityResultDescription,
  SearchEntityResultHeader,
  SearchEntityResultLeading,
  SearchEntityResultTitle,
  SearchMessageResult,
  SearchMessageResultBody,
  SearchMessageResultHeader,
  SearchMessageResultMatch,
  SearchMessageResultMeta,
  SearchMessageResultSender,
  SearchMessageResultThreadMeta,
  SearchMessageResultTimestamp,
  SearchThreadMessageResult,
  SearchThreadResult,
  SearchThreadResultHeader,
  SearchThreadResultMeta,
  SearchThreadResultMessages,
  SearchThreadResultTimestamp,
  SearchThreadResultTitle,
} from "raft-ui";

<>
  <SearchEntityResult>
    <SearchEntityResultLeading>
      {/* caller-owned identity */}
      <SearchEntityResultActivity role="img" aria-label="Active" />
    </SearchEntityResultLeading>
    <SearchEntityResultContent>
      <SearchEntityResultHeader>
        <SearchEntityResultTitle>Project Orbit</SearchEntityResultTitle>
        <Badge appearance="solid" variant="default" uppercase>
          Channel
        </Badge>
      </SearchEntityResultHeader>
      <SearchEntityResultDescription>Shared project channel</SearchEntityResultDescription>
    </SearchEntityResultContent>
  </SearchEntityResult>

  <SearchMessageResult>
    <SearchMessageResultHeader>
      <SearchMessageResultMeta>#design</SearchMessageResultMeta>
      <SearchMessageResultThreadMeta>thread</SearchMessageResultThreadMeta>
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
        <Badge appearance="solid" variant="default">Thread</Badge>
        <SearchThreadResultTimestamp>yesterday</SearchThreadResultTimestamp>
      </SearchThreadResultMeta>
      <SearchThreadResultTitle>Planning discussion</SearchThreadResultTitle>
    </SearchThreadResultHeader>
    <SearchThreadResultMessages>
      <SearchThreadMessageResult />
    </SearchThreadResultMessages>
  </SearchThreadResult>
</>`,
  composition: searchPreviewCompositionSource,
  error: searchErrorCompositionSource,
  loading: searchLoadingCompositionSource,
  mutedEntity: searchMutedEntityCompositionSource,
  noResults: searchNoResultsCompositionSource,
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
    default: "false",
    description: "Applies the selected border and shadow treatment via data-selected.",
  },
  {
    name: "...props",
    type: "button props",
    description: "Interactive entity result row; the consumer composes identity and metadata.",
  },
];

const SEARCH_ENTITY_RESULT_TEXT_PROPS: readonly PropRow[] = [
  {
    name: "muted",
    type: "boolean",
    default: "false",
    description:
      "Uses the muted visual treatment while the caller keeps the text and state choice.",
  },
  { name: "...props", type: "span props", description: "Caller-owned entity text content." },
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
    default: "false",
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
    default: "false",
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
    default: "false",
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

const SEARCH_SHELL_API_SUBSECTIONS = [
  {
    id: "api-shell-root",
    title: "SearchShellRoot · SearchShellRootProps",
    rows: searchShellProps("SearchShellRootProps", "Panel props for the outer search frame."),
  },
  {
    id: "api-shell-filters",
    title: "SearchShellFilters · SearchShellFiltersProps",
    rows: searchShellProps("SearchShellFiltersProps"),
  },
  {
    id: "api-shell-viewport",
    title: "SearchShellViewport · SearchShellViewportProps",
    rows: searchShellProps("SearchShellViewportProps"),
  },
];

const SEARCH_RESULT_API_SUBSECTIONS = [
  { id: "api-summary", title: "SearchResultsSummary", rows: SEARCH_RESULTS_SUMMARY_PROPS },
  { id: "api-section", title: "SearchResultsSection", rows: SEARCH_RESULTS_SECTION_PROPS },
  {
    id: "api-section-heading",
    title: "SearchResultsSectionHeading",
    rows: SEARCH_RESULTS_SECTION_HEADING_PROPS,
  },
  { id: "api-list", title: "SearchResultsList", rows: SEARCH_RESULTS_LIST_PROPS },
  { id: "api-entity", title: "SearchEntityResult", rows: SEARCH_ENTITY_RESULT_PROPS },
  { id: "api-entity-leading", title: "SearchEntityResultLeading", rows: SEARCH_SLOT_PROPS },
  { id: "api-entity-icon", title: "SearchEntityResultIcon", rows: SEARCH_SLOT_PROPS },
  { id: "api-entity-content", title: "SearchEntityResultContent", rows: SEARCH_SLOT_PROPS },
  { id: "api-entity-header", title: "SearchEntityResultHeader", rows: SEARCH_SLOT_PROPS },
  {
    id: "api-entity-activity",
    title: "SearchEntityResultActivity",
    rows: SEARCH_SLOT_PROPS,
  },
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
] as const;

export const Route = createFileRoute("/components/search")({
  component: SearchDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function SearchPreview({ code }: { code: Record<string, string> }) {
  return (
    <Preview>
      <Preview.Canvas>
        <SearchPreviewComposition />
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
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content
              html={code.resultAnatomy}
              collapsedHtml={code.resultAnatomyBody}
            />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="grid gap-10">
          <SearchUsage
            title="Muted entity"
            id="muted-entity"
            preview={<SearchMutedEntityComposition />}
            previewInset="default"
            html={code.mutedEntity}
            collapsedHtml={code.mutedEntityBody}
          />
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
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-shell" title="Shell">
            <div className="space-y-6">
              {SEARCH_SHELL_API_SUBSECTIONS.map((subsection) => (
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
              {SEARCH_RESULT_API_SUBSECTIONS.map((subsection) => (
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
  previewInset = "flush",
  previewClassName = previewInset === "flush" ? "h-80 items-stretch overflow-hidden p-0" : "",
  html,
  collapsedHtml,
}: {
  title: string;
  id: string;
  preview: React.ReactNode;
  previewClassName?: string;
  previewInset?: "default" | "flush";
  html: string;
  collapsedHtml: string;
}) {
  return (
    <DocSubsection parentId="usage" id={id} title={title}>
      <Preview previewClassName={previewClassName} previewInset={previewInset}>
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
