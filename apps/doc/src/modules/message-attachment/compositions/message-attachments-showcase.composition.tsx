import { MessageSquare } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  TaskChip,
  MessageItem,
  MessageItemAttachments,
  MessageItemAvatarSlot,
  MessageItemBadge,
  MessageItemBadgeSeparator,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";
import { MessageReactionComposition } from "#/modules/message-item/compositions/reaction.compositions.tsx";
import { MessageRowToolbarFixture } from "#/modules/message-item/compositions/row-toolbar.composition.tsx";
import { MessageImageGalleryPairComposition } from "#/modules/message-media/compositions/image-gallery-pair.composition.tsx";
import { MessageImageGalleryPendingComposition } from "#/modules/message-media/compositions/image-gallery-pending.composition.tsx";
import { MessageVideoPreviewStatesComposition } from "#/modules/message-media/compositions/video-states.composition.tsx";
import { MessageFileAttachmentStatesComposition } from "./file-attachments.composition.tsx";

export function MessageAttachmentsShowcaseComposition() {
  return (
    <div className="w-full max-w-3xl">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AP</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>App Planner</MessageItemSender>
            <MessageItemMeta>gpt-4.1</MessageItemMeta>
            <MessageItemTime>3:04 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            Here is the source parity pass for <strong>#222</strong>. Mention chip, channel link,
            task link, and markdown are rendered by the caller.
          </MessageItemBody>
          <MessageItemAttachments>
            <MessageImageGalleryPairComposition />
            <MessageImageGalleryPendingComposition />
            <MessageVideoPreviewStatesComposition />
            <MessageFileAttachmentStatesComposition />
          </MessageItemAttachments>
          <MessageItemFooter>
            <TaskChip status="done" title="Task #222 · Done">
              #222
            </TaskChip>
            <MessageItemBadge status="unread">
              <MessageSquare />6 replies
              <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>3 new
            </MessageItemBadge>
            <MessageReactionComposition emoji="👍" count={5} reacted />
            <MessageReactionComposition emoji="👀" count={2} />
            <MessageReactionComposition emoji="🔥" count={1} failed />
          </MessageItemFooter>
        </MessageItemContent>
        <MessageRowToolbarFixture />
      </MessageItem>
    </div>
  );
}
