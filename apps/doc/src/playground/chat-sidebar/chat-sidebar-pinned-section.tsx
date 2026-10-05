import { Fragment, useMemo } from "react";
import {
  SidebarSection,
  SidebarSectionAttention,
  SidebarSectionChevron,
  SidebarSectionControls,
  SidebarSectionDisclosure,
  SidebarSectionEmpty,
  SidebarSectionTitle,
  SidebarSectionTrailing,
} from "raft-ui";

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
import { ChatSidebarPinnedItem } from "./chat-sidebar-pinned-item.tsx";
import { ChatSidebarProjectionPreview } from "./chat-sidebar-dnd.tsx";
import { createChatSidebarDropTargetId } from "./chat-sidebar-dnd-ids.ts";
import {
  ChatSidebarDropTarget,
  SortableChatSidebarItem,
  SortableChatSidebarList,
} from "./chat-sidebar-sortable.tsx";
import { useChatSidebarDnd } from "./use-chat-sidebar-dnd.ts";

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
  const { getDragId, getProjection, orderRows } = useChatSidebarDnd();
  const ordered = orderRows("pinned", rows);
  const projection = getProjection("pinned");
  const dragIds = useMemo(
    () => ordered.map((row) => getDragId("pinned", row.id)),
    [getDragId, ordered],
  );
  const hasUnread = ordered.some(
    (row) => row.navigation.unread || row.navigation.badge || row.navigation.mention,
  );

  return (
    <SidebarSection>
      <SidebarSectionHeaderMenu menu="sort">
        <SidebarSectionDisclosure type="button">
          <SidebarSectionTitle>Pinned</SidebarSectionTitle>
          <SidebarSectionChevron />
        </SidebarSectionDisclosure>
        <SidebarSectionTrailing>
          {hasUnread ? <SidebarSectionAttention /> : null}
          <SidebarSectionControls>
            <SidebarSectionSortMenu aria-label="Sort pinned" />
          </SidebarSectionControls>
        </SidebarSectionTrailing>
      </SidebarSectionHeaderMenu>
      <ChatSidebarDropTarget
        id={createChatSidebarDropTargetId("pinned")}
        section="pinned"
        empty={ordered.length === 0}
      >
        {ordered.length === 0 ? (
          <SidebarSectionEmpty>Drag channels or DMs here to pin</SidebarSectionEmpty>
        ) : (
          <SortableChatSidebarList items={dragIds}>
            {ordered.map((row) => (
              <Fragment key={row.id}>
                <ChatSidebarProjectionPreview anchorChannelId={row.id} projection={projection} />
                <SortableChatSidebarItem
                  id={getDragId("pinned", row.id)}
                  section="pinned"
                  channelId={row.id}
                  active={activeChannelId === row.id}
                >
                  <ChatSidebarPinnedItem
                    activeChannelId={activeChannelId}
                    conversation={row}
                    onArchive={onArchive}
                    onCloseDm={onCloseDm}
                  />
                </SortableChatSidebarItem>
              </Fragment>
            ))}
            <ChatSidebarProjectionPreview projection={projection} />
          </SortableChatSidebarList>
        )}
      </ChatSidebarDropTarget>
    </SidebarSection>
  );
}
