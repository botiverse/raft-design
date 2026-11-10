import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Checkbox } from "../checkbox/index";
import type { CheckboxProps } from "../checkbox/index";
import { SelectionToolbar, SelectionToolbarActions } from "../selection-toolbar/index";
import type {
  SelectionToolbarActionsProps,
  SelectionToolbarProps,
} from "../selection-toolbar/index";
import { messageMultiSelect } from "./message-multi-select.recipe";

export type MessageMultiSelectProps = useRender.ComponentProps<"div">;

export function MessageMultiSelect({ className, render, ...props }: MessageMultiSelectProps) {
  const { root } = messageMultiSelect();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-multi-select",
    },
  });
}

export type MessageMultiSelectToolbarProps = SelectionToolbarProps;

/**
 * The toolbar for selected messages: `SelectionToolbar` under its earlier
 * name, kept for apps that use it.
 */
export const MessageMultiSelectToolbar = SelectionToolbar;

export type MessageMultiSelectToolbarActionsProps = SelectionToolbarActionsProps;

/** `SelectionToolbarActions` under its earlier name, kept for apps that use it. */
export const MessageMultiSelectToolbarActions = SelectionToolbarActions;

export type MessageMultiSelectCheckboxProps = CheckboxProps;

export function MessageMultiSelectCheckbox({
  className,
  ...props
}: MessageMultiSelectCheckboxProps) {
  const { checkbox } = messageMultiSelect();
  // A selection checkbox is a value, not "you are here": square, ink when checked.
  return (
    <Checkbox
      data-slot="message-multi-select-checkbox"
      className={checkbox({ className })}
      shape="square"
      {...props}
    />
  );
}
