import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageProductState } from "../message-product-state/message-product-state.recipe";

type DivProps = useRender.ComponentProps<"div">;
type SpanProps = useRender.ComponentProps<"span">;
type ButtonProps = useRender.ComponentProps<"button">;
type ArticleProps = useRender.ComponentProps<"article">;

function createDivPart(slot: string, recipeSlot: keyof ReturnType<typeof messageProductState>) {
  return function MessageForwardedBundlePart({ className, render, ...props }: DivProps) {
    const theme = useThemeFamily();
    const recipe = messageProductState({ theme })[recipeSlot] as (value: {
      className?: string;
    }) => string;
    return useRender({
      defaultTagName: "div",
      render,
      props: mergeProps<"div">({ className: recipe({ className }) }, props),
      state: { slot },
    });
  };
}

function createSpanPart(slot: string, recipeSlot: keyof ReturnType<typeof messageProductState>) {
  return function MessageForwardedBundlePart({ className, render, ...props }: SpanProps) {
    const theme = useThemeFamily();
    const recipe = messageProductState({ theme })[recipeSlot] as (value: {
      className?: string;
    }) => string;
    return useRender({
      defaultTagName: "span",
      render,
      props: mergeProps<"span">({ className: recipe({ className }) }, props),
      state: { slot },
    });
  };
}

export const MessageForwardedBundle = createDivPart("message-forwarded-bundle", "forwardedBundle");
export const MessageForwardedBundleHeader = createDivPart(
  "message-forwarded-bundle-header",
  "forwardedHeader",
);
export const MessageForwardedBundleHeaderLabel = createSpanPart(
  "message-forwarded-bundle-header-label",
  "forwardedHeaderLabel",
);
export const MessageForwardedBundleHeaderCount = createSpanPart(
  "message-forwarded-bundle-header-count",
  "forwardedHeaderCount",
);
export const MessageForwardedBundleItems = createDivPart(
  "message-forwarded-bundle-items",
  "forwardedItems",
);
export function MessageForwardedBundleItem({ className, render, ...props }: ArticleProps) {
  const theme = useThemeFamily();
  const { forwardedItem } = messageProductState({ theme });
  return useRender({
    defaultTagName: "article",
    render,
    props: mergeProps<"article">({ className: forwardedItem({ className }) }, props),
    state: { slot: "message-forwarded-bundle-item" },
  });
}
export const MessageForwardedBundleItemMeta = createDivPart(
  "message-forwarded-bundle-item-meta",
  "forwardedItemMeta",
);
export const MessageForwardedBundleItemAuthor = createSpanPart(
  "message-forwarded-bundle-item-author",
  "forwardedItemAuthor",
);
export const MessageForwardedBundleContent = createDivPart(
  "message-forwarded-bundle-content",
  "forwardedContent",
);
export const MessageForwardedBundleAttachments = createDivPart(
  "message-forwarded-bundle-attachments",
  "forwardedAttachments",
);
export const MessageForwardedBundleAttachment = createSpanPart(
  "message-forwarded-bundle-attachment",
  "forwardedAttachment",
);
export const MessageForwardedBundleAttachmentName = createSpanPart(
  "message-forwarded-bundle-attachment-name",
  "forwardedAttachmentName",
);
export const MessageForwardedBundleAttachmentMeta = createSpanPart(
  "message-forwarded-bundle-attachment-meta",
  "forwardedAttachmentMeta",
);
export const MessageForwardedBundleCollapsedFade = createDivPart(
  "message-forwarded-bundle-collapsed-fade",
  "forwardedCollapsedFade",
);
export const MessageForwardedBundleFooter = createDivPart(
  "message-forwarded-bundle-footer",
  "forwardedFooter",
);

export type MessageForwardedBundleSourceProps = ButtonProps;

export function MessageForwardedBundleSource({
  className,
  render,
  ...props
}: MessageForwardedBundleSourceProps) {
  const theme = useThemeFamily();
  const { forwardedSource } = messageProductState({ theme });
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      { type: "button", className: forwardedSource({ className }) },
      props,
    ),
    state: { slot: "message-forwarded-bundle-source" },
  });
}

export type MessageForwardedBundleToggleProps = ButtonProps;

export function MessageForwardedBundleToggle({
  className,
  render,
  ...props
}: MessageForwardedBundleToggleProps) {
  const theme = useThemeFamily();
  const { forwardedToggle } = messageProductState({ theme });
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      { type: "button", className: forwardedToggle({ className }) },
      props,
    ),
    state: { slot: "message-forwarded-bundle-toggle" },
  });
}

export type MessageForwardedBundleProps = DivProps;
export type MessageForwardedBundleHeaderProps = DivProps;
export type MessageForwardedBundleHeaderLabelProps = SpanProps;
export type MessageForwardedBundleHeaderCountProps = SpanProps;
export type MessageForwardedBundleItemsProps = DivProps;
export type MessageForwardedBundleItemProps = ArticleProps;
export type MessageForwardedBundleItemMetaProps = DivProps;
export type MessageForwardedBundleItemAuthorProps = SpanProps;
export type MessageForwardedBundleContentProps = DivProps;
export type MessageForwardedBundleAttachmentsProps = DivProps;
export type MessageForwardedBundleAttachmentProps = SpanProps;
export type MessageForwardedBundleAttachmentNameProps = SpanProps;
export type MessageForwardedBundleAttachmentMetaProps = SpanProps;
export type MessageForwardedBundleCollapsedFadeProps = DivProps;
export type MessageForwardedBundleFooterProps = DivProps;
