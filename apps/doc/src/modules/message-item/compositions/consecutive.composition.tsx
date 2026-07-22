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
import { ConsecutiveMessageRow } from "./row.compositions.tsx";

export function MessageConsecutiveComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="sm" type="agent">
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemTime>2:14 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Starting a short sequence of related updates.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      <ConsecutiveMessageRow />
    </div>
  );
}
