import { useState } from "react";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import {
  MessageItemExampleMarkdownClosing,
  MessageItemExampleMarkdownLead,
} from "../message-item-example-markdown.tsx";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemContinuationTime,
  MessageItemGutter,
  MessageItemHeader,
  MessageItemInteractionBoundary,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";
import { ConsecutiveMessageRow } from "./row.compositions.tsx";

export function MessageConsecutiveComposition() {
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  return (
    <MessageItemInteractionBoundary
      ref={setPortalContainer}
      className="flex w-full max-w-3xl flex-col"
    >
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
            <MessageItemMeta>claude-opus</MessageItemMeta>
            <MessageItemTime>2:14 PM</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>
            <MessageItemExampleMarkdownLead portalContainer={portalContainer} />
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
      <ConsecutiveMessageRow portalContainer={portalContainer} />
      <MessageItem compact>
        <MessageItemGutter>
          <MessageItemContinuationTime>2:16</MessageItemContinuationTime>
        </MessageItemGutter>
        <MessageItemContent>
          <MessageItemBody>
            <MessageItemExampleMarkdownClosing portalContainer={portalContainer} />
          </MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    </MessageItemInteractionBoundary>
  );
}
