import { useState } from "react";
import {
  MESSAGE_FIXTURE_AVATAR_SRC,
  MESSAGE_PLAYGROUND_URLS,
} from "#/modules/message-item/message-item.fixtures.ts";
import { Avatar, AvatarFallback, AvatarImage } from "raft-ui";
import { Markdown } from "#/lib/markdown/markdown.tsx";
import { FileText } from "lucide-react";

import {
  MessageForwardedBundle,
  MessageForwardedBundleAttachment,
  MessageForwardedBundleAttachmentMeta,
  MessageForwardedBundleAttachmentName,
  MessageForwardedBundleAttachments,
  MessageForwardedBundleCollapsedFade,
  MessageForwardedBundleCollapsedItems,
  MessageForwardedBundleContent,
  MessageForwardedBundleFooter,
  MessageForwardedBundleHeader,
  MessageForwardedBundleHeaderCount,
  MessageForwardedBundleHeaderLabel,
  MessageForwardedBundleItem,
  MessageForwardedBundleItemAuthor,
  MessageForwardedBundleItemMeta,
  MessageForwardedBundleItems,
  MessageForwardedBundleSource,
  MessageForwardedBundleToggle,
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

function ForwardedBundleItemsContent() {
  return (
    <>
      <MessageForwardedBundleItem data-testid="forwarded-bundle-item">
        <MessageForwardedBundleItemMeta>
          <MessageForwardedBundleItemAuthor>@Ada</MessageForwardedBundleItemAuthor>
          <span aria-hidden>·</span>
          <time dateTime="2026-07-15T06:05:00.000Z">Jul 15, 2:05 PM</time>
        </MessageForwardedBundleItemMeta>
        <MessageForwardedBundleContent>
          <Markdown>Rollout is clear for the message reference migration.</Markdown>
        </MessageForwardedBundleContent>
      </MessageForwardedBundleItem>
      <MessageForwardedBundleItem data-testid="forwarded-bundle-item">
        <MessageForwardedBundleItemMeta>
          <MessageForwardedBundleItemAuthor>@Will</MessageForwardedBundleItemAuthor>
          <span aria-hidden>·</span>
          <time dateTime="2026-07-15T06:09:00.000Z">Jul 15, 2:09 PM</time>
        </MessageForwardedBundleItemMeta>
        <MessageForwardedBundleContent>
          <Markdown>Keep the source case with its attachment context.</Markdown>
        </MessageForwardedBundleContent>
        <MessageForwardedBundleAttachments>
          <MessageForwardedBundleAttachment>
            <FileText size={12} />
            <MessageForwardedBundleAttachmentName>
              release-notes.md
            </MessageForwardedBundleAttachmentName>
            <MessageForwardedBundleAttachmentMeta>· MARKDOWN</MessageForwardedBundleAttachmentMeta>
          </MessageForwardedBundleAttachment>
        </MessageForwardedBundleAttachments>
      </MessageForwardedBundleItem>
      <MessageForwardedBundleItem data-testid="forwarded-bundle-item">
        <MessageForwardedBundleItemMeta>
          <MessageForwardedBundleItemAuthor>@Mia</MessageForwardedBundleItemAuthor>
          <span aria-hidden>·</span>
          <time dateTime="2026-07-15T06:12:00.000Z">Jul 15, 2:12 PM</time>
        </MessageForwardedBundleItemMeta>
        <MessageForwardedBundleContent>
          <Markdown>Keep the original context available to reviewers.</Markdown>
        </MessageForwardedBundleContent>
      </MessageForwardedBundleItem>
      <MessageForwardedBundleItem data-testid="forwarded-bundle-item">
        <MessageForwardedBundleItemMeta>
          <MessageForwardedBundleItemAuthor>@Nia</MessageForwardedBundleItemAuthor>
          <span aria-hidden>·</span>
          <time dateTime="2026-07-15T06:16:00.000Z">Jul 15, 2:16 PM</time>
        </MessageForwardedBundleItemMeta>
        <MessageForwardedBundleContent>
          <Markdown>Follow the same message state contract in the thread.</Markdown>
        </MessageForwardedBundleContent>
      </MessageForwardedBundleItem>
    </>
  );
}

export function ForwardedBundleEmbeddedComposition() {
  const [expanded, setExpanded] = useState(false);

  return (
    <MessageItemEmbedded>
      <MessageForwardedBundle data-testid="forwarded-bundle-card">
        <MessageForwardedBundleHeader>
          <div className="flex min-w-0 items-center gap-2">
            <MessageForwardedBundleHeaderLabel>Forwarded</MessageForwardedBundleHeaderLabel>
            <MessageForwardedBundleHeaderCount>4 messages</MessageForwardedBundleHeaderCount>
          </div>
          <MessageForwardedBundleSource
            data-testid="forwarded-bundle-source-label"
            title="Open source message"
            render={
              <a
                href={MESSAGE_PLAYGROUND_URLS.releaseNotesThread}
                aria-label="Open source thread in release-notes"
              />
            }
          >
            from release-notes
          </MessageForwardedBundleSource>
        </MessageForwardedBundleHeader>
        {expanded ? (
          <MessageForwardedBundleItems>
            <ForwardedBundleItemsContent />
          </MessageForwardedBundleItems>
        ) : (
          <MessageForwardedBundleCollapsedItems>
            <ForwardedBundleItemsContent />
            <MessageForwardedBundleCollapsedFade />
          </MessageForwardedBundleCollapsedItems>
        )}
        <MessageForwardedBundleFooter>
          <MessageForwardedBundleToggle onClick={() => setExpanded((current) => !current)}>
            {expanded ? "Collapse" : "Show all 4 messages"}
          </MessageForwardedBundleToggle>
        </MessageForwardedBundleFooter>
      </MessageForwardedBundle>
    </MessageItemEmbedded>
  );
}

// @docs-source-strip-start
export function ForwardedBundleMessageComposition() {
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
          <MessageItemTime>2:24 PM</MessageItemTime>
        </MessageItemHeader>
        <MessageItemBody>Forwarded 4 messages</MessageItemBody>
        <ForwardedBundleEmbeddedComposition />
      </MessageItemContent>
    </MessageItem>
  );
}

export function MessageForwardedBundleShowcaseComposition() {
  return (
    <div className="w-full max-w-3xl">
      <ForwardedBundleMessageComposition />
    </div>
  );
}
// @docs-source-strip-end
