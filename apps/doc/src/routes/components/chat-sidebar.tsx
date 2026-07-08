import { createFileRoute } from "@tanstack/react-router";
import { Bookmark, Hash, MessageSquare, User } from "lucide-react";
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
import { highlightSnippets } from "#/lib/highlight.tsx";

const CHAT_SIDEBAR_COMPOSITION_PATH = "apps/doc/src/compositions/chat-sidebar-composition.tsx";

const TOC = [
  { id: "source-comparison", title: "Source comparison" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  chatSidebarComposition: chatSidebarCompositionSource,
  anatomy: `import {
  ChatShellSidebar,
  ChatSidebarRoot,
  ChatSidebarHeader,
  ChatSidebarBody,
  ChatSidebarSection,
  ChatSidebarList,
} from "raft-ui/wip";

<ChatShellSidebar resizable>
  <ChatSidebarRoot>
    <ChatSidebarHeader>{header}</ChatSidebarHeader>
    <ChatSidebarBody>
      <ChatSidebarSection>
        <ChatSidebarList>{rows}</ChatSidebarList>
      </ChatSidebarSection>
    </ChatSidebarBody>
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
    description: "Section and list wrappers for app-owned saved, pinned, channel, and DM rows.",
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
    <div className="flex h-full min-w-[640px] overflow-hidden border-2 border-black bg-brutal-cream font-display text-black">
      <div className="flex h-full w-60 shrink-0 flex-col border-r-2 border-black bg-brutal-cream text-black">
        <div className="flex h-[62px] shrink-0 items-center border-b-2 border-black bg-brutal-cream px-5">
          <div className="text-lg font-bold text-black">Chat</div>
        </div>
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-3">
            <div className="min-h-full">
              <button
                type="button"
                className="mb-1 flex w-full items-center gap-2 border-2 border-transparent px-2 py-2 text-left text-sm font-medium hover:border-black hover:bg-white hover:shadow-brutal-sm"
              >
                <span className="flex size-5 shrink-0 items-center justify-center border border-black bg-brutal-yellow">
                  <Bookmark className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1 truncate">Saved</span>
                <span className="font-mono text-[10px] text-black/40">2</span>
              </button>
              <SourceSection title="Pinned" count="2">
                <SourceSidebarRow selected title="#proj-uiux" meta="Cindy replied" />
                <SourceSidebarRow title="#proj-theme" meta="Atlas is typing" />
              </SourceSection>
              <SourceSection title="Joint Channels" count="1">
                <SourceSidebarRow title="#partners" meta="3 unread" />
              </SourceSection>
              <SourceSection title="Channels" count="2">
                <SourceSidebarRow dot title="#general" meta="12 unread" />
                <SourceSidebarRow title="#release" meta="No unread" />
              </SourceSection>
              <SourceSection title="Direct Messages" count="2">
                <SourceSidebarRow
                  icon={<User className="size-3.5" />}
                  title="Cindy"
                  meta="online"
                />
                <SourceSidebarRow
                  icon={<MessageSquare className="size-3.5" />}
                  title="Atlas"
                  meta="idle"
                />
              </SourceSection>
            </div>
          </div>
        </div>
      </div>
      <SourceMainContext />
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

function SourceSection({
  title,
  count,
  children,
}: {
  title: string;
  count: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex h-6 items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-black/50">
        <span>{title}</span>
        <span className="font-mono text-[10px] font-normal tracking-normal">{count}</span>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SourceSidebarRow({
  title,
  meta,
  selected,
  icon,
  dot,
}: {
  title: string;
  meta: string;
  selected?: boolean;
  icon?: ReactNode;
  dot?: boolean;
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
        {icon ?? <Hash className="size-3.5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{title}</span>
        <span className="block truncate font-mono text-[11px] text-black/50">{meta}</span>
      </span>
      {dot && (
        <span
          aria-hidden
          className="size-2.5 shrink-0 rounded-full border border-black bg-brutal-pink"
        />
      )}
    </button>
  );
}
