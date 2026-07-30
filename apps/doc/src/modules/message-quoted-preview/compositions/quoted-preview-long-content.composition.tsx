import { Hash } from "lucide-react";
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
  MessageQuotedPreviewAttachment,
  MessageQuotedPreviewAttachments,
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

export function QuotedPreviewLongContentComposition() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="md" type="human">
          <AvatarFallback>R</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Ravi</MessageItemSender>
          <MessageItemMeta>member</MessageItemMeta>
          <MessageItemTime>2:38 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          Sharing the original migration plan and its supporting files.
        </MessageItemBody>
        <MessageItemEmbedded>
          <MessageQuotedPreview
            render={
              <a
                href={MESSAGE_PLAYGROUND_URLS.stateModelTask}
                aria-label="Open quoted migration plan"
              />
            }
          >
            <MessageQuotedPreviewContent>
              <MessageQuotedPreviewHeader>
                <MessageQuotedPreviewContext>
                  <MessageQuotedPreviewChannel>
                    <Hash size={11} />
                    platform-migration
                  </MessageQuotedPreviewChannel>
                  <span>·</span>
                  <MessageQuotedPreviewAuthor>
                    <Avatar size="xs" type="human">
                      <AvatarFallback>K</AvatarFallback>
                    </Avatar>
                    <MessageQuotedPreviewAuthorName>Kai</MessageQuotedPreviewAuthorName>
                  </MessageQuotedPreviewAuthor>
                </MessageQuotedPreviewContext>
                <MessageQuotedPreviewTimestamp>Yesterday · 4:46 PM</MessageQuotedPreviewTimestamp>
              </MessageQuotedPreviewHeader>
              <MessageQuotedPreviewBody>
                <MessageQuotedPreviewText>
                  Before we cut over, keep the read model running against both event streams,
                  validate account and workspace permissions in the staging environment, and only
                  then move the webhook consumers to the new endpoint.
                </MessageQuotedPreviewText>
                <MessageQuotedPreviewAttachments>
                  <MessageQuotedPreviewAttachment>
                    migration-checklist.md
                  </MessageQuotedPreviewAttachment>
                  <MessageQuotedPreviewAttachment>
                    webhook-cutover-plan.pdf
                  </MessageQuotedPreviewAttachment>
                </MessageQuotedPreviewAttachments>
              </MessageQuotedPreviewBody>
            </MessageQuotedPreviewContent>
          </MessageQuotedPreview>
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}
