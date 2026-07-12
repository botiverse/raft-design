import { Link } from "@tanstack/react-router";
import {
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
  Plus,
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
  BannerAction,
  BannerDescription,
  Button,
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
  Status,
  Textarea,
} from "raft-ui";
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
  ChatSidebarRoot,
  ChatSidebarSection,
  ChatSidebarSectionButton,
  ChatSidebarSectionChevron,
  ChatSidebarSectionCount,
  ChatSidebarSectionAttention,
  ChatSidebarSectionHeader,
  ChatSidebarSectionTitle,
  SortableChatSidebarItem,
  SortableChatSidebarList,
} from "raft-ui/wip";

import {
  PLAYGROUND_DIRECT_MESSAGES,
  PLAYGROUND_INVITABLE_ACTORS,
  PLAYGROUND_JOINT_CHANNELS,
  PLAYGROUND_ROOM_CHANNELS,
  getPlaygroundDmActor,
  type PlaygroundChannelId,
  type PlaygroundChannelRecord,
  type PlaygroundDirectMessage,
  type PlaygroundPresence,
  type PlaygroundRoomChannel,
} from "./mock/index.ts";
import { PLAYGROUND_PRESENCE_STATUS } from "./playground-presence.ts";

type ActiveDialog = "create-channel" | "create-joint" | null;
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

const dialogMembers = PLAYGROUND_INVITABLE_ACTORS;

type DialogMember = (typeof dialogMembers)[number];

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
        <Avatar size="sidebar" type={actor.type}>
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
        <ChatSidebarItemSubtitle>{row.subtitle}</ChatSidebarItemSubtitle>
        {navigation.muted ? <PlaygroundMutedIndicator /> : null}
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
    canArchive: row.name !== "all" && row.kind !== "joint" && !row.archived,
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
  return <Link to="/playground/$channelId" params={{ channelId }} search={{}} />;
}

function PlaygroundSidebarItem({
  children,
  current,
  menu,
  onArchive,
  onCloseDm,
  render,
  unread,
  onSelect,
}: {
  children: ReactNode;
  current: boolean;
  menu: SidebarRowMenu;
  onArchive?: () => void;
  onCloseDm?: () => void;
  render: ReactElement;
  unread?: boolean;
  onSelect?: () => void;
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
            aria-current={current ? "page" : undefined}
            aria-expanded={menuOpen || undefined}
            render={render}
            onClick={onSelect}
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
  onSelect,
  rows,
}: {
  activeChannelId: PlaygroundChannelId | null;
  onArchive: (row: PlaygroundRoomChannel) => void;
  onCloseDm: (row: PlaygroundDirectMessage) => void;
  onSelect: () => void;
  rows: readonly PlaygroundChannelRecord[];
}) {
  const { ordered, visibleOrder, onReorder } = useSectionOrder(rows);
  if (ordered.length === 0) return null;
  const hasUnread = ordered.some(
    (row) => row.navigation.unread || row.navigation.badge || row.navigation.mention,
  );

  return (
    <ChatSidebarSection>
      <ChatSidebarSectionHeader>
        <ChatSidebarSectionButton type="button">
          <ChatSidebarSectionTitle>Pinned</ChatSidebarSectionTitle>
          <ChatSidebarSectionChevron className="size-3" />
          <ChatSidebarSectionCount>{ordered.length}</ChatSidebarSectionCount>
          {hasUnread ? <ChatSidebarSectionAttention /> : null}
        </ChatSidebarSectionButton>
      </ChatSidebarSectionHeader>
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
              onSelect={onSelect}
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
  onSelect,
}: {
  activeChannelId: PlaygroundChannelId | null;
  onSelect: () => void;
}) {
  const { ordered, visibleOrder, onReorder } = useSectionOrder(unpinnedJointChannels);
  const hasUnread = ordered.some(
    (row) => row.navigation.unread || row.navigation.badge || row.navigation.mention,
  );

  return (
    <ChatSidebarSection>
      <ChatSidebarSectionHeader>
        <ChatSidebarSectionButton type="button">
          <ChatSidebarSectionTitle>Joint channels</ChatSidebarSectionTitle>
          <ChatSidebarSectionChevron className="size-3" />
          <ChatSidebarSectionCount>{ordered.length}</ChatSidebarSectionCount>
          {hasUnread ? <ChatSidebarSectionAttention /> : null}
        </ChatSidebarSectionButton>
      </ChatSidebarSectionHeader>
      <SortableChatSidebarList items={visibleOrder} onReorder={onReorder}>
        {ordered.map((row) => (
          <SortableChatSidebarItem key={row.id} id={row.id}>
            <PlaygroundSidebarItem
              current={activeChannelId === row.id}
              menu={getSidebarRowMenu(row)}
              unread={row.navigation.unread}
              render={channelLink(row.id)}
              onSelect={onSelect}
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
  onSelect,
}: {
  activeChannelId: PlaygroundChannelId | null;
  onArchive: (row: PlaygroundRoomChannel) => void;
  onSelect: () => void;
}) {
  const { ordered, visibleOrder, onReorder } = useSectionOrder(unpinnedRoomChannels);
  const hasUnread = ordered.some(
    (row) => row.navigation.unread || row.navigation.badge || row.navigation.mention,
  );

  return (
    <ChatSidebarSection>
      <ChatSidebarSectionHeader>
        <ChatSidebarSectionButton type="button">
          <ChatSidebarSectionTitle>Channels</ChatSidebarSectionTitle>
          <ChatSidebarSectionChevron className="size-3" />
          <ChatSidebarSectionCount>{ordered.length}</ChatSidebarSectionCount>
          {hasUnread ? <ChatSidebarSectionAttention /> : null}
        </ChatSidebarSectionButton>
      </ChatSidebarSectionHeader>
      <SortableChatSidebarList items={visibleOrder} onReorder={onReorder}>
        {ordered.map((row) => (
          <SortableChatSidebarItem key={row.id} id={row.id}>
            <PlaygroundSidebarItem
              current={activeChannelId === row.id}
              menu={getSidebarRowMenu(row)}
              onArchive={() => onArchive(row)}
              unread={row.navigation.unread}
              render={channelLink(row.id)}
              onSelect={onSelect}
            >
              <ChannelRowContent row={row} hideBadge={activeChannelId === row.id} />
            </PlaygroundSidebarItem>
          </SortableChatSidebarItem>
        ))}
      </SortableChatSidebarList>
    </ChatSidebarSection>
  );
}

function DirectMessagesSection({
  activeChannelId,
  onCloseDm,
  onSelect,
  rows,
}: {
  activeChannelId: PlaygroundChannelId | null;
  onCloseDm: (row: PlaygroundDirectMessage) => void;
  onSelect: () => void;
  rows: readonly PlaygroundDmRecord[];
}) {
  const { ordered, visibleOrder, onReorder } = useSectionOrder(rows);
  const hasUnread = ordered.some(
    (row) => row.navigation.unread || row.navigation.badge || row.navigation.mention,
  );

  return (
    <ChatSidebarSection>
      <ChatSidebarSectionHeader>
        <ChatSidebarSectionButton type="button">
          <ChatSidebarSectionTitle>Direct Messages</ChatSidebarSectionTitle>
          <ChatSidebarSectionChevron className="size-3" />
          <ChatSidebarSectionCount>{ordered.length}</ChatSidebarSectionCount>
          {hasUnread ? <ChatSidebarSectionAttention /> : null}
        </ChatSidebarSectionButton>
      </ChatSidebarSectionHeader>
      <SortableChatSidebarList items={visibleOrder} onReorder={onReorder}>
        {ordered.map((row) => (
          <SortableChatSidebarItem key={row.id} id={row.id}>
            <PlaygroundSidebarItem
              current={activeChannelId === row.id}
              menu={getSidebarRowMenu(row)}
              onCloseDm={() => onCloseDm(row)}
              unread={row.navigation.unread}
              render={channelLink(row.id)}
              onSelect={onSelect}
            >
              <DirectMessageRowContent row={row} hideBadge={activeChannelId === row.id} />
            </PlaygroundSidebarItem>
          </SortableChatSidebarItem>
        ))}
      </SortableChatSidebarList>
    </ChatSidebarSection>
  );
}

// Chat header `+` add menu — source `renderChannelActionMenu`.
function SidebarAddMenu({
  onCreateChannel,
  onCreateJoint,
}: {
  onCreateChannel: () => void;
  onCreateJoint: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="outline" size="icon-sm" aria-label="Add channel">
            <Plus />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="flex w-[190px] min-w-[190px] flex-col">
        <DropdownMenuItem onClick={onCreateChannel}>
          <Plus />
          <span className="min-w-0 flex-1 text-left">Create Channel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateJoint}>
          <GitBranch />
          <span className="min-w-0 flex-1 text-left">Create Joint Channel</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Create Channel dialog — source `CreateChannelDialog`. Inlined (not the docs
// composition) so the playground can match source: title-case suffixed uppercase
// labels, no static archived-name banner, pink (accent) primary action.
function CreateChannelDialogContent() {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Channel</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="dialog-create-channel-name" required>
            Name
          </FieldLabel>
          <Input id="dialog-create-channel-name" placeholder="e.g. ai-research" />
        </Field>
        <Field>
          <FieldLabel htmlFor="dialog-create-channel-description" optional>
            Description
          </FieldLabel>
          <Textarea
            id="dialog-create-channel-description"
            placeholder="What is this channel about?"
            className="min-h-16"
          />
        </Field>
        <Field>
          <FieldLabel>Visibility</FieldLabel>
          <SegmentedControl defaultValue="public" ariaLabel="Channel visibility">
            <SegmentedControlItem value="public">
              <Hash />
              <SegmentedControlLabel>Public</SegmentedControlLabel>
            </SegmentedControlItem>
            <SegmentedControlItem value="private">
              <Lock />
              <SegmentedControlLabel>Private</SegmentedControlLabel>
            </SegmentedControlItem>
          </SegmentedControl>
        </Field>
        <Field>
          <FieldLabel optional>Members</FieldLabel>
          <Combobox<DialogMember, true>
            multiple
            autoHighlight
            items={dialogMembers}
            defaultValue={[dialogMembers[0], dialogMembers[2]]}
            isItemEqualToValue={(item, value) => item.id === value.id}
            itemToStringLabel={(member) => member.name}
          >
            <ComboboxControl className="w-full">
              <Search />
              <ComboboxInput
                aria-label="Search members"
                placeholder="Search members by name"
                suppressPasswordManager
              />
            </ComboboxControl>
            <ComboboxContent className="w-[var(--anchor-width)]">
              <ComboboxList className="max-h-none">
                {(member: DialogMember) => (
                  <ComboboxItem key={member.id} value={member}>
                    <span className="flex min-w-0 items-center gap-2">
                      <Avatar type={member.type} size="xs" />
                      <span className="min-w-0 truncate">{member.name}</span>
                    </span>
                    <ComboboxItemIndicator />
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <FieldDescription>
            Select the people and agents that should join immediately.
          </FieldDescription>
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button variant="accent" disabled>
          Create Channel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// Create Joint Channel dialog shell — source `CreateJointChannelDialog`.
// Structure only (Name, Description, Invite servers); actions inert.
function CreateJointChannelDialogContent() {
  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle className="flex min-w-0 items-center gap-2">
          <GitBranch className="size-[18px] shrink-0" />
          <span className="truncate">Create Joint Channel</span>
        </DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <Banner status="warning">
          <BannerDescription>Joint channels requires the Pro plan.</BannerDescription>
          <BannerAction>
            <Button type="button" variant="ghost" size="xs" disabled>
              View Billing
            </Button>
          </BannerAction>
        </Banner>
        <Field>
          <FieldLabel htmlFor="dialog-joint-name" required>
            Name
          </FieldLabel>
          <Input id="dialog-joint-name" placeholder="e.g. partner-launch" />
        </Field>
        <Field>
          <FieldLabel htmlFor="dialog-joint-description" optional>
            Description
          </FieldLabel>
          <Textarea
            id="dialog-joint-description"
            placeholder="What will both servers use this channel for?"
            className="min-h-16"
          />
        </Field>
        <Field>
          <span className="flex items-center justify-between gap-3">
            <FieldLabel>Invite servers</FieldLabel>
            <Button type="button" variant="outline" size="xs" disabled>
              <Plus />
              Add server
            </Button>
          </span>
          <FieldDescription>
            Joint channels support a maximum of 3 servers, including this server.
          </FieldDescription>
          <span className="grid gap-3">
            <Field>
              <FieldLabel htmlFor="dialog-joint-slug" required>
                Server slug
              </FieldLabel>
              <Input id="dialog-joint-slug" placeholder="partner-workspace" />
            </Field>
            <Field>
              <FieldLabel htmlFor="dialog-joint-people" required>
                Invited people
              </FieldLabel>
              <Textarea
                id="dialog-joint-people"
                placeholder="@admin or admin@example.com"
                className="min-h-12"
              />
              <FieldDescription>
                Use target-server owner/admin handles or emails, separated by commas or new lines.
              </FieldDescription>
            </Field>
          </span>
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button variant="accent" disabled>
          Create Joint Channel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function PlaygroundSidebar({
  activeChannelId,
  title = "Chat",
}: {
  activeChannelId: PlaygroundChannelId;
  title?: string;
}) {
  const [dialog, setDialog] = useState<ActiveDialog>(null);
  const [archiveTarget, setArchiveTarget] = useState<string | null>(null);
  const [closedDmIds, setClosedDmIds] = useState<ReadonlySet<string>>(() => new Set());
  const [savedSelected, setSavedSelected] = useState(false);
  const selectedChannelId = savedSelected ? null : activeChannelId;
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
      <ChatSidebarRoot>
        <ChatSidebarHeader>
          <div className="min-w-0 flex-1">
            <ChatSidebarHeaderTitle className="leading-tight tabular-nums">
              {title}
            </ChatSidebarHeaderTitle>
          </div>
          <SidebarAddMenu
            onCreateChannel={() => setDialog("create-channel")}
            onCreateJoint={() => setDialog("create-joint")}
          />
        </ChatSidebarHeader>
        <ChatSidebarBody>
          <ChatSidebarContent>
            <div className="min-h-full">
              <ChatSidebarItem
                aria-current={savedSelected ? "page" : undefined}
                data-playground-saved="true"
                onClick={() => setSavedSelected(true)}
              >
                <ChatSidebarItemIcon aria-hidden>
                  <Bookmark className="size-3.5" />
                </ChatSidebarItemIcon>
                <ChatSidebarItemTitle>Saved</ChatSidebarItemTitle>
                <ChatSidebarItemMeta>33</ChatSidebarItemMeta>
              </ChatSidebarItem>

              <PinnedSection
                activeChannelId={selectedChannelId}
                onArchive={(row) => setArchiveTarget(row.name)}
                onCloseDm={closeDirectMessage}
                onSelect={() => setSavedSelected(false)}
                rows={visiblePinnedChannels}
              />
              <JointChannelsSection
                activeChannelId={selectedChannelId}
                onSelect={() => setSavedSelected(false)}
              />
              <ChannelsSection
                activeChannelId={selectedChannelId}
                onArchive={(row) => setArchiveTarget(row.name)}
                onSelect={() => setSavedSelected(false)}
              />
              <DirectMessagesSection
                activeChannelId={selectedChannelId}
                onCloseDm={closeDirectMessage}
                onSelect={() => setSavedSelected(false)}
                rows={visibleDirectMessages}
              />
            </div>
          </ChatSidebarContent>
        </ChatSidebarBody>
      </ChatSidebarRoot>

      <Dialog
        open={dialog === "create-channel"}
        onOpenChange={(open) => setDialog(open ? "create-channel" : null)}
      >
        <CreateChannelDialogContent />
      </Dialog>

      <Dialog
        open={dialog === "create-joint"}
        onOpenChange={(open) => setDialog(open ? "create-joint" : null)}
      >
        <CreateJointChannelDialogContent />
      </Dialog>

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
