import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { SidebarComposition } from "#/modules/sidebar/sidebar.composition.tsx";
import { SidebarPreview } from "#/modules/sidebar/sidebar.preview.tsx";
import { SourceSidebarPreview } from "#/modules/sidebar/sidebar.source-preview.tsx";
import sidebarCompositionSource from "#/modules/sidebar/sidebar.composition.tsx?raw";
import sidebarSectionHeaderMenuCompositionSource from "#/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const SIDEBAR_COMPOSITION_PATH = "apps/doc/src/modules/sidebar/sidebar.composition.tsx";
const SIDEBAR_SECTION_HEADER_MENU_COMPOSITION_PATH =
  "apps/doc/src/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  sidebarComposition: sidebarCompositionSource,
  sidebarSectionHeaderMenuComposition: sidebarSectionHeaderMenuCompositionSource,
  anatomy: `<SidebarRoot>
  <SidebarHeader>
    <SidebarHeaderTitle />
    <SidebarControl />
  </SidebarHeader>
  <SidebarBody>
    <SidebarContent>
      <SidebarSection>
        <SidebarSectionHeader>
          <SidebarSectionDisclosure>
            <SidebarSectionTitle />
            <SidebarSectionCount />
            <SidebarSectionChevron />
          </SidebarSectionDisclosure>
          <SidebarSectionTrailing>
            <SidebarSectionAttention />
          <SidebarSectionControls>
              <SidebarControl />
            </SidebarSectionControls>
          </SidebarSectionTrailing>
        </SidebarSectionHeader>
        <SidebarList>
          <SidebarItem />
        </SidebarList>
        <SidebarSectionEmpty />
      </SidebarSection>
    </SidebarContent>
  </SidebarBody>
  <SidebarLiveActivity>
    <LiveAgentActivityBar />
  </SidebarLiveActivity>
</SidebarRoot>`,
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

const SIDEBAR_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Full-height sidebar frame that keeps the header and scroll body aligned.",
  },
];

const SIDEBAR_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Header layout slot for app-owned navigation and controls.",
  },
];

const SIDEBAR_HEADER_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Truncated sidebar heading.",
  },
];

const SIDEBAR_BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Owns the sidebar's scrollable body region.",
  },
];

const SIDEBAR_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Full-height scroll-content wrapper.",
  },
];

const SIDEBAR_LIVE_ACTIVITY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Optional desktop live-agent overlay. It owns the full-width fade, theme spacing, and matching scroll-content clearance.",
  },
];

const SIDEBAR_MENU_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "button props",
    description: "Top-level destination such as Saved.",
  },
];

const SIDEBAR_MENU_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Leading icon slot for a menu destination.",
  },
];

const SIDEBAR_MENU_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Menu destination label.",
  },
];

const SIDEBAR_MENU_ASIDE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Trailing metadata slot for a menu destination.",
  },
];

const SIDEBAR_MENU_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Compact trailing count for a menu destination.",
  },
];

const SIDEBAR_SECTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "section props",
    description: "Groups a saved, pinned, channel, joint, or DM region.",
  },
];

const SIDEBAR_SECTION_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Structural header wrapper for a sidebar section.",
  },
];

const SIDEBAR_SECTION_DISCLOSURE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "button props",
    description: "Collapsible section trigger.",
  },
];

const SIDEBAR_SECTION_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Section heading label.",
  },
];

const SIDEBAR_SECTION_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Section item count.",
  },
];

const SIDEBAR_SECTION_CHEVRON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Disclosure indicator for a collapsible section.",
  },
];

const SIDEBAR_SECTION_TRAILING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Trailing area of a section header.",
  },
];

const SIDEBAR_SECTION_ATTENTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Unread or attention indicator in a section header.",
  },
];

const SIDEBAR_SECTION_CONTROLS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Control group in a section header.",
  },
];

const SIDEBAR_SECTION_CONTROL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "button props",
    description: "Single section-header control slot.",
  },
];

const SIDEBAR_SECTION_EMPTY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Compact empty-state wrapper for a section.",
  },
];

const SIDEBAR_LIST_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "List wrapper for sidebar rows.",
  },
];

const SIDEBAR_GROUP_LABEL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Static, non-interactive heading for sidebar groups that do not collapse.",
  },
];

const SIDEBAR_ITEM_PROPS: readonly PropRow[] = [
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

const SIDEBAR_ITEM_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Leading icon or avatar slot for a row.",
  },
];

const SIDEBAR_ITEM_CHANNEL_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Leading channel icon slot for a row.",
  },
];

const SIDEBAR_ITEM_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Main text content region for a row.",
  },
];

const SIDEBAR_ITEM_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Primary row label.",
  },
];

const SIDEBAR_ITEM_SUBTITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Secondary row detail.",
  },
];

const SIDEBAR_ITEM_META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Inline metadata slot beside a row title.",
  },
];

const SIDEBAR_ITEM_META_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Inline metadata icon beside a row title.",
  },
];

const SIDEBAR_ITEM_ASIDE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Trailing metadata region for a row.",
  },
];

const SIDEBAR_ITEM_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Unread count in a row's trailing area.",
  },
];

const SIDEBAR_ITEM_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Mention or attention indicator in a row.",
  },
];

const SIDEBAR_ITEM_STATUS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Presence or workflow status slot for a row.",
  },
];

const SIDEBAR_CONTROL_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "button props",
    description:
      "Theme-aware control button shared by the sidebar header and section control slots.",
  },
];

export const Route = createFileRoute("/components/sidebar")({
  component: SidebarDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function SidebarDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Sidebar"
      description="Composable sidebar column structure for menus, grouped lists, and app-owned destinations."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <SidebarPreview codeBlock={<SidebarSourceFiles code={code} collapsible={false} />} />
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
          <DocSubsection parentId="api" id="api-sidebar-root" title="SidebarRoot">
            <PropsTable rows={SIDEBAR_ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-header" title="SidebarHeader">
            <PropsTable rows={SIDEBAR_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-header-title" title="SidebarHeaderTitle">
            <PropsTable rows={SIDEBAR_HEADER_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-body" title="SidebarBody">
            <PropsTable rows={SIDEBAR_BODY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-content" title="SidebarContent">
            <PropsTable rows={SIDEBAR_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-live-activity" title="SidebarLiveActivity">
            <PropsTable rows={SIDEBAR_LIVE_ACTIVITY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-menu" title="SidebarMenu">
            <PropsTable rows={SIDEBAR_MENU_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-menu-icon" title="SidebarMenuIcon">
            <PropsTable rows={SIDEBAR_MENU_ICON_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-menu-title" title="SidebarMenuTitle">
            <PropsTable rows={SIDEBAR_MENU_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-menu-aside" title="SidebarMenuAside">
            <PropsTable rows={SIDEBAR_MENU_ASIDE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-menu-count" title="SidebarMenuCount">
            <PropsTable rows={SIDEBAR_MENU_COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-section" title="SidebarSection">
            <PropsTable rows={SIDEBAR_SECTION_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-sidebar-section-header"
            title="SidebarSectionHeader"
          >
            <PropsTable rows={SIDEBAR_SECTION_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-sidebar-section-disclosure"
            title="SidebarSectionDisclosure"
          >
            <PropsTable rows={SIDEBAR_SECTION_DISCLOSURE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-section-title" title="SidebarSectionTitle">
            <PropsTable rows={SIDEBAR_SECTION_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-section-count" title="SidebarSectionCount">
            <PropsTable rows={SIDEBAR_SECTION_COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-sidebar-section-chevron"
            title="SidebarSectionChevron"
          >
            <PropsTable rows={SIDEBAR_SECTION_CHEVRON_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-sidebar-section-trailing"
            title="SidebarSectionTrailing"
          >
            <PropsTable rows={SIDEBAR_SECTION_TRAILING_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-sidebar-section-attention"
            title="SidebarSectionAttention"
          >
            <PropsTable rows={SIDEBAR_SECTION_ATTENTION_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-sidebar-section-controls"
            title="SidebarSectionControls"
          >
            <PropsTable rows={SIDEBAR_SECTION_CONTROLS_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-sidebar-section-control"
            title="SidebarSectionControl"
          >
            <PropsTable rows={SIDEBAR_SECTION_CONTROL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-section-empty" title="SidebarSectionEmpty">
            <PropsTable rows={SIDEBAR_SECTION_EMPTY_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-list" title="SidebarList">
            <PropsTable rows={SIDEBAR_LIST_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-group-label" title="SidebarGroupLabel">
            <PropsTable rows={SIDEBAR_GROUP_LABEL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-item" title="SidebarItem">
            <PropsTable rows={SIDEBAR_ITEM_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-item-icon" title="SidebarItemIcon">
            <PropsTable rows={SIDEBAR_ITEM_ICON_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-sidebar-item-channel-icon"
            title="SidebarItemChannelIcon"
          >
            <PropsTable rows={SIDEBAR_ITEM_CHANNEL_ICON_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-item-content" title="SidebarItemContent">
            <PropsTable rows={SIDEBAR_ITEM_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-item-title" title="SidebarItemTitle">
            <PropsTable rows={SIDEBAR_ITEM_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-item-subtitle" title="SidebarItemSubtitle">
            <PropsTable rows={SIDEBAR_ITEM_SUBTITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-item-meta" title="SidebarItemMeta">
            <PropsTable rows={SIDEBAR_ITEM_META_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-item-meta-icon" title="SidebarItemMetaIcon">
            <PropsTable rows={SIDEBAR_ITEM_META_ICON_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-item-aside" title="SidebarItemAside">
            <PropsTable rows={SIDEBAR_ITEM_ASIDE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-item-count" title="SidebarItemCount">
            <PropsTable rows={SIDEBAR_ITEM_COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-sidebar-item-indicator"
            title="SidebarItemIndicator"
          >
            <PropsTable rows={SIDEBAR_ITEM_INDICATOR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-item-status" title="SidebarItemStatus">
            <PropsTable rows={SIDEBAR_ITEM_STATUS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-control" title="SidebarControl">
            <PropsTable rows={SIDEBAR_CONTROL_PROPS} />
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
              <SidebarComposition />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope
              family="elegant"
              mode="light"
              className="h-full w-[308px] shrink-0 border border-line-strong bg-layer-page shadow-sm"
            >
              <SidebarComposition />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant dark">
            <PreviewThemeScope
              family="elegant"
              mode="dark"
              className="dark h-full w-[308px] shrink-0 border border-line-strong bg-layer-page shadow-sm"
            >
              <SidebarComposition />
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
        <SidebarSourceFiles code={code} />
      </DocSection>
    </DocPage>
  );
}

/** Sidebar composition plus the shared section-header menu helpers it renders. */
function SidebarSourceFiles({
  code,
  collapsible = true,
}: {
  code: Record<string, string>;
  collapsible?: boolean;
}) {
  return (
    <DocsCodeBlock.Files
      collapsible={collapsible}
      showLineNumbers={false}
      files={[
        {
          path: SIDEBAR_COMPOSITION_PATH,
          source: sidebarCompositionSource,
          html: code.sidebarComposition,
          collapsedHtml: code.sidebarCompositionBody,
        },
        {
          path: SIDEBAR_SECTION_HEADER_MENU_COMPOSITION_PATH,
          source: sidebarSectionHeaderMenuCompositionSource,
          html: code.sidebarSectionHeaderMenuComposition,
          collapsedHtml: code.sidebarSectionHeaderMenuCompositionBody,
        },
      ]}
    />
  );
}

function PreviewGrid({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function PreviewPane({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-none border border-line bg-layer-panel">
      <div className="border-b border-line bg-fill-muted px-3 py-2 text-xs font-medium text-foreground-muted">
        {label}
      </div>
      <div className="flex h-[560px] items-stretch justify-start overflow-x-auto bg-white p-2">
        {children}
      </div>
    </div>
  );
}
