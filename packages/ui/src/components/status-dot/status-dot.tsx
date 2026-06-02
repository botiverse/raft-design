import type { ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";
import type { WithoutChildren } from "../../lib/without-children.ts";

const statusDot = tv({
  base: ["inline-block shrink-0 rounded-full"],
  variants: {
    theme: {
      // Neutral default color; override with a bg-* class via className. The
      // source's `activity` axis (online/thinking/… → color) was app domain
      // (`@slock-ai/shared`); map it at the callsite: className={getActivityDotClass(activity)}.
      brutal: ["border border-black bg-gray-400"],
      // Elegant styling is deferred; see the component TODO.
      elegant: [],
    },
    size: {
      sm: "size-2",
      md: "size-2.5",
      lg: "size-[11px]",
    },
    pulse: {
      true: "animate-pulse",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    pulse: false,
  },
});

export type StatusDotProps = WithoutChildren<ComponentPropsWithRef<"span">> &
  Omit<VariantProps<typeof statusDot>, "theme">;

export function StatusDot({ size, pulse, className, ...props }: StatusDotProps) {
  const theme = useTheme();
  return (
    <span
      data-slot="status-dot"
      className={statusDot({ theme, size, pulse, className })}
      {...props}
    />
  );
}
