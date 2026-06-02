import type { LabelHTMLAttributes } from "react";
import { tv } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

const fieldLabel = tv({
  base: ["block text-sm font-bold"],
  variants: {
    theme: {
      brutal: ["text-black uppercase tracking-wide"],
      // Elegant styling is deferred; see the component TODO.
      elegant: [],
    },
  },
});

export type FieldLabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function FieldLabel({ className, ...props }: FieldLabelProps) {
  const theme = useTheme();
  return <label data-slot="field-label" className={fieldLabel({ theme, className })} {...props} />;
}
