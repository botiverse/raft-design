import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bookmark,
  CheckCircle,
  Languages,
  MessageSquareDot,
  Pencil,
  RotateCcw,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
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
  MessageItem,
  MessageItemAttachments,
  MessageItemBadge,
  MessageItemBody,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemFooter,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemInlineStatus,
  MessageItemMeta,
  MessageItemReadReceipt,
  MessageReactionChip,
  MessageItemSavedIndicator,
  MessageItemSender,
  MessageItemSenderBadges,
  MessageItemSenderButton,
  MessageItemTime,
  MessageMultiSelectCheckbox,
  MessageReactionCount,
} from "raft-ui";
import {
  MessageAttachmentGroup,
  MessageItemTranslationAction,
  MessageItemTranslationFailedStatus,
  MessageItemTranslationOriginal,
  MessageItemTranslationOriginalLabel,
  MessageItemTranslationProgressTrack,
  MessageItemTranslationRetryAction,
  MessageItemTranslationStatus,
} from "raft-ui";

import { MessageContextMenuComposition } from "#/modules/message-item/compositions/context-menu.composition.tsx";
import {
  MessageAudioAttachmentComposition,
  MessageGenericAttachmentComposition,
  MessagePendingAttachmentComposition,
} from "#/modules/message-attachment/compositions/file-attachments.composition.tsx";
import { MessageImageGallerySingleComposition } from "#/modules/message-media/compositions/image-gallery-single.composition.tsx";
import {
  MessageVideoPreviewComposition,
  MessageVideoPreviewFailedComposition,
} from "#/modules/message-media/compositions/video-states.composition.tsx";
import { MessageMobileReactionAdd } from "#/modules/message-item/compositions/item-preview.composition.tsx";
import { PlaygroundConversationLink } from "../navigation/conversation-link.tsx";
import { MessageRowToolbar } from "#/modules/message-item/compositions/row-toolbar.composition.tsx";
import { MessageReactionGlyphComposition } from "#/modules/message-item/compositions/reaction-glyph.composition.tsx";
import { PlaygroundMessageAvatar } from "./playground-message-avatar.tsx";
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
  type PlaygroundChatMessage,
  type PlaygroundFile,
  type PlaygroundMessage,
  type PlaygroundMessageAttachment,
  type PlaygroundTask,
  type PlaygroundThreadId,
} from "../mock/index.ts";
import { PlaygroundMessagePresentation } from "./playground-message-presentations.tsx";
import { PlaygroundSystemMessageRow } from "./playground-system-message-row.tsx";
import {
  isPlaygroundReactionFromViewer,
  togglePlaygroundMessageReaction,
} from "./playground-message-reactions.ts";
import {
  usePlaygroundMessageSaved,
  usePlaygroundMessageWorkflow,
  usePlaygroundThreadDraft,
  usePlaygroundThreadFollow,
  usePlaygroundThreadReplies,
} from "./use-playground-message-workflow.ts";
import { usePlaygroundTaskState } from "../tasks/use-playground-task-state.ts";

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
    <MessageItemSenderButton
      title={`Mention @${mentionHandle}`}
      onClick={() => mentionTarget.insertMention(mentionHandle)}
    >
      {children}
    </MessageItemSenderButton>
  );
}

function PlaygroundMessageAttachments({ files }: { files: readonly PlaygroundFile[] }) {
  return (
    <MessageAttachmentGroup>
      {files.map((file) => (
        <MessageGenericAttachmentComposition
          key={file.id}
          name={file.filename}
          meta={file.size}
          onPreview={() => window.open(file.previewUrl, "_blank", "noopener,noreferrer")}
          onDownload={() => downloadMessageAttachment(file.previewUrl, file.filename)}
        />
      ))}
    </MessageAttachmentGroup>
  );
}

function downloadMessageAttachment(url: string, name: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.rel = "noopener";
  link.click();
}

function PlaygroundSentMessageAttachments({
  attachments,
}: {
  attachments: readonly PlaygroundMessageAttachment[];
}) {
  const imageAttachments = attachments.filter(isPlaygroundImageAttachment);
  const videoAttachments = attachments.filter(isPlaygroundVideoAttachment);
  const fileAttachments = attachments.filter(
    (attachment) =>
      !isPlaygroundImageAttachment(attachment) && !isPlaygroundVideoAttachment(attachment),
  );

  return (
    <>
      {imageAttachments.map(renderPlaygroundSentAttachment)}
      {videoAttachments.map(renderPlaygroundSentAttachment)}
      {fileAttachments.length ? (
        <MessageAttachmentGroup>
          {fileAttachments.map(renderPlaygroundSentAttachment)}
        </MessageAttachmentGroup>
      ) : null}
    </>
  );
}

function isPlaygroundImageAttachment(attachment: PlaygroundMessageAttachment) {
  return (
    attachment.state.kind === "ready" &&
    Boolean(attachment.state.previewUrl) &&
    attachment.mediaType.startsWith("image/")
  );
}

function isPlaygroundVideoAttachment(attachment: PlaygroundMessageAttachment) {
  return (
    attachment.mediaType.startsWith("video/") &&
    (attachment.state.kind === "failed" ||
      (attachment.state.kind === "ready" && Boolean(attachment.state.previewUrl)))
  );
}

function renderPlaygroundSentAttachment(attachment: PlaygroundMessageAttachment) {
  const previewUrl = attachment.state.kind === "ready" ? attachment.state.previewUrl : undefined;
  const downloadUrl =
    attachment.state.kind === "failed" ? attachment.state.downloadUrl : previewUrl;
  const openPreview = previewUrl
    ? () => window.open(previewUrl, "_blank", "noopener,noreferrer")
    : undefined;
  const downloadAttachment = downloadUrl
    ? () => downloadMessageAttachment(downloadUrl, attachment.name)
    : undefined;
  const key = `${attachment.name}:${attachment.mediaType}`;

  if (attachment.state.kind === "processing") {
    return (
      <MessagePendingAttachmentComposition
        key={key}
        name={attachment.name}
        label={attachment.state.label}
      />
    );
  }

  if (attachment.state.kind === "failed" && attachment.mediaType.startsWith("video/")) {
    return (
      <MessageVideoPreviewFailedComposition
        key={key}
        name={attachment.name}
        reason={attachment.state.reason}
        onDownload={downloadAttachment ?? null}
      />
    );
  }

  if (previewUrl && attachment.mediaType.startsWith("image/")) {
    return (
      <MessageImageGallerySingleComposition
        key={key}
        alt={attachment.name}
        name={attachment.name}
        onDownload={downloadAttachment}
        onPreview={openPreview}
        src={previewUrl}
      />
    );
  }

  if (previewUrl && attachment.mediaType.startsWith("video/")) {
    return (
      <MessageVideoPreviewComposition
        key={key}
        name={attachment.name}
        onDownload={downloadAttachment}
        src={previewUrl}
      />
    );
  }

  if (previewUrl && attachment.mediaType.startsWith("audio/")) {
    return (
      <MessageAudioAttachmentComposition
        key={key}
        meta={attachment.mediaType}
        name={attachment.name}
        onDownload={downloadAttachment}
        onPreview={openPreview}
      />
    );
  }

  return (
    <MessageGenericAttachmentComposition
      key={key}
      name={attachment.name}
      meta={attachment.state.kind === "ready" ? attachment.state.size : attachment.state.reason}
      onPreview={openPreview}
      onDownload={downloadAttachment ?? null}
    />
  );
}

export type PlaygroundMessageRowProps = {
  message: PlaygroundMessage;
  task?: PlaygroundTask;
  searchQuery?: string;
  attachments?: ReactNode;
  footer?: ReactNode;
  focusTarget?: boolean;
  threadId?: PlaygroundThreadId;
  compact?: boolean;
  gutterTime?: string;
  surface?: "conversation" | "thread";
  className?: string;
  selectionMode?: boolean;
  selected?: boolean;
  onEnterSelectionMode?: () => void;
  onSelectedChange?: (selected: boolean) => void;
};

function PlaygroundInlineReplies({
  replies,
  threadId,
  unreadCount,
  hasDraft,
}: {
  hasDraft: boolean;
  replies: readonly PlaygroundChatMessage[];
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

function initialTranslationState(message: PlaygroundChatMessage) {
  return message.translation?.initialState ?? "idle";
}

function initialTaskState(task: PlaygroundTask | undefined) {
  if (!task) return "none";
  return task.status === "done" || task.status === "closed" ? "done" : "open";
}

function PlaygroundChatMessageRow({
  message,
  task,
  searchQuery,
  footer,
  focusTarget = false,
  attachments,
  compact,
  gutterTime,
  threadId,
  surface = "conversation",
  className,
  selectionMode = false,
  selected = false,
  onEnterSelectionMode,
  onSelectedChange,
}: PlaygroundMessageRowProps & { message: PlaygroundChatMessage }) {
  const {
    channelId,
    content: body,
    createdAt: time,
    id: selectId,
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
  const rowSelectId = selectId;
  const [menuOpen, setMenuOpen] = useState(false);
  const { workflow, update: updateWorkflow } = usePlaygroundMessageWorkflow(
    rowSelectId,
    useMemo(
      () => ({
        ...(message.presentation?.kind === "action-card"
          ? { actionCardResolution: message.presentation.resolution }
          : {}),
        reactions,
        translation: initialTranslationState(message),
      }),
      [message, reactions],
    ),
  );
  const { saved: isSaved, setSaved } = usePlaygroundMessageSaved(message, surface, threadId);
  const { setTasks } = usePlaygroundTaskState();
  useEffect(() => {
    if (workflow.translation !== "pending" || translation?.autoResolve === false) return;
    const timer = window.setTimeout(() => {
      updateWorkflow((current) => ({
        ...current,
        translation: translation?.outcome === "failure" ? "failed" : "translated",
      }));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [translation?.autoResolve, translation?.outcome, updateWorkflow, workflow.translation]);
  const { followed: isFollowed, setFollowed } = usePlaygroundThreadFollow(threadId, false);
  const taskState = initialTaskState(task);
  const toggleReaction = (emoji: string) =>
    updateWorkflow((current) => ({
      ...current,
      reactions: togglePlaygroundMessageReaction(current.reactions, emoji),
    }));
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
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
  const renderedBody = (
    <PlaygroundMessageBody
      channelId={channelId}
      content={visibleBody}
      mentionReadStates={message.mentionReadStates}
      searchQuery={searchQuery}
    />
  );
  const actionCardPresentation =
    message.presentation?.kind === "action-card" ? message.presentation : undefined;
  const actionPresentation = actionCardPresentation ? (
    <PlaygroundMessagePresentation
      presentation={actionCardPresentation}
      actionCardResolution={workflow.actionCardResolution}
      onActionCardResolve={() =>
        updateWorkflow((current) => {
          const resolution = current.actionCardResolution ?? actionCardPresentation.resolution;
          if (resolution?.kind !== "ready") return current;
          return {
            ...current,
            actionCardResolution: {
              kind: "completed",
              ...resolution.completion,
            },
          };
        })
      }
    />
  ) : null;
  const composedBody = actionPresentation ?? renderedBody;
  const embeddedPresentation =
    message.presentation && message.presentation.kind !== "action-card" ? (
      <PlaygroundMessagePresentation presentation={message.presentation} />
    ) : null;

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
    <MessageItem
      id={messageAnchor}
      compact={compact}
      className={className}
      tabIndex={surface === "thread" && focusTarget ? -1 : undefined}
    >
      {selectionMode ? (
        <MessageMultiSelectCheckbox
          aria-label="Select message"
          checked={selected}
          value={rowSelectId}
          onCheckedChange={onSelectedChange}
        />
      ) : null}
      {compact ? (
        <MessageItemGutter>
          {resolvedGutterTime ? (
            <MessageItemContinuationTime>{resolvedGutterTime}</MessageItemContinuationTime>
          ) : null}
        </MessageItemGutter>
      ) : (
        <PlaygroundMessageAvatar
          actorId={actorId}
          status={actor.presence ?? "offline"}
          deactivated={Boolean(message.senderLifecycle)}
        />
      )}
      <MessageItemContent>
        {!compact ? (
          <MessageItemHeader>
            {message.senderLifecycle ? (
              <MessageItemSender>{actor.name}</MessageItemSender>
            ) : (
              <PlaygroundMessageSender mentionHandle={actorId}>
                {actor.name}
              </PlaygroundMessageSender>
            )}
            {message.senderLifecycle ? (
              <MessageItemSenderBadges>
                <Badge appearance="soft" variant="muted" uppercase>
                  {message.senderLifecycle}
                </Badge>
              </MessageItemSenderBadges>
            ) : null}
            {actor.meta ? <MessageItemMeta title={actor.meta}>{actor.meta}</MessageItemMeta> : null}
            <MessageItemTime>{time}</MessageItemTime>
            {message.inlineStatus ? (
              <MessageItemInlineStatus>Converting…</MessageItemInlineStatus>
            ) : null}
          </MessageItemHeader>
        ) : null}
        {composedBody ||
        embeddedPresentation ||
        resolvedAttachments ||
        workflow.translation === "pending" ? (
          <>
            {workflow.translation === "pending" ? (
              <MessageItemBody>
                <Progress
                  value={null}
                  size="sm"
                  aria-label="Translating message"
                  className="w-44 max-w-full"
                >
                  <MessageItemTranslationProgressTrack>
                    <ProgressIndicator />
                  </MessageItemTranslationProgressTrack>
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
                <PlaygroundMessageBody
                  channelId={channelId}
                  content={body}
                  mentionReadStates={message.mentionReadStates}
                />
              </MessageItemTranslationOriginal>
            ) : null}
            {embeddedPresentation}
            {resolvedAttachments ? (
              <MessageItemAttachments>{resolvedAttachments}</MessageItemAttachments>
            ) : null}
          </>
        ) : null}
        {translation && workflow.translation !== "idle" ? (
          workflow.translation === "pending" ? (
            <MessageItemTranslationStatus>
              <Languages size={12} />
              <span>Translating…</span>
            </MessageItemTranslationStatus>
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
        message.readReceipt ||
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
                render={<button type="button" onClick={() => setSaved(false)} />}
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
                  pressed={reacted}
                  onPressedChange={() => toggleReaction(reaction.emoji)}
                >
                  <MessageReactionGlyphComposition emoji={reaction.emoji} />
                  <MessageReactionCount>{reaction.count}</MessageReactionCount>
                </MessageReactionChip>
              );
            })}
            {workflow.reactions.length > 0 ? (
              <MessageMobileReactionAdd
                portalContainer={portalContainer}
                onReact={toggleReaction}
              />
            ) : null}
            {message.readReceipt ? (
              <MessageItemReadReceipt
                title={
                  message.readReceipt.readAt ? `Read at ${message.readReceipt.readAt}` : "Read"
                }
                aria-label="Read"
              >
                <CheckCircle />
                <span>Read</span>
              </MessageItemReadReceipt>
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
        portalContainer={portalContainer}
        onReact={toggleReaction}
        onSavedChange={setSaved}
      />
      <div ref={setPortalContainer} className="absolute top-0 left-0 size-0" />
    </MessageItem>
  );

  // Select mode disables the right-click menu (source parity), so the row skips
  // the ContextMenu wrapper entirely.
  if (selectionMode) {
    return messageItem;
  }

  return (
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
        onSavedChange={setSaved}
        onTaskChange={
          task
            ? (next) =>
                setTasks((tasks) =>
                  tasks.map((candidate) =>
                    candidate.id === task.id
                      ? { ...candidate, status: next === "done" ? "done" : "todo" }
                      : candidate,
                  ),
                )
            : undefined
        }
        onSelectMessage={onEnterSelectionMode}
        onOpenThread={openThread}
      >
        {translation && (workflow.translation === "idle" || workflow.translation === "pending") ? (
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
  );
}

export function PlaygroundMessageRow(props: PlaygroundMessageRowProps) {
  if (props.message.kind === "system") {
    return <PlaygroundSystemMessageRow message={props.message} />;
  }
  return <PlaygroundChatMessageRow {...props} message={props.message} />;
}
