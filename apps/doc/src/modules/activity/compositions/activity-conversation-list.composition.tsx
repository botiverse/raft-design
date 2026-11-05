import { AtSign, BellOff, Check, Hash, Pencil } from "lucide-react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  Button,
  IconTile,
  InboxItem,
  InboxItemActions,
  InboxItemBody,
  InboxItemContent,
  InboxItemHeading,
  InboxItemHoverTarget,
  InboxItemLeading,
  InboxItemLine,
  InboxItemListHeading,
  InboxItemMarks,
  InboxItemSender,
  InboxItemStatus,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrigger,
  SidebarItemCount,
  SidebarItemIndicator,
  ThreadIcon,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@botiverse/raft-ui";
import { InboxItemLeadingBadge } from "@botiverse/raft-ui/wip";
import { useMediaQuery } from "foxact/use-media-query";
import { Fragment, useCallback, useState } from "react";

type Conversation = {
  id: string;
  kind: "dm" | "channel" | "thread";
  title: string;
  /** A thread's channel, named before the message: "#design · Mira: …". */
  channel?: string;
  initials?: string;
  sender?: string;
  preview: string;
  timestamp: string;
  /** The time in words, for the tooltip and for the row's name. */
  fullTime: string;
  /** An older row: its time shows only on hover or focus. */
  older?: boolean;
  unreadCount: number;
  mention?: boolean;
  muted?: boolean;
  draft?: boolean;
  /** A task's status, at the end of the second line. */
  taskStatus?: "in-progress";
};

const CONVERSATIONS: readonly Conversation[] = [
  {
    id: "dm:atlas",
    kind: "dm",
    title: "Atlas",
    initials: "A",
    preview: "The staging deploy is green. Want me to cut the release?",
    timestamp: "2m",
    fullTime: "2 minutes ago",
    unreadCount: 2,
  },
  {
    id: "thread:design",
    kind: "thread",
    title: "The activity card spacing is ready for a source-parity pass.",
    channel: "design",
    sender: "Mira",
    preview: "I kept the original border, spacing, and selected treatment.",
    timestamp: "14m",
    fullTime: "14 minutes ago",
    unreadCount: 3,
    mention: true,
    taskStatus: "in-progress",
  },
  {
    id: "channel:launch",
    kind: "channel",
    title: "launch-week",
    sender: "Avery",
    preview: "Checklist is in the doc; two items left before Friday.",
    timestamp: "1h",
    fullTime: "1 hour ago",
    unreadCount: 0,
    draft: true,
  },
  {
    id: "channel:vendor",
    kind: "channel",
    title: "vendor-review",
    sender: "Bugen",
    preview: "Quotes are in for the second vendor.",
    timestamp: "3h",
    fullTime: "3 hours ago",
    unreadCount: 5,
    muted: true,
  },
  {
    id: "channel:retro",
    kind: "channel",
    title: "retro-notes",
    sender: "Mira",
    preview: "Notes from the last retro are in the doc.",
    timestamp: "2:00 PM",
    fullTime: "Tuesday at 2:00 PM",
    older: true,
    unreadCount: 0,
  },
];

/**
 * One row per conversation under its day: who or where and the time, then the latest line and
 * its marks. An older row's time shows on hover or keyboard focus: hover retro-notes or Tab to it.
 */
export function ActivityConversationListComposition() {
  const [activeId, setActiveId] = useState<string>();
  const [doneIds, setDoneIds] = useState<ReadonlySet<string>>(new Set());
  const conversations = CONVERSATIONS.filter((conversation) => !doneIds.has(conversation.id));
  const groups = [
    { heading: "Today", conversations: conversations.filter((item) => !item.older) },
    { heading: "Tuesday, October 20", conversations: conversations.filter((item) => item.older) },
  ];
  const handleRestore = useCallback(() => setDoneIds(new Set()), []);
  const handleDone = useCallback((id: string) => setDoneIds((ids) => new Set(ids).add(id)), []);

  if (conversations.length === 0) {
    return (
      <Button variant="outline" onClick={handleRestore}>
        Restore to Active
      </Button>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-0.5 py-2">
      {groups.map((group) =>
        group.conversations.length > 0 ? (
          <Fragment key={group.heading}>
            <InboxItemListHeading>{group.heading}</InboxItemListHeading>
            {group.conversations.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === activeId}
                onOpen={setActiveId}
                onDone={handleDone}
              />
            ))}
          </Fragment>
        ) : null,
      )}
    </div>
  );
}

function ConversationRow({
  conversation,
  active,
  onOpen,
  onDone,
}: {
  conversation: Conversation;
  active: boolean;
  onOpen: (id: string) => void;
  onDone: (id: string) => void;
}) {
  const handleOpen = useCallback(() => onOpen(conversation.id), [conversation.id, onOpen]);
  const handleDone = useCallback(() => onDone(conversation.id), [conversation.id, onDone]);
  // Hover-revealed, the button is ghost. On a touch screen it is always there, so it is outlined.
  const coarsePointer = useMediaQuery("(pointer: coarse)", false);
  return (
    <InboxItem
      density="compact"
      active={active}
      data-unread={(conversation.unreadCount > 0 && !conversation.muted) || undefined}
    >
      <InboxItemTrigger
        aria-current={active || undefined}
        aria-label={`${
          conversation.channel
            ? `Open thread in #${conversation.channel}: ${conversation.title}`
            : `Open ${conversation.title}`
        }, ${conversation.fullTime}`}
        onClick={handleOpen}
      />
      <InboxItemLeading>
        {conversation.kind === "dm" ? (
          <Avatar size="md" type="agent">
            <AvatarFallback>{conversation.initials}</AvatarFallback>
            <AvatarBadge role="img" aria-label="Online" />
          </Avatar>
        ) : conversation.kind === "thread" ? (
          <>
            <IconTile>
              <ThreadIcon />
            </IconTile>
            <InboxItemLeadingBadge>
              <Hash />
            </InboxItemLeadingBadge>
          </>
        ) : (
          <IconTile>
            <Hash />
          </IconTile>
        )}
      </InboxItemLeading>
      <InboxItemContent>
        <InboxItemHeading>
          <InboxItemTitle>{conversation.title}</InboxItemTitle>
          <Tooltip>
            <TooltipTrigger
              render={
                <InboxItemTimestamp reveal={conversation.older ? "hover" : undefined} aria-hidden />
              }
            >
              {conversation.timestamp}
            </TooltipTrigger>
            <TooltipContent>{conversation.fullTime}</TooltipContent>
          </Tooltip>
        </InboxItemHeading>
        <InboxItemLine>
          <InboxItemBody>
            {conversation.channel ? `#${conversation.channel} · ` : null}
            {conversation.sender ? (
              <InboxItemSender>{conversation.sender}: </InboxItemSender>
            ) : null}
            {conversation.preview}
          </InboxItemBody>
          <InboxItemMarks>
            {conversation.taskStatus ? (
              <InboxItemStatus status={conversation.taskStatus}>In progress</InboxItemStatus>
            ) : null}
            {conversation.draft ? <Pencil aria-label="Draft" size={12} /> : null}
            {conversation.mention && conversation.unreadCount > 0 ? (
              <Tooltip>
                <TooltipTrigger
                  render={<InboxItemHoverTarget render={<SidebarItemIndicator />} />}
                  aria-label="Mentioned you"
                >
                  <AtSign aria-hidden />
                </TooltipTrigger>
                <TooltipContent>Someone mentioned you here</TooltipContent>
              </Tooltip>
            ) : null}
            {conversation.muted ? (
              <BellOff aria-label="Muted" size={14} />
            ) : conversation.unreadCount > 0 ? (
              <SidebarItemCount>{conversation.unreadCount}</SidebarItemCount>
            ) : null}
          </InboxItemMarks>
        </InboxItemLine>
        <InboxItemActions reveal="hover">
          <Button
            variant={coarsePointer ? "outline" : "ghost"}
            size="icon-md"
            aria-label="Mark as Done"
            onClick={handleDone}
          >
            <Check aria-hidden />
          </Button>
        </InboxItemActions>
      </InboxItemContent>
    </InboxItem>
  );
}
