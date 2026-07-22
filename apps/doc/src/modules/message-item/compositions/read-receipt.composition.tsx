import { CheckCircle } from "lucide-react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";

import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemReadReceipt,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

export function MessageReadReceiptComposition() {
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
            <MessageItemTime>2:18 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            Read receipts are a footer affordance. Product policy decides when they appear.
          </MessageItemBody>
          <MessageItemFooter>
            <MessageItemReadReceipt title="Read" aria-label="Read">
              <CheckCircle />
              <span>Read</span>
            </MessageItemReadReceipt>
          </MessageItemFooter>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
