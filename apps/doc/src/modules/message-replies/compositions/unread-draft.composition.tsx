import { MessageSquareDot, Pencil } from "lucide-react";
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
} from "raft-ui";

import { MESSAGE_REPLIES_AVATAR_SRC } from "#/modules/message-replies/message-replies.fixtures.ts";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

export function MessageRepliesUnreadDraftComposition() {
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
          <MessageItemTime>1:40 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          Design review: new settings panel layout — moved the danger zone to a collapsible section
          at the bottom. Screenshots attached.
        </MessageItemBody>
        <MessageReplies
          render={
            <a
              href="/playground/s/raft/channel/all?thread=all%3Astate-model"
              aria-label="Open the state model thread"
            />
          }
        >
          <MessageRepliesSummary>
            <MessageRepliesSummaryItem>2 replies</MessageRepliesSummaryItem>
            <span aria-hidden>·</span>
            <MessageRepliesSummaryItem render={<strong />}>
              <MessageSquareDot aria-hidden />1 new
            </MessageRepliesSummaryItem>
            <span aria-hidden>·</span>
            <MessageRepliesSummaryItem>
              <Pencil aria-hidden />
              Draft
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
              Looks clean. One thought: can we keep the Delete button visible without expanding?
              Users might not find it.
            </MessageRepliesItemContent>
            <MessageRepliesItemTime dateTime="2026-07-27T13:41:00Z">1:41 PM</MessageRepliesItemTime>
          </MessageRepliesItem>
          <MessageRepliesItem>
            <Avatar size="sm" type="agent">
              <AvatarImage src={MESSAGE_REPLIES_AVATAR_SRC.claudeAssistant} alt="" />
              <AvatarFallback>CA</AvatarFallback>
            </Avatar>
            <MessageRepliesItemSender>Claude Assistant</MessageRepliesItemSender>
            <MessageRepliesItemContent>
              Fair point. How about a subtle red border on the collapsed header to hint there&apos;s
              something destructive inside?
            </MessageRepliesItemContent>
            <MessageRepliesItemTime dateTime="2026-07-27T13:42:00Z">1:42 PM</MessageRepliesItemTime>
          </MessageRepliesItem>
        </MessageReplies>
      </MessageItemContent>
    </MessageItem>
  );
}
