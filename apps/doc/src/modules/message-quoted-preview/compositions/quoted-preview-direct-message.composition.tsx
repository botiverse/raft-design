import { Link2 } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageReferenceChip,
  MessageReferenceLabel,
  MessageReferenceMeta,
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
  MessageQuotedPreviewAuthor,
  MessageQuotedPreviewAuthorName,
  MessageQuotedPreviewChannel,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewContext,
  MessageQuotedPreviewHeader,
  MessageQuotedPreviewText,
  MessageQuotedPreviewTimestamp,
} from "raft-ui/wip";

import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";
import { QUOTED_PREVIEW_AVATAR_SRC } from "../message-quoted-preview.fixtures.ts";

export function QuotedPreviewDirectMessageComposition() {
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
          <MessageItemTime>2:31 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          <MessageReferenceChip
            variant="link"
            render={
              <a href={MESSAGE_PLAYGROUND_URLS.noahDm} aria-label="Open Atlas direct message" />
            }
          >
            <Link2 />
            <MessageReferenceLabel>@Atlas</MessageReferenceLabel>
            <MessageReferenceMeta>msg</MessageReferenceMeta>
          </MessageReferenceChip>
        </MessageItemBody>
        <MessageItemEmbedded>
          <MessageQuotedPreview
            render={
              <a
                href={MESSAGE_PLAYGROUND_URLS.stateModelTask}
                aria-label="Open quoted direct message"
              />
            }
          >
            <MessageQuotedPreviewHeader>
              <MessageQuotedPreviewChannel>@Atlas</MessageQuotedPreviewChannel>
              <MessageQuotedPreviewTimestamp>Today · 8:24 AM</MessageQuotedPreviewTimestamp>
            </MessageQuotedPreviewHeader>
            <MessageQuotedPreviewContent>
              <MessageQuotedPreviewContext>
                <MessageQuotedPreviewAuthor>
                  <Avatar size="xs" type="agent">
                    <AvatarImage src={QUOTED_PREVIEW_AVATAR_SRC.atlas} alt="" />
                    <AvatarFallback>AT</AvatarFallback>
                  </Avatar>
                  <MessageQuotedPreviewAuthorName>Atlas</MessageQuotedPreviewAuthorName>
                </MessageQuotedPreviewAuthor>
              </MessageQuotedPreviewContext>
              <MessageQuotedPreviewText>
                I&apos;ll take the deployment handoff and post a summary when it completes.
              </MessageQuotedPreviewText>
            </MessageQuotedPreviewContent>
          </MessageQuotedPreview>
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}
