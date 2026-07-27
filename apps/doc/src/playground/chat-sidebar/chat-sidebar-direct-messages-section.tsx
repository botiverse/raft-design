import { Fragment } from "react";
import {
  ChatSidebarSection,
  ChatSidebarSectionAttention,
  ChatSidebarSectionChevron,
  ChatSidebarSectionControls,
  ChatSidebarSectionDisclosure,
  ChatSidebarSectionTitle,
  ChatSidebarSectionTrailing,
} from "raft-ui";

import {
  SidebarSectionHeaderMenu,
  SidebarSectionSortMenu,
} from "#/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx";
import type { PlaygroundChannelId, PlaygroundDirectMessageRecord } from "../mock/index.ts";
import { ChatSidebarDirectMessageItem } from "./chat-sidebar-direct-message-item.tsx";
import { ChatSidebarProjectionPreview } from "./chat-sidebar-dnd.tsx";
import { createChatSidebarDropTargetId } from "./chat-sidebar-dnd-ids.ts";
import {
  ChatSidebarDropTarget,
  SortableChatSidebarItem,
  SortableChatSidebarList,
} from "./chat-sidebar-sortable.tsx";
import { useChatSidebarDnd } from "./use-chat-sidebar-dnd.ts";

export function ChatSidebarDirectMessagesSection({
  activeChannelId,
  onCloseDm,
  rows,
}: {
  activeChannelId: PlaygroundChannelId | null;
  onCloseDm: (row: PlaygroundDirectMessageRecord) => void;
  rows: readonly PlaygroundDirectMessageRecord[];
}) {
  const { getDragId, getProjection, orderRows } = useChatSidebarDnd();
  const ordered = orderRows("dms", rows);
  const projection = getProjection("dms");
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
      <ChatSidebarDropTarget
        id={createChatSidebarDropTargetId("dms")}
        section="dms"
        empty={ordered.length === 0}
      >
        <SortableChatSidebarList items={ordered.map((row) => getDragId("dms", row.id))}>
          {ordered.map((row) => (
            <Fragment key={row.id}>
              <ChatSidebarProjectionPreview anchorChannelId={row.id} projection={projection} />
              <SortableChatSidebarItem
                id={getDragId("dms", row.id)}
                section="dms"
                channelId={row.id}
                active={activeChannelId === row.id}
              >
                <ChatSidebarDirectMessageItem
                  activeChannelId={activeChannelId}
                  directMessage={row}
                  onClose={onCloseDm}
                />
              </SortableChatSidebarItem>
            </Fragment>
          ))}
          <ChatSidebarProjectionPreview projection={projection} />
        </SortableChatSidebarList>
      </ChatSidebarDropTarget>
    </ChatSidebarSection>
  );
}
