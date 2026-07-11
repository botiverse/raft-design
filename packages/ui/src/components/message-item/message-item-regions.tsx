import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageItem } from "./message-item.recipe";

export type MessageItemHeaderProps = useRender.ComponentProps<"div">;

export function MessageItemHeader({ className, render, ...props }: MessageItemHeaderProps) {
  const theme = useThemeFamily();
  const { header } = messageItem({ theme });
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

export type MessageItemSenderProps = useRender.ComponentProps<"span">;

export function MessageItemSender({ className, render, ...props }: MessageItemSenderProps) {
  const theme = useThemeFamily();
  const { sender } = messageItem({ theme });
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

export type MessageItemSenderStateProps = useRender.ComponentProps<"span">;

export function MessageItemSenderState({
  className,
  render,
  ...props
}: MessageItemSenderStateProps) {
  const theme = useThemeFamily();
  const { senderState } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: senderState({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-sender-state",
    },
  });
}

export type MessageItemMetaProps = useRender.ComponentProps<"span">;

export function MessageItemMeta({ className, render, ...props }: MessageItemMetaProps) {
  const theme = useThemeFamily();
  const { meta } = messageItem({ theme });
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

export type MessageItemTimeProps = useRender.ComponentProps<"span">;

export function MessageItemTime({ className, render, ...props }: MessageItemTimeProps) {
  const theme = useThemeFamily();
  const { time } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: time({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
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
  const theme = useThemeFamily();
  const { inlineStatus } = messageItem({ theme });
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
