import type { ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Field family: a layout wrapper that stacks a label, control, and
// description / error. All parts share one `tv()` slots config so theme / size
// styling lives in a single place — ready for the elegant family to add
// per-slot overrides under `theme`.
//
// Set `data-invalid` (alongside `aria-invalid` on the control) to flip
// descendants to the error look via the `group/field` marker. The root slot is
// pure layout, so it carries no theme.
const field = tv({
  slots: {
    root: ["group/field flex flex-col gap-1"],
    label: ["block font-bold"],
    description: ["text-xs"],
    error: ["text-xs font-bold"],
  },
  variants: {
    theme: {
      brutal: {
        label: ["text-black"],
        description: ["text-black/50"],
        error: ["text-brutal-red"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    size: {
      sm: { label: "text-xs" },
      md: { label: "text-sm" },
    },
  },
  // The small/dense label is also dimmed; only meaningful under brutal.
  compoundVariants: [{ theme: "brutal", size: "sm", class: { label: "text-black/60" } }],
  defaultVariants: {
    size: "md",
  },
});

export type FieldProps = ComponentPropsWithRef<"div">;

export function Field({ className, ...props }: FieldProps) {
  const { root } = field();
  return <div role="group" data-slot="field" className={root({ className })} {...props} />;
}

// A label can show one marker after its text, never both: `requiredMark` (pink `*`)
// or `optional` (a muted `(optional)` tag).
type LabelMarker =
  | { requiredMark?: boolean; optional?: never }
  | { optional?: boolean; requiredMark?: never };

export type FieldLabelProps = ComponentPropsWithRef<"label"> &
  Omit<VariantProps<typeof field>, "theme"> &
  LabelMarker;

// Labels render as written; add `className="uppercase tracking-wide"` for the
// brutal uppercase look.
export function FieldLabel({
  size,
  requiredMark,
  optional,
  className,
  children,
  ...props
}: FieldLabelProps) {
  const theme = useTheme();
  const { label } = field({ theme, size });
  return (
    <label data-slot="field-label" className={label({ className })} {...props}>
      {children}
      {requiredMark ? <span className="ml-1 text-brutal-pink">*</span> : null}
      {optional ? <span className="ml-1 normal-case text-black/40">(optional)</span> : null}
    </label>
  );
}

export type FieldDescriptionProps = ComponentPropsWithRef<"p">;

export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  const theme = useTheme();
  const { description } = field({ theme });
  return <p data-slot="field-description" className={description({ className })} {...props} />;
}

export type FieldErrorProps = ComponentPropsWithRef<"p">;

export function FieldError({ className, ...props }: FieldErrorProps) {
  const theme = useTheme();
  const { error } = field({ theme });
  return <p data-slot="field-error" role="alert" className={error({ className })} {...props} />;
}
