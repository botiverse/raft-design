import type { ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";
import type { WithoutChildren } from "../../lib/without-children.ts";

// Ring-style indeterminate loader. The ring color is a surface choice, not a
// theme one: `default` is a black ring for light surfaces (cards, panels, white
// inputs), `inverse` a white ring for dark overlays (lightbox).
const spinner = tv({
  slots: {
    root: ["inline-block shrink-0 animate-spin rounded-full border-2"],
  },
  variants: {
    theme: {
      brutal: {},
      // A spinning ring reads the same across style families; kept as the
      // elegant extension point.
      elegant: {},
    },
    size: {
      xs: {
        root: "size-2.5",
      },
      sm: {
        root: "size-4",
      },
      md: {
        root: "size-5",
      },
      lg: {
        root: "size-8",
      },
    },
    variant: {
      default: {
        root: "border-black/20 border-t-black",
      },
      inverse: {
        root: "border-white/40 border-t-white",
      },
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
});

export type SpinnerProps = WithoutChildren<ComponentPropsWithRef<"span">> &
  Omit<VariantProps<typeof spinner>, "theme"> & {
    /** Accessible label announced by screen readers. Defaults to "Loading". */
    label?: string;
  };

export function Spinner({ size, variant, label, className, ...props }: SpinnerProps) {
  const theme = useTheme();
  const { root } = spinner({ theme, size, variant });

  return (
    <span
      {...props}
      role="status"
      aria-label={label ?? "Loading"}
      data-slot="spinner"
      className={root({ className })}
    />
  );
}
