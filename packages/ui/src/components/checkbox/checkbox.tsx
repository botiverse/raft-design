import { useCallback } from "react";
import type { ReactElement } from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { tv } from "../../lib/tv";
import { CheckboxIndicator } from "./checkbox-indicator";
import type { StyledProps } from "../../lib/styled-props";

// The DS checkbox: a 20px box with a 44px hit area around it (36px tall with a
// mouse). Directly in a <label> row it pads itself to one line of the label,
// centred on that line, so it sits wherever the row puts a line of text: on
// the first line with items-start, on the one line with items-center
// (design/foundations/alignment.md#a-control-and-its-label). It never shrinks
// below its 20px: beside a shorter line (text-xs) the row is 20px tall, and
// the line wants leading-5 to share it. There its hit area reaches 4px past
// that line, half the 8px gap to the next option, so a tap between two lands
// on the nearer; the label is the target for the rest.
const checkbox = tv({
  slots: {
    root: [
      "relative inline-flex size-5 shrink-0 touch-manipulation items-center justify-center outline-none",
      "rounded-sticker focus-visible:shadow-focus",
      "data-disabled:cursor-not-allowed",
      "after:absolute after:-inset-x-3 after:-inset-y-2 after:content-[''] pointer-coarse:after:-inset-y-3",
      "[label>&]:my-[max(0px,calc((1lh-1.25rem)/2))]",
      "[label>&]:after:-inset-y-[calc(max(0px,(1lh-1.25rem)/2)+4px)]",
    ],
    indicator: "pointer-events-none",
  },
});

export type CheckboxProps = StyledProps<BaseCheckbox.Root.Props> & {
  shape?: "square" | "circle";
};

type CheckboxIndicatorRenderFn = Exclude<
  BaseCheckbox.Indicator.Props["render"],
  ReactElement | undefined
>;

export function Checkbox({ shape = "square", className, ...props }: CheckboxProps) {
  const { root, indicator } = checkbox();

  const renderIndicator = useCallback<CheckboxIndicatorRenderFn>(
    (indicatorProps, state) => (
      <CheckboxIndicator
        {...indicatorProps}
        checked={state.checked || state.indeterminate}
        disabled={state.disabled}
        mark={state.indeterminate ? "minus" : "check"}
        shape={shape}
      />
    ),
    [shape],
  );

  return (
    <BaseCheckbox.Root data-slot="checkbox" className={root({ className })} {...props}>
      <BaseCheckbox.Indicator
        keepMounted
        data-slot="checkbox-indicator"
        className={indicator()}
        render={renderIndicator}
      />
    </BaseCheckbox.Root>
  );
}
