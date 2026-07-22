import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import {
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSearchMatch,
  MessageItemSender,
  MessageItemTime,
  MessageMarkdown,
} from "raft-ui/wip";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";

export function MessageSearchMatchMarkComposition() {
  return (
    <div className="w-full max-w-3xl">
      <MessageItemSearchMatch>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>SR</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Search result</MessageItemSender>
            <MessageItemTime>3:20 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MessageMarkdown>
              <p>
                Hits keep the cyan source treatment and can also use inline <mark>mark</mark> for
                token emphasis.
              </p>
            </MessageMarkdown>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItemSearchMatch>
    </div>
  );
}
