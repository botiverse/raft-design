import type { CSSProperties } from "react";
import {
  Avatar,
  AvatarFallback,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "@botiverse/raft-ui";
import type { VirtualListMeasuredRef } from "@botiverse/raft-ui/wip";

import type { ChannelMessage } from "./virtual-list.fixtures.ts";

/** One message of the VirtualList examples: a MessageItem whose root element the list measures. */
export function ChannelMessageRow({
  message,
  domRef,
  style,
}: {
  message: ChannelMessage;
  domRef: VirtualListMeasuredRef | null;
  style?: CSSProperties | undefined;
}) {
  return (
    <MessageItem ref={domRef} style={style}>
      <MessageItemAvatarSlot>
        <Avatar size="md" type={message.type}>
          <AvatarFallback>{message.sender[0]}</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>{message.sender}</MessageItemSender>
          <MessageItemTime>{message.time}</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>{message.text}</MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}
