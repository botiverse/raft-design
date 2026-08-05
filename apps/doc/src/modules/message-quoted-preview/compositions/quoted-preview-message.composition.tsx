import { Hash, MessageSquare } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageQuotedPreview,
  MessageQuotedPreviewAttachment,
  MessageQuotedPreviewAttachments,
  MessageQuotedPreviewAuthor,
  MessageQuotedPreviewAuthorMeta,
  MessageQuotedPreviewAuthorName,
  MessageQuotedPreviewChannel,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewHeader,
  MessageQuotedPreviewText,
  MessageQuotedPreviewThread,
  MessageQuotedPreviewTimestamp,
  MessageReferenceChip,
  MessageReferenceLabel,
} from "raft-ui";
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
} from "raft-ui";

import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";
import { QUOTED_PREVIEW_AVATAR_SRC } from "../message-quoted-preview.fixtures.ts";

export type QuotedPreviewEmbeddedCompositionProps = {
  href?: string;
  ariaLabel?: string;
  author: {
    name: string;
    meta: string;
    type: "human" | "agent";
    avatarSrc?: string;
    fallback: string;
  };
  channel: string;
  thread?: boolean;
  timestamp: string;
  content: string;
  attachmentCount?: number;
};

const DEFAULT_QUOTED_PREVIEW_PROPS: QuotedPreviewEmbeddedCompositionProps = {
  href: MESSAGE_PLAYGROUND_URLS.stateModelTask,
  ariaLabel: "Open quoted message in the state-model thread",
  author: {
    name: "Developer",
    meta: "member",
    type: "human",
    avatarSrc: QUOTED_PREVIEW_AVATAR_SRC.developer,
    fallback: "D",
  },
  channel: "raft-ui-migration",
  thread: true,
  timestamp: "Today · 8:17 AM",
  content:
    "Should we migrate from Zustand to Jotai? Jotai's atom model might be better for our store structure.",
  attachmentCount: 1,
};

export function QuotedPreviewEmbeddedComposition(
  props: Partial<QuotedPreviewEmbeddedCompositionProps>,
) {
  const resolved = { ...DEFAULT_QUOTED_PREVIEW_PROPS, ...props };

  return (
    <MessageItemEmbedded>
      <MessageQuotedPreview
        render={
          resolved.href ? <a href={resolved.href} aria-label={resolved.ariaLabel} /> : undefined
        }
        data-testid="quoted-message-card"
      >
        <MessageQuotedPreviewHeader>
          <MessageQuotedPreviewAuthor>
            <Avatar size="xs" type={resolved.author.type}>
              {resolved.author.avatarSrc ? (
                <AvatarImage src={resolved.author.avatarSrc} alt="" />
              ) : null}
              <AvatarFallback>{resolved.author.fallback}</AvatarFallback>
            </Avatar>
            <MessageQuotedPreviewAuthorName>{resolved.author.name}</MessageQuotedPreviewAuthorName>
            <MessageQuotedPreviewAuthorMeta>{resolved.author.meta}</MessageQuotedPreviewAuthorMeta>
          </MessageQuotedPreviewAuthor>
          <MessageQuotedPreviewChannel>
            <Hash size={11} />
            {resolved.channel}
          </MessageQuotedPreviewChannel>
          {resolved.thread ? (
            <MessageQuotedPreviewThread>
              <MessageSquare size={10} />
              Thread
            </MessageQuotedPreviewThread>
          ) : null}
          <MessageQuotedPreviewTimestamp>{resolved.timestamp}</MessageQuotedPreviewTimestamp>
        </MessageQuotedPreviewHeader>
        <MessageQuotedPreviewContent>
          <MessageQuotedPreviewText>{resolved.content}</MessageQuotedPreviewText>
          {resolved.attachmentCount ? (
            <MessageQuotedPreviewAttachments>
              <MessageQuotedPreviewAttachment>
                {resolved.attachmentCount} {resolved.attachmentCount === 1 ? "file" : "files"}
              </MessageQuotedPreviewAttachment>
            </MessageQuotedPreviewAttachments>
          ) : null}
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
          <AvatarImage src={QUOTED_PREVIEW_AVATAR_SRC.ada} alt="" />
          <AvatarFallback>A</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Ada</MessageItemSender>
          <MessageItemMeta>owner</MessageItemMeta>
          <MessageItemTime>2:25 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          <MessageReferenceChip
            variant="link"
            render={
              <a
                href={MESSAGE_PLAYGROUND_URLS.stateModelTask}
                aria-label="Open raft-ui migration message"
              />
            }
          >
            <Hash />
            <MessageReferenceLabel>raft-ui-migration</MessageReferenceLabel>
          </MessageReferenceChip>
        </MessageItemBody>
        <QuotedPreviewEmbeddedComposition />
      </MessageItemContent>
    </MessageItem>
  );
}
