import { useState } from "react";
import { AlertTriangle, Bookmark, Languages, MessageSquare, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import {
  MessageItem,
  MessageItemActive,
  MessageItemAttachments,
  MessageItemAvatarSlot,
  MessageItemBadge,
  MessageItemBody,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemFooter,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemInteractionBoundary,
  MessageItemMeta,
  MessageItemSavedIndicator,
  MessageItemSearchMatch,
  MessageItemSelection,
  MessageItemSender,
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
} from "raft-ui/wip";
import { MessageReactionComposition } from "./reaction.compositions.tsx";
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
import { MessageMarkdownComposition } from "#/modules/message-markdown/compositions/markdown.composition.tsx";
import { MessageImageGallerySingleComposition } from "#/modules/message-media/compositions/image-gallery-single.composition.tsx";
import { MessageVideoPreviewComposition } from "#/modules/message-media/compositions/video-states.composition.tsx";
import { MessageFileAttachmentsComposition } from "#/modules/message-attachment/compositions/file-attachments.composition.tsx";

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

export type MessageItemPreviewProps = {
  chrome?: MessageItemPreviewChrome;
  markdown?: boolean;
  translation?: MessageItemPreviewTranslation;
  image?: boolean;
  video?: boolean;
  files?: boolean;
  saved?: boolean;
  replies?: boolean;
  reactions?: boolean;
  toolbar?: boolean;
};

// @docs-source-strip-start
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
        <MessageReactionAddButton aria-label="Add reaction" className="md:hidden">
          <Plus strokeWidth={2.5} />
        </MessageReactionAddButton>
      }
      side="top"
      align="center"
      portalContainer={portalContainer}
    />
  );
}
// @docs-source-strip-end

/**
 * Configurable authored row for the docs playground. Row chrome, the saved
 * indicator, reactions, and the hover toolbar are driven by controls; business
 * state and copy stay caller-owned like every other composition.
 */
export function MessageItemPreview({
  chrome = "default",
  markdown = false,
  translation = "none",
  image = false,
  video = false,
  files = false,
  saved = false,
  replies = false,
  reactions = false,
  toolbar = false,
}: MessageItemPreviewProps) {
  const [isSaved, setIsSaved] = useState(saved);
  const [reaction, setReaction] = useState<string>();
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [retryingTranslation, setRetryingTranslation] = useState(false);
  // @docs-source-strip-start
  // Docs-playground plumbing: the controls panel is the source of truth, so
  // re-sync local state on the render pass where a control prop changes.
  const [savedControl, setSavedControl] = useState(saved);
  if (saved !== savedControl) {
    setSavedControl(saved);
    setIsSaved(saved);
  }
  const [translationControl, setTranslationControl] = useState(translation);
  if (translation !== translationControl) {
    setTranslationControl(translation);
    setShowOriginal(false);
    setRetryingTranslation(false);
  }
  // @docs-source-strip-end
  const continuation = chrome === "continuation";
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
      <MessageMarkdownComposition imageSrc={MESSAGE_FIXTURE_IMAGE_SRC} />
    ) : (
      <MessageItemExampleMarkdown portalContainer={portalContainer} />
    );

  const footer =
    isSaved || replies || reactions ? (
      <MessageItemFooter>
        {isSaved ? (
          <MessageItemSavedIndicator
            aria-label="Remove from Saved"
            render={<button type="button" onClick={() => setIsSaved(false)} />}
          >
            <Bookmark fill="currentColor" />
            <span>Saved</span>
          </MessageItemSavedIndicator>
        ) : null}
        {replies ? (
          <MessageItemBadge status="read">
            <MessageSquare />
            <span>2 replies</span>
          </MessageItemBadge>
        ) : null}
        {reactions ? (
          <>
            <MessageReactionComposition emoji="👍" count={3} reacted />
            <MessageReactionComposition emoji="🔥" count={1} />
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
              <MessageItemMeta>owner</MessageItemMeta>
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
        <MessageItemMeta>owner</MessageItemMeta>
        <MessageItemTime>2:14 PM</MessageItemTime>
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
          <Avatar size="md" type="agent">
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
