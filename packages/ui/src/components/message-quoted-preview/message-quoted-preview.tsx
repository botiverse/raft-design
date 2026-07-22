import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { Theme } from "../../lib/theme/theme-context";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageQuotedPreview } from "./message-quoted-preview.recipe";

type DivProps = useRender.ComponentProps<"div">;
type SpanProps = useRender.ComponentProps<"span">;
type RecipePart = (options?: { className?: string }) => string;
type ResolveRecipePart = (theme: Theme) => RecipePart;

function createDivPart(slot: string, resolveRecipePart: ResolveRecipePart) {
  return function MessageQuotedPreviewPart({ className, render, ...props }: DivProps) {
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
  return function MessageQuotedPreviewPart({ className, render, ...props }: SpanProps) {
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

export const MessageQuotedPreview = createDivPart(
  "message-quoted-preview",
  (theme) => messageQuotedPreview({ theme }).root,
);
export const MessageQuotedPreviewContent = createDivPart(
  "message-quoted-preview-content",
  (theme) => messageQuotedPreview({ theme }).content,
);
export const MessageQuotedPreviewHeader = createDivPart(
  "message-quoted-preview-header",
  (theme) => messageQuotedPreview({ theme }).header,
);
export const MessageQuotedPreviewContext = createDivPart(
  "message-quoted-preview-context",
  (theme) => messageQuotedPreview({ theme }).context,
);
export const MessageQuotedPreviewChannel = createSpanPart(
  "message-quoted-preview-channel",
  (theme) => messageQuotedPreview({ theme }).channel,
);
export const MessageQuotedPreviewSeparator = createSpanPart(
  "message-quoted-preview-separator",
  (theme) => messageQuotedPreview({ theme }).separator,
);
export const MessageQuotedPreviewAuthor = createSpanPart(
  "message-quoted-preview-author",
  (theme) => messageQuotedPreview({ theme }).author,
);
export const MessageQuotedPreviewAuthorName = createSpanPart(
  "message-quoted-preview-author-name",
  (theme) => messageQuotedPreview({ theme }).authorName,
);
export const MessageQuotedPreviewAuthorMeta = createSpanPart(
  "message-quoted-preview-author-meta",
  (theme) => messageQuotedPreview({ theme }).authorMeta,
);
export const MessageQuotedPreviewTimestamp = createSpanPart(
  "message-quoted-preview-timestamp",
  (theme) => messageQuotedPreview({ theme }).timestamp,
);
export const MessageQuotedPreviewBody = createDivPart(
  "message-quoted-preview-body",
  (theme) => messageQuotedPreview({ theme }).body,
);
export const MessageQuotedPreviewText = createDivPart(
  "message-quoted-preview-text",
  (theme) => messageQuotedPreview({ theme }).text,
);
export const MessageQuotedPreviewAttachments = createDivPart(
  "message-quoted-preview-attachments",
  (theme) => messageQuotedPreview({ theme }).attachments,
);
export const MessageQuotedPreviewAttachment = createSpanPart(
  "message-quoted-preview-attachment",
  (theme) => messageQuotedPreview({ theme }).attachment,
);
export const MessageQuotedPreviewLoading = createDivPart(
  "message-quoted-preview-loading",
  (theme) => messageQuotedPreview({ theme }).loading,
);
export const MessageQuotedPreviewLoadingHeader = createDivPart(
  "message-quoted-preview-loading-header",
  (theme) => messageQuotedPreview({ theme }).loadingHeader,
);
export const MessageQuotedPreviewLoadingContent = createDivPart(
  "message-quoted-preview-loading-content",
  (theme) => messageQuotedPreview({ theme }).loadingContent,
);
export const MessageQuotedPreviewLoadingAvatar = createDivPart(
  "message-quoted-preview-loading-avatar",
  (theme) => messageQuotedPreview({ theme }).loadingAvatar,
);
export const MessageQuotedPreviewLoadingLines = createDivPart(
  "message-quoted-preview-loading-lines",
  (theme) => messageQuotedPreview({ theme }).loadingLines,
);
export const MessageQuotedPreviewLoadingLine = createDivPart(
  "message-quoted-preview-loading-line",
  (theme) => messageQuotedPreview({ theme }).loadingLine,
);
export const MessageQuotedPreviewUnavailable = createDivPart(
  "message-quoted-preview-unavailable",
  (theme) => messageQuotedPreview({ theme }).unavailable,
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
