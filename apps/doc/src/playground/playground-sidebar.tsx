import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  ChevronRight,
  CircleAlert,
  GitBranch,
  Hash,
  Lock,
  Plus,
  Search,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
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
  Button,
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
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
  useThemeFamily,
} from "raft-ui";
import {
  ChatSidebarBody,
  ChatSidebarContent,
  ChatSidebarHeader,
  ChatSidebarHeaderTitle,
  ChatSidebarItem,
  ChatSidebarItemAside,
  ChatSidebarItemBadge,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemDraft,
  ChatSidebarItemIcon,
  ChatSidebarItemInlineText,
  ChatSidebarItemMention,
  ChatSidebarItemMuted,
  ChatSidebarItemPresence,
  ChatSidebarItemSubtitle,
  ChatSidebarItemTitle,
  ChatSidebarMenu,
  ChatSidebarMenuAside,
  ChatSidebarMenuCount,
  ChatSidebarMenuIcon,
  ChatSidebarMenuTitle,
  ChatSidebarRoot,
  ChatSidebarSection,
  ChatSidebarSectionAction,
  ChatSidebarSectionButton,
  ChatSidebarSectionCount,
  ChatSidebarSectionHeader,
  ChatSidebarSectionTitle,
  SortableChatSidebarItem,
  SortableChatSidebarList,
} from "raft-ui/wip";

import {
  PLAYGROUND_DIRECT_MESSAGES,
  PLAYGROUND_INVITABLE_ACTORS,
  PLAYGROUND_JOINT_CHANNELS,
  PLAYGROUND_PINNED_CHANNELS,
  PLAYGROUND_ROOM_CHANNELS,
  getPlaygroundDmActor,
  type PlaygroundChannelId,
  type PlaygroundDirectMessage,
  type PlaygroundPresence,
  type PlaygroundRoomChannel,
} from "./mock/index.ts";

type ActiveDialog = "create-channel" | "create-joint" | null;

// Source dialog field labels are uppercased with wide tracking (FormField).
const DIALOG_LABEL_CLASS = "uppercase tracking-wide";

const dialogMembers = PLAYGROUND_INVITABLE_ACTORS;

type DialogMember = (typeof dialogMembers)[number];

function ChannelRowContent({
  row,
  hideBadge,
}: {
  row: PlaygroundRoomChannel;
  hideBadge?: boolean;
}) {
  const showBadge = row.sidebar.badge && !hideBadge;
  const showAside = showBadge || row.sidebar.draft || row.sidebar.mention;

  return (
    <>
      <ChatSidebarItemChannelIcon type={row.kind} />
      <ChatSidebarItemInlineText align={row.sidebar.muted ? "center" : undefined}>
        <ChatSidebarItemTitle>{row.name}</ChatSidebarItemTitle>
        {row.sidebar.muted ? <ChatSidebarItemMuted /> : null}
      </ChatSidebarItemInlineText>
      {showAside ? (
        <ChatSidebarItemAside>
          {row.sidebar.mention ? <ChatSidebarItemMention /> : null}
          {showBadge ? <ChatSidebarItemBadge>{row.sidebar.badge}</ChatSidebarItemBadge> : null}
          {row.sidebar.draft ? <ChatSidebarItemDraft /> : null}
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
  if (status === "online") {
    return <Status aria-hidden variant="success" size={size} />;
  }
  if (status === "working") {
    return <Status aria-hidden variant="success" size={size} pulse />;
  }
  if (status === "idle") {
    return <Status aria-hidden variant="warning" size={size} />;
  }
  return <Status aria-hidden variant="default" size={size} />;
}

function DirectMessageRowContent({
  row,
  hideBadge,
}: {
  row: PlaygroundDirectMessage;
  hideBadge?: boolean;
}) {
  const theme = useThemeFamily();
  const actor = getPlaygroundDmActor(row);
  const showBadge = Boolean(row.sidebar.badge && !hideBadge);
  const showAside =
    showBadge ||
    Boolean(row.sidebar.draft) ||
    Boolean(row.sidebar.mention) ||
    (theme === "brutal" && Boolean(actor.presence));

  return (
    <>
      <ChatSidebarItemIcon>
        {actor.presence ? (
          <ChatSidebarItemPresence slot="indicator">
            <DirectMessageStatus status={actor.presence} size="sm" />
          </ChatSidebarItemPresence>
        ) : null}
        <Avatar size="sidebar" type={actor.type}>
          {actor.avatarSrc ? <AvatarImage src={actor.avatarSrc} alt="" /> : null}
          {actor.fallback ? (
            <AvatarFallback className="text-[9px] font-bold">{actor.fallback}</AvatarFallback>
          ) : actor.avatarSrc ? (
            <AvatarFallback />
          ) : null}
        </Avatar>
      </ChatSidebarItemIcon>
      <ChatSidebarItemInlineText
        align={row.sidebar.muted ? "center" : undefined}
        titleWidth="constrained"
      >
        <ChatSidebarItemTitle>{row.name}</ChatSidebarItemTitle>
        <ChatSidebarItemSubtitle>{row.subtitle}</ChatSidebarItemSubtitle>
        {row.sidebar.muted ? <ChatSidebarItemMuted /> : null}
      </ChatSidebarItemInlineText>
      {showAside ? (
        <ChatSidebarItemAside>
          {row.sidebar.mention ? <ChatSidebarItemMention /> : null}
          {actor.presence ? (
            <ChatSidebarItemPresence slot="aside">
              <DirectMessageStatus status={actor.presence} size="md" />
            </ChatSidebarItemPresence>
          ) : null}
          {showBadge ? <ChatSidebarItemBadge>{row.sidebar.badge}</ChatSidebarItemBadge> : null}
          {row.sidebar.draft ? <ChatSidebarItemDraft /> : null}
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

const unpinnedJointChannels = PLAYGROUND_JOINT_CHANNELS.filter((row) => !row.sidebar.pinned);
const unpinnedRoomChannels = PLAYGROUND_ROOM_CHANNELS.filter((row) => !row.sidebar.pinned);
const unpinnedDirectMessages = PLAYGROUND_DIRECT_MESSAGES.filter((row) => !row.sidebar.pinned);

function useSectionOrder<T extends { id: string }>(rows: readonly T[]) {
  const [order, setOrder] = useState(() => rows.map((row) => row.id));
  const byId = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);
  const ordered = useMemo(
    () => order.map((id) => byId.get(id)).filter((row): row is T => row != null),
    [byId, order],
  );
  const onReorder = useCallback((next: string[]) => setOrder(next), []);
  return { ordered, order, onReorder };
}

function channelLink(channelId: PlaygroundChannelId) {
  return <Link to="/playground/$channelId" params={{ channelId }} search={{}} />;
}

function PinnedSection({ activeChannelId }: { activeChannelId: PlaygroundChannelId }) {
  const { ordered, order, onReorder } = useSectionOrder(PLAYGROUND_PINNED_CHANNELS);
  if (ordered.length === 0) return null;

  return (
    <ChatSidebarSection>
      <ChatSidebarSectionHeader>
        <ChatSidebarSectionButton type="button" data-panel-open>
          <ChatSidebarSectionTitle>Pinned</ChatSidebarSectionTitle>
          <ChevronRight className="size-3" />
          <ChatSidebarSectionCount>{ordered.length}</ChatSidebarSectionCount>
        </ChatSidebarSectionButton>
      </ChatSidebarSectionHeader>
      <SortableChatSidebarList items={order} onReorder={onReorder}>
        {ordered.map((row) => (
          <SortableChatSidebarItem key={row.id} id={row.id}>
            <ChatSidebarItem
              selected={activeChannelId === row.id}
              unread={row.sidebar.unread}
              render={channelLink(row.id)}
            >
              <PinnedRowContent row={row} hideBadge={activeChannelId === row.id} />
            </ChatSidebarItem>
          </SortableChatSidebarItem>
        ))}
      </SortableChatSidebarList>
    </ChatSidebarSection>
  );
}

function JointChannelsSection({ activeChannelId }: { activeChannelId: PlaygroundChannelId }) {
  const { ordered, order, onReorder } = useSectionOrder(unpinnedJointChannels);

  return (
    <ChatSidebarSection>
      <ChatSidebarSectionHeader>
        <ChatSidebarSectionButton type="button" data-panel-open>
          <ChatSidebarSectionTitle>Joint channels</ChatSidebarSectionTitle>
          <ChevronRight className="size-3" />
          <ChatSidebarSectionCount>{ordered.length}</ChatSidebarSectionCount>
        </ChatSidebarSectionButton>
      </ChatSidebarSectionHeader>
      <SortableChatSidebarList items={order} onReorder={onReorder}>
        {ordered.map((row) => (
          <SortableChatSidebarItem key={row.id} id={row.id}>
            <ChatSidebarItem
              selected={activeChannelId === row.id}
              unread={row.sidebar.unread}
              render={channelLink(row.id)}
            >
              <ChannelRowContent row={row} hideBadge={activeChannelId === row.id} />
            </ChatSidebarItem>
          </SortableChatSidebarItem>
        ))}
      </SortableChatSidebarList>
    </ChatSidebarSection>
  );
}

function ChannelsSection({ activeChannelId }: { activeChannelId: PlaygroundChannelId }) {
  const { ordered, order, onReorder } = useSectionOrder(unpinnedRoomChannels);

  return (
    <ChatSidebarSection>
      <ChatSidebarSectionHeader>
        <ChatSidebarSectionButton type="button" data-panel-open>
          <ChatSidebarSectionTitle>Channels</ChatSidebarSectionTitle>
          <ChevronRight className="size-3" />
          <ChatSidebarSectionCount>{ordered.length}</ChatSidebarSectionCount>
        </ChatSidebarSectionButton>
      </ChatSidebarSectionHeader>
      <SortableChatSidebarList items={order} onReorder={onReorder}>
        {ordered.map((row) => (
          <SortableChatSidebarItem key={row.id} id={row.id}>
            <ChatSidebarItem
              selected={activeChannelId === row.id}
              unread={row.sidebar.unread}
              render={channelLink(row.id)}
            >
              <ChannelRowContent row={row} hideBadge={activeChannelId === row.id} />
            </ChatSidebarItem>
          </SortableChatSidebarItem>
        ))}
      </SortableChatSidebarList>
    </ChatSidebarSection>
  );
}

function DirectMessagesSection({ activeChannelId }: { activeChannelId: PlaygroundChannelId }) {
  const { ordered, order, onReorder } = useSectionOrder(unpinnedDirectMessages);

  return (
    <ChatSidebarSection>
      <ChatSidebarSectionHeader>
        <ChatSidebarSectionButton type="button" data-panel-open>
          <ChatSidebarSectionTitle>Direct Messages</ChatSidebarSectionTitle>
          <ChevronRight className="size-3" />
          <ChatSidebarSectionCount>{ordered.length}</ChatSidebarSectionCount>
        </ChatSidebarSectionButton>
      </ChatSidebarSectionHeader>
      <SortableChatSidebarList items={order} onReorder={onReorder}>
        {ordered.map((row) => (
          <SortableChatSidebarItem key={row.id} id={row.id}>
            <ChatSidebarItem
              selected={activeChannelId === row.id}
              unread={row.sidebar.unread}
              render={channelLink(row.id)}
            >
              <DirectMessageRowContent row={row} hideBadge={activeChannelId === row.id} />
            </ChatSidebarItem>
          </SortableChatSidebarItem>
        ))}
      </SortableChatSidebarList>
    </ChatSidebarSection>
  );
}

// Channels `+` add menu — source `renderChannelActionMenu`.
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
          <ChatSidebarSectionAction type="button" aria-label="Add channel">
            <Plus />
          </ChatSidebarSectionAction>
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
          <FieldLabel htmlFor="dialog-create-channel-name" required className={DIALOG_LABEL_CLASS}>
            Name
          </FieldLabel>
          <Input id="dialog-create-channel-name" placeholder="e.g. ai-research" />
        </Field>
        <Field>
          <FieldLabel
            htmlFor="dialog-create-channel-description"
            optional
            className={DIALOG_LABEL_CLASS}
          >
            Description
          </FieldLabel>
          <Textarea
            id="dialog-create-channel-description"
            placeholder="What is this channel about?"
            className="min-h-16"
          />
        </Field>
        <Field>
          <FieldLabel className={DIALOG_LABEL_CLASS}>Visibility</FieldLabel>
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
          <FieldLabel optional className={DIALOG_LABEL_CLASS}>
            Members
          </FieldLabel>
          <Combobox<DialogMember, true>
            multiple
            autoHighlight
            items={dialogMembers}
            defaultValue={[dialogMembers[0], dialogMembers[2]]}
            isItemEqualToValue={(item, value) => item.id === value.id}
            itemToStringLabel={(member) => member.name}
          >
            <ComboboxControl className="w-full">
              <Search className="text-foreground-muted [[data-theme=brutal]_&]:!stroke-2 [[data-theme=brutal]_&_*]:!stroke-2" />
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
        <Button variant="accent">Create Channel</Button>
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
        <div className="flex items-start gap-3 border-2 border-black bg-brutal-orange/20 p-3 font-bold">
          <span className="min-w-0 flex-1">
            Joint channels requires the Pro plan.{" "}
            <button type="button" className="text-black underline">
              View Billing
            </button>
          </span>
        </div>
        <Field>
          <FieldLabel htmlFor="dialog-joint-name" required className={DIALOG_LABEL_CLASS}>
            Name
          </FieldLabel>
          <Input id="dialog-joint-name" placeholder="e.g. partner-launch" />
        </Field>
        <Field>
          <FieldLabel htmlFor="dialog-joint-description" optional className={DIALOG_LABEL_CLASS}>
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
            <FieldLabel className={DIALOG_LABEL_CLASS}>Invite servers</FieldLabel>
            <Button type="button" variant="outline" size="xs">
              <Plus />
              Add server
            </Button>
          </span>
          <FieldDescription>
            Joint channels support a maximum of 3 servers, including this server.
          </FieldDescription>
          <span className="grid gap-3">
            <Field>
              <FieldLabel htmlFor="dialog-joint-slug" required className={DIALOG_LABEL_CLASS}>
                Server slug
              </FieldLabel>
              <Input id="dialog-joint-slug" placeholder="partner-workspace" />
            </Field>
            <Field>
              <FieldLabel htmlFor="dialog-joint-people" required className={DIALOG_LABEL_CLASS}>
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

export function PlaygroundSidebar({ activeChannelId }: { activeChannelId: PlaygroundChannelId }) {
  const [dialog, setDialog] = useState<ActiveDialog>(null);
  const [archiveTarget, setArchiveTarget] = useState<string | null>(null);

  return (
    <>
      <ChatSidebarRoot>
        <ChatSidebarHeader>
          <div className="min-w-0 flex-1">
            <ChatSidebarHeaderTitle className="leading-tight tabular-nums">
              Chat
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
              <ChatSidebarSection>
                <ChatSidebarSectionHeader className="mt-0">
                  <ChatSidebarMenu>
                    <ChatSidebarMenuIcon>
                      <Bookmark />
                    </ChatSidebarMenuIcon>
                    <ChatSidebarMenuTitle>Saved</ChatSidebarMenuTitle>
                    <ChatSidebarMenuAside>
                      <ChatSidebarMenuCount>33</ChatSidebarMenuCount>
                    </ChatSidebarMenuAside>
                  </ChatSidebarMenu>
                </ChatSidebarSectionHeader>
              </ChatSidebarSection>

              <PinnedSection activeChannelId={activeChannelId} />
              <JointChannelsSection activeChannelId={activeChannelId} />
              <ChannelsSection activeChannelId={activeChannelId} />
              <DirectMessagesSection activeChannelId={activeChannelId} />
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
            <div className="flex items-start gap-3 border-2 border-black bg-brutal-orange/20 p-3">
              <CircleAlert className="mt-0.5 size-[18px] shrink-0 text-black" />
              <p className="m-0 min-w-0 flex-1 text-sm leading-5 font-normal text-black">
                Archive "{archiveTarget}"? Members keep read access and history, but writes will be
                frozen and the channel will be hidden from sidebars. You can unarchive it later.
              </p>
            </div>
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
