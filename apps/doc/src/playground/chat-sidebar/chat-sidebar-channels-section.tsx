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
  SortableChatSidebarItem,
  SortableChatSidebarList,
} from "raft-ui/wip";

import {
  SidebarSectionAddButton,
  SidebarSectionChannelsMenu,
  SidebarSectionHeaderMenu,
  type SidebarSortValue,
} from "#/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx";
import type { PlaygroundChannelId, PlaygroundRoomChannelRecord } from "../mock/index.ts";
import { PlaygroundConversationLink } from "../navigation/conversation-link.tsx";
import { ChatSidebarChannelRowContent } from "./chat-sidebar-channel-row-content.tsx";
import { PlaygroundChatSidebarItem } from "./chat-sidebar-item.tsx";
import { getChatSidebarRowMenu } from "./chat-sidebar-row-menu.ts";
import { useChatSidebarSectionOrder } from "./use-chat-sidebar-section-order.ts";

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
  const { ordered: manualOrder, visibleOrder, onReorder } = useChatSidebarSectionOrder(rows);
  const ordered = useMemo(() => sortChannels(manualOrder, sortMode), [manualOrder, sortMode]);
  const hasUnread = ordered.some(
    (row) => row.navigation.unread || row.navigation.badge || row.navigation.mention,
  );

  const renderChannel = (row: PlaygroundRoomChannelRecord) => (
    <PlaygroundChatSidebarItem
      key={row.id}
      active={activeChannelId === row.id}
      menu={getChatSidebarRowMenu(row)}
      onArchive={() => onArchive(row)}
      render={<PlaygroundConversationLink conversation={row} />}
    >
      <ChatSidebarChannelRowContent row={row} hideBadge={activeChannelId === row.id} />
    </PlaygroundChatSidebarItem>
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
        <SortableChatSidebarList items={visibleOrder} onReorder={onReorder}>
          {ordered.map((row) => (
            <SortableChatSidebarItem key={row.id} id={row.id}>
              {renderChannel(row)}
            </SortableChatSidebarItem>
          ))}
        </SortableChatSidebarList>
      ) : (
        <ChatSidebarList>{ordered.map(renderChannel)}</ChatSidebarList>
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
