import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Check, Minus } from "lucide-react";
import { tv, type VariantProps } from "tailwind-variants";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const checkbox = tv({
  base: [
    "relative inline-flex shrink-0 items-center justify-center",
    "outline-none transition-colors",
    // Additions beyond the original: focus ring, disabled cursor, and an enlarged
    // hit area (invisible ::after) so the small box stays easy to click/tap.
    "focus-visible:ring-2 focus-visible:ring-ring",
    "data-disabled:cursor-not-allowed",
    "after:absolute after:-inset-x-3 after:-inset-y-2 after:content-['']",
    "[&_svg]:shrink-0",
  ],
  variants: {
    theme: {
      brutal: [
        "border-2 border-black bg-white",
        // `data-indeterminate` fill is an addition beyond the original.
        "data-checked:bg-black data-indeterminate:bg-black",
        "data-checked:text-white data-indeterminate:text-white",
        "data-disabled:opacity-50",
      ],
      // Elegant styling is deferred; see the component TODO.
      elegant: [],
    },
    size: {
      sm: ["size-3.5", "[&_svg]:size-2.5"],
      md: ["size-4", "[&_svg]:size-3"],
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
  return (
    <BaseCheckbox.Root
      data-slot="checkbox"
      className={checkbox({ theme, size, className })}
      {...props}
    >
      <BaseCheckbox.Indicator
        data-slot="checkbox-indicator"
        className={[
          "flex items-center justify-center",
          // Indeterminate (dash) is an addition beyond the original; swap the marker.
          "[&[data-indeterminate]_[data-slot=check]]:hidden",
          "[&:not([data-indeterminate])_[data-slot=indeterminate]]:hidden",
        ].join(" ")}
      >
        <Check data-slot="check" strokeWidth={4} aria-hidden />
        <Minus data-slot="indeterminate" strokeWidth={4} aria-hidden />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  );
}
