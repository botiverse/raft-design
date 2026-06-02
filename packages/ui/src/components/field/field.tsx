import type { HTMLAttributes } from "react";
import { tv } from "tailwind-variants";

// Wrapper that stacks a label, control, and description/error. Set `data-invalid`
// (alongside `aria-invalid` on the control) to flip descendants to the error
// look via the `group/field` marker. Pure layout, so no theme variant.
const field = tv({
  base: ["group/field flex flex-col gap-1"],
});

export type FieldProps = HTMLAttributes<HTMLDivElement>;

export function Field({ className, ...props }: FieldProps) {
  return <div data-slot="field" className={field({ className })} {...props} />;
}
