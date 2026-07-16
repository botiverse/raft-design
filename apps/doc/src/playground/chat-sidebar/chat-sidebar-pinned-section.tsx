import {
  ChatSidebarSection,
  ChatSidebarSectionAttention,
  ChatSidebarSectionChevron,
  ChatSidebarSectionControls,
  ChatSidebarSectionDisclosure,
  ChatSidebarSectionEmpty,
  ChatSidebarSectionTitle,
  ChatSidebarSectionTrailing,
  SortableChatSidebarItem,
  SortableChatSidebarList,
} from "raft-ui/wip";

import {
  SidebarSectionHeaderMenu,
  SidebarSectionSortMenu,
} from "#/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx";
import type {
  PlaygroundChannelId,
  PlaygroundChannelRecord,
  PlaygroundDirectMessageRecord,
  PlaygroundRoomChannelRecord,
} from "../mock/index.ts";
import { PlaygroundConversationLink } from "../navigation/conversation-link.tsx";
import { PlaygroundChatSidebarItem } from "./chat-sidebar-item.tsx";
import { ChatSidebarPinnedRowContent } from "./chat-sidebar-pinned-row-content.tsx";
import { getChatSidebarRowMenu } from "./chat-sidebar-row-menu.ts";
import { useChatSidebarSectionOrder } from "./use-chat-sidebar-section-order.ts";

export function ChatSidebarPinnedSection({
  activeChannelId,
  onArchive,
  onCloseDm,
  rows,
}: {
  activeChannelId: PlaygroundChannelId | null;
  onArchive: (row: PlaygroundRoomChannelRecord) => void;
  onCloseDm: (row: PlaygroundDirectMessageRecord) => void;
  rows: readonly PlaygroundChannelRecord[];
}) {
  const { ordered, visibleOrder, onReorder } = useChatSidebarSectionOrder(rows);
  const hasUnread = ordered.some(
    (row) => row.navigation.unread || row.navigation.badge || row.navigation.mention,
  );

  return (
    <ChatSidebarSection>
      <SidebarSectionHeaderMenu menu="sort">
        <ChatSidebarSectionDisclosure type="button">
          <ChatSidebarSectionTitle>Pinned</ChatSidebarSectionTitle>
          <ChatSidebarSectionChevron />
        </ChatSidebarSectionDisclosure>
        <ChatSidebarSectionTrailing>
          {hasUnread ? <ChatSidebarSectionAttention /> : null}
          <ChatSidebarSectionControls>
            <SidebarSectionSortMenu aria-label="Sort pinned" />
          </ChatSidebarSectionControls>
        </ChatSidebarSectionTrailing>
      </SidebarSectionHeaderMenu>
      {ordered.length === 0 ? (
        <ChatSidebarSectionEmpty>Drag channels or DMs here to pin</ChatSidebarSectionEmpty>
      ) : (
        <SortableChatSidebarList items={visibleOrder} onReorder={onReorder}>
          {ordered.map((row) => (
            <SortableChatSidebarItem key={row.id} id={row.id}>
              <PlaygroundChatSidebarItem
                active={activeChannelId === row.id}
                menu={getChatSidebarRowMenu(row)}
                onArchive={row.kind === "dm" ? undefined : () => onArchive(row)}
                onCloseDm={row.kind === "dm" ? () => onCloseDm(row) : undefined}
                render={<PlaygroundConversationLink conversation={row} />}
              >
                <ChatSidebarPinnedRowContent row={row} hideBadge={activeChannelId === row.id} />
              </PlaygroundChatSidebarItem>
            </SortableChatSidebarItem>
          ))}
        </SortableChatSidebarList>
      )}
    </ChatSidebarSection>
  );
}
