import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageThreadRepliesPreview } from "./message-thread-replies-preview.recipe";

export type MessageItemThreadRepliesPreviewProps = useRender.ComponentProps<"div">;

function MessageItemThreadRepliesPreviewRoot({
  className,
  render,
  ...props
}: MessageItemThreadRepliesPreviewProps) {
  const theme = useThemeFamily();
  const { root } = messageThreadRepliesPreview({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-item-thread-replies-preview" },
  });
}

export type MessageItemThreadRepliesPreviewTriggerProps = useRender.ComponentProps<"button">;

export function MessageItemThreadRepliesPreviewTrigger({
  className,
  render,
  type = "button",
  ...props
}: MessageItemThreadRepliesPreviewTriggerProps) {
  const theme = useThemeFamily();
  const { trigger } = messageThreadRepliesPreview({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type,
    className: trigger({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: { slot: "message-item-thread-replies-preview-trigger" },
  });
}

export type MessageItemThreadRepliesPreviewSummaryProps = useRender.ComponentProps<"span">;

export function MessageItemThreadRepliesPreviewSummary({
  className,
  render,
  ...props
}: MessageItemThreadRepliesPreviewSummaryProps) {
  const theme = useThemeFamily();
  const { summary } = messageThreadRepliesPreview({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    className: summary({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-thread-replies-preview-summary" },
  });
}

export type MessageItemThreadReplyProps = useRender.ComponentProps<"span">;

export function MessageItemThreadReply({
  className,
  render,
  ...props
}: MessageItemThreadReplyProps) {
  const theme = useThemeFamily();
  const { reply } = messageThreadRepliesPreview({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: reply({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-thread-reply" },
  });
}

export type MessageItemThreadReplyAvatarProps = useRender.ComponentProps<"span">;

export function MessageItemThreadReplyAvatar({
  className,
  render,
  ...props
}: MessageItemThreadReplyAvatarProps) {
  const theme = useThemeFamily();
  const { avatar } = messageThreadRepliesPreview({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: avatar({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-thread-reply-avatar" },
  });
}

export type MessageItemThreadReplySenderProps = useRender.ComponentProps<"span">;

export function MessageItemThreadReplySender({
  className,
  render,
  ...props
}: MessageItemThreadReplySenderProps) {
  const theme = useThemeFamily();
  const { sender } = messageThreadRepliesPreview({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: sender({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-thread-reply-sender" },
  });
}

export type MessageItemThreadReplyPreviewProps = useRender.ComponentProps<"span">;

export function MessageItemThreadReplyPreview({
  className,
  render,
  ...props
}: MessageItemThreadReplyPreviewProps) {
  const theme = useThemeFamily();
  const { preview } = messageThreadRepliesPreview({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: preview({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-thread-reply-preview" },
  });
}

export type MessageItemThreadReplyTimeProps = useRender.ComponentProps<"time">;

export function MessageItemThreadReplyTime({
  className,
  render,
  ...props
}: MessageItemThreadReplyTimeProps) {
  const theme = useThemeFamily();
  const { time } = messageThreadRepliesPreview({ theme });
  const defaultProps: useRender.ElementProps<"time"> = {
    className: time({ className }),
  };

  return useRender({
    defaultTagName: "time",
    render,
    props: mergeProps<"time">(defaultProps, props),
    state: { slot: "message-item-thread-reply-time" },
  });
}

export const MessageItemThreadRepliesPreview = Object.assign(MessageItemThreadRepliesPreviewRoot, {
  Avatar: MessageItemThreadReplyAvatar,
  Preview: MessageItemThreadReplyPreview,
  Reply: MessageItemThreadReply,
  Sender: MessageItemThreadReplySender,
  Summary: MessageItemThreadRepliesPreviewSummary,
  Time: MessageItemThreadReplyTime,
  Trigger: MessageItemThreadRepliesPreviewTrigger,
});

export type MessageItemInlineRepliesTriggerProps = useRender.ComponentProps<"button">;

export function MessageItemInlineRepliesTrigger({
  className,
  render,
  type = "button",
  ...props
}: MessageItemInlineRepliesTriggerProps) {
  const theme = useThemeFamily();
  const { legacyTrigger } = messageThreadRepliesPreview({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type,
    className: legacyTrigger({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: { slot: "message-item-inline-replies-trigger" },
  });
}

export type MessageItemInlineRepliesProps = useRender.ComponentProps<"div">;

export function MessageItemInlineReplies({
  className,
  render,
  ...props
}: MessageItemInlineRepliesProps) {
  const theme = useThemeFamily();
  const { legacyReplies } = messageThreadRepliesPreview({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    className: legacyReplies({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-item-inline-replies" },
  });
}

export type MessageItemInlineRepliesSummaryProps = MessageItemThreadRepliesPreviewSummaryProps;

export function MessageItemInlineRepliesSummary({
  className,
  render,
  ...props
}: MessageItemInlineRepliesSummaryProps) {
  const theme = useThemeFamily();
  const { legacySummary } = messageThreadRepliesPreview({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    className: legacySummary({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-inline-replies-summary" },
  });
}

export type MessageItemInlineReplyRowProps = useRender.ComponentProps<"div">;

export function MessageItemInlineReplyRow({
  className,
  render,
  ...props
}: MessageItemInlineReplyRowProps) {
  const theme = useThemeFamily();
  const { reply } = messageThreadRepliesPreview({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: reply({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-item-inline-reply-row" },
  });
}

export type MessageItemInlineReplyAvatarProps = MessageItemThreadReplyAvatarProps;

export function MessageItemInlineReplyAvatar({
  className,
  render,
  ...props
}: MessageItemInlineReplyAvatarProps) {
  const theme = useThemeFamily();
  const { avatar } = messageThreadRepliesPreview({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: avatar({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-inline-reply-avatar" },
  });
}

export type MessageItemInlineReplySenderProps = MessageItemThreadReplySenderProps;

export function MessageItemInlineReplySender({
  className,
  render,
  ...props
}: MessageItemInlineReplySenderProps) {
  const theme = useThemeFamily();
  const { sender } = messageThreadRepliesPreview({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: sender({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-inline-reply-sender" },
  });
}

export type MessageItemInlineReplyPreviewProps = MessageItemThreadReplyPreviewProps;

export function MessageItemInlineReplyPreview({
  className,
  render,
  ...props
}: MessageItemInlineReplyPreviewProps) {
  const theme = useThemeFamily();
  const { preview } = messageThreadRepliesPreview({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: preview({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-inline-reply-preview" },
  });
}

export type MessageItemInlineReplyTimeProps = MessageItemThreadReplyTimeProps;

export function MessageItemInlineReplyTime({
  className,
  render,
  ...props
}: MessageItemInlineReplyTimeProps) {
  const theme = useThemeFamily();
  const { time } = messageThreadRepliesPreview({ theme });
  const defaultProps: useRender.ElementProps<"time"> = {
    className: time({ className }),
  };

  return useRender({
    defaultTagName: "time",
    render,
    props: mergeProps<"time">(defaultProps, props),
    state: { slot: "message-item-inline-reply-time" },
  });
}

export type MessageItemInlineReplyCountProps = useRender.ComponentProps<"button">;

export function MessageItemInlineReplyCount({
  className,
  render,
  type = "button",
  ...props
}: MessageItemInlineReplyCountProps) {
  const theme = useThemeFamily();
  const { legacyCount } = messageThreadRepliesPreview({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type,
    className: legacyCount({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: { slot: "message-item-inline-reply-count" },
  });
}
