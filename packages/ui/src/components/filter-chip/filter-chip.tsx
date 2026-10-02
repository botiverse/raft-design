import { mergeProps } from "@base-ui/react/merge-props";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { useRender } from "@base-ui/react/use-render";

import type { SlotElementProps } from "../../lib/data-attributes";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { filterChip } from "./filter-chip.recipe";

export type FilterChipProps = Omit<StyledProps<BaseToggle.Props>, "type">;

/** Pressable pill that narrows a list. Each chip is an independent toggle; the consumer combines them. */
export function FilterChip({ className, ...props }: FilterChipProps) {
  const theme = useThemeFamily();
  const { root } = filterChip({ theme });

  return (
    <BaseToggle {...props} type="button" data-slot="filter-chip" className={root({ className })} />
  );
}

export type FilterChipCountProps = useRender.ComponentProps<"span">;

export function FilterChipCount({ className, render, ...props }: FilterChipCountProps) {
  const theme = useThemeFamily();
  const { count } = filterChip({ theme });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "filter-chip-count",
    className: count({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
