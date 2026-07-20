import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

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
import chatSidebarPreviewCompositionSource from "#/modules/chat-sidebar/compositions/preview.composition.tsx?raw";
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
  chatSidebarPreviewComposition: chatSidebarPreviewCompositionSource,
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
    name: "ResizableGroup",
    type: "react-resizable-panels group props",
    description: "Groups the sidebar and adjacent resizable columns.",
  },
  {
    name: "ResizablePanel",
    type: "react-resizable-panels panel props",
    description: "Defines one resizable column in the group.",
  },
  {
    name: "ResizableHandle",
    type: "react-resizable-panels separator props",
    description: "Resize handle between adjacent panels.",
  },
  {
    name: "ChatSidebarRoot",
    type: "div props",
    description: "Full-height sidebar surface that keeps the header and scroll body aligned.",
  },
  {
    name: "ChatSidebarHeader",
    type: "div props",
    description: "Header layout slot for app-owned navigation and controls.",
  },
  {
    name: "ChatSidebarHeaderTitle",
    type: "div props",
    description: "Truncated sidebar heading.",
  },
  {
    name: "ChatSidebarBody",
    type: "div props",
    description: "Owns the sidebar's scrollable body region.",
  },
  {
    name: "ChatSidebarContent",
    type: "div props",
    description: "Full-height scroll-content wrapper.",
  },
  {
    name: "ChatSidebarLiveActivity",
    type: "div props",
    description:
      "Optional desktop live-agent overlay. It owns the full-width fade, theme spacing, and matching scroll-content clearance.",
  },
  {
    name: "ChatSidebarMenu",
    type: "button props",
    description: "Top-level destination such as Saved.",
  },
  {
    name: "ChatSidebarMenuIcon",
    type: "span props",
    description: "Leading icon slot for a menu destination.",
  },
  {
    name: "ChatSidebarMenuTitle",
    type: "span props",
    description: "Menu destination label.",
  },
  {
    name: "ChatSidebarMenuAside",
    type: "span props",
    description: "Trailing metadata slot for a menu destination.",
  },
  {
    name: "ChatSidebarMenuCount",
    type: "span props",
    description: "Compact trailing count for a menu destination.",
  },
  {
    name: "ChatSidebarSection",
    type: "section props",
    description: "Groups a saved, pinned, channel, joint, or DM region.",
  },
  {
    name: "ChatSidebarSectionHeader",
    type: "div props",
    description: "Structural header wrapper for a sidebar section.",
  },
  {
    name: "ChatSidebarSectionDisclosure",
    type: "button props",
    description: "Collapsible section trigger.",
  },
  {
    name: "ChatSidebarSectionTitle",
    type: "span props",
    description: "Section heading label.",
  },
  {
    name: "ChatSidebarSectionCount",
    type: "span props",
    description: "Section item count.",
  },
  {
    name: "ChatSidebarSectionChevron",
    type: "span props",
    description: "Disclosure indicator for a collapsible section.",
  },
  {
    name: "ChatSidebarSectionTrailing",
    type: "div props",
    description: "Trailing area of a section header.",
  },
  {
    name: "ChatSidebarSectionAttention",
    type: "span props",
    description: "Unread or attention indicator in a section header.",
  },
  {
    name: "ChatSidebarSectionControls",
    type: "div props",
    description: "Control group in a section header.",
  },
  {
    name: "ChatSidebarSectionControl",
    type: "button props",
    description: "Single section-header control slot.",
  },
  {
    name: "ChatSidebarSectionEmpty",
    type: "div props",
    description: "Compact empty-state wrapper for a section.",
  },
  {
    name: "ChatSidebarList",
    type: "div props",
    description: "List wrapper for sidebar rows.",
  },
  {
    name: "ChatSidebarGroupLabel",
    type: "div props",
    description: "Static, non-interactive heading for sidebar groups that do not collapse.",
  },
  {
    name: "ChatSidebarItem",
    type: "button props",
    description: "Interactive sidebar conversation or channel row.",
  },
  {
    name: "ChatSidebarItemIcon",
    type: "span props",
    description: "Leading icon or avatar slot for a row.",
  },
  {
    name: "ChatSidebarItemChannelIcon",
    type: "span props",
    description: "Leading channel icon slot for a row.",
  },
  {
    name: "ChatSidebarItemContent",
    type: "div props",
    description: "Main text content region for a row.",
  },
  {
    name: "ChatSidebarItemTitle",
    type: "span props",
    description: "Primary row label.",
  },
  {
    name: "ChatSidebarItemSubtitle",
    type: "span props",
    description: "Secondary row detail.",
  },
  {
    name: "ChatSidebarItemMeta",
    type: "span props",
    description: "Inline metadata slot beside a row title.",
  },
  {
    name: "ChatSidebarItemMetaIcon",
    type: "span props",
    description: "Inline metadata icon beside a row title.",
  },
  {
    name: "ChatSidebarItemAside",
    type: "span props",
    description: "Trailing metadata region for a row.",
  },
  {
    name: "ChatSidebarItemCount",
    type: "span props",
    description: "Unread count in a row's trailing area.",
  },
  {
    name: "ChatSidebarItemIndicator",
    type: "span props",
    description: "Mention or attention indicator in a row.",
  },
  {
    name: "ChatSidebarItemStatus",
    type: "span props",
    description: "Presence or workflow status slot for a row.",
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
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ChatSidebarPreview
          code={code.chatSidebarPreviewComposition}
          collapsedCode={code.chatSidebarPreviewCompositionBody}
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
