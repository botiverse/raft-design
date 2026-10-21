import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Checkbox } from "../checkbox/index";
import type { CheckboxProps } from "../checkbox/index";
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

export type MessageMultiSelectToolbarProps = useRender.ComponentProps<"div">;

/** Shared select-mode toolbar shell. Consumers compose the count and actions as children. */
export function MessageMultiSelectToolbar({
  className,
  render,
  ...props
}: MessageMultiSelectToolbarProps) {
  const { toolbar } = messageMultiSelect();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: toolbar({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-multi-select-toolbar",
    },
  });
}

export type MessageMultiSelectToolbarActionsProps = useRender.ComponentProps<"div">;

/** The toolbar's actions, at its end, 4px apart like every floating toolbar's buttons. */
export function MessageMultiSelectToolbarActions({
  className,
  render,
  ...props
}: MessageMultiSelectToolbarActionsProps) {
  const { toolbarActions } = messageMultiSelect();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: toolbarActions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "message-multi-select-toolbar-actions",
    },
  });
}

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
