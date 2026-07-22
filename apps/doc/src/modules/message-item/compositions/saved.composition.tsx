import { Bookmark } from "lucide-react";
import { MessageItemExampleAvatar } from "../message-item-example-avatar.tsx";

import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemSavedIndicator,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

export function MessageSavedComposition() {
  return (
    <div className="w-full max-w-3xl">
      <MessageItem>
        <MessageItemAvatarSlot>
          <MessageItemExampleAvatar />
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
