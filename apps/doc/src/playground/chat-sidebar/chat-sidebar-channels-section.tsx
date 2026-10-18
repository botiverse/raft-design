import { Fragment, useMemo, useState } from "react";
import {
  SidebarList,
  SidebarSection,
  SidebarSectionAttention,
  SidebarSectionChevron,
  SidebarSectionControls,
  SidebarSectionDisclosure,
  SidebarSectionEmpty,
  SidebarSectionTitle,
  SidebarSectionTrailing,
} from "@botiverse/raft-ui";

import {
  SidebarSectionAddButton,
  SidebarSectionChannelsMenu,
  SidebarSectionHeaderMenu,
} from "#/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx";
import type { SidebarSortValue } from "#/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx";
import type { PlaygroundChannelId, PlaygroundRoomChannelRecord } from "../mock/index.ts";
import { ChatSidebarChannelItem } from "./chat-sidebar-channel-item.tsx";
import { ChatSidebarProjectionPreview } from "./chat-sidebar-dnd.tsx";
import { createChatSidebarDropTargetId } from "./chat-sidebar-dnd-ids.ts";
import {
  ChatSidebarDropTarget,
  DraggableChatSidebarItem,
  SortableChatSidebarItem,
  SortableChatSidebarList,
} from "./chat-sidebar-sortable.tsx";
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
  const { getDragId, getProjection, orderRows } = useChatSidebarDnd();
  const manualOrder = orderRows("channels", rows);
  const ordered = useMemo(() => sortChannels(manualOrder, sortMode), [manualOrder, sortMode]);
  const projection = getProjection("channels");
  const dragIds = useMemo(
    () => ordered.map((row) => getDragId("channels", row.id)),
    [getDragId, ordered],
  );
  const hasUnread = ordered.some(
    (row) => row.navigation.unread || row.navigation.badge || row.navigation.mention,
  );

  return (
    <SidebarSection>
      <SidebarSectionHeaderMenu
        menu="channels"
        count={ordered.length}
        countLabel="channels"
        createLabel="Create Channel"
        createIcon="channel"
        sortValue={sortMode}
        onSortValueChange={setSortMode}
      >
        <SidebarSectionDisclosure type="button">
          <SidebarSectionTitle>Channels</SidebarSectionTitle>
          <SidebarSectionChevron />
        </SidebarSectionDisclosure>
        <SidebarSectionTrailing>
          {hasUnread ? <SidebarSectionAttention /> : null}
          <SidebarSectionControls>
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
          </SidebarSectionControls>
        </SidebarSectionTrailing>
      </SidebarSectionHeaderMenu>
      <ChatSidebarDropTarget
        id={createChatSidebarDropTargetId("channels")}
        section="channels"
        empty={ordered.length === 0}
        disabled={sortMode !== "manual"}
      >
        {ordered.length === 0 ? (
          <SidebarSectionEmpty>No channels yet</SidebarSectionEmpty>
        ) : sortMode === "manual" ? (
          <SortableChatSidebarList items={dragIds}>
            {ordered.map((row) => (
              <Fragment key={row.id}>
                <ChatSidebarProjectionPreview anchorChannelId={row.id} projection={projection} />
                <SortableChatSidebarItem
                  id={getDragId("channels", row.id)}
                  section="channels"
                  channelId={row.id}
                  active={activeChannelId === row.id}
                >
                  <ChatSidebarChannelItem
                    activeChannelId={activeChannelId}
                    channel={row}
                    onArchive={onArchive}
                  />
                </SortableChatSidebarItem>
              </Fragment>
            ))}
            <ChatSidebarProjectionPreview projection={projection} />
          </SortableChatSidebarList>
        ) : (
          <SidebarList>
            {ordered.map((row) => (
              <DraggableChatSidebarItem
                key={row.id}
                id={getDragId("channels", row.id)}
                section="channels"
                channelId={row.id}
                active={activeChannelId === row.id}
              >
                <ChatSidebarChannelItem
                  activeChannelId={activeChannelId}
                  channel={row}
                  onArchive={onArchive}
                />
              </DraggableChatSidebarItem>
            ))}
          </SidebarList>
        )}
      </ChatSidebarDropTarget>
    </SidebarSection>
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
