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
import { useDroppable } from "@dnd-kit/core";
import { cn } from "raft-ui/cn";

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
import { PLAYGROUND_PINNED_DROP_TARGET_ID } from "./chat-sidebar-dnd-ids.ts";
import { SortableChatSidebarItem, SortableChatSidebarList } from "./chat-sidebar-sortable.tsx";
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
  const { getDragId, orderRows } = useChatSidebarDnd();
  const { isOver, setNodeRef } = useDroppable({ id: PLAYGROUND_PINNED_DROP_TARGET_ID });
  const ordered = orderRows("pinned", rows);
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
      <div ref={setNodeRef} className={cn(isOver && "bg-ink-5")}>
        {ordered.length === 0 ? (
          <ChatSidebarSectionEmpty>Drag channels or DMs here to pin</ChatSidebarSectionEmpty>
        ) : (
          <SortableChatSidebarList items={ordered.map((row) => getDragId("pinned", row.id))}>
            {ordered.map((row) => (
              <SortableChatSidebarItem key={row.id} id={getDragId("pinned", row.id)}>
                <ChatSidebarPinnedItem
                  activeChannelId={activeChannelId}
                  conversation={row}
                  onArchive={onArchive}
                  onCloseDm={onCloseDm}
                />
              </SortableChatSidebarItem>
            ))}
          </SortableChatSidebarList>
        )}
      </div>
    </ChatSidebarSection>
  );
}
