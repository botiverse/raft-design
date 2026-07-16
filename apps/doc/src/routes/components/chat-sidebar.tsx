import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { ChatSidebarComposition } from "#/modules/chat-sidebar/chat-sidebar.composition.tsx";
import { ChatSidebarPreview } from "#/modules/chat-sidebar/chat-sidebar.preview.tsx";
import { SourceSidebarPreview } from "#/modules/chat-sidebar/chat-sidebar.source-preview.tsx";
import chatSidebarCompositionSource from "#/modules/chat-sidebar/chat-sidebar.composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const CHAT_SIDEBAR_COMPOSITION_PATH =
  "apps/doc/src/modules/chat-sidebar/chat-sidebar.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  chatSidebarComposition: chatSidebarCompositionSource,
  anatomy: `<ChatSidebarRoot>
  <ChatSidebarHeader>
    <ChatSidebarHeaderTitle />
    <ChatSidebarControl />
  </ChatSidebarHeader>
  <ChatSidebarBody>
    <ChatSidebarContent>
      <ChatSidebarSection>
        <ChatSidebarSectionHeader>
          <ChatSidebarSectionDisclosure>
            <ChatSidebarSectionTitle />
            <ChatSidebarSectionCount />
            <ChatSidebarSectionChevron />
          </ChatSidebarSectionDisclosure>
          <ChatSidebarSectionTrailing>
            <ChatSidebarSectionAttention />
          <ChatSidebarSectionControls>
              <ChatSidebarControl />
            </ChatSidebarSectionControls>
          </ChatSidebarSectionTrailing>
        </ChatSidebarSectionHeader>
        <ChatSidebarList>
          <ChatSidebarItem />
        </ChatSidebarList>
        <ChatSidebarSectionEmpty />
      </ChatSidebarSection>
    </ChatSidebarContent>
  </ChatSidebarBody>
  <ChatSidebarLiveActivity>
    <LiveAgentActivityBar />
  </ChatSidebarLiveActivity>
</ChatSidebarRoot>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "AppShellSidebarSlot",
    type: "aside props",
    description: "Sidebar column host. Resizable compositions size it through explicit classes.",
  },
  {
    name: "ResizableGroup / ResizablePanel / ResizableHandle",
    type: "react-resizable-panels group / panel / separator props",
    description:
      "Generic resize behavior. Keep rail outside the group and resize only the intended columns.",
  },
  {
    name: "ChatSidebarRoot",
    type: "div props",
    description: "Full-height sidebar surface that keeps the header and scroll body aligned.",
  },
  {
    name: "ChatSidebarHeader / Body / Content",
    type: "div props",
    description:
      "Column regions matching source sidebar chrome and scroll ownership. Header is a layout slot for an app-owned server switcher.",
  },
  {
    name: "ChatSidebarLiveActivity",
    type: "div props",
    description:
      "Optional desktop live-agent overlay. It owns the full-width fade, theme spacing, and matching scroll-content clearance.",
  },
  {
    name: "ChatSidebarMenu / Icon / Title / Aside / Count",
    type: "button + span props",
    description:
      "Top-level sidebar destinations such as Saved, with explicit leading and metadata parts.",
  },
  {
    name: "ChatSidebarSection / List",
    type: "section / div props",
    description:
      "Section, list, and compact empty-state wrappers for saved, pinned, channel, joint, and DM groups.",
  },
  {
    name: "ChatSidebarGroupLabel",
    type: "div props",
    description: "Static, non-interactive heading for sidebar groups that do not collapse.",
  },
  {
    name: "ChatSidebarSectionHeader*",
    type: "div + button + span props",
    description:
      "Base UI Collapsible header parts for ChatSidebarSectionChevron, title, count, ChatSidebarSectionAttention, and action slots.",
  },
  {
    name: "ChatSidebarControl",
    type: "button props",
    description:
      "Theme-aware control button shared by the sidebar header and section control slots.",
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
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ChatSidebarPreview />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <PreviewGrid>
          <PreviewPane label="Source">
            <SourceThemeScope className="h-full">
              <SourceSidebarPreview />
            </SourceThemeScope>
          </PreviewPane>
          <PreviewPane label="Brutal">
            <PreviewThemeScope
              family="brutal"
              className="h-full w-[308px] shrink-0 border border-line-strong bg-brutal-cream shadow-sm"
            >
              <ChatSidebarComposition />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope
              family="elegant"
              mode="light"
              className="h-full w-[308px] shrink-0 border border-line-strong bg-layer-page shadow-sm"
            >
              <ChatSidebarComposition />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant dark">
            <PreviewThemeScope
              family="elegant"
              mode="dark"
              className="dark h-full w-[308px] shrink-0 border border-line-strong bg-layer-page shadow-sm"
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
