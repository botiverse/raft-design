import { MESSAGE_FIXTURE_AVATAR_SRC } from "#/modules/message-item/message-item.fixtures.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageReferenceUnavailable,
  Skeleton,
  useThemeFamily,
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
  MessageQuotedPreviewContent,
  MessageQuotedPreviewLoading,
  MessageQuotedPreviewUnavailable,
} from "raft-ui/wip";
import { QuotedPreviewDirectMessageComposition } from "./quoted-preview-direct-message.composition.tsx";
import { QuotedPreviewMessageComposition } from "./quoted-preview-message.composition.tsx";

function QuotedPreviewLoadingSkeleton() {
  const theme = useThemeFamily();

  if (theme === "brutal") {
    return (
      <>
        <Skeleton
          variant="block"
          className="h-[34px] border-b-2 border-black bg-white/60 animate-none"
        />
        <div className="flex gap-3 px-3 py-2.5">
          <Skeleton
            variant="block"
            className="size-7 shrink-0 border-2 border-black bg-black/5 animate-none"
          />
          <div className="flex-1 space-y-2">
            <Skeleton variant="line" className="w-32 animate-none" />
            <Skeleton variant="line" className="w-full animate-none" />
            <Skeleton variant="line" className="w-3/4 animate-none" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Skeleton variant="line" className="w-2/5 bg-layer-strong animate-none" />
      <div className="mt-3 flex gap-2">
        <Skeleton variant="circle" className="size-6 bg-layer-strong animate-none" />
        <div className="flex-1 space-y-1.5">
          <Skeleton variant="line" className="h-2.5 w-32 bg-layer-strong animate-none" />
          <Skeleton variant="line" className="h-2.5 w-full bg-layer-strong animate-none" />
          <Skeleton variant="line" className="h-2.5 w-3/4 bg-layer-strong animate-none" />
        </div>
      </div>
    </>
  );
}

export function QuotedPreviewLoadingComposition() {
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
        <MessageItemBody>Loading quoted message context.</MessageItemBody>
        <MessageItemEmbedded>
          <MessageQuotedPreviewLoading data-testid="quoted-message-card-loading">
            <QuotedPreviewLoadingSkeleton />
          </MessageQuotedPreviewLoading>
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}

export function QuotedPreviewUnavailableComposition() {
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
          <MessageItemTime>2:27 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>
          The linked thread is{" "}
          <MessageReferenceUnavailable>unavailable or deleted</MessageReferenceUnavailable>.
        </MessageItemBody>
        <MessageItemEmbedded>
          <MessageQuotedPreviewUnavailable data-testid="quoted-message-card-unavailable">
            <MessageQuotedPreviewContent>Message unavailable</MessageQuotedPreviewContent>
          </MessageQuotedPreviewUnavailable>
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}

// @docs-source-strip-start
export function QuotedPreviewFeedbackComposition() {
  return (
    <div className="grid gap-4">
      <QuotedPreviewLoadingComposition />
      <QuotedPreviewUnavailableComposition />
    </div>
  );
}

export function MessageQuotedPreviewShowcaseComposition() {
  return (
    <div className="grid w-full max-w-3xl gap-4">
      <QuotedPreviewMessageComposition />
      <QuotedPreviewDirectMessageComposition />
      <QuotedPreviewFeedbackComposition />
    </div>
  );
}
// @docs-source-strip-end
