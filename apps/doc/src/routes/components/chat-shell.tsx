import { createFileRoute } from "@tanstack/react-router";
import { NotificationCenter, NotificationCenterTrigger, Status } from "raft-ui";
import {
  AppPanelResizeHandle,
  AppPanelStackItem,
  AppPanelStackRoot,
  AppRailFooter,
  AppRailHeader,
  AppRailItem,
  AppRailItemBadge,
  AppRailItemIcon,
  AppRailItemIndicator,
  AppRailItemLabel,
  AppRailNav,
  AppRailRoot,
  AppRailUtilitySlot,
  AppShellMain,
  AppShellMobileBar,
  AppShellPanelStack,
  AppShellRail,
  AppShellRoot,
  AppShellSidebar,
  ChatSidebarBody,
  ChatSidebarFooter,
  ChatSidebarHeader,
  ChatSidebarItem,
  ChatSidebarItemAside,
  ChatSidebarItemBadge,
  ChatSidebarItemIcon,
  ChatSidebarItemSubtitle,
  ChatSidebarItemText,
  ChatSidebarItemTitle,
  ChatSidebarList,
  ChatSidebarRoot,
  ChatSidebarSection,
  ChatSidebarSectionAction,
  ChatSidebarSectionButton,
  ChatSidebarSectionCount,
  ChatSidebarSectionHeader,
  ChatSidebarSectionTitle,
} from "raft-ui/wip";
import {
  Activity,
  Bot,
  CheckSquare,
  ChevronRight,
  Hash,
  Home,
  MessageSquare,
  Monitor,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { ChatMainPanelComposition } from "#/compositions/chat-main-panel-composition.tsx";
import { ChatThreadPanelComposition } from "#/compositions/chat-thread-panel-composition.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "source-comparison", title: "Source comparison" },
  { id: "anatomy", title: "Anatomy" },
  { id: "mobile", title: "Mobile bar" },
  { id: "api", title: "API" },
] as const;

const TODOS = [
  "Add app-level keyboard and router integration in product code.",
  "Promote only after more source callsites exercise panel stacking and resize semantics.",
] as const;

const SNIPPETS = {
  anatomy: `import {
  AppShellRoot,
  AppShellRail,
  AppShellSidebar,
  AppShellMain,
  AppShellPanelStack,
  AppRailRoot,
  AppRailNav,
  AppRailItem,
  AppRailItemIcon,
  AppRailItemLabel,
  ChatSidebarRoot,
  AppPanelStackRoot,
  AppPanelStackItem,
  ChatMainPanelRoot,
  ChatThreadPanelRoot,
} from "raft-ui/wip";

<AppShellRoot>
  <AppShellRail>
    <AppRailRoot value={mode} onValueChange={setMode}>
      <AppRailNav>
        <AppRailItem value="chat">
          <AppRailItemIcon><MessageSquare /></AppRailItemIcon>
          <AppRailItemLabel>Chat</AppRailItemLabel>
        </AppRailItem>
      </AppRailNav>
    </AppRailRoot>
  </AppShellRail>

  <AppShellSidebar>
    <ChatSidebarRoot>...</ChatSidebarRoot>
  </AppShellSidebar>

  <AppShellMain>
    <ChatMainPanelRoot>...</ChatMainPanelRoot>
  </AppShellMain>

  <AppShellPanelStack>
    <AppPanelStackRoot>
      <AppPanelStackItem>
        <ChatThreadPanelRoot>...</ChatThreadPanelRoot>
      </AppPanelStackItem>
    </AppPanelStackRoot>
  </AppShellPanelStack>
</AppShellRoot>`,
  mobile: `<AppShellMobileBar>
  <div className="flex">
    <AppRailItem selected>
      <AppRailItemIcon><Home /></AppRailItemIcon>
      <AppRailItemLabel className="not-sr-only">Home</AppRailItemLabel>
    </AppRailItem>
    <AppRailItem>
      <AppRailItemIcon><CheckSquare /></AppRailItemIcon>
      <AppRailItemLabel className="not-sr-only">Tasks</AppRailItemLabel>
    </AppRailItem>
  </div>
</AppShellMobileBar>`,
} as const;

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "AppShellRoot",
    type: 'div props & { hidden?: boolean; presentation?: "desktop" | "mobile" }',
    description: "Owns the app-shell flex layout and theme-aware background contract.",
  },
  {
    name: "AppShellRail / Sidebar / Main / PanelStack / MobileBar",
    type: "region props",
    description: "Layout regions. Content remains caller-owned children.",
  },
  {
    name: "AppRailRoot",
    type: "{ value?: string; onValueChange?: (value: string) => void }",
    description: "Optional controlled rail selection. It does not own routing or data.",
  },
  {
    name: "AppRailItem",
    type: "button props & { value?: string; selected?: boolean; onSelect?: (value: string) => void }",
    description: "Selectable rail action. Icons, labels, badges, and indicators are child parts.",
  },
  {
    name: "ChatSidebar*",
    type: "div / section props",
    description: "Header, body, section, list, and footer slots for app-owned navigation rows.",
  },
  {
    name: "ChatMainPanel*",
    type: "section / div / button props",
    description:
      "Active conversation surface composed inside AppShellMain; messages and composer behavior stay app-owned.",
  },
  {
    name: "AppPanelStack*",
    type: "div / section props",
    description:
      "Right-side panel stack pieces. Width, open order, URL sync, and resize persistence stay app-owned.",
  },
  {
    name: "ChatThreadPanel*",
    type: "section / div / button props",
    description:
      "Thread panel surface composed inside AppPanelStackItem; message data and close behavior stay app-owned.",
  },
];

export const Route = createFileRoute("/components/chat-shell")({
  component: AppShellDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function AppShellDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="AppShell"
      description="Reusable app shell foundations for rail, sidebar, main content, right panels, and mobile tab chrome."
      overview={
        <Differences from="MainLayout, LeftRail, Sidebar, ThreadPanel">
          <li>
            source app stores, route memory, sockets, right-panel ordering, and resize persistence
            stay outside the UI package
          </li>
          <li>visible structure is children and flat parts; no icon props or config-object rows</li>
          <li>
            Brutal keeps the yellow rail, cream sidebar, white main panel, strong borders, and
            thread-panel divider
          </li>
        </Differences>
      }
      toc={TOC}
      articleClassName="max-w-none"
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <div className="flex flex-col gap-4">
          <PreviewPane label="Brutal">
            <PreviewThemeScope family="brutal" className="h-full">
              <AppShellPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <AppShellPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant dark">
            <PreviewThemeScope family="elegant" mode="dark" className="h-full dark">
              <AppShellPreview />
            </PreviewThemeScope>
          </PreviewPane>
        </div>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="app-shell.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          showLineNumbers={false}
        />
      </DocSection>

      <DocSection id="mobile" title="Mobile bar" showThemeSwitcher>
        <Example html={code.mobile} previewInset="flush">
          <PreviewThemeScope family="brutal">
            <div className="w-full max-w-md border-2 border-black bg-white">
              <MobileBarExample />
            </div>
          </PreviewThemeScope>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={ROOT_PROPS} />
      </DocSection>
    </DocPage>
  );
}

function PreviewPane({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-none border border-line bg-layer-panel">
      <div className="border-b border-line bg-layer-muted px-3 py-2 text-xs font-medium text-foreground-muted">
        {label}
      </div>
      <div className="h-[840px] overflow-x-auto bg-white p-2">{children}</div>
    </div>
  );
}

function AppShellPreview() {
  return (
    <AppShellRoot className="h-full min-w-[920px] border border-line-strong shadow-sm">
      <AppShellRail className="flex md:flex">
        <AppRailRoot value="chat">
          <AppRailHeader>
            <button
              type="button"
              className="relative inline-flex size-10 items-center justify-center border-2 border-line-strong bg-line-strong font-heading text-sm font-bold text-primary-400 shadow-sm [[data-preview-theme=elegant]_&]:size-9 [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border-[oklch(0_0_0)] [[data-preview-theme=elegant]_&]:bg-[oklch(0_0_0)] [[data-preview-theme=elegant]_&]:text-xs [[data-preview-theme=elegant]_&]:shadow-none"
              aria-label="Switch server"
            >
              R
              <AppRailItemIndicator className="right-0 top-0 [[data-preview-theme=elegant]_&]:hidden" />
            </button>
          </AppRailHeader>
          <AppRailNav className="[[data-preview-theme=elegant]_&]:px-2 [[data-preview-theme=elegant]_&]:pt-4">
            <RailItem value="search" label="Search" icon={<Search />} />
            <RailItem value="chat" label="Chat" icon={<MessageSquare />} />
            <RailItem value="activity" label="Activity" icon={<Activity />} indicator />
            <RailItem value="tasks" label="Tasks" icon={<CheckSquare />} />
            <RailItem value="members" label="Members" icon={<Users />} />
            <RailItem value="computers" label="Computers" icon={<Monitor />} indicator />
          </AppRailNav>
          <AppRailUtilitySlot className="[[data-preview-theme=elegant]_&]:pb-0">
            <NotificationCenter modal={false}>
              <NotificationCenterTrigger type="button" aria-label="Notification center" />
            </NotificationCenter>
          </AppRailUtilitySlot>
          <AppRailFooter>
            <RailItem value="settings" label="Settings" icon={<Settings />} />
          </AppRailFooter>
        </AppRailRoot>
      </AppShellRail>

      <AppShellSidebar className="flex md:flex">
        <ChatSidebarRoot>
          <ChatSidebarHeader>
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-bold text-foreground-strong [[data-preview-theme=elegant]_&]:font-heading [[data-preview-theme=elegant]_&]:text-[17px] [[data-preview-theme=elegant]_&]:font-medium [[data-preview-theme=elegant]_&]:text-foreground-muted">
                Chat
              </div>
            </div>
            <ChatSidebarSectionAction
              aria-label="New conversation"
              className="ml-auto hidden [[data-preview-theme=elegant]_&]:inline-flex"
            >
              <Plus />
            </ChatSidebarSectionAction>
          </ChatSidebarHeader>
          <ChatSidebarBody>
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-3 [[data-preview-theme=elegant]_&]:pb-7">
              <div className="min-h-full">
                <SidebarGroup title="Pinned">
                  <SidebarRow selected title="#proj-uiux" meta="Cindy replied" />
                  <SidebarRow title="#proj-theme" meta="Atlas is typing" badge="4" />
                </SidebarGroup>
                <SidebarGroup title="Agents">
                  <SidebarRow title="Cindy" meta="online" />
                  <SidebarRow title="Atlas" meta="idle" badge="1" />
                </SidebarGroup>
              </div>
            </div>
          </ChatSidebarBody>
          <ChatSidebarFooter>
            <div className="flex items-center gap-2 text-xs font-bold text-foreground-muted">
              <Bot className="size-4" />
              <span className="truncate">Live agent activity</span>
            </div>
          </ChatSidebarFooter>
        </ChatSidebarRoot>
      </AppShellSidebar>

      <AppShellMain className="flex">
        <ChatMainPanelComposition />
      </AppShellMain>

      <AppShellPanelStack className="flex lg:flex">
        <AppPanelStackRoot resizable>
          <AppPanelStackItem>
            <AppPanelResizeHandle />
            <ChatThreadPanelComposition />
          </AppPanelStackItem>
        </AppPanelStackRoot>
      </AppShellPanelStack>
    </AppShellRoot>
  );
}

function RailItem({
  value,
  label,
  icon,
  badge,
  indicator,
}: {
  value: string;
  label: string;
  icon: ReactNode;
  badge?: string;
  indicator?: boolean;
}) {
  return (
    <AppRailItem value={value} title={label} aria-label={label}>
      <AppRailItemIcon>{icon}</AppRailItemIcon>
      <AppRailItemLabel>{label}</AppRailItemLabel>
      {badge ? <AppRailItemBadge>{badge}</AppRailItemBadge> : null}
      {indicator ? <AppRailItemIndicator /> : null}
    </AppRailItem>
  );
}

function SidebarGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <ChatSidebarSection>
      <ChatSidebarSectionHeader className="[[data-preview-theme=elegant]_&]:mt-4 [[data-preview-theme=elegant]_&]:mb-0 [[data-preview-theme=elegant]_&]:h-8">
        <ChatSidebarSectionButton className="[[data-preview-theme=elegant]_&]:h-8">
          <ChatSidebarSectionTitle>{title}</ChatSidebarSectionTitle>
          <ChevronRight
            aria-hidden
            className="hidden size-2.5 shrink-0 [[data-preview-theme=elegant]_&]:inline-block"
          />
          <ChatSidebarSectionCount className="[[data-preview-theme=elegant]_&]:ml-auto">
            2
          </ChatSidebarSectionCount>
        </ChatSidebarSectionButton>
      </ChatSidebarSectionHeader>
      <ChatSidebarList>{children}</ChatSidebarList>
    </ChatSidebarSection>
  );
}

function SidebarRow({
  title,
  meta,
  selected,
  badge,
}: {
  title: string;
  meta: string;
  selected?: boolean;
  badge?: string;
}) {
  return (
    <ChatSidebarItem type="button" selected={selected}>
      <ChatSidebarItemIcon>
        <Hash className="size-3.5" />
      </ChatSidebarItemIcon>
      <ChatSidebarItemText stacked>
        <ChatSidebarItemTitle>{title}</ChatSidebarItemTitle>
        <ChatSidebarItemSubtitle>{meta}</ChatSidebarItemSubtitle>
      </ChatSidebarItemText>
      {meta === "online" ? (
        <ChatSidebarItemAside>
          <Status aria-hidden variant="accent" size="sm" />
        </ChatSidebarItemAside>
      ) : null}
      {badge ? (
        <ChatSidebarItemAside className="hidden [[data-preview-theme=elegant]_&]:flex">
          <ChatSidebarItemBadge>{badge}</ChatSidebarItemBadge>
        </ChatSidebarItemAside>
      ) : null}
    </ChatSidebarItem>
  );
}

function MobileBarExample() {
  return (
    <AppShellMobileBar>
      <div className="flex">
        <MobileBarItem selected icon={<Home />} label="Home" />
        <MobileBarItem icon={<CheckSquare />} label="Tasks" />
        <MobileBarItem icon={<Users />} label="Members" />
        <MobileBarItem icon={<Settings />} label="Settings" />
      </div>
    </AppShellMobileBar>
  );
}

function MobileBarItem({
  icon,
  label,
  selected,
}: {
  icon: ReactNode;
  label: string;
  selected?: boolean;
}) {
  return (
    <AppRailItem
      selected={selected}
      className="h-14 flex-1 flex-col gap-1 border-0 border-r-2 border-line-strong text-[10px] font-bold tracking-wide last:border-r-0 data-[selected=true]:bg-primary-400 data-[selected=true]:shadow-none"
      aria-label={label}
    >
      <AppRailItemIcon>{icon}</AppRailItemIcon>
      <AppRailItemLabel className="not-sr-only">{label}</AppRailItemLabel>
    </AppRailItem>
  );
}
