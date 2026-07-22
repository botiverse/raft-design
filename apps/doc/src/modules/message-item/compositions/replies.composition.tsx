import { useState } from "react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { MessageSquare, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";

import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBadge,
  MessageItemBadgeSeparator,
  MessageItemBody,
  MessageItemContent,
  MessageItemFooter,
  MessageItemHeader,
  MessageItemInlineReplies,
  MessageItemInlineReplyAvatar,
  MessageItemInlineReplyCount,
  MessageItemInlineReplyPreview,
  MessageItemInlineReplyRow,
  MessageItemInlineReplySender,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

export function MessageRepliesComposition() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
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
            <MessageItemTime>2:30 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Reply count with no unread marker.</MessageItemBody>
          <MessageItemFooter>
            <MessageItemBadge>
              <MessageSquare />
              <span>2 replies</span>
            </MessageItemBadge>
          </MessageItemFooter>
        </MessageItemContent>
      </MessageItem>

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
            <MessageItemTime>2:30 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Unread replies keep the unread badge treatment.</MessageItemBody>
          <MessageItemFooter>
            <MessageItemBadge status="unread">
              <MessageSquare />
              <span>3 replies</span>
              <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>
              <span>1 new</span>
            </MessageItemBadge>
          </MessageItemFooter>
        </MessageItemContent>
      </MessageItem>

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
            <MessageItemTime>2:30 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            Draft state remains visible even before the first reply is sent.
          </MessageItemBody>
          <MessageItemFooter>
            <MessageItemBadge>
              <Pencil className="text-foreground-muted" />
              <span className="text-foreground-muted">draft</span>
            </MessageItemBadge>
          </MessageItemFooter>
        </MessageItemContent>
      </MessageItem>

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
            <MessageItemTime>2:30 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            Unread replies can share the badge with an in-progress draft.
          </MessageItemBody>
          <MessageItemFooter>
            <MessageItemBadge status="unread">
              <MessageSquare />
              <span>3 replies</span>
              <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>
              <span>1 new</span>
              <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>
              <Pencil className="text-foreground-muted" />
              <span className="text-foreground-muted">draft</span>
            </MessageItemBadge>
          </MessageItemFooter>
        </MessageItemContent>
      </MessageItem>

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
            <MessageItemTime>2:31 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            Inline thread replies render under the chip area — no card chrome (source
            InlineThreadReplies).
          </MessageItemBody>
          <MessageItemInlineReplies>
            <MessageItemInlineReplyRow>
              <MessageItemInlineReplyAvatar>
                <Avatar size="sm" type="human">
                  <AvatarFallback>M</AvatarFallback>
                </Avatar>
              </MessageItemInlineReplyAvatar>
              <MessageItemInlineReplySender>Mira</MessageItemInlineReplySender>
              <MessageItemInlineReplyPreview>
                Ship the token fixture tonight.
              </MessageItemInlineReplyPreview>
            </MessageItemInlineReplyRow>
            <MessageItemInlineReplyRow>
              <MessageItemInlineReplyAvatar>
                <Avatar size="sm" type="human">
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
              </MessageItemInlineReplyAvatar>
              <MessageItemInlineReplySender>Cindy</MessageItemInlineReplySender>
              <MessageItemInlineReplyPreview>
                Added the review checklist.
              </MessageItemInlineReplyPreview>
              <MessageItemInlineReplyCount type="button" onClick={() => setExpanded(true)}>
                3 replies · 1 new ›
              </MessageItemInlineReplyCount>
            </MessageItemInlineReplyRow>
            {expanded ? (
              <MessageItemInlineReplyRow>
                <MessageItemInlineReplyAvatar>
                  <Avatar size="sm" type="human">
                    <AvatarFallback>N</AvatarFallback>
                  </Avatar>
                </MessageItemInlineReplyAvatar>
                <MessageItemInlineReplySender>Noah</MessageItemInlineReplySender>
                <MessageItemInlineReplyPreview>
                  Looks good — merge after the parity check.
                </MessageItemInlineReplyPreview>
              </MessageItemInlineReplyRow>
            ) : null}
          </MessageItemInlineReplies>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
