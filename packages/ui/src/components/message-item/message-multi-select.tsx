import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Checkbox, type CheckboxProps } from "../checkbox/index";
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
  const theme = useThemeFamily();
  const { toolbar } = messageMultiSelect({ theme });
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

export type MessageMultiSelectCheckboxProps = CheckboxProps;

export function MessageMultiSelectCheckbox({
  className,
  ...props
}: MessageMultiSelectCheckboxProps) {
  const { checkbox } = messageMultiSelect();

  return (
    <Checkbox
      data-slot="message-multi-select-checkbox"
      className={checkbox({ className })}
      shape="circle"
      size="lg"
      variant="primary"
      {...props}
    />
  );
}
