import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bookmark,
  Download,
  ExternalLink,
  Languages,
  MessageSquare,
  MessageSquareDot,
  Pencil,
  RotateCcw,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  ContextMenu,
  ContextMenuItem,
  ContextMenuTrigger,
  MessageReplies,
  MessageRepliesItem,
  MessageRepliesItemContent,
  MessageRepliesItemSender,
  MessageRepliesItemTime,
  MessageRepliesSummary,
  MessageRepliesSummaryItem,
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "raft-ui";
import {
  MessageItem,
  MessageItemActive,
  MessageItemAttachments,
  MessageItemBadge,
  MessageItemBody,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemFooter,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemMeta,
  MessageReactionChip,
  MessageItemSavedIndicator,
  MessageItemSearchMatch,
  MessageItemSelection,
  MessageItemSender,
  MessageAttachmentAction,
  MessageAttachmentCommentSummary,
  MessageAttachmentCard,
  MessageAttachmentMeta,
  MessageAttachmentMetaEnd,
  MessageAttachmentMetaStart,
  MessageAttachmentSummary,
  MessageAttachmentTitle,
  MessageItemTime,
  MessageItemTranslationAction,
  MessageItemTranslationFailedStatus,
  MessageItemTranslationOriginal,
  MessageItemTranslationOriginalLabel,
  MessageItemTranslationPendingStatus,
  MessageItemTranslationRetryAction,
  MessageItemTranslationStatus,
  MessageMultiSelectCheckbox,
  MessageReactionCount,
  useMessageMultiSelect,
} from "raft-ui/wip";

import { MessageContextMenuComposition } from "#/modules/message-item/compositions/context-menu.composition.tsx";
import { ActionCardComposition } from "#/modules/message-action-card/compositions/action-card-message.composition.tsx";
import { ForwardedBundleEmbeddedComposition } from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx";
import { QuotedPreviewEmbeddedComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-message.composition.tsx";
import { MessageMobileReactionAdd } from "#/modules/message-item/compositions/item-preview.composition.tsx";
import { PlaygroundConversationLink } from "../navigation/conversation-link.tsx";
import { MessageRowToolbar } from "#/modules/message-item/compositions/row-toolbar.composition.tsx";
import { MessageReactionGlyphComposition } from "#/modules/message-item/compositions/reaction-glyph.composition.tsx";
import { PlaygroundMessageAvatar } from "./playground-message-avatar.tsx";
import { PlaygroundMessageBody } from "./playground-message-body.tsx";
import { PlaygroundMessageContentCollapse } from "./playground-message-content-collapse.tsx";
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

function PlaygroundMessageSender({
  children,
  mentionHandle,
}: {
  children: ReactNode;
  mentionHandle: PlaygroundActorId;
}) {
  const mentionTarget = usePlaygroundSingleComposerMentionTarget();
  if (!mentionTarget) {
    return <MessageItemSender>{children}</MessageItemSender>;
  }
  return (
    <MessageItemSender
      interactive
      render={
        <button
          type="button"
          title={`Mention @${mentionHandle}`}
          onClick={() => mentionTarget.insertMention(mentionHandle)}
        />
      }
    >
      {children}
    </MessageItemSender>
  );
}

function PlaygroundMessageAttachments({ files }: { files: readonly PlaygroundFile[] }) {
  return files.map((file) => (
    <MessageAttachmentCard key={file.id}>
      <MessageAttachmentTitle>{file.filename}</MessageAttachmentTitle>
      {file.type === "image" ? (
        <MessageAttachmentSummary render={<MessageAttachmentCommentSummary />}>
          <MessageSquare />2
        </MessageAttachmentSummary>
      ) : null}
      <MessageAttachmentMeta>
        <MessageAttachmentMetaStart>{file.size}</MessageAttachmentMetaStart>
        <MessageAttachmentMetaEnd>
          <MessageAttachmentAction
            aria-label={`Preview ${file.filename}`}
            title={`Preview ${file.filename}`}
            onClick={() => {
              window.open(file.previewUrl, "_blank", "noopener,noreferrer");
            }}
          >
            <ExternalLink />
          </MessageAttachmentAction>
          <MessageAttachmentAction
            aria-label={`Download ${file.filename}`}
            title={`Download ${file.filename}`}
            onClick={() => {
              const link = document.createElement("a");
              link.href = file.previewUrl;
              link.download = file.filename;
              link.rel = "noopener";
              link.click();
            }}
          >
            <Download />
          </MessageAttachmentAction>
        </MessageAttachmentMetaEnd>
      </MessageAttachmentMeta>
    </MessageAttachmentCard>
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
          className="block w-fit max-w-[416px] overflow-hidden border-2 border-line-strong bg-layer-muted text-left hover:brightness-95"
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
        <MessageAttachmentCard>
          <MessageAttachmentTitle>{attachment.name}</MessageAttachmentTitle>
          <MessageAttachmentMeta>
            {openPreview || downloadAttachment ? (
              <MessageAttachmentMetaEnd className="ml-auto">
                {openPreview ? (
                  <MessageAttachmentAction
                    aria-label={`Preview ${attachment.name}`}
                    title={`Preview ${attachment.name}`}
                    onClick={openPreview}
                  >
                    <ExternalLink />
                  </MessageAttachmentAction>
                ) : null}
                {downloadAttachment ? (
                  <MessageAttachmentAction
                    aria-label={`Download ${attachment.name}`}
                    title={`Download ${attachment.name}`}
                    onClick={downloadAttachment}
                  >
                    <Download />
                  </MessageAttachmentAction>
                ) : null}
              </MessageAttachmentMetaEnd>
            ) : null}
          </MessageAttachmentMeta>
        </MessageAttachmentCard>
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
  const firstUnreadReply = replies.find((reply) => reply.unread);
  const summary = replies.length === 1 ? "1 reply" : `${replies.length} replies`;

  return (
    <MessageReplies
      aria-label={`Open thread with ${replies.length} replies`}
      render={
        <PlaygroundConversationLink
          conversation={channel}
          hash={firstUnreadReply ? `thread-message-${firstUnreadReply.id}` : undefined}
          search={{ thread: threadId }}
        />
      }
    >
      <MessageRepliesSummary>
        <MessageRepliesSummaryItem>{summary}</MessageRepliesSummaryItem>
        {unreadCount ? (
          <>
            <span aria-hidden>·</span>
            <MessageRepliesSummaryItem render={<strong />}>
              <MessageSquareDot aria-hidden />
              {unreadCount} new
            </MessageRepliesSummaryItem>
          </>
        ) : null}
        {hasDraft ? (
          <>
            <span aria-hidden>·</span>
            <MessageRepliesSummaryItem>
              <Pencil aria-hidden />
              draft
            </MessageRepliesSummaryItem>
          </>
        ) : null}
        <span aria-hidden>›</span>
      </MessageRepliesSummary>
      {previews.map((reply) => {
        const replyActor = getPlaygroundActor(reply.senderId);
        return (
          <MessageRepliesItem key={reply.id}>
            <Avatar size="sm" type={replyActor.type}>
              {replyActor.avatarSrc ? <AvatarImage src={replyActor.avatarSrc} alt="" /> : null}
              <AvatarFallback>{replyActor.fallback ?? replyActor.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <MessageRepliesItemSender>{replyActor.name}</MessageRepliesItemSender>
            <MessageRepliesItemContent>{reply.content}</MessageRepliesItemContent>
            <MessageRepliesItemTime dateTime={reply.createdAtDateTime}>
              {reply.createdAt}
            </MessageRepliesItemTime>
          </MessageRepliesItem>
        );
      })}
    </MessageReplies>
  );
}

export function PlaygroundMessageRow({
  message,
  searchMatch = false,
  footer,
  focusTarget = false,
  attachments,
  compact,
  gutterTime,
  threadId,
  surface = "conversation",
  className,
}: PlaygroundMessageRowProps) {
  const {
    channelId,
    content: body,
    createdAt: time,
    id: selectId,
    presentation,
    reactions,
    senderId: actorId,
    translation,
  } = message;
  const conversationKind = isPlaygroundDmId(channelId) ? "dm" : "channel";
  const threadSearch = threadId ? `?thread=${encodeURIComponent(threadId)}` : "";
  const messageAnchor = `${surface === "thread" ? "thread-message" : "message"}-${message.id}`;
  const messagePermalink = `/playground/s/${PLAYGROUND_SERVER_SLUG}/${conversationKind}/${encodeURIComponent(channelId)}${threadSearch}#${encodeURIComponent(messageAnchor)}`;
  const messageFiles = getPlaygroundFilesForMessage(message.id);
  const resolvedAttachments =
    attachments ??
    (message.attachments?.length ? (
      <PlaygroundSentMessageAttachments attachments={message.attachments} />
    ) : messageFiles.length ? (
      <PlaygroundMessageAttachments files={messageFiles} />
    ) : undefined);
  const resolvedGutterTime = compact
    ? (gutterTime ?? playgroundGutterClock(message.createdAt))
    : gutterTime;
  const actor = getPlaygroundActor(actorId);
  const selection = useMessageMultiSelect();
  const rowSelectId = selectId;
  const selectMode = selection?.active ?? false;
  const [menuOpen, setMenuOpen] = useState(false);
  const { workflow, update: updateWorkflow } = usePlaygroundMessageWorkflow(
    rowSelectId,
    useMemo(() => ({ reactions, saved: false, task: "none" }), [reactions]),
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
  const { followed: isFollowed, setFollowed } = usePlaygroundThreadFollow(threadId, false);
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
  const markdownText = body;
  const visibleBody =
    translation?.translatedContent && workflow.translation === "translated"
      ? translation.translatedContent
      : body;
  const renderedBody = <PlaygroundMessageBody channelId={channelId} content={visibleBody} />;
  const composedBody = presentation === "action-card" ? <ActionCardComposition /> : renderedBody;
  const embeddedPresentation =
    presentation === "forwarded-bundle" ? (
      <ForwardedBundleEmbeddedComposition />
    ) : presentation === "quoted-preview" ? (
      <QuotedPreviewEmbeddedComposition />
    ) : null;

  const effectiveRowState = selectMode
    ? "select"
    : searchMatch
      ? "search-match"
      : menuOpen
        ? "active"
        : undefined;
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
          {resolvedGutterTime ? (
            <MessageItemContinuationTime>{resolvedGutterTime}</MessageItemContinuationTime>
          ) : null}
        </MessageItemGutter>
      ) : (
        <PlaygroundMessageAvatar actorId={actorId} status={actor.presence ?? "offline"} />
      )}
      <MessageItemContent>
        {!compact ? (
          <MessageItemHeader>
            <PlaygroundMessageSender mentionHandle={actorId}>{actor.name}</PlaygroundMessageSender>
            {actor.meta ? <MessageItemMeta title={actor.meta}>{actor.meta}</MessageItemMeta> : null}
            <MessageItemTime>{time}</MessageItemTime>
          </MessageItemHeader>
        ) : null}
        {composedBody ||
        embeddedPresentation ||
        resolvedAttachments ||
        workflow.translation === "pending" ? (
          <PlaygroundMessageContentCollapse
            enabled={presentation !== "action-card" && presentation !== "forwarded-bundle"}
            expanded={workflow.expanded}
            onExpandedChange={(expanded) => updateWorkflow((current) => ({ ...current, expanded }))}
          >
            {workflow.translation === "pending" ? (
              <MessageItemBody>
                <Progress
                  value={null}
                  size="sm"
                  aria-label="Translating message"
                  className="w-44 max-w-full"
                >
                  <ProgressTrack>
                    <ProgressIndicator />
                  </ProgressTrack>
                </Progress>
              </MessageItemBody>
            ) : composedBody ? (
              <MessageItemBody>{composedBody}</MessageItemBody>
            ) : null}
            {translation?.display === "bilingual" &&
            translation.translatedContent &&
            workflow.translation === "translated" ? (
              <MessageItemTranslationOriginal>
                <MessageItemTranslationOriginalLabel>Original</MessageItemTranslationOriginalLabel>
                <PlaygroundMessageBody channelId={channelId} content={body} />
              </MessageItemTranslationOriginal>
            ) : null}
            {embeddedPresentation}
            {resolvedAttachments ? (
              <MessageItemAttachments>{resolvedAttachments}</MessageItemAttachments>
            ) : null}
          </PlaygroundMessageContentCollapse>
        ) : null}
        {translation && workflow.translation !== "idle" ? (
          workflow.translation === "pending" ? (
            <MessageItemTranslationPendingStatus>
              <Languages size={12} />
              <span>Translating…</span>
            </MessageItemTranslationPendingStatus>
          ) : workflow.translation === "failed" ? (
            <MessageItemTranslationFailedStatus>
              <AlertTriangle size={12} />
              <span>Translation unavailable</span>
              <span aria-hidden>·</span>
              <MessageItemTranslationRetryAction
                onClick={() =>
                  updateWorkflow((current) => ({
                    ...current,
                    translation: "pending",
                  }))
                }
              >
                <RotateCcw size={12} aria-hidden />
                Retry
              </MessageItemTranslationRetryAction>
            </MessageItemTranslationFailedStatus>
          ) : (
            <MessageItemTranslationStatus>
              {translation.display === "bilingual" ? (
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
          )
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
                  selected={reacted}
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
      <MessageRowToolbar
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
    return messageItem;
  }

  return (
    <div ref={setContextMenuPortalContainer}>
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
          onSelectMessage={selection ? () => selection.enter(rowSelectId) : undefined}
          onOpenThread={openThread}
        >
          {translation &&
          (workflow.translation === "idle" || workflow.translation === "pending") ? (
            <ContextMenuItem
              disabled={workflow.translation === "pending"}
              onClick={() =>
                updateWorkflow((current) => ({
                  ...current,
                  translation: "pending",
                }))
              }
            >
              <Languages />
              {workflow.translation === "pending" ? "Translating…" : "Translate"}
            </ContextMenuItem>
          ) : null}
        </MessageContextMenuComposition>
      </ContextMenu>
    </div>
  );
}
