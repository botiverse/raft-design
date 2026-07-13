import { createFileRoute } from "@tanstack/react-router";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { ChatSidebarItemStatesComposition } from "#/compositions/chat-sidebar-item-composition.tsx";
import chatSidebarItemCompositionSource from "#/compositions/chat-sidebar-item-composition.tsx?raw";
import { highlightSnippets } from "#/lib/highlight.tsx";

const ANATOMY_SNIPPET = `<ChatSidebarItem>
  <ChatSidebarItemChannelIcon />
  <ChatSidebarItemText>
    <ChatSidebarItemTitle />
    <ChatSidebarItemSubtitle />
  </ChatSidebarItemText>
  <ChatSidebarItemAside>
    <ChatSidebarItemMention />
    <ChatSidebarItemBadge />
    <ChatSidebarItemDraft />
    <ChatSidebarItemMuted />
  </ChatSidebarItemAside>
</ChatSidebarItem>`;

const TOC = [
  { id: "states", title: "States" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const PROPS: readonly PropRow[] = [
  {
    name: "ChatSidebarItem / ChatSidebarItemUnread",
    type: "button props",
    description:
      "Interactive row root. Use the explicit unread root for unread title weight and aria-current for the current destination.",
  },
  {
    name: "ChatSidebarItemIcon / ChatSidebarItemChannelIcon",
    type: "span props",
    description: "Leading visual slots for direct-message avatars and channel glyphs.",
  },
  {
    name: "ChatSidebarItemText / ChatSidebarItemInlineText",
    type: "span props & inline text variants",
    description:
      "Stacked or inline text layouts. InlineText supports alignment and constrained title width without changing row structure.",
  },
  {
    name: "ChatSidebarItemTitle / Subtitle / Meta",
    type: "span props",
    description:
      "Truncating destination labels, activity copy, and trailing low-emphasis metadata.",
  },
  {
    name: "ChatSidebarItemAside",
    type: "span props",
    description: "Trailing layout slot for consumer-chosen metadata parts.",
  },
  {
    name: "ChatSidebarItemIndicator / Presence",
    type: "span props",
    description:
      "Generic and presence-specific indicator slots. Consumers provide the Status or other indicator content.",
  },
  {
    name: "ChatSidebarItemMention / Badge / Draft / Muted",
    type: "span or Badge props",
    description:
      "Explicit metadata parts. The consumer decides which statuses apply and supplies accessible labels.",
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
      overview={
        <Differences from="ChatSidebar">
          <li>owns reusable row structure and visual states, not list or section layout</li>
          <li>
            keeps destination labels, activity copy, presence, and notification policy caller-owned
          </li>
          <li>uses explicit parts for visible metadata instead of a structural state prop</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="states" title="Channel and direct-message states" showThemeSwitcher>
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
    </DocPage>
  );
}
