import { GitBranch, Hash, Lock } from "lucide-react";
import {
  SidebarItemAside,
  SidebarItemChannelIcon,
  SidebarItemContent,
  SidebarItemCount,
  SidebarItemIcon,
  SidebarItemTitle,
} from "raft-ui";

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
      <SidebarItemIcon aria-hidden>
        <SidebarItemChannelIcon>
          <ChannelIcon />
        </SidebarItemChannelIcon>
      </SidebarItemIcon>
      <SidebarItemContent>
        <SidebarItemTitle>{row.name}</SidebarItemTitle>
        {navigation.muted ? <PlaygroundMutedIndicator /> : null}
      </SidebarItemContent>
      {showAside ? (
        <SidebarItemAside>
          {navigation.mention ? <PlaygroundMentionIndicator /> : null}
          {showBadge ? <SidebarItemCount>{navigation.badge}</SidebarItemCount> : null}
          {navigation.draft ? <PlaygroundDraftIndicator /> : null}
        </SidebarItemAside>
      ) : null}
    </>
  );
}
