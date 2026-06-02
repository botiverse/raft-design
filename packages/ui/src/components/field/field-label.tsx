import type { LabelHTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Labels render as written; add `className="uppercase tracking-wide"` for the
// brutal uppercase look.
const fieldLabel = tv({
  base: ["block font-bold"],
  variants: {
    theme: {
      brutal: ["text-black"],
      // Elegant styling is deferred; see the component TODO.
      elegant: [],
    },
    size: {
      sm: "text-xs",
      md: "text-sm",
    },
  },
  // The small/dense label is also dimmed; only meaningful under brutal.
  compoundVariants: [{ theme: "brutal", size: "sm", class: "text-black/60" }],
  defaultVariants: {
    size: "md",
  },
});

// A label can show one marker after its text, never both: `requiredMark` (pink `*`)
// or `optional` (a muted `(optional)` tag).
type LabelMarker =
  | { requiredMark?: boolean; optional?: never }
  | { optional?: boolean; requiredMark?: never };

export type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement> &
  Omit<VariantProps<typeof fieldLabel>, "theme"> &
  LabelMarker;

export function FieldLabel({
  size,
  requiredMark,
  optional,
  className,
  children,
  ...props
}: FieldLabelProps) {
  const theme = useTheme();
  return (
    <label data-slot="field-label" className={fieldLabel({ theme, size, className })} {...props}>
      {children}
      {requiredMark ? <span className="ml-1 text-brutal-pink">*</span> : null}
      {optional ? <span className="ml-1 normal-case text-black/40">(optional)</span> : null}
    </label>
  );
}
