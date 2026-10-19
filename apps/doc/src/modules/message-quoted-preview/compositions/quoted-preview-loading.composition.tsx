import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewHeader,
  MessageQuotedPreviewLoading,
  MessageReferenceChip,
  MessageReferenceLabel,
  Skeleton,
} from "@botiverse/raft-ui";
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
} from "@botiverse/raft-ui";
import { Hash } from "lucide-react";

import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";
import { QUOTED_PREVIEW_AVATAR_SRC } from "../message-quoted-preview.fixtures.ts";

function QuotedPreviewLoadingSkeleton() {
  return (
    <>
      <MessageQuotedPreviewHeader>
        <Skeleton variant="circle" className="size-4 bg-fill-strong animate-none" />
        <Skeleton variant="line" className="h-2.5 w-16 bg-fill-strong animate-none" />
        <Skeleton variant="line" className="h-2.5 w-24 bg-fill-strong animate-none" />
        <Skeleton variant="line" className="ml-auto h-2.5 w-20 bg-fill-strong animate-none" />
      </MessageQuotedPreviewHeader>
      <MessageQuotedPreviewContent className="stack-y-1.5">
        <Skeleton variant="line" className="h-2.5 w-full bg-fill-strong animate-none" />
        <Skeleton variant="line" className="h-2.5 w-3/4 bg-fill-strong animate-none" />
      </MessageQuotedPreviewContent>
    </>
  );
}

export function QuotedPreviewLoadingEmbeddedComposition({
  label = "Loading quoted message",
}: {
  label?: string;
} = {}) {
  return (
    <MessageItemEmbedded>
      <MessageQuotedPreviewLoading
        aria-label={label}
        aria-busy
        data-testid="quoted-message-card-loading"
      >
        <QuotedPreviewLoadingSkeleton />
      </MessageQuotedPreviewLoading>
    </MessageItemEmbedded>
  );
}

export function QuotedPreviewLoadingComposition() {
  return (
    <MessageItem>
      <MessageItemAvatarSlot>
        <Avatar size="md" type="agent">
          <AvatarImage src={QUOTED_PREVIEW_AVATAR_SRC.loading} alt="" />
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
      </MessageItemAvatarSlot>
      <MessageItemContent>
        <MessageItemHeader>
          <MessageItemSender>Atlas</MessageItemSender>
          <MessageItemMeta>owner</MessageItemMeta>
          <MessageItemTime>2:26 PM</MessageItemTime>
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
        <QuotedPreviewLoadingEmbeddedComposition />
      </MessageItemContent>
    </MessageItem>
  );
}
