import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { messageEmbed } from "../message-embed/message-embed.recipe";
import { messageReplies } from "./message-replies.recipe";

export type MessageRepliesProps = useRender.ComponentProps<"button">;

export function MessageReplies({ className, render, ...props }: MessageRepliesProps) {
  const { root } = messageReplies();
  const { root: embedRoot } = messageEmbed();
  const defaultProps: SlotElementProps<"button"> = {
    className: embedRoot({ className: root({ className }) }),
  };

  return useRender({
    defaultTagName: "button",
    render: render ?? <button type="button" />,
    props: mergeProps<"button">(defaultProps, props),
    state: { slot: "message-embed" },
  });
}

export type MessageRepliesSummaryProps = useRender.ComponentProps<"span">;

export function MessageRepliesSummary({ className, render, ...props }: MessageRepliesSummaryProps) {
  const { summary } = messageReplies();
  const defaultProps: SlotElementProps<"span"> = {
    className: summary({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-replies-summary" },
  });
}

export type MessageRepliesSummaryItemProps = useRender.ComponentProps<"span">;

export function MessageRepliesSummaryItem({
  className,
  render,
  ...props
}: MessageRepliesSummaryItemProps) {
  const { summaryItem } = messageReplies();
  const defaultProps: SlotElementProps<"span"> = {
    className: summaryItem({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-replies-summary-item" },
  });
}

export type MessageRepliesItemProps = useRender.ComponentProps<"span">;

export function MessageRepliesItem({ className, render, ...props }: MessageRepliesItemProps) {
  const { reply } = messageReplies();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: reply({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-replies-item" },
  });
}

export type MessageRepliesItemSenderProps = useRender.ComponentProps<"span">;

export function MessageRepliesItemSender({
  className,
  render,
  ...props
}: MessageRepliesItemSenderProps) {
  const { sender } = messageReplies();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: sender({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-replies-item-sender" },
  });
}

export type MessageRepliesItemContentProps = useRender.ComponentProps<"span">;

export function MessageRepliesItemContent({
  className,
  render,
  ...props
}: MessageRepliesItemContentProps) {
  const { content } = messageReplies();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: content({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: { slot: "message-replies-item-content" },
  });
}

export type MessageRepliesItemTimeProps = useRender.ComponentProps<"time">;

export function MessageRepliesItemTime({
  className,
  render,
  ...props
}: MessageRepliesItemTimeProps) {
  const { time } = messageReplies();
  const defaultProps: useRender.ElementProps<"time"> = {
    className: time({ className }),
  };

  return useRender({
    defaultTagName: "time",
    render,
    props: mergeProps<"time">(defaultProps, props),
    state: { slot: "message-replies-item-time" },
  });
}
