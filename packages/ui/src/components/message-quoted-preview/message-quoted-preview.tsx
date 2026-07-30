import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageQuotedPreview } from "./message-quoted-preview.recipe";

type DivProps = useRender.ComponentProps<"div">;
type SpanProps = useRender.ComponentProps<"span">;
export function MessageQuotedPreview({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { root } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: root({ className }) }, props),
    state: { slot: "message-quoted-preview" },
  });
}

export function MessageQuotedPreviewContent({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { content } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: content({ className }) }, props),
    state: { slot: "message-quoted-preview-content" },
  });
}

export function MessageQuotedPreviewHeader({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { header } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: header({ className }) }, props),
    state: { slot: "message-quoted-preview-header" },
  });
}

export function MessageQuotedPreviewContext({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { context } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: context({ className }) }, props),
    state: { slot: "message-quoted-preview-context" },
  });
}

export function MessageQuotedPreviewChannel({ className, render, ...props }: SpanProps) {
  const theme = useThemeFamily();
  const { channel } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: channel({ className }) }, props),
    state: { slot: "message-quoted-preview-channel" },
  });
}

export function MessageQuotedPreviewThread({ className, render, ...props }: SpanProps) {
  const theme = useThemeFamily();
  const { thread } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: thread({ className }) }, props),
    state: { slot: "message-quoted-preview-thread" },
  });
}

export function MessageQuotedPreviewAuthor({ className, render, ...props }: SpanProps) {
  const theme = useThemeFamily();
  const { author } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: author({ className }) }, props),
    state: { slot: "message-quoted-preview-author" },
  });
}

export function MessageQuotedPreviewAuthorName({ className, render, ...props }: SpanProps) {
  const theme = useThemeFamily();
  const { authorName } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: authorName({ className }) }, props),
    state: { slot: "message-quoted-preview-author-name" },
  });
}

export function MessageQuotedPreviewAuthorMeta({ className, render, ...props }: SpanProps) {
  const theme = useThemeFamily();
  const { authorMeta } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: authorMeta({ className }) }, props),
    state: { slot: "message-quoted-preview-author-meta" },
  });
}

export function MessageQuotedPreviewTimestamp({ className, render, ...props }: SpanProps) {
  const theme = useThemeFamily();
  const { timestamp } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: timestamp({ className }) }, props),
    state: { slot: "message-quoted-preview-timestamp" },
  });
}

export function MessageQuotedPreviewText({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { text } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: text({ className }) }, props),
    state: { slot: "message-quoted-preview-text" },
  });
}

export function MessageQuotedPreviewAttachments({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { attachments } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: attachments({ className }) }, props),
    state: { slot: "message-quoted-preview-attachments" },
  });
}

export function MessageQuotedPreviewAttachment({ className, render, ...props }: SpanProps) {
  const theme = useThemeFamily();
  const { attachment } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">({ className: attachment({ className }) }, props),
    state: { slot: "message-quoted-preview-attachment" },
  });
}

export function MessageQuotedPreviewLoading({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { loading } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: loading({ className }) }, props),
    state: { slot: "message-quoted-preview-loading" },
  });
}
export function MessageQuotedPreviewUnavailable({ className, render, ...props }: DivProps) {
  const theme = useThemeFamily();
  const { unavailable } = messageQuotedPreview({ theme });

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">({ className: unavailable({ className }) }, props),
    state: { slot: "message-quoted-preview-unavailable" },
  });
}

export type MessageQuotedPreviewProps = DivProps;
export type MessageQuotedPreviewContentProps = DivProps;
export type MessageQuotedPreviewHeaderProps = DivProps;
export type MessageQuotedPreviewContextProps = DivProps;
export type MessageQuotedPreviewChannelProps = SpanProps;
export type MessageQuotedPreviewThreadProps = SpanProps;
export type MessageQuotedPreviewAuthorProps = SpanProps;
export type MessageQuotedPreviewAuthorNameProps = SpanProps;
export type MessageQuotedPreviewAuthorMetaProps = SpanProps;
export type MessageQuotedPreviewTimestampProps = SpanProps;
export type MessageQuotedPreviewTextProps = DivProps;
export type MessageQuotedPreviewAttachmentsProps = DivProps;
export type MessageQuotedPreviewAttachmentProps = SpanProps;
export type MessageQuotedPreviewLoadingProps = DivProps;
export type MessageQuotedPreviewUnavailableProps = DivProps;
