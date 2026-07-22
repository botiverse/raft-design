import { useState } from "react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
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
  MessageReference,
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
        <Avatar size="md" type="agent">
          <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
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
  return (
    <QuotedPreviewMessage sender="Ada" time="2:25 PM">
      <MessageItemBody>Quoting the final decision from the release thread.</MessageItemBody>
      <MessageItemEmbedded>
        <MessageQuotedPreview render={<button type="button" />} data-testid="quoted-message-card">
          <MessageQuotedPreviewContent>
            <MessageQuotedPreviewHeader>
              <MessageQuotedPreviewContext>
                <MessageQuotedPreviewChannel>
                  <Hash size={11} />
                  release-notes
                </MessageQuotedPreviewChannel>
                <MessageQuotedPreviewSeparator>·</MessageQuotedPreviewSeparator>
                <MessageQuotedPreviewAuthor>
                  <Avatar size="xs" type="agent">
                    <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
                    <AvatarFallback>AT</AvatarFallback>
                  </Avatar>
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
      </MessageItemEmbedded>
    </QuotedPreviewMessage>
  );
}

export function QuotedPreviewFeedbackComposition() {
  const [failed, setFailed] = useState(false);

  return (
    <QuotedPreviewMessage sender="Atlas" time="2:26 PM">
      <MessageItemBody>
        The linked thread is{" "}
        <MessageReference variant="unavailable">unavailable or deleted</MessageReference>.
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
          onClick={() => setFailed(true)}
        >
          <MessageQuotedPreviewContent>Message unavailable</MessageQuotedPreviewContent>
        </MessageQuotedPreviewUnavailable>
        {failed ? (
          <MessageItemNotice>
            Unable to open thread. It may be unavailable or deleted.
          </MessageItemNotice>
        ) : null}
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
