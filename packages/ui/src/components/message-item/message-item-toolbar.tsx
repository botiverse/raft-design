import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageItem, type MessageItemVariantProps } from "./message-item.recipe";

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

export type MessageItemToolbarButtonProps = useRender.ComponentProps<"button"> &
  Pick<MessageItemVariantProps, "tone">;

export function MessageItemToolbarButton({
  className,
  render,
  tone,
  ...props
}: MessageItemToolbarButtonProps) {
  const theme = useThemeFamily();
  const { toolbarButton } = messageItem({ theme, tone });
  const defaultProps: useRender.ElementProps<"button"> = {
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
