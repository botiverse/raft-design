import type { HTMLAttributes } from "react";
import { tv } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

const fieldDescription = tv({
  base: ["text-xs"],
  variants: {
    theme: {
      brutal: ["text-black/50"],
      // Elegant styling is deferred; see the component TODO.
      elegant: [],
    },
  },
});

export type FieldDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  const theme = useTheme();
  return (
    <p
      data-slot="field-description"
      className={fieldDescription({ theme, className })}
      {...props}
    />
  );
}
