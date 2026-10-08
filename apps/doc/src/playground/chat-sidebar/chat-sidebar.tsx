import { Link, useMatch } from "@tanstack/react-router";
import { useMediaQuery } from "foxact/use-media-query";
import { Activity, Bookmark, Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
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
import { LiveAgentActivityBarComposition } from "#/modules/live-agent-activity-bar/live-agent-activity-bar.composition.tsx";
import type { LiveAgentActivityBarItem } from "#/modules/live-agent-activity-bar/live-agent-activity-bar.composition.tsx";
import {
  PLAYGROUND_CHANNELS,
  PLAYGROUND_DIRECT_MESSAGES,
  PLAYGROUND_JOINT_CHANNELS,
  PLAYGROUND_ROOM_CHANNELS,
  PLAYGROUND_SERVER_SLUG,
} from "../mock/index.ts";
import type {
  PlaygroundChannelId,
  PlaygroundDirectMessageRecord,
  PlaygroundRoomChannelRecord,
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
import {
  matchesSidebarQuery,
  SidebarCreateFromQuery,
  SidebarHintStrip,
  SidebarNewMenu,
  SidebarQuickFind,
  SidebarTasksRow,
  SidebarUnreadToggle,
  useSidebarDirection,
} from "./chat-sidebar-directions.tsx";
import { ChatSidebarJointChannelsSection } from "./chat-sidebar-joint-channels-section.tsx";
import { ChatSidebarPinnedSection } from "./chat-sidebar-pinned-section.tsx";

const SERVER_PARAMS = { serverSlug: PLAYGROUND_SERVER_SLUG };

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
  // Design exploration, opt-in through `?sidebar=a|b|c`; see chat-sidebar-directions.tsx.
  const direction = useSidebarDirection();
  const [query, setQuery] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const dismissHint = useCallback(() => setHintDismissed(true), []);
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
  const keepRow = useCallback(
    (conversation: { name: string; navigation: { unread?: unknown } }) =>
      matchesSidebarQuery(conversation.name, direction ? query : "") &&
      (!(direction === "c" && unreadOnly) || Boolean(conversation.navigation.unread)),
    [direction, query, unreadOnly],
  );
  const visibleDirectMessages = useMemo(
    () =>
      PLAYGROUND_DIRECT_MESSAGES.filter(
        (conversation) => !closedDmIds.has(conversation.id) && keepRow(conversation),
      ),
    [closedDmIds, keepRow],
  );
  const visiblePinnedChannels = useMemo(
    () =>
      PLAYGROUND_CHANNELS.filter(
        (conversation) =>
          (conversation.kind !== "dm" || !closedDmIds.has(conversation.id)) &&
          keepRow(conversation),
      ),
    [closedDmIds, keepRow],
  );
  const visibleJointChannels = useMemo(() => PLAYGROUND_JOINT_CHANNELS.filter(keepRow), [keepRow]);
  const visibleRoomChannels = useMemo(() => PLAYGROUND_ROOM_CHANNELS.filter(keepRow), [keepRow]);
  const narrowing =
    Boolean(direction) && (query.trim() !== "" || (direction === "c" && unreadOnly));
  const nothingMatches =
    narrowing &&
    visiblePinnedChannels.length +
      visibleJointChannels.length +
      visibleRoomChannels.length +
      visibleDirectMessages.length ===
      0;
  const closeDirectMessage = useCallback((conversation: PlaygroundDirectMessageRecord) => {
    setClosedDmIds((current) => new Set(current).add(conversation.id));
  }, []);
  const handleArchive = useCallback((conversation: PlaygroundRoomChannelRecord) => {
    setArchiveTarget(conversation.name);
  }, []);
  const handleArchiveOpenChange = useCallback((open: boolean) => {
    if (!open) setArchiveTarget(null);
  }, []);
  const handleSelectSearch = useCallback(() => selectRailView("search"), [selectRailView]);
  const handleSelectActivity = useCallback(() => selectRailView("activity"), [selectRailView]);

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
          {direction ? <SidebarNewMenu /> : <SidebarCreateMenu />}
        </SidebarHeader>
        <SidebarBody>
          <SidebarContent className={mobileNavigationContentPad}>
            <div className="min-h-full">
              {direction ? (
                <div className="max-md:hidden">
                  <SidebarQuickFind
                    value={query}
                    onValueChange={setQuery}
                    placeholder={direction === "a" ? "Filter conversations" : "Find or create…"}
                  />
                  {direction === "c" ? (
                    <SidebarUnreadToggle pressed={unreadOnly} onPressedChange={setUnreadOnly} />
                  ) : null}
                </div>
              ) : null}
              <SidebarItem
                className="md:hidden"
                active={railView === "search"}
                variant="accent"
                onClick={handleSelectSearch}
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
                onClick={handleSelectActivity}
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
                render={<Link to="/playground/s/$serverSlug/saved" params={SERVER_PARAMS} />}
              >
                <SidebarItemIcon aria-hidden>
                  <Bookmark />
                </SidebarItemIcon>
                <SidebarItemTitle>Saved</SidebarItemTitle>
                {savedMessagesById.size ? (
                  <SidebarItemMeta>{savedMessagesById.size}</SidebarItemMeta>
                ) : null}
              </SidebarItem>

              {direction === "c" && !narrowing ? <SidebarTasksRow remaining={3} /> : null}
              {direction === "c" && !narrowing && !hintDismissed ? (
                <SidebarHintStrip onDismiss={dismissHint} />
              ) : null}

              {nothingMatches && direction !== "a" && query.trim() !== "" ? (
                <SidebarCreateFromQuery query={query} />
              ) : null}
              {nothingMatches && (direction === "a" || query.trim() === "") ? (
                <p className="px-3 py-2 text-sm text-foreground-muted">No conversations match.</p>
              ) : null}

              {!narrowing || visiblePinnedChannels.length > 0 ? (
                <ChatSidebarPinnedSection
                  activeChannelId={selectedChannelId}
                  onArchive={handleArchive}
                  onCloseDm={closeDirectMessage}
                  rows={visiblePinnedChannels}
                />
              ) : null}
              {!narrowing || visibleJointChannels.length > 0 ? (
                <ChatSidebarJointChannelsSection
                  activeChannelId={selectedChannelId}
                  rows={visibleJointChannels}
                />
              ) : null}
              {!narrowing || visibleRoomChannels.length > 0 ? (
                <ChatSidebarChannelsSection
                  activeChannelId={selectedChannelId}
                  onArchive={handleArchive}
                  rows={visibleRoomChannels}
                />
              ) : null}
              {!narrowing || visibleDirectMessages.length > 0 ? (
                <ChatSidebarDirectMessagesSection
                  activeChannelId={selectedChannelId}
                  onCloseDm={closeDirectMessage}
                  rows={visibleDirectMessages}
                />
              ) : null}
            </div>
          </SidebarContent>
        </SidebarBody>
        <SidebarLiveActivity>
          <LiveAgentActivityBarComposition latest={liveAgentActivity} />
        </SidebarLiveActivity>
      </SidebarRoot>

      <ChatSidebarArchiveDialog
        channelName={archiveTarget}
        onOpenChange={handleArchiveOpenChange}
      />
    </>
  );
}
