import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { Theme } from "../../lib/theme/theme-context";
import { useThemeFamily } from "../../lib/theme/use-theme";
import {
  messageForwardedBundle,
  messageForwardedBundleItem,
} from "./message-forwarded-bundle.recipe";

type DivProps = useRender.ComponentProps<"div">;
type SpanProps = useRender.ComponentProps<"span">;
type ButtonProps = useRender.ComponentProps<"button">;
type ArticleProps = useRender.ComponentProps<"article">;
type RecipePart = (options?: { className?: string }) => string;
type ResolveRecipePart = (theme: Theme) => RecipePart;

function createDivPart(slot: string, resolveRecipePart: ResolveRecipePart) {
  return function MessageForwardedBundlePart({ className, render, ...props }: DivProps) {
    const theme = useThemeFamily();
    const recipe = resolveRecipePart(theme);
    return useRender({
      defaultTagName: "div",
      render,
      props: mergeProps<"div">({ className: recipe({ className }) }, props),
      state: { slot },
    });
  };
}

function createSpanPart(slot: string, resolveRecipePart: ResolveRecipePart) {
  return function MessageForwardedBundlePart({ className, render, ...props }: SpanProps) {
    const theme = useThemeFamily();
    const recipe = resolveRecipePart(theme);
    return useRender({
      defaultTagName: "span",
      render,
      props: mergeProps<"span">({ className: recipe({ className }) }, props),
      state: { slot },
    });
  };
}

export const MessageForwardedBundle = createDivPart(
  "message-forwarded-bundle",
  (theme) => messageForwardedBundle({ theme }).root,
);
export const MessageForwardedBundleInset = createDivPart(
  "message-forwarded-bundle-inset",
  (theme) => messageForwardedBundle({ theme }).inset,
);
export const MessageForwardedBundleHeader = createDivPart(
  "message-forwarded-bundle-header",
  (theme) => messageForwardedBundle({ theme }).header,
);
export const MessageForwardedBundleHeaderContent = createDivPart(
  "message-forwarded-bundle-header-content",
  (theme) => messageForwardedBundle({ theme }).headerContent,
);
export const MessageForwardedBundleHeaderLabel = createSpanPart(
  "message-forwarded-bundle-header-label",
  (theme) => messageForwardedBundle({ theme }).headerLabel,
);
export const MessageForwardedBundleHeaderCount = createSpanPart(
  "message-forwarded-bundle-header-count",
  (theme) => messageForwardedBundle({ theme }).headerCount,
);
export type MessageForwardedBundleItemsProps = DivProps & { collapsed?: boolean };

export function MessageForwardedBundleItems({
  className,
  collapsed = false,
  render,
  ...props
}: MessageForwardedBundleItemsProps) {
  const theme = useThemeFamily();
  const { items } = messageForwardedBundle({ theme, collapsed });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: items({ className }) }, props),
    state: { collapsed, slot: "message-forwarded-bundle-items" },
  });
}
export function MessageForwardedBundleItem({ className, render, ...props }: ArticleProps) {
  const theme = useThemeFamily();
  const { root } = messageForwardedBundleItem({ theme });
  return useRender({
    defaultTagName: "article",
    render,
    props: mergeProps<"article">({ className: root({ className }) }, props),
    state: { slot: "message-forwarded-bundle-item" },
  });
}
export const MessageForwardedBundleItemMeta = createDivPart(
  "message-forwarded-bundle-item-meta",
  (theme) => messageForwardedBundleItem({ theme }).meta,
);
export const MessageForwardedBundleItemAuthor = createSpanPart(
  "message-forwarded-bundle-item-author",
  (theme) => messageForwardedBundleItem({ theme }).author,
);
export const MessageForwardedBundleAttachments = createDivPart(
  "message-forwarded-bundle-attachments",
  (theme) => messageForwardedBundleItem({ theme }).attachments,
);
export const MessageForwardedBundleAttachment = createSpanPart(
  "message-forwarded-bundle-attachment",
  (theme) => messageForwardedBundleItem({ theme }).attachment,
);
export const MessageForwardedBundleAttachmentName = createSpanPart(
  "message-forwarded-bundle-attachment-name",
  (theme) => messageForwardedBundleItem({ theme }).attachmentName,
);
export const MessageForwardedBundleAttachmentMeta = createSpanPart(
  "message-forwarded-bundle-attachment-meta",
  (theme) => messageForwardedBundleItem({ theme }).attachmentMeta,
);
export const MessageForwardedBundleFooter = createDivPart(
  "message-forwarded-bundle-footer",
  (theme) => messageForwardedBundle({ theme }).footer,
);

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

export const MessageForwardedBundleSourceLabel = createSpanPart(
  "message-forwarded-bundle-source-label",
  (theme) => messageForwardedBundle({ theme }).sourceLabel,
);

export type MessageForwardedBundleToggleProps = ButtonProps;

export function MessageForwardedBundleToggle({
  className,
  render,
  ...props
}: MessageForwardedBundleToggleProps) {
  const theme = useThemeFamily();
  const { toggle } = messageForwardedBundle({ theme });
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">({ type: "button", className: toggle({ className }) }, props),
    state: { slot: "message-forwarded-bundle-toggle" },
  });
}

export type MessageForwardedBundleProps = DivProps;
export type MessageForwardedBundleInsetProps = DivProps;
export type MessageForwardedBundleHeaderProps = DivProps;
export type MessageForwardedBundleHeaderContentProps = DivProps;
export type MessageForwardedBundleHeaderLabelProps = SpanProps;
export type MessageForwardedBundleHeaderCountProps = SpanProps;
export type MessageForwardedBundleItemProps = ArticleProps;
export type MessageForwardedBundleItemMetaProps = DivProps;
export type MessageForwardedBundleItemAuthorProps = SpanProps;
export type MessageForwardedBundleAttachmentsProps = DivProps;
export type MessageForwardedBundleAttachmentProps = SpanProps;
export type MessageForwardedBundleAttachmentNameProps = SpanProps;
export type MessageForwardedBundleAttachmentMetaProps = SpanProps;
export type MessageForwardedBundleFooterProps = DivProps;
export type MessageForwardedBundleSourceLabelProps = SpanProps;
