import { Hash, Link2 } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
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

export function QuotedPreviewArchivedChannelComposition() {
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
          <MessageItemTime>2:41 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          <MessageReferenceChip
            variant="link"
            render={
              <a
                href={MESSAGE_PLAYGROUND_URLS.stateModelTask}
                aria-label="Open legacy migration message"
              />
            }
          >
            <Link2 />
            <MessageReferenceLabel>#legacy-migration</MessageReferenceLabel>
            <MessageReferenceMeta>msg</MessageReferenceMeta>
          </MessageReferenceChip>
        </MessageItemBody>
        <MessageItemEmbedded>
          <MessageQuotedPreview
            render={
              <a
                href={MESSAGE_PLAYGROUND_URLS.stateModelTask}
                aria-label="Open quoted archived channel message"
              />
            }
          >
            <MessageQuotedPreviewHeader>
              <MessageQuotedPreviewChannel>
                <Hash size={11} />
                legacy-migration
              </MessageQuotedPreviewChannel>
              <Badge appearance="soft" variant="warning">
                Archived
              </Badge>
              <MessageQuotedPreviewTimestamp>May 4 · 3:16 PM</MessageQuotedPreviewTimestamp>
            </MessageQuotedPreviewHeader>
            <MessageQuotedPreviewContent>
              <MessageQuotedPreviewContext>
                <MessageQuotedPreviewAuthor>
                  <Avatar size="xs" type="human">
                    <AvatarImage src={QUOTED_PREVIEW_AVATAR_SRC.kai} alt="" />
                    <AvatarFallback>K</AvatarFallback>
                  </Avatar>
                  <MessageQuotedPreviewAuthorName>Kai</MessageQuotedPreviewAuthorName>
                </MessageQuotedPreviewAuthor>
              </MessageQuotedPreviewContext>
              <MessageQuotedPreviewText>
                Keep this decision linked for historical context, but continue the work in the
                active channel.
              </MessageQuotedPreviewText>
            </MessageQuotedPreviewContent>
          </MessageQuotedPreview>
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}
