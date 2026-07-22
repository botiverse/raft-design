import { useState } from "react";
import { MessageItemExampleAvatar } from "#/modules/message-item/message-item-example-avatar.tsx";
import { Hash, MessageSquare } from "lucide-react";

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
  MessageQuotedPreview,
  MessageQuotedPreviewAttachment,
  MessageQuotedPreviewAttachments,
  MessageQuotedPreviewAuthor,
  MessageQuotedPreviewAuthorMeta,
  MessageQuotedPreviewAuthorName,
  MessageQuotedPreviewBody,
  MessageQuotedPreviewChannel,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewContext,
  MessageQuotedPreviewHeader,
  MessageQuotedPreviewLoading,
  MessageQuotedPreviewLoadingAvatar,
  MessageQuotedPreviewLoadingContent,
  MessageQuotedPreviewLoadingHeader,
  MessageQuotedPreviewLoadingLine,
  MessageQuotedPreviewLoadingLines,
  MessageQuotedPreviewSeparator,
  MessageQuotedPreviewText,
  MessageQuotedPreviewTimestamp,
  MessageQuotedPreviewUnavailable,
  MessageReferenceThreadUnavailable,
} from "raft-ui/wip";

function QuotedPreviewMessage({
  children,
  sender,
  time,
}: {
  children: React.ReactNode;
  sender: string;
  time: string;
}) {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <MessageItemExampleAvatar />
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>{sender}</MessageItemSender>
          <MessageItemMeta>claude-opus</MessageItemMeta>
          <MessageItemTime>{time}</MessageItemTime>
        </MessageItemHeader>
        {children}
      </MessageItemContent>
    </MessageItem>
  );
}

export function QuotedPreviewMessageComposition() {
  const [opened, setOpened] = useState(false);

  return (
    <QuotedPreviewMessage sender="Ada" time="2:25 PM">
      <MessageItemBody>Quoting the final decision from the release thread.</MessageItemBody>
      <MessageItemEmbedded>
        <MessageQuotedPreview
          render={<button type="button" />}
          data-testid="quoted-message-card"
          onClick={() => setOpened(true)}
        >
          <MessageQuotedPreviewContent>
            <MessageQuotedPreviewHeader>
              <MessageQuotedPreviewContext>
                <MessageQuotedPreviewChannel>
                  <Hash size={11} />
                  release-notes
                </MessageQuotedPreviewChannel>
                <MessageQuotedPreviewSeparator>·</MessageQuotedPreviewSeparator>
                <MessageQuotedPreviewAuthor>
                  <MessageItemExampleAvatar size="xs" />
                  <MessageQuotedPreviewAuthorName>Atlas</MessageQuotedPreviewAuthorName>
                  <MessageQuotedPreviewAuthorMeta>
                    Design-system agent
                  </MessageQuotedPreviewAuthorMeta>
                </MessageQuotedPreviewAuthor>
                <MessageQuotedPreviewSeparator>·</MessageQuotedPreviewSeparator>
                <MessageQuotedPreviewChannel>
                  <MessageSquare size={10} />
                  Thread
                </MessageQuotedPreviewChannel>
              </MessageQuotedPreviewContext>
              <MessageQuotedPreviewTimestamp>Jul 15 · 2:14 PM</MessageQuotedPreviewTimestamp>
            </MessageQuotedPreviewHeader>
            <MessageQuotedPreviewBody>
              <MessageQuotedPreviewText>
                The implementation should preserve Brutal markup before any Elegant treatment is
                added.
              </MessageQuotedPreviewText>
              <MessageQuotedPreviewAttachments>
                <MessageQuotedPreviewAttachment>2 attachments</MessageQuotedPreviewAttachment>
              </MessageQuotedPreviewAttachments>
            </MessageQuotedPreviewBody>
          </MessageQuotedPreviewContent>
        </MessageQuotedPreview>
        {opened ? <MessageItemNotice>Opened quoted message.</MessageItemNotice> : null}
      </MessageItemEmbedded>
    </QuotedPreviewMessage>
  );
}

export function QuotedPreviewFeedbackComposition() {
  const [retried, setRetried] = useState(false);

  return (
    <QuotedPreviewMessage sender="Atlas" time="2:26 PM">
      <MessageItemBody>
        The linked thread is{" "}
        <MessageReferenceThreadUnavailable>
          unavailable or deleted
        </MessageReferenceThreadUnavailable>
        .
      </MessageItemBody>
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
        <MessageQuotedPreviewUnavailable
          render={<button type="button" />}
          data-testid="quoted-message-card-unavailable"
          onClick={() => setRetried(true)}
        >
          <MessageQuotedPreviewContent>Message unavailable</MessageQuotedPreviewContent>
        </MessageQuotedPreviewUnavailable>
        {retried ? <MessageItemNotice>Retry requested.</MessageItemNotice> : null}
      </MessageItemEmbedded>
    </QuotedPreviewMessage>
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
