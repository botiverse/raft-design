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
  MessageForwardedBundleSource,
} from "raft-ui/wip";

import { Markdown } from "#/lib/markdown/markdown.tsx";
import {
  MESSAGE_FIXTURE_AVATAR_SRC,
  MESSAGE_PLAYGROUND_URLS,
} from "#/modules/message-item/message-item.fixtures.ts";
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

export function ForwardedBundleThreadComposition() {
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
          <MessageItemTime>2:26 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Forwarded 1 message</MessageItemBody>
        <MessageItemEmbedded>
          <MessageForwardedBundle>
            <MessageForwardedBundleHeader>
              <MessageForwardedBundleHeaderContent>
                <MessageForwardedBundleHeaderLabel>
                  <Forward size={12} />
                  Forwarded
                </MessageForwardedBundleHeaderLabel>
                <MessageForwardedBundleHeaderCount>message</MessageForwardedBundleHeaderCount>
              </MessageForwardedBundleHeaderContent>
              <MessageForwardedBundleSource
                render={
                  <a
                    href={MESSAGE_PLAYGROUND_URLS.releaseNotesThread}
                    aria-label="Open source thread in release-notes"
                  />
                }
              >
                from #release-notes · thread
              </MessageForwardedBundleSource>
            </MessageForwardedBundleHeader>
            <MessageForwardedBundleInset>
              <MessageForwardedBundleItems>
                <MessageForwardedBundleItem>
                  <MessageForwardedBundleItemMeta>
                    <MessageForwardedBundleItemAuthor>@Mia</MessageForwardedBundleItemAuthor>
                    <time dateTime="2026-07-15T06:12:00.000Z">Jul 15, 2:12 PM</time>
                  </MessageForwardedBundleItemMeta>
                  <Markdown>Follow the same message state contract in the thread.</Markdown>
                </MessageForwardedBundleItem>
              </MessageForwardedBundleItems>
            </MessageForwardedBundleInset>
          </MessageForwardedBundle>
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}
