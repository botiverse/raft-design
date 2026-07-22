import { useState } from "react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";

import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemEmbedded,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemNotice,
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
  MessageReference,
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
  const [openAttempted, setOpenAttempted] = useState(false);

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
          <MessageReference variant="unavailable">unavailable or deleted</MessageReference>.
        </MessageItemBody>
        <MessageItemEmbedded>
          <MessageQuotedPreviewUnavailable
            render={<button type="button" />}
            data-testid="quoted-message-card-unavailable"
            onClick={() => setOpenAttempted(true)}
          >
            <MessageQuotedPreviewContent>Message unavailable</MessageQuotedPreviewContent>
          </MessageQuotedPreviewUnavailable>
          {openAttempted ? (
            <MessageItemNotice>
              Unable to open thread. It may be unavailable or deleted.
            </MessageItemNotice>
          ) : null}
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}

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
