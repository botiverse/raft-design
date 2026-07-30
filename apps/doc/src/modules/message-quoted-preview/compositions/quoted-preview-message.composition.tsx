import { Hash, Link, MessageSquare } from "lucide-react";
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
  MessageQuotedPreviewAuthorMeta,
  MessageQuotedPreviewAuthorName,
  MessageQuotedPreviewChannel,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewHeader,
  MessageQuotedPreviewInset,
  MessageQuotedPreviewText,
  MessageQuotedPreviewThread,
  MessageQuotedPreviewTimestamp,
} from "raft-ui/wip";

import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";
import { QUOTED_PREVIEW_AVATAR_SRC } from "../message-quoted-preview.fixtures.ts";

export function QuotedPreviewEmbeddedComposition() {
  return (
    <MessageItemEmbedded>
      <MessageQuotedPreview
        render={
          <a
            href={MESSAGE_PLAYGROUND_URLS.stateModelTask}
            aria-label="Open quoted message in the state-model thread"
          />
        }
        data-testid="quoted-message-card"
      >
        <MessageQuotedPreviewHeader>
          <MessageQuotedPreviewAuthor>
            <Avatar size="xs" type="human">
              <AvatarImage src={QUOTED_PREVIEW_AVATAR_SRC.developer} alt="" />
              <AvatarFallback>D</AvatarFallback>
            </Avatar>
            <MessageQuotedPreviewAuthorName>Developer</MessageQuotedPreviewAuthorName>
            <MessageQuotedPreviewAuthorMeta>member</MessageQuotedPreviewAuthorMeta>
          </MessageQuotedPreviewAuthor>
          <MessageQuotedPreviewChannel>
            <Hash size={11} />
            raft-ui-migration
          </MessageQuotedPreviewChannel>
          <MessageQuotedPreviewThread>
            <MessageSquare size={10} />
            Thread
          </MessageQuotedPreviewThread>
          <MessageQuotedPreviewTimestamp>Today · 8:17 AM</MessageQuotedPreviewTimestamp>
        </MessageQuotedPreviewHeader>
        <MessageQuotedPreviewInset>
          <MessageQuotedPreviewContent>
            <MessageQuotedPreviewText>
              Should we migrate from Zustand to Jotai? Jotai&apos;s atom model might be better for
              our store structure.
            </MessageQuotedPreviewText>
            <MessageQuotedPreviewAttachments>
              <MessageQuotedPreviewAttachment>1 file</MessageQuotedPreviewAttachment>
            </MessageQuotedPreviewAttachments>
          </MessageQuotedPreviewContent>
        </MessageQuotedPreviewInset>
      </MessageQuotedPreview>
    </MessageItemEmbedded>
  );
}

export function QuotedPreviewMessageComposition() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="md" type="human">
          <AvatarImage src={QUOTED_PREVIEW_AVATAR_SRC.ada} alt="" />
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Ada</MessageItemSender>
          <MessageItemMeta>owner</MessageItemMeta>
          <MessageItemTime>2:25 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          <MessageReferenceChip
            variant="link"
            render={
              <a
                href={MESSAGE_PLAYGROUND_URLS.stateModelTask}
                aria-label="Open raft-ui migration message"
              />
            }
          >
            <Link />
            <MessageReferenceLabel>#raft-ui-migration</MessageReferenceLabel>
          </MessageReferenceChip>
        </MessageItemBody>
        <QuotedPreviewEmbeddedComposition />
      </MessageItemContent>
    </MessageItem>
  );
}
