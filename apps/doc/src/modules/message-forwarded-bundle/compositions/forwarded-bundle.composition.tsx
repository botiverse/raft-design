import { useCallback, useState } from "react";
import {
  MESSAGE_FIXTURE_AVATAR_SRC,
  MESSAGE_PLAYGROUND_URLS,
} from "#/modules/message-item/message-item.fixtures.ts";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
import { Markdown } from "#/lib/markdown/markdown.tsx";
import { ChevronDown, ChevronUp, FileText, Forward } from "lucide-react";

import {
  MessageForwardedBundle,
  MessageForwardedBundleAttachment,
  MessageForwardedBundleAttachmentMeta,
  MessageForwardedBundleAttachmentName,
  MessageForwardedBundleAttachments,
  MessageForwardedBundleFooter,
  MessageForwardedBundleHeader,
  MessageForwardedBundleHeaderContent,
  MessageForwardedBundleHeaderCount,
  MessageForwardedBundleHeaderLabel,
  MessageForwardedBundleItem,
  MessageForwardedBundleItemAuthor,
  MessageForwardedBundleItemMeta,
  MessageForwardedBundleItems,
  MessageForwardedBundleSource,
  MessageForwardedBundleFooterAction,
} from "raft-ui";

export type ForwardedBundleCompositionItem = {
  id: string;
  author: string;
  createdAt: string;
  createdAtDateTime?: string;
  content: string;
  attachment?: { name: string; meta: string };
};

export type ForwardedBundleEmbeddedCompositionProps = {
  items?: readonly ForwardedBundleCompositionItem[];
  sourceLabel?: string;
  sourceHref?: string | null;
  sourceAriaLabel?: string;
  sourceTitle?: string;
  collapsible?: boolean;
};

const DEFAULT_FORWARDED_ITEMS: readonly ForwardedBundleCompositionItem[] = [
  {
    id: "rollout",
    author: "Ada",
    createdAt: "Jul 15, 2:05 PM",
    createdAtDateTime: "2026-07-15T06:05:00.000Z",
    content: "Rollout is clear for the message reference migration.",
  },
  {
    id: "attachment-context",
    author: "Will",
    createdAt: "Jul 15, 2:09 PM",
    createdAtDateTime: "2026-07-15T06:09:00.000Z",
    content: "Keep the source case with its attachment context.",
    attachment: { name: "release-notes.md", meta: "markdown" },
  },
  {
    id: "review-context",
    author: "Mia",
    createdAt: "Jul 15, 2:12 PM",
    createdAtDateTime: "2026-07-15T06:12:00.000Z",
    content: "Keep the original context available to reviewers.",
  },
  {
    id: "thread-contract",
    author: "Nia",
    createdAt: "Jul 15, 2:16 PM",
    createdAtDateTime: "2026-07-15T06:16:00.000Z",
    content: "Follow the same message state contract in the thread.",
  },
];

function ForwardedBundleItemsContent({
  items,
}: {
  items: readonly ForwardedBundleCompositionItem[];
}) {
  return (
    <>
      {items.map((item) => (
        <MessageForwardedBundleItem key={item.id} data-testid="forwarded-bundle-item">
          <MessageForwardedBundleItemMeta>
            <MessageForwardedBundleItemAuthor>@{item.author}</MessageForwardedBundleItemAuthor>
            <time dateTime={item.createdAtDateTime}>{item.createdAt}</time>
          </MessageForwardedBundleItemMeta>
          <Markdown>{item.content}</Markdown>
          {item.attachment ? (
            <MessageForwardedBundleAttachments>
              <MessageForwardedBundleAttachment>
                <FileText size={12} />
                <MessageForwardedBundleAttachmentName>
                  {item.attachment.name}
                </MessageForwardedBundleAttachmentName>
                <MessageForwardedBundleAttachmentMeta>
                  · {item.attachment.meta}
                </MessageForwardedBundleAttachmentMeta>
              </MessageForwardedBundleAttachment>
            </MessageForwardedBundleAttachments>
          ) : null}
        </MessageForwardedBundleItem>
      ))}
    </>
  );
}

export function ForwardedBundleEmbeddedComposition({
  items = DEFAULT_FORWARDED_ITEMS,
  sourceLabel = "release-notes",
  sourceHref = MESSAGE_PLAYGROUND_URLS.releaseNotesThread,
  sourceAriaLabel = "Open source thread in release-notes",
  sourceTitle = "Open source message",
  collapsible = true,
}: ForwardedBundleEmbeddedCompositionProps = {}) {
  const [expanded, setExpanded] = useState(false);

  const handleToggleExpanded = useCallback(() => {
    setExpanded((current) => !current);
  }, []);

  return (
    <MessageItemEmbedded>
      <MessageForwardedBundle data-testid="forwarded-bundle-card">
        <MessageForwardedBundleHeader>
          <MessageForwardedBundleHeaderContent>
            <MessageForwardedBundleHeaderLabel>
              <Forward size={12} />
              Forwarded
            </MessageForwardedBundleHeaderLabel>
            <MessageForwardedBundleHeaderCount>
              {items.length} messages
            </MessageForwardedBundleHeaderCount>
          </MessageForwardedBundleHeaderContent>
          <MessageForwardedBundleSource
            data-testid="forwarded-bundle-source-label"
            title={sourceHref ? sourceTitle : undefined}
            render={sourceHref ? <a href={sourceHref} aria-label={sourceAriaLabel} /> : undefined}
          >
            from #{sourceLabel}
          </MessageForwardedBundleSource>
        </MessageForwardedBundleHeader>
        <MessageForwardedBundleItems collapsed={collapsible && !expanded}>
          <ForwardedBundleItemsContent items={items} />
        </MessageForwardedBundleItems>
        {collapsible ? (
          <MessageForwardedBundleFooter>
            <MessageForwardedBundleFooterAction onClick={handleToggleExpanded}>
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? "Collapse" : `Show all ${items.length} messages`}
            </MessageForwardedBundleFooterAction>
          </MessageForwardedBundleFooter>
        ) : null}
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
