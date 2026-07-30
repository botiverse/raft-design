import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { MessageEmbed } from "../message-embed";
import { messageReplies } from "./message-replies.recipe";

export type MessageRepliesProps = useRender.ComponentProps<"div">;

export function MessageReplies({ className, render, ...props }: MessageRepliesProps) {
  const theme = useThemeFamily();
  const { root } = messageReplies({ theme });

  return (
    <MessageEmbed
      className={root({ className })}
      render={render ?? <button type="button" />}
      {...props}
    />
  );
}

export type MessageRepliesSummaryProps = useRender.ComponentProps<"span">;

export function MessageRepliesSummary({ className, render, ...props }: MessageRepliesSummaryProps) {
  const theme = useThemeFamily();
  const { summary } = messageReplies({ theme });
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
  const theme = useThemeFamily();
  const { summaryItem } = messageReplies({ theme });
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
  const theme = useThemeFamily();
  const { reply } = messageReplies({ theme });
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
  const theme = useThemeFamily();
  const { sender } = messageReplies({ theme });
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
  const theme = useThemeFamily();
  const { content } = messageReplies({ theme });
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
  const theme = useThemeFamily();
  const { time } = messageReplies({ theme });
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
