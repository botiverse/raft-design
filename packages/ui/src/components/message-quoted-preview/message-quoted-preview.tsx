import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageProductState } from "../message-product-state/message-product-state.recipe";

type DivProps = useRender.ComponentProps<"div">;
type SpanProps = useRender.ComponentProps<"span">;

function createDivPart(slot: string, recipeSlot: keyof ReturnType<typeof messageProductState>) {
  return function MessageQuotedPreviewPart({ className, render, ...props }: DivProps) {
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
  return function MessageQuotedPreviewPart({ className, render, ...props }: SpanProps) {
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

export const MessageQuotedPreview = createDivPart("message-quoted-preview", "quotedPreview");
export const MessageQuotedPreviewContent = createDivPart(
  "message-quoted-preview-content",
  "quotedPreviewContent",
);
export const MessageQuotedPreviewHeader = createDivPart(
  "message-quoted-preview-header",
  "quotedPreviewHeader",
);
export const MessageQuotedPreviewContext = createDivPart(
  "message-quoted-preview-context",
  "quotedPreviewContext",
);
export const MessageQuotedPreviewChannel = createSpanPart(
  "message-quoted-preview-channel",
  "quotedPreviewChannel",
);
export const MessageQuotedPreviewSeparator = createSpanPart(
  "message-quoted-preview-separator",
  "quotedPreviewSeparator",
);
export const MessageQuotedPreviewAuthor = createSpanPart(
  "message-quoted-preview-author",
  "quotedPreviewAuthor",
);
export const MessageQuotedPreviewAuthorName = createSpanPart(
  "message-quoted-preview-author-name",
  "quotedPreviewAuthorName",
);
export const MessageQuotedPreviewAuthorMeta = createSpanPart(
  "message-quoted-preview-author-meta",
  "quotedPreviewAuthorMeta",
);
export const MessageQuotedPreviewTimestamp = createSpanPart(
  "message-quoted-preview-timestamp",
  "quotedPreviewTimestamp",
);
export const MessageQuotedPreviewBody = createDivPart(
  "message-quoted-preview-body",
  "quotedPreviewBody",
);
export const MessageQuotedPreviewText = createDivPart(
  "message-quoted-preview-text",
  "quotedPreviewText",
);
export const MessageQuotedPreviewAttachments = createDivPart(
  "message-quoted-preview-attachments",
  "quotedPreviewAttachments",
);
export const MessageQuotedPreviewAttachment = createSpanPart(
  "message-quoted-preview-attachment",
  "quotedPreviewAttachment",
);
export const MessageQuotedPreviewLoading = createDivPart(
  "message-quoted-preview-loading",
  "quotedPreviewLoading",
);
export const MessageQuotedPreviewLoadingHeader = createDivPart(
  "message-quoted-preview-loading-header",
  "quotedPreviewLoadingHeader",
);
export const MessageQuotedPreviewLoadingContent = createDivPart(
  "message-quoted-preview-loading-content",
  "quotedPreviewLoadingContent",
);
export const MessageQuotedPreviewLoadingAvatar = createDivPart(
  "message-quoted-preview-loading-avatar",
  "quotedPreviewLoadingAvatar",
);
export const MessageQuotedPreviewLoadingLines = createDivPart(
  "message-quoted-preview-loading-lines",
  "quotedPreviewLoadingLines",
);
export const MessageQuotedPreviewLoadingLine = createDivPart(
  "message-quoted-preview-loading-line",
  "quotedPreviewLoadingLine",
);
export const MessageQuotedPreviewUnavailable = createDivPart(
  "message-quoted-preview-unavailable",
  "quotedPreviewUnavailable",
);

export type MessageQuotedPreviewProps = DivProps;
export type MessageQuotedPreviewContentProps = DivProps;
export type MessageQuotedPreviewHeaderProps = DivProps;
export type MessageQuotedPreviewContextProps = DivProps;
export type MessageQuotedPreviewChannelProps = SpanProps;
export type MessageQuotedPreviewSeparatorProps = SpanProps;
export type MessageQuotedPreviewAuthorProps = SpanProps;
export type MessageQuotedPreviewAuthorNameProps = SpanProps;
export type MessageQuotedPreviewAuthorMetaProps = SpanProps;
export type MessageQuotedPreviewTimestampProps = SpanProps;
export type MessageQuotedPreviewBodyProps = DivProps;
export type MessageQuotedPreviewTextProps = DivProps;
export type MessageQuotedPreviewAttachmentsProps = DivProps;
export type MessageQuotedPreviewAttachmentProps = SpanProps;
export type MessageQuotedPreviewLoadingProps = DivProps;
export type MessageQuotedPreviewLoadingHeaderProps = DivProps;
export type MessageQuotedPreviewLoadingContentProps = DivProps;
export type MessageQuotedPreviewLoadingAvatarProps = DivProps;
export type MessageQuotedPreviewLoadingLinesProps = DivProps;
export type MessageQuotedPreviewLoadingLineProps = DivProps;
export type MessageQuotedPreviewUnavailableProps = DivProps;
