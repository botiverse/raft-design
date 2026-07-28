import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage, MessageReferenceUnavailable } from "raft-ui";

import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemEmbedded,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewLoading,
  MessageQuotedPreviewLoadingAvatar,
  MessageQuotedPreviewLoadingContent,
  MessageQuotedPreviewLoadingHeader,
  MessageQuotedPreviewLoadingLine,
  MessageQuotedPreviewLoadingLines,
  MessageQuotedPreviewUnavailable,
} from "raft-ui/wip";
import { QuotedPreviewMessageComposition } from "./quoted-preview-message.composition.tsx";

export function QuotedPreviewLoadingComposition() {
  return (
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
          <MessageItemTime>2:26 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Loading quoted message context.</MessageItemBody>
        <MessageItemEmbedded>
          <MessageQuotedPreviewLoading data-testid="quoted-message-card-loading">
            <MessageQuotedPreviewLoadingHeader />
            <MessageQuotedPreviewLoadingContent>
              <MessageQuotedPreviewLoadingAvatar />
              <MessageQuotedPreviewLoadingLines>
                <MessageQuotedPreviewLoadingLine className="w-32" />
                <MessageQuotedPreviewLoadingLine className="w-full" />
                <MessageQuotedPreviewLoadingLine className="w-3/4" />
              </MessageQuotedPreviewLoadingLines>
            </MessageQuotedPreviewLoadingContent>
          </MessageQuotedPreviewLoading>
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}

export function QuotedPreviewUnavailableComposition() {
  return (
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
          <MessageItemTime>2:27 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          The linked thread is{" "}
          <MessageReferenceUnavailable>unavailable or deleted</MessageReferenceUnavailable>.
        </MessageItemBody>
        <MessageItemEmbedded>
          <MessageQuotedPreviewUnavailable data-testid="quoted-message-card-unavailable">
            <MessageQuotedPreviewContent>Message unavailable</MessageQuotedPreviewContent>
          </MessageQuotedPreviewUnavailable>
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}

// @docs-source-strip-start
export function QuotedPreviewFeedbackComposition() {
  return (
    <div className="grid gap-4">
      <QuotedPreviewLoadingComposition />
      <QuotedPreviewUnavailableComposition />
    </div>
  );
}

export function MessageQuotedPreviewShowcaseComposition() {
  return (
    <div className="grid w-full max-w-3xl gap-4">
      <QuotedPreviewMessageComposition />
      <QuotedPreviewFeedbackComposition />
    </div>
  );
}
// @docs-source-strip-end
