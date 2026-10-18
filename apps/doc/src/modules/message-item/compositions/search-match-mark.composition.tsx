import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MarkdownParagraph,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSearchMatch,
  MessageItemSender,
  MessageItemTime,
} from "@botiverse/raft-ui";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";

export function MessageSearchMatchMarkComposition() {
  return (
    <div className="w-full max-w-3xl">
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
            <MarkdownParagraph>
              Hits keep the cyan source treatment and can also use inline{" "}
              <MessageItemSearchMatch>mark</MessageItemSearchMatch> for token emphasis.
            </MarkdownParagraph>
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
