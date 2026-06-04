import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { tv, type VariantProps } from "tailwind-variants";
import { CheckIndicator } from "../check-indicator/check-indicator.tsx";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const checkbox = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center",
      "outline-none",
      // Additions beyond the original: focus ring, disabled cursor, and an enlarged
      // hit area (invisible ::after) so the small box stays easy to click/tap.
      "focus-visible:ring-2 focus-visible:ring-ring",
      "data-disabled:cursor-not-allowed",
      "after:absolute after:-inset-x-3 after:-inset-y-2 after:content-['']",
    ],
    indicator: ["pointer-events-none"],
  },
  variants: {
    theme: {
      brutal: {},
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    size: {
      sm: {
        root: "size-3.5",
      },
      md: {
        root: "size-4",
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
        keepMounted
        data-slot="checkbox-indicator"
        className={indicator()}
        render={(indicatorProps, state) => (
          <CheckIndicator
            {...indicatorProps}
            checked={state.checked || state.indeterminate}
            disabled={state.disabled}
            mark={state.indeterminate ? "minus" : "check"}
            size={size}
            fill="black"
          />
        )}
      />
    </BaseCheckbox.Root>
  );
}
