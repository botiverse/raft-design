import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";

import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemReplies,
  MessageItemRepliesSummary,
  MessageItemRepliesTrigger,
  MessageItemReply,
  MessageItemReplyAvatar,
  MessageItemReplyContent,
  MessageItemReplySender,
  MessageItemReplyTime,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

export function MessageItemRepliesComposition() {
  return (
    <MessageItem className="w-full max-w-3xl">
      <MessageItemAvatarSlot>
        <Avatar size="md" type="agent">
          <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Atlas</MessageItemSender>
          <MessageItemTime>2:31 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          The final review notes and implementation details continue in this thread.
        </MessageItemBody>
        <MessageItemReplies>
          <MessageItemRepliesTrigger
            render={
              <a
                href="/playground/s/raft/channel/all?thread=all%3Astate-model"
                aria-label="Open thread with 33 replies"
              />
            }
          >
            <MessageItemRepliesSummary>30 earlier replies ›</MessageItemRepliesSummary>
            <MessageItemReply>
              <MessageItemReplyAvatar>
                <Avatar size="sm" type="human">
                  <AvatarFallback>M</AvatarFallback>
                </Avatar>
              </MessageItemReplyAvatar>
              <MessageItemReplySender>Mira</MessageItemReplySender>
              <MessageItemReplyContent>Ship the token fixture tonight.</MessageItemReplyContent>
              <MessageItemReplyTime dateTime="2026-07-27T14:32:00Z">2:32 PM</MessageItemReplyTime>
            </MessageItemReply>
            <MessageItemReply>
              <MessageItemReplyAvatar>
                <Avatar size="sm" type="human">
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
              </MessageItemReplyAvatar>
              <MessageItemReplySender>Cindy</MessageItemReplySender>
              <MessageItemReplyContent>Added the review checklist.</MessageItemReplyContent>
              <MessageItemReplyTime dateTime="2026-07-27T14:34:00Z">2:34 PM</MessageItemReplyTime>
            </MessageItemReply>
            <MessageItemReply>
              <MessageItemReplyAvatar>
                <Avatar size="sm" type="human">
                  <AvatarFallback>N</AvatarFallback>
                </Avatar>
              </MessageItemReplyAvatar>
              <MessageItemReplySender>Noah</MessageItemReplySender>
              <MessageItemReplyContent>
                Looks good — merge after the parity check.
              </MessageItemReplyContent>
              <MessageItemReplyTime dateTime="2026-07-27T14:36:00Z">2:36 PM</MessageItemReplyTime>
            </MessageItemReply>
          </MessageItemRepliesTrigger>
        </MessageItemReplies>
      </MessageItemContent>
    </MessageItem>
  );
}
