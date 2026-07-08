import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "raft-ui";
import {
  ChatPanelResizeHandle,
  ChatPanelStackContent,
  ChatPanelStackItem,
  ChatPanelStackRoot,
  ChatRailFooter,
  ChatRailHeader,
  ChatRailItem,
  ChatRailItemBadge,
  ChatRailItemIcon,
  ChatRailItemIndicator,
  ChatRailItemLabel,
  ChatRailNav,
  ChatRailRoot,
  ChatShellMain,
  ChatShellMobileBar,
  ChatShellPanelStack,
  ChatShellRail,
  ChatShellRoot,
  ChatShellSidebar,
  ChatSidebarBody,
  ChatSidebarFooter,
  ChatSidebarHeader,
  ChatSidebarList,
  ChatSidebarRoot,
  ChatSidebarSection,
} from "raft-ui/wip";
import {
  Bell,
  Bot,
  CheckSquare,
  Hash,
  Home,
  MessageSquare,
  Monitor,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
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
  ChatShellRoot,
  ChatShellRail,
  ChatShellSidebar,
  ChatShellMain,
  ChatShellPanelStack,
  ChatRailRoot,
  ChatRailNav,
  ChatRailItem,
  ChatRailItemIcon,
  ChatRailItemLabel,
  ChatSidebarRoot,
  ChatPanelStackRoot,
  ChatPanelStackItem,
  ChatPanelStackContent,
} from "raft-ui/wip";

<ChatShellRoot>
  <ChatShellRail>
    <ChatRailRoot value={mode} onValueChange={setMode}>
      <ChatRailNav>
        <ChatRailItem value="chat">
          <ChatRailItemIcon><MessageSquare /></ChatRailItemIcon>
          <ChatRailItemLabel>Chat</ChatRailItemLabel>
        </ChatRailItem>
      </ChatRailNav>
    </ChatRailRoot>
  </ChatShellRail>

  <ChatShellSidebar>
    <ChatSidebarRoot>...</ChatSidebarRoot>
  </ChatShellSidebar>

  <ChatShellMain>...</ChatShellMain>

  <ChatShellPanelStack>
    <ChatPanelStackRoot>
      <ChatPanelStackItem>
        <ChatPanelStackContent>...</ChatPanelStackContent>
      </ChatPanelStackItem>
    </ChatPanelStackRoot>
  </ChatShellPanelStack>
</ChatShellRoot>`,
  mobile: `<ChatShellMobileBar>
  <div className="flex">
    <ChatRailItem selected>
      <ChatRailItemIcon><Home /></ChatRailItemIcon>
      <ChatRailItemLabel className="not-sr-only">Home</ChatRailItemLabel>
    </ChatRailItem>
    <ChatRailItem>
      <ChatRailItemIcon><CheckSquare /></ChatRailItemIcon>
      <ChatRailItemLabel className="not-sr-only">Tasks</ChatRailItemLabel>
    </ChatRailItem>
  </div>
</ChatShellMobileBar>`,
} as const;

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "ChatShellRoot",
    type: 'div props & { hidden?: boolean; presentation?: "desktop" | "mobile" }',
    description: "Owns the app-shell flex layout and theme-aware background contract.",
  },
  {
    name: "ChatShellRail / Sidebar / Main / PanelStack / MobileBar",
    type: "region props",
    description: "Layout regions. Content remains caller-owned children.",
  },
  {
    name: "ChatRailRoot",
    type: "{ value?: string; onValueChange?: (value: string) => void }",
    description: "Optional controlled rail selection. It does not own routing or data.",
  },
  {
    name: "ChatRailItem",
    type: "button props & { value?: string; selected?: boolean; onSelect?: (value: string) => void }",
    description: "Selectable rail action. Icons, labels, badges, and indicators are child parts.",
  },
  {
    name: "ChatSidebar*",
    type: "div / section props",
    description: "Header, body, section, list, and footer slots for app-owned navigation rows.",
  },
  {
    name: "ChatPanelStack*",
    type: "div / section props",
    description:
      "Right-side panel stack pieces. Resize behavior is app-owned; the handle is only the visual/DOM affordance.",
  },
];

export const Route = createFileRoute("/components/chat-shell")({
  component: ChatShellDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ChatShellDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ChatShell"
      description="App-level chat shell foundations for rail, sidebar, main content, right panels, and mobile tab chrome."
      overview={
        <Differences from="MainLayout, LeftRail, Sidebar, ThreadPanel">
          <li>
            source app stores, route memory, sockets, and resize persistence stay outside the UI
            package
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

      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1fr_1fr_1fr]">
          <PreviewPane label="Source">
            <SourceShellPreview />
          </PreviewPane>
          <PreviewPane label="Brutal">
            <PreviewThemeScope family="brutal" className="h-full">
              <ChatShellPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <ChatShellPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant dark">
            <PreviewThemeScope family="elegant" mode="dark" className="h-full dark">
              <ChatShellPreview />
            </PreviewThemeScope>
          </PreviewPane>
        </div>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="chat-shell.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          showLineNumbers={false}
        />
      </DocSection>

      <DocSection id="mobile" title="Mobile bar">
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
      <div className="h-[420px] bg-background p-2">{children}</div>
    </div>
  );
}

function ChatShellPreview() {
  return (
    <ChatShellRoot className="h-full border border-line-strong shadow-sm">
      <ChatShellRail className="flex w-14 md:flex">
        <ChatRailRoot value="chat">
          <ChatRailHeader className="h-14">
            <button
              type="button"
              className="relative inline-flex size-9 items-center justify-center border-2 border-line-strong bg-line-strong font-heading text-sm font-bold text-primary-400 shadow-sm [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border-line-subtle [[data-theme=elegant]_&]:bg-foreground-strong"
              aria-label="Switch server"
            >
              R
              <ChatRailItemIndicator className="right-0 top-0" />
            </button>
          </ChatRailHeader>
          <ChatRailNav>
            <RailItem value="search" label="Search" icon={<Search />} />
            <RailItem value="chat" label="Chat" icon={<MessageSquare />} badge="3" />
            <RailItem value="tasks" label="Tasks" icon={<CheckSquare />} />
            <RailItem value="members" label="Members" icon={<Users />} />
            <RailItem value="computers" label="Computers" icon={<Monitor />} indicator />
          </ChatRailNav>
          <ChatRailFooter>
            <RailItem value="notifications" label="Notifications" icon={<Bell />} indicator />
            <RailItem value="settings" label="Settings" icon={<Settings />} />
          </ChatRailFooter>
        </ChatRailRoot>
      </ChatShellRail>

      <ChatShellSidebar className="flex w-56 md:flex">
        <ChatSidebarRoot>
          <ChatSidebarHeader className="min-h-14">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center border-2 border-line-strong bg-primary-400 text-foreground-strong [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border-line-subtle">
                <Hash className="size-4" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-foreground-strong">
                  Design system
                </div>
                <div className="truncate font-mono text-[11px] text-foreground-muted">
                  18 members
                </div>
              </div>
            </div>
          </ChatSidebarHeader>
          <ChatSidebarBody>
            <SidebarGroup title="Pinned">
              <SidebarRow selected title="#proj-uiux" meta="Cindy replied" />
              <SidebarRow title="#proj-theme" meta="Atlas is typing" tone="cyan" />
            </SidebarGroup>
            <SidebarGroup title="Agents">
              <SidebarRow title="Cindy" meta="online" tone="lime" />
              <SidebarRow title="Atlas" meta="idle" />
            </SidebarGroup>
          </ChatSidebarBody>
          <ChatSidebarFooter>
            <div className="flex items-center gap-2 text-xs font-bold text-foreground-muted">
              <Bot className="size-4" />
              <span className="truncate">Live agent activity</span>
            </div>
          </ChatSidebarFooter>
        </ChatSidebarRoot>
      </ChatShellSidebar>

      <ChatShellMain className="flex">
        <div className="flex h-14 shrink-0 items-center border-b-2 border-line-strong bg-layer-panel px-4 [[data-theme=elegant]_&]:border-line-subtle">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold text-foreground-strong">#proj-uiux</div>
            <div className="truncate font-mono text-[11px] text-foreground-muted">
              Controlled layout shell, data-free content
            </div>
          </div>
          <Badge appearance="solid" variant="information" className="shrink-0">
            WIP
          </Badge>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-layer-panel p-4">
          <MessageBubble author="Cindy" tone="pink">
            Rail state should be controlled by product routing, not hidden inside the shell.
          </MessageBubble>
          <MessageBubble author="Atlas" tone="cyan">
            Panel stack stays data-free, but it exposes the resize handle affordance.
          </MessageBubble>
        </div>
      </ChatShellMain>

      <ChatShellPanelStack className="flex w-64 lg:flex">
        <ChatPanelStackRoot resizable>
          <ChatPanelStackItem className="w-full">
            <ChatPanelResizeHandle />
            <div className="flex h-14 items-center gap-2 border-b-2 border-line-strong bg-layer-panel px-3 [[data-theme=elegant]_&]:border-line-subtle">
              <div className="min-w-0 flex-1 truncate text-sm font-bold text-foreground-strong">
                Thread
              </div>
              <button
                type="button"
                className="flex size-7 items-center justify-center border-2 border-line-strong bg-layer-panel text-foreground-strong shadow-xs [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border-line-subtle"
                aria-label="Close thread"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <ChatPanelStackContent>
              <div className="space-y-3 p-3">
                <MessageBubble author="Thread" tone="yellow">
                  Source ThreadPanel content lives inside a host-owned right column.
                </MessageBubble>
                <div className="border-t-2 border-line-strong pt-3 text-xs text-foreground-muted [[data-theme=elegant]_&]:border-line-subtle">
                  Reply composer slot
                </div>
              </div>
            </ChatPanelStackContent>
          </ChatPanelStackItem>
        </ChatPanelStackRoot>
      </ChatShellPanelStack>
    </ChatShellRoot>
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
    <ChatRailItem value={value} title={label} aria-label={label}>
      <ChatRailItemIcon>{icon}</ChatRailItemIcon>
      <ChatRailItemLabel>{label}</ChatRailItemLabel>
      {badge ? <ChatRailItemBadge>{badge}</ChatRailItemBadge> : null}
      {indicator ? <ChatRailItemIndicator /> : null}
    </ChatRailItem>
  );
}

function SidebarGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <ChatSidebarSection className="mb-3">
      <div className="mb-1 flex h-6 items-center px-1 text-[11px] font-bold uppercase tracking-wider text-foreground-muted">
        {title}
      </div>
      <ChatSidebarList>{children}</ChatSidebarList>
    </ChatSidebarSection>
  );
}

function SidebarRow({
  title,
  meta,
  selected,
  tone = "yellow",
}: {
  title: string;
  meta: string;
  selected?: boolean;
  tone?: "yellow" | "cyan" | "lime";
}) {
  const toneClassName = {
    yellow: "bg-primary-400",
    cyan: "bg-info-base",
    lime: "bg-success-base",
  }[tone];

  return (
    <button
      type="button"
      data-selected={selected ? "true" : undefined}
      className="flex w-full items-center gap-2 border-2 border-transparent px-2 py-2 text-left text-sm font-medium transition-colors hover:border-line-strong hover:bg-layer-panel hover:shadow-sm data-[selected=true]:border-line-strong data-[selected=true]:bg-accent-400/80 data-[selected=true]:font-bold data-[selected=true]:shadow-sm [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border [[data-theme=elegant]_&]:border-transparent [[data-theme=elegant]_&]:data-[selected=true]:border-line-subtle [[data-theme=elegant]_&]:data-[selected=true]:bg-layer-muted"
    >
      <span className={`size-3 shrink-0 border border-line-strong ${toneClassName}`} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-foreground-strong">{title}</span>
        <span className="block truncate font-mono text-[11px] text-foreground-muted">{meta}</span>
      </span>
    </button>
  );
}

function MessageBubble({
  author,
  tone,
  children,
}: {
  author: string;
  tone: "pink" | "cyan" | "yellow";
  children: ReactNode;
}) {
  const toneClassName = {
    pink: "bg-accent-400/30",
    cyan: "bg-info-base/25",
    yellow: "bg-primary-400/25",
  }[tone];

  return (
    <div
      className={`border-2 border-line-strong bg-layer-panel p-3 text-sm shadow-xs [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border-line-subtle ${toneClassName}`}
    >
      <div className="mb-1 font-mono text-[11px] font-bold text-foreground-muted">{author}</div>
      <div className="leading-relaxed text-foreground-strong">{children}</div>
    </div>
  );
}

function MobileBarExample() {
  return (
    <ChatShellMobileBar>
      <div className="flex">
        <MobileBarItem selected icon={<Home />} label="Home" />
        <MobileBarItem icon={<CheckSquare />} label="Tasks" />
        <MobileBarItem icon={<Users />} label="Members" />
        <MobileBarItem icon={<Settings />} label="Settings" />
      </div>
    </ChatShellMobileBar>
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
    <ChatRailItem
      selected={selected}
      className="h-14 flex-1 flex-col gap-1 border-0 border-r-2 border-line-strong text-[10px] font-bold tracking-wide last:border-r-0 data-[selected=true]:bg-primary-400 data-[selected=true]:shadow-none"
      aria-label={label}
    >
      <ChatRailItemIcon>{icon}</ChatRailItemIcon>
      <ChatRailItemLabel className="not-sr-only">{label}</ChatRailItemLabel>
    </ChatRailItem>
  );
}

function SourceShellPreview() {
  return (
    <div className="flex h-full min-h-0 overflow-hidden border-2 border-black bg-brutal-cream font-sans text-black">
      <div className="hidden w-14 shrink-0 flex-col items-center border-r-2 border-black bg-soft-signal md:flex">
        <div className="flex h-14 w-full items-center justify-center border-b-2 border-black">
          <div className="flex size-9 items-center justify-center border-2 border-black bg-black font-bold text-soft-signal shadow-brutal-sm">
            R
          </div>
        </div>
        <div className="flex flex-1 flex-col items-center gap-1.5 py-2">
          <SourceRailButton icon={<Search />} />
          <SourceRailButton active icon={<MessageSquare />} dot />
          <SourceRailButton icon={<CheckSquare />} />
          <SourceRailButton icon={<Users />} />
          <SourceRailButton icon={<Monitor />} />
        </div>
        <div className="flex min-h-14 flex-col items-center justify-center gap-1.5 pb-2">
          <SourceRailButton icon={<Bell />} dot />
          <SourceRailButton icon={<Settings />} />
        </div>
      </div>
      <div className="hidden w-56 shrink-0 flex-col border-r-2 border-black bg-brutal-cream md:flex">
        <div className="flex h-14 items-center gap-3 border-b-2 border-black px-3">
          <div className="flex size-8 items-center justify-center border-2 border-black bg-brutal-yellow">
            <Hash className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">Design system</div>
            <div className="truncate font-mono text-[11px] text-black/50">18 members</div>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          <SourceSection title="Pinned">
            <SourceSidebarRow selected title="#proj-uiux" meta="Cindy replied" />
            <SourceSidebarRow title="#proj-theme" meta="Atlas is typing" />
          </SourceSection>
          <SourceSection title="Agents">
            <SourceSidebarRow title="Cindy" meta="online" />
            <SourceSidebarRow title="Atlas" meta="idle" />
          </SourceSection>
        </div>
      </div>
      <div className="min-w-0 flex-1 bg-white">
        <div className="flex h-14 items-center border-b-2 border-black px-4">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">#proj-uiux</div>
            <div className="truncate font-mono text-[11px] text-black/50">Source main panel</div>
          </div>
        </div>
        <div className="space-y-3 p-4">
          <SourceMessage author="Cindy">
            Existing app code owns behavior and data loading.
          </SourceMessage>
          <SourceMessage author="Atlas">
            The reusable shell keeps only the visual contract.
          </SourceMessage>
        </div>
      </div>
      <div className="hidden w-64 shrink-0 border-l-2 border-black bg-white lg:block">
        <div className="flex h-14 items-center border-b-2 border-black px-3">
          <div className="min-w-0 flex-1 truncate text-sm font-bold">Thread</div>
          <button
            type="button"
            className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
            aria-label="Close thread"
          >
            <X className="size-3.5" />
          </button>
        </div>
        <div className="p-3">
          <SourceMessage author="Thread">
            ThreadPanel content sits inside a host wrapper.
          </SourceMessage>
        </div>
      </div>
    </div>
  );
}

function SourceRailButton({
  icon,
  active,
  dot,
}: {
  icon: ReactNode;
  active?: boolean;
  dot?: boolean;
}) {
  return (
    <button
      type="button"
      className={`relative flex size-10 items-center justify-center border-2 ${
        active
          ? "border-black bg-white shadow-brutal-sm"
          : "border-transparent hover:border-black hover:bg-white"
      }`}
    >
      {icon}
      {dot ? (
        <span className="absolute -right-1 -top-1 size-2.5 border-2 border-black bg-brutal-red" />
      ) : null}
    </button>
  );
}

function SourceSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-3 px-2">
      <div className="mb-1 flex h-6 items-center px-1 text-[11px] font-bold uppercase tracking-wider text-black/50">
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SourceSidebarRow({
  title,
  meta,
  selected,
}: {
  title: string;
  meta: string;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-2 border-2 px-2 py-2 text-left text-sm ${
        selected
          ? "border-black bg-brutal-pink font-bold shadow-brutal-sm"
          : "border-transparent hover:border-black hover:bg-white hover:shadow-brutal-sm"
      }`}
    >
      <span className="size-3 border border-black bg-brutal-yellow" />
      <span className="min-w-0 flex-1">
        <span className="block truncate">{title}</span>
        <span className="block truncate font-mono text-[11px] text-black/50">{meta}</span>
      </span>
    </button>
  );
}

function SourceMessage({ author, children }: { author: string; children: ReactNode }) {
  return (
    <div className="border-2 border-black bg-white p-3 text-sm shadow-brutal-sm">
      <div className="mb-1 font-mono text-[11px] font-bold text-black/50">{author}</div>
      <div>{children}</div>
    </div>
  );
}
