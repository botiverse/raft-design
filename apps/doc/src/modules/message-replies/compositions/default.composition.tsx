import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageReplies,
  MessageRepliesItem,
  MessageRepliesItemContent,
  MessageRepliesItemSender,
  MessageRepliesItemTime,
  MessageRepliesSummary,
  MessageRepliesSummaryItem,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "@botiverse/raft-ui";

import { MESSAGE_REPLIES_AVATAR_SRC } from "#/modules/message-replies/message-replies.fixtures.ts";

export function MessageRepliesDefaultComposition() {
  return (
    <MessageItem className="w-full max-w-3xl">
      <MessageItemAvatarSlot>
        <Avatar size="md" type="human">
          <AvatarImage src={MESSAGE_REPLIES_AVATAR_SRC.developer} alt="" />
          <AvatarFallback>D</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Developer</MessageItemSender>
          <MessageItemTime>1:30 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          Heads up: deploying v0.30.1 to staging after lunch. Changes include the new DM
          notification logic and the agent restart fix.
        </MessageItemBody>
        <MessageReplies
          render={<a href="#thread-invite-security" aria-label="Open the invite security thread" />}
        >
          <MessageRepliesSummary>
            <MessageRepliesSummaryItem>4 replies</MessageRepliesSummaryItem>
            <span aria-hidden>·</span>
            <MessageRepliesSummaryItem render={<strong />}>1 new</MessageRepliesSummaryItem>
            <span aria-hidden>›</span>
          </MessageRepliesSummary>
          <MessageRepliesItem>
            <Avatar size="sm" type="human">
              <AvatarImage src={MESSAGE_REPLIES_AVATAR_SRC.developer} alt="" />
              <AvatarFallback>D</AvatarFallback>
            </Avatar>
            <MessageRepliesItemSender>Developer</MessageRepliesItemSender>
            <MessageRepliesItemContent>
              Yes, no breaking changes. The new column has a default value.
            </MessageRepliesItemContent>
            <MessageRepliesItemTime dateTime="2026-07-27T13:32:00Z">1:32 PM</MessageRepliesItemTime>
          </MessageRepliesItem>
          <MessageRepliesItem>
            <Avatar size="sm" type="agent">
              <AvatarImage src={MESSAGE_REPLIES_AVATAR_SRC.claudeAssistant} alt="" />
              <AvatarFallback>CA</AvatarFallback>
            </Avatar>
            <MessageRepliesItemSender>Claude Assistant</MessageRepliesItemSender>
            <MessageRepliesItemContent>
              Deployed. Staging looks good so far. Will monitor for 30 min before promoting.
            </MessageRepliesItemContent>
            <MessageRepliesItemTime dateTime="2026-07-27T13:33:00Z">1:33 PM</MessageRepliesItemTime>
          </MessageRepliesItem>
          <MessageRepliesItem>
            <Avatar size="sm" type="human">
              <AvatarImage src={MESSAGE_REPLIES_AVATAR_SRC.developer} alt="" />
              <AvatarFallback>D</AvatarFallback>
            </Avatar>
            <MessageRepliesItemSender>Developer</MessageRepliesItemSender>
            <MessageRepliesItemContent>
              All clear. No errors in the last 30 min. Ready for production whenever.
            </MessageRepliesItemContent>
            <MessageRepliesItemTime dateTime="2026-07-27T13:34:00Z">1:34 PM</MessageRepliesItemTime>
          </MessageRepliesItem>
        </MessageReplies>
      </MessageItemContent>
    </MessageItem>
  );
}
