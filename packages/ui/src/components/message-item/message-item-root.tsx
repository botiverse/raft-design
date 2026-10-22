import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import {
  MessageItemLabelProvider,
  readConsumerLabel,
  useMessageItemLabel,
} from "./message-item-label";
import { messageItem } from "./message-item.recipe";
import type { MessageItemVariantProps } from "./message-item.recipe";

export type MessageItemProps = useRender.ComponentProps<"div"> &
  Pick<MessageItemVariantProps, "compact"> & {
    /**
     * The message someone just jumped to: the row shows `info-soft` at once
     * and fades it out by `LOCATED_MS` (design/foundations/states.md#located).
     * Pass `useLocated(request)`, which turns it off after `LOCATED_MS` and
     * restarts it on the next jump; a search match, a checked row or an open
     * popup keeps its own fill instead.
     */
    located?: boolean;
  };

/**
 * One message: an `article` named by its sender and its time
 * (`aria-labelledby` pointing at `MessageItemSender` or
 * `MessageItemSenderButton`, then `MessageItemTime` or
 * `MessageItemContinuationTime`). A row with neither, and no `aria-label` or
 * `aria-labelledby`, is a plain `div`. Pass `role`, `aria-label` or
 * `aria-labelledby` on MessageItem or on a `render` element to override
 * either; a `render` function's props can't be read, so pass them on
 * MessageItem then.
 */
export function MessageItem({
  className,
  compact,
  located = false,
  render,
  ...props
}: MessageItemProps) {
  const { root } = messageItem({ compact });
  const label = useMessageItemLabel(readConsumerLabel(props, render));
  const defaultProps: useRender.ElementProps<"div"> & SlotElementProps<"div"> = {
    "data-message-item": "",
    "data-compact": compact ? "true" : undefined,
    "data-located": located ? "" : undefined,
    className: root({ className }),
  };

  const element = useRender({
    defaultTagName: "div",
    render,
    ref: label.ref,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item",
    },
  });

  return <MessageItemLabelProvider value={label.registry}>{element}</MessageItemLabelProvider>;
}
