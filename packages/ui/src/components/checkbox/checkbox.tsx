import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import { tv, type VariantProps } from "tailwind-variants";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const checkbox = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center",
      "outline-none transition-colors",
      // Additions beyond the original: focus ring, disabled cursor, and an enlarged
      // hit area (invisible ::after) so the small box stays easy to click/tap.
      "focus-visible:ring-2 focus-visible:ring-ring",
      "data-disabled:cursor-not-allowed",
      "after:absolute after:-inset-x-3 after:-inset-y-2 after:content-['']",
      "[&_svg]:shrink-0",
    ],
    indicator: ["flex items-center justify-center"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-2 border-black bg-white",
          // `data-indeterminate` fill is an addition beyond the original.
          "data-checked:bg-black data-indeterminate:bg-black",
          "data-checked:text-white data-indeterminate:text-white",
          "data-disabled:opacity-50",
        ],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    size: {
      sm: {
        root: ["size-3.5", "[&_svg]:size-2.5"],
      },
      md: {
        root: ["size-4", "[&_svg]:size-3"],
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export type CheckboxProps = StyledProps<BaseCheckbox.Root.Props> &
  Omit<VariantProps<typeof checkbox>, "theme">;

export function Checkbox({ size, className, ...props }: CheckboxProps) {
  const theme = useTheme();
  const { root, indicator } = checkbox({ theme, size });
  return (
    <BaseCheckbox.Root data-slot="checkbox" className={root({ className })} {...props}>
      <BaseCheckbox.Indicator
        data-slot="checkbox-indicator"
        className={indicator()}
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>
            {state.indeterminate ? (
              <Minus strokeWidth={4} aria-hidden />
            ) : (
              <Check strokeWidth={4} aria-hidden />
            )}
          </span>
        )}
      />
    </BaseCheckbox.Root>
  );
}
