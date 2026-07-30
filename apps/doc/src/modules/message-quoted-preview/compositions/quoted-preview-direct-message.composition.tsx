import { Avatar, AvatarFallback } from "raft-ui";
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
  MessageQuotedPreview,
  MessageQuotedPreviewAuthor,
  MessageQuotedPreviewAuthorName,
  MessageQuotedPreviewBody,
  MessageQuotedPreviewChannel,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewContext,
  MessageQuotedPreviewHeader,
  MessageQuotedPreviewText,
  MessageQuotedPreviewTimestamp,
} from "raft-ui/wip";

import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

export function QuotedPreviewDirectMessageComposition() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="md" type="human">
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Mai</MessageItemSender>
          <MessageItemMeta>member</MessageItemMeta>
          <MessageItemTime>2:31 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Referencing the direct-message handoff.</MessageItemBody>
        <MessageItemEmbedded>
          <MessageQuotedPreview
            render={
              <a
                href={MESSAGE_PLAYGROUND_URLS.stateModelTask}
                aria-label="Open quoted direct message"
              />
            }
          >
            <MessageQuotedPreviewContent>
              <MessageQuotedPreviewHeader>
                <MessageQuotedPreviewContext>
                  <MessageQuotedPreviewChannel>@Atlas</MessageQuotedPreviewChannel>
                  <span>·</span>
                  <MessageQuotedPreviewAuthor>
                    <Avatar size="xs" type="agent">
                      <AvatarFallback>AT</AvatarFallback>
                    </Avatar>
                    <MessageQuotedPreviewAuthorName>Atlas</MessageQuotedPreviewAuthorName>
                  </MessageQuotedPreviewAuthor>
                </MessageQuotedPreviewContext>
                <MessageQuotedPreviewTimestamp>Today · 8:24 AM</MessageQuotedPreviewTimestamp>
              </MessageQuotedPreviewHeader>
              <MessageQuotedPreviewBody>
                <MessageQuotedPreviewText>
                  I&apos;ll take the deployment handoff and post a summary when it completes.
                </MessageQuotedPreviewText>
              </MessageQuotedPreviewBody>
            </MessageQuotedPreviewContent>
          </MessageQuotedPreview>
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}
