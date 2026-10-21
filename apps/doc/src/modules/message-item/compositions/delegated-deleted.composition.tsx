import { DELEGATED_PLACEHOLDER_FACE_SRC } from "../message-item-delegated.fixtures.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemEmbedded,
  MessageItemHeader,
  MessageItemSender,
  MessageItemSenderGroup,
  MessageItemTime,
  MessageQuotedPreview,
  MessageQuotedPreviewAuthor,
  MessageQuotedPreviewAuthorName,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewHeader,
  MessageQuotedPreviewText,
  MessageQuotedPreviewTimestamp,
} from "@botiverse/raft-ui";
import {
  MessageItemDelegatedAvatar,
  MessageItemDelegatedBy,
  MessageQuotedPreviewAuthorDelegatedBy,
} from "@botiverse/raft-ui/wip";

export function MessageItemDelegatedDeletedContent() {
  return (
    <div className="flex w-full max-w-3xl flex-col">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human">
            <AvatarFallback>A</AvatarFallback>
            <MessageItemDelegatedAvatar deleted>
              <Avatar size="2xs" type="agent">
                <AvatarImage src={DELEGATED_PLACEHOLDER_FACE_SRC} alt="" />
              </Avatar>
            </MessageItemDelegatedAvatar>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSenderGroup>
              <MessageItemSender>Alice</MessageItemSender>
            </MessageItemSenderGroup>
            <MessageItemDelegatedBy>sent by a deleted assistant</MessageItemDelegatedBy>
            <MessageItemTime dateTime="2026-10-19T16:05:00">Mon</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Moved the design review to Thursday at 4.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human">
            <AvatarFallback>A</AvatarFallback>
            <MessageItemDelegatedAvatar deleted>
              <Avatar size="2xs" type="agent">
                <AvatarImage src={DELEGATED_PLACEHOLDER_FACE_SRC} alt="" />
              </Avatar>
            </MessageItemDelegatedAvatar>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSenderGroup>
              <MessageItemSender>Alice</MessageItemSender>
            </MessageItemSenderGroup>
            <MessageItemDelegatedBy>由已删除的助理代发</MessageItemDelegatedBy>
            <MessageItemTime dateTime="2026-10-19T16:06:00">Mon</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>设计评审改到周四下午四点。</MessageItemBody>
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
