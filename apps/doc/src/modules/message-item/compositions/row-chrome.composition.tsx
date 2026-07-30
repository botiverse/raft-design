import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import {
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSearchMatch,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

export function MessageRowChromeComposition() {
  return (
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
        <MessageItemBody>Search jump highlight keeps the cyan source treatment.</MessageItemBody>
      </MessageItemContent>
    </MessageItemSearchMatch>
  );
}
