import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItem,
  MessageItemSearchMatch,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui";

export function MessageRowChromeComposition() {
  return (
    <MessageItem>
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
          <MessageItemSearchMatch>Search jump</MessageItemSearchMatch> highlight keeps the cyan
          source treatment.
        </MessageItemBody>
      </MessageItemContent>
    </MessageItem>
  );
}
