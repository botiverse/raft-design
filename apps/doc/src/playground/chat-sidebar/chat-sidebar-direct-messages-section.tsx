import { Fragment, useMemo } from "react";
import {
  SidebarSection,
  SidebarSectionAttention,
  SidebarSectionChevron,
  SidebarSectionControls,
  SidebarSectionDisclosure,
  SidebarSectionTitle,
  SidebarSectionTrailing,
} from "@botiverse/raft-ui";

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
  const dragIds = useMemo(
    () => ordered.map((row) => getDragId("dms", row.id)),
    [getDragId, ordered],
  );
  const hasUnread = ordered.some(
    (row) => row.navigation.unread || row.navigation.badge || row.navigation.mention,
  );

  return (
    <SidebarSection>
      <SidebarSectionHeaderMenu menu="sort">
        <SidebarSectionDisclosure type="button">
          <SidebarSectionTitle>Direct Messages</SidebarSectionTitle>
          <SidebarSectionChevron />
        </SidebarSectionDisclosure>
        <SidebarSectionTrailing>
          {hasUnread ? <SidebarSectionAttention /> : null}
          <SidebarSectionControls>
            <SidebarSectionSortMenu aria-label="Sort direct messages" />
          </SidebarSectionControls>
        </SidebarSectionTrailing>
      </SidebarSectionHeaderMenu>
      <ChatSidebarDropTarget
        id={createChatSidebarDropTargetId("dms")}
        section="dms"
        empty={ordered.length === 0}
      >
        <SortableChatSidebarList items={dragIds}>
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
    </SidebarSection>
  );
}
