import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { ChatSidebarItemAgentPresenceComposition } from "#/modules/chat-sidebar-item/compositions/agent-presence.composition.tsx";
import agentPresenceCompositionSource from "#/modules/chat-sidebar-item/compositions/agent-presence.composition.tsx?raw";
import { ChatSidebarItemMentionAndUnreadComposition } from "#/modules/chat-sidebar-item/compositions/mention-and-unread.composition.tsx";
import mentionAndUnreadCompositionSource from "#/modules/chat-sidebar-item/compositions/mention-and-unread.composition.tsx?raw";
import { ChatSidebarItemSelectedChannelComposition } from "#/modules/chat-sidebar-item/compositions/selected-channel.composition.tsx";
import selectedChannelCompositionSource from "#/modules/chat-sidebar-item/compositions/selected-channel.composition.tsx?raw";
import { ChatSidebarItemStatesComposition } from "#/modules/chat-sidebar-item/chat-sidebar-item.composition.tsx";
import {
  SourceChatSidebarItemDirectMessagePreview,
  SourceChatSidebarItemNotificationPreview,
  SourceChatSidebarItemSelectedPreview,
} from "#/modules/chat-sidebar-item/chat-sidebar-item.source-preview.tsx";
import chatSidebarItemCompositionSource from "#/modules/chat-sidebar-item/chat-sidebar-item.composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const ANATOMY_SNIPPET = `<ChatSidebarItem>
  <ChatSidebarItemChannelIcon />
  <ChatSidebarItemContent>
    <ChatSidebarItemTitle />
    <ChatSidebarItemSubtitle />
  </ChatSidebarItemContent>
  <ChatSidebarItemAside>
    <ChatSidebarItemIndicator />
    <ChatSidebarItemCount />
    <ChatSidebarItemMetaIcon />
  </ChatSidebarItemAside>
</ChatSidebarItem>`;

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

const CHAT_SIDEBAR_ITEM_PROPS: readonly PropRow[] = [
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

const CHAT_SIDEBAR_ITEM_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Leading avatar or general icon slot for a row.",
  },
];

const CHAT_SIDEBAR_ITEM_CHANNEL_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Leading channel glyph slot for a row.",
  },
];

const CHAT_SIDEBAR_ITEM_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description:
      "Groups title and subtitle content. Its layout adapts automatically when those parts are present.",
  },
];

const CHAT_SIDEBAR_ITEM_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Truncating primary destination label.",
  },
];

const CHAT_SIDEBAR_ITEM_SUBTITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Truncating secondary activity copy.",
  },
];

const CHAT_SIDEBAR_ITEM_META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Low-emphasis inline metadata beside row content.",
  },
];

const CHAT_SIDEBAR_ITEM_ASIDE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Trailing layout slot for consumer-chosen metadata parts.",
  },
];

const CHAT_SIDEBAR_ITEM_STATUS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Availability-status slot. Consumers provide the Status content.",
  },
];

const CHAT_SIDEBAR_ITEM_INDICATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Badge props",
    description: "Mention or attention indicator. Supply an accessible label.",
  },
];

const CHAT_SIDEBAR_ITEM_COUNT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Badge props",
    description: "Unread-count badge in the trailing area.",
  },
];

const CHAT_SIDEBAR_ITEM_META_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Draft, muted, or other low-emphasis metadata icon.",
  },
];

export const Route = createFileRoute("/components/chat-sidebar-item")({
  component: ChatSidebarItemDoc,
  loader: () =>
    highlightSnippets({
      data: {
        anatomy: ANATOMY_SNIPPET,
        composition: chatSidebarItemCompositionSource,
        selectedChannel: selectedChannelCompositionSource,
        mentionAndUnread: mentionAndUnreadCompositionSource,
        agentPresence: agentPresenceCompositionSource,
      },
    }),
});

function ChatSidebarItemDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ChatSidebarItem"
      description="Composable channel and direct-message rows for ChatSidebar lists."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <Preview previewClassName="items-stretch">
          <Preview.Canvas>
            <ChatSidebarItemStatesComposition />
          </Preview.Canvas>
          <Preview.Code html={code.composition} />
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
            id="api-chat-sidebar-item-aside"
            title="ChatSidebarItemAside"
          >
            <PropsTable rows={CHAT_SIDEBAR_ITEM_ASIDE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-item-status"
            title="ChatSidebarItemStatus"
          >
            <PropsTable rows={CHAT_SIDEBAR_ITEM_STATUS_PROPS} />
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
            id="api-chat-sidebar-item-count"
            title="ChatSidebarItemCount"
          >
            <PropsTable rows={CHAT_SIDEBAR_ITEM_COUNT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-chat-sidebar-item-meta-icon"
            title="ChatSidebarItemMetaIcon"
          >
            <PropsTable rows={CHAT_SIDEBAR_ITEM_META_ICON_PROPS} />
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
                  <SourceChatSidebarItemSelectedPreview />
                </SourceThemeScope>
              ),
              brutal: <ChatSidebarItemSelectedChannelComposition />,
              elegant: <ChatSidebarItemSelectedChannelComposition />,
              elegantDark: <ChatSidebarItemSelectedChannelComposition />,
              compositionCode: code.selectedChannel,
              compositionPath:
                "apps/doc/src/modules/chat-sidebar-item/compositions/selected-channel.composition.tsx",
              compositionSource: selectedChannelCompositionSource,
            },
            {
              label: "Mention and unread metadata",
              status: "review",
              source: (
                <SourceThemeScope>
                  <SourceChatSidebarItemNotificationPreview />
                </SourceThemeScope>
              ),
              brutal: <ChatSidebarItemMentionAndUnreadComposition />,
              elegant: <ChatSidebarItemMentionAndUnreadComposition />,
              elegantDark: <ChatSidebarItemMentionAndUnreadComposition />,
              compositionCode: code.mentionAndUnread,
              compositionPath:
                "apps/doc/src/modules/chat-sidebar-item/compositions/mention-and-unread.composition.tsx",
              compositionSource: mentionAndUnreadCompositionSource,
            },
            {
              label: "Agent presence",
              status: "review",
              source: (
                <SourceThemeScope>
                  <SourceChatSidebarItemDirectMessagePreview />
                </SourceThemeScope>
              ),
              brutal: <ChatSidebarItemAgentPresenceComposition />,
              elegant: <ChatSidebarItemAgentPresenceComposition />,
              elegantDark: <ChatSidebarItemAgentPresenceComposition />,
              compositionCode: code.agentPresence,
              compositionPath:
                "apps/doc/src/modules/chat-sidebar-item/compositions/agent-presence.composition.tsx",
              compositionSource: agentPresenceCompositionSource,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
