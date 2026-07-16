import { useMemo, useState } from "react";
import {
  ChatSidebarList,
  ChatSidebarSection,
  ChatSidebarSectionAttention,
  ChatSidebarSectionChevron,
  ChatSidebarSectionControls,
  ChatSidebarSectionDisclosure,
  ChatSidebarSectionEmpty,
  ChatSidebarSectionTitle,
  ChatSidebarSectionTrailing,
  DraggableChatSidebarItem,
  SortableChatSidebarItem,
  SortableChatSidebarList,
} from "raft-ui";

import {
  SidebarSectionAddButton,
  SidebarSectionChannelsMenu,
  SidebarSectionHeaderMenu,
  type SidebarSortValue,
} from "#/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx";
import type { PlaygroundChannelId, PlaygroundRoomChannelRecord } from "../mock/index.ts";
import { ChatSidebarChannelItem } from "./chat-sidebar-channel-item.tsx";
import { useChatSidebarDnd } from "./use-chat-sidebar-dnd.ts";

export function ChatSidebarChannelsSection({
  activeChannelId,
  onArchive,
  rows,
}: {
  activeChannelId: PlaygroundChannelId | null;
  onArchive: (row: PlaygroundRoomChannelRecord) => void;
  rows: readonly PlaygroundRoomChannelRecord[];
}) {
  const [sortMode, setSortMode] = useState<SidebarSortValue>("manual");
  const { getDragId, orderRows } = useChatSidebarDnd();
  const manualOrder = orderRows("channels", rows);
  const ordered = useMemo(() => sortChannels(manualOrder, sortMode), [manualOrder, sortMode]);
  const hasUnread = ordered.some(
    (row) => row.navigation.unread || row.navigation.badge || row.navigation.mention,
  );

  return (
    <ChatSidebarSection>
      <SidebarSectionHeaderMenu
        menu="channels"
        count={ordered.length}
        countLabel="channels"
        createLabel="Create Channel"
        createIcon="channel"
        sortValue={sortMode}
        onSortValueChange={setSortMode}
      >
        <ChatSidebarSectionDisclosure type="button">
          <ChatSidebarSectionTitle>Channels</ChatSidebarSectionTitle>
          <ChatSidebarSectionChevron />
        </ChatSidebarSectionDisclosure>
        <ChatSidebarSectionTrailing>
          {hasUnread ? <ChatSidebarSectionAttention /> : null}
          <ChatSidebarSectionControls>
            <SidebarSectionAddButton aria-label="Create channel" />
            <SidebarSectionChannelsMenu
              aria-label="Channels menu"
              count={ordered.length}
              countLabel="channels"
              createLabel="Create Channel"
              createIcon="channel"
              sortValue={sortMode}
              onSortValueChange={setSortMode}
            />
          </ChatSidebarSectionControls>
        </ChatSidebarSectionTrailing>
      </SidebarSectionHeaderMenu>
      {ordered.length === 0 ? (
        <ChatSidebarSectionEmpty>No channels yet</ChatSidebarSectionEmpty>
      ) : sortMode === "manual" ? (
        <SortableChatSidebarList items={ordered.map((row) => getDragId("channels", row.id))}>
          {ordered.map((row) => (
            <SortableChatSidebarItem key={row.id} id={getDragId("channels", row.id)}>
              <ChatSidebarChannelItem
                activeChannelId={activeChannelId}
                channel={row}
                onArchive={onArchive}
              />
            </SortableChatSidebarItem>
          ))}
        </SortableChatSidebarList>
      ) : (
        <ChatSidebarList>
          {ordered.map((row) => (
            <DraggableChatSidebarItem key={row.id} id={getDragId("channels", row.id)}>
              <ChatSidebarChannelItem
                activeChannelId={activeChannelId}
                channel={row}
                onArchive={onArchive}
              />
            </DraggableChatSidebarItem>
          ))}
        </ChatSidebarList>
      )}
    </ChatSidebarSection>
  );
}

function sortChannels<T extends PlaygroundRoomChannelRecord>(
  rows: readonly T[],
  mode: SidebarSortValue,
) {
  if (mode === "manual") return rows;
  if (mode === "az") return [...rows].sort((left, right) => left.name.localeCompare(right.name));

  return [...rows].sort(
    (left, right) => getChannelActivityRank(right) - getChannelActivityRank(left),
  );
}

function getChannelActivityRank(channel: PlaygroundRoomChannelRecord) {
  if (channel.navigation.mention) return 4;
  if (channel.navigation.draft) return 3;
  if (channel.navigation.badge) return 2;
  if (channel.navigation.unread) return 1;
  return 0;
}
