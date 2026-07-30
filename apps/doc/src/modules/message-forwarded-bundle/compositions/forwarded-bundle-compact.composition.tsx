import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import {
  MessageForwardedBundle,
  MessageForwardedBundleHeader,
  MessageForwardedBundleHeaderContent,
  MessageForwardedBundleHeaderCount,
  MessageForwardedBundleHeaderLabel,
  MessageForwardedBundleItem,
  MessageForwardedBundleItemAuthor,
  MessageForwardedBundleItemMeta,
  MessageForwardedBundleItems,
  MessageForwardedBundleInset,
} from "raft-ui/wip";

import { Markdown } from "#/lib/markdown/markdown.tsx";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";
import { Forward } from "lucide-react";
import {
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemEmbedded,
  MessageItemHeader,
  MessageItemMeta,
  MessageItemSender,
  MessageItemTime,
} from "raft-ui/wip";

export function ForwardedBundleCompactComposition() {
  return (
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
          <MessageItemMeta>owner</MessageItemMeta>
          <MessageItemTime>2:25 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Forwarded 2 messages</MessageItemBody>
        <MessageItemEmbedded>
          <MessageForwardedBundle>
            <MessageForwardedBundleHeader>
              <MessageForwardedBundleHeaderContent>
                <MessageForwardedBundleHeaderLabel>
                  <Forward size={12} />
                  Forwarded
                </MessageForwardedBundleHeaderLabel>
                <MessageForwardedBundleHeaderCount>2 messages</MessageForwardedBundleHeaderCount>
              </MessageForwardedBundleHeaderContent>
            </MessageForwardedBundleHeader>
            <MessageForwardedBundleInset>
              <MessageForwardedBundleItems>
                <MessageForwardedBundleItem>
                  <MessageForwardedBundleItemMeta>
                    <MessageForwardedBundleItemAuthor>@Ada</MessageForwardedBundleItemAuthor>
                    <time dateTime="2026-07-15T06:05:00.000Z">Jul 15, 2:05 PM</time>
                  </MessageForwardedBundleItemMeta>
                  <Markdown>Rollout is clear for the message reference migration.</Markdown>
                </MessageForwardedBundleItem>
                <MessageForwardedBundleItem>
                  <MessageForwardedBundleItemMeta>
                    <MessageForwardedBundleItemAuthor>@Will</MessageForwardedBundleItemAuthor>
                    <time dateTime="2026-07-15T06:09:00.000Z">Jul 15, 2:09 PM</time>
                  </MessageForwardedBundleItemMeta>
                  <Markdown>Keep the source case with its attachment context.</Markdown>
                </MessageForwardedBundleItem>
              </MessageForwardedBundleItems>
            </MessageForwardedBundleInset>
          </MessageForwardedBundle>
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}
