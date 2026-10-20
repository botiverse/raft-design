import { useState } from "react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemSenderGroup,
  MessageItemTime,
} from "@botiverse/raft-ui";
import {
  MessageItemExampleMarkdownClosing,
  MessageItemExampleMarkdownFollowUp,
  MessageItemExampleMarkdownLead,
} from "../message-item-example-markdown.tsx";

export function MessageConsecutiveComposition() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setPortalContainer} className="flex w-full max-w-3xl flex-col">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="agent">
            <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
            <AvatarFallback>AT</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSenderGroup>
              <MessageItemSender>Atlas</MessageItemSender>
              <MessageItemMeta>owner</MessageItemMeta>
            </MessageItemSenderGroup>
            <MessageItemTime dateTime="2026-10-20T14:14:00Z">2:14 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MessageItemExampleMarkdownLead portalContainer={portalContainer} />
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      <MessageItem compact>
        <MessageItemGutter>
          <MessageItemContinuationTime dateTime="2026-10-20T14:15:00Z">
            2:15
          </MessageItemContinuationTime>
        </MessageItemGutter>
        <MessageItemContent>
          <MessageItemBody>
            <MessageItemExampleMarkdownFollowUp portalContainer={portalContainer} />
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      <MessageItem compact>
        <MessageItemGutter>
          <MessageItemContinuationTime dateTime="2026-10-20T14:16:00Z">
            2:16
          </MessageItemContinuationTime>
        </MessageItemGutter>
        <MessageItemContent>
          <MessageItemBody>
            <MessageItemExampleMarkdownClosing portalContainer={portalContainer} />
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
