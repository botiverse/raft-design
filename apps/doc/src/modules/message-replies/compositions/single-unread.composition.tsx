import { MessageSquareDot } from "lucide-react";
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

export function MessageRepliesSingleUnreadComposition() {
  return (
    <MessageItem className="w-full max-w-3xl">
      <MessageItemAvatarSlot>
        <Avatar size="md" type="agent">
          <AvatarImage src={MESSAGE_REPLIES_AVATAR_SRC.claudeAssistant} alt="" />
          <AvatarFallback>CA</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Claude Assistant</MessageItemSender>
          <MessageItemTime>1:20 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          Should we version the internal API? Right now /internal/* has no version prefix, which
          makes daemon backward compatibility harder to reason about.
        </MessageItemBody>
        <MessageReplies
          render={
            <a
              href="/playground/s/raft/channel/all?thread=all%3Aapi-docs"
              aria-label="Open the API docs thread"
            />
          }
        >
          <MessageRepliesSummary>
            <MessageRepliesSummaryItem>1 reply</MessageRepliesSummaryItem>
            <span aria-hidden>·</span>
            <MessageRepliesSummaryItem render={<strong />}>
              <MessageSquareDot aria-hidden />1 new
            </MessageRepliesSummaryItem>
            <span aria-hidden>›</span>
          </MessageRepliesSummary>
          <MessageRepliesItem>
            <Avatar size="sm" type="human">
              <AvatarImage src={MESSAGE_REPLIES_AVATAR_SRC.developer} alt="" />
              <AvatarFallback>D</AvatarFallback>
            </Avatar>
            <MessageRepliesItemSender>Developer</MessageRepliesItemSender>
            <MessageRepliesItemContent>
              I&apos;d rather keep it versionless and use feature flags in the handshake. Versioned
              APIs add a lot of routing complexity.
            </MessageRepliesItemContent>
            <MessageRepliesItemTime dateTime="2026-07-27T13:21:00Z">1:21 PM</MessageRepliesItemTime>
          </MessageRepliesItem>
        </MessageReplies>
      </MessageItemContent>
    </MessageItem>
  );
}
