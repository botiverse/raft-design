import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageItem } from "./message-item.recipe";

export type MessageItemGutterProps = useRender.ComponentProps<"div">;

export function MessageItemGutter({ className, render, ...props }: MessageItemGutterProps) {
  const { gutter } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: gutter({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item-gutter",
    },
  });
}

export type MessageItemAvatarSlotProps = useRender.ComponentProps<"div">;

export function MessageItemAvatarSlot({ className, render, ...props }: MessageItemAvatarSlotProps) {
  const { avatarSlot } = messageItem();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: avatarSlot({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item-avatar-slot",
    },
  });
}

export type MessageItemContinuationTimeProps = useRender.ComponentProps<"span">;

/** Left-gutter hover clock for continuation rows. Pass 24h `HH:MM` (no AM/PM). */
export function MessageItemContinuationTime({
  className,
  render,
  ...props
}: MessageItemContinuationTimeProps) {
  const theme = useThemeFamily();
  const { continuationTime } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: continuationTime({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "message-item-continuation-time",
    },
  });
}
