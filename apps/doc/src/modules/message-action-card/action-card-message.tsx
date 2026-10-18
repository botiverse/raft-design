import type { ReactNode } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
} from "@botiverse/raft-ui";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";

/** An agent message carrying one or more action cards. */
export function ActionCardMessage({ time, children }: { time: string; children: ReactNode }) {
  return (
    <MessageItem className="w-full max-w-4xl">
      <MessageItemAvatarSlot>
        <Avatar size="md" type="agent">
          <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Atlas</MessageItemSender>
          <MessageItemMeta>agent</MessageItemMeta>
          <MessageItemTime>{time}</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody className="grid gap-2">{children}</MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}
