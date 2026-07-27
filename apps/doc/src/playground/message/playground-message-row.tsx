import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Bookmark, Download, ExternalLink, Languages, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, ContextMenu, ContextMenuTrigger } from "raft-ui";
import {
  MessageItem,
  MessageItemActive,
  MessageItemAttachments,
  MessageItemBadge,
  MessageItemBody,
  MessageItemCollapsibleContent,
  MessageItemCollapsibleContentPanel,
  MessageItemCollapsibleContentTrigger,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemFooter,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemInlineStatus,
  MessageItemInteractionBoundary,
  MessageItemMeta,
  MessageReactionChip,
  MessageItemSavedIndicator,
  MessageItemSearchMatch,
  MessageItemSelection,
  MessageItemSender,
  MessageItemSenderState,
  MessageItemTime,
  MessageItemThreadRepliesPreview,
  MessageItemTranslationAction,
  MessageItemTranslationOriginal,
  MessageItemTranslationOriginalLabel,
  MessageItemTranslationPlaceholder,
  MessageItemTranslationStatus,
  MessageMultiSelectCheckbox,
  MessageReactionCount,
  useMessageMultiSelect,
} from "raft-ui/wip";

import {
  MessageContextMenuComposition,
  type MessageTaskState,
} from "#/modules/message-item/compositions/context-menu.composition.tsx";
import { MessageAttachmentReadyComposition } from "#/modules/message-attachment/compositions/attachment.compositions.tsx";
import { ActionCardFixtureSurface } from "#/modules/message-action-card/compositions/action-card-message.composition.tsx";
import { ACTION_CARD_FIXTURES } from "#/modules/message-action-card/message-action-card.fixtures.ts";
import { ForwardedBundleEmbeddedComposition } from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx";
import { QuotedPreviewEmbeddedComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-message.composition.tsx";
import { MessageMobileReactionAdd } from "#/modules/message-item/compositions/item-preview.composition.tsx";
import { PlaygroundConversationLink } from "../navigation/conversation-link.tsx";
import { MessageRowToolbar } from "#/modules/message-item/compositions/row-toolbar.composition.tsx";
import { MessageReactionGlyphComposition } from "#/modules/message-item/compositions/reaction-glyph.composition.tsx";
import {
  PlaygroundMessageAvatar,
  type PlaygroundAgentStatus,
  type PlaygroundAvatarVariant,
} from "./playground-message-avatar.tsx";
import { PlaygroundMessageBody } from "./playground-message-body.tsx";
import { playgroundGutterClock } from "./playground-message-time.ts";
import { usePlaygroundSingleComposerMentionTarget } from "../composer/use-playground-single-composer-mention-target.ts";
import {
  getPlaygroundActor,
  getPlaygroundFilesForMessage,
  getPlaygroundThread,
  isPlaygroundDmId,
  PLAYGROUND_SERVER_SLUG,
  requirePlaygroundThread,
  type PlaygroundActorId,
  type PlaygroundFile,
  type PlaygroundMessage,
  type PlaygroundMessageAttachment,
  type PlaygroundMessageId,
  type PlaygroundMessagePresentation,
  type PlaygroundMessageTranslation,
  type PlaygroundThreadId,
} from "../mock/index.ts";
import {
  isPlaygroundReactionFromViewer,
  togglePlaygroundMessageReaction,
} from "./playground-message-reactions.ts";
import {
  usePlaygroundMessageWorkflow,
  usePlaygroundThreadDraft,
  usePlaygroundThreadFollow,
  usePlaygroundThreadReplies,
} from "./use-playground-message-workflow.ts";

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

function PlaygroundMessageAttachments({ files }: { files: readonly PlaygroundFile[] }) {
  return files.map((file) => (
    <MessageAttachmentReadyComposition
      key={file.id}
      name={file.filename}
      meta={`${file.type.toUpperCase()} · ${file.size}`}
      commentCount={file.type === "image" ? 2 : undefined}
      primaryAction={<ExternalLink />}
      primaryActionLabel={`Preview ${file.filename}`}
      onPrimaryAction={() => {
        window.open(file.previewUrl, "_blank", "noopener,noreferrer");
      }}
      secondaryAction={<Download />}
      secondaryActionLabel={`Download ${file.filename}`}
      onSecondaryAction={() => {
        const link = document.createElement("a");
        link.href = file.previewUrl;
        link.download = file.filename;
        link.rel = "noopener";
        link.click();
      }}
    />
  ));
}

function PlaygroundSentMessageAttachments({
  attachments,
}: {
  attachments: readonly PlaygroundMessageAttachment[];
}) {
  return attachments.map((attachment) => {
    const openPreview = attachment.previewUrl
      ? () => window.open(attachment.previewUrl, "_blank", "noopener,noreferrer")
      : undefined;
    const downloadAttachment = attachment.previewUrl
      ? () => {
          const link = document.createElement("a");
          link.href = attachment.previewUrl ?? "";
          link.download = attachment.name;
          link.rel = "noopener";
          link.click();
        }
      : undefined;
    const mediaPreview =
      attachment.previewUrl && attachment.mediaType.startsWith("image/") ? (
        <button
          type="button"
          className="block w-fit max-w-[26rem] overflow-hidden border-2 border-line-strong bg-layer-muted text-left hover:brightness-95"
          aria-label={`Preview ${attachment.name}`}
          onClick={openPreview}
        >
          <img
            src={attachment.previewUrl}
            alt={attachment.name}
            className="block max-h-80 max-w-full object-contain"
          />
        </button>
      ) : attachment.previewUrl && attachment.mediaType.startsWith("video/") ? (
        <video
          controls
          preload="metadata"
          src={attachment.previewUrl}
          aria-label={`Play ${attachment.name}`}
          className="max-h-80 max-w-full border-2 border-line-strong bg-layer-muted"
        >
          <track
            kind="captions"
            src="data:text/vtt;charset=utf-8,WEBVTT"
            srcLang="en"
            label="Captions unavailable"
          />
        </video>
      ) : attachment.previewUrl && attachment.mediaType.startsWith("audio/") ? (
        <audio controls preload="metadata" src={attachment.previewUrl} className="max-w-full" />
      ) : null;

    return (
      <div key={`${attachment.name}:${attachment.mediaType}`} className="grid gap-2">
        {mediaPreview}
        <MessageAttachmentReadyComposition
          name={attachment.name}
          meta={attachment.mediaType}
          primaryAction={openPreview ? <ExternalLink /> : undefined}
          primaryActionLabel={`Preview ${attachment.name}`}
          onPrimaryAction={openPreview}
          secondaryAction={downloadAttachment ? <Download /> : undefined}
          secondaryActionLabel={`Download ${attachment.name}`}
          onSecondaryAction={downloadAttachment}
        />
      </div>
    );
  });
}

export type PlaygroundMessageRowProps = {
  message: PlaygroundMessage;
  searchMatch?: boolean;
  attachments?: ReactNode;
  footer?: ReactNode;
  focusTarget?: boolean;
  threadId?: PlaygroundThreadId;
  compact?: boolean;
  gutterTime?: string;
  surface?: "conversation" | "thread";
  className?: string;
};

export function PlaygroundMessageRow({
  message,
  searchMatch = false,
  attachments,
  footer,
  focusTarget,
  threadId,
  compact,
  gutterTime,
  surface = "conversation",
  className,
}: PlaygroundMessageRowProps) {
  const conversationKind = isPlaygroundDmId(message.channelId) ? "dm" : "channel";
  const threadSearch = threadId ? `?thread=${encodeURIComponent(threadId)}` : "";
  const messageAnchor = `${surface === "thread" ? "thread-message" : "message"}-${message.id}`;
  const messagePermalink = `/playground/s/${PLAYGROUND_SERVER_SLUG}/${conversationKind}/${encodeURIComponent(message.channelId)}${threadSearch}#${encodeURIComponent(messageAnchor)}`;
  const messageFiles = getPlaygroundFilesForMessage(message.id);
  const resolvedAttachments =
    attachments ??
    (message.attachments?.length ? (
      <PlaygroundSentMessageAttachments attachments={message.attachments} />
    ) : messageFiles.length ? (
      <PlaygroundMessageAttachments files={messageFiles} />
    ) : undefined);

  return (
    <MessageRowView
      actorId={message.senderId}
      attachments={resolvedAttachments}
      body={message.content}
      compact={compact}
      gutterTime={compact ? (gutterTime ?? playgroundGutterClock(message.createdAt)) : gutterTime}
      footer={footer}
      focusTarget={focusTarget}
      reactions={message.reactions}
      presentation={message.presentation}
      translation={message.translation}
      rowState={searchMatch ? "search-match" : undefined}
      selectId={message.id}
      messageAnchor={messageAnchor}
      messageChannelId={message.channelId}
      messagePermalink={messagePermalink}
      time={message.createdAt}
      threadId={threadId}
      surface={surface}
      className={className}
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
  reactions?: PlaygroundMessage["reactions"];
  presentation?: PlaygroundMessagePresentation;
  translation?: PlaygroundMessageTranslation;
  rowState?: "active" | "search-match";
  selectId?: string;
  threadId?: PlaygroundThreadId;
  surface?: "conversation" | "thread";
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

function PlaygroundInlineReplies({
  replies,
  threadId,
  unreadCount,
  hasDraft,
}: {
  hasDraft: boolean;
  replies: readonly PlaygroundMessage[];
  threadId: PlaygroundThreadId;
  unreadCount?: number;
}) {
  const { channel } = requirePlaygroundThread(threadId);
  const previews = replies.slice(-3);
  const undisplayedReplyCount = Math.max(0, replies.length - previews.length);
  const firstUnreadReply = replies.find((reply) => reply.unread);
  const summary =
    undisplayedReplyCount > 0
      ? `View ${undisplayedReplyCount} earlier ${undisplayedReplyCount === 1 ? "reply" : "replies"}`
      : replies.length === 1
        ? "1 reply"
        : `${replies.length} replies`;

  return (
    <MessageItemThreadRepliesPreview>
      <MessageItemThreadRepliesPreview.Trigger
        aria-label={`Open thread with ${replies.length} replies`}
        render={
          <PlaygroundConversationLink
            conversation={channel}
            hash={firstUnreadReply ? `thread-message-${firstUnreadReply.id}` : undefined}
            search={{ thread: threadId }}
          />
        }
      >
        <MessageItemThreadRepliesPreview.Summary>
          {summary}
          {unreadCount ? ` · ${unreadCount} new` : null}
          {hasDraft ? (
            <>
              {" · "}
              <Pencil className="mx-0.5 inline-block size-3" />
              draft
            </>
          ) : null}
          {" ›"}
        </MessageItemThreadRepliesPreview.Summary>
        {previews.map((reply) => {
          const replyActor = getPlaygroundActor(reply.senderId);
          return (
            <MessageItemThreadRepliesPreview.Reply key={reply.id}>
              <MessageItemThreadRepliesPreview.Avatar>
                <Avatar size="sm" type={replyActor.type}>
                  {replyActor.avatarSrc ? <AvatarImage src={replyActor.avatarSrc} alt="" /> : null}
                  <AvatarFallback>
                    {replyActor.fallback ?? replyActor.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </MessageItemThreadRepliesPreview.Avatar>
              <MessageItemThreadRepliesPreview.Sender>
                {replyActor.name}
              </MessageItemThreadRepliesPreview.Sender>
              <MessageItemThreadRepliesPreview.Preview>
                {reply.content}
              </MessageItemThreadRepliesPreview.Preview>
              <MessageItemThreadRepliesPreview.Time dateTime={reply.createdAtDateTime}>
                {reply.createdAt}
              </MessageItemThreadRepliesPreview.Time>
            </MessageItemThreadRepliesPreview.Reply>
          );
        })}
      </MessageItemThreadRepliesPreview.Trigger>
    </MessageItemThreadRepliesPreview>
  );
}

function MessageRowView({
  actorId,
  sender,
  meta,
  time,
  body,
  footer,
  focusTarget = false,
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
  reactions = [],
  presentation,
  translation,
  rowState,
  selectId,
  threadId,
  surface = "conversation",
  messageAnchor,
  messageChannelId,
  messagePermalink,
  className,
}: {
  actorId: PlaygroundActorId;
  sender?: string;
  meta?: string;
  time?: string;
  body?: ReactNode;
  footer?: ReactNode;
  focusTarget?: boolean;
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
  reactions?: PlaygroundMessage["reactions"];
  presentation?: PlaygroundMessagePresentation;
  translation?: PlaygroundMessageTranslation;
  rowState?: "active" | "search-match";
  selectId: PlaygroundMessageId;
  threadId?: PlaygroundThreadId;
  surface?: "conversation" | "thread";
  messageAnchor?: string;
  messageChannelId?: string;
  messagePermalink?: string;
  className?: string;
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
    useMemo(
      () => ({ reactions, saved: Boolean(saved), task: task ?? "none" }),
      [reactions, saved, task],
    ),
  );
  useEffect(() => {
    if (workflow.translation !== "pending") return;
    const timer = window.setTimeout(() => {
      updateWorkflow((current) => ({
        ...current,
        translation: translation?.outcome === "failure" ? "failed" : "translated",
      }));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [translation?.outcome, updateWorkflow, workflow.translation]);
  const { followed: isFollowed, setFollowed } = usePlaygroundThreadFollow(
    threadId,
    Boolean(followed),
  );
  const isSaved = workflow.saved;
  const taskState = workflow.task;
  const toggleReaction = (emoji: string) =>
    updateWorkflow((current) => ({
      ...current,
      reactions: togglePlaygroundMessageReaction(current.reactions, emoji),
    }));
  const [contextMenuPortalContainer, setContextMenuPortalContainer] =
    useState<HTMLDivElement | null>(null);
  const [reactionPortalContainer, setReactionPortalContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const navigate = useNavigate();
  const threadContext = threadId ? getPlaygroundThread(threadId) : undefined;
  const { replies: threadReplies } = usePlaygroundThreadReplies(
    threadId,
    threadContext?.thread.replies ?? [],
  );
  const { draft: threadDraft } = usePlaygroundThreadDraft(threadId);
  const hasThreadDraft = Boolean(threadDraft.trim());
  const markdownText = typeof body === "string" ? body : "Composed message content";
  const visibleBody =
    translation?.translatedContent && workflow.translation === "translated"
      ? translation.translatedContent
      : body;
  const renderedBody =
    typeof visibleBody === "string" ? (
      <PlaygroundMessageBody channelId={messageChannelId} content={visibleBody} />
    ) : (
      visibleBody
    );
  const composedBody =
    presentation === "action-card" ? (
      <ActionCardFixtureSurface fixture={ACTION_CARD_FIXTURES[0]} initialState="prepared" />
    ) : (
      renderedBody
    );
  const embeddedPresentation =
    presentation === "forwarded-bundle" ? (
      <ForwardedBundleEmbeddedComposition />
    ) : presentation === "quoted-preview" ? (
      <QuotedPreviewEmbeddedComposition />
    ) : null;

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
    surface === "conversation" && threadId && threadContext
      ? () => {
          if (threadContext.channel.kind === "dm") {
            void navigate({
              to: "/playground/s/$serverSlug/dm/$dmId",
              params: { dmId: threadContext.channel.id, serverSlug: PLAYGROUND_SERVER_SLUG },
              search: { thread: threadId },
            });
            return;
          }

          void navigate({
            to: "/playground/s/$serverSlug/channel/$channelId",
            params: { channelId: threadContext.channel.id, serverSlug: PLAYGROUND_SERVER_SLUG },
            search: { thread: threadId },
          });
        }
      : undefined;
  const messageItem = (
    <ItemRoot
      id={messageAnchor}
      compact={compact}
      className={className}
      tabIndex={surface === "thread" && focusTarget ? -1 : undefined}
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
        {composedBody ||
        embeddedPresentation ||
        attachments ||
        workflow.translation === "pending" ? (
          <MessageItemCollapsibleContent
            disabled={presentation === "action-card"}
            expanded={workflow.expanded}
            onExpandedChange={(expanded) => updateWorkflow((current) => ({ ...current, expanded }))}
          >
            <MessageItemCollapsibleContentPanel>
              {workflow.translation === "pending" ? (
                <MessageItemBody>
                  <MessageItemTranslationPlaceholder />
                </MessageItemBody>
              ) : composedBody ? (
                <MessageItemBody>{composedBody}</MessageItemBody>
              ) : null}
              {translation?.display === "bilingual" &&
              translation.translatedContent &&
              workflow.translation === "translated" &&
              typeof body === "string" ? (
                <MessageItemTranslationOriginal>
                  <MessageItemTranslationOriginalLabel>
                    Original
                  </MessageItemTranslationOriginalLabel>
                  <PlaygroundMessageBody channelId={messageChannelId} content={body} />
                </MessageItemTranslationOriginal>
              ) : null}
              {embeddedPresentation}
              {attachments ? <MessageItemAttachments>{attachments}</MessageItemAttachments> : null}
            </MessageItemCollapsibleContentPanel>
            <MessageItemCollapsibleContentTrigger>
              {({ expanded }) => (expanded ? "Show less" : "Show more")}
            </MessageItemCollapsibleContentTrigger>
          </MessageItemCollapsibleContent>
        ) : null}
        {translation && workflow.translation !== "idle" ? (
          <MessageItemTranslationStatus
            tone={
              workflow.translation === "pending"
                ? "pending"
                : workflow.translation === "failed"
                  ? "failed"
                  : "normal"
            }
          >
            {workflow.translation === "pending" ? (
              <>
                <Languages size={12} />
                <span>Translating…</span>
              </>
            ) : workflow.translation === "failed" ? (
              <>
                <AlertTriangle size={12} />
                <span>Translation unavailable</span>
                <span aria-hidden>·</span>
                <MessageItemTranslationAction
                  tone="failed"
                  onClick={() =>
                    updateWorkflow((current) => ({
                      ...current,
                      translation: "pending",
                    }))
                  }
                >
                  Retry
                </MessageItemTranslationAction>
              </>
            ) : translation.display === "bilingual" ? (
              <>
                <Languages size={12} />
                <span>Translated</span>
              </>
            ) : (
              <>
                <Languages size={12} />
                <MessageItemTranslationAction
                  aria-label={
                    workflow.translation === "original" ? "Show translation" : "Show original"
                  }
                  onClick={() =>
                    updateWorkflow((current) => ({
                      ...current,
                      translation: current.translation === "original" ? "translated" : "original",
                    }))
                  }
                >
                  {workflow.translation === "original" ? "Show translation" : "Show original"}
                </MessageItemTranslationAction>
              </>
            )}
          </MessageItemTranslationStatus>
        ) : null}
        {footer ||
        workflow.reactions.length > 0 ||
        isSaved ||
        (surface === "conversation" && hasThreadDraft && !threadReplies.length) ? (
          <MessageItemFooter>
            {footer}
            {surface === "conversation" && hasThreadDraft && !threadReplies.length ? (
              <MessageItemBadge>
                <Pencil />
                <span>draft</span>
              </MessageItemBadge>
            ) : null}
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
            {workflow.reactions.map((reaction) => {
              const reacted = isPlaygroundReactionFromViewer(reaction);
              return (
                <MessageReactionChip
                  key={reaction.emoji}
                  aria-label={`${reaction.emoji} ${reaction.count}`}
                  aria-pressed={reacted}
                  onClick={() => toggleReaction(reaction.emoji)}
                >
                  <MessageReactionGlyphComposition emoji={reaction.emoji} />
                  <MessageReactionCount>{reaction.count}</MessageReactionCount>
                </MessageReactionChip>
              );
            })}
            {workflow.reactions.length > 0 ? (
              <MessageMobileReactionAdd
                portalContainer={reactionPortalContainer}
                onReact={toggleReaction}
              />
            ) : null}
          </MessageItemFooter>
        ) : null}
        {surface === "conversation" && threadId && threadReplies.length ? (
          <PlaygroundInlineReplies
            replies={threadReplies}
            hasDraft={hasThreadDraft}
            threadId={threadId}
            unreadCount={threadContext?.thread.unreadCount}
          />
        ) : null}
      </MessageItemContent>
      <RowToolbar
        saved={isSaved}
        onReplyInThread={openThread}
        portalContainer={reactionPortalContainer}
        onReact={toggleReaction}
        onSavedChange={(next) => updateWorkflow((current) => ({ ...current, saved: next }))}
      />
      <div ref={setReactionPortalContainer} className="contents" />
    </ItemRoot>
  );

  // Select mode disables the right-click menu (source parity), so the row skips
  // the ContextMenu wrapper entirely.
  if (selectMode) {
    return <MessageItemInteractionBoundary>{messageItem}</MessageItemInteractionBoundary>;
  }

  return (
    <MessageItemInteractionBoundary ref={setContextMenuPortalContainer}>
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
          portalContainer={contextMenuPortalContainer}
          onCopyLink={
            messagePermalink
              ? () => {
                  const permalink = new URL(messagePermalink, window.location.origin);
                  void navigator.clipboard?.writeText(permalink.href);
                }
              : undefined
          }
          onCopyMarkdown={() => void navigator.clipboard?.writeText(markdownText)}
          onFollowChange={
            surface === "conversation" && threadReplies.length ? setFollowed : undefined
          }
          onQuickReact={(emoji) => {
            toggleReaction(emoji);
            setMenuOpen(false);
          }}
          onSavedChange={(next) => updateWorkflow((current) => ({ ...current, saved: next }))}
          onTaskChange={(next) => updateWorkflow((current) => ({ ...current, task: next }))}
          onTranslate={
            translation && (workflow.translation === "idle" || workflow.translation === "pending")
              ? () =>
                  updateWorkflow((current) => ({
                    ...current,
                    translation: "pending",
                  }))
              : undefined
          }
          translating={workflow.translation === "pending"}
          onSelectMessage={selection ? () => selection.enter(rowSelectId) : undefined}
          onOpenThread={openThread}
        />
      </ContextMenu>
    </MessageItemInteractionBoundary>
  );
}

// Thin Playground wrapper over the canonical toolbar. Product workflow callbacks
// stay keyed to the message while transient picker state remains in the composition.
function RowToolbar({
  saved,
  onReact,
  onReplyInThread,
  onSavedChange,
  portalContainer,
}: {
  saved?: boolean;
  onReact: (emoji: string) => void;
  onReplyInThread?: () => void;
  onSavedChange: (saved: boolean) => void;
  portalContainer?: HTMLElement | null;
}) {
  return (
    <MessageRowToolbar
      saved={saved}
      onReact={onReact}
      onReplyInThread={onReplyInThread}
      onSavedChange={onSavedChange}
      portalContainer={portalContainer}
    />
  );
}
