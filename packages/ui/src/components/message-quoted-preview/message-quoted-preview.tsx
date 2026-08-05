import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { MessageEmbed, MessageEmbedContent, MessageEmbedHeader } from "../message-embed";
import { messageQuotedPreview } from "./message-quoted-preview.recipe";

type DivProps = useRender.ComponentProps<"div">;
type SpanProps = useRender.ComponentProps<"span">;

export type MessageQuotedPreviewProps = DivProps;

export function MessageQuotedPreview({ className, render, ...props }: MessageQuotedPreviewProps) {
  const theme = useThemeFamily();
  const { root } = messageQuotedPreview({ theme });

  return <MessageEmbed className={root({ className })} render={render} {...props} />;
}

export type MessageQuotedPreviewContentProps = DivProps;

export function MessageQuotedPreviewContent({
  className,
  render,
  ...props
}: MessageQuotedPreviewContentProps) {
  const theme = useThemeFamily();
  const { content } = messageQuotedPreview({ theme });

  return <MessageEmbedContent className={content({ className })} render={render} {...props} />;
}

export type MessageQuotedPreviewHeaderProps = DivProps;

export function MessageQuotedPreviewHeader({
  className,
  render,
  ...props
}: MessageQuotedPreviewHeaderProps) {
  const theme = useThemeFamily();
  const { header } = messageQuotedPreview({ theme });

  return <MessageEmbedHeader className={header({ className })} render={render} {...props} />;
}

export type MessageQuotedPreviewChannelProps = SpanProps;

export function MessageQuotedPreviewChannel({
  className,
  render,
  ...props
}: MessageQuotedPreviewChannelProps) {
  const theme = useThemeFamily();
  const { channel } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: channel({ className }) }, props),
    state: { slot: "message-quoted-preview-channel" },
  });
}

export type MessageQuotedPreviewThreadProps = SpanProps;

export function MessageQuotedPreviewThread({
  className,
  render,
  ...props
}: MessageQuotedPreviewThreadProps) {
  const theme = useThemeFamily();
  const { thread } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: thread({ className }) }, props),
    state: { slot: "message-quoted-preview-thread" },
  });
}

export type MessageQuotedPreviewAuthorProps = SpanProps;

export function MessageQuotedPreviewAuthor({
  className,
  render,
  ...props
}: MessageQuotedPreviewAuthorProps) {
  const theme = useThemeFamily();
  const { author } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: author({ className }) }, props),
    state: { slot: "message-quoted-preview-author" },
  });
}

export type MessageQuotedPreviewAuthorNameProps = SpanProps;

export function MessageQuotedPreviewAuthorName({
  className,
  render,
  ...props
}: MessageQuotedPreviewAuthorNameProps) {
  const theme = useThemeFamily();
  const { authorName } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: authorName({ className }) }, props),
    state: { slot: "message-quoted-preview-author-name" },
  });
}

export type MessageQuotedPreviewAuthorMetaProps = SpanProps;

export function MessageQuotedPreviewAuthorMeta({
  className,
  render,
  ...props
}: MessageQuotedPreviewAuthorMetaProps) {
  const theme = useThemeFamily();
  const { authorMeta } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: authorMeta({ className }) }, props),
    state: { slot: "message-quoted-preview-author-meta" },
  });
}

export type MessageQuotedPreviewTimestampProps = SpanProps;

export function MessageQuotedPreviewTimestamp({
  className,
  render,
  ...props
}: MessageQuotedPreviewTimestampProps) {
  const theme = useThemeFamily();
  const { timestamp } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: timestamp({ className }) }, props),
    state: { slot: "message-quoted-preview-timestamp" },
  });
}

export type MessageQuotedPreviewTextProps = DivProps;

export function MessageQuotedPreviewText({
  className,
  render,
  ...props
}: MessageQuotedPreviewTextProps) {
  const theme = useThemeFamily();
  const { text } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: text({ className }) }, props),
    state: { slot: "message-quoted-preview-text" },
  });
}

export type MessageQuotedPreviewAttachmentsProps = DivProps;

export function MessageQuotedPreviewAttachments({
  className,
  render,
  ...props
}: MessageQuotedPreviewAttachmentsProps) {
  const theme = useThemeFamily();
  const { attachments } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: attachments({ className }) }, props),
    state: { slot: "message-quoted-preview-attachments" },
  });
}

export type MessageQuotedPreviewAttachmentProps = SpanProps;

export function MessageQuotedPreviewAttachment({
  className,
  render,
  ...props
}: MessageQuotedPreviewAttachmentProps) {
  const theme = useThemeFamily();
  const { attachment } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: attachment({ className }) }, props),
    state: { slot: "message-quoted-preview-attachment" },
  });
}

export type MessageQuotedPreviewLoadingProps = DivProps;

export function MessageQuotedPreviewLoading({
  className,
  render,
  ...props
}: MessageQuotedPreviewLoadingProps) {
  const theme = useThemeFamily();
  const { loading } = messageQuotedPreview({ theme });

  return <MessageEmbed className={loading({ className })} render={render} {...props} />;
}

export type MessageQuotedPreviewUnavailableProps = DivProps;

export function MessageQuotedPreviewUnavailable({
  className,
  render,
  ...props
}: MessageQuotedPreviewUnavailableProps) {
  const theme = useThemeFamily();
  const { unavailable } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: unavailable({ className }) }, props),
    state: { slot: "message-quoted-preview-unavailable" },
  });
}
