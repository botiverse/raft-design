import type { ReactNode } from "react";
import { useState } from "react";
import { MessageItemExampleAvatar } from "../message-item-example-avatar.tsx";
import { MessageSquare, Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "raft-ui";

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

function RepliesRow({ body, children }: { body: string; children: ReactNode }) {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <MessageItemExampleAvatar />
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Atlas</MessageItemSender>
          <MessageItemTime>2:30 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>{body}</MessageItemBody>
        <MessageItemFooter>{children}</MessageItemFooter>
      </MessageItemContent>
    </MessageItem>
  );
}

function InlineReplyPreviewAvatar({ initials }: { initials: string }) {
  return (
    <Avatar size="sm" type="human">
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}

function InlineThreadRepliesRow() {
  const [expanded, setExpanded] = useState(false);

  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <MessageItemExampleAvatar />
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
              <InlineReplyPreviewAvatar initials="M" />
            </MessageItemInlineReplyAvatar>
            <MessageItemInlineReplySender>Mira</MessageItemInlineReplySender>
            <MessageItemInlineReplyPreview>
              Ship the token fixture tonight.
            </MessageItemInlineReplyPreview>
          </MessageItemInlineReplyRow>
          <MessageItemInlineReplyRow>
            <MessageItemInlineReplyAvatar>
              <InlineReplyPreviewAvatar initials="C" />
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
                <InlineReplyPreviewAvatar initials="N" />
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
  );
}

export function MessageRepliesComposition() {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-3">
      <RepliesRow body="Reply count with no unread marker.">
        <MessageItemBadge>
          <MessageSquare />
          <span>2 replies</span>
        </MessageItemBadge>
      </RepliesRow>
      <RepliesRow body="Unread replies keep the unread badge treatment.">
        <MessageItemBadge status="unread">
          <MessageSquare />
          <span>3 replies</span>
          <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>
          <span>1 new</span>
        </MessageItemBadge>
      </RepliesRow>
      <RepliesRow body="Draft state remains visible even before the first reply is sent.">
        <MessageItemBadge>
          <Pencil className="text-foreground-muted" />
          <span className="text-foreground-muted">draft</span>
        </MessageItemBadge>
      </RepliesRow>
      <RepliesRow body="Unread replies can share the badge with an in-progress draft.">
        <MessageItemBadge status="unread">
          <MessageSquare />
          <span>3 replies</span>
          <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>
          <span>1 new</span>
          <MessageItemBadgeSeparator>·</MessageItemBadgeSeparator>
          <Pencil className="text-foreground-muted" />
          <span className="text-foreground-muted">draft</span>
        </MessageItemBadge>
      </RepliesRow>

      <InlineThreadRepliesRow />
    </div>
  );
}
