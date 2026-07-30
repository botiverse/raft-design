import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  MessageQuotedPreviewLoading,
  MessageReferenceChip,
  MessageReferenceLabel,
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
} from "raft-ui/wip";
import { Link } from "lucide-react";

import { MESSAGE_PLAYGROUND_URLS } from "#/modules/message-item/message-item.fixtures.ts";
import { QUOTED_PREVIEW_AVATAR_SRC } from "../message-quoted-preview.fixtures.ts";

function QuotedPreviewLoadingSkeleton() {
  const theme = useThemeFamily();

  if (theme === "brutal") {
    return (
      <>
        <div className="flex items-center gap-2 border-b border-black/15 px-2.5 py-2 sm:px-3 sm:py-2.5">
          <Skeleton
            variant="block"
            className="size-4 shrink-0 border border-black/15 bg-black/5 animate-none"
          />
          <Skeleton variant="line" className="h-2.5 w-16 animate-none" />
          <Skeleton variant="line" className="h-2.5 w-24 animate-none" />
          <Skeleton variant="line" className="ml-auto h-2.5 w-20 animate-none" />
        </div>
        <div className="space-y-2 px-2.5 py-2.5 sm:px-3 sm:py-3">
          <Skeleton variant="line" className="h-2.5 w-full animate-none" />
          <Skeleton variant="line" className="h-2.5 w-3/4 animate-none" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5">
        <Skeleton variant="circle" className="size-4 bg-layer-strong animate-none" />
        <Skeleton variant="line" className="h-2.5 w-16 bg-layer-strong animate-none" />
        <Skeleton variant="line" className="h-2.5 w-24 bg-layer-strong animate-none" />
        <Skeleton variant="line" className="ml-auto h-2.5 w-20 bg-layer-strong animate-none" />
      </div>
      <div className="overflow-clip rounded-[5.5px] border-[0.5px] border-line-subtle bg-[oklch(1_0_0)]">
        <div className="space-y-1.5 px-3 py-3 sm:px-3.5 sm:py-3.5">
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
            <Link />
            <MessageReferenceLabel>#raft-ui-migration</MessageReferenceLabel>
          </MessageReferenceChip>
        </MessageItemBody>
        <MessageItemEmbedded>
          <MessageQuotedPreviewLoading data-testid="quoted-message-card-loading">
            <QuotedPreviewLoadingSkeleton />
          </MessageQuotedPreviewLoading>
        </MessageItemEmbedded>
      </MessageItemContent>
    </MessageItem>
  );
}
