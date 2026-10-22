import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
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

export function MessageItem({
  className,
  compact,
  located = false,
  render,
  ...props
}: MessageItemProps) {
  const { root } = messageItem({ compact });
  const defaultProps: useRender.ElementProps<"div"> & SlotElementProps<"div"> = {
    "data-message-item": "",
    "data-compact": compact ? "true" : undefined,
    "data-located": located ? "" : undefined,
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item",
    },
  });
}
