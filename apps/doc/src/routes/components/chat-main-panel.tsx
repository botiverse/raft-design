import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
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
} from "lucide-react";
import type { ReactNode } from "react";
import { ChatMainPanelRoot } from "raft-ui/wip";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import {
  ChatMainPanelComposition,
  type ChatMainPanelCompositionProps,
} from "#/compositions/chat-main-panel-composition.tsx";
import chatMainPanelCompositionSource from "#/compositions/chat-main-panel-composition.tsx?raw";
import {
  ChatMainPanelChannelHeaderComposition,
  ChatMainPanelDmHeaderComposition,
} from "#/compositions/chat-main-panel-header-composition.tsx";
import chatMainPanelHeaderCompositionSource from "#/compositions/chat-main-panel-header-composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const CONVERSATIONS = ["channel", "dm"] as const;

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "combinations", title: "Combinations" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  anatomy: `<ChatMainPanelRoot>
  <ChatMainPanelHeader>
    <ChatMainPanelHeaderIcon />
    <ChatMainPanelTitleBlock>
      <ChatMainPanelTitle />
      <ChatMainPanelSubtitle />
    </ChatMainPanelTitleBlock>
    <ChatMainPanelActions>
      <PanelButton aria-label="Search conversation">
        <PanelButtonIcon />
      </PanelButton>
    </ChatMainPanelActions>
  </ChatMainPanelHeader>
  <ChatMainPanelContent>
    <ChatMainPanelTabs />
    <ChatMainPanelBody>
      <ChatMainPanelTimeline>
        <ChatMainPanelMessageList />
      </ChatMainPanelTimeline>
      <ChatMainPanelJumpToLatestLayout>
        <ChatMainPanelJumpToLatest />
      </ChatMainPanelJumpToLatestLayout>
    </ChatMainPanelBody>
    <ChatMainPanelFooter>
      <ComposerRoot>
        <Composer />
      </ComposerRoot>
    </ChatMainPanelFooter>
  </ChatMainPanelContent>
</ChatMainPanelRoot>`,
  chatMainPanelComposition: chatMainPanelCompositionSource,
  chatMainPanelHeaderComposition: chatMainPanelHeaderCompositionSource,
} as const;

type PlaygroundValues = {
  conversation: NonNullable<ChatMainPanelCompositionProps["conversation"]>;
  muted: boolean;
  banner: boolean;
  jumpToLatest: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "ChatMainPanelRoot",
    type: "section props",
    description: "Full-height active conversation surface between sidebar and panel stack.",
  },
  {
    name: "ChatMainPanelHeader / HeaderIcon / TitleBlock / TitleRow",
    type: "div props",
    description: "Header structure for caller-owned leading content, title metadata, and actions.",
  },
  {
    name: "ChatMainPanelTitle / Subtitle / TitleBadge / Actions",
    type: "div / span props",
    description: "Explicit title content and action regions; business copy remains caller-owned.",
  },
  {
    name: "PanelButton",
    type: "button props",
    description: "Shared panel action root for search, details, and app-owned commands.",
  },
  {
    name: "PanelButtonIcon / Label / Count",
    type: "span props",
    description:
      "Explicit content parts. Label is hidden below sm and enters layout at sm; Icon and Count remain visible at every size.",
  },
  {
    name: "ChatMainPanelContent",
    type: "div props",
    description: "Single content surface below the header, containing tabs, body, and footer.",
  },
  {
    name: "ChatMainPanelTabs / Body / Timeline / MessageList / Footer",
    type: "div / form props",
    description: "Tab chrome, positioned body, scroll owner, list flow, and footer boundary.",
  },
  {
    name: "ChatMainPanelJumpToLatestLayout / JumpToLatest",
    type: "div / button props",
    description: "Explicit positioning layout and independently rendered jump button.",
  },
  {
    name: "ComposerAttachment*",
    type: "div / span / img / button props",
    description:
      "Pending-upload strip above the composer: image and file tiles, uploading/failed overlays, progress bar, and remove affordance.",
  },
  {
    name: "ComposerDropOverlay / DropOverlayLabel",
    type: "div / span props",
    description: "Drag-and-drop overlay covering the composer form while files hover over it.",
  },
  {
    name: "Composer*",
    type: "div / span / textarea / button props",
    description: "Composer parts rendered inside ChatMainPanelFooter via ComposerRoot.",
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
      description="Active conversation panel between chat sidebar and panel stack."
      overview={
        <Differences from="Main chat content">
          <li>does not own message data, footer content, routing, or realtime subscriptions</li>
          <li>owns the panel header, tabs, content surface, scroll body, and footer boundary</li>
          <li>keeps product state and visible business structure in caller compositions</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            conversation: "channel",
            muted: false,
            banner: false,
            jumpToLatest: false,
          }}
          controls={[
            {
              name: "conversation",
              label: "Conversation",
              type: "select",
              options: CONVERSATIONS,
            },
            { name: "muted", label: "Muted", type: "boolean" },
            { name: "banner", label: "Banner", type: "boolean" },
            { name: "jumpToLatest", label: "Jump", type: "boolean" },
          ]}
          previewClassName="!min-h-[32rem] !items-stretch !p-0"
          render={(values) => (
            <div className="h-[32rem] w-full min-w-0 overflow-hidden">
              <ChatMainPanelComposition
                conversation={values.conversation}
                muted={values.muted}
                notificationError={
                  values.banner ? "Couldn’t update Activity mute for this conversation." : null
                }
                newMessageCount={values.jumpToLatest ? 3 : 0}
              />
            </div>
          )}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="ChatMainPanel.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          showLineNumbers={false}
        />
      </DocSection>

      <DocSection id="combinations" title="Combinations" showThemeSwitcher>
        <PreviewGrid>
          <PreviewPane label="Muted channel header">
            <PreviewThemeScope className="h-full">
              <HeaderPreview>
                <ChatMainPanelChannelHeaderComposition />
              </HeaderPreview>
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Direct message header">
            <PreviewThemeScope className="h-full">
              <HeaderPreview>
                <ChatMainPanelDmHeaderComposition />
              </HeaderPreview>
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Banner and jump-to-latest">
            <PreviewThemeScope className="h-full">
              <CurrentMainPanelPreview
                notificationError="Couldn’t update Activity mute for this conversation."
                newMessageCount={3}
              />
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
        <DocsCodeBlock.Panel
          path="apps/doc/src/compositions/chat-main-panel-header-composition.tsx"
          source={SNIPPETS.chatMainPanelHeaderComposition}
          html={code.chatMainPanelHeaderComposition}
          showLineNumbers={false}
        />
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

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
        <DocsCodeBlock.Panel
          path="apps/doc/src/compositions/chat-main-panel-composition.tsx"
          source={SNIPPETS.chatMainPanelComposition}
          html={code.chatMainPanelComposition}
          showLineNumbers={false}
        />
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
      <div className="flex h-[420px] items-stretch justify-start overflow-x-auto bg-white p-2">
        {children}
      </div>
    </div>
  );
}

function HeaderPreview({ children }: { children: ReactNode }) {
  return (
    <div className="h-full w-[560px] shrink-0 overflow-hidden bg-layer-panel [[data-theme=elegant]_&]:bg-layer-page">
      <ChatMainPanelRoot>{children}</ChatMainPanelRoot>
    </div>
  );
}

function CurrentMainPanelPreview(props: ChatMainPanelCompositionProps) {
  return (
    <div className="h-full w-[560px] shrink-0 overflow-hidden bg-layer-panel [[data-theme=elegant]_&]:bg-layer-page">
      <ChatMainPanelComposition {...props} />
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
            {[
              [
                "source-cindy",
                "Cindy",
                "10:42",
                "bg-brutal-lavender",
                "Rail and sidebar own navigation. The main panel owns the active conversation chrome.",
              ],
              [
                "source-atlas",
                "Atlas",
                "10:44",
                "bg-brutal-cyan",
                "Message rows, composer behavior, route sync, and realtime data stay app-owned.",
              ],
            ].map(([id, sender, time, avatarClass, message]) => (
              <div key={id} data-message-id={id}>
                <div className="px-3" style={{ contain: "layout style", overflow: "clip visible" }}>
                  <div className="group/message relative mt-1.5 mb-1 flex h-fit min-h-12 gap-3 border-2 border-transparent px-2 py-1 hover:border-black hover:bg-white active:border-black active:bg-white">
                    <div className="relative mt-0.5 shrink-0 self-start">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center overflow-hidden border-2 border-black ${avatarClass} text-black`}
                      >
                        <User className="size-4" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-24">
                        <span className="min-w-0 shrink-0 truncate text-sm font-bold text-black">
                          {sender}
                        </span>
                        <span className="shrink-0 whitespace-nowrap font-mono text-xs text-black/40">
                          {time}
                        </span>
                      </div>
                      <div className="break-words text-sm text-black">{message}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
