import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemInlineStatus,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

export function MessageConvertingComposition() {
  return (
    <div className="w-full max-w-3xl">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemMeta>owner</MessageItemMeta>
            <MessageItemTime>2:21 PM</MessageItemTime>
            <MessageItemInlineStatus>Converting…</MessageItemInlineStatus>
          </MessageItemHeader>
          <MessageItemBody>
            Ship the token fixture tonight and keep the review checklist in sync.
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
