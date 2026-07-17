import { useMediaQuery } from "foxact/use-media-query";
import { Activity, Bookmark, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  ChatSidebarBody,
  ChatSidebarContent,
  ChatSidebarControl,
  ChatSidebarHeader,
  ChatSidebarHeaderTitle,
  ChatSidebarItem,
  ChatSidebarItemIcon,
  ChatSidebarItemMeta,
  ChatSidebarItemTitle,
  ChatSidebarLiveActivity,
  ChatSidebarRoot,
} from "raft-ui";

import { SidebarCreateMenu } from "#/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx";
import {
  LiveAgentActivityBarComposition,
  type LiveAgentActivityBarItem,
} from "#/modules/live-agent-activity-bar/live-agent-activity-bar.composition.tsx";
import {
  PLAYGROUND_CHANNELS,
  PLAYGROUND_DIRECT_MESSAGES,
  PLAYGROUND_JOINT_CHANNELS,
  PLAYGROUND_ROOM_CHANNELS,
  type PlaygroundChannelId,
  type PlaygroundDirectMessageRecord,
} from "../mock/index.ts";
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";
import {
  PlaygroundNotificationCenter,
  PlaygroundSidebarServerSwitcher,
} from "../rail/playground-rail.tsx";
import { usePlaygroundShellState } from "../app-shell/use-playground-shell-state.ts";
import { SidebarCollapseIcon } from "../app-shell/sidebar-toggle-icon.tsx";
import { ChatSidebarArchiveDialog } from "./chat-sidebar-archive-dialog.tsx";
import { ChatSidebarChannelsSection } from "./chat-sidebar-channels-section.tsx";
import { ChatSidebarDndProvider } from "./chat-sidebar-dnd.tsx";
import { useChatSidebarDnd } from "./use-chat-sidebar-dnd.ts";
import { ChatSidebarDirectMessagesSection } from "./chat-sidebar-direct-messages-section.tsx";
import { ChatSidebarJointChannelsSection } from "./chat-sidebar-joint-channels-section.tsx";
import { ChatSidebarPinnedSection } from "./chat-sidebar-pinned-section.tsx";

type PlaygroundSidebarProps = {
  activeChannelId: PlaygroundChannelId | null;
  liveAgentActivity: LiveAgentActivityBarItem | null;
  mobileBottomNavigation?: boolean;
  title?: string;
};

export function PlaygroundSidebar(props: PlaygroundSidebarProps) {
  return (
    <ChatSidebarDndProvider>
      <PlaygroundSidebarContent {...props} />
    </ChatSidebarDndProvider>
  );
}

function PlaygroundSidebarContent({
  activeChannelId,
  liveAgentActivity,
  mobileBottomNavigation = false,
  title = "Chat",
}: PlaygroundSidebarProps) {
  const [archiveTarget, setArchiveTarget] = useState<string | null>(null);
  const [closedDmIds, setClosedDmIds] = useState<ReadonlySet<string>>(() => new Set());
  const { isPinned } = useChatSidebarDnd();
  const { railView, selectRailView } = usePlaygroundNavigation();
  const { activeServer, toggleSidebar } = usePlaygroundShellState();
  const isDesktop = useMediaQuery("(min-width: 768px)", false);
  const selectedChannelId = isDesktop ? activeChannelId : null;
  const mobileNavigationContentPad = mobileBottomNavigation
    ? "max-md:pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))]"
    : undefined;
  const visiblePinnedChannels = useMemo(
    () =>
      PLAYGROUND_CHANNELS.filter(
        (conversation) =>
          isPinned(conversation.id) &&
          (conversation.kind !== "dm" || !closedDmIds.has(conversation.id)),
      ),
    [closedDmIds, isPinned],
  );
  const visibleDirectMessages = useMemo(
    () =>
      PLAYGROUND_DIRECT_MESSAGES.filter(
        (conversation) => !isPinned(conversation.id) && !closedDmIds.has(conversation.id),
      ),
    [closedDmIds, isPinned],
  );
  const visibleJointChannels = useMemo(
    () => PLAYGROUND_JOINT_CHANNELS.filter((conversation) => !isPinned(conversation.id)),
    [isPinned],
  );
  const visibleRoomChannels = useMemo(
    () => PLAYGROUND_ROOM_CHANNELS.filter((conversation) => !isPinned(conversation.id)),
    [isPinned],
  );
  const closeDirectMessage = (conversation: PlaygroundDirectMessageRecord) => {
    setClosedDmIds((current) => new Set(current).add(conversation.id));
  };

  return (
    <>
      <ChatSidebarRoot>
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
          <ChatSidebarControl
            className="max-md:hidden"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            onClick={toggleSidebar}
          >
            <SidebarCollapseIcon />
          </ChatSidebarControl>
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
                rows={visibleJointChannels}
              />
              <ChatSidebarChannelsSection
                activeChannelId={selectedChannelId}
                onArchive={(conversation) => setArchiveTarget(conversation.name)}
                rows={visibleRoomChannels}
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
