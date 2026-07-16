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
  SidebarSectionAddButton,
  SidebarSectionChannelsMenu,
  SidebarSectionHeaderMenu,
} from "#/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx";
import type { PlaygroundChannelId, PlaygroundRoomChannelRecord } from "../mock/index.ts";
import { ChatSidebarChannelItem } from "./chat-sidebar-channel-item.tsx";
import { useChatSidebarSectionOrder } from "./use-chat-sidebar-section-order.ts";

export function ChatSidebarJointChannelsSection({
  activeChannelId,
  rows,
}: {
  activeChannelId: PlaygroundChannelId | null;
  rows: readonly PlaygroundRoomChannelRecord[];
}) {
  const { ordered, visibleOrder, onReorder } = useChatSidebarSectionOrder(rows);
  const hasUnread = ordered.some(
    (row) => row.navigation.unread || row.navigation.badge || row.navigation.mention,
  );

  return (
    <ChatSidebarSection>
      <SidebarSectionHeaderMenu
        menu="channels"
        count={ordered.length}
        countLabel="channels"
        createLabel="Create Joint Channel"
        createIcon="joint"
      >
        <ChatSidebarSectionDisclosure type="button">
          <ChatSidebarSectionTitle>Joint channels</ChatSidebarSectionTitle>
          <ChatSidebarSectionChevron />
        </ChatSidebarSectionDisclosure>
        <ChatSidebarSectionTrailing>
          {hasUnread ? <ChatSidebarSectionAttention /> : null}
          <ChatSidebarSectionControls>
            <SidebarSectionAddButton aria-label="Create joint channel" />
            <SidebarSectionChannelsMenu
              aria-label="Joint channels menu"
              count={ordered.length}
              countLabel="channels"
              createLabel="Create Joint Channel"
              createIcon="joint"
            />
          </ChatSidebarSectionControls>
        </ChatSidebarSectionTrailing>
      </SidebarSectionHeaderMenu>
      {ordered.length === 0 ? (
        <ChatSidebarSectionEmpty>No joint channels yet</ChatSidebarSectionEmpty>
      ) : (
        <SortableChatSidebarList items={visibleOrder} onReorder={onReorder}>
          {ordered.map((row) => (
            <SortableChatSidebarItem key={row.id} id={row.id}>
              <ChatSidebarChannelItem activeChannelId={activeChannelId} channel={row} />
            </SortableChatSidebarItem>
          ))}
        </SortableChatSidebarList>
      )}
    </ChatSidebarSection>
  );
}
