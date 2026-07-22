import { Avatar, AvatarFallback } from "raft-ui";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";
import { MessageRowToolbarFixture } from "./row-toolbar.composition.tsx";

export function MessageToolbarComposition() {
  return (
    <div className="w-full max-w-3xl">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="sm" type="agent">
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemTime>2:19 PM</MessageItemTime>
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
