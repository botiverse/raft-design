import type { HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";
import type { WithoutChildren } from "../../lib/without-children.ts";

const attentionDot = tv({
  base: ["inline-block shrink-0 rounded-full"],
  variants: {
    theme: {
      // Canonical unread color; override with a bg-* class via className.
      brutal: ["border border-black bg-brutal-pink"],
      // Elegant styling is deferred; see the component TODO.
      elegant: [],
    },
    // Size is physical fit, not priority: lg is canonical, sm only when the host
    // surface can't fit lg without crowding. Both keep the border.
    size: {
      sm: "size-1",
      lg: "size-2.5",
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

export type AttentionDotProps = WithoutChildren<HTMLAttributes<HTMLSpanElement>> &
  Omit<VariantProps<typeof attentionDot>, "theme">;

export function AttentionDot({ size, className, ...props }: AttentionDotProps) {
  const theme = useTheme();
  return (
    <span
      data-slot="attention-dot"
      className={attentionDot({ theme, size, className })}
      {...props}
    />
  );
}
