import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { ThreadPanelComposition } from "#/modules/thread-panel/thread-panel.composition.tsx";
import threadPanelCompositionSource from "#/modules/thread-panel/thread-panel.composition.tsx?raw";
import {
  ThreadPanelComparisonComposition,
  ThreadPanelSourcePreview,
} from "#/modules/thread-panel/thread-panel.source-comparison.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const CHAT_THREAD_PANEL_COMPOSITION_PATH =
  "apps/doc/src/modules/thread-panel/thread-panel.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Slock thread panel",
    scenes: [
      {
        label: "ThreadPanel.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/ThreadPanel.tsx",
      },
      {
        label: "MessageItem.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageItem.tsx",
      },
    ],
  },
] as const;

const SNIPPETS = {
  threadPanelComposition: threadPanelCompositionSource,
  anatomy: `<ThreadPanelRoot>
  <ThreadPanelHeader>
    <Button className="mr-1 lg:hidden" variant="outline" size="icon-sm">
      <ChevronLeft />
    </Button>
    <ThreadPanelTitle>
      Thread
      <ThreadPanelTitleMeta> — #acme-design</ThreadPanelTitleMeta>
    </ThreadPanelTitle>
    <ThreadPanelActions>
      <PanelAction>
        <Search />
      </PanelAction>
      <PanelAction>
        <ExternalLink />
        <span className="hidden md:inline">View in channel</span>
      </PanelAction>
      <PanelAction className="max-lg:hidden">
        <X />
      </PanelAction>
    </ThreadPanelActions>
  </ThreadPanelHeader>
  <ThreadPanelContent>
  <ThreadPanelSearch>
    <InputGroup />
    <ThreadPanelSearchTrailing>
      <ThreadPanelSearchCount />
      <ThreadPanelActions>
        <PanelAction />
      </ThreadPanelActions>
    </ThreadPanelSearchTrailing>
  </ThreadPanelSearch>
  <ThreadPanelOriginalMessage>
    <MessageItem />
  </ThreadPanelOriginalMessage>
  <ThreadPanelBody>
    <MessageList>
      <ThreadPanelReplySummary>
        <MessageListNotice />
        <ThreadPanelReplyCount />
      </ThreadPanelReplySummary>
      <MessageListDateDivider />
      <MessageItem />
      <MessageItemSearchMatch />
    </MessageList>
  </ThreadPanelBody>
  <ThreadPanelFooter>
    <ComposerRoot>
      <Composer>
        <ComposerInput />
        <ComposerToolbar>
          <ComposerActions />
          <ComposerMeta>
            <ComposerSubmit />
          </ComposerMeta>
        </ComposerToolbar>
      </Composer>
    </ComposerRoot>
  </ThreadPanelFooter>
  </ThreadPanelContent>
</ThreadPanelRoot>`,
} as const;

const THREAD_PANEL_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "section props",
    description:
      "Full-height thread panel surface. It does not own thread data, routing, responsive placement, or document scroll behavior.",
  },
];

const THREAD_PANEL_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Fixed thread header region.",
  },
];

const THREAD_PANEL_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "h2 props",
    description: "Primary thread title. Truncates within the header.",
  },
];

const THREAD_PANEL_TITLE_META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Secondary title metadata, such as the parent channel name.",
  },
];

const THREAD_PANEL_ACTIONS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Action cluster for header or search controls.",
  },
];

const PANEL_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "button props",
    description:
      "Panel action root for direct icon, text, and count children. It owns icon sizing and tabular number alignment.",
  },
];

const THREAD_PANEL_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Thread surface below the header, including search, messages, and composer slots.",
  },
];

const THREAD_PANEL_SEARCH_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "In-thread search row under the header. Left: InputGroup. Right: ThreadPanelSearchTrailing.",
  },
];

const THREAD_PANEL_SEARCH_TRAILING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Right-aligned cluster for match count and PanelAction controls. Stays flush to the row end when the input is narrower than the row.",
  },
];

const THREAD_PANEL_SEARCH_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Match-count label in the trailing cluster, formatted as a/b.",
  },
];

const THREAD_PANEL_ORIGINAL_MESSAGE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Original message region above the scroll body. Place a MessageItem inside it.",
  },
];

const THREAD_PANEL_REPLY_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Labels the reply count above the message list.",
  },
];

const THREAD_PANEL_REPLY_SUMMARY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Aligns the reply notice and count with the thread panel content gutter for the active theme.",
  },
];

const THREAD_PANEL_BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Scrollable message body.",
  },
];

const MESSAGE_LIST_DATE_DIVIDER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Day-boundary marker in the message list.",
  },
];

const MESSAGE_LIST_NOTICE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Inline notice in the message list.",
  },
];

const MESSAGE_ITEM_SEARCH_MATCH_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "MessageItem props",
    description:
      "Message row variant that highlights the active in-thread search match. Caller-owned like MessageItem.",
  },
];

const THREAD_PANEL_FOOTER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Composer/footer boundary. Compose it with ComposerRoot like ConversationPanelFooter. Override --panel-footer-clearance on the root for a custom composer height.",
  },
];

export const Route = createFileRoute("/components/thread-panel")({
  component: ThreadPanelDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ThreadPanelPreview({
  code,
  collapsedCode,
}: {
  code: ReturnType<typeof Route.useLoaderData>["threadPanelComposition"];
  collapsedCode?: ReturnType<typeof Route.useLoaderData>["threadPanelCompositionBody"];
}) {
  const [search, setSearch] = useState(true);

  return (
    <Preview>
      <Preview.Canvas>
        <div className="flex h-[660px] w-full justify-start overflow-x-auto">
          <div className="h-full w-full overflow-hidden bg-layer-panel">
            <ThreadPanelComposition search={search} />
          </div>
        </div>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Search" htmlFor="thread-panel-preview-search">
          <Preview.Checkbox
            id="thread-panel-preview-search"
            label="Search"
            checked={search}
            onCheckedChange={setSearch}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}

function ThreadPanelDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ThreadPanel"
      description="Thread side-panel chrome for the right panel stack: header, title, action cluster, scroll body, and composer/footer slot."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ThreadPanelPreview
          code={code.threadPanelComposition}
          collapsedCode={code.threadPanelCompositionBody}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <DocSubsection parentId="usage" id="thread-with-search" title="Thread with search">
          <ThreadPanelPreview
            code={code.threadPanelComposition}
            collapsedCode={code.threadPanelCompositionBody}
          />
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-thread-panel-root" title="ThreadPanelRoot">
            <PropsTable rows={THREAD_PANEL_ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-thread-panel-header" title="ThreadPanelHeader">
            <PropsTable rows={THREAD_PANEL_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-thread-panel-title" title="ThreadPanelTitle">
            <PropsTable rows={THREAD_PANEL_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-thread-panel-title-meta"
            title="ThreadPanelTitleMeta"
          >
            <PropsTable rows={THREAD_PANEL_TITLE_META_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-thread-panel-actions" title="ThreadPanelActions">
            <PropsTable rows={THREAD_PANEL_ACTIONS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-action" title="PanelAction">
            <PropsTable rows={PANEL_ACTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-thread-panel-content" title="ThreadPanelContent">
            <PropsTable rows={THREAD_PANEL_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-thread-panel-search" title="ThreadPanelSearch">
            <PropsTable rows={THREAD_PANEL_SEARCH_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-thread-panel-search-trailing"
            title="ThreadPanelSearchTrailing"
          >
            <PropsTable rows={THREAD_PANEL_SEARCH_TRAILING_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-thread-panel-search-count"
            title="ThreadPanelSearchCount"
          >
            <PropsTable rows={THREAD_PANEL_SEARCH_COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-thread-panel-original-message"
            title="ThreadPanelOriginalMessage"
          >
            <PropsTable rows={THREAD_PANEL_ORIGINAL_MESSAGE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-thread-panel-reply-summary"
            title="ThreadPanelReplySummary"
          >
            <PropsTable rows={THREAD_PANEL_REPLY_SUMMARY_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-thread-panel-reply-count"
            title="ThreadPanelReplyCount"
          >
            <PropsTable rows={THREAD_PANEL_REPLY_COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-thread-panel-body" title="ThreadPanelBody">
            <PropsTable rows={THREAD_PANEL_BODY_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-list-date-divider"
            title="MessageListDateDivider"
          >
            <PropsTable rows={MESSAGE_LIST_DATE_DIVIDER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-message-list-notice" title="MessageListNotice">
            <PropsTable rows={MESSAGE_LIST_NOTICE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-message-item-search-match"
            title="MessageItemSearchMatch"
          >
            <PropsTable rows={MESSAGE_ITEM_SEARCH_MATCH_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-thread-panel-footer" title="ThreadPanelFooter">
            <PropsTable rows={THREAD_PANEL_FOOTER_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          previewSize="tall"
          items={[
            {
              label: "Populated thread with search",
              status: "review",
              note: "The Source pane is a static fixture extracted from the real ThreadPanel and MessageItem DOM; the three Current panes execute the canonical panel composition.",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope className="w-full">
                  <ThreadPanelSourcePreview />
                </SourceThemeScope>
              ),
              brutal: <ThreadPanelComparisonComposition />,
              elegant: <ThreadPanelComparisonComposition />,
              elegantDark: <ThreadPanelComparisonComposition />,
              compositionCode: code.threadPanelComposition,
              compositionCollapsedCode: code.threadPanelCompositionBody,
              compositionPath: CHAT_THREAD_PANEL_COMPOSITION_PATH,
              compositionSource: threadPanelCompositionSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
