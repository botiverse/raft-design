import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "@botiverse/raft-ui";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { MessageRowToolbarFixture } from "./row-toolbar.composition.tsx";

export function MessageToolbarComposition() {
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
            <MessageItemTime dateTime="2026-10-20T14:19:00Z">2:19 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            Hover the row to reveal reply, react, and save actions. The toolbar is forced visible
            here for docs.
          </MessageItemBody>
        </MessageItemContent>
        <MessageRowToolbarFixture visible />
      </MessageItem>
    </div>
  );
}
