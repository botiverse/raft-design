import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bookmark, MessageSquare, SmilePlus } from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "raft-ui";
import {
  MessageItem,
  MessageItemActive,
  MessageItemAttachments,
  MessageItemBadge,
  MessageItemBadgeSeparator,
  MessageItemBody,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemFooter,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemInlineStatus,
  MessageItemMeta,
  MessageReactionChip,
  MessageItemSavedIndicator,
  MessageItemSearchMatch,
  MessageItemSelection,
  MessageItemSender,
  MessageItemSenderState,
  MessageItemTime,
  MessageItemToolbar,
  MessageItemToolbarButton,
  MessageMultiSelectCheckbox,
  MessageReactionCount,
  MessageReactionPickerContent,
  MessageReactionQuickButton,
  useMessageMultiSelect,
} from "raft-ui/wip";

import {
  MessageContextMenuComposition,
  type MessageTaskState,
} from "#/compositions/message-item/message-context-menu-composition.tsx";
import { MESSAGE_QUICK_REACTIONS } from "#/compositions/message-item/message-reaction-compositions.tsx";
import { MessageReactionGlyphComposition } from "#/compositions/message-item/message-reaction-glyph-composition.tsx";
import {
  PlaygroundMessageAvatar,
  type PlaygroundAgentStatus,
  type PlaygroundAvatarVariant,
} from "./playground-message-avatar.tsx";
import { emitPlaygroundComposerMention } from "./playground-composer-events.ts";
import { requirePlaygroundThread, type PlaygroundThreadId } from "./mock/index.ts";

export type RowVariant = PlaygroundAvatarVariant;
export function PlaygroundMessageRow({
  variant = "agent",
  sender,
  meta,
  time,
  body,
  footer,
  attachments,
  senderState,
  inlineStatus,
  compact,
  gutterTime,
  status,
  deactivated,
  saved,
  followed,
  task = "none",
  rowState,
  selectId,
  threadId,
}: {
  variant?: RowVariant;
  sender?: string;
  meta?: string;
  time?: string;
  body?: ReactNode;
  footer?: ReactNode;
  attachments?: ReactNode;
  senderState?: string;
  inlineStatus?: string;
  compact?: boolean;
  /** Continuation-row hover gutter clock — 24h `HH:MM`, no AM/PM (matches source `formatClock24`). */
  gutterTime?: string;
  status?: PlaygroundAgentStatus;
  deactivated?: boolean;
  saved?: boolean;
  followed?: boolean;
  task?: MessageTaskState;
  rowState?: "active" | "search-match";
  selectId?: string;
  threadId?: PlaygroundThreadId;
}) {
  const selection = useMessageMultiSelect();
  // Every row inside a MessageMultiSelect is selectable; an explicit selectId
  // is optional (the demo passes stable ids to a couple of rows), otherwise a
  // stable per-row id is generated so the menu's "Select Message" always wires up.
  const generatedSelectId = useId();
  const rowSelectId = selectId ?? generatedSelectId;
  const selectMode = selection?.active ?? false;
  const [menuOpen, setMenuOpen] = useState(false);
  const [reactionOpen, setReactionOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean(saved));
  const [isFollowed, setIsFollowed] = useState(Boolean(followed));
  const [taskState, setTaskState] = useState<MessageTaskState>(task);
  const [lastReaction, setLastReaction] = useState<string | null>(null);
  const [threadRequested, setThreadRequested] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const reactionCloseTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const threadContext = threadId ? requirePlaygroundThread(threadId) : undefined;
  const markdownText = typeof body === "string" ? body : "Composed message content";

  const clearReactionCloseTimer = useCallback(() => {
    if (reactionCloseTimerRef.current === null) return;
    window.clearTimeout(reactionCloseTimerRef.current);
    reactionCloseTimerRef.current = null;
  }, []);

  const scheduleReactionClose = useCallback(() => {
    if (!reactionOpen) return;
    clearReactionCloseTimer();
    reactionCloseTimerRef.current = window.setTimeout(() => {
      setReactionOpen(false);
      reactionCloseTimerRef.current = null;
    }, 120);
  }, [clearReactionCloseTimer, reactionOpen]);

  const handleReactionOpenChange = useCallback(
    (open: boolean) => {
      if (!open) clearReactionCloseTimer();
      setReactionOpen(open);
    },
    [clearReactionCloseTimer],
  );

  useEffect(() => () => clearReactionCloseTimer(), [clearReactionCloseTimer]);

  useEffect(() => {
    if (!reactionOpen) return;
    const close = () => handleReactionOpenChange(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [handleReactionOpenChange, reactionOpen]);

  const effectiveRowState = selectMode ? "select" : (rowState ?? (menuOpen ? "active" : undefined));
  const ItemRoot =
    effectiveRowState === "active"
      ? MessageItemActive
      : effectiveRowState === "search-match"
        ? MessageItemSearchMatch
        : effectiveRowState === "select"
          ? MessageItemSelection
          : MessageItem;

  const openThread =
    threadId && threadContext
      ? () => {
          void navigate({
            to: "/playground/$channelId",
            params: { channelId: threadContext.channelId },
            search: { thread: threadId },
          });
        }
      : undefined;
  const requestThread = openThread ?? (() => setThreadRequested(true));

  const messageItem = (
    <ItemRoot
      compact={compact}
      onMouseEnter={clearReactionCloseTimer}
      onMouseLeave={scheduleReactionClose}
    >
      {selectMode ? (
        <MessageMultiSelectCheckbox value={rowSelectId} aria-label="Select message" />
      ) : null}
      {compact ? (
        <MessageItemGutter>
          {gutterTime ? (
            <MessageItemContinuationTime>{gutterTime}</MessageItemContinuationTime>
          ) : null}
        </MessageItemGutter>
      ) : (
        <PlaygroundMessageAvatar
          variant={variant}
          status={status}
          deactivated={deactivated}
          sender={sender}
          meta={meta}
        />
      )}
      <MessageItemContent>
        {!compact ? (
          <MessageItemHeader>
            {sender ? (
              deactivated || senderState ? (
                <MessageItemSender>{sender}</MessageItemSender>
              ) : (
                <MessageItemSender
                  render={
                    <button
                      type="button"
                      className="cursor-pointer hover:underline hover:decoration-2 hover:underline-offset-2"
                      title={`Mention @${sender}`}
                      onClick={() => emitPlaygroundComposerMention(sender)}
                    />
                  }
                >
                  {sender}
                </MessageItemSender>
              )
            ) : null}
            {senderState ? <MessageItemSenderState>{senderState}</MessageItemSenderState> : null}
            {meta ? <MessageItemMeta title={meta}>{meta}</MessageItemMeta> : null}
            {time ? <MessageItemTime>{time}</MessageItemTime> : null}
            {inlineStatus ? (
              <MessageItemInlineStatus>{inlineStatus}</MessageItemInlineStatus>
            ) : null}
          </MessageItemHeader>
        ) : null}
        {body ? <MessageItemBody>{body}</MessageItemBody> : null}
        {attachments ? <MessageItemAttachments>{attachments}</MessageItemAttachments> : null}
        {footer || lastReaction || isSaved ? (
          <MessageItemFooter>
            {footer}
            {isSaved ? (
              <MessageItemSavedIndicator
                aria-label="Remove from Saved"
                render={<button type="button" onClick={() => setIsSaved(false)} />}
              >
                <Bookmark fill="currentColor" />
                <span>Saved</span>
              </MessageItemSavedIndicator>
            ) : null}
            {lastReaction ? (
              <MessageReactionChip
                aria-label={`${lastReaction} 1`}
                aria-pressed
                onClick={() => setLastReaction(null)}
              >
                <MessageReactionGlyphComposition emoji={lastReaction} />
                <MessageReactionCount>1</MessageReactionCount>
              </MessageReactionChip>
            ) : null}
          </MessageItemFooter>
        ) : null}
      </MessageItemContent>
      <RowToolbar
        saved={isSaved}
        threadId={threadId}
        onReplyInThread={requestThread}
        reactionOpen={reactionOpen}
        portalContainer={portalContainer}
        onReact={setLastReaction}
        onReactionOpenChange={handleReactionOpenChange}
        onReactionPickerEnter={clearReactionCloseTimer}
        onReactionPickerLeave={scheduleReactionClose}
        onSavedChange={setIsSaved}
      />
      {threadRequested ? (
        <span className="sr-only" role="status">
          Thread composer opened
        </span>
      ) : null}
    </ItemRoot>
  );

  // Select mode disables the right-click menu (source parity), so the row skips
  // the ContextMenu wrapper entirely.
  if (selectMode) {
    return (
      <div className="px-3" style={{ contain: "layout style", overflow: "clip visible" }}>
        {messageItem}
      </div>
    );
  }

  return (
    <div
      ref={setPortalContainer}
      className="px-3"
      style={{ contain: "layout style", overflow: "clip visible" }}
    >
      <ContextMenu
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          if (open) setReactionOpen(false);
        }}
      >
        <ContextMenuTrigger render={messageItem} />
        <MessageContextMenuComposition
          saved={isSaved}
          followed={isFollowed}
          task={taskState}
          portalContainer={portalContainer}
          onCopyLink={() => void navigator.clipboard?.writeText(window.location.href)}
          onCopyMarkdown={() => void navigator.clipboard?.writeText(markdownText)}
          onFollowChange={threadContext ? setIsFollowed : undefined}
          onQuickReact={(emoji) => {
            setLastReaction(emoji);
            setMenuOpen(false);
          }}
          onSavedChange={setIsSaved}
          onTaskChange={setTaskState}
          onSelectMessage={selection ? () => selection.enter(rowSelectId) : undefined}
          onOpenThread={requestThread}
        />
      </ContextMenu>
    </div>
  );
}

// Hover-toolbar reaction flyout. Source opens the quick-reaction row on click of
// the React button and hand-positions it (buggy x/y); here the row is anchored
// by Base UI's menu positioner (click-to-open trigger, automatic flip/collision)
// while MessageReactionPickerContent + MessageReactionQuickButton keep the source
// picker chrome and per-emoji hover tint pixel-identical.
function RowToolbar({
  saved,
  threadId,
  reactionOpen,
  portalContainer,
  onReact,
  onReplyInThread,
  onReactionOpenChange,
  onReactionPickerEnter,
  onReactionPickerLeave,
  onSavedChange,
}: {
  saved?: boolean;
  threadId?: PlaygroundThreadId;
  reactionOpen: boolean;
  portalContainer: HTMLElement | null;
  onReact: (emoji: string) => void;
  onReplyInThread?: () => void;
  onReactionOpenChange: (open: boolean) => void;
  onReactionPickerEnter: () => void;
  onReactionPickerLeave: () => void;
  onSavedChange: (saved: boolean) => void;
}) {
  const threadContext = threadId ? requirePlaygroundThread(threadId) : undefined;

  return (
    <MessageItemToolbar>
      {threadContext ? (
        <MessageItemToolbarButton
          aria-label="Reply in thread"
          render={
            <Link
              to="/playground/$channelId"
              params={{ channelId: threadContext.channelId }}
              search={{ thread: threadId }}
            />
          }
        >
          <MessageSquare />
        </MessageItemToolbarButton>
      ) : (
        <MessageItemToolbarButton aria-label="Reply in thread" onClick={onReplyInThread}>
          <MessageSquare />
        </MessageItemToolbarButton>
      )}
      <DropdownMenu open={reactionOpen} onOpenChange={onReactionOpenChange}>
        <DropdownMenuTrigger
          render={
            <MessageItemToolbarButton
              active={reactionOpen}
              aria-pressed={reactionOpen}
              aria-label="Add reaction"
            >
              <SmilePlus />
            </MessageItemToolbarButton>
          }
        />
        <MessageReactionPickerContent
          side="bottom"
          align="end"
          sideOffset={4}
          collisionAvoidance={{ side: "flip", align: "flip" }}
          collisionPadding={8}
          portalProps={{ container: portalContainer }}
          onMouseEnter={onReactionPickerEnter}
          onMouseLeave={onReactionPickerLeave}
        >
          {MESSAGE_QUICK_REACTIONS.map((emoji) => (
            <DropdownMenuItem
              key={emoji}
              className="[[data-theme=brutal]_&]:!size-7 [[data-theme=brutal]_&]:!w-7 [[data-theme=brutal]_&]:!p-0"
              render={
                <MessageReactionQuickButton
                  title={`React with ${emoji}`}
                  aria-label={`React with ${emoji}`}
                />
              }
              onClick={() => {
                onReact(emoji);
                onReactionOpenChange(false);
              }}
            >
              <MessageReactionGlyphComposition emoji={emoji} size={18} />
            </DropdownMenuItem>
          ))}
        </MessageReactionPickerContent>
      </DropdownMenu>
      <MessageItemToolbarButton
        saved={saved}
        aria-pressed={saved}
        aria-label={saved ? "Remove from Saved" : "Save message"}
        onClick={() => onSavedChange(!saved)}
      >
        <Bookmark fill={saved ? "currentColor" : "none"} />
      </MessageItemToolbarButton>
    </MessageItemToolbar>
  );
}

// Plain reply badge for a read thread.
export function PlaygroundRepliesBadge({ threadId }: { threadId: PlaygroundThreadId }) {
  const { channelId, thread } = requirePlaygroundThread(threadId);

  return (
    <MessageItemBadge
      className="cursor-pointer"
      render={
        <Link to="/playground/$channelId" params={{ channelId }} search={{ thread: threadId }} />
      }
    >
      <MessageSquare />
      {thread.replies.length === 1 ? "1 reply" : `${thread.replies.length} replies`}
    </MessageItemBadge>
  );
}

// Source ThreadRepliesBadge: one default pill with reply count + "· N new".
export function PlaygroundUnreadRepliesBadge({ threadId }: { threadId: PlaygroundThreadId }) {
  const { channelId, thread } = requirePlaygroundThread(threadId);
  if (!thread.unreadCount) {
    throw new Error(`Unread thread badge requires unread replies: ${threadId}`);
  }

  return (
    <MessageItemBadge
      status="unread"
      className="cursor-pointer"
      render={
        <Link to="/playground/$channelId" params={{ channelId }} search={{ thread: threadId }} />
      }
    >
      <MessageSquare />
      {thread.replies.length === 1 ? "1 reply" : `${thread.replies.length} replies`}
      <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>
      <span>{thread.unreadCount} new</span>
    </MessageItemBadge>
  );
}
