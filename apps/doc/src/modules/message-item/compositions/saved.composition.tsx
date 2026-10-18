import { Bookmark } from "lucide-react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemSavedIndicator,
  MessageItemSender,
  MessageItemTime,
} from "@botiverse/raft-ui";

export function MessageSavedComposition() {
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
            The saved indicator stays pinned on the row until the hover toolbar takes over.
          </MessageItemBody>
          <MessageItemFooter>
            <MessageItemSavedIndicator>
              <Bookmark fill="currentColor" />
              <span>Saved</span>
            </MessageItemSavedIndicator>
          </MessageItemFooter>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
