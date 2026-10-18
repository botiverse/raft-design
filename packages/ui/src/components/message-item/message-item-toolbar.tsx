import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { messageItem } from "./message-item.recipe";

export type MessageItemToolbarProps = useRender.ComponentProps<"div">;

export function MessageItemToolbar({ className, render, ...props }: MessageItemToolbarProps) {
  const { toolbar } = messageItem();
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

export type MessageItemToolbarButtonProps = useRender.ComponentProps<"button"> & {
  active?: boolean;
};

export function MessageItemToolbarButton({
  active = false,
  className,
  render,
  ...props
}: MessageItemToolbarButtonProps) {
  const { toolbarButton } = messageItem();
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-active": active ? "true" : undefined,
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
