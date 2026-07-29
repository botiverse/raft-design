import { useState } from "react";
import { Bookmark, MessageSquare, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import { Markdown } from "#/lib/markdown/markdown.tsx";
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
  MessageItemMeta,
  MessageItemSavedIndicator,
  MessageItemSearchMatch,
  MessageItemSelection,
  MessageItemSender,
  MessageItemTime,
  MessageMultiSelect,
  MessageMultiSelectCheckbox,
  MessageReactionAddButton,
} from "raft-ui/wip";
import { MessageReactionComposition } from "./reaction.compositions.tsx";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";
import {
  MessageItemExampleMarkdown,
  MessageItemExampleMarkdownClosing,
  MessageItemExampleMarkdownFollowUp,
  MessageItemExampleMarkdownLead,
} from "#/modules/message-item/message-item-example-markdown.tsx";
import { MessageRowToolbar } from "./row-toolbar.composition.tsx";
import { MessageQuickReactionPicker } from "./quick-reaction-picker.composition.tsx";
import markdownInputSource from "#/modules/markdown/markdown-input.md?raw";
import { MessageImageGallerySingleComposition } from "#/modules/message-media/compositions/image-gallery-single.composition.tsx";
import { MessageVideoPreviewComposition } from "#/modules/message-media/compositions/video-states.composition.tsx";
import { MessageFileAttachmentsComposition } from "#/modules/message-attachment/compositions/file-attachments.composition.tsx";

export type MessageItemPreviewChrome =
  | "default"
  | "active"
  | "search-match"
  | "selected"
  | "continuation";

export type MessageItemPreviewProps = {
  chrome?: MessageItemPreviewChrome;
  markdown?: boolean;
  image?: boolean;
  video?: boolean;
  files?: boolean;
  saved?: boolean;
  replies?: boolean;
  reactions?: boolean;
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
 * indicator, and reactions are driven by controls; the toolbar follows its
 * real row hover and focus-within behavior.
 */
export function MessageItemPreview({
  chrome = "default",
  markdown = false,
  image = false,
  video = false,
  files = false,
  saved = false,
  replies = false,
  reactions = false,
}: MessageItemPreviewProps) {
  const [isSaved, setIsSaved] = useState(saved);
  const [reaction, setReaction] = useState<string>();
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  // @docs-source-strip-start
  // Docs-playground plumbing: the controls panel is the source of truth, so
  // re-sync local state on the render pass where a control prop changes.
  const [savedControl, setSavedControl] = useState(saved);
  if (saved !== savedControl) {
    setSavedControl(saved);
    setIsSaved(saved);
  }
  // @docs-source-strip-end
  const continuation = chrome === "continuation";
  const messageBody = markdown ? (
    <Markdown>{markdownInputSource}</Markdown>
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
      <div ref={setPortalContainer}>
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
          <MessageRowToolbar
            saved={isSaved}
            portalContainer={portalContainer}
            onReact={setReaction}
            onSavedChange={setIsSaved}
          />
        </MessageItem>
        {reaction ? (
          <span className="sr-only" role="status">
            Reacted with {reaction}
          </span>
        ) : null}
      </div>
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
      {attachments}
      {footer}
    </MessageItemContent>
  );

  if (chrome === "selected") {
    return (
      <MessageMultiSelect defaultActive defaultSelected={new Set(["preview"])}>
        <div>
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
        </div>
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
    <div ref={setPortalContainer}>
      <RowChrome>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        {content}
        <MessageRowToolbar
          saved={isSaved}
          portalContainer={portalContainer}
          onReact={setReaction}
          onSavedChange={setIsSaved}
        />
      </RowChrome>
      {reaction ? (
        <span className="sr-only" role="status">
          Reacted with {reaction}
        </span>
      ) : null}
    </div>
  );
}
