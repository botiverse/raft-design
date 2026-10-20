import { useCallback, useState } from "react";
import {
  MESSAGE_FIXTURE_AVATAR_SRC,
  MESSAGE_EXAMPLE_HREFS,
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
} from "@botiverse/raft-ui";
import { Markdown } from "#/lib/markdown/markdown.tsx";
import { ChevronDown, ChevronUp, FileText, Forward } from "lucide-react";

import {
  MessageForwardedBundle,
  MessageForwardedBundleAttachment,
  MessageForwardedBundleAttachmentMeta,
  MessageForwardedBundleAttachmentName,
  MessageForwardedBundleAttachments,
  MessageForwardedBundleFooter,
  MessageForwardedBundleGallery,
  MessageForwardedBundleGalleryTile,
  MessageForwardedBundleHeader,
  MessageForwardedBundleHeaderContent,
  MessageForwardedBundleHeaderCount,
  MessageForwardedBundleHeaderLabel,
  MessageForwardedBundleItem,
  MessageForwardedBundleItemAuthor,
  MessageForwardedBundleItemContent,
  MessageForwardedBundleItemMeta,
  MessageForwardedBundleItems,
  MessageForwardedBundleSource,
  MessageForwardedBundleFooterAction,
} from "@botiverse/raft-ui";

export type ForwardedBundleCompositionItem = {
  id: string;
  author: string;
  createdAt: string;
  createdAtDateTime?: string;
  content: string;
  attachment?: { name: string; meta: string };
  images?: readonly string[];
};

const FORWARDED_FIXTURE_IMAGES = [
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='96'%20height='96'%3E%3Crect%20width='96'%20height='96'%20fill='%23dbeafe'/%3E%3Ccircle%20cx='48'%20cy='46'%20r='20'%20fill='%2360a5fa'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='96'%20height='96'%3E%3Crect%20width='96'%20height='96'%20fill='%23dcfce7'/%3E%3Crect%20x='26'%20y='26'%20width='44'%20height='44'%20fill='%234ade80'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='96'%20height='96'%3E%3Crect%20width='96'%20height='96'%20fill='%23fef3c7'/%3E%3Cpath%20d='M48%2028l20%2036H28z'%20fill='%23f59e0b'/%3E%3C/svg%3E",
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='96'%20height='96'%3E%3Crect%20width='96'%20height='96'%20fill='%23fce7f3'/%3E%3Ccircle%20cx='36'%20cy='40'%20r='14'%20fill='%23ec4899'/%3E%3Ccircle%20cx='62'%20cy='58'%20r='14'%20fill='%23f9a8d4'/%3E%3C/svg%3E",
];

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
    images: FORWARDED_FIXTURE_IMAGES,
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
            <span aria-hidden>·</span>
            <time dateTime={item.createdAtDateTime}>{item.createdAt}</time>
          </MessageForwardedBundleItemMeta>
          <MessageForwardedBundleItemContent>
            <Markdown>{item.content}</Markdown>
          </MessageForwardedBundleItemContent>
          {item.images?.length || item.attachment ? (
            <MessageForwardedBundleAttachments>
              {item.images?.length ? (
                <MessageForwardedBundleGallery>
                  {item.images.map((src, index) => (
                    <MessageForwardedBundleGalleryTile key={`${item.id}-image-${index}`}>
                      <img src={src} alt="" />
                    </MessageForwardedBundleGalleryTile>
                  ))}
                </MessageForwardedBundleGallery>
              ) : null}
              {item.attachment ? (
                <MessageForwardedBundleAttachment>
                  <FileText size={12} />
                  <MessageForwardedBundleAttachmentName>
                    {item.attachment.name}
                  </MessageForwardedBundleAttachmentName>
                  <MessageForwardedBundleAttachmentMeta>
                    · {item.attachment.meta}
                  </MessageForwardedBundleAttachmentMeta>
                </MessageForwardedBundleAttachment>
              ) : null}
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
  sourceHref = MESSAGE_EXAMPLE_HREFS.releaseNotesThread,
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
