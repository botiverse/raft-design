import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDown,
  Bell,
  FileText,
  Hash,
  ImagePlus,
  ListTodo,
  MessageSquare,
  Paperclip,
  Search,
  Send,
  Settings,
  Square,
  User,
  Users,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { Spinner } from "raft-ui";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { ChatMainPanelComposition } from "#/compositions/chat-main-panel-composition.tsx";
import {
  ChatMainPanelDropOverlayComposition,
  ChatMainPanelStatesComposition,
  COMPOSER_IMAGE_SRC,
} from "#/compositions/chat-main-panel-states-composition.tsx";
import chatMainPanelCompositionSource from "#/compositions/chat-main-panel-composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const CHAT_MAIN_PANEL_COMPOSITION_PATH =
  "apps/doc/src/compositions/chat-main-panel-composition.tsx";

const TOC = [
  { id: "source-comparison", title: "Source comparison" },
  { id: "states", title: "Alert, jump, and composer states" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  chatMainPanelComposition: chatMainPanelCompositionSource,
  anatomy: `import { MessageSquare } from "lucide-react";
import { SortableTabsList, SortableTabsTab, Tabs, TabsIndicator, TabsLabel } from "raft-ui";
import {
  ChatMainPanelRoot,
  ChatMainPanelHeader,
  ChatMainPanelHeaderIcon,
  ChatMainPanelTitleBlock,
  ChatMainPanelTitle,
  ChatMainPanelSubtitle,
  ChatMainPanelActions,
  PanelIconButton,
  ChatMainPanelContent,
  ChatMainPanelBody,
  ChatMainPanelTabs,
  ChatMainPanelTimeline,
  ChatMainPanelMessageList,
  ChatMainPanelComposer,
  ComposerRoot,
  ChatMainPanelFooter,
  MessageItem,
  MessageItemContent,
} from "raft-ui/wip";

<ChatMainPanelRoot>
  <ChatMainPanelHeader>
    <ChatMainPanelHeaderIcon>
      <Hash />
    </ChatMainPanelHeaderIcon>
    <ChatMainPanelTitleBlock>
      <ChatMainPanelTitle>proj-uiux</ChatMainPanelTitle>
      <ChatMainPanelSubtitle>Channel status</ChatMainPanelSubtitle>
    </ChatMainPanelTitleBlock>
    <ChatMainPanelActions>
      <PanelIconButton aria-label="Search conversation">
        <Search />
      </PanelIconButton>
    </ChatMainPanelActions>
  </ChatMainPanelHeader>
  <ChatMainPanelContent>
    <ChatMainPanelTabs render={<Tabs value="chat" />}>
      <SortableTabsList value={tabOrder} onReorder={setTabOrder} variant="underline">
        <SortableTabsTab value="chat">
          <MessageSquare size={12} />
          <TabsLabel>Chat</TabsLabel>
        </SortableTabsTab>
        <TabsIndicator />
      </SortableTabsList>
    </ChatMainPanelTabs>
    <ChatMainPanelBody>
      <ChatMainPanelTimeline>
        <ChatMainPanelMessageList>
          <MessageItem>
            <MessageItemContent>{message}</MessageItemContent>
          </MessageItem>
        </ChatMainPanelMessageList>
      </ChatMainPanelTimeline>
    </ChatMainPanelBody>
    <ChatMainPanelFooter>
      <ComposerRoot>
        <ChatMainPanelComposer>{composer}</ChatMainPanelComposer>
      </ComposerRoot>
    </ChatMainPanelFooter>
  </ChatMainPanelContent>
</ChatMainPanelRoot>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "ChatMainPanelRoot",
    type: "section props",
    description: "Full-height active conversation surface between sidebar and panel stack.",
  },
  {
    name: "ChatMainPanelHeader / HeaderIcon / TitleBlock / Title / Subtitle / Actions",
    type: "div props",
    description: "Main conversation header regions. Copy, badges, and actions stay composed.",
  },
  {
    name: "PanelIconButton",
    type: "button props",
    description: "Shared panel icon button for search, details, and app-owned commands.",
  },
  {
    name: "ChatMainPanelContent",
    type: "div props",
    description:
      "Complete content region below the header. Owns the inset, shadow, and clipping layers around tabs, body, and footer.",
  },
  {
    name: "ChatMainPanelTabs / Body / Timeline / Footer",
    type: "div / form props",
    description: "Source tab strip, message timeline host, and composer/footer boundary.",
  },
  {
    name: "Banner / BannerDescription / BannerAction",
    type: "shared component composition",
    description: "Shared semantic banner composition for inline panel status and errors.",
  },
  {
    name: "ChatMainPanelJumpToLatest",
    type: "button props",
    description: "Floating jump-to-latest button anchored to the bottom of the timeline body.",
  },
  {
    name: "ChatMainPanelComposerAttachment*",
    type: "div / span / img / button props",
    description:
      "Pending-upload strip above the composer: image and file tiles, uploading/failed overlays, progress bar, and remove affordance.",
  },
  {
    name: "ChatMainPanelComposerDropOverlay / Label",
    type: "div / span props",
    description: "Drag-and-drop overlay covering the composer form while files hover over it.",
  },
  {
    name: "ChatMainPanelMessageList / Composer*",
    type: "div / span / textarea / button props",
    description:
      "Timeline padding host and composer parts. Message rows should use the shared MessageItem components.",
  },
];

export const Route = createFileRoute("/components/chat-main-panel")({
  component: ChatMainPanelDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ChatMainPanelDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ChatMainPanel"
      description="Active conversation panel between chat sidebar and thread panel stack."
      overview={
        <Differences from="Main chat content">
          <li>does not own message data, composer mutations, routing, or realtime subscriptions</li>
          <li>keeps the source main-panel header, scroll body, and composer boundary</li>
          <li>stays separate from AppShellMain so the shell remains reusable outside chat</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="source-comparison" title="Source comparison">
        <PreviewGrid>
          <PreviewPane label="Source">
            <SourceThemeScope className="h-full">
              <SourceMainPanelPreview />
            </SourceThemeScope>
          </PreviewPane>
          <PreviewPane label="Brutal">
            <PreviewThemeScope family="brutal" className="h-full">
              <CurrentMainPanelPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <CurrentMainPanelPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant dark">
            <PreviewThemeScope family="elegant" mode="dark" className="h-full dark">
              <CurrentMainPanelPreview />
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
      </DocSection>

      <DocSection id="states" title="Alert, jump, and composer states" showThemeSwitcher>
        <PreviewGrid>
          <PreviewPane label="Source">
            <SourceThemeScope className="h-full">
              <SourceStatesPreview />
            </SourceThemeScope>
          </PreviewPane>
          <PreviewPane label="Brutal">
            <PreviewThemeScope family="brutal" className="h-full">
              <CurrentStatesPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <CurrentStatesPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Source · drop overlay">
            <SourceThemeScope className="h-full">
              <SourceDropOverlayPreview />
            </SourceThemeScope>
          </PreviewPane>
          <PreviewPane label="Brutal · drop overlay">
            <PreviewThemeScope family="brutal" className="h-full">
              <div className="h-full w-[560px] shrink-0 overflow-hidden bg-layer-panel">
                <ChatMainPanelDropOverlayComposition />
              </div>
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="chat-main-panel.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          showLineNumbers={false}
        />
        <DocsCodeBlock.Panel
          path={CHAT_MAIN_PANEL_COMPOSITION_PATH}
          source={SNIPPETS.chatMainPanelComposition}
          html={code.chatMainPanelComposition}
          showLineNumbers={false}
        />
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}

function PreviewGrid({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function PreviewPane({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-none border border-line bg-layer-panel">
      <div className="border-b border-line bg-layer-muted px-3 py-2 text-xs font-medium text-foreground-muted">
        {label}
      </div>
      <div className="flex h-[420px] items-stretch justify-start overflow-x-auto bg-background p-2">
        {children}
      </div>
    </div>
  );
}

function CurrentMainPanelPreview() {
  return (
    <div className="h-full w-[560px] shrink-0 overflow-hidden bg-layer-panel [[data-preview-theme=elegant]_&]:bg-layer-page">
      <ChatMainPanelComposition />
    </div>
  );
}

function SourceMainPanelPreview() {
  return (
    <div className="flex h-full min-h-0 w-[560px] min-w-0 shrink-0 flex-1 flex-col overflow-hidden bg-white font-sans text-black">
      <div className="flex h-[62px] shrink-0 items-center gap-3 border-b-2 border-black bg-white px-5 [@media(max-height:600px)]:h-12">
        <div className="flex size-9 shrink-0 items-center justify-center border-2 border-black bg-soft-signal">
          <Hash className="size-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-bold leading-tight">proj-uiux</div>
          <div className="truncate font-mono text-xs text-black/50">Design system migration</div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
            aria-label="Search conversation"
          >
            <Search className="size-3.5" />
          </button>
          <button
            type="button"
            className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
            aria-label="Mute channel activity"
          >
            <Bell className="size-3.5" />
          </button>
          <button
            type="button"
            className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
            aria-label="Stop all agents in this channel"
          >
            <Square className="size-3.5" />
          </button>
          <button
            type="button"
            className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
            aria-label="Conversation actions"
          >
            <Settings className="size-3.5" />
          </button>
          <button
            type="button"
            className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
            aria-label="Channel members"
          >
            <Users className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="shrink-0 border-b-2 border-black bg-white">
        <div className="flex w-max max-w-full items-stretch overflow-x-auto border-r-2 border-black bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            className="relative z-10 inline-flex shrink-0 touch-manipulation items-center gap-1.5 whitespace-nowrap bg-soft-signal px-4 py-1.5 text-xs font-semibold outline-none"
          >
            <MessageSquare className="size-3.5" />
            Chat
          </button>
          <button
            type="button"
            className="relative z-10 inline-flex shrink-0 touch-manipulation items-center gap-1.5 whitespace-nowrap bg-white px-4 py-1.5 text-xs font-semibold outline-none before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-black"
          >
            <ListTodo className="size-3.5" />
            Tasks
          </button>
          <button
            type="button"
            className="relative z-10 inline-flex shrink-0 touch-manipulation items-center gap-1.5 whitespace-nowrap bg-white px-4 py-1.5 text-xs font-semibold outline-none before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-black"
          >
            <Paperclip className="size-3.5" />
            Files
          </button>
        </div>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
        <div className="relative h-full overflow-y-auto bg-white">
          <div className="flex min-h-full flex-col">
            <div className="px-3 pt-3">
              <div className="pb-2 text-center font-mono text-xs text-black/40">
                Beginning of messages
              </div>
            </div>
            <div className="h-px" aria-hidden />
            <div className="flex-1" aria-hidden />
            <div data-index="0" data-message-id="source-cindy">
              <div className="px-3" style={{ contain: "layout style", overflow: "clip visible" }}>
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
                        10:42
                      </span>
                    </div>
                    <div className="break-words text-sm text-black">
                      Rail and sidebar own navigation. The main panel owns the active conversation
                      chrome.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div data-index="1" data-message-id="source-atlas">
              <div className="px-3" style={{ contain: "layout style", overflow: "clip visible" }}>
                <div className="group/message relative mt-1.5 mb-1 flex h-fit min-h-12 gap-3 border-2 border-transparent px-2 py-1 hover:border-black hover:bg-white active:border-black active:bg-white">
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
                        10:44
                      </span>
                    </div>
                    <div className="break-words text-sm text-black">
                      Message rows, composer behavior, route sync, and realtime data stay app-owned.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-px" aria-hidden />
            <div className="px-3 pb-3">
              <div className="h-3" />
            </div>
          </div>
        </div>
      </div>
      <form
        className="relative flex shrink-0 items-center border-t-2 border-black bg-white px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex w-full flex-col gap-2 border-2 border-black bg-white p-2 shadow-brutal-sm">
          <textarea
            aria-label="Message #proj-uiux"
            readOnly
            rows={1}
            placeholder="Message #proj-uiux"
            className="min-h-5 max-h-32 w-full resize-none bg-transparent font-sans text-base leading-5 text-black outline-none placeholder:text-black/35 md:min-h-10 md:text-sm"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-brutal-sm bg-white p-1"
                aria-label="Attach image"
              >
                <ImagePlus className="size-3.5" />
              </button>
              <button type="button" className="btn-brutal-sm bg-white p-1" aria-label="Attach file">
                <Paperclip className="size-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="inline-flex select-none items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-flex size-3.5 shrink-0 items-center justify-center border-2 border-black bg-white"
                />
                <span className="text-xs font-bold text-black/60">As Task</span>
              </label>
              <button
                type="submit"
                className="btn-brutal-sm flex size-7 items-center justify-center bg-brutal-pink p-0"
                aria-label="Send"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
function CurrentStatesPreview() {
  return (
    <div className="h-full w-[560px] shrink-0 overflow-hidden bg-layer-panel">
      <ChatMainPanelStatesComposition />
    </div>
  );
}

function SourceStatesPreview() {
  return (
    <div className="flex h-full min-h-0 w-[560px] min-w-0 shrink-0 flex-1 flex-col overflow-hidden bg-white font-sans text-black">
      <div
        className="flex items-center justify-between gap-3 border-b-2 border-black bg-brutal-orange/20 px-5 py-2 text-xs font-bold text-black"
        role="alert"
      >
        <span>Couldn&apos;t update Activity mute for this channel.</span>
        <button
          type="button"
          className="btn-brutal-sm inline-flex size-6 shrink-0 items-center justify-center bg-white"
          aria-label="Dismiss Activity mute error"
        >
          <X className="size-3" />
        </button>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
        <div className="relative h-full overflow-y-auto bg-white">
          <div className="flex min-h-full flex-col">
            <div className="flex-1" aria-hidden />
            <div className="pb-2 text-center font-mono text-xs text-black/40">
              Older messages above
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn-brutal-sm absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 bg-white px-3 py-1.5 text-xs font-bold"
        >
          <ArrowDown className="size-3" />3 new messages
        </button>
      </div>
      <form
        className="relative flex shrink-0 items-center border-t-2 border-black bg-white px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <div className="group relative">
              <img
                src={COMPOSER_IMAGE_SRC}
                alt=""
                className="size-16 border-2 border-black object-cover"
              />
              <span className="absolute inset-0 z-10 flex flex-col items-center justify-center border-2 border-black bg-white/85 px-1 text-center text-[10px] font-bold text-black">
                <Spinner size="sm" className="mb-1" />
                64%
              </span>
              <span className="absolute bottom-0 left-0 h-1 w-full bg-black/15">
                <span className="block h-full w-[64%] bg-brutal-pink" />
              </span>
              <button
                type="button"
                aria-label="Remove screenshot.png"
                className="absolute -top-1.5 -right-1.5 z-20 flex size-4 items-center justify-center rounded-full bg-black text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-2.5" />
              </button>
            </div>
            <div className="group relative">
              <span className="flex h-16 w-32 items-center gap-2 border-2 border-black bg-white px-2">
                <FileText className="size-4 shrink-0 text-black/70" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-black">
                    release-notes.pdf
                  </span>
                  <span className="block truncate text-[10px] text-black/50">application/pdf</span>
                </span>
              </span>
              <button
                type="button"
                aria-label="Remove release-notes.pdf"
                className="absolute -top-1.5 -right-1.5 z-20 flex size-4 items-center justify-center rounded-full bg-black text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="size-2.5" />
              </button>
            </div>
            <div className="group relative">
              <span className="flex h-16 w-32 items-center gap-2 border-2 border-black bg-white px-2">
                <FileText className="size-4 shrink-0 text-black/70" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-black">deck.key</span>
                  <span className="block truncate text-[10px] text-black/50">
                    application/octet-stream
                  </span>
                </span>
              </span>
              <span className="absolute inset-0 z-10 flex flex-col items-center justify-center border-2 border-black bg-brutal-orange/90 px-1 text-center text-[10px] leading-3 font-bold text-black">
                Upload failed
                <span className="underline">Tap to retry</span>
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 border-2 border-black bg-white p-2 shadow-brutal-sm">
            <textarea
              aria-label="Message #proj-uiux"
              readOnly
              rows={1}
              placeholder="Message #proj-uiux"
              className="min-h-5 max-h-32 w-full resize-none bg-transparent font-sans text-base leading-5 text-black outline-none placeholder:text-black/35 md:min-h-10 md:text-sm"
            />
            <div className="flex items-center justify-between gap-3">
              <button type="button" className="btn-brutal-sm bg-white p-1" aria-label="Attach file">
                <Paperclip className="size-3.5" />
              </button>
              <button
                type="submit"
                className="btn-brutal-sm flex size-7 items-center justify-center bg-brutal-pink p-0"
                aria-label="Send"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function SourceDropOverlayPreview() {
  return (
    <div className="flex h-full min-h-0 w-[560px] min-w-0 shrink-0 flex-1 flex-col overflow-hidden bg-white font-sans text-black">
      <div className="min-h-0 flex-1 bg-white" />
      <form
        className="relative flex shrink-0 items-center border-t-2 border-black bg-white px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex w-full flex-col gap-2 border-2 border-black bg-white p-2 shadow-brutal-sm">
          <textarea
            aria-label="Message #proj-uiux"
            readOnly
            rows={1}
            placeholder="Message #proj-uiux"
            className="min-h-5 max-h-32 w-full resize-none bg-transparent font-sans text-base leading-5 text-black outline-none placeholder:text-black/35 md:min-h-10 md:text-sm"
          />
          <div className="flex items-center justify-between gap-3">
            <button type="button" className="btn-brutal-sm bg-white p-1" aria-label="Attach file">
              <Paperclip className="size-3.5" />
            </button>
            <button
              type="submit"
              className="btn-brutal-sm flex size-7 items-center justify-center bg-brutal-pink p-0"
              aria-label="Send"
            >
              <Send className="size-3.5" />
            </button>
          </div>
        </div>
        <div
          aria-hidden
          className="absolute inset-0 z-30 flex items-center justify-center border-2 border-dashed border-brutal-pink bg-brutal-pink/15"
        >
          <span className="border-2 border-black bg-white px-3 py-1.5 text-sm font-bold text-black shadow-brutal-sm">
            Drop files to attach
          </span>
        </div>
      </form>
    </div>
  );
}
