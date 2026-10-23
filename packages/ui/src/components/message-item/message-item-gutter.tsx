import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useMessageItemLabelId } from "./message-item-label";
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

export type MessageItemContinuationTimeProps = useRender.ComponentProps<"time">;

/** Left-gutter hover clock for continuation rows, a `<time>`: pass the moment in `dateTime`. Show the hour and minute only, in the person's 12h/24h format, with no AM/PM (`6:35`, `18:35`). */
export function MessageItemContinuationTime({
  className,
  id,
  render,
  ...props
}: MessageItemContinuationTimeProps) {
  const { continuationTime } = messageItem();
  const labelId = useMessageItemLabelId("time", id);
  const defaultProps: useRender.ElementProps<"time"> = {
    id: labelId,
    className: continuationTime({ className }),
  };

  return useRender({
    defaultTagName: "time",
    render,
    props: mergeProps<"time">(defaultProps, props),
    state: {
      slot: "message-item-continuation-time",
    },
  });
}
