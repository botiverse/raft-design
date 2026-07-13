import { useState } from "react";
import { Bookmark, MessageSquare, Play, SmilePlus } from "lucide-react";
import { Avatar, AvatarFallback, Badge, ContextMenu, ContextMenuTrigger } from "raft-ui";
import {
  MessageItem,
  MessageItemActive,
  MessageItemAttachments,
  MessageItemAvatarSlot,
  MessageItemBadge,
  MessageItemBadgeSeparator,
  MessageItemBody,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemEmbedded,
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
  MessageReactionChip,
  MessageReactionGlyph,
  MessageMultiSelect,
  MessageMultiSelectCheckbox,
  SystemMessageItem,
  SystemMessageItemContent,
  SystemMessageItemTime,
} from "raft-ui/wip";
import { MessageReactionComposition } from "./reaction.compositions.tsx";
import {
  MessageContextMenuComposition,
  type MessageTaskState,
} from "./context-menu.composition.tsx";
import {
  MessageFileAttachmentsComposition,
  MessageImageGalleryPairComposition,
  MessageVideoPreviewComposition,
} from "./media.compositions.tsx";
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

export function ImageGalleryMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>IM</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Image gallery</MessageItemSender>
          <MessageItemTime>3:01 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemAttachments>
          <MessageImageGalleryPairComposition />
        </MessageItemAttachments>
      </MessageItemContent>
    </MessageItem>
  );
}

export function VideoPreviewMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>VD</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Video preview</MessageItemSender>
          <MessageItemTime>3:02 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemAttachments>
          <MessageVideoPreviewComposition />
        </MessageItemAttachments>
      </MessageItemContent>
    </MessageItem>
  );
}

export function FileAttachmentMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>FL</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>File attachments</MessageItemSender>
          <MessageItemTime>3:03 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemAttachments>
          <MessageFileAttachmentsComposition />
        </MessageItemAttachments>
      </MessageItemContent>
    </MessageItem>
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

export function ThreadArchiveEventRow() {
  return (
    <SystemMessageItem>
      <SystemMessageItemTime>2:16 PM</SystemMessageItemTime>
      <SystemMessageItemContent>Atlas archived this thread.</SystemMessageItemContent>
    </SystemMessageItem>
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
          <MessageItemSenderState>removed</MessageItemSenderState>
          <MessageItemTime>Yesterday</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          This row covers removed human and deactivated agent badges.
        </MessageItemBody>
        <MessageItemNotice>
          Message is visible because it belongs to the archived thread.
        </MessageItemNotice>
      </MessageItemContent>
    </MessageItem>
  );
}

export function RichAttachmentMessageRow() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="sm" type="agent">
          <AvatarFallback>AP</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>App Planner</MessageItemSender>
          <MessageItemMeta>gpt-4.1</MessageItemMeta>
          <MessageItemTime>3:04 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          Here is the source parity pass for <strong>#222</strong>. Mention chip, channel link, task
          link, and markdown are rendered by the caller.
        </MessageItemBody>
        <MessageItemEmbedded>
          <MessageItemNotice>Forwarded from #release-notes by Ada.</MessageItemNotice>
        </MessageItemEmbedded>
        <MessageItemAttachments>
          <MessageImageGalleryPairComposition />
          <MessageVideoPreviewComposition />
          <MessageFileAttachmentsComposition />
        </MessageItemAttachments>
        <MessageItemFooter>
          <Badge variant="information" appearance="solid" uppercase={false}>
            <Play size={10} />
            <span>#222</span>
            <span>@Ada</span>
          </Badge>
          <MessageItemBadge status="unread">
            <MessageSquare />6 replies
            <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>3 new
          </MessageItemBadge>
          <MessageReactionComposition emoji="👍" count={5} reacted />
          <MessageReactionComposition emoji="👀" count={2} />
          <MessageReactionComposition emoji="🔥" count={1} failed />
          <MessageReactionChip aria-label="Add reaction" disabled>
            <MessageReactionGlyph>
              <SmilePlus />
            </MessageReactionGlyph>
          </MessageReactionChip>
        </MessageItemFooter>
      </MessageItemContent>
      <Toolbar />
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
