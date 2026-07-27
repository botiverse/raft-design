import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";

import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemThreadRepliesPreview,
  MessageItemTime,
} from "raft-ui/wip";

export function MessageThreadRepliesPreviewComposition() {
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
        <MessageItemThreadRepliesPreview>
          <MessageItemThreadRepliesPreview.Trigger
            render={
              <a
                href="/playground/s/raft/channel/all?thread=all%3Astate-model"
                aria-label="Open thread with 33 replies"
              />
            }
          >
            <MessageItemThreadRepliesPreview.Summary>
              30 earlier replies ›
            </MessageItemThreadRepliesPreview.Summary>
            <MessageItemThreadRepliesPreview.Reply>
              <MessageItemThreadRepliesPreview.Avatar>
                <Avatar size="sm" type="human">
                  <AvatarFallback>M</AvatarFallback>
                </Avatar>
              </MessageItemThreadRepliesPreview.Avatar>
              <MessageItemThreadRepliesPreview.Sender>Mira</MessageItemThreadRepliesPreview.Sender>
              <MessageItemThreadRepliesPreview.Preview>
                Ship the token fixture tonight.
              </MessageItemThreadRepliesPreview.Preview>
              <MessageItemThreadRepliesPreview.Time dateTime="2026-07-27T14:32:00Z">
                2:32 PM
              </MessageItemThreadRepliesPreview.Time>
            </MessageItemThreadRepliesPreview.Reply>
            <MessageItemThreadRepliesPreview.Reply>
              <MessageItemThreadRepliesPreview.Avatar>
                <Avatar size="sm" type="human">
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
              </MessageItemThreadRepliesPreview.Avatar>
              <MessageItemThreadRepliesPreview.Sender>Cindy</MessageItemThreadRepliesPreview.Sender>
              <MessageItemThreadRepliesPreview.Preview>
                Added the review checklist.
              </MessageItemThreadRepliesPreview.Preview>
              <MessageItemThreadRepliesPreview.Time dateTime="2026-07-27T14:34:00Z">
                2:34 PM
              </MessageItemThreadRepliesPreview.Time>
            </MessageItemThreadRepliesPreview.Reply>
            <MessageItemThreadRepliesPreview.Reply>
              <MessageItemThreadRepliesPreview.Avatar>
                <Avatar size="sm" type="human">
                  <AvatarFallback>N</AvatarFallback>
                </Avatar>
              </MessageItemThreadRepliesPreview.Avatar>
              <MessageItemThreadRepliesPreview.Sender>Noah</MessageItemThreadRepliesPreview.Sender>
              <MessageItemThreadRepliesPreview.Preview>
                Looks good — merge after the parity check.
              </MessageItemThreadRepliesPreview.Preview>
              <MessageItemThreadRepliesPreview.Time dateTime="2026-07-27T14:36:00Z">
                2:36 PM
              </MessageItemThreadRepliesPreview.Time>
            </MessageItemThreadRepliesPreview.Reply>
          </MessageItemThreadRepliesPreview.Trigger>
        </MessageItemThreadRepliesPreview>
      </MessageItemContent>
    </MessageItem>
  );
}
