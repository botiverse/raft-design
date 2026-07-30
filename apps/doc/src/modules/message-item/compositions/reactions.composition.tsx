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
  MessageItemSender,
  MessageItemTime,
} from "raft-ui";

import {
  MessageReactionComposition,
  MessageReactionOverlaysComposition,
} from "./reaction.compositions.tsx";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";

export function MessageReactionsShowcaseComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-14">
      <div>
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
              <MessageItemTime>2:33 PM</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>
              Release 2.4 is live in the release channel. Changelog and rollback steps are in the
              thread.
            </MessageItemBody>
            <MessageItemFooter>
              <MessageReactionComposition emoji="👍" count={5} reacted />
              <MessageReactionComposition emoji="👀" count={2} />
              <MessageReactionComposition emoji="🔥" count={1} failed />
            </MessageItemFooter>
          </MessageItemContent>
        </MessageItem>
      </div>
      <MessageReactionOverlaysComposition />
    </div>
  );
}
