import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpDown,
  AtSign,
  Bell,
  BellOff,
  Bookmark,
  ChevronRight,
  Hash,
  ImagePlus,
  ListTodo,
  MessageSquare,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Send,
  Settings,
  Square,
  User,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { ChatSidebarComposition } from "#/compositions/chat-sidebar-composition.tsx";
import chatSidebarCompositionSource from "#/compositions/chat-sidebar-composition.tsx?raw";
import { SourceAppRailPreview } from "#/compositions/source-chat-rail-preview.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const CHAT_SIDEBAR_COMPOSITION_PATH = "apps/doc/src/compositions/chat-sidebar-composition.tsx";

const TOC = [
  { id: "source-comparison", title: "Source comparison" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  chatSidebarComposition: chatSidebarCompositionSource,
  anatomy: `import { AtSign, BellOff, ChevronRight, Hash, Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "raft-ui";
import {
  AppShellMain,
  AppShellSidebar,
  AppShellRail,
  AppShellRoot,
  AppRailRoot,
  ChatSidebarRoot,
  ChatSidebarHeader,
  ChatSidebarBody,
  ChatSidebarSection,
  ChatSidebarSectionHeader,
  ChatSidebarSectionButton,
  ChatSidebarSectionTitle,
  ChatSidebarSectionCount,
  ChatSidebarSectionActions,
  ChatSidebarSectionAction,
  ChatSidebarSectionIndicator,
  ChatSidebarList,
  ChatSidebarItem,
  ChatSidebarItemUnread,
  ChatSidebarItemAside,
  ChatSidebarItemBadge,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemDraft,
  ChatSidebarItemMention,
  ChatSidebarItemMuted,
  ChatSidebarItemSubtitle,
  ChatSidebarItemText,
  ChatSidebarItemTitle,
  ChatSidebarResizeGroup,
  ChatSidebarResizeHandle,
  ChatSidebarResizePanel,
  ChatMainPanelRoot,
} from "raft-ui/wip";

<AppShellRoot>
  <AppShellRail>
    <AppRailRoot>{rail}</AppRailRoot>
  </AppShellRail>
  <ChatSidebarResizeGroup orientation="horizontal">
    <ChatSidebarResizePanel defaultSize={308} minSize={180} maxSize={368}>
      <AppShellSidebar resizable>
        <ChatSidebarRoot>
          <ChatSidebarHeader>{header}</ChatSidebarHeader>
          <ChatSidebarBody>
            <ChatSidebarSection defaultOpen>
              <ChatSidebarSectionHeader>
                <ChatSidebarSectionButton>
                  <ChevronRight />
                  <ChatSidebarSectionTitle>Channels</ChatSidebarSectionTitle>
                  <ChatSidebarSectionCount>2</ChatSidebarSectionCount>
                  <ChatSidebarSectionIndicator />
                </ChatSidebarSectionButton>
                <ChatSidebarSectionActions>
                  <ChatSidebarSectionAction aria-label="Sort channels" />
                </ChatSidebarSectionActions>
              </ChatSidebarSectionHeader>
              <ChatSidebarList>
                <ChatSidebarItem aria-current="page">
                  <ChatSidebarItemChannelIcon aria-hidden><Hash /></ChatSidebarItemChannelIcon>
                  <ChatSidebarItemText>
                    <ChatSidebarItemTitle>#proj-uiux</ChatSidebarItemTitle>
                    <ChatSidebarItemSubtitle>Cindy replied</ChatSidebarItemSubtitle>
                    <ChatSidebarItemMuted aria-label="Activity muted">
                      <BellOff aria-hidden />
                    </ChatSidebarItemMuted>
                  </ChatSidebarItemText>
                  <ChatSidebarItemAside>
                    <ChatSidebarItemMention aria-label="Mentioned you">
                      <AtSign aria-hidden />
                    </ChatSidebarItemMention>
                    <ChatSidebarItemBadge>12</ChatSidebarItemBadge>
                    <ChatSidebarItemDraft aria-label="Draft">
                      <Pencil aria-hidden />
                    </ChatSidebarItemDraft>
                  </ChatSidebarItemAside>
                </ChatSidebarItem>
                <ChatSidebarItem aria-expanded>
                  <ChatSidebarItemIcon>
                    <Avatar size="sidebar" type="agent">
                      <AvatarFallback>A</AvatarFallback>
                    </Avatar>
                  </ChatSidebarItemIcon>
                  <ChatSidebarItemText>
                    <ChatSidebarItemTitle>Atlas</ChatSidebarItemTitle>
                    <ChatSidebarItemSubtitle>planning</ChatSidebarItemSubtitle>
                  </ChatSidebarItemText>
                </ChatSidebarItem>
              </ChatSidebarList>
            </ChatSidebarSection>
          </ChatSidebarBody>
        </ChatSidebarRoot>
      </AppShellSidebar>
    </ChatSidebarResizePanel>
    <ChatSidebarResizeHandle />
    <ChatSidebarResizePanel minSize={0}>
      <AppShellMain>
        <ChatMainPanelRoot>{conversation}</ChatMainPanelRoot>
      </AppShellMain>
    </ChatSidebarResizePanel>
  </ChatSidebarResizeGroup>
</AppShellRoot>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "AppShellSidebar",
    type: "aside props & { hidden?: boolean; resizable?: boolean }",
    description: "Sidebar column host. Use inside the resize panel when desktop width can change.",
  },
  {
    name: "ChatSidebarResizeGroup / Panel / Handle",
    type: "react-resizable-panels group / panel / separator props",
    description:
      "Sidebar-owned resize primitives. Keep rail outside the group and resize only the sidebar column.",
  },
  {
    name: "ChatSidebarRoot",
    type: "div props",
    description: "Full-height sidebar surface that keeps the header and scroll body aligned.",
  },
  {
    name: "ChatSidebarHeader / Body",
    type: "div props",
    description: "Column regions matching source sidebar chrome and scroll ownership.",
  },
  {
    name: "ChatSidebarSection / List",
    type: "section / div props",
    description: "Section and list wrappers for saved, pinned, channel, joint, and DM groups.",
  },
  {
    name: "SortableChatSidebarList",
    type: "ChatSidebarList props & { items: string[]; onReorder: (items: string[]) => void }",
    description:
      "Within-section dnd-kit reorder container. One instance per Pinned / Joint / Channels / DM list — no cross-section drag.",
  },
  {
    name: "SortableChatSidebarItem",
    type: "div props & { id: string; disabled?: boolean }",
    description: "Sortable row wrapper (source SortableSidebarItem). Wrap each ChatSidebarItem.",
  },
  {
    name: "ChatSidebarSectionHeader*",
    type: "div + button + span props",
    description:
      "Base UI Collapsible header parts for chevron, title, count, collapsed unread indicator, and action slots.",
  },
  {
    name: "ChatSidebarItem*",
    type: "button + span props",
    description:
      "Source-density row parts for visual/icon, channel icon, text, title, subtitle, meta, badge, indicator, and aside slots.",
  },
];

export const Route = createFileRoute("/components/chat-sidebar")({
  component: ChatSidebarDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ChatSidebarDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ChatSidebar"
      description="Controlled chat sidebar column structure for saved items, pinned items, channels, joint channels, and direct messages."
      overview={
        <Differences from="Sidebar">
          <li>does not own stores, sorting, context menus, drag state, or create dialogs</li>
          <li>
            keeps source column shape: cream sidebar, panel-header height, and scrollable body
          </li>
          <li>
            rows remain children so products can compose MediaListItem, SectionHeader, badges, and
            menus
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="source-comparison" title="Source comparison">
        <PreviewGrid>
          <PreviewPane label="Source">
            <SourceThemeScope className="h-full">
              <SourceSidebarPreview />
            </SourceThemeScope>
          </PreviewPane>
          <PreviewPane label="Brutal">
            <PreviewThemeScope family="brutal" className="h-full w-[950px] shrink-0">
              <ChatSidebarComposition />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full w-[950px] shrink-0">
              <ChatSidebarComposition />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant dark">
            <PreviewThemeScope
              family="elegant"
              mode="dark"
              className="dark h-full w-[950px] shrink-0"
            >
              <ChatSidebarComposition />
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
        <DocsCodeBlock.Panel
          path={CHAT_SIDEBAR_COMPOSITION_PATH}
          source={chatSidebarCompositionSource}
          html={code.chatSidebarComposition}
          collapsedHtml={code.chatSidebarCompositionBody}
          showLineNumbers={false}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="chat-sidebar.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
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
      <div className="flex h-[560px] items-stretch justify-start overflow-x-auto bg-white p-2">
        {children}
      </div>
    </div>
  );
}

function SourceSidebarPreview() {
  return (
    <div className="relative flex h-full w-[950px] min-w-[865px] shrink-0 overflow-hidden border-2 border-black bg-brutal-cream font-sans text-black">
      <SourceAppRailPreview />
      <div className="flex h-full w-60 shrink-0 flex-col border-r-2 border-black bg-brutal-cream text-black">
        <div className="flex h-[62px] shrink-0 items-center border-b-2 border-black bg-brutal-cream px-5">
          <div className="text-lg font-bold text-black">Chat</div>
        </div>
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-3">
            <div className="min-h-full">
              <SourceSidebarNavRow icon={<Bookmark className="size-3.5 shrink-0" />} label="Saved">
                <span className="ml-auto font-mono text-[10px] text-black/40">2</span>
              </SourceSidebarNavRow>
              <SourceSection
                title="Pinned"
                count="3"
                actions={<SourceSectionIcon icon={<ArrowUpDown size={14} />} />}
              >
                <SourceSidebarRow selected title="#proj-uiux" description="Cindy replied" />
                <SourceSidebarRow
                  title="Atlas"
                  description="planning"
                  menuOpen
                  visual={<span className="text-[9px] font-bold">A</span>}
                  aside={
                    <span className="size-2.5 rounded-full border border-black bg-brutal-lime" />
                  }
                />
                <SourceSidebarRow
                  title="#proj-theme"
                  aside={<Pencil className="size-3 text-black/40" />}
                />
              </SourceSection>
              <SourceSection
                title="Joint Channels"
                count="1"
                collapsed
                unread
                actions={<SourceSectionIcon icon={<ArrowUpDown size={14} />} />}
              />
              <SourceSection
                title="Channels"
                count="2"
                actions={
                  <>
                    <SourceSectionIcon icon={<ArrowUpDown size={14} />} />
                    <SourceSectionIcon icon={<Plus size={14} />} />
                  </>
                }
              >
                <SourceSidebarRow title="#general" bold badge="12" mention />
                <SourceSidebarRow
                  title="#release"
                  muted
                  aside={<Pencil className="size-3 text-black/40" />}
                />
              </SourceSection>
              <SourceSection
                title="Direct Messages"
                count="2"
                actions={<SourceSectionIcon icon={<ArrowUpDown size={14} />} />}
              >
                <SourceSidebarRow
                  title="Cindy"
                  description="design"
                  bold
                  visual={<span className="text-[9px] font-bold">C</span>}
                  aside={
                    <span className="flex shrink-0 items-center gap-1.5">
                      <span className="size-2.5 rounded-full border border-black bg-brutal-lime" />
                      <span className="rounded border border-black bg-brutal-pink px-1.5 py-0.5 text-[10px] leading-none font-bold text-white">
                        4
                      </span>
                    </span>
                  }
                />
                <SourceSidebarRow
                  title="Atlas"
                  description="idle"
                  visual={<User className="size-2.5" />}
                  aside={<Pencil className="size-3 text-black/40" />}
                />
              </SourceSection>
            </div>
          </div>
        </div>
      </div>
      <div className="relative h-full w-px shrink-0">
        <div className="absolute top-0 bottom-0 left-0 z-10 hidden w-2 -translate-x-1 cursor-col-resize select-none md:block" />
      </div>
      <SourceSidebarMainPreview />
    </div>
  );
}

function SourceSidebarMainPreview() {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-white text-black">
      <div className="flex h-[62px] shrink-0 items-center gap-3 border-b-2 border-black bg-white px-5">
        <div className="flex size-9 shrink-0 items-center justify-center border-2 border-black bg-soft-signal">
          <Hash className="size-[18px]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-bold leading-tight">proj-uiux</div>
          <div className="truncate font-mono text-xs text-black/50">Design system migration</div>
        </div>
        <SourceMainAction label="Search conversation" icon={<Search className="size-3.5" />} />
        <SourceMainAction label="Mute channel activity" icon={<Bell className="size-3.5" />} />
        <SourceMainAction
          label="Stop all agents in this channel"
          icon={<Square className="size-3.5" />}
        />
        <SourceMainAction label="Channel options" icon={<Settings className="size-3.5" />} />
        <SourceMainAction label="Channel members" icon={<Users className="size-3.5" />} />
      </div>
      <div className="shrink-0 border-b-2 border-black bg-white">
        <div className="flex w-max max-w-full items-stretch overflow-x-auto border-r-2 border-black bg-white">
          <SourceMainTab active icon={<MessageSquare className="size-3.5" />} label="Chat" />
          <SourceMainTab icon={<ListTodo className="size-3.5" />} label="Tasks" />
          <SourceMainTab icon={<Paperclip className="size-3.5" />} label="Files" />
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
            <SourceMainMessage author="Cindy" time="10:42">
              Rail and sidebar own navigation. The main panel owns the active conversation chrome.
            </SourceMainMessage>
            <SourceMainMessage author="Atlas" avatarTone="bg-brutal-cyan" time="10:44">
              Message rows, composer behavior, route sync, and realtime data stay app-owned.
            </SourceMainMessage>
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
              <SourceMainAction label="Attach image" icon={<ImagePlus className="size-3.5" />} />
              <SourceMainAction label="Attach file" icon={<Paperclip className="size-3.5" />} />
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

function SourceMainAction({ label, icon }: { label: string; icon: ReactNode }) {
  return (
    <button
      type="button"
      className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
      aria-label={label}
    >
      {icon}
    </button>
  );
}

function SourceMainTab({
  active,
  icon,
  label,
}: {
  active?: boolean;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`relative z-10 inline-flex shrink-0 touch-manipulation items-center gap-1.5 whitespace-nowrap px-4 py-1.5 text-xs font-semibold outline-none ${
        active
          ? "bg-soft-signal"
          : "bg-white before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-black"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SourceMainMessage({
  author,
  avatarTone = "bg-brutal-lavender",
  children,
  time,
}: {
  author: string;
  avatarTone?: string;
  children: ReactNode;
  time: string;
}) {
  return (
    <div data-message-id={`source-${author.toLowerCase()}`}>
      <div className="px-3" style={{ contain: "layout style", overflow: "clip visible" }}>
        <div className="group/message relative mt-1.5 mb-1 flex h-fit min-h-12 gap-3 border-2 border-transparent px-2 py-1 hover:border-black hover:bg-white active:border-black active:bg-white">
          <div className="relative mt-0.5 shrink-0 self-start">
            <div
              className={`flex size-9 shrink-0 items-center justify-center overflow-hidden border-2 border-black text-black ${avatarTone}`}
            >
              <User className="size-4" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2 overflow-hidden pr-24">
              <span className="min-w-0 shrink-0 truncate text-sm font-bold text-black">
                {author}
              </span>
              <span className="shrink-0 whitespace-nowrap font-mono text-xs text-black/40">
                {time}
              </span>
            </div>
            <div className="break-words text-sm text-black">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceSection({
  title,
  count,
  actions,
  children,
  collapsed,
  unread,
}: {
  title: string;
  count: string;
  actions?: ReactNode;
  children?: ReactNode;
  collapsed?: boolean;
  unread?: boolean;
}) {
  return (
    <div>
      <div className="mt-3 mb-1 flex h-6 items-center justify-between px-2">
        <button
          type="button"
          className="flex h-6 min-w-0 flex-1 items-center gap-1 text-xs font-bold tracking-widest text-black uppercase transition-colors hover:text-black/70"
        >
          <ChevronRight className={`size-3 transition-transform ${collapsed ? "" : "rotate-90"}`} />
          <span className="truncate">{title}</span>
          <span className="font-mono tracking-normal normal-case text-black/40">{count}</span>
          {collapsed && unread && (
            <span className="ml-1 size-2.5 shrink-0 rounded-full border border-black bg-brutal-pink" />
          )}
        </button>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </div>
      {!collapsed && children}
    </div>
  );
}

function SourceSectionIcon({ icon }: { icon: ReactNode }) {
  return (
    <button type="button" className="btn-flat-sm flex size-6 items-center justify-center p-0">
      {icon}
    </button>
  );
}

function SourceSidebarNavRow({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      className="mb-1 flex w-full items-center gap-1.5 border-2 border-transparent px-2 py-2 text-left text-sm font-medium transition-colors hover:border-black hover:bg-white hover:shadow-brutal-sm active:border-black active:bg-white active:shadow-brutal-sm [@media(max-height:600px)]:py-1 md:py-1"
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {children}
    </button>
  );
}

function SourceSidebarRow({
  title,
  selected,
  menuOpen,
  visual,
  bold,
  muted,
  badge,
  mention,
  description,
  aside,
}: {
  title: string;
  selected?: boolean;
  menuOpen?: boolean;
  visual?: ReactNode;
  bold?: boolean;
  muted?: boolean;
  badge?: string;
  mention?: boolean;
  description?: string;
  aside?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`mb-1 flex w-full items-center gap-1.5 border-2 px-2 py-2 text-sm font-medium [@media(max-height:600px)]:py-1 md:py-1 ${
        selected
          ? "border-black bg-brutal-pink font-bold text-black shadow-brutal-sm"
          : menuOpen
            ? "border-black bg-white shadow-brutal-sm"
            : "border-transparent transition-colors hover:border-black hover:bg-white hover:shadow-brutal-sm active:border-black active:bg-white active:shadow-brutal-sm"
      }`}
    >
      <span className="flex size-[18px] shrink-0 items-center justify-center">
        {visual ?? <Hash className="size-3.5" />}
      </span>
      <span
        className={`flex min-w-0 flex-1 text-left ${description ? "items-baseline gap-1" : "items-center"}`}
      >
        <span
          className={`min-w-0 truncate ${bold ? "font-bold" : ""} ${muted ? "text-black/70" : ""}`}
        >
          {title}
        </span>
        {description && (
          <span className="min-w-0 flex-1 truncate text-xs text-black/40">{description}</span>
        )}
        {muted && (
          <span className="ml-1 inline-flex size-4 shrink-0 items-center justify-center text-black/40">
            <BellOff className="size-3" />
          </span>
        )}
      </span>
      {mention && (
        <span className="ml-1 inline-flex size-4 shrink-0 items-center justify-center rounded border border-black bg-soft-signal text-black">
          <AtSign className="size-2.5" />
        </span>
      )}
      {badge && (
        <span className="ml-auto shrink-0 rounded border border-black bg-brutal-pink px-1.5 py-0.5 text-[10px] leading-none font-bold text-white">
          {badge}
        </span>
      )}
      {aside}
    </button>
  );
}
