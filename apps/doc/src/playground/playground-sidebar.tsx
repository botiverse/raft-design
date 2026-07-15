import { Link } from "@tanstack/react-router";
import { useMediaQuery } from "foxact/use-media-query";
import {
  Activity,
  Archive,
  AtSign,
  Bell,
  BellOff,
  Bookmark,
  CircleAlert,
  GitBranch,
  Hash,
  Lock,
  Mail,
  MailOpen,
  Pencil,
  Pin,
  PinOff,
  Search,
  X,
} from "lucide-react";
import { useCallback, useMemo, useState, type ReactElement, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Banner,
  BannerDescription,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  Status,
  useThemeFamily,
} from "raft-ui";
import { cn } from "raft-ui/cn";
import {
  ChatSidebarBody,
  ChatSidebarContent,
  ChatSidebarHeader,
  ChatSidebarHeaderTitle,
  ChatSidebarItem,
  ChatSidebarItemUnread,
  ChatSidebarItemAside,
  ChatSidebarItemBadge,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemDraft,
  ChatSidebarItemIcon,
  ChatSidebarItemInlineText,
  ChatSidebarItemMention,
  ChatSidebarItemMeta,
  ChatSidebarItemMuted,
  ChatSidebarItemPresence,
  ChatSidebarItemSubtitle,
  ChatSidebarItemTitle,
  ChatSidebarList,
  ChatSidebarRoot,
  ChatSidebarSection,
  ChatSidebarSectionActions,
  ChatSidebarSectionButton,
  ChatSidebarSectionChevron,
  ChatSidebarSectionAttention,
  ChatSidebarSectionTitle,
  ChatSidebarSectionTrailing,
  SortableChatSidebarItem,
  SortableChatSidebarList,
} from "raft-ui/wip";

import {
  SidebarCreateMenu,
  SidebarSectionAddButton,
  SidebarSectionChannelsMenu,
  SidebarSectionHeaderMenu,
  SidebarSectionSortMenu,
  type SidebarSortValue,
} from "#/modules/dropdown-menu/compositions/sidebar-section-header-menu.composition.tsx";
import {
  LiveAgentActivityBarComposition,
  type LiveAgentActivityBarItem,
} from "#/modules/live-agent-activity-bar/live-agent-activity-bar.composition.tsx";
import {
  DEFAULT_CHANNEL_ID,
  PLAYGROUND_DIRECT_MESSAGES,
  PLAYGROUND_JOINT_CHANNELS,
  PLAYGROUND_ROOM_CHANNELS,
  PLAYGROUND_SERVER_SLUG,
  getPlaygroundDmActor,
  type PlaygroundChannelId,
  type PlaygroundChannelRecord,
  type PlaygroundDirectMessage,
  type PlaygroundPresence,
  type PlaygroundRoomChannel,
} from "./mock/index.ts";
import { PLAYGROUND_PRESENCE_STATUS } from "./playground-presence.ts";
import { usePlaygroundNavigation } from "./playground-navigation-state.tsx";
import {
  PlaygroundNotificationCenter,
  PlaygroundSidebarServerSwitcher,
} from "./playground-rail.tsx";
import { usePlaygroundShellState } from "./playground-shell-state.tsx";

type SidebarRowMenu = {
  type: "channel" | "dm";
  name: string;
  unread: boolean;
  pinned: boolean;
  muted?: boolean;
  canMute?: boolean;
  canArchive?: boolean;
};
type PlaygroundDmRecord = Extract<PlaygroundChannelRecord, { kind: "dm" }>;
type PlaygroundRoomRecord = (typeof PLAYGROUND_ROOM_CHANNELS)[number];

function getPlaygroundChannelIcon(channel: PlaygroundRoomChannel) {
  return channel.kind === "joint" ? GitBranch : channel.kind === "private" ? Lock : Hash;
}

function PlaygroundMutedIndicator() {
  return (
    <ChatSidebarItemMuted
      aria-label="Activity muted"
      title="Activity muted. Direct mentions can still notify you."
    >
      <BellOff aria-hidden />
    </ChatSidebarItemMuted>
  );
}

function PlaygroundMentionIndicator() {
  return (
    <ChatSidebarItemMention aria-label="Mentioned you">
      <AtSign aria-hidden />
    </ChatSidebarItemMention>
  );
}

function PlaygroundDraftIndicator() {
  return (
    <ChatSidebarItemDraft aria-label="Draft">
      <Pencil aria-hidden />
    </ChatSidebarItemDraft>
  );
}

function ChannelRowContent({
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
      <ChatSidebarItemInlineText align={navigation.muted ? "center" : undefined}>
        <ChatSidebarItemTitle>{row.name}</ChatSidebarItemTitle>
        {navigation.muted ? <PlaygroundMutedIndicator /> : null}
      </ChatSidebarItemInlineText>
      {showAside ? (
        <ChatSidebarItemAside>
          {navigation.mention ? <PlaygroundMentionIndicator /> : null}
          {showBadge ? <ChatSidebarItemBadge>{navigation.badge}</ChatSidebarItemBadge> : null}
          {navigation.draft ? <PlaygroundDraftIndicator /> : null}
        </ChatSidebarItemAside>
      ) : null}
    </>
  );
}

function DirectMessageStatus({
  status,
  size = "md",
}: {
  status: PlaygroundPresence;
  size?: "sm" | "md";
}) {
  const config = PLAYGROUND_PRESENCE_STATUS[status];
  return <Status aria-hidden variant={config.variant} size={size} pulse={config.pulse} />;
}

function DirectMessageRowContent({
  row,
  hideBadge,
}: {
  row: PlaygroundDirectMessage;
  hideBadge?: boolean;
}) {
  const actor = getPlaygroundDmActor(row);
  const navigation = row.navigation;
  const showBadge = Boolean(navigation.badge && !hideBadge);
  const showAside =
    showBadge ||
    Boolean(navigation.draft) ||
    Boolean(navigation.mention) ||
    Boolean(actor.presence);

  return (
    <>
      <ChatSidebarItemIcon>
        <Avatar size="2xs" type={actor.type}>
          {actor.avatarSrc ? <AvatarImage src={actor.avatarSrc} alt="" /> : null}
          {actor.fallback ? (
            <AvatarFallback>{actor.fallback}</AvatarFallback>
          ) : actor.avatarSrc ? (
            <AvatarFallback />
          ) : null}
        </Avatar>
      </ChatSidebarItemIcon>
      <ChatSidebarItemInlineText
        align={navigation.muted ? "center" : undefined}
        titleWidth="constrained"
      >
        <ChatSidebarItemTitle>{row.name}</ChatSidebarItemTitle>
        {navigation.muted ? <PlaygroundMutedIndicator /> : null}
        <ChatSidebarItemSubtitle>{row.subtitle}</ChatSidebarItemSubtitle>
      </ChatSidebarItemInlineText>
      {showAside ? (
        <ChatSidebarItemAside>
          {navigation.mention ? <PlaygroundMentionIndicator /> : null}
          {actor.presence ? (
            <ChatSidebarItemPresence>
              <DirectMessageStatus status={actor.presence} size="md" />
            </ChatSidebarItemPresence>
          ) : null}
          {showBadge ? <ChatSidebarItemBadge>{navigation.badge}</ChatSidebarItemBadge> : null}
          {navigation.draft ? <PlaygroundDraftIndicator /> : null}
        </ChatSidebarItemAside>
      ) : null}
    </>
  );
}

function PinnedRowContent({
  row,
  hideBadge,
}: {
  row: PlaygroundRoomChannel | PlaygroundDirectMessage;
  hideBadge?: boolean;
}) {
  return row.kind === "dm" ? (
    <DirectMessageRowContent row={row} hideBadge={hideBadge} />
  ) : (
    <ChannelRowContent row={row} hideBadge={hideBadge} />
  );
}

function getSidebarRowMenu(row: PlaygroundRoomChannel | PlaygroundDirectMessage): SidebarRowMenu {
  const unread = Boolean(row.navigation.unread || row.navigation.badge);
  if (row.kind === "dm") {
    return {
      type: "dm",
      name: row.name,
      unread,
      pinned: row.navigation.pinned === true,
    };
  }
  return {
    type: "channel",
    name: row.name,
    unread,
    pinned: row.navigation.pinned === true,
    muted: row.navigation.muted === true,
    canMute: !row.archived,
    canArchive: row.id !== DEFAULT_CHANNEL_ID && row.kind !== "joint" && !row.archived,
  };
}

const allPlaygroundChannels = [
  ...PLAYGROUND_JOINT_CHANNELS,
  ...PLAYGROUND_ROOM_CHANNELS,
  ...PLAYGROUND_DIRECT_MESSAGES,
];
const pinnedChannels = allPlaygroundChannels.filter((row) => row.navigation.pinned);
const unpinnedJointChannels = PLAYGROUND_JOINT_CHANNELS.filter((row) => !row.navigation.pinned);
const unpinnedRoomChannels = PLAYGROUND_ROOM_CHANNELS.filter((row) => !row.navigation.pinned);
const unpinnedDirectMessages = PLAYGROUND_DIRECT_MESSAGES.filter((row) => !row.navigation.pinned);

function useSectionOrder<T extends { id: string; name: string }>(rows: readonly T[]) {
  const [order, setOrder] = useState(() => rows.map((row) => row.id));
  const byId = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);
  const ordered = useMemo(
    () => order.map((id) => byId.get(id)).filter((row): row is T => row != null),
    [byId, order],
  );
  const visibleOrder = useMemo(() => ordered.map((row) => row.id), [ordered]);
  const onReorder = useCallback((next: string[]) => setOrder(next), []);
  return { ordered, visibleOrder, onReorder };
}

function channelLink(channelId: PlaygroundChannelId) {
  return (
    <Link
      to="/playground/s/$serverSlug/channel/$channelId"
      params={{ channelId, serverSlug: PLAYGROUND_SERVER_SLUG }}
      search={{}}
    />
  );
}

function PlaygroundSidebarItem({
  children,
  current,
  menu,
  onArchive,
  onCloseDm,
  render,
  unread,
}: {
  children: ReactNode;
  current: boolean;
  menu: SidebarRowMenu;
  onArchive?: () => void;
  onCloseDm?: () => void;
  render: ReactElement;
  unread?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuState, setMenuState] = useState(() => ({
    unread: menu.unread,
    pinned: menu.pinned,
    muted: menu.muted === true,
  }));
  const [announcement, setAnnouncement] = useState("");
  const Item = unread ? ChatSidebarItemUnread : ChatSidebarItem;

  const announce = (message: string) => {
    setAnnouncement("");
    queueMicrotask(() => setAnnouncement(message));
  };

  return (
    <ContextMenu onOpenChange={setMenuOpen}>
      <ContextMenuTrigger
        render={
          <Item
            current={current}
            aria-current={current ? "page" : undefined}
            aria-expanded={menuOpen || undefined}
            render={render}
          >
            {children}
            <span className="sr-only" aria-live="polite">
              {announcement}
            </span>
          </Item>
        }
      />
      <ContextMenuContent className="flex w-48 flex-col">
        <ContextMenuItem
          onClick={() => {
            const nextUnread = !menuState.unread;
            setMenuState((state) => ({ ...state, unread: nextUnread }));
            announce(`${menu.name} marked as ${nextUnread ? "unread" : "read"}`);
          }}
        >
          {menuState.unread ? <MailOpen /> : <Mail />}
          {menuState.unread ? "Mark as Read" : "Mark as Unread"}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            const nextPinned = !menuState.pinned;
            setMenuState((state) => ({ ...state, pinned: nextPinned }));
            announce(`${menu.name} ${nextPinned ? "pinned" : "unpinned"}`);
          }}
        >
          {menuState.pinned ? <PinOff /> : <Pin />}
          {menuState.pinned ? "Unpin" : "Pin"}
        </ContextMenuItem>
        {menu.type === "channel" && menu.canMute ? (
          <ContextMenuItem
            onClick={() => {
              const nextMuted = !menuState.muted;
              setMenuState((state) => ({ ...state, muted: nextMuted }));
              announce(`${menu.name} ${nextMuted ? "muted" : "unmuted"}`);
            }}
          >
            {menuState.muted ? <Bell /> : <BellOff />}
            {menuState.muted ? "Unmute" : "Mute"}
          </ContextMenuItem>
        ) : null}
        {menu.type === "channel" && menu.canArchive ? (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onArchive}>
              <Archive />
              Archive
            </ContextMenuItem>
          </>
        ) : null}
        {menu.type === "dm" ? (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onCloseDm}>
              <X />
              Close Chat
            </ContextMenuItem>
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
}

function PinnedSection({
  activeChannelId,
  onArchive,
  onCloseDm,
  rows,
}: {
  activeChannelId: PlaygroundChannelId | null;
  onArchive: (row: PlaygroundRoomChannel) => void;
  onCloseDm: (row: PlaygroundDirectMessage) => void;
  rows: readonly PlaygroundChannelRecord[];
}) {
  const { ordered, visibleOrder, onReorder } = useSectionOrder(rows);
  if (ordered.length === 0) return null;
  const hasUnread = ordered.some(
    (row) => row.navigation.unread || row.navigation.badge || row.navigation.mention,
  );

  return (
    <ChatSidebarSection>
      <SidebarSectionHeaderMenu menu="sort">
        <ChatSidebarSectionButton type="button">
          <ChatSidebarSectionTitle>Pinned</ChatSidebarSectionTitle>
          <ChatSidebarSectionChevron />
        </ChatSidebarSectionButton>
        <ChatSidebarSectionTrailing>
          {hasUnread ? <ChatSidebarSectionAttention /> : null}
          <ChatSidebarSectionActions>
            <SidebarSectionSortMenu aria-label="Sort pinned" />
          </ChatSidebarSectionActions>
        </ChatSidebarSectionTrailing>
      </SidebarSectionHeaderMenu>
      <SortableChatSidebarList items={visibleOrder} onReorder={onReorder}>
        {ordered.map((row) => (
          <SortableChatSidebarItem key={row.id} id={row.id}>
            <PlaygroundSidebarItem
              current={activeChannelId === row.id}
              menu={getSidebarRowMenu(row)}
              onArchive={row.kind === "dm" ? undefined : () => onArchive(row)}
              onCloseDm={row.kind === "dm" ? () => onCloseDm(row) : undefined}
              unread={row.navigation.unread}
              render={channelLink(row.id)}
            >
              <PinnedRowContent row={row} hideBadge={activeChannelId === row.id} />
            </PlaygroundSidebarItem>
          </SortableChatSidebarItem>
        ))}
      </SortableChatSidebarList>
    </ChatSidebarSection>
  );
}

function JointChannelsSection({
  activeChannelId,
}: {
  activeChannelId: PlaygroundChannelId | null;
}) {
  const { ordered, visibleOrder, onReorder } = useSectionOrder(unpinnedJointChannels);
  const hasUnread = ordered.some(
    (row) => row.navigation.unread || row.navigation.badge || row.navigation.mention,
  );

  return (
    <ChatSidebarSection>
      <SidebarSectionHeaderMenu
        menu="channels"
        count={ordered.length}
        countLabel="channels"
        createLabel="Create Joint Channel"
        createIcon="joint"
      >
        <ChatSidebarSectionButton type="button">
          <ChatSidebarSectionTitle>Joint channels</ChatSidebarSectionTitle>
          <ChatSidebarSectionChevron />
        </ChatSidebarSectionButton>
        <ChatSidebarSectionTrailing>
          {hasUnread ? <ChatSidebarSectionAttention /> : null}
          <ChatSidebarSectionActions>
            <SidebarSectionAddButton aria-label="Create joint channel" />
            <SidebarSectionChannelsMenu
              aria-label="Joint channels menu"
              count={ordered.length}
              countLabel="channels"
              createLabel="Create Joint Channel"
              createIcon="joint"
            />
          </ChatSidebarSectionActions>
        </ChatSidebarSectionTrailing>
      </SidebarSectionHeaderMenu>
      <SortableChatSidebarList items={visibleOrder} onReorder={onReorder}>
        {ordered.map((row) => (
          <SortableChatSidebarItem key={row.id} id={row.id}>
            <PlaygroundSidebarItem
              current={activeChannelId === row.id}
              menu={getSidebarRowMenu(row)}
              unread={row.navigation.unread}
              render={channelLink(row.id)}
            >
              <ChannelRowContent row={row} hideBadge={activeChannelId === row.id} />
            </PlaygroundSidebarItem>
          </SortableChatSidebarItem>
        ))}
      </SortableChatSidebarList>
    </ChatSidebarSection>
  );
}

function ChannelsSection({
  activeChannelId,
  onArchive,
}: {
  activeChannelId: PlaygroundChannelId | null;
  onArchive: (row: PlaygroundRoomChannel) => void;
}) {
  const [sortMode, setSortMode] = useState<SidebarSortValue>("manual");
  const { ordered: manualOrder, visibleOrder, onReorder } = useSectionOrder(unpinnedRoomChannels);
  const ordered = useMemo(() => sortChannels(manualOrder, sortMode), [manualOrder, sortMode]);
  const hasUnread = ordered.some(
    (row) => row.navigation.unread || row.navigation.badge || row.navigation.mention,
  );

  const renderChannel = (row: PlaygroundRoomRecord) => (
    <PlaygroundSidebarItem
      key={row.id}
      current={activeChannelId === row.id}
      menu={getSidebarRowMenu(row)}
      onArchive={() => onArchive(row)}
      unread={row.navigation.unread}
      render={channelLink(row.id)}
    >
      <ChannelRowContent row={row} hideBadge={activeChannelId === row.id} />
    </PlaygroundSidebarItem>
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
        <ChatSidebarSectionButton type="button">
          <ChatSidebarSectionTitle>Channels</ChatSidebarSectionTitle>
          <ChatSidebarSectionChevron />
        </ChatSidebarSectionButton>
        <ChatSidebarSectionTrailing>
          {hasUnread ? <ChatSidebarSectionAttention /> : null}
          <ChatSidebarSectionActions>
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
          </ChatSidebarSectionActions>
        </ChatSidebarSectionTrailing>
      </SidebarSectionHeaderMenu>
      {sortMode === "manual" ? (
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

function sortChannels<T extends PlaygroundRoomChannel>(rows: readonly T[], mode: SidebarSortValue) {
  if (mode === "manual") return rows;
  if (mode === "az") return [...rows].sort((left, right) => left.name.localeCompare(right.name));

  return [...rows].sort(
    (left, right) => getChannelActivityRank(right) - getChannelActivityRank(left),
  );
}

function getChannelActivityRank(channel: PlaygroundRoomChannel) {
  if (channel.navigation.mention) return 4;
  if (channel.navigation.draft) return 3;
  if (channel.navigation.badge) return 2;
  if (channel.navigation.unread) return 1;
  return 0;
}

function DirectMessagesSection({
  activeChannelId,
  onCloseDm,
  rows,
}: {
  activeChannelId: PlaygroundChannelId | null;
  onCloseDm: (row: PlaygroundDirectMessage) => void;
  rows: readonly PlaygroundDmRecord[];
}) {
  const { ordered, visibleOrder, onReorder } = useSectionOrder(rows);
  const hasUnread = ordered.some(
    (row) => row.navigation.unread || row.navigation.badge || row.navigation.mention,
  );

  return (
    <ChatSidebarSection>
      <SidebarSectionHeaderMenu menu="sort">
        <ChatSidebarSectionButton type="button">
          <ChatSidebarSectionTitle>Direct Messages</ChatSidebarSectionTitle>
          <ChatSidebarSectionChevron />
        </ChatSidebarSectionButton>
        <ChatSidebarSectionTrailing>
          {hasUnread ? <ChatSidebarSectionAttention /> : null}
          <ChatSidebarSectionActions>
            <SidebarSectionSortMenu aria-label="Sort direct messages" />
          </ChatSidebarSectionActions>
        </ChatSidebarSectionTrailing>
      </SidebarSectionHeaderMenu>
      <SortableChatSidebarList items={visibleOrder} onReorder={onReorder}>
        {ordered.map((row) => (
          <SortableChatSidebarItem key={row.id} id={row.id}>
            <PlaygroundSidebarItem
              current={activeChannelId === row.id}
              menu={getSidebarRowMenu(row)}
              onCloseDm={() => onCloseDm(row)}
              unread={row.navigation.unread}
              render={channelLink(row.id)}
            >
              <DirectMessageRowContent row={row} hideBadge={activeChannelId === row.id} />
            </PlaygroundSidebarItem>
          </SortableChatSidebarItem>
        ))}
      </SortableChatSidebarList>
    </ChatSidebarSection>
  );
}

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
  const theme = useThemeFamily();
  const { railView, selectRailView } = usePlaygroundNavigation();
  const { activeServer } = usePlaygroundShellState();
  const isDesktop = useMediaQuery("(min-width: 768px)", false);
  const selectedChannelId = isDesktop ? activeChannelId : null;
  const liveAgentContentPad =
    liveAgentActivity == null
      ? undefined
      : theme === "elegant"
        ? "md:pb-[4.25rem]"
        : "md:pb-[3.25rem]";
  const mobileNavigationContentPad = mobileBottomNavigation
    ? "max-lg:pb-[calc(3.75rem+env(safe-area-inset-bottom,0px))]"
    : undefined;
  const visiblePinnedChannels = useMemo(
    () => pinnedChannels.filter((row) => row.kind !== "dm" || !closedDmIds.has(row.id)),
    [closedDmIds],
  );
  const visibleDirectMessages = useMemo(
    () => unpinnedDirectMessages.filter((row) => !closedDmIds.has(row.id)),
    [closedDmIds],
  );
  const closeDirectMessage = (row: PlaygroundDirectMessage) => {
    setClosedDmIds((current) => new Set(current).add(row.id));
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
          <ChatSidebarContent className={cn(liveAgentContentPad, mobileNavigationContentPad)}>
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
                current={railView === "saved"}
                onClick={() => selectRailView("saved")}
              >
                <ChatSidebarItemIcon aria-hidden>
                  <Bookmark />
                </ChatSidebarItemIcon>
                <ChatSidebarItemTitle>Saved</ChatSidebarItemTitle>
                <ChatSidebarItemMeta>33</ChatSidebarItemMeta>
              </ChatSidebarItem>

              <PinnedSection
                activeChannelId={selectedChannelId}
                onArchive={(row) => setArchiveTarget(row.name)}
                onCloseDm={closeDirectMessage}
                rows={visiblePinnedChannels}
              />
              <JointChannelsSection activeChannelId={selectedChannelId} />
              <ChannelsSection
                activeChannelId={selectedChannelId}
                onArchive={(row) => setArchiveTarget(row.name)}
              />
              <DirectMessagesSection
                activeChannelId={selectedChannelId}
                onCloseDm={closeDirectMessage}
                rows={visibleDirectMessages}
              />
            </div>
          </ChatSidebarContent>
        </ChatSidebarBody>
        {liveAgentActivity ? (
          <div
            className={
              theme === "elegant"
                ? [
                    "pointer-events-none absolute inset-x-0 bottom-3 z-10 max-md:hidden",
                    "before:pointer-events-none before:absolute before:inset-x-0 before:-bottom-3 before:z-0 before:h-20",
                    "before:bg-[linear-gradient(to_bottom,transparent,var(--layer-page))] before:backdrop-blur-[4px]",
                    "before:[mask-image:linear-gradient(to_top,black_50%,transparent)] before:[-webkit-mask-image:linear-gradient(to_top,black_50%,transparent)]",
                    "before:content-[''] [&>*]:relative [&>*]:z-10",
                  ].join(" ")
                : "pointer-events-none absolute inset-x-0 bottom-0 z-40 max-md:hidden"
            }
          >
            {theme === "elegant" ? (
              <div className="ml-[calc(var(--sidebar-inset-x,26px)-var(--sidebar-row-inset-x,6px))] mr-[calc(var(--sidebar-inset-end,var(--sidebar-inset-x,26px))-var(--sidebar-row-inset-x,6px))]">
                <LiveAgentActivityBarComposition latest={liveAgentActivity} />
              </div>
            ) : (
              <LiveAgentActivityBarComposition latest={liveAgentActivity} />
            )}
          </div>
        ) : null}
      </ChatSidebarRoot>

      <AlertDialog
        open={archiveTarget !== null}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Channel</AlertDialogTitle>
            <AlertDialogClose />
          </AlertDialogHeader>
          <AlertDialogBody>
            <Banner status="warning">
              <CircleAlert />
              <BannerDescription>
                Archive "{archiveTarget}"? Members keep read access and history, but writes will be
                frozen and the channel will be hidden from sidebars. You can unarchive it later.
              </BannerDescription>
            </Banner>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogCancel size="md">Cancel</AlertDialogCancel>
            <AlertDialogAction variant="warning" size="md">
              Archive Channel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
