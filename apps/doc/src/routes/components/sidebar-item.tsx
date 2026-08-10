import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SidebarItemChannelComposition } from "#/modules/sidebar-item/compositions/channel-item.composition.tsx";
import channelItemCompositionSource from "#/modules/sidebar-item/compositions/channel-item.composition.tsx?raw";
import { SidebarItemDirectMessageComposition } from "#/modules/sidebar-item/compositions/direct-message-item.composition.tsx";
import directMessageItemCompositionSource from "#/modules/sidebar-item/compositions/direct-message-item.composition.tsx?raw";
import { SidebarItemNavigationComposition } from "#/modules/sidebar-item/compositions/navigation-item.composition.tsx";
import navigationItemCompositionSource from "#/modules/sidebar-item/compositions/navigation-item.composition.tsx?raw";
import { SidebarItemStatesComposition } from "#/modules/sidebar-item/sidebar-item.composition.tsx";
import sidebarItemCompositionSource from "#/modules/sidebar-item/sidebar-item.composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const ANATOMY_SNIPPET = `import {
  SidebarItem,
  SidebarItemAside,
  SidebarItemChannelIcon,
  SidebarItemContent,
  SidebarItemCount,
  SidebarItemIndicator,
  SidebarItemMetaIcon,
  SidebarItemSubtitle,
  SidebarItemTitle,
} from "raft-ui";

<SidebarItem active variant="default">
  <SidebarItemChannelIcon />
  <SidebarItemContent>
    <SidebarItemTitle />
    <SidebarItemSubtitle />
  </SidebarItemContent>
  <SidebarItemAside>
    <SidebarItemIndicator />
    <SidebarItemCount />
    <SidebarItemMetaIcon />
  </SidebarItemAside>
</SidebarItem>`;

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "compositions", title: "Compositions" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const SIDEBAR_ITEM_PROPS: readonly PropRow[] = [
  {
    name: "active",
    type: "boolean",
    default: "false",
    description:
      "Marks the row as active. Sets data-active for visual state; route consumers provide aria-current for the current destination.",
  },
  {
    name: "variant",
    type: '"default" | "primary" | "accent"',
    default: '"default"',
    description:
      "Selects the active treatment. Brutal maps default, primary, and accent to white, yellow, and pink; Elegant keeps its theme-owned active surface.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description:
      "Interactive row root. Unread state is composed from explicit indicators and counts.",
  },
];

const SIDEBAR_ITEM_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Leading avatar or general icon slot for a row.",
  },
];

const SIDEBAR_ITEM_CHANNEL_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Leading icon container. Pass the concrete icon as its child.",
  },
];

const SIDEBAR_ITEM_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "stacked",
    type: "boolean",
    default: "false",
    description: "Stacks title and subtitle vertically when the row needs secondary activity copy.",
  },
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Groups title and subtitle content.",
  },
];

const SIDEBAR_ITEM_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Truncating primary destination label.",
  },
];

const SIDEBAR_ITEM_SUBTITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Truncating secondary activity copy.",
  },
];

const SIDEBAR_ITEM_META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Low-emphasis inline metadata beside row content.",
  },
];

const SIDEBAR_ITEM_ASIDE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Trailing layout slot for consumer-chosen metadata parts.",
  },
];

const SIDEBAR_ITEM_STATUS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description:
      "Availability-status slot. A direct Status child uses the Sidebar theme size (sm in Brutal, xs in Elegant); consumers provide its label, state variant, and pulse behavior.",
  },
];

const SIDEBAR_ITEM_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Badge props",
    description: "Mention or attention indicator. Supply an accessible label.",
  },
];

const SIDEBAR_ITEM_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Badge props",
    description: "Unread-count badge in the trailing area.",
  },
];

const SIDEBAR_ITEM_META_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'useRender.ComponentProps<"span">',
    description: "Draft, muted, or other low-emphasis metadata icon.",
  },
];

export const Route = createFileRoute("/components/sidebar-item")({
  component: SidebarItemDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SNIPPET,
        composition: sidebarItemCompositionSource,
        navigationItem: navigationItemCompositionSource,
        channelItem: channelItemCompositionSource,
        directMessageItem: directMessageItemCompositionSource,
      },
    }),
});

function SidebarItemDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="SidebarItem"
      description="Composable rows for channel, direct-message, and member lists."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="items-stretch">
          <Preview.Canvas>
            <SidebarItemStatesComposition />
          </Preview.Canvas>
          <Preview.Code html={code.composition} collapsedHtml={code.compositionBody} />
        </Preview>
      </DocSection>

      <DocSection id="compositions" title="Compositions">
        <div className="space-y-8">
          <DocSubsection
            parentId="compositions"
            id="composition-navigation"
            title="Navigation and active variants"
          >
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <div className="w-full max-w-72">
                  <SidebarItemNavigationComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.navigationItem} collapsedHtml={code.navigationItemBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection parentId="compositions" id="composition-channel" title="Channel item">
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <div className="w-full max-w-72">
                  <SidebarItemChannelComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code html={code.channelItem} collapsedHtml={code.channelItemBody} />
            </Preview>
          </DocSubsection>

          <DocSubsection
            parentId="compositions"
            id="composition-direct-message"
            title="Direct-message item"
          >
            <Preview previewClassName="items-stretch">
              <Preview.Canvas>
                <div className="w-full max-w-72">
                  <SidebarItemDirectMessageComposition />
                </div>
              </Preview.Canvas>
              <Preview.Code
                html={code.directMessageItem}
                collapsedHtml={code.directMessageItemBody}
              />
            </Preview>
          </DocSubsection>
        </div>
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
          <DocSubsection parentId="api" id="api-sidebar-item-aside" title="SidebarItemAside">
            <PropsTable rows={SIDEBAR_ITEM_ASIDE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-item-status" title="SidebarItemStatus">
            <PropsTable rows={SIDEBAR_ITEM_STATUS_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-sidebar-item-indicator"
            title="SidebarItemIndicator"
          >
            <PropsTable rows={SIDEBAR_ITEM_INDICATOR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-item-count" title="SidebarItemCount">
            <PropsTable rows={SIDEBAR_ITEM_COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-sidebar-item-meta-icon" title="SidebarItemMetaIcon">
            <PropsTable rows={SIDEBAR_ITEM_META_ICON_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
