import type { ComponentPropsWithRef } from "react";
import { tv } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

const fieldError = tv({
  base: ["text-xs font-bold"],
  variants: {
    theme: {
      brutal: ["text-brutal-red"],
      // Elegant styling is deferred; see the component TODO.
      elegant: [],
    },
  },
});

export type FieldErrorProps = ComponentPropsWithRef<"p">;

export function FieldError({ className, ...props }: FieldErrorProps) {
  const theme = useTheme();
  return (
    <p
      data-slot="field-error"
      role="alert"
      className={fieldError({ theme, className })}
      {...props}
    />
  );
}
