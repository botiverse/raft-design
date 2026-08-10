import { Link, useMatch } from "@tanstack/react-router";
import { useMediaQuery } from "foxact/use-media-query";
import { Activity, Bookmark, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  SidebarBody,
  SidebarContent,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarItem,
  SidebarItemIcon,
  SidebarItemMeta,
  SidebarItemTitle,
  SidebarLiveActivity,
  SidebarRoot,
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
  PLAYGROUND_SERVER_SLUG,
  type PlaygroundChannelId,
  type PlaygroundDirectMessageRecord,
} from "../mock/index.ts";
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";
import { usePlaygroundSavedMessages } from "../message/use-playground-message-workflow.ts";
import {
  PlaygroundNotificationCenter,
  PlaygroundSidebarServerSwitcher,
} from "../rail/playground-rail.tsx";
import { usePlaygroundShellState } from "../app-shell/use-playground-shell-state.ts";
import { ChatSidebarArchiveDialog } from "./chat-sidebar-archive-dialog.tsx";
import { ChatSidebarChannelsSection } from "./chat-sidebar-channels-section.tsx";
import { ChatSidebarDndProvider } from "./chat-sidebar-dnd.tsx";
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
  const { railView, selectRailView } = usePlaygroundNavigation();
  const { savedMessagesById } = usePlaygroundSavedMessages();
  const savedMatch = useMatch({
    from: "/playground/s/$serverSlug/saved",
    shouldThrow: false,
  });
  const { activeServer } = usePlaygroundShellState();
  const isDesktop = useMediaQuery("(min-width: 768px)", false);
  const selectedChannelId = isDesktop ? activeChannelId : null;
  const savedActive = Boolean(savedMatch);
  const mobileNavigationContentPad = mobileBottomNavigation
    ? "max-md:pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))]"
    : undefined;
  const visibleDirectMessages = useMemo(
    () => PLAYGROUND_DIRECT_MESSAGES.filter((conversation) => !closedDmIds.has(conversation.id)),
    [closedDmIds],
  );
  const visiblePinnedChannels = useMemo(
    () =>
      PLAYGROUND_CHANNELS.filter(
        (conversation) => conversation.kind !== "dm" || !closedDmIds.has(conversation.id),
      ),
    [closedDmIds],
  );
  const closeDirectMessage = (conversation: PlaygroundDirectMessageRecord) => {
    setClosedDmIds((current) => new Set(current).add(conversation.id));
  };

  return (
    <>
      <SidebarRoot>
        <SidebarHeader className="md:hidden">
          <PlaygroundSidebarServerSwitcher name={activeServer.name} />
          <div className="min-w-0 flex-1" />
          <PlaygroundNotificationCenter mobile />
        </SidebarHeader>
        <SidebarHeader className="max-md:hidden">
          <div className="min-w-0 flex-1">
            <SidebarHeaderTitle className="leading-tight tabular-nums">{title}</SidebarHeaderTitle>
          </div>
          <SidebarCreateMenu />
        </SidebarHeader>
        <SidebarBody>
          <SidebarContent className={mobileNavigationContentPad}>
            <div className="min-h-full">
              <SidebarItem
                className="md:hidden"
                active={railView === "search"}
                variant="accent"
                onClick={() => selectRailView("search")}
              >
                <SidebarItemIcon aria-hidden>
                  <Search />
                </SidebarItemIcon>
                <SidebarItemTitle>Search</SidebarItemTitle>
              </SidebarItem>

              <SidebarItem
                className="md:hidden"
                active={railView === "activity"}
                variant="accent"
                onClick={() => selectRailView("activity")}
              >
                <SidebarItemIcon aria-hidden>
                  <Activity />
                </SidebarItemIcon>
                <SidebarItemTitle>Activity</SidebarItemTitle>
              </SidebarItem>

              <SidebarItem
                active={savedActive}
                variant="accent"
                aria-current={savedActive ? "page" : undefined}
                render={
                  <Link
                    to="/playground/s/$serverSlug/saved"
                    params={{ serverSlug: PLAYGROUND_SERVER_SLUG }}
                  />
                }
              >
                <SidebarItemIcon aria-hidden>
                  <Bookmark />
                </SidebarItemIcon>
                <SidebarItemTitle>Saved</SidebarItemTitle>
                {savedMessagesById.size ? (
                  <SidebarItemMeta>{savedMessagesById.size}</SidebarItemMeta>
                ) : null}
              </SidebarItem>

              <ChatSidebarPinnedSection
                activeChannelId={selectedChannelId}
                onArchive={(conversation) => setArchiveTarget(conversation.name)}
                onCloseDm={closeDirectMessage}
                rows={visiblePinnedChannels}
              />
              <ChatSidebarJointChannelsSection
                activeChannelId={selectedChannelId}
                rows={PLAYGROUND_JOINT_CHANNELS}
              />
              <ChatSidebarChannelsSection
                activeChannelId={selectedChannelId}
                onArchive={(conversation) => setArchiveTarget(conversation.name)}
                rows={PLAYGROUND_ROOM_CHANNELS}
              />
              <ChatSidebarDirectMessagesSection
                activeChannelId={selectedChannelId}
                onCloseDm={closeDirectMessage}
                rows={visibleDirectMessages}
              />
            </div>
          </SidebarContent>
        </SidebarBody>
        <SidebarLiveActivity>
          <LiveAgentActivityBarComposition latest={liveAgentActivity} />
        </SidebarLiveActivity>
      </SidebarRoot>

      <ChatSidebarArchiveDialog
        channelName={archiveTarget}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
      />
    </>
  );
}
