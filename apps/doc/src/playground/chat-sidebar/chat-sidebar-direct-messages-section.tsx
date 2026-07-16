import {
  ChatSidebarSection,
  ChatSidebarSectionAttention,
  ChatSidebarSectionChevron,
  ChatSidebarSectionControls,
  ChatSidebarSectionDisclosure,
  ChatSidebarSectionTitle,
  ChatSidebarSectionTrailing,
  SortableChatSidebarItem,
  SortableChatSidebarList,
} from "raft-ui/wip";

import {
  SidebarSectionHeaderMenu,
  SidebarSectionSortMenu,
} from "#/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx";
import type { PlaygroundChannelId, PlaygroundDirectMessageRecord } from "../mock/index.ts";
import { ChatSidebarDirectMessageItem } from "./chat-sidebar-direct-message-item.tsx";
import { useChatSidebarSectionOrder } from "./use-chat-sidebar-section-order.ts";

export function ChatSidebarDirectMessagesSection({
  activeChannelId,
  onCloseDm,
  rows,
}: {
  activeChannelId: PlaygroundChannelId | null;
  onCloseDm: (row: PlaygroundDirectMessageRecord) => void;
  rows: readonly PlaygroundDirectMessageRecord[];
}) {
  const { ordered, visibleOrder, onReorder } = useChatSidebarSectionOrder(rows);
  const hasUnread = ordered.some(
    (row) => row.navigation.unread || row.navigation.badge || row.navigation.mention,
  );

  return (
    <ChatSidebarSection>
      <SidebarSectionHeaderMenu menu="sort">
        <ChatSidebarSectionDisclosure type="button">
          <ChatSidebarSectionTitle>Direct Messages</ChatSidebarSectionTitle>
          <ChatSidebarSectionChevron />
        </ChatSidebarSectionDisclosure>
        <ChatSidebarSectionTrailing>
          {hasUnread ? <ChatSidebarSectionAttention /> : null}
          <ChatSidebarSectionControls>
            <SidebarSectionSortMenu aria-label="Sort direct messages" />
          </ChatSidebarSectionControls>
        </ChatSidebarSectionTrailing>
      </SidebarSectionHeaderMenu>
      <SortableChatSidebarList items={visibleOrder} onReorder={onReorder}>
        {ordered.map((row) => (
          <SortableChatSidebarItem key={row.id} id={row.id}>
            <ChatSidebarDirectMessageItem
              activeChannelId={activeChannelId}
              directMessage={row}
              onClose={onCloseDm}
            />
          </SortableChatSidebarItem>
        ))}
      </SortableChatSidebarList>
    </ChatSidebarSection>
  );
}
