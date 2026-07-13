import { useId, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bookmark, MessageSquare } from "lucide-react";
import { ContextMenu, ContextMenuTrigger } from "raft-ui";
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
  MessageMultiSelectCheckbox,
  MessageReactionCount,
  useMessageMultiSelect,
} from "raft-ui/wip";

import {
  MessageContextMenuComposition,
  type MessageTaskState,
} from "#/modules/message-item/compositions/context-menu.composition.tsx";
import { MessageRowToolbar } from "#/modules/message-item/compositions/row-toolbar.composition.tsx";
import { MessageReactionGlyphComposition } from "#/modules/message-item/compositions/reaction-glyph.composition.tsx";
import {
  PlaygroundMessageAvatar,
  type PlaygroundAgentStatus,
  type PlaygroundAvatarVariant,
} from "./playground-message-avatar.tsx";
import { usePlaygroundSingleComposerMentionTarget } from "./playground-composer-mentions.tsx";
import {
  getPlaygroundActor,
  getPlaygroundThread,
  requirePlaygroundThread,
  type PlaygroundActorId,
  type PlaygroundMessage,
  type PlaygroundMessageId,
  type PlaygroundThreadId,
} from "./mock/index.ts";
import {
  usePlaygroundMessageWorkflow,
  usePlaygroundThreadFollow,
} from "./playground-message-workflow-state.tsx";

export type RowVariant = PlaygroundAvatarVariant;

function PlaygroundMessageSender({
  sender,
  mentionHandle,
}: {
  sender: string;
  mentionHandle: PlaygroundActorId;
}) {
  const mentionTarget = usePlaygroundSingleComposerMentionTarget();
  if (!mentionTarget) {
    return <MessageItemSender>{sender}</MessageItemSender>;
  }
  return (
    <MessageItemSender
      render={
        <button
          type="button"
          className="cursor-pointer hover:underline hover:decoration-2 hover:underline-offset-2"
          title={`Mention @${mentionHandle}`}
          onClick={() => mentionTarget.insertMention(mentionHandle)}
        />
      }
    >
      {sender}
    </MessageItemSender>
  );
}

export type PlaygroundMessageRowProps = {
  message: PlaygroundMessage;
  searchMatch?: boolean;
  attachments?: ReactNode;
  footer?: ReactNode;
  threadId?: PlaygroundThreadId;
};

export function PlaygroundMessageRow({
  message,
  searchMatch = false,
  attachments,
  footer,
  threadId,
}: PlaygroundMessageRowProps) {
  return (
    <MessageRowView
      actorId={message.authorId}
      attachments={attachments}
      body={message.body}
      footer={footer}
      rowState={searchMatch ? "search-match" : undefined}
      selectId={message.id}
      time={message.time}
      threadId={threadId}
    />
  );
}

export type PlaygroundScenarioMessageRowProps = {
  actorId?: PlaygroundActorId;
  variant?: RowVariant;
  sender?: string;
  meta?: string;
  status?: PlaygroundAgentStatus;
  body?: ReactNode;
  footer?: ReactNode;
  attachments?: ReactNode;
  senderState?: string;
  inlineStatus?: string;
  compact?: boolean;
  gutterTime?: string;
  deactivated?: boolean;
  saved?: boolean;
  followed?: boolean;
  task?: MessageTaskState;
  rowState?: "active" | "search-match";
  selectId?: string;
  threadId?: PlaygroundThreadId;
  time?: string;
};

export function PlaygroundScenarioMessageRow({
  actorId,
  variant,
  selectId,
  ...props
}: PlaygroundScenarioMessageRowProps) {
  const generatedId = useId();
  return (
    <MessageRowView
      actorId={actorId ?? (variant === "agent" ? "atlas" : "developer")}
      selectId={`scenario:${selectId ?? generatedId}`}
      {...props}
    />
  );
}

function MessageRowView({
  actorId,
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
  actorId: PlaygroundActorId;
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
  selectId: PlaygroundMessageId;
  threadId?: PlaygroundThreadId;
}) {
  const actor = getPlaygroundActor(actorId);
  const resolvedSender = sender ?? actor.name;
  const resolvedMeta = meta ?? actor.meta;
  const selection = useMessageMultiSelect();
  const rowSelectId = selectId;
  const selectMode = selection?.active ?? false;
  const [menuOpen, setMenuOpen] = useState(false);
  const { workflow, update: updateWorkflow } = usePlaygroundMessageWorkflow(
    rowSelectId,
    useMemo(() => ({ saved: Boolean(saved), task: task ?? "none" }), [saved, task]),
  );
  const { followed: isFollowed, setFollowed } = usePlaygroundThreadFollow(
    threadId,
    Boolean(followed),
  );
  const isSaved = workflow.saved;
  const taskState = workflow.task;
  const lastReaction = workflow.reactions.at(-1) ?? null;
  const [threadRequested, setThreadRequested] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const threadContext = threadId ? getPlaygroundThread(threadId) : undefined;
  const markdownText = typeof body === "string" ? body : "Composed message content";

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
    <ItemRoot compact={compact}>
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
          actorId={actorId}
          status={status ?? actor.presence ?? "offline"}
          deactivated={deactivated}
        />
      )}
      <MessageItemContent>
        {!compact ? (
          <MessageItemHeader>
            {resolvedSender ? (
              deactivated || senderState ? (
                <MessageItemSender>{resolvedSender}</MessageItemSender>
              ) : (
                <PlaygroundMessageSender sender={resolvedSender} mentionHandle={actorId} />
              )
            ) : null}
            {senderState ? <MessageItemSenderState>{senderState}</MessageItemSenderState> : null}
            {resolvedMeta ? (
              <MessageItemMeta title={resolvedMeta}>{resolvedMeta}</MessageItemMeta>
            ) : null}
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
                render={
                  <button
                    type="button"
                    onClick={() => updateWorkflow((current) => ({ ...current, saved: false }))}
                  />
                }
              >
                <Bookmark fill="currentColor" />
                <span>Saved</span>
              </MessageItemSavedIndicator>
            ) : null}
            {lastReaction ? (
              <MessageReactionChip
                aria-label={`${lastReaction} 1`}
                aria-pressed
                onClick={() => updateWorkflow((current) => ({ ...current, reactions: [] }))}
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
        onReplyInThread={requestThread}
        portalContainer={portalContainer}
        onReact={(emoji) => updateWorkflow((current) => ({ ...current, reactions: [emoji] }))}
        onSavedChange={(next) => updateWorkflow((current) => ({ ...current, saved: next }))}
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
          onFollowChange={threadContext ? setFollowed : undefined}
          onQuickReact={(emoji) => {
            updateWorkflow((current) => ({ ...current, reactions: [emoji] }));
            setMenuOpen(false);
          }}
          onSavedChange={(next) => updateWorkflow((current) => ({ ...current, saved: next }))}
          onTaskChange={(next) => updateWorkflow((current) => ({ ...current, task: next }))}
          onSelectMessage={selection ? () => selection.enter(rowSelectId) : undefined}
          onOpenThread={requestThread}
        />
      </ContextMenu>
    </div>
  );
}

// Thin Playground wrapper over the canonical toolbar. Product workflow callbacks
// stay keyed to the message while transient picker state remains in the composition.
function RowToolbar({
  saved,
  portalContainer,
  onReact,
  onReplyInThread,
  onSavedChange,
}: {
  saved?: boolean;
  portalContainer: HTMLElement | null;
  onReact: (emoji: string) => void;
  onReplyInThread?: () => void;
  onSavedChange: (saved: boolean) => void;
}) {
  return (
    <MessageRowToolbar
      saved={saved}
      portalContainer={portalContainer}
      onReact={onReact}
      onReplyInThread={onReplyInThread}
      onSavedChange={onSavedChange}
    />
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
