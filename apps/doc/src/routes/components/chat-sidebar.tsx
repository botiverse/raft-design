import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpDown,
  AtSign,
  BellOff,
  Bookmark,
  ChevronRight,
  Hash,
  MessageSquare,
  Pencil,
  Plus,
  User,
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
import { SourceChatRailPreview } from "#/compositions/source-chat-rail-preview.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const CHAT_SIDEBAR_COMPOSITION_PATH = "apps/doc/src/compositions/chat-sidebar-composition.tsx";

const TOC = [
  { id: "source-comparison", title: "Source comparison" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  chatSidebarComposition: chatSidebarCompositionSource,
  anatomy: `import { ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "raft-ui";
import {
  ChatShellSidebar,
  ChatShellRail,
  ChatRailRoot,
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
  ChatSidebarItemAside,
  ChatSidebarItemBadge,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemDraft,
  ChatSidebarItemIndicator,
  ChatSidebarItemMention,
  ChatSidebarItemMuted,
  ChatSidebarItemSubtitle,
  ChatSidebarItemText,
  ChatSidebarItemTitle,
  ChatSidebarResizeGroup,
  ChatSidebarResizeHandle,
  ChatSidebarResizePanel,
} from "raft-ui/wip";

<>
  <ChatShellRail>
    <ChatRailRoot>{rail}</ChatRailRoot>
  </ChatShellRail>
  <ChatSidebarResizeGroup orientation="horizontal">
    <ChatSidebarResizePanel defaultSize={240} minSize={180} maxSize={320}>
      <ChatShellSidebar resizable>
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
                <ChatSidebarItem selected>
                  <ChatSidebarItemChannelIcon />
                  <ChatSidebarItemText>
                    <ChatSidebarItemTitle>#proj-uiux</ChatSidebarItemTitle>
                    <ChatSidebarItemSubtitle>Cindy replied</ChatSidebarItemSubtitle>
                  </ChatSidebarItemText>
                  <ChatSidebarItemIndicator>
                    <ChatSidebarItemMention />
                  </ChatSidebarItemIndicator>
                  <ChatSidebarItemAside>
                    <ChatSidebarItemBadge>12</ChatSidebarItemBadge>
                    <ChatSidebarItemDraft />
                    <ChatSidebarItemMuted />
                  </ChatSidebarItemAside>
                </ChatSidebarItem>
                <ChatSidebarItem menuOpen>
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
      </ChatShellSidebar>
    </ChatSidebarResizePanel>
    <ChatSidebarResizeHandle />
    <ChatSidebarResizePanel minSize={0} />
  </ChatSidebarResizeGroup>
</>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "ChatShellSidebar",
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
            <PreviewThemeScope family="brutal" className="h-full">
              <ChatSidebarComposition />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <ChatSidebarComposition />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant dark">
            <PreviewThemeScope family="elegant" mode="dark" className="h-full dark">
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
      <div className="flex h-[560px] items-stretch justify-start overflow-x-auto bg-background p-2">
        {children}
      </div>
    </div>
  );
}

function SourceSidebarPreview() {
  return (
    <div className="relative flex h-full w-[304px] shrink-0 overflow-hidden bg-brutal-cream font-display text-black">
      <SourceChatRailPreview />
      <div className="flex h-full w-60 shrink-0 flex-col border-r-2 border-black bg-brutal-cream text-black">
        <div className="flex h-[62px] shrink-0 items-center border-b-2 border-black bg-brutal-cream px-5">
          <div className="text-lg font-bold text-black">Chat</div>
        </div>
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-3">
            <div className="min-h-full">
              <SourceSidebarNavRow icon={<Bookmark className="size-3.5" />} label="Saved">
                <span className="ml-auto font-mono text-[10px] text-black/40">2</span>
              </SourceSidebarNavRow>
              <SourceSection
                title="Pinned"
                count="3"
                actions={<SourceSectionIcon icon={<ArrowUpDown size={14} />} />}
              >
                <SourceSidebarRow selected title="#proj-uiux" meta="Cindy replied" />
                <SourceSidebarRow
                  title="Atlas"
                  description="planning"
                  menuOpen
                  visual={<span className="text-[9px] font-bold">A</span>}
                  aside={
                    <span className="size-2 rounded-full border border-black bg-brutal-lime" />
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
                      <span className="size-2 rounded-full border border-black bg-brutal-lime" />
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
                  aside={<MessageSquare className="size-3 text-black/40" />}
                />
              </SourceSection>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-0 right-0 bottom-0 z-10 hidden w-2 -mr-1 cursor-col-resize select-none md:block" />
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
          <span className="font-mono text-[10px] font-normal tracking-normal text-black/40">
            {count}
          </span>
          {collapsed && unread && (
            <span className="ml-1 size-[11px] rounded-full border border-black bg-brutal-pink" />
          )}
        </button>
        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
      </div>
      {!collapsed && <div className="space-y-1">{children}</div>}
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
      <span className="flex size-[18px] shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {children}
    </button>
  );
}

function SourceSidebarRow({
  title,
  meta,
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
  meta?: string;
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
      <span className="flex min-w-0 flex-1 items-baseline gap-1 text-left">
        <span
          className={`min-w-0 truncate ${bold ? "font-bold" : ""} ${muted ? "text-black/70" : ""}`}
        >
          {title}
        </span>
        {description && (
          <span className="min-w-0 flex-1 truncate text-xs text-black/40">{description}</span>
        )}
        {meta && <span className="block truncate font-mono text-[11px] text-black/50">{meta}</span>}
      </span>
      {mention && (
        <span className="ml-1 inline-flex size-4 shrink-0 items-center justify-center rounded border border-black bg-soft-signal text-black">
          <AtSign className="size-2.5" />
        </span>
      )}
      {muted && <BellOff className="size-3 shrink-0 text-black/40" />}
      {badge && (
        <span className="ml-auto shrink-0 rounded border border-black bg-brutal-pink px-1.5 py-0.5 text-[10px] leading-none font-bold text-white">
          {badge}
        </span>
      )}
      {aside}
    </button>
  );
}
