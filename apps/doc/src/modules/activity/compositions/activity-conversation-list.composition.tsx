import { AtSign, BellOff, Check, Hash, MessageSquare, Pencil } from "lucide-react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  Badge,
  Button,
  IconTile,
  InboxItem,
  InboxItemActions,
  InboxItemBody,
  InboxItemContent,
  InboxItemHeading,
  InboxItemHoverTarget,
  InboxItemLeading,
  InboxItemMarks,
  InboxItemSender,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrailing,
  InboxItemTrigger,
  SidebarItemCount,
  SidebarItemIndicator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@botiverse/raft-ui";
import { useCallback, useState } from "react";

type Conversation = {
  id: string;
  kind: "dm" | "channel" | "thread";
  title: string;
  initials?: string;
  sender?: string;
  preview: string;
  timestamp: string;
  unreadCount: number;
  mention?: boolean;
  muted?: boolean;
  draft?: boolean;
  task?: number;
};

const CONVERSATIONS: readonly Conversation[] = [
  {
    id: "dm:atlas",
    kind: "dm",
    title: "Atlas",
    initials: "A",
    preview: "The staging deploy is green. Want me to cut the release?",
    timestamp: "2m",
    unreadCount: 2,
  },
  {
    id: "thread:design",
    kind: "thread",
    title: "The activity card spacing is ready for a source-parity pass.",
    sender: "Mira",
    preview: "I kept the original border, spacing, and selected treatment.",
    timestamp: "14m",
    unreadCount: 3,
    mention: true,
    task: 21,
  },
  {
    id: "channel:launch",
    kind: "channel",
    title: "launch-week",
    sender: "Avery",
    preview: "Checklist is in the doc; two items left before Friday.",
    timestamp: "1h",
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
    unreadCount: 5,
    muted: true,
  },
];

/** One row per conversation: who or where, the latest line, and its marks. */
export function ActivityConversationListComposition() {
  const [activeId, setActiveId] = useState<string>();
  const [doneIds, setDoneIds] = useState<ReadonlySet<string>>(new Set());
  const conversations = CONVERSATIONS.filter((conversation) => !doneIds.has(conversation.id));
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
    <div className="flex w-full max-w-md flex-col gap-0.5">
      {conversations.map((conversation) => (
        <ConversationRow
          key={conversation.id}
          conversation={conversation}
          active={conversation.id === activeId}
          onOpen={setActiveId}
          onDone={handleDone}
        />
      ))}
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
  return (
    <InboxItem
      density="compact"
      active={active}
      data-unread={(conversation.unreadCount > 0 && !conversation.muted) || undefined}
    >
      <InboxItemTrigger
        aria-current={active || undefined}
        aria-label={`Open ${conversation.title}`}
        onClick={handleOpen}
      />
      <InboxItemLeading>
        {conversation.kind === "dm" ? (
          <Avatar size="md" type="agent">
            <AvatarFallback>{conversation.initials}</AvatarFallback>
            <AvatarBadge role="img" aria-label="Online" />
          </Avatar>
        ) : (
          <IconTile>{conversation.kind === "thread" ? <MessageSquare /> : <Hash />}</IconTile>
        )}
      </InboxItemLeading>
      <InboxItemContent>
        <InboxItemHeading>
          <InboxItemTitle>{conversation.title}</InboxItemTitle>
          {conversation.task ? <Badge variant="warning">#{conversation.task}</Badge> : null}
        </InboxItemHeading>
        <InboxItemBody>
          {conversation.sender ? <InboxItemSender>{conversation.sender}: </InboxItemSender> : null}
          {conversation.preview}
        </InboxItemBody>
      </InboxItemContent>
      <InboxItemTrailing>
        <InboxItemTimestamp>{conversation.timestamp}</InboxItemTimestamp>
        <InboxItemMarks>
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
        <InboxItemActions reveal="hover">
          <Button variant="outline" size="icon-md" aria-label="Mark as done" onClick={handleDone}>
            <Check aria-hidden />
          </Button>
        </InboxItemActions>
      </InboxItemTrailing>
    </InboxItem>
  );
}
