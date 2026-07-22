import { MessageSquare } from "lucide-react";
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage, Status } from "raft-ui";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBadge,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { MessageReactionComposition } from "./reaction.compositions.tsx";

export function MessageItemPreviewContent() {
  return (
    <div className="w-full max-w-3xl">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
            <AvatarBadge
              title="Online"
              render={<Status aria-hidden size="lg" variant="success" />}
            />
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Atlas</MessageItemSender>
            <MessageItemMeta>owner</MessageItemMeta>
            <MessageItemTime>2:14 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            The message row keeps sender metadata, body content, and thread activity in one timeline
            context.
          </MessageItemBody>
          <MessageItemFooter>
            <MessageItemBadge>
              <MessageSquare />
              <span>2 replies</span>
            </MessageItemBadge>
            <MessageReactionComposition emoji="👍" count={3} reacted />
          </MessageItemFooter>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
