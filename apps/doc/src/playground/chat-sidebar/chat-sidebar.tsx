import { useMediaQuery } from "foxact/use-media-query";
import { Activity, Bookmark, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  ChatSidebarBody,
  ChatSidebarContent,
  ChatSidebarHeader,
  ChatSidebarHeaderTitle,
  ChatSidebarItem,
  ChatSidebarItemIcon,
  ChatSidebarItemMeta,
  ChatSidebarItemTitle,
  ChatSidebarLiveActivity,
  ChatSidebarRoot,
} from "raft-ui/wip";

import { SidebarCreateMenu } from "#/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx";
import {
  LiveAgentActivityBarComposition,
  type LiveAgentActivityBarItem,
} from "#/modules/live-agent-activity-bar/live-agent-activity-bar.composition.tsx";
import type { PlaygroundChannelId, PlaygroundDirectMessageRecord } from "../mock/index.ts";
import { usePlaygroundNavigation } from "../navigation/playground-navigation-state.tsx";
import {
  PlaygroundNotificationCenter,
  PlaygroundSidebarServerSwitcher,
} from "../rail/playground-rail.tsx";
import { usePlaygroundShellState } from "../app-shell/playground-shell-state.tsx";
import { ChatSidebarArchiveDialog } from "./chat-sidebar-archive-dialog.tsx";
import { ChatSidebarChannelsSection } from "./chat-sidebar-channels-section.tsx";
import {
  CHAT_SIDEBAR_DIRECT_MESSAGES,
  CHAT_SIDEBAR_JOINT_CONVERSATIONS,
  CHAT_SIDEBAR_PINNED_CONVERSATIONS,
  CHAT_SIDEBAR_ROOM_CONVERSATIONS,
} from "./chat-sidebar-data.ts";
import { ChatSidebarDirectMessagesSection } from "./chat-sidebar-direct-messages-section.tsx";
import { ChatSidebarJointChannelsSection } from "./chat-sidebar-joint-channels-section.tsx";
import { ChatSidebarPinnedSection } from "./chat-sidebar-pinned-section.tsx";

export function PlaygroundSidebar({
  activeChannelId,
  liveAgentActivity,
  mobileBottomNavigation = false,
  title = "Chat",
}: {
  activeChannelId: PlaygroundChannelId | null;
  liveAgentActivity: LiveAgentActivityBarItem | null;
  mobileBottomNavigation?: boolean;
  title?: string;
}) {
  const [archiveTarget, setArchiveTarget] = useState<string | null>(null);
  const [closedDmIds, setClosedDmIds] = useState<ReadonlySet<string>>(() => new Set());
  const { railView, selectRailView } = usePlaygroundNavigation();
  const { activeServer } = usePlaygroundShellState();
  const isDesktop = useMediaQuery("(min-width: 768px)", false);
  const selectedChannelId = isDesktop ? activeChannelId : null;
  const mobileNavigationContentPad = mobileBottomNavigation
    ? "max-md:pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))]"
    : undefined;
  const visiblePinnedChannels = useMemo(
    () =>
      CHAT_SIDEBAR_PINNED_CONVERSATIONS.filter(
        (conversation) => conversation.kind !== "dm" || !closedDmIds.has(conversation.id),
      ),
    [closedDmIds],
  );
  const visibleDirectMessages = useMemo(
    () => CHAT_SIDEBAR_DIRECT_MESSAGES.filter((conversation) => !closedDmIds.has(conversation.id)),
    [closedDmIds],
  );
  const closeDirectMessage = (conversation: PlaygroundDirectMessageRecord) => {
    setClosedDmIds((current) => new Set(current).add(conversation.id));
  };

  return (
    <>
      <ChatSidebarRoot className="relative overflow-clip">
        <ChatSidebarHeader className="md:hidden">
          <PlaygroundSidebarServerSwitcher name={activeServer.name} />
          <div className="min-w-0 flex-1" />
          <PlaygroundNotificationCenter mobile />
        </ChatSidebarHeader>
        <ChatSidebarHeader className="max-md:hidden">
          <div className="min-w-0 flex-1">
            <ChatSidebarHeaderTitle className="leading-tight tabular-nums">
              {title}
            </ChatSidebarHeaderTitle>
          </div>
          <SidebarCreateMenu />
        </ChatSidebarHeader>
        <ChatSidebarBody>
          <ChatSidebarContent className={mobileNavigationContentPad}>
            <div className="min-h-full">
              <ChatSidebarItem className="md:hidden">
                <ChatSidebarItemIcon aria-hidden>
                  <Search />
                </ChatSidebarItemIcon>
                <ChatSidebarItemTitle>Search</ChatSidebarItemTitle>
              </ChatSidebarItem>

              <ChatSidebarItem className="md:hidden">
                <ChatSidebarItemIcon aria-hidden>
                  <Activity />
                </ChatSidebarItemIcon>
                <ChatSidebarItemTitle>Activity</ChatSidebarItemTitle>
              </ChatSidebarItem>

              <ChatSidebarItem
                active={railView === "saved"}
                onClick={() => selectRailView("saved")}
              >
                <ChatSidebarItemIcon aria-hidden>
                  <Bookmark />
                </ChatSidebarItemIcon>
                <ChatSidebarItemTitle>Saved</ChatSidebarItemTitle>
                <ChatSidebarItemMeta>33</ChatSidebarItemMeta>
              </ChatSidebarItem>

              <ChatSidebarPinnedSection
                activeChannelId={selectedChannelId}
                onArchive={(conversation) => setArchiveTarget(conversation.name)}
                onCloseDm={closeDirectMessage}
                rows={visiblePinnedChannels}
              />
              <ChatSidebarJointChannelsSection
                activeChannelId={selectedChannelId}
                rows={CHAT_SIDEBAR_JOINT_CONVERSATIONS}
              />
              <ChatSidebarChannelsSection
                activeChannelId={selectedChannelId}
                onArchive={(conversation) => setArchiveTarget(conversation.name)}
                rows={CHAT_SIDEBAR_ROOM_CONVERSATIONS}
              />
              <ChatSidebarDirectMessagesSection
                activeChannelId={selectedChannelId}
                onCloseDm={closeDirectMessage}
                rows={visibleDirectMessages}
              />
            </div>
          </ChatSidebarContent>
        </ChatSidebarBody>
        <ChatSidebarLiveActivity>
          <LiveAgentActivityBarComposition latest={liveAgentActivity} />
        </ChatSidebarLiveActivity>
      </ChatSidebarRoot>

      <ChatSidebarArchiveDialog
        channelName={archiveTarget}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
      />
    </>
  );
}
