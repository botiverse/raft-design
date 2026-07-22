import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Badge } from "../badge";
import { messageFooter } from "./message-footer.recipe";

export type MessageItemBadgeStatus = "read" | "unread";

export type MessageItemBadgeProps = useRender.ComponentProps<"span"> & {
  status?: MessageItemBadgeStatus;
};

export function MessageItemBadge({ className, status = "read", ...props }: MessageItemBadgeProps) {
  const theme = useThemeFamily();
  const { badge } = messageFooter({ badgeStatus: status, theme });
  // Brutal matches source ThreadRepliesBadge (solid default + bg override).
  // Elegant uses outline Badge chrome; unread uses the primary outline.
  const appearance = theme === "elegant" ? "outline" : "solid";
  const variant = theme === "elegant" && status === "unread" ? "primary" : "default";
  return (
    <Badge
      appearance={appearance}
      data-slot="message-item-badge"
      uppercase={false}
      variant={variant}
      className={badge({ className })}
      {...props}
    />
  );
}

export type MessageItemBadgeSeparatorProps = useRender.ComponentProps<"span">;

export function MessageItemBadgeSeparator({
  className,
  render,
  ...props
}: MessageItemBadgeSeparatorProps) {
  const { badgeSeparator } = messageFooter();
  const defaultProps: useRender.ElementProps<"span"> = {
    "aria-hidden": true,
    className: badgeSeparator({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-badge-separator" },
  });
}

export type MessageItemSavedIndicatorProps = useRender.ComponentProps<"span">;

export function MessageItemSavedIndicator({
  className,
  render,
  ...props
}: MessageItemSavedIndicatorProps) {
  const theme = useThemeFamily();
  const { savedIndicator } = messageFooter({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: savedIndicator({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-saved-indicator",
    },
  });
}

export type MessageItemReadReceiptProps = useRender.ComponentProps<"span">;

export function MessageItemReadReceipt({
  className,
  render,
  ...props
}: MessageItemReadReceiptProps) {
  const theme = useThemeFamily();
  const { readReceipt } = messageFooter({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-message-affordance": "read-receipt",
    className: readReceipt({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-read-receipt",
    },
  });
}

export type MessageItemInlineRepliesTriggerProps = useRender.ComponentProps<"button">;

export function MessageItemInlineRepliesTrigger({
  className,
  render,
  type = "button",
  ...props
}: MessageItemInlineRepliesTriggerProps) {
  const theme = useThemeFamily();
  const { inlineRepliesTrigger } = messageFooter({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type,
    "data-message-affordance": "inline-thread-replies",
    className: inlineRepliesTrigger({ className }),
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
  const { inlineReplies } = messageFooter({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-message-affordance": "inline-thread-replies",
    className: inlineReplies({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-item-inline-replies" },
  });
}

export type MessageItemInlineRepliesSummaryProps = useRender.ComponentProps<"span">;

export function MessageItemInlineRepliesSummary({
  className,
  render,
  ...props
}: MessageItemInlineRepliesSummaryProps) {
  const theme = useThemeFamily();
  const { inlineRepliesSummary } = messageFooter({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-message-affordance": "inline-thread-replies-count",
    className: inlineRepliesSummary({ className }),
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
  const { inlineReplyRow } = messageFooter({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: inlineReplyRow({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "message-item-inline-reply-row" },
  });
}

export type MessageItemInlineReplyAvatarProps = useRender.ComponentProps<"span">;

export function MessageItemInlineReplyAvatar({
  className,
  render,
  ...props
}: MessageItemInlineReplyAvatarProps) {
  const theme = useThemeFamily();
  const { inlineReplyAvatar } = messageFooter({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: inlineReplyAvatar({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-inline-reply-avatar" },
  });
}

export type MessageItemInlineReplySenderProps = useRender.ComponentProps<"span">;

export function MessageItemInlineReplySender({
  className,
  render,
  ...props
}: MessageItemInlineReplySenderProps) {
  const theme = useThemeFamily();
  const { inlineReplySender } = messageFooter({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: inlineReplySender({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-inline-reply-sender" },
  });
}

export type MessageItemInlineReplyPreviewProps = useRender.ComponentProps<"span">;

export function MessageItemInlineReplyPreview({
  className,
  render,
  ...props
}: MessageItemInlineReplyPreviewProps) {
  const theme = useThemeFamily();
  const { inlineReplyPreview } = messageFooter({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: inlineReplyPreview({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-item-inline-reply-preview" },
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
  const { inlineReplyCount } = messageFooter({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type,
    "data-message-affordance": "inline-thread-replies-count",
    className: inlineReplyCount({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: { slot: "message-item-inline-reply-count" },
  });
}
