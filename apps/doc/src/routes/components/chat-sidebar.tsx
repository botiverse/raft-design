import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PreviewThemeScope, usePreviewTheme } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { ChatSidebarComposition } from "#/modules/chat-sidebar/chat-sidebar.composition.tsx";
import { SourceSidebarPreview } from "#/modules/chat-sidebar/chat-sidebar.source-preview.tsx";
import chatSidebarMobilePartsSource from "#/modules/chat-sidebar/compositions/mobile-parts.composition.tsx?raw";
import chatSidebarCompositionSource from "#/modules/chat-sidebar/chat-sidebar.composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const CHAT_SIDEBAR_COMPOSITION_PATH =
  "apps/doc/src/modules/chat-sidebar/chat-sidebar.composition.tsx";

const TOC = [
  { id: "source-comparison", title: "Source comparison" },
  { id: "mobile-parts", title: "Mobile parts" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  chatSidebarComposition: chatSidebarCompositionSource,
  chatSidebarMobileParts: chatSidebarMobilePartsSource,
  anatomy: `<ChatSidebarRoot>
  <ChatSidebarHeader>
    <ChatSidebarHeaderTitle />
    <ChatSidebarAction />
  </ChatSidebarHeader>
  <ChatSidebarBody>
    <ChatSidebarContent>
      <ChatSidebarSection>
        <ChatSidebarSectionHeader>
          <ChatSidebarSectionButton>
            <ChatSidebarSectionTitle />
            <ChatSidebarSectionCount />
            <ChatSidebarSectionChevron />
          </ChatSidebarSectionButton>
          <ChatSidebarSectionTrailing>
            <ChatSidebarSectionAttention />
            <ChatSidebarSectionActions>
              <ChatSidebarAction />
            </ChatSidebarSectionActions>
          </ChatSidebarSectionTrailing>
        </ChatSidebarSectionHeader>
        <ChatSidebarList>
          <ChatSidebarItem />
        </ChatSidebarList>
      </ChatSidebarSection>
    </ChatSidebarContent>
  </ChatSidebarBody>
  <ChatSidebarFooter />
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
    name: "ChatSidebarHeader / Body / Content / Footer",
    type: "div props",
    description:
      "Column regions matching source sidebar chrome, scroll ownership, and footer. Header is a layout slot for an app-owned server switcher.",
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
    description: "Section and list wrappers for saved, pinned, channel, joint, and DM groups.",
  },
  {
    name: "ChatSidebarGroupLabel",
    type: "div props",
    description: "Static, non-interactive heading for sidebar groups that do not collapse.",
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
      "Base UI Collapsible header parts for ChatSidebarSectionChevron, title, count, ChatSidebarSectionAttention, and action slots.",
  },
  {
    name: "ChatSidebarAction",
    type: "button props",
    description: "Theme-aware action button shared by the sidebar header and section action slots.",
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

      <DocSection id="mobile-parts" title="Mobile parts" showThemeSwitcher>
        <div className="max-w-sm overflow-hidden border border-line bg-layer-panel">
          <ChatSidebarMobilePartsFrame />
        </div>
        <DocsCodeBlock.Panel
          path="apps/doc/src/modules/chat-sidebar/compositions/mobile-parts.composition.tsx"
          source={chatSidebarMobilePartsSource}
          html={code.chatSidebarMobileParts}
          showLineNumbers={false}
        />
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
    </DocPage>
  );
}

function PreviewGrid({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function ChatSidebarMobilePartsFrame() {
  const { mode, theme } = usePreviewTheme();
  const params = new URLSearchParams({ mode, theme });

  return (
    <iframe
      key={`${theme}-${mode}`}
      title={`Chat sidebar mobile parts in ${theme} ${mode}`}
      src={`/iframe/chat-sidebar-mobile-parts?${params.toString()}`}
      sandbox="allow-scripts"
      className="block h-72 w-full border-0 bg-transparent"
    />
  );
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
