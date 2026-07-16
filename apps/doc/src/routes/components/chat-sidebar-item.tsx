import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import {
  ChatSidebarItemDirectMessageComparison,
  ChatSidebarItemNotificationComparison,
  ChatSidebarItemSelectedComparison,
} from "#/modules/chat-sidebar-item/chat-sidebar-item.comparison.tsx";
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

const PROPS: readonly PropRow[] = [
  {
    name: "ChatSidebarItem",
    type: "button props",
    description:
      "Interactive row root. Use active for visual state; route consumers provide aria-current for the current destination, and unread state is composed from explicit indicators and counts.",
  },
  {
    name: "ChatSidebarItemIcon",
    type: "span props",
    description: "Leading avatar or general icon slot for a row.",
  },
  {
    name: "ChatSidebarItemChannelIcon",
    type: "span props",
    description: "Leading channel glyph slot for a row.",
  },
  {
    name: "ChatSidebarItemContent",
    type: "span props",
    description:
      "Groups title and subtitle content. Its layout adapts automatically when those parts are present.",
  },
  {
    name: "ChatSidebarItemTitle",
    type: "span props",
    description: "Truncating primary destination label.",
  },
  {
    name: "ChatSidebarItemSubtitle",
    type: "span props",
    description: "Truncating secondary activity copy.",
  },
  {
    name: "ChatSidebarItemMeta",
    type: "span props",
    description: "Low-emphasis inline metadata beside row content.",
  },
  {
    name: "ChatSidebarItemAside",
    type: "span props",
    description: "Trailing layout slot for consumer-chosen metadata parts.",
  },
  {
    name: "ChatSidebarItemStatus",
    type: "span props",
    description: "Availability-status slot. Consumers provide the Status content.",
  },
  {
    name: "ChatSidebarItemIndicator",
    type: "Badge props",
    description: "Mention or attention indicator. Supply an accessible label.",
  },
  {
    name: "ChatSidebarItemCount",
    type: "Badge props",
    description: "Unread-count badge in the trailing area.",
  },
  {
    name: "ChatSidebarItemMetaIcon",
    type: "span props",
    description: "Draft, muted, or other low-emphasis metadata icon.",
  },
];

export const Route = createFileRoute("/components/chat-sidebar-item")({
  component: ChatSidebarItemDoc,
  loader: () =>
    highlightSnippets({
      data: { anatomy: ANATOMY_SNIPPET, composition: chatSidebarItemCompositionSource },
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
        <Example html={code.composition} previewClassName="items-stretch">
          <ChatSidebarItemStatesComposition />
        </Example>
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
              brutal: <ChatSidebarItemSelectedComparison />,
              elegant: <ChatSidebarItemSelectedComparison />,
              elegantDark: <ChatSidebarItemSelectedComparison />,
            },
            {
              label: "Mention and unread metadata",
              status: "review",
              source: (
                <SourceThemeScope>
                  <SourceChatSidebarItemNotificationPreview />
                </SourceThemeScope>
              ),
              brutal: <ChatSidebarItemNotificationComparison />,
              elegant: <ChatSidebarItemNotificationComparison />,
              elegantDark: <ChatSidebarItemNotificationComparison />,
            },
            {
              label: "Agent presence",
              status: "review",
              source: (
                <SourceThemeScope>
                  <SourceChatSidebarItemDirectMessagePreview />
                </SourceThemeScope>
              ),
              brutal: <ChatSidebarItemDirectMessageComparison />,
              elegant: <ChatSidebarItemDirectMessageComparison />,
              elegantDark: <ChatSidebarItemDirectMessageComparison />,
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
