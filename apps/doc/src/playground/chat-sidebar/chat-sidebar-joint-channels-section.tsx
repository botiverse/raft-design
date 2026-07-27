import { Fragment } from "react";
import {
  ChatSidebarSection,
  ChatSidebarSectionAttention,
  ChatSidebarSectionChevron,
  ChatSidebarSectionControls,
  ChatSidebarSectionDisclosure,
  ChatSidebarSectionEmpty,
  ChatSidebarSectionTitle,
  ChatSidebarSectionTrailing,
} from "raft-ui";

import {
  SidebarSectionAddButton,
  SidebarSectionChannelsMenu,
  SidebarSectionHeaderMenu,
} from "#/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx";
import type { PlaygroundChannelId, PlaygroundRoomChannelRecord } from "../mock/index.ts";
import { ChatSidebarChannelItem } from "./chat-sidebar-channel-item.tsx";
import { ChatSidebarProjectionPreview } from "./chat-sidebar-dnd.tsx";
import { createChatSidebarDropTargetId } from "./chat-sidebar-dnd-ids.ts";
import {
  ChatSidebarDropTarget,
  SortableChatSidebarItem,
  SortableChatSidebarList,
} from "./chat-sidebar-sortable.tsx";
import { useChatSidebarDnd } from "./use-chat-sidebar-dnd.ts";

export function ChatSidebarJointChannelsSection({
  activeChannelId,
  rows,
}: {
  activeChannelId: PlaygroundChannelId | null;
  rows: readonly PlaygroundRoomChannelRecord[];
}) {
  const { getDragId, getProjection, orderRows } = useChatSidebarDnd();
  const ordered = orderRows("joint", rows);
  const projection = getProjection("joint");
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
      <ChatSidebarDropTarget
        id={createChatSidebarDropTargetId("joint")}
        section="joint"
        empty={ordered.length === 0}
      >
        {ordered.length === 0 ? (
          <ChatSidebarSectionEmpty>No joint channels yet</ChatSidebarSectionEmpty>
        ) : (
          <SortableChatSidebarList items={ordered.map((row) => getDragId("joint", row.id))}>
            {ordered.map((row) => (
              <Fragment key={row.id}>
                <ChatSidebarProjectionPreview anchorChannelId={row.id} projection={projection} />
                <SortableChatSidebarItem
                  id={getDragId("joint", row.id)}
                  section="joint"
                  channelId={row.id}
                  active={activeChannelId === row.id}
                >
                  <ChatSidebarChannelItem activeChannelId={activeChannelId} channel={row} />
                </SortableChatSidebarItem>
              </Fragment>
            ))}
            <ChatSidebarProjectionPreview projection={projection} />
          </SortableChatSidebarList>
        )}
      </ChatSidebarDropTarget>
    </ChatSidebarSection>
  );
}
