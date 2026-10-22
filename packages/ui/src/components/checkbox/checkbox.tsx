import { useCallback } from "react";
import type { ReactElement } from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { tv } from "../../lib/tv";
import { CheckboxIndicator } from "./checkbox-indicator";
import type { StyledProps } from "../../lib/styled-props";

// The DS checkbox: a 20px box with a hit area 44px wide, and 44px tall on a
// touch screen (36px with a mouse). Directly in a <label> row it centres on the label's first line in
// a box one line tall (design/foundations/alignment.md#a-control-and-its-label).
const checkbox = tv({
  slots: {
    root: [
      "relative inline-flex size-5 shrink-0 touch-manipulation items-center justify-center outline-none",
      "rounded-sticker focus-visible:shadow-focus",
      "data-disabled:cursor-not-allowed",
      "after:absolute after:-inset-x-3 after:-inset-y-2 after:content-[''] pointer-coarse:after:-inset-y-3",
      "[label>&]:my-[calc((1lh-1.25rem)/2)] [label>&]:self-start",
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
