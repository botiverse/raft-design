import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageQuotedPreviewUnavailable,
  MessageReferenceUnavailable,
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
import { CircleOff } from "lucide-react";

import { QUOTED_PREVIEW_AVATAR_SRC } from "../message-quoted-preview.fixtures.ts";

export function QuotedPreviewUnavailableEmbeddedComposition({
  reason = "Message unavailable",
}: {
  reason?: string;
} = {}) {
  return (
    <MessageItemEmbedded>
      <MessageQuotedPreviewUnavailable data-testid="quoted-message-card-unavailable">
        {reason}
      </MessageQuotedPreviewUnavailable>
    </MessageItemEmbedded>
  );
}

export function QuotedPreviewUnavailableComposition() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="md" type="agent">
          <AvatarImage src={QUOTED_PREVIEW_AVATAR_SRC.unavailable} alt="" />
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
          <MessageReferenceUnavailable>
            <CircleOff size={12} />
            Message unavailable
          </MessageReferenceUnavailable>
        </MessageItemBody>
        <QuotedPreviewUnavailableEmbeddedComposition />
      </MessageItemContent>
    </MessageItem>
  );
}
