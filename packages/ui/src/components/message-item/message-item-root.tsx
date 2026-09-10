import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import type { SlotElementProps } from "../../lib/data-attributes";
import { messageItem } from "./message-item.recipe";
import type { MessageItemVariantProps } from "./message-item.recipe";

export type MessageItemProps = useRender.ComponentProps<"div"> &
  Pick<MessageItemVariantProps, "compact">;

export function MessageItem({ className, compact, render, ...props }: MessageItemProps) {
  const theme = useThemeFamily();
  const { root } = messageItem({ compact, theme });
  const defaultProps: useRender.ElementProps<"div"> & SlotElementProps<"div"> = {
    "data-message-item": "",
    "data-compact": compact ? "true" : undefined,
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
