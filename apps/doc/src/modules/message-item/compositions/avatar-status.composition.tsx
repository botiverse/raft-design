import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "raft-ui";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";

export function MessageAvatarStatusComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>KA</AvatarFallback>
            <AvatarBadge title="Online" />
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Kai</MessageItemSender>
            <MessageItemTime>2:14 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Avatar with AvatarBadge (default success).</MessageItemBody>
        </MessageItemContent>
      </MessageItem>

      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>NO</AvatarFallback>
            <AvatarBadge title="Online" />
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Nova</MessageItemSender>
            <MessageItemTime>2:14 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Same badge on a human avatar.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>

      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
            <AvatarBadge title="Online" />
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemTime>2:14 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>AvatarBadge without className overrides.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
