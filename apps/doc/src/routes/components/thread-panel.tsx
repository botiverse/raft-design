import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Search, User, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Badge } from "raft-ui";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { ThreadPanelComposition } from "#/modules/thread-panel/thread-panel.composition.tsx";
import threadPanelCompositionSource from "#/modules/thread-panel/thread-panel.composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const CHAT_THREAD_PANEL_COMPOSITION_PATH =
  "apps/doc/src/modules/thread-panel/thread-panel.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  threadPanelComposition: threadPanelCompositionSource,
  preview: `<ThreadPanelComposition search />`,
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
      <MessageListNotice />
      <ThreadPanelReplyCount />
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
  code: ReturnType<typeof Route.useLoaderData>["preview"];
  collapsedCode?: ReturnType<typeof Route.useLoaderData>["previewBody"];
}) {
  const [search, setSearch] = useState(true);

  return (
    <Preview>
      <Preview.Canvas>
        <div className="flex h-[660px] w-full justify-start overflow-x-auto">
          <ThreadPanelFrame>
            <ThreadPanelComposition search={search} />
          </ThreadPanelFrame>
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
        <ThreadPanelPreview code={code.preview} collapsedCode={code.previewBody} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
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
        <PreviewGrid>
          <PreviewPane label="Source">
            <SourceThemeScope className="h-full">
              <SourceThreadPanelPreview />
            </SourceThemeScope>
          </PreviewPane>
          <PreviewPane label="Brutal">
            <PreviewThemeScope family="brutal" className="h-full">
              <CurrentThreadPanelPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <CurrentThreadPanelPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant dark">
            <PreviewThemeScope family="elegant" mode="dark" className="h-full dark">
              <CurrentThreadPanelPreview />
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
        <DocsCodeBlock.Panel
          path={CHAT_THREAD_PANEL_COMPOSITION_PATH}
          source={SNIPPETS.threadPanelComposition}
          html={code.threadPanelComposition}
          collapsedHtml={code.threadPanelCompositionBody}
          showLineNumbers={false}
        />
      </DocSection>
    </DocPage>
  );
}

function PreviewGrid({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function PreviewPane({
  label,
  wip = false,
  children,
}: {
  label: string;
  wip?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-none border border-line bg-layer-panel">
      <div className="flex items-center gap-1.5 border-b border-line bg-layer-muted px-3 py-2 text-xs font-medium text-foreground-muted">
        <span>{label}</span>
        {wip ? (
          <Badge appearance="soft" variant="warning" uppercase className="h-4 px-1.5 text-[9px]">
            WIP
          </Badge>
        ) : null}
      </div>
      <div className="flex h-[660px] items-stretch justify-start overflow-x-auto bg-white p-2">
        {children}
      </div>
    </div>
  );
}

function ThreadPanelFrame({ children }: { children: ReactNode }) {
  return <div className="h-full w-full overflow-hidden bg-layer-panel">{children}</div>;
}

function CurrentThreadPanelPreview() {
  return (
    <ThreadPanelFrame>
      <ThreadPanelComposition />
    </ThreadPanelFrame>
  );
}

function SourceThreadPanelPreview() {
  return (
    <div className="flex h-full w-[400px] shrink-0 flex-col overflow-hidden border-l-2 border-black bg-white font-sans text-black">
      <div className="flex h-[62px] shrink-0 items-center gap-3 border-b-2 border-black bg-white px-5 [@media(max-height:600px)]:h-12">
        <div className="min-w-0 flex-1 truncate text-base font-bold">Thread</div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
            aria-label="Close thread"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 border-b-2 border-black bg-white px-2 py-2">
        <Search className="size-3.5 shrink-0 text-black/50" />
        <input
          aria-label="Search in thread"
          readOnly
          value="chrome"
          className="min-w-0 flex-1 border-2 border-black bg-white px-2 py-1 text-sm font-medium outline-none focus:shadow-brutal-sm"
        />
        <div className="shrink-0 whitespace-nowrap font-mono text-xs tabular-nums text-black/50">
          1/2
        </div>
        <button
          type="button"
          className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
          aria-label="Previous match"
        >
          <ChevronUp className="size-3.5" />
        </button>
        <button
          type="button"
          className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
          aria-label="Next match"
        >
          <ChevronDown className="size-3.5" />
        </button>
        <button
          type="button"
          className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
          aria-label="Close thread search"
        >
          <X className="size-3.5" />
        </button>
      </div>
      <div className="shrink-0 border-b-2 border-black bg-white px-3 py-1">
        <div className="group/message relative mt-1.5 mb-1 flex h-fit min-h-12 gap-3 border-2 border-transparent px-2 py-1 hover:border-black hover:bg-white active:border-black active:bg-white">
          <div className="relative mt-0.5 shrink-0 self-start">
            <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden border-2 border-black bg-brutal-lavender text-black">
              <User className="size-4" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-24">
              <span className="min-w-0 shrink-0 truncate text-sm font-bold text-black">Cindy</span>
              <span className="shrink-0 whitespace-nowrap font-mono text-xs text-black/40">
                10:08
              </span>
            </div>
            <div className="break-words text-sm text-black">
              Should ThreadPanel own the right-panel chrome?
            </div>
          </div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="px-3 pt-2">
          <div className="pb-2 text-center font-mono text-xs text-black/40">
            Beginning of replies
          </div>
          <div className="mb-1 border-b border-black/10 pb-2 text-center font-mono text-xs text-black/40">
            2 replies
          </div>
        </div>
        <div className="relative flex items-center justify-center px-3 py-2 select-none">
          <div className="absolute inset-x-3 top-1/2 border-t-2 border-black/15" aria-hidden />
          <div className="relative bg-white">
            <span className="inline-flex items-center bg-white px-2 text-[10px] font-bold tracking-widest text-black/50 uppercase">
              Today
            </span>
          </div>
        </div>
        <div className="px-3 pb-3">
          <div className="group/message relative mt-1.5 mb-1 flex h-fit min-h-12 gap-3 border-2 border-transparent px-2 py-1 hover:border-black hover:bg-white active:border-black active:bg-white">
            <div className="relative mt-0.5 shrink-0 self-start">
              <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden border-2 border-black bg-brutal-lavender text-black">
                <User className="size-4" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-24">
                <span className="min-w-0 shrink-0 truncate text-sm font-bold text-black">
                  Cindy
                </span>
                <span className="shrink-0 whitespace-nowrap font-mono text-xs text-black/40">
                  10:09
                </span>
              </div>
              <div className="break-words text-sm text-black">
                SideThreadColumn owns persisted width and desktop resize chrome.
              </div>
            </div>
          </div>
          <div className="group/message relative mt-1.5 mb-1 flex h-fit min-h-12 gap-3 border-2 border-black bg-brutal-cyan/25 px-2 py-1 shadow-brutal">
            <div className="relative mt-0.5 shrink-0 self-start">
              <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden border-2 border-black bg-brutal-cyan text-black">
                <User className="size-4" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-24">
                <span className="min-w-0 shrink-0 truncate text-sm font-bold text-black">
                  Atlas
                </span>
                <span className="shrink-0 whitespace-nowrap font-mono text-xs text-black/40">
                  10:11
                </span>
              </div>
              <div className="break-words text-sm text-black">
                ThreadPanel now owns the right-panel header, body, action, and footer chrome.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative flex shrink-0 items-center border-t-2 border-black bg-white px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] text-xs text-black/50">
        Reply composer slot
      </div>
    </div>
  );
}
