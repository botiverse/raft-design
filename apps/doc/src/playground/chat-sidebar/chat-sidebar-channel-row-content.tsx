import { GitBranch, Hash, Lock } from "lucide-react";
import {
  ChatSidebarItemAside,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemContent,
  ChatSidebarItemCount,
  ChatSidebarItemIcon,
  ChatSidebarItemTitle,
} from "raft-ui/wip";

import type { PlaygroundRoomChannel } from "../mock/index.ts";
import {
  PlaygroundDraftIndicator,
  PlaygroundMentionIndicator,
  PlaygroundMutedIndicator,
} from "./chat-sidebar-indicators.tsx";

function getPlaygroundChannelIcon(channel: PlaygroundRoomChannel) {
  return channel.kind === "joint" ? GitBranch : channel.kind === "private" ? Lock : Hash;
}

export function ChatSidebarChannelRowContent({
  row,
  hideBadge,
}: {
  row: PlaygroundRoomChannel;
  hideBadge?: boolean;
}) {
  const navigation = row.navigation;
  const showBadge = navigation.badge && !hideBadge;
  const showAside = showBadge || navigation.draft || navigation.mention;
  const ChannelIcon = getPlaygroundChannelIcon(row);
  return (
    <>
      <ChatSidebarItemIcon aria-hidden>
        <ChatSidebarItemChannelIcon>
          <ChannelIcon />
        </ChatSidebarItemChannelIcon>
      </ChatSidebarItemIcon>
      <ChatSidebarItemContent>
        <ChatSidebarItemTitle>{row.name}</ChatSidebarItemTitle>
        {navigation.muted ? <PlaygroundMutedIndicator /> : null}
      </ChatSidebarItemContent>
      {showAside ? (
        <ChatSidebarItemAside>
          {navigation.mention ? <PlaygroundMentionIndicator /> : null}
          {showBadge ? <ChatSidebarItemCount>{navigation.badge}</ChatSidebarItemCount> : null}
          {navigation.draft ? <PlaygroundDraftIndicator /> : null}
        </ChatSidebarItemAside>
      ) : null}
    </>
  );
}
