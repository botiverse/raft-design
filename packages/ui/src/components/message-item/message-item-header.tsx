import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { messageItem } from "./message-item.recipe";

export type MessageItemHeaderProps = useRender.ComponentProps<"div">;

export function MessageItemHeader({ className, render, ...props }: MessageItemHeaderProps) {
  const { header } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: header({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item-header",
    },
  });
}

export type MessageItemSenderGroupProps = useRender.ComponentProps<"span">;

/**
 * Holds the sender, its badges and its role, and decides who gives way when
 * the header runs out of room: the role truncates first, then the name. The
 * badges stay whole beside the name, and the time, outside the group, never
 * truncates.
 */
export function MessageItemSenderGroup({
  className,
  render,
  ...props
}: MessageItemSenderGroupProps) {
  const { senderGroup } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: senderGroup({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-sender-group",
    },
  });
}

export type MessageItemSenderProps = useRender.ComponentProps<"span">;

export function MessageItemSender({ className, render, ...props }: MessageItemSenderProps) {
  const { sender } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: sender({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-sender",
    },
  });
}

export type MessageItemSenderButtonProps = useRender.ComponentProps<"button">;

export function MessageItemSenderButton({
  className,
  render,
  ...props
}: MessageItemSenderButtonProps) {
  const { senderButton } = messageItem();
  const defaultProps: useRender.ElementProps<"button"> = {
    type: "button",
    className: senderButton({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-item-sender-button",
    },
  });
}

export type MessageItemSenderBadgesProps = useRender.ComponentProps<"span">;

export function MessageItemSenderBadges({
  className,
  render,
  ...props
}: MessageItemSenderBadgesProps) {
  const { senderBadges } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: senderBadges({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-sender-badges",
    },
  });
}

export type MessageItemMetaProps = useRender.ComponentProps<"span">;

export function MessageItemMeta({ className, render, ...props }: MessageItemMetaProps) {
  const { meta } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: meta({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-meta",
    },
  });
}

export type MessageItemTimeProps = useRender.ComponentProps<"time">;

/**
 * The message's time, right after the sender. A `<time>`: pass the moment in
 * `dateTime` (ISO 8601) and the full date and time as its tooltip.
 */
export function MessageItemTime({ className, render, ...props }: MessageItemTimeProps) {
  const { time } = messageItem();
  const defaultProps: useRender.ElementProps<"time"> = {
    className: time({ className }),
  };

  return useRender({
    defaultTagName: "time",
    render,
    props: mergeProps<"time">(defaultProps, props),
    state: {
      slot: "message-item-time",
    },
  });
}

export type MessageItemInlineStatusProps = useRender.ComponentProps<"span">;

export function MessageItemInlineStatus({
  className,
  render,
  ...props
}: MessageItemInlineStatusProps) {
  const { inlineStatus } = messageItem();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: inlineStatus({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-inline-status",
    },
  });
}
