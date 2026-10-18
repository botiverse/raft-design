import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { MessageEmbed, MessageEmbedContent, MessageEmbedHeader } from "../message-embed";
import { messageQuotedPreview } from "./message-quoted-preview.recipe";

type DivProps = useRender.ComponentProps<"div">;
type SpanProps = useRender.ComponentProps<"span">;

export type MessageQuotedPreviewProps = DivProps;

export function MessageQuotedPreview({ className, render, ...props }: MessageQuotedPreviewProps) {
  const { root } = messageQuotedPreview();

  return <MessageEmbed className={root({ className })} render={render} {...props} />;
}

export type MessageQuotedPreviewContentProps = DivProps;

export function MessageQuotedPreviewContent({
  className,
  render,
  ...props
}: MessageQuotedPreviewContentProps) {
  const { content } = messageQuotedPreview();

  return <MessageEmbedContent className={content({ className })} render={render} {...props} />;
}

export type MessageQuotedPreviewHeaderProps = DivProps;

export function MessageQuotedPreviewHeader({
  className,
  render,
  ...props
}: MessageQuotedPreviewHeaderProps) {
  const { header } = messageQuotedPreview();

  return <MessageEmbedHeader className={header({ className })} render={render} {...props} />;
}

export type MessageQuotedPreviewChannelProps = SpanProps;

export function MessageQuotedPreviewChannel({
  className,
  render,
  ...props
}: MessageQuotedPreviewChannelProps) {
  const { channel } = messageQuotedPreview();

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
  const { thread } = messageQuotedPreview();

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
  const { author } = messageQuotedPreview();

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
  const { authorName } = messageQuotedPreview();

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
  const { authorMeta } = messageQuotedPreview();

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
  const { timestamp } = messageQuotedPreview();

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
  const { text } = messageQuotedPreview();

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
  const { attachments } = messageQuotedPreview();

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
  const { attachment } = messageQuotedPreview();

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
  const { loading } = messageQuotedPreview();

  return <MessageEmbed className={loading({ className })} render={render} {...props} />;
}

export type MessageQuotedPreviewUnavailableProps = DivProps;

export function MessageQuotedPreviewUnavailable({
  className,
  render,
  ...props
}: MessageQuotedPreviewUnavailableProps) {
  const { unavailable } = messageQuotedPreview();

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: unavailable({ className }) }, props),
    state: { slot: "message-quoted-preview-unavailable" },
  });
}
