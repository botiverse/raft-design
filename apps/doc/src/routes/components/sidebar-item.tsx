import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { SidebarItemAgentPresenceComposition } from "#/modules/sidebar-item/compositions/agent-presence.composition.tsx";
import agentPresenceCompositionSource from "#/modules/sidebar-item/compositions/agent-presence.composition.tsx?raw";
import { SidebarItemMentionAndUnreadComposition } from "#/modules/sidebar-item/compositions/mention-and-unread.composition.tsx";
import mentionAndUnreadCompositionSource from "#/modules/sidebar-item/compositions/mention-and-unread.composition.tsx?raw";
import { SidebarItemSelectedChannelComposition } from "#/modules/sidebar-item/compositions/selected-channel.composition.tsx";
import selectedChannelCompositionSource from "#/modules/sidebar-item/compositions/selected-channel.composition.tsx?raw";
import { SidebarItemStatesComposition } from "#/modules/sidebar-item/sidebar-item.composition.tsx";
import {
  SourceSidebarItemDirectMessagePreview,
  SourceSidebarItemNotificationPreview,
  SourceSidebarItemSelectedPreview,
} from "#/modules/sidebar-item/sidebar-item.source-preview.tsx";
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

<SidebarItem>
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
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SOURCE_SCENES = [
  {
    label: "Slock sidebar rows",
    scenes: [
      {
        label: "Sidebar.tsx",
        path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/layout/Sidebar.tsx",
      },
    ],
  },
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
    name: "...props",
    type: 'useRender.ComponentProps<"button">',
    description:
      "Interactive row root. Unread state is composed from explicit indicators and counts.",
  },
];

const SIDEBAR_ITEM_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Leading avatar or general icon slot for a row.",
  },
];

const SIDEBAR_ITEM_CHANNEL_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Leading icon container. Pass the concrete icon as its child.",
  },
];

const SIDEBAR_ITEM_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description:
      "Groups title and subtitle content. Its layout adapts automatically when those parts are present.",
  },
];

const SIDEBAR_ITEM_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Truncating primary destination label.",
  },
];

const SIDEBAR_ITEM_SUBTITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Truncating secondary activity copy.",
  },
];

const SIDEBAR_ITEM_META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Low-emphasis inline metadata beside row content.",
  },
];

const SIDEBAR_ITEM_ASIDE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Trailing layout slot for consumer-chosen metadata parts.",
  },
];

const SIDEBAR_ITEM_STATUS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Availability-status slot. Consumers provide the Status content.",
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
    type: "span props",
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
        selectedChannel: selectedChannelCompositionSource,
        mentionAndUnread: mentionAndUnreadCompositionSource,
        agentPresence: agentPresenceCompositionSource,
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

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          layout="grid"
          items={[
            {
              label: "Selected channel",
              status: "review",
              sourceScenes: SOURCE_SCENES,
              source: (
                <SourceThemeScope>
                  <SourceSidebarItemSelectedPreview />
                </SourceThemeScope>
              ),
              brutal: <SidebarItemSelectedChannelComposition />,
              elegant: <SidebarItemSelectedChannelComposition />,
              elegantDark: <SidebarItemSelectedChannelComposition />,
              compositionCode: code.selectedChannel,
              compositionCollapsedCode: code.selectedChannelBody,
              compositionPath:
                "apps/doc/src/modules/sidebar-item/compositions/selected-channel.composition.tsx",
              compositionSource: selectedChannelCompositionSource,
            },
            {
              label: "Mention and unread metadata",
              status: "review",
              source: (
                <SourceThemeScope>
                  <SourceSidebarItemNotificationPreview />
                </SourceThemeScope>
              ),
              brutal: <SidebarItemMentionAndUnreadComposition />,
              elegant: <SidebarItemMentionAndUnreadComposition />,
              elegantDark: <SidebarItemMentionAndUnreadComposition />,
              compositionCode: code.mentionAndUnread,
              compositionCollapsedCode: code.mentionAndUnreadBody,
              compositionPath:
                "apps/doc/src/modules/sidebar-item/compositions/mention-and-unread.composition.tsx",
              compositionSource: mentionAndUnreadCompositionSource,
            },
            {
              label: "Agent presence",
              status: "review",
              source: (
                <SourceThemeScope>
                  <SourceSidebarItemDirectMessagePreview />
                </SourceThemeScope>
              ),
              brutal: <SidebarItemAgentPresenceComposition />,
              elegant: <SidebarItemAgentPresenceComposition />,
              elegantDark: <SidebarItemAgentPresenceComposition />,
              compositionCode: code.agentPresence,
              compositionCollapsedCode: code.agentPresenceBody,
              compositionPath:
                "apps/doc/src/modules/sidebar-item/compositions/agent-presence.composition.tsx",
              compositionSource: agentPresenceCompositionSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
