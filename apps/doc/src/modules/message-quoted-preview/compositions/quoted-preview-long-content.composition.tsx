import { Hash, Link } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageReferenceChip,
  MessageReferenceLabel,
} from "raft-ui";
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
  MessageQuotedPreview,
  MessageQuotedPreviewAttachment,
  MessageQuotedPreviewAttachments,
  MessageQuotedPreviewAuthor,
  MessageQuotedPreviewAuthorName,
  MessageQuotedPreviewChannel,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewHeader,
  MessageQuotedPreviewInset,
  MessageQuotedPreviewText,
  MessageQuotedPreviewTimestamp,
} from "raft-ui/wip";

import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";
import { QUOTED_PREVIEW_AVATAR_SRC } from "../message-quoted-preview.fixtures.ts";

export function QuotedPreviewLongContentComposition() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="md" type="human">
          <AvatarImage src={QUOTED_PREVIEW_AVATAR_SRC.ravi} alt="" />
          <AvatarFallback>R</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Ravi</MessageItemSender>
          <MessageItemMeta>member</MessageItemMeta>
          <MessageItemTime>2:38 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          <MessageReferenceChip
            variant="link"
            render={
              <a
                href={MESSAGE_PLAYGROUND_URLS.stateModelTask}
                aria-label="Open platform migration message"
              />
            }
          >
            <Link />
            <MessageReferenceLabel>#platform-migration</MessageReferenceLabel>
          </MessageReferenceChip>
        </MessageItemBody>
        <MessageItemEmbedded>
          <MessageQuotedPreview
            render={
              <a
                href={MESSAGE_PLAYGROUND_URLS.stateModelTask}
                aria-label="Open quoted migration plan"
              />
            }
          >
            <MessageQuotedPreviewHeader>
              <MessageQuotedPreviewAuthor>
                <Avatar size="xs" type="human">
                  <AvatarImage src={QUOTED_PREVIEW_AVATAR_SRC.kai} alt="" />
                  <AvatarFallback>K</AvatarFallback>
                </Avatar>
                <MessageQuotedPreviewAuthorName>Kai</MessageQuotedPreviewAuthorName>
              </MessageQuotedPreviewAuthor>
              <MessageQuotedPreviewChannel>
                <Hash size={11} />
                platform-migration
              </MessageQuotedPreviewChannel>
              <MessageQuotedPreviewTimestamp>Yesterday · 4:46 PM</MessageQuotedPreviewTimestamp>
            </MessageQuotedPreviewHeader>
            <MessageQuotedPreviewInset>
              <MessageQuotedPreviewContent>
                <MessageQuotedPreviewText>
                  Before we cut over, keep the read model running against both event streams,
                  validate account and workspace permissions in the staging environment, and only
                  then move the webhook consumers to the new endpoint.
                </MessageQuotedPreviewText>
                <MessageQuotedPreviewAttachments>
                  <MessageQuotedPreviewAttachment>2 attachments</MessageQuotedPreviewAttachment>
                </MessageQuotedPreviewAttachments>
              </MessageQuotedPreviewContent>
            </MessageQuotedPreviewInset>
          </MessageQuotedPreview>
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}
