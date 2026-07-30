import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageItem } from "./message-item.recipe";

export type MessageItemToolbarProps = useRender.ComponentProps<"div">;

export function MessageItemToolbar({ className, render, ...props }: MessageItemToolbarProps) {
  const theme = useThemeFamily();
  const { toolbar } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: toolbar({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-item-toolbar",
    },
  });
}

export type MessageItemToolbarButtonProps = useRender.ComponentProps<"button">;

export function MessageItemToolbarButton({
  className,
  render,
  ...props
}: MessageItemToolbarButtonProps) {
  const theme = useThemeFamily();
  const { toolbarButton } = messageItem({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    className: toolbarButton({ className }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-item-toolbar-button",
    },
  });
}
