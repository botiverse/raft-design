import { useState } from "react";
import { AlertTriangle, Bookmark, Languages, MessageSquare, Pencil, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
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
  MessageItemFooter,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemInlineStatus,
  MessageItemInteractionBoundary,
  MessageItemMeta,
  MessageItemSavedIndicator,
  MessageItemSearchMatch,
  MessageItemSelection,
  MessageItemSender,
  MessageItemSenderState,
  MessageItemTime,
  MessageItemTranslationAction,
  MessageItemTranslationOriginal,
  MessageItemTranslationOriginalLabel,
  MessageItemTranslationPlaceholder,
  MessageItemTranslationStatus,
  MessageMarkdown,
  MessageReactionAddButton,
  MessageMultiSelect,
  MessageMultiSelectCheckbox,
  SystemMessage,
  SystemMessageContent,
  SystemMessageGroup,
  SystemMessageGroupChevron,
  SystemMessageGroupDisclosure,
  SystemMessageGroupHeader,
  SystemMessageGroupPanel,
  SystemMessageGroupSummary,
  SystemMessageTime,
} from "raft-ui/wip";
import { MessageReactionComposition } from "./reaction.compositions.tsx";
import { MessageTaskStatusBadgeComposition } from "./task-badge.composition.tsx";
import {
  MESSAGE_FIXTURE_AVATAR_SRC,
  MESSAGE_FIXTURE_IMAGE_SRC,
} from "#/modules/message-item/message-item.fixtures.ts";
import {
  MessageItemExampleMarkdown,
  MessageItemExampleMarkdownClosing,
  MessageItemExampleMarkdownFollowUp,
  MessageItemExampleMarkdownLead,
} from "#/modules/message-item/message-item-example-markdown.tsx";
import { MessageRowToolbar } from "./row-toolbar.composition.tsx";
import { MessageQuickReactionPicker } from "./quick-reaction-picker.composition.tsx";
import {
  MessageCodeBlockComposition,
  MessageMarkdownComposition,
} from "#/modules/message-markdown/compositions/markdown.composition.tsx";
import { ActionCardMessageComposition } from "#/modules/message-action-card/compositions/action-card-message.composition.tsx";
import { QuotedPreviewMessageComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-message.composition.tsx";
import { QuotedPreviewFeedbackComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview.composition.tsx";
import { ForwardedBundleMessageComposition } from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx";
import {
  MessageImageGallerySingleComposition,
  MessageVideoPreviewComposition,
} from "#/modules/message-media/compositions/media.compositions.tsx";
import { MessageFileAttachmentsComposition } from "#/modules/message-attachment/compositions/message-attachments-showcase.composition.tsx";

export type MessageProductStatePreviewState = "forwarded" | "quoted" | "quoted-feedback" | "action";

function MessageProductStatePreview({ state }: { state: MessageProductStatePreviewState }) {
  if (state === "forwarded") return <ForwardedBundleMessageComposition />;
  if (state === "quoted") return <QuotedPreviewMessageComposition />;
  if (state === "quoted-feedback") return <QuotedPreviewFeedbackComposition />;
  return <ActionCardMessageComposition />;
}

export type MessageItemPreviewChrome =
  | "default"
  | "active"
  | "search-match"
  | "selected"
  | "continuation";

export type MessageItemPreviewTranslation =
  | "none"
  | "pending"
  | "translated"
  | "bilingual"
  | "failed";

export type MessageItemPreviewProductState = "none" | MessageProductStatePreviewState;

export type MessageItemPreviewSenderState = "none" | "deleted" | "left" | "removed";

export type MessageItemPreviewSystemEvent = "archive" | "task-assigned" | "group";

export type MessageItemPreviewProps = {
  chrome?: MessageItemPreviewChrome;
  meta?: boolean;
  markdown?: boolean;
  translation?: MessageItemPreviewTranslation;
  productState?: MessageItemPreviewProductState;
  senderState?: MessageItemPreviewSenderState;
  converting?: boolean;
  systemEvent?: MessageItemPreviewSystemEvent;
  task?: boolean;
  image?: boolean;
  video?: boolean;
  files?: boolean;
  saved?: boolean;
  replies?: boolean;
  newReplies?: boolean;
  draftReply?: boolean;
  reactions?: boolean;
  mobileReactionAdd?: boolean;
  toolbar?: boolean;
};

function MessageSystemGroupPreview() {
  const [open, setOpen] = useState(false);
  const summary = "There are 2 task updates";

  return (
    <SystemMessageGroup open={open} onOpenChange={setOpen}>
      <SystemMessageGroupHeader>
        <SystemMessageGroupDisclosure>
          <SystemMessageGroupSummary>{summary}</SystemMessageGroupSummary>
          <SystemMessageGroupChevron />
        </SystemMessageGroupDisclosure>
      </SystemMessageGroupHeader>
      <SystemMessageGroupPanel>
        <SystemMessage>
          <SystemMessageTime>2:18 PM</SystemMessageTime>
          <SystemMessageContent>
            ✅ Atlas moved #41 &quot;Release review checklist&quot; to Done
          </SystemMessageContent>
        </SystemMessage>
        <SystemMessage>
          <SystemMessageTime>2:19 PM</SystemMessageTime>
          <SystemMessageContent>
            📌 Assigned @Ada to task #42 &quot;Polish MessageItem docs&quot;
          </SystemMessageContent>
        </SystemMessage>
      </SystemMessageGroupPanel>
    </SystemMessageGroup>
  );
}

function MessageSystemPreview({ event }: { event: MessageItemPreviewSystemEvent }) {
  if (event === "group") return <MessageSystemGroupPreview />;

  return (
    <SystemMessage>
      <SystemMessageTime>2:17 PM</SystemMessageTime>
      {event === "task-assigned" ? (
        <SystemMessageContent>
          📌 Assigned @Ada to task #42 &quot;Polish MessageItem docs&quot;
        </SystemMessageContent>
      ) : (
        <SystemMessageContent>📦 Atlas archived this channel</SystemMessageContent>
      )}
    </SystemMessage>
  );
}

export function MessageMobileReactionAdd({
  portalContainer,
  onReact,
}: {
  portalContainer: HTMLElement | null;
  onReact: (emoji: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <MessageQuickReactionPicker
      open={open}
      onOpenChange={setOpen}
      onReact={onReact}
      trigger={
        <MessageReactionAddButton
          aria-label="Add reaction"
          data-message-affordance="mobile-reaction-add"
          className="md:hidden"
        >
          <Plus strokeWidth={2.5} />
        </MessageReactionAddButton>
      }
      side="top"
      align="center"
      portalContainer={portalContainer}
    />
  );
}

/**
 * Configurable authored row for the docs playground. Row chrome, the saved
 * indicator, reactions, and the hover toolbar are driven by controls; business
 * state and copy stay caller-owned like every other composition.
 */
export function MessageItemPreview({
  chrome = "default",
  meta = true,
  markdown = false,
  translation = "none",
  productState = "none",
  senderState = "none",
  converting = false,
  systemEvent,
  task = false,
  image = false,
  video = false,
  files = false,
  saved = false,
  replies = false,
  newReplies = false,
  draftReply = false,
  reactions = false,
  mobileReactionAdd = false,
  toolbar = false,
}: MessageItemPreviewProps) {
  // The Saved control is the source of truth; footer and toolbar share one state
  // so the in-preview save button and the control never diverge. Re-sync on the
  // render pass where the control prop changes (no effect needed).
  const [isSaved, setIsSaved] = useState(saved);
  const [savedControl, setSavedControl] = useState(saved);
  if (saved !== savedControl) {
    setSavedControl(saved);
    setIsSaved(saved);
  }
  const [reaction, setReaction] = useState<string>();
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [translationControl, setTranslationControl] = useState(translation);
  const [retryingTranslation, setRetryingTranslation] = useState(false);
  if (translation !== translationControl) {
    setTranslationControl(translation);
    setShowOriginal(false);
    setRetryingTranslation(false);
  }
  const continuation = chrome === "continuation";

  if (systemEvent) return <MessageSystemPreview event={systemEvent} />;

  if (!continuation && productState !== "none") {
    return <MessageProductStatePreview state={productState} />;
  }
  const translationState = retryingTranslation ? "pending" : translation;

  const originalTranslation = "Keep this original message available for the team.";
  const translatedMessage = "让团队保留这条原始消息。";

  const translationStatus =
    translationState === "none" ? null : (
      <MessageItemTranslationStatus
        tone={
          translationState === "failed"
            ? "failed"
            : translationState === "pending"
              ? "pending"
              : "normal"
        }
        data-testid={`message-translation-indicator-preview`}
      >
        {translationState === "failed" ? <AlertTriangle size={12} /> : <Languages size={12} />}
        {translationState === "pending" ? <span>Translating…</span> : null}
        {translationState === "failed" ? (
          <>
            <span>Translation unavailable</span>
            <span aria-hidden>·</span>
            <MessageItemTranslationAction
              tone="failed"
              title="Translation unavailable"
              aria-label="Retry"
              onClick={() => setRetryingTranslation(true)}
            >
              Retry
            </MessageItemTranslationAction>
          </>
        ) : null}
        {translationState === "translated" || translationState === "bilingual" ? (
          <MessageItemTranslationAction
            title={showOriginal ? "Original shown. Show translation" : "Translated. Show original"}
            aria-label={showOriginal ? "Show translation" : "Show original"}
            onClick={() => setShowOriginal((current) => !current)}
          >
            {showOriginal ? "Show translation" : "Show original"}
          </MessageItemTranslationAction>
        ) : null}
      </MessageItemTranslationStatus>
    );

  const messageBody =
    translationState === "pending" ? (
      <MessageItemTranslationPlaceholder data-testid="message-translation-placeholder-preview" />
    ) : translationState === "translated" || translationState === "bilingual" ? (
      <MessageMarkdown>
        <p>{showOriginal ? originalTranslation : translatedMessage}</p>
      </MessageMarkdown>
    ) : translationState === "failed" ? (
      <MessageMarkdown>
        <p>{originalTranslation}</p>
      </MessageMarkdown>
    ) : markdown ? (
      <>
        <MessageMarkdownComposition imageSrc={MESSAGE_FIXTURE_IMAGE_SRC} />
        <MessageCodeBlockComposition />
      </>
    ) : (
      <MessageItemExampleMarkdown portalContainer={portalContainer} />
    );

  const footer =
    task || isSaved || replies || draftReply || reactions ? (
      <MessageItemFooter>
        {task ? <MessageTaskStatusBadgeComposition portalContainer={portalContainer} /> : null}
        {isSaved ? (
          <MessageItemSavedIndicator
            aria-label="Remove from Saved"
            render={<button type="button" onClick={() => setIsSaved(false)} />}
          >
            <Bookmark fill="currentColor" />
            <span>Saved</span>
          </MessageItemSavedIndicator>
        ) : null}
        {replies || draftReply ? (
          <MessageItemBadge status={newReplies ? "unread" : "read"}>
            {replies ? <MessageSquare /> : <Pencil className="text-foreground-muted" />}
            {replies ? <span>2 replies</span> : null}
            {newReplies ? (
              <>
                <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>
                <span>1 new</span>
              </>
            ) : null}
            {draftReply ? (
              <>
                {replies || newReplies ? (
                  <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>
                ) : null}
                {replies ? <Pencil className="text-foreground-muted" /> : null}
                <span className="text-foreground-muted">draft</span>
              </>
            ) : null}
          </MessageItemBadge>
        ) : null}
        {reactions ? (
          <>
            <MessageReactionComposition emoji="👍" count={3} reacted />
            <MessageReactionComposition emoji="🔥" count={1} />
            {mobileReactionAdd ? (
              <MessageMobileReactionAdd portalContainer={portalContainer} onReact={setReaction} />
            ) : null}
          </>
        ) : null}
      </MessageItemFooter>
    ) : null;

  const attachments =
    image || video || files ? (
      <MessageItemAttachments>
        {image ? <MessageImageGallerySingleComposition /> : null}
        {video ? <MessageVideoPreviewComposition /> : null}
        {files ? <MessageFileAttachmentsComposition /> : null}
      </MessageItemAttachments>
    ) : null;

  if (continuation) {
    return (
      <MessageItemInteractionBoundary ref={setPortalContainer}>
        <MessageItem>
          <MessageItemAvatarSlot>
            <Avatar size="md" type="agent">
              <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
              <AvatarFallback>AT</AvatarFallback>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Atlas</MessageItemSender>
              {meta ? <MessageItemMeta>owner</MessageItemMeta> : null}
              <MessageItemTime>2:14 PM</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>
              <MessageItemExampleMarkdownLead portalContainer={portalContainer} />
            </MessageItemBody>
          </MessageItemContent>
        </MessageItem>
        <MessageItem compact>
          <MessageItemGutter>
            <MessageItemContinuationTime>2:15</MessageItemContinuationTime>
          </MessageItemGutter>
          <MessageItemContent>
            <MessageItemBody>
              <MessageItemExampleMarkdownFollowUp portalContainer={portalContainer} />
            </MessageItemBody>
          </MessageItemContent>
        </MessageItem>
        <MessageItem compact>
          <MessageItemGutter>
            <MessageItemContinuationTime>2:16</MessageItemContinuationTime>
          </MessageItemGutter>
          <MessageItemContent>
            <MessageItemBody>
              <MessageItemExampleMarkdownClosing portalContainer={portalContainer} />
            </MessageItemBody>
            {attachments}
            {footer}
          </MessageItemContent>
          {toolbar ? (
            <MessageRowToolbar
              saved={isSaved}
              visible
              portalContainer={portalContainer}
              onReact={setReaction}
              onSavedChange={setIsSaved}
            />
          ) : null}
        </MessageItem>
        {reaction ? (
          <span className="sr-only" role="status">
            Reacted with {reaction}
          </span>
        ) : null}
      </MessageItemInteractionBoundary>
    );
  }

  const content = (
    <MessageItemContent>
      <MessageItemHeader>
        <MessageItemSender>Atlas</MessageItemSender>
        {senderState !== "none" ? (
          <MessageItemSenderState>
            {senderState === "deleted" ? "Deleted" : senderState === "left" ? "Left" : "Removed"}
          </MessageItemSenderState>
        ) : null}
        {meta ? <MessageItemMeta>owner</MessageItemMeta> : null}
        <MessageItemTime>2:14 PM</MessageItemTime>
        {converting ? <MessageItemInlineStatus>Converting…</MessageItemInlineStatus> : null}
      </MessageItemHeader>
      <MessageItemBody>{messageBody}</MessageItemBody>
      {translationState === "bilingual" && !showOriginal ? (
        <MessageItemTranslationOriginal data-testid="message-translation-bilingual-original-preview">
          <MessageItemTranslationOriginalLabel>Original</MessageItemTranslationOriginalLabel>
          <MessageMarkdown>
            <p>{originalTranslation}</p>
          </MessageMarkdown>
        </MessageItemTranslationOriginal>
      ) : null}
      {translationStatus}
      {attachments}
      {footer}
    </MessageItemContent>
  );

  if (chrome === "selected") {
    return (
      <MessageMultiSelect defaultActive defaultSelected={new Set(["preview"])}>
        <MessageItemInteractionBoundary>
          <MessageItemSelection>
            <MessageMultiSelectCheckbox value="preview" aria-label="Select message" />
            <MessageItemAvatarSlot>
              <Avatar size="md" type="agent">
                <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
                <AvatarFallback>AT</AvatarFallback>
              </Avatar>
            </MessageItemAvatarSlot>
            {content}
          </MessageItemSelection>
        </MessageItemInteractionBoundary>
      </MessageMultiSelect>
    );
  }

  const RowChrome =
    chrome === "active"
      ? MessageItemActive
      : chrome === "search-match"
        ? MessageItemSearchMatch
        : MessageItem;

  return (
    <MessageItemInteractionBoundary ref={setPortalContainer}>
      <RowChrome>
        <MessageItemAvatarSlot>
          <Avatar
            size="md"
            type="agent"
            className={senderState === "deleted" ? "grayscale opacity-60" : undefined}
          >
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        {content}
        {toolbar ? (
          <MessageRowToolbar
            saved={isSaved}
            visible
            portalContainer={portalContainer}
            onReact={setReaction}
            onSavedChange={setIsSaved}
          />
        ) : null}
      </RowChrome>
      {reaction ? (
        <span className="sr-only" role="status">
          Reacted with {reaction}
        </span>
      ) : null}
    </MessageItemInteractionBoundary>
  );
}
