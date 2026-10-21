import { Hash } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemEmbedded,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  MessageQuotedPreview,
  MessageQuotedPreviewAuthor,
  MessageQuotedPreviewAuthorName,
  MessageQuotedPreviewChannel,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewHeader,
  MessageQuotedPreviewText,
  MessageQuotedPreviewTimestamp,
} from "@botiverse/raft-ui";
import { MessageQuotedPreviewAuthorDelegatedBy } from "@botiverse/raft-ui/wip";

export function QuotedPreviewDelegatedContent() {
  return (
    <div className="flex w-full max-w-3xl flex-col">
      <MessageItem>
        <MessageItemAvatarSlot>
          <Avatar size="md" type="human">
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
        </MessageItemAvatarSlot>
        <MessageItemContent>
          <MessageItemHeader>
            <MessageItemSender>Martin</MessageItemSender>
            <MessageItemTime dateTime="2026-10-21T10:50:00">10:50</MessageItemTime>
          </MessageItemHeader>
          <MessageItemBody>Reviewing now.</MessageItemBody>
          <MessageItemEmbedded>
            <MessageQuotedPreview>
              <MessageQuotedPreviewHeader>
                <MessageQuotedPreviewAuthor>
                  <Avatar size="xs" type="human">
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <MessageQuotedPreviewAuthorName title="Alexandra Konstantinopoulou">
                    Alexandra Konstantinopoulou
                  </MessageQuotedPreviewAuthorName>
                  <MessageQuotedPreviewAuthorDelegatedBy>
                    (sent by Friday)
                  </MessageQuotedPreviewAuthorDelegatedBy>
                </MessageQuotedPreviewAuthor>
                <MessageQuotedPreviewChannel>
                  <Hash aria-hidden />
                  launch-week
                </MessageQuotedPreviewChannel>
                <MessageQuotedPreviewTimestamp>Today · 10:42</MessageQuotedPreviewTimestamp>
              </MessageQuotedPreviewHeader>
              <MessageQuotedPreviewContent>
                <MessageQuotedPreviewText>
                  The launch checklist is ready for review: two items left, the Chinese privacy
                  terms and the SSO callback list.
                </MessageQuotedPreviewText>
              </MessageQuotedPreviewContent>
            </MessageQuotedPreview>
          </MessageItemEmbedded>
        </MessageItemContent>
      </MessageItem>
    </div>
  );
}
