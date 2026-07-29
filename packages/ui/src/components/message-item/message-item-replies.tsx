import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageItemReplies } from "./message-item-replies.recipe";

export type MessageItemRepliesProps = useRender.ComponentProps<"div">;

export function MessageItemReplies({ className, render, ...props }: MessageItemRepliesProps) {
  const theme = useThemeFamily();
  const { root } = messageItemReplies({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-item-replies" },
  });
}

export type MessageItemRepliesTriggerProps = useRender.ComponentProps<"button">;

export function MessageItemRepliesTrigger({
  className,
  render,
  type = "button",
  ...props
}: MessageItemRepliesTriggerProps) {
  const theme = useThemeFamily();
  const { trigger } = messageItemReplies({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type,
    className: trigger({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: { slot: "message-item-replies-trigger" },
  });
}

export type MessageItemRepliesSummaryProps = useRender.ComponentProps<"span">;

export function MessageItemRepliesSummary({
  className,
  render,
  ...props
}: MessageItemRepliesSummaryProps) {
  const theme = useThemeFamily();
  const { summary } = messageItemReplies({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    className: summary({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-replies-summary" },
  });
}

export type MessageItemReplyProps = useRender.ComponentProps<"span">;

export function MessageItemReply({ className, render, ...props }: MessageItemReplyProps) {
  const theme = useThemeFamily();
  const { reply } = messageItemReplies({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: reply({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-reply" },
  });
}

export type MessageItemReplyAvatarProps = useRender.ComponentProps<"span">;

export function MessageItemReplyAvatar({
  className,
  render,
  ...props
}: MessageItemReplyAvatarProps) {
  const theme = useThemeFamily();
  const { avatar } = messageItemReplies({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: avatar({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-reply-avatar" },
  });
}

export type MessageItemReplySenderProps = useRender.ComponentProps<"span">;

export function MessageItemReplySender({
  className,
  render,
  ...props
}: MessageItemReplySenderProps) {
  const theme = useThemeFamily();
  const { sender } = messageItemReplies({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: sender({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-reply-sender" },
  });
}

export type MessageItemReplyContentProps = useRender.ComponentProps<"span">;

export function MessageItemReplyContent({
  className,
  render,
  ...props
}: MessageItemReplyContentProps) {
  const theme = useThemeFamily();
  const { content } = messageItemReplies({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-reply-content" },
  });
}

export type MessageItemReplyTimeProps = useRender.ComponentProps<"time">;

export function MessageItemReplyTime({ className, render, ...props }: MessageItemReplyTimeProps) {
  const theme = useThemeFamily();
  const { time } = messageItemReplies({ theme });
  const defaultProps: useRender.ElementProps<"time"> = {
    className: time({ className }),
  };

  return useRender({
    defaultTagName: "time",
    render,
    props: mergeProps<"time">(defaultProps, props),
    state: { slot: "message-item-reply-time" },
  });
}
