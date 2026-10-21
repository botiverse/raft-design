import { DELEGATED_PLACEHOLDER_FACE_SRC } from "../message-item-delegated.fixtures.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemDelegatedAvatar,
  MessageItemDelegatedBy,
  MessageItemEmbedded,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  MessageQuotedPreview,
  MessageQuotedPreviewAuthor,
  MessageQuotedPreviewAuthorDelegatedBy,
  MessageQuotedPreviewAuthorName,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewHeader,
  MessageQuotedPreviewText,
  MessageQuotedPreviewTimestamp,
} from "@botiverse/raft-ui";

export function MessageItemDelegatedDeletedContent() {
  return (
    <div className="flex w-full max-w-3xl flex-col">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human">
            <AvatarFallback>A</AvatarFallback>
            <MessageItemDelegatedAvatar>
              <Avatar size="2xs" type="agent" className="bg-info grayscale opacity-60">
                <AvatarImage src={DELEGATED_PLACEHOLDER_FACE_SRC} alt="" />
              </Avatar>
            </MessageItemDelegatedAvatar>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Alice</MessageItemSender>
            <MessageItemDelegatedBy>sent by a deleted assistant</MessageItemDelegatedBy>
            <MessageItemTime dateTime="2026-10-19T16:05:00">Mon</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Moved the design review to Thursday at 4.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human">
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Martin</MessageItemSender>
            <MessageItemTime dateTime="2026-10-21T09:12:00">09:12</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Is this still the plan?</MessageItemBody>
          <MessageItemEmbedded>
            <MessageQuotedPreview>
              <MessageQuotedPreviewHeader>
                <MessageQuotedPreviewAuthor>
                  <Avatar size="xs" type="human">
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <MessageQuotedPreviewAuthorName>Alice</MessageQuotedPreviewAuthorName>
                  <MessageQuotedPreviewAuthorDelegatedBy>
                    (sent by a deleted assistant)
                  </MessageQuotedPreviewAuthorDelegatedBy>
                </MessageQuotedPreviewAuthor>
                <MessageQuotedPreviewTimestamp>Mon · 4:05 PM</MessageQuotedPreviewTimestamp>
              </MessageQuotedPreviewHeader>
              <MessageQuotedPreviewContent>
                <MessageQuotedPreviewText>
                  Moved the design review to Thursday at 4.
                </MessageQuotedPreviewText>
              </MessageQuotedPreviewContent>
            </MessageQuotedPreview>
          </MessageItemEmbedded>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
