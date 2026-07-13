import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, Search, User, X } from "lucide-react";
import type { ReactNode } from "react";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { ChatThreadPanelComposition } from "#/compositions/chat-thread-panel-composition.tsx";
import chatThreadPanelCompositionSource from "#/compositions/chat-thread-panel-composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const CHAT_THREAD_PANEL_COMPOSITION_PATH =
  "apps/doc/src/compositions/chat-thread-panel-composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "states", title: "States" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const STATE_OPTIONS = ["Default", "No replies", "Loading"] as const;

type PlaygroundValues = {
  state: (typeof STATE_OPTIONS)[number];
  search: boolean;
};

const STATE_BY_LABEL: Record<PlaygroundValues["state"], "default" | "empty" | "loading"> = {
  Default: "default",
  "No replies": "empty",
  Loading: "loading",
};

const SNIPPETS = {
  chatThreadPanelComposition: chatThreadPanelCompositionSource,
  anatomy: `<ChatThreadPanelRoot>
  <ChatThreadPanelHeader>
    <ChatThreadPanelTitle />
    <ChatThreadPanelActions>
      <PanelButton>
        <PanelButtonIcon />
      </PanelButton>
    </ChatThreadPanelActions>
  </ChatThreadPanelHeader>
  <ChatThreadPanelSearch>
    <ChatThreadPanelSearchIcon />
    <ChatThreadPanelSearchInput />
    <ChatThreadPanelSearchCount />
    <PanelButton>
      <PanelButtonIcon />
    </PanelButton>
  </ChatThreadPanelSearch>
  <ChatThreadPanelParent>
    <MessageItem />
  </ChatThreadPanelParent>
  <ChatThreadPanelBody>
    <MessageTimelineNotice />
    <ChatThreadPanelReplyCount />
    <MessageTimelineDateDivider />
    <MessageItem />
    <MessageItemSearchMatch />
  </ChatThreadPanelBody>
  <ChatThreadPanelFooter />
</ChatThreadPanelRoot>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "ChatThreadPanelRoot",
    type: "section props",
    description: "Full-height thread panel surface. It does not own thread data or routing.",
  },
  {
    name: "ChatThreadPanelHeader / Title / Actions",
    type: "div / h2 props",
    description: "Fixed thread header regions matching source panel chrome.",
  },
  {
    name: "PanelButton",
    type: "button props",
    description:
      "Shared panel action root. Its width follows the explicit Icon, Label, and Count children.",
  },
  {
    name: "PanelButtonIcon / Label / Count",
    type: "span props",
    description:
      "Explicit content parts. Label is hidden below sm and enters layout at sm; Icon and Count remain visible at every size.",
  },
  {
    name: "ChatThreadPanelSearch / SearchIcon / SearchInput / SearchCount",
    type: "div / span / input props",
    description:
      "In-thread search row under the header: icon, input, match counter, and prev/next/close actions via PanelButton.",
  },
  {
    name: "ChatThreadPanelParent / ReplyCount",
    type: "div props",
    description:
      "Pinned parent-message container above the scroll body, and the reply-count divider from the source thread header block.",
  },
  {
    name: "ChatThreadPanelBody / Footer",
    type: "div props",
    description:
      "Scrollable message body and composer/footer slot. Message rows remain caller-owned children.",
  },
  {
    name: "MessageTimelineDateDivider / Notice",
    type: "div / span props",
    description:
      "Shared timeline chrome: day-boundary divider (inline or sticky) and timeline notices.",
  },
  {
    name: "MessageItemSearchMatch",
    type: "MessageItem props",
    description:
      "Message row variant that highlights the active in-thread search match. Caller-owned like MessageItem.",
  },
];

export const Route = createFileRoute("/components/chat-thread-panel")({
  component: ChatThreadPanelDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ChatThreadPanelDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ChatThreadPanel"
      description="Thread side-panel chrome for the right panel stack: header, title, action cluster, scroll body, and composer/footer slot."
      overview={
        <Differences from="ThreadPanel">
          <li>does not own message loading, reply mutations, route state, or close behavior</li>
          <li>keeps the source fixed header, scroll body, action button, and composer boundary</li>
          <li>stays separate from AppPanelStack so the stack remains a generic right-panel host</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{ state: "Default", search: true }}
          controls={[
            { name: "state", label: "State", type: "select", options: STATE_OPTIONS },
            { name: "search", label: "Search", type: "boolean" },
          ]}
          render={(values) => (
            <div className="flex h-[420px] w-full justify-start overflow-x-auto">
              <ThreadPanelFrame>
                <ChatThreadPanelComposition
                  state={STATE_BY_LABEL[values.state]}
                  search={values.search}
                />
              </ThreadPanelFrame>
            </div>
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="states" title="States">
        <PreviewGrid columns={2}>
          <PreviewPane label="No replies · Brutal">
            <PreviewThemeScope family="brutal" className="h-full">
              <ThreadPanelFrame>
                <ChatThreadPanelComposition state="empty" />
              </ThreadPanelFrame>
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="No replies · Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <ThreadPanelFrame>
                <ChatThreadPanelComposition state="empty" />
              </ThreadPanelFrame>
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Loading · Brutal">
            <PreviewThemeScope family="brutal" className="h-full">
              <ThreadPanelFrame>
                <ChatThreadPanelComposition state="loading" />
              </ThreadPanelFrame>
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Loading · Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <ThreadPanelFrame>
                <ChatThreadPanelComposition state="loading" />
              </ThreadPanelFrame>
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
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
          source={SNIPPETS.chatThreadPanelComposition}
          html={code.chatThreadPanelComposition}
          collapsedHtml={code.chatThreadPanelCompositionBody}
          showLineNumbers={false}
        />
      </DocSection>
    </DocPage>
  );
}

function PreviewGrid({ children, columns = 1 }: { children: ReactNode; columns?: 1 | 2 }) {
  return (
    <div className={columns === 2 ? "grid gap-4 md:grid-cols-2" : "flex flex-col gap-4"}>
      {children}
    </div>
  );
}

function PreviewPane({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-none border border-line bg-layer-panel">
      <div className="border-b border-line bg-layer-muted px-3 py-2 text-xs font-medium text-foreground-muted">
        {label}
      </div>
      <div className="flex h-[420px] items-stretch justify-start overflow-x-auto bg-white p-2">
        {children}
      </div>
    </div>
  );
}

function ThreadPanelFrame({ children }: { children: ReactNode }) {
  return (
    <div className="h-full w-[400px] shrink-0 overflow-hidden border-l-2 border-line-strong bg-layer-panel [[data-theme=elegant]_&]:border-l [[data-theme=elegant]_&]:border-line-subtle">
      {children}
    </div>
  );
}

function CurrentThreadPanelPreview() {
  return (
    <ThreadPanelFrame>
      <ChatThreadPanelComposition />
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
        <div className="w-20 shrink-0 text-center font-mono text-xs text-black/50">1/2</div>
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
