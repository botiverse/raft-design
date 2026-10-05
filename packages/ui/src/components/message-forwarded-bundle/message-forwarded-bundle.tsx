import { Children } from "react";
import type { ReactNode } from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { MessageImageGallery, MessageImageGalleryItem } from "../message-attachment";
import {
  MessageEmbed,
  MessageEmbedContent,
  MessageEmbedFooter,
  MessageEmbedHeader,
} from "../message-embed";
import {
  messageForwardedBundle,
  messageForwardedBundleGallery,
  messageForwardedBundleItem,
} from "./message-forwarded-bundle.recipe";

type DivProps = useRender.ComponentProps<"div">;
type SpanProps = useRender.ComponentProps<"span">;
type ButtonProps = useRender.ComponentProps<"button">;
type ArticleProps = useRender.ComponentProps<"article">;

export type MessageForwardedBundleProps = DivProps & { fullWidth?: boolean };

export function MessageForwardedBundle({
  className,
  fullWidth = false,
  render,
  ...props
}: MessageForwardedBundleProps) {
  const theme = useThemeFamily();
  const { root } = messageForwardedBundle({ theme, fullWidth });

  return <MessageEmbed className={root({ className })} render={render} {...props} />;
}

export type MessageForwardedBundleHeaderProps = DivProps;

export function MessageForwardedBundleHeader({
  className,
  render,
  ...props
}: MessageForwardedBundleHeaderProps) {
  const theme = useThemeFamily();
  const { header } = messageForwardedBundle({ theme });

  return <MessageEmbedHeader className={header({ className })} render={render} {...props} />;
}

export type MessageForwardedBundleHeaderContentProps = DivProps;

export function MessageForwardedBundleHeaderContent({
  className,
  render,
  ...props
}: MessageForwardedBundleHeaderContentProps) {
  const theme = useThemeFamily();
  const { headerContent } = messageForwardedBundle({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: headerContent({ className }) }, props),
    state: { slot: "message-forwarded-bundle-header-content" },
  });
}

export type MessageForwardedBundleHeaderLabelProps = SpanProps;

export function MessageForwardedBundleHeaderLabel({
  className,
  render,
  ...props
}: MessageForwardedBundleHeaderLabelProps) {
  const theme = useThemeFamily();
  const { headerLabel } = messageForwardedBundle({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: headerLabel({ className }) }, props),
    state: { slot: "message-forwarded-bundle-header-label" },
  });
}

export type MessageForwardedBundleHeaderCountProps = SpanProps;

export function MessageForwardedBundleHeaderCount({
  className,
  render,
  ...props
}: MessageForwardedBundleHeaderCountProps) {
  const theme = useThemeFamily();
  const { headerCount } = messageForwardedBundle({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: headerCount({ className }) }, props),
    state: { slot: "message-forwarded-bundle-header-count" },
  });
}

export type MessageForwardedBundleItemsProps = DivProps & { collapsed?: boolean };

export function MessageForwardedBundleItems({
  className,
  collapsed = false,
  render,
  ...props
}: MessageForwardedBundleItemsProps) {
  const theme = useThemeFamily();
  const { items } = messageForwardedBundle({ theme, collapsed });
  return (
    <MessageEmbedContent
      className={items({ className })}
      data-collapsed={collapsed || undefined}
      render={render}
      {...props}
    />
  );
}

export type MessageForwardedBundleItemProps = ArticleProps;

export function MessageForwardedBundleItem({
  className,
  render,
  ...props
}: MessageForwardedBundleItemProps) {
  const theme = useThemeFamily();
  const { root } = messageForwardedBundleItem({ theme });
  return useRender({
    defaultTagName: "article",
    render,
    props: mergeProps<"article">({ className: root({ className }) }, props),
    state: { slot: "message-forwarded-bundle-item" },
  });
}

export type MessageForwardedBundleItemMetaProps = DivProps;

export function MessageForwardedBundleItemMeta({
  className,
  render,
  ...props
}: MessageForwardedBundleItemMetaProps) {
  const theme = useThemeFamily();
  const { meta } = messageForwardedBundleItem({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: meta({ className }) }, props),
    state: { slot: "message-forwarded-bundle-item-meta" },
  });
}

export type MessageForwardedBundleItemAuthorProps = SpanProps;

export function MessageForwardedBundleItemAuthor({
  className,
  render,
  ...props
}: MessageForwardedBundleItemAuthorProps) {
  const theme = useThemeFamily();
  const { author } = messageForwardedBundleItem({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: author({ className }) }, props),
    state: { slot: "message-forwarded-bundle-item-author" },
  });
}

export type MessageForwardedBundleAttachmentsProps = DivProps;

export function MessageForwardedBundleAttachments({
  className,
  render,
  ...props
}: MessageForwardedBundleAttachmentsProps) {
  const theme = useThemeFamily();
  const { attachments } = messageForwardedBundleItem({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: attachments({ className }) }, props),
    state: { slot: "message-forwarded-bundle-attachments" },
  });
}

export type MessageForwardedBundleAttachmentProps = SpanProps & {
  /**
   * Marks the attachment as actionable (the consumer wires the open action on
   * `render`). Adds the pointer/hover/focus affordance to the chip.
   */
  interactive?: boolean;
};

export function MessageForwardedBundleAttachment({
  className,
  interactive = false,
  render,
  ...props
}: MessageForwardedBundleAttachmentProps) {
  const theme = useThemeFamily();
  const { attachment } = messageForwardedBundleItem({
    theme,
    action: interactive ? "interactive" : "static",
  });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: attachment({ className }) }, props),
    state: { slot: "message-forwarded-bundle-attachment" },
  });
}

export type MessageForwardedBundleAttachmentNameProps = SpanProps;

export function MessageForwardedBundleAttachmentName({
  className,
  render,
  ...props
}: MessageForwardedBundleAttachmentNameProps) {
  const theme = useThemeFamily();
  const { attachmentName } = messageForwardedBundleItem({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: attachmentName({ className }) }, props),
    state: { slot: "message-forwarded-bundle-attachment-name" },
  });
}

export type MessageForwardedBundleAttachmentMetaProps = SpanProps;

export function MessageForwardedBundleAttachmentMeta({
  className,
  render,
  ...props
}: MessageForwardedBundleAttachmentMetaProps) {
  const theme = useThemeFamily();
  const { attachmentMeta } = messageForwardedBundleItem({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: attachmentMeta({ className }) }, props),
    state: { slot: "message-forwarded-bundle-attachment-meta" },
  });
}

export type MessageForwardedBundleFooterProps = DivProps;

export function MessageForwardedBundleFooter({
  className,
  render,
  ...props
}: MessageForwardedBundleFooterProps) {
  return <MessageEmbedFooter className={className} render={render} {...props} />;
}

export type MessageForwardedBundleSourceProps = ButtonProps;

export function MessageForwardedBundleSource({
  className,
  render,
  ...props
}: MessageForwardedBundleSourceProps) {
  const theme = useThemeFamily();
  const { source } = messageForwardedBundle({ theme });
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">({ type: "button", className: source({ className }) }, props),
    state: { slot: "message-forwarded-bundle-source" },
  });
}

export type MessageForwardedBundleSourceLabelProps = SpanProps;

export function MessageForwardedBundleSourceLabel({
  className,
  render,
  ...props
}: MessageForwardedBundleSourceLabelProps) {
  const theme = useThemeFamily();
  const { sourceLabel } = messageForwardedBundle({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: sourceLabel({ className }) }, props),
    state: { slot: "message-forwarded-bundle-source-label" },
  });
}

export type MessageForwardedBundleFooterActionProps = ButtonProps;

export function MessageForwardedBundleFooterAction({
  className,
  render,
  ...props
}: MessageForwardedBundleFooterActionProps) {
  const theme = useThemeFamily();
  const { footerAction } = messageForwardedBundle({ theme });
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">({ type: "button", className: footerAction({ className }) }, props),
    state: { slot: "message-forwarded-bundle-footer-action" },
  });
}

export type MessageForwardedBundleGalleryProps = DivProps;

/**
 * Image rows for forwarded attachments. The gallery owns the layout — rows of
 * three (a lone row of exactly four splits two-and-two) at the message gallery
 * row heights — and composes the shared MessageImageGallery surfaces, so
 * forwarded images are the same component family as images in a message.
 * Consumers only place the media (`MessageForwardedBundleGalleryTile`).
 */
export function MessageForwardedBundleGallery({
  className,
  children,
  ...props
}: MessageForwardedBundleGalleryProps) {
  const { root, row } = messageForwardedBundleGallery();
  const items = Children.toArray(children);
  // Mirror the message gallery rowing rule: chunks of three; a lone buffer of
  // exactly four splits into two-and-two.
  const chunkSize = items.length === 4 ? 2 : 3;
  const rows: ReactNode[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    rows.push(items.slice(index, index + chunkSize));
  }

  return (
    <MessageImageGallery className={root({ className })} {...props}>
      {rows.map((rowItems, index) => (
        <div
          key={index}
          className={row({ count: rowItems.length as 1 | 2 | 3 })}
          data-slot="message-forwarded-bundle-gallery-row"
        >
          {rowItems}
        </div>
      ))}
    </MessageImageGallery>
  );
}

export type MessageForwardedBundleGalleryTileProps = DivProps;

/**
 * A media cell in the forwarded gallery rows: the shared message gallery item
 * (its themed surface and rounding come from MessageImageGalleryItem).
 */
export function MessageForwardedBundleGalleryTile({
  className,
  render,
  ...props
}: MessageForwardedBundleGalleryTileProps) {
  const { tile } = messageForwardedBundleGallery();

  return <MessageImageGalleryItem className={tile({ className })} render={render} {...props} />;
}
