import { useState } from "react";
import { Bookmark, Download, Eye, MessageSquare, Play, SmilePlus } from "lucide-react";
import { Avatar, AvatarFallback, Badge, ContextMenu, ContextMenuTrigger, Spinner } from "raft-ui";
import {
  MessageImageGallery,
  MessageImageGalleryAction,
  MessageImageGalleryItem,
  MessageImageGalleryMedia,
  MessageImageGalleryOverlay,
  MessageImageGalleryPreview,
  MessageImageGalleryRow,
  MessageItem,
  MessageItemActive,
  MessageItemAttachments,
  MessageItemAvatarSlot,
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
  MessageItemToolbar,
  MessageItemToolbarButton,
  MessageItemUnreadBadge,
  MessageReactionChip,
  MessageReactionGlyph,
  MessageReactionPicker,
  MessageReactionQuickButton,
  MessageMultiSelect,
  MessageMultiSelectCheckbox,
  MessageVideoPreview,
  MessageVideoPreviewAction,
  MessageVideoPreviewFallback,
  MessageVideoPreviewFrame,
  SystemMessageItem,
  SystemMessageItemContent,
  SystemMessageItemTime,
} from "raft-ui/wip";
import {
  MESSAGE_QUICK_REACTIONS,
  MessageReactionComposition,
  MessageReactionTooltipComposition,
} from "./message-reaction-compositions.tsx";
import { MessageAttachmentReadyComposition } from "./message-attachment-compositions.tsx";
import {
  MessageContextMenuComposition,
  type MessageTaskState,
} from "./message-context-menu-composition.tsx";

export const IMAGE_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Crect width='640' height='420' fill='%23f4f0e8'/%3E%3Crect x='34' y='34' width='572' height='352' fill='%23f7d358' stroke='%23000' stroke-width='8'/%3E%3Ccircle cx='180' cy='168' r='72' fill='%23ff7ab6' stroke='%23000' stroke-width='8'/%3E%3Cpath d='M292 310 406 190l70 72 56-42 74 90z' fill='%23a3e8ff' stroke='%23000' stroke-width='8'/%3E%3C/svg%3E";

export function downloadMessageFixture(name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = IMAGE_SRC;
  link.click();
}

export function openMessageFixture() {
  window.open(IMAGE_SRC, "_blank", "noopener,noreferrer");
}

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
          <MessageItemSavedIndicator render={<button type="button" />}>
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
          <MessageItemSavedIndicator render={<button type="button" />}>
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
              <MessageItemUnreadBadge>
                <MessageSquare />4 replies
              </MessageItemUnreadBadge>
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
          <MessageImageGallery>
            <MessageImageGalleryRow className="grid-cols-2">
              <MessageImageGalleryItem>
                <MessageImageGalleryMedia src={IMAGE_SRC} alt="" className="aspect-[4/3]" />
                <MessageImageGalleryPreview
                  aria-label="Preview image"
                  onClick={openMessageFixture}
                />
                <MessageImageGalleryAction
                  aria-label="Download image"
                  onClick={() => downloadMessageFixture("message-image.svg")}
                >
                  <Download />
                </MessageImageGalleryAction>
              </MessageImageGalleryItem>
              <MessageImageGalleryItem aria-busy>
                <MessageImageGalleryMedia src={IMAGE_SRC} alt="" className="aspect-[4/3]" />
                <MessageImageGalleryOverlay>
                  <Spinner size="lg" className="text-white" />
                </MessageImageGalleryOverlay>
              </MessageImageGalleryItem>
            </MessageImageGalleryRow>
          </MessageImageGallery>
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
          <MessageVideoPreview title="demo-recording.mp4">
            <MessageVideoPreviewFrame>
              <MessageVideoPreviewFallback>
                <Play className="size-8 text-white/80" />
              </MessageVideoPreviewFallback>
              <MessageVideoPreviewAction
                aria-label="Open demo-recording.mp4 in preview"
                onClick={openMessageFixture}
              >
                <Eye />
              </MessageVideoPreviewAction>
            </MessageVideoPreviewFrame>
          </MessageVideoPreview>
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
          <div className="flex max-w-[22.5rem] flex-wrap items-start gap-2">
            <MessageAttachmentReadyComposition
              name="migration.diff"
              meta="Diff · 18 KB"
              summary="+42 -7"
              primaryAction={<Download />}
              primaryActionLabel="Download migration.diff"
              onPrimaryAction={() => downloadMessageFixture("migration.diff")}
            />
            <MessageAttachmentReadyComposition
              name="screening.html"
              meta="HTML preview · 44 KB"
              primaryAction={<Download />}
              primaryActionLabel="Download screening.html"
              onPrimaryAction={() => downloadMessageFixture("screening.html")}
            />
          </div>
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
          <MessageImageGallery>
            <MessageImageGalleryRow className="grid-cols-2">
              <MessageImageGalleryItem>
                <MessageImageGalleryMedia src={IMAGE_SRC} alt="" className="aspect-[4/3]" />
                <MessageImageGalleryPreview
                  aria-label="Preview image"
                  onClick={openMessageFixture}
                />
                <MessageImageGalleryAction
                  aria-label="Download image"
                  onClick={() => downloadMessageFixture("message-image.svg")}
                >
                  <Download />
                </MessageImageGalleryAction>
              </MessageImageGalleryItem>
              <MessageImageGalleryItem aria-busy>
                <MessageImageGalleryMedia src={IMAGE_SRC} alt="" className="aspect-[4/3]" />
                <MessageImageGalleryOverlay>
                  <Spinner size="lg" className="text-white" />
                </MessageImageGalleryOverlay>
              </MessageImageGalleryItem>
            </MessageImageGalleryRow>
          </MessageImageGallery>
          <MessageVideoPreview title="demo-recording.mp4">
            <MessageVideoPreviewFrame>
              <MessageVideoPreviewFallback>
                <Play className="size-8 text-white/80" />
              </MessageVideoPreviewFallback>
              <MessageVideoPreviewAction
                aria-label="Open demo-recording.mp4 in preview"
                onClick={openMessageFixture}
              >
                <Eye />
              </MessageVideoPreviewAction>
            </MessageVideoPreviewFrame>
          </MessageVideoPreview>
          <div className="flex max-w-[22.5rem] flex-wrap items-start gap-2">
            <MessageAttachmentReadyComposition
              name="migration.diff"
              meta="Diff · 18 KB"
              summary="+42 -7"
              primaryAction={<Download />}
              primaryActionLabel="Download migration.diff"
              onPrimaryAction={() => downloadMessageFixture("migration.diff")}
            />
            <MessageAttachmentReadyComposition
              name="screening.html"
              meta="HTML preview · 44 KB"
              primaryAction={<Download />}
              primaryActionLabel="Download screening.html"
              onPrimaryAction={() => downloadMessageFixture("screening.html")}
            />
          </div>
        </MessageItemAttachments>
        <MessageItemFooter>
          <Badge variant="information" appearance="solid" uppercase={false}>
            <Play size={10} />
            <span>#222</span>
            <span>@Ada</span>
          </Badge>
          <MessageItemUnreadBadge>
            <MessageSquare />6 replies
            <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>3 new
          </MessageItemUnreadBadge>
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

export function ReactionOverlays() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [selectedReaction, setSelectedReaction] = useState<string>();

  return (
    <div ref={setPortalContainer} className="relative flex flex-wrap items-start gap-4 px-2">
      <MessageReactionPicker>
        {MESSAGE_QUICK_REACTIONS.map((emoji) => (
          <MessageReactionQuickButton
            key={emoji}
            aria-label={`React with ${emoji}`}
            aria-pressed={selectedReaction === emoji}
            onClick={() => setSelectedReaction(emoji)}
          >
            <MessageReactionGlyph emoji={emoji} size={18} />
          </MessageReactionQuickButton>
        ))}
      </MessageReactionPicker>
      <MessageReactionTooltipComposition
        container={portalContainer}
        count={5}
        emoji="👍"
        names={["Atlas", "Ada Lovelace", "Grace Hopper", "Linus Torvalds", "Margaret Hamilton"]}
        open
      />
    </div>
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
  reactionActive = false,
  saved = false,
}: {
  forceVisible?: boolean;
  reactionActive?: boolean;
  saved?: boolean;
}) {
  const [isReactionActive, setIsReactionActive] = useState(reactionActive);

  return (
    <MessageItemToolbar visible={forceVisible}>
      <MessageItemToolbarButton aria-label="Reply in thread">
        <MessageSquare />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton
        active={isReactionActive}
        aria-pressed={isReactionActive}
        aria-label="Add Reaction"
        onClick={() => setIsReactionActive((active) => !active)}
      >
        <SmilePlus />
      </MessageItemToolbarButton>
      <MessageItemToolbarButton
        saved={saved}
        aria-label={saved ? "Remove from Saved" : "Save Message"}
        aria-pressed={saved}
        disabled
      >
        <Bookmark fill={saved ? "currentColor" : "none"} />
      </MessageItemToolbarButton>
    </MessageItemToolbar>
  );
}
