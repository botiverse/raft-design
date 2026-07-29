import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { dataPresence, type SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { messageItem } from "./message-item.recipe";

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

export type MessageItemSaveButtonProps = MessageItemToolbarButtonProps & {
  selected?: boolean;
};

export function MessageItemSaveButton({
  className,
  render,
  selected,
  ...props
}: MessageItemSaveButtonProps) {
  const theme = useThemeFamily();
  const { saveButton, toolbarButton } = messageItem({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "aria-pressed": selected,
    "data-selected": dataPresence(selected),
    className: toolbarButton({ className: saveButton({ className }) }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "message-item-save-button",
    },
  });
}
