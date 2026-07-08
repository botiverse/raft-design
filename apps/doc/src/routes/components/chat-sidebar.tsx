import { createFileRoute } from "@tanstack/react-router";
import {
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
  MessageSquare,
  Monitor,
  Search,
  Settings,
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
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "source-comparison", title: "Source comparison" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import {
  ChatShellSidebar,
  ChatSidebarRoot,
  ChatSidebarHeader,
  ChatSidebarBody,
  ChatSidebarSection,
  ChatSidebarList,
  ChatSidebarFooter,
} from "raft-ui/wip";

<ChatShellSidebar resizable>
  <ChatSidebarRoot>
    <ChatSidebarHeader>{header}</ChatSidebarHeader>
    <ChatSidebarBody>
      <ChatSidebarSection>
        <ChatSidebarList>{rows}</ChatSidebarList>
      </ChatSidebarSection>
    </ChatSidebarBody>
    <ChatSidebarFooter>{footer}</ChatSidebarFooter>
  </ChatSidebarRoot>
</ChatShellSidebar>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "ChatShellSidebar",
    type: "aside props & { hidden?: boolean; resizable?: boolean }",
    description: "Sidebar column host. The consumer owns width state and resize persistence.",
  },
  {
    name: "ChatSidebarRoot",
    type: "div props",
    description: "Full-height sidebar surface that keeps header, body, and footer aligned.",
  },
  {
    name: "ChatSidebarHeader / Body / Footer",
    type: "div props",
    description: "Column regions matching source sidebar chrome and scroll ownership.",
  },
  {
    name: "ChatSidebarSection / List",
    type: "section / div props",
    description: "Section and list wrappers for app-owned channel, DM, agent, and machine rows.",
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
      description="Controlled sidebar column structure for channel, member, machine, settings, and search-master surfaces."
      overview={
        <Differences from="Sidebar">
          <li>does not own stores, sorting, context menus, drag state, or create dialogs</li>
          <li>
            keeps source column shape: cream sidebar, panel-header height, scrollable body, footer
            slot
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
              <SidebarPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <SidebarPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant dark">
            <PreviewThemeScope family="elegant" mode="dark" className="h-full dark">
              <SidebarPreview />
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
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
      <div className="flex h-[420px] items-stretch justify-start overflow-x-auto bg-background p-2">
        {children}
      </div>
    </div>
  );
}

function SidebarPreview() {
  return (
    <div className="flex h-full min-w-[920px] overflow-hidden border border-line-strong bg-layer-panel shadow-sm [[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black [[data-theme=brutal]_&]:bg-brutal-cream [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border-line-subtle">
      <CurrentRailContext />
      <ChatShellSidebar className="flex h-full w-60 md:flex">
        <ChatSidebarRoot>
          <ChatSidebarHeader>
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-bold text-foreground-strong">Chat</div>
            </div>
          </ChatSidebarHeader>
          <ChatSidebarBody>
            <SidebarGroup title="Pinned">
              <SidebarRow selected title="#proj-uiux" meta="Cindy replied" />
              <SidebarRow title="#proj-theme" meta="Atlas is typing" tone="cyan" />
            </SidebarGroup>
            <SidebarGroup title="Channels">
              <SidebarRow title="#general" meta="12 unread" />
              <SidebarRow title="#release" meta="No unread" tone="lime" />
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
      <CurrentMainContext />
    </div>
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
      className="flex w-full items-center gap-2 border-2 border-transparent px-2 py-2 text-left text-sm font-medium transition-colors hover:border-line-strong hover:bg-layer-panel hover:shadow-sm data-[selected=true]:border-line-strong data-[selected=true]:bg-accent-400 data-[selected=true]:font-bold data-[selected=true]:shadow-sm [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border [[data-theme=elegant]_&]:border-transparent [[data-theme=elegant]_&]:hover:border-line-subtle [[data-theme=elegant]_&]:hover:bg-layer-muted [[data-theme=elegant]_&]:data-[selected=true]:border-line-subtle [[data-theme=elegant]_&]:data-[selected=true]:bg-layer-muted"
    >
      <span
        className={`flex size-5 shrink-0 items-center justify-center border border-line-strong ${toneClassName} [[data-theme=elegant]_&]:rounded-sm [[data-theme=elegant]_&]:border-line-subtle`}
      >
        <Hash className="size-3" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-foreground-strong">{title}</span>
        <span className="block truncate font-mono text-[11px] text-foreground-muted">{meta}</span>
      </span>
    </button>
  );
}

function SourceSidebarPreview() {
  return (
    <div className="flex h-full min-w-[920px] overflow-hidden border-2 border-black bg-brutal-cream font-display text-black">
      <SourceRailContext />
      <div className="flex h-full w-60 shrink-0 flex-col border-r-2 border-black bg-brutal-cream text-black">
        <div className="flex h-[62px] shrink-0 items-center border-b-2 border-black bg-brutal-cream px-5">
          <div className="text-lg font-bold text-black">Chat</div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto py-2">
          <SourceSection title="Pinned">
            <SourceSidebarRow selected title="#proj-uiux" meta="Cindy replied" />
            <SourceSidebarRow title="#proj-theme" meta="Atlas is typing" />
          </SourceSection>
          <SourceSection title="Channels">
            <SourceSidebarRow title="#general" meta="12 unread" />
            <SourceSidebarRow title="#release" meta="No unread" />
          </SourceSection>
          <SourceSection title="Agents">
            <SourceSidebarRow title="Cindy" meta="online" />
            <SourceSidebarRow title="Atlas" meta="idle" />
          </SourceSection>
        </div>
        <div className="shrink-0 border-t-2 border-black bg-brutal-cream p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-black/50">
            <Bot className="size-4" />
            <span className="truncate">Live agent activity</span>
          </div>
        </div>
      </div>
      <SourceMainContext />
    </div>
  );
}

function CurrentRailContext() {
  return (
    <div className="flex h-full w-16 shrink-0 flex-col items-center border-r-2 border-line-strong bg-soft-signal [[data-theme=elegant]_&]:border-r [[data-theme=elegant]_&]:border-line-subtle [[data-theme=elegant]_&]:bg-layer-panel">
      <div className="flex h-[62px] w-full shrink-0 items-center justify-center border-b-2 border-line-strong [[data-theme=elegant]_&]:border-b [[data-theme=elegant]_&]:border-line-subtle">
        <div className="flex size-10 items-center justify-center border-2 border-line-strong bg-line-strong text-sm font-bold text-primary-400 shadow-sm [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border-line-subtle [[data-theme=elegant]_&]:bg-foreground-strong">
          R
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center gap-1.5 py-2">
        <RailIcon icon={<Search />} />
        <RailIcon selected icon={<MessageSquare />} />
        <RailIcon icon={<CheckSquare />} />
        <RailIcon icon={<Users />} />
        <RailIcon icon={<Monitor />} />
      </div>
      <div className="flex min-h-[62px] flex-col items-center justify-center gap-1.5 pb-2">
        <RailIcon icon={<Bell />} />
        <RailIcon icon={<Settings />} />
      </div>
    </div>
  );
}

function SourceRailContext() {
  return (
    <div className="flex h-full w-16 shrink-0 flex-col items-center border-r-2 border-black bg-soft-signal">
      <div className="flex h-[62px] w-full shrink-0 items-center justify-center border-b-2 border-black">
        <div className="flex size-10 items-center justify-center border-2 border-black bg-black text-sm font-bold text-soft-signal shadow-brutal-sm">
          R
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center gap-1.5 py-2">
        <SourceRailIcon icon={<Search />} />
        <SourceRailIcon selected icon={<MessageSquare />} />
        <SourceRailIcon icon={<CheckSquare />} />
        <SourceRailIcon icon={<Users />} />
        <SourceRailIcon icon={<Monitor />} />
      </div>
      <div className="flex min-h-[62px] flex-col items-center justify-center gap-1.5 pb-2">
        <SourceRailIcon icon={<Bell />} />
        <SourceRailIcon icon={<Settings />} />
      </div>
    </div>
  );
}

function RailIcon({ icon, selected }: { icon: ReactNode; selected?: boolean }) {
  return (
    <div
      className="flex size-10 items-center justify-center border-2 border-transparent text-foreground-strong data-[selected=true]:border-line-strong data-[selected=true]:bg-layer-panel data-[selected=true]:shadow-sm [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border [[data-theme=elegant]_&]:text-foreground-muted [[data-theme=elegant]_&]:data-[selected=true]:border-line-subtle [[data-theme=elegant]_&]:data-[selected=true]:bg-layer-muted [[data-theme=elegant]_&]:data-[selected=true]:text-foreground-strong"
      data-selected={selected ? "true" : undefined}
    >
      {icon}
    </div>
  );
}

function SourceRailIcon({ icon, selected }: { icon: ReactNode; selected?: boolean }) {
  return (
    <div
      className={`flex size-10 items-center justify-center border-2 ${
        selected ? "border-black bg-white shadow-brutal-sm" : "border-transparent"
      }`}
    >
      {icon}
    </div>
  );
}

function CurrentMainContext() {
  return (
    <div className="min-w-0 flex-1 bg-layer-panel p-4 [[data-theme=brutal]_&]:bg-white">
      <div className="mb-4 h-8 w-48 border-b-2 border-line-strong text-lg font-bold text-foreground-strong [[data-theme=elegant]_&]:border-line-subtle">
        #proj-uiux
      </div>
      <div className="space-y-3">
        <div className="h-14 border-2 border-line-strong bg-layer-panel shadow-sm [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border-line-subtle [[data-theme=brutal]_&]:bg-white" />
        <div className="h-20 border-2 border-line-strong bg-layer-panel shadow-sm [[data-theme=elegant]_&]:rounded-md [[data-theme=elegant]_&]:border-line-subtle [[data-theme=brutal]_&]:bg-white" />
      </div>
    </div>
  );
}

function SourceMainContext() {
  return (
    <div className="min-w-0 flex-1 bg-white p-4">
      <div className="mb-4 h-8 w-48 border-b-2 border-black text-lg font-bold">#proj-uiux</div>
      <div className="space-y-3">
        <div className="h-14 border-2 border-black bg-white shadow-brutal-sm" />
        <div className="h-20 border-2 border-black bg-white shadow-brutal-sm" />
      </div>
    </div>
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
      <span className="flex size-5 shrink-0 items-center justify-center border border-black bg-brutal-yellow">
        <Hash className="size-3" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{title}</span>
        <span className="block truncate font-mono text-[11px] text-black/50">{meta}</span>
      </span>
    </button>
  );
}
