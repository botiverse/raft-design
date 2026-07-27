import { Hash, MessageSquare } from "lucide-react";
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
  MessageQuotedPreviewAuthorMeta,
  MessageQuotedPreviewAuthorName,
  MessageQuotedPreviewBody,
  MessageQuotedPreviewChannel,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewContext,
  MessageQuotedPreviewHeader,
  MessageQuotedPreviewSeparator,
  MessageQuotedPreviewText,
  MessageQuotedPreviewTimestamp,
} from "raft-ui/wip";

import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";

export function QuotedPreviewEmbeddedComposition() {
  return (
    <MessageItemEmbedded>
      <MessageQuotedPreview
        render={
          <a
            href={MESSAGE_PLAYGROUND_URLS.stateModelTask}
            aria-label="Open quoted message in the state-model thread"
          />
        }
        data-testid="quoted-message-card"
      >
        <MessageQuotedPreviewContent>
          <MessageQuotedPreviewHeader>
            <MessageQuotedPreviewContext>
              <MessageQuotedPreviewChannel>
                <Hash size={11} />
                raft-ui-migration
              </MessageQuotedPreviewChannel>
              <MessageQuotedPreviewSeparator>·</MessageQuotedPreviewSeparator>
              <MessageQuotedPreviewAuthor>
                <Avatar size="xs" type="human">
                  <AvatarFallback>D</AvatarFallback>
                </Avatar>
                <MessageQuotedPreviewAuthorName>Developer</MessageQuotedPreviewAuthorName>
                <MessageQuotedPreviewAuthorMeta>member</MessageQuotedPreviewAuthorMeta>
              </MessageQuotedPreviewAuthor>
              <MessageQuotedPreviewSeparator>·</MessageQuotedPreviewSeparator>
              <MessageQuotedPreviewChannel>
                <MessageSquare size={10} />
                Thread
              </MessageQuotedPreviewChannel>
            </MessageQuotedPreviewContext>
            <MessageQuotedPreviewTimestamp>Today · 8:17 AM</MessageQuotedPreviewTimestamp>
          </MessageQuotedPreviewHeader>
          <MessageQuotedPreviewBody>
            <MessageQuotedPreviewText>
              Should we migrate from Zustand to Jotai? Jotai&apos;s atom model might be better for
              our store structure.
            </MessageQuotedPreviewText>
            <MessageQuotedPreviewAttachments>
              <MessageQuotedPreviewAttachment>
                state-ownership-migration-notes.md
              </MessageQuotedPreviewAttachment>
            </MessageQuotedPreviewAttachments>
          </MessageQuotedPreviewBody>
        </MessageQuotedPreviewContent>
      </MessageQuotedPreview>
    </MessageItemEmbedded>
  );
}

export function QuotedPreviewMessageComposition() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="md" type="human">
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Ada</MessageItemSender>
          <MessageItemMeta>owner</MessageItemMeta>
          <MessageItemTime>2:25 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Quoting the state-ownership decision and its source note.</MessageItemBody>
        <QuotedPreviewEmbeddedComposition />
      </MessageItemContent>
    </MessageItem>
  );
}
