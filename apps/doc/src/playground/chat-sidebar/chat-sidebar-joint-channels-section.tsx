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
import { useChatSidebarDnd } from "./use-chat-sidebar-dnd.ts";

export function ChatSidebarJointChannelsSection({
  activeChannelId,
  rows,
}: {
  activeChannelId: PlaygroundChannelId | null;
  rows: readonly PlaygroundRoomChannelRecord[];
}) {
  const { getDragId, orderRows } = useChatSidebarDnd();
  const ordered = orderRows("joint", rows);
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
        <SortableChatSidebarList items={ordered.map((row) => getDragId("joint", row.id))}>
          {ordered.map((row) => (
            <SortableChatSidebarItem key={row.id} id={getDragId("joint", row.id)}>
              <ChatSidebarChannelItem activeChannelId={activeChannelId} channel={row} />
            </SortableChatSidebarItem>
          ))}
        </SortableChatSidebarList>
      )}
    </ChatSidebarSection>
  );
}
