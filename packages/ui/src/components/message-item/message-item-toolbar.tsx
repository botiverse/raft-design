import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageItem } from "./message-item.recipe";
import { type DataAttributes } from "./message-item.types";

export type MessageItemToolbarProps = useRender.ComponentProps<"div"> & {
  visible?: boolean;
};

export function MessageItemToolbar({
  className,
  render,
  visible,
  ...props
}: MessageItemToolbarProps) {
  const theme = useThemeFamily();
  const { toolbar } = messageItem({ toolbarVisible: visible, theme });
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
  saved?: boolean;
};

export function MessageItemToolbarButton({
  active,
  className,
  render,
  saved,
  ...props
}: MessageItemToolbarButtonProps) {
  const theme = useThemeFamily();
  const { toolbarButton } = messageItem({ theme });
  const defaultProps: useRender.ElementProps<"button"> & DataAttributes = {
    type: "button",
    "data-active": active ? "true" : undefined,
    "data-saved": saved ? "true" : undefined,
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
