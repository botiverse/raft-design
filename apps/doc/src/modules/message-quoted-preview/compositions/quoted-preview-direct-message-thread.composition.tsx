import { Link, MessageSquare } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageQuotedPreview,
  MessageQuotedPreviewAuthor,
  MessageQuotedPreviewAuthorName,
  MessageQuotedPreviewChannel,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewHeader,
  MessageQuotedPreviewText,
  MessageQuotedPreviewThread,
  MessageQuotedPreviewTimestamp,
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
} from "raft-ui/wip";

import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";
import { QUOTED_PREVIEW_AVATAR_SRC } from "../message-quoted-preview.fixtures.ts";

export function QuotedPreviewDirectMessageThreadComposition() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="md" type="human">
          <AvatarImage src={QUOTED_PREVIEW_AVATAR_SRC.mai} alt="" />
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Mai</MessageItemSender>
          <MessageItemMeta>member</MessageItemMeta>
          <MessageItemTime>2:34 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          <MessageReferenceChip
            variant="link"
            render={
              <a
                href={MESSAGE_PLAYGROUND_URLS.noahDmThread}
                aria-label="Open Atlas direct-message thread"
              />
            }
          >
            <Link />
            <MessageReferenceLabel>@Atlas</MessageReferenceLabel>
          </MessageReferenceChip>
        </MessageItemBody>
        <MessageItemEmbedded>
          <MessageQuotedPreview
            render={
              <a
                href={MESSAGE_PLAYGROUND_URLS.noahDmThread}
                aria-label="Open quoted DM thread reply"
              />
            }
          >
            <MessageQuotedPreviewHeader>
              <MessageQuotedPreviewAuthor>
                <Avatar size="xs" type="agent">
                  <AvatarImage src={QUOTED_PREVIEW_AVATAR_SRC.atlas} alt="" />
                  <AvatarFallback>AT</AvatarFallback>
                </Avatar>
                <MessageQuotedPreviewAuthorName>Atlas</MessageQuotedPreviewAuthorName>
              </MessageQuotedPreviewAuthor>
              <MessageQuotedPreviewChannel>@Atlas</MessageQuotedPreviewChannel>
              <MessageQuotedPreviewThread>
                <MessageSquare size={10} />
                Thread
              </MessageQuotedPreviewThread>
              <MessageQuotedPreviewTimestamp>Today · 8:29 AM</MessageQuotedPreviewTimestamp>
            </MessageQuotedPreviewHeader>
            <MessageQuotedPreviewContent>
              <MessageQuotedPreviewText>
                I&apos;ll post the follow-up in this conversation once the handoff is complete.
              </MessageQuotedPreviewText>
            </MessageQuotedPreviewContent>
          </MessageQuotedPreview>
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}
