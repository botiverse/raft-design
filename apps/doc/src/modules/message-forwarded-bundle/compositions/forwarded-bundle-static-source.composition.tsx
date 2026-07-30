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
  MessageForwardedBundleSourceLabel,
} from "raft-ui/wip";

import { Markdown } from "#/lib/markdown/markdown.tsx";
import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";
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

export function ForwardedBundleStaticSourceComposition() {
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
          <MessageItemTime>2:28 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Forwarded 1 message</MessageItemBody>
        <MessageItemEmbedded>
          <MessageForwardedBundle>
            <MessageForwardedBundleHeader>
              <MessageForwardedBundleHeaderContent>
                <MessageForwardedBundleHeaderLabel>Forwarded</MessageForwardedBundleHeaderLabel>
                <MessageForwardedBundleHeaderCount>message</MessageForwardedBundleHeaderCount>
              </MessageForwardedBundleHeaderContent>
              <MessageForwardedBundleSourceLabel>
                from release-notes
              </MessageForwardedBundleSourceLabel>
            </MessageForwardedBundleHeader>
            <MessageForwardedBundleItems>
              <MessageForwardedBundleItem>
                <MessageForwardedBundleItemMeta>
                  <MessageForwardedBundleItemAuthor>@Kai</MessageForwardedBundleItemAuthor>
                  <span aria-hidden>·</span>
                  <time dateTime="2026-07-15T06:19:00.000Z">Jul 15, 2:19 PM</time>
                </MessageForwardedBundleItemMeta>
                <Markdown>The original message is no longer available to open.</Markdown>
              </MessageForwardedBundleItem>
            </MessageForwardedBundleItems>
          </MessageForwardedBundle>
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}
