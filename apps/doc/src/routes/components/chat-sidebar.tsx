import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
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

const APP_SHELL_SIDEBAR_SLOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "aside props",
    description: "Sidebar column host. Resizable compositions size it through explicit classes.",
  },
];

const RESIZABLE_GROUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "react-resizable-panels group props",
    description: "Groups the sidebar and adjacent resizable columns.",
  },
];

const RESIZABLE_PANEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "react-resizable-panels panel props",
    description: "Defines one resizable column in the group.",
  },
];

const RESIZABLE_HANDLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "react-resizable-panels separator props",
    description: "Resize handle between adjacent panels.",
  },
];

const CHAT_SIDEBAR_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Full-height sidebar surface that keeps the header and scroll body aligned.",
  },
];

const CHAT_SIDEBAR_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Header layout slot for app-owned navigation and controls.",
  },
];

const CHAT_SIDEBAR_HEADER_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Truncated sidebar heading.",
  },
];

const CHAT_SIDEBAR_BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Owns the sidebar's scrollable body region.",
  },
];

const CHAT_SIDEBAR_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Full-height scroll-content wrapper.",
  },
];

const CHAT_SIDEBAR_LIVE_ACTIVITY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Optional desktop live-agent overlay. It owns the full-width fade, theme spacing, and matching scroll-content clearance.",
  },
];

const CHAT_SIDEBAR_MENU_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "button props",
    description: "Top-level destination such as Saved.",
  },
];

const CHAT_SIDEBAR_MENU_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Leading icon slot for a menu destination.",
  },
];

const CHAT_SIDEBAR_MENU_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Menu destination label.",
  },
];

const CHAT_SIDEBAR_MENU_ASIDE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Trailing metadata slot for a menu destination.",
  },
];

const CHAT_SIDEBAR_MENU_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Compact trailing count for a menu destination.",
  },
];

const CHAT_SIDEBAR_SECTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "section props",
    description: "Groups a saved, pinned, channel, joint, or DM region.",
  },
];

const CHAT_SIDEBAR_SECTION_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Structural header wrapper for a sidebar section.",
  },
];

const CHAT_SIDEBAR_SECTION_DISCLOSURE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "button props",
    description: "Collapsible section trigger.",
  },
];

const CHAT_SIDEBAR_SECTION_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Section heading label.",
  },
];

const CHAT_SIDEBAR_SECTION_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Section item count.",
  },
];

const CHAT_SIDEBAR_SECTION_CHEVRON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Disclosure indicator for a collapsible section.",
  },
];

const CHAT_SIDEBAR_SECTION_TRAILING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Trailing area of a section header.",
  },
];

const CHAT_SIDEBAR_SECTION_ATTENTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Unread or attention indicator in a section header.",
  },
];

const CHAT_SIDEBAR_SECTION_CONTROLS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Control group in a section header.",
  },
];

const CHAT_SIDEBAR_SECTION_CONTROL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "button props",
    description: "Single section-header control slot.",
  },
];

const CHAT_SIDEBAR_SECTION_EMPTY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Compact empty-state wrapper for a section.",
  },
];

const CHAT_SIDEBAR_LIST_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "List wrapper for sidebar rows.",
  },
];

const CHAT_SIDEBAR_GROUP_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Static, non-interactive heading for sidebar groups that do not collapse.",
  },
];

const CHAT_SIDEBAR_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "active",
    type: "boolean",
    default: "false",
    description: "Marks the row as active. Sets data-active for visual state.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description: "Interactive sidebar conversation or channel row.",
  },
];

const CHAT_SIDEBAR_ITEM_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Leading icon or avatar slot for a row.",
  },
];

const CHAT_SIDEBAR_ITEM_CHANNEL_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Leading channel icon slot for a row.",
  },
];

const CHAT_SIDEBAR_ITEM_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Main text content region for a row.",
  },
];

const CHAT_SIDEBAR_ITEM_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Primary row label.",
  },
];

const CHAT_SIDEBAR_ITEM_SUBTITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Secondary row detail.",
  },
];

const CHAT_SIDEBAR_ITEM_META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Inline metadata slot beside a row title.",
  },
];

const CHAT_SIDEBAR_ITEM_META_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Inline metadata icon beside a row title.",
  },
];

const CHAT_SIDEBAR_ITEM_ASIDE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Trailing metadata region for a row.",
  },
];

const CHAT_SIDEBAR_ITEM_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Unread count in a row's trailing area.",
  },
];

const CHAT_SIDEBAR_ITEM_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Mention or attention indicator in a row.",
  },
];

const CHAT_SIDEBAR_ITEM_STATUS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Presence or workflow status slot for a row.",
  },
];

const CHAT_SIDEBAR_CONTROL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
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
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-app-shell-sidebar-slot" title="AppShellSidebarSlot">
            <PropsTable rows={APP_SHELL_SIDEBAR_SLOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-resizable-group" title="ResizableGroup">
            <PropsTable rows={RESIZABLE_GROUP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-resizable-panel" title="ResizablePanel">
            <PropsTable rows={RESIZABLE_PANEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-resizable-handle" title="ResizableHandle">
            <PropsTable rows={RESIZABLE_HANDLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-chat-sidebar-root" title="ChatSidebarRoot">
            <PropsTable rows={CHAT_SIDEBAR_ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-chat-sidebar-header" title="ChatSidebarHeader">
            <PropsTable rows={CHAT_SIDEBAR_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-header-title"
            title="ChatSidebarHeaderTitle"
          >
            <PropsTable rows={CHAT_SIDEBAR_HEADER_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-chat-sidebar-body" title="ChatSidebarBody">
            <PropsTable rows={CHAT_SIDEBAR_BODY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-chat-sidebar-content" title="ChatSidebarContent">
            <PropsTable rows={CHAT_SIDEBAR_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-live-activity"
            title="ChatSidebarLiveActivity"
          >
            <PropsTable rows={CHAT_SIDEBAR_LIVE_ACTIVITY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-chat-sidebar-menu" title="ChatSidebarMenu">
            <PropsTable rows={CHAT_SIDEBAR_MENU_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-chat-sidebar-menu-icon" title="ChatSidebarMenuIcon">
            <PropsTable rows={CHAT_SIDEBAR_MENU_ICON_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-menu-title"
            title="ChatSidebarMenuTitle"
          >
            <PropsTable rows={CHAT_SIDEBAR_MENU_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-menu-aside"
            title="ChatSidebarMenuAside"
          >
            <PropsTable rows={CHAT_SIDEBAR_MENU_ASIDE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-menu-count"
            title="ChatSidebarMenuCount"
          >
            <PropsTable rows={CHAT_SIDEBAR_MENU_COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-chat-sidebar-section" title="ChatSidebarSection">
            <PropsTable rows={CHAT_SIDEBAR_SECTION_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-section-header"
            title="ChatSidebarSectionHeader"
          >
            <PropsTable rows={CHAT_SIDEBAR_SECTION_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-section-disclosure"
            title="ChatSidebarSectionDisclosure"
          >
            <PropsTable rows={CHAT_SIDEBAR_SECTION_DISCLOSURE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-section-title"
            title="ChatSidebarSectionTitle"
          >
            <PropsTable rows={CHAT_SIDEBAR_SECTION_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-section-count"
            title="ChatSidebarSectionCount"
          >
            <PropsTable rows={CHAT_SIDEBAR_SECTION_COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-section-chevron"
            title="ChatSidebarSectionChevron"
          >
            <PropsTable rows={CHAT_SIDEBAR_SECTION_CHEVRON_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-section-trailing"
            title="ChatSidebarSectionTrailing"
          >
            <PropsTable rows={CHAT_SIDEBAR_SECTION_TRAILING_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-section-attention"
            title="ChatSidebarSectionAttention"
          >
            <PropsTable rows={CHAT_SIDEBAR_SECTION_ATTENTION_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-section-controls"
            title="ChatSidebarSectionControls"
          >
            <PropsTable rows={CHAT_SIDEBAR_SECTION_CONTROLS_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-section-control"
            title="ChatSidebarSectionControl"
          >
            <PropsTable rows={CHAT_SIDEBAR_SECTION_CONTROL_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-section-empty"
            title="ChatSidebarSectionEmpty"
          >
            <PropsTable rows={CHAT_SIDEBAR_SECTION_EMPTY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-chat-sidebar-list" title="ChatSidebarList">
            <PropsTable rows={CHAT_SIDEBAR_LIST_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-group-label"
            title="ChatSidebarGroupLabel"
          >
            <PropsTable rows={CHAT_SIDEBAR_GROUP_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-chat-sidebar-item" title="ChatSidebarItem">
            <PropsTable rows={CHAT_SIDEBAR_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-chat-sidebar-item-icon" title="ChatSidebarItemIcon">
            <PropsTable rows={CHAT_SIDEBAR_ITEM_ICON_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-item-channel-icon"
            title="ChatSidebarItemChannelIcon"
          >
            <PropsTable rows={CHAT_SIDEBAR_ITEM_CHANNEL_ICON_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-item-content"
            title="ChatSidebarItemContent"
          >
            <PropsTable rows={CHAT_SIDEBAR_ITEM_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-item-title"
            title="ChatSidebarItemTitle"
          >
            <PropsTable rows={CHAT_SIDEBAR_ITEM_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-item-subtitle"
            title="ChatSidebarItemSubtitle"
          >
            <PropsTable rows={CHAT_SIDEBAR_ITEM_SUBTITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-chat-sidebar-item-meta" title="ChatSidebarItemMeta">
            <PropsTable rows={CHAT_SIDEBAR_ITEM_META_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-item-meta-icon"
            title="ChatSidebarItemMetaIcon"
          >
            <PropsTable rows={CHAT_SIDEBAR_ITEM_META_ICON_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-item-aside"
            title="ChatSidebarItemAside"
          >
            <PropsTable rows={CHAT_SIDEBAR_ITEM_ASIDE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-item-count"
            title="ChatSidebarItemCount"
          >
            <PropsTable rows={CHAT_SIDEBAR_ITEM_COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-item-indicator"
            title="ChatSidebarItemIndicator"
          >
            <PropsTable rows={CHAT_SIDEBAR_ITEM_INDICATOR_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-item-status"
            title="ChatSidebarItemStatus"
          >
            <PropsTable rows={CHAT_SIDEBAR_ITEM_STATUS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-chat-sidebar-control" title="ChatSidebarControl">
            <PropsTable rows={CHAT_SIDEBAR_CONTROL_PROPS} />
          </DocSubsection>
        </div>
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
