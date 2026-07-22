import { useState } from "react";
import { Bookmark, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, ContextMenu, ContextMenuTrigger } from "raft-ui";
import {
  MessageItem,
  MessageItemActive,
  MessageItemAvatarSlot,
  MessageItemBadge,
  MessageItemBody,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemFooter,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemInlineStatus,
  MessageItemMeta,
  MessageItemNotice,
  MessageItemSavedIndicator,
  MessageItemSearchMatch,
  MessageItemSelection,
  MessageItemSender,
  MessageItemSenderState,
  MessageItemTime,
  MessageMultiSelect,
  MessageMultiSelectCheckbox,
} from "raft-ui/wip";
import { MessageReactionComposition } from "./reaction.compositions.tsx";
import {
  MessageContextMenuComposition,
  type MessageTaskState,
} from "./context-menu.composition.tsx";
import { MessageRowToolbarFixture } from "./row-toolbar.composition.tsx";

export function AuthoredMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Atlas</MessageItemSender>
          <MessageItemMeta>claude-opus</MessageItemMeta>
          <MessageItemTime>2:14 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          Shipped the token fixture pass. The markdown renderer, mentions, and links stay outside
          this component.
        </MessageItemBody>
        <MessageItemFooter>
          <MessageItemSavedIndicator>
            <Bookmark fill="currentColor" />
            <span>Saved</span>
          </MessageItemSavedIndicator>
          <MessageReactionComposition emoji="👍" count={3} reacted />
          <MessageReactionComposition emoji="🔥" count={1} />
        </MessageItemFooter>
      </MessageItemContent>
      <Toolbar saved />
    </MessageItem>
  );
}

export function SavedToolbarMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>TB</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Toolbar row</MessageItemSender>
          <MessageItemTime>2:18 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          Saved state stays in the footer while the hover toolbar exposes the same action.
        </MessageItemBody>
        <MessageItemFooter>
          <MessageItemSavedIndicator>
            <Bookmark fill="currentColor" />
            <span>Saved</span>
          </MessageItemSavedIndicator>
        </MessageItemFooter>
      </MessageItemContent>
      <Toolbar forceVisible saved />
    </MessageItem>
  );
}

export function ContextMenuMessageRow() {
  const [followed, setFollowed] = useState(false);
  const [lastAction, setLastAction] = useState("Right-click for message actions");
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [reaction, setReaction] = useState("✅");
  const [saved, setSaved] = useState(false);
  const [task, setTask] = useState<MessageTaskState>("none");

  return (
    <div ref={setPortalContainer} className="relative w-full">
      <ContextMenu>
        <ContextMenuTrigger render={<MessageItemActive />}>
          <MessageItemAvatarSlot>
            <Avatar size="sm" type="agent">
              <AvatarFallback>AT</AvatarFallback>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Atlas</MessageItemSender>
              <MessageItemMeta>#design-system</MessageItemMeta>
              <MessageItemTime>2:14 PM</MessageItemTime>
              <MessageItemInlineStatus>{lastAction}</MessageItemInlineStatus>
            </MessageItemHeader>
            <MessageItemBody>Right-click opens the shared ContextMenu composition.</MessageItemBody>
            <MessageItemFooter>
              <MessageItemBadge status="unread">
                <MessageSquare />4 replies
              </MessageItemBadge>
              <MessageReactionComposition emoji={reaction} count={2} reacted />
            </MessageItemFooter>
          </MessageItemContent>
          <Toolbar />
        </ContextMenuTrigger>
        <MessageContextMenuComposition
          followed={followed}
          onCopyLink={() => {
            void navigator.clipboard?.writeText(window.location.href);
            setLastAction("Link copied");
          }}
          onCopyMarkdown={() => {
            void navigator.clipboard?.writeText(
              "Right-click opens the shared ContextMenu composition.",
            );
            setLastAction("Markdown copied");
          }}
          onFollowChange={(nextFollowed) => {
            setFollowed(nextFollowed);
            setLastAction(nextFollowed ? "Thread followed" : "Thread unfollowed");
          }}
          onOpenThread={() => setLastAction("Thread opened")}
          onQuickReact={(emoji) => {
            setReaction(emoji);
            setLastAction(`Reacted with ${emoji}`);
          }}
          onSavedChange={(nextSaved) => {
            setSaved(nextSaved);
            setLastAction(nextSaved ? "Message saved" : "Message removed from saved");
          }}
          onTaskChange={(nextTask) => {
            setTask(nextTask);
            setLastAction(nextTask === "done" ? "Task completed" : "Task opened");
          }}
          portalContainer={portalContainer}
          saved={saved}
          task={task}
        />
      </ContextMenu>
    </div>
  );
}

export function InteractiveStateRows() {
  return (
    <div className="flex w-full flex-col gap-2">
      <SelectedMessageRow />
      <ActiveMessageRow />
      <SearchMatchMessageRow />
    </div>
  );
}

export function ConsecutiveMessageRow() {
  return (
    <MessageItem compact>
      <MessageItemGutter>
        <MessageItemContinuationTime>2:15</MessageItemContinuationTime>
      </MessageItemGutter>
      <MessageItemContent>
        <MessageItemBody>
          Consecutive rows keep the gutter timestamp and hide sender chrome.
        </MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

export function RemovedSenderMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="human">
          <AvatarFallback>MX</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Mx. Chen</MessageItemSender>
          <MessageItemSenderState>Removed</MessageItemSenderState>
          <MessageItemTime>Yesterday</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          This history row remains visible after a member was removed.
        </MessageItemBody>
        <MessageItemNotice>
          Message is visible because it belongs to the archived thread.
        </MessageItemNotice>
      </MessageItemContent>
    </MessageItem>
  );
}

export function LeftSenderMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="human">
          <AvatarFallback>NO</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Noah</MessageItemSender>
          <MessageItemSenderState>Left</MessageItemSenderState>
          <MessageItemTime>Monday</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>This history row remains visible after a member left.</MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

export function DeactivatedAgentMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent" className="grayscale opacity-60">
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Atlas</MessageItemSender>
          <MessageItemSenderState>Deleted</MessageItemSenderState>
          <MessageItemTime>Last week</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          This history row remains visible after an agent was deleted.
        </MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

export function ConvertingMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Atlas</MessageItemSender>
          <MessageItemMeta>claude-opus</MessageItemMeta>
          <MessageItemTime>2:21 PM</MessageItemTime>
          <MessageItemInlineStatus>Converting…</MessageItemInlineStatus>
        </MessageItemHeader>
        <MessageItemBody>Converting the selected message into a task.</MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}

export function SelectedMessageRow() {
  return (
    <MessageMultiSelect defaultActive defaultSelected={new Set(["selected-row"])}>
      <MessageItemSelection>
        <MessageMultiSelectCheckbox value="selected-row" aria-label="Select message" />
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Selected row</MessageItemSender>
            <MessageItemTime>3:18 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Selection is represented by a real checkbox.</MessageItemBody>
        </MessageItemContent>
      </MessageItemSelection>
    </MessageMultiSelect>
  );
}

export function ActiveMessageRow() {
  return (
    <MessageItemActive>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>AC</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Active anchor</MessageItemSender>
          <MessageItemTime>3:19 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Used for menu anchor, current row, or permalink focus.</MessageItemBody>
      </MessageItemContent>
    </MessageItemActive>
  );
}

export function SearchMatchMessageRow() {
  return (
    <MessageItemSearchMatch>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>SR</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Search result</MessageItemSender>
          <MessageItemTime>3:20 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Search jump highlight keeps the cyan source treatment.</MessageItemBody>
      </MessageItemContent>
    </MessageItemSearchMatch>
  );
}

function Toolbar({
  forceVisible = false,
  saved = false,
}: {
  forceVisible?: boolean;
  saved?: boolean;
}) {
  return <MessageRowToolbarFixture saved={saved} visible={forceVisible} />;
}
