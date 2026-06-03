import type { ComponentPropsWithRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";
import type { WithoutChildren } from "../../lib/without-children.ts";

const attentionDot = tv({
  slots: {
    root: ["inline-block shrink-0 rounded-full"],
  },
  variants: {
    theme: {
      // Canonical unread color; override with a bg-* class via className.
      brutal: {
        root: ["border border-black bg-brutal-pink"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    // Size is physical fit, not priority: lg is canonical, sm only when the host
    // surface can't fit lg without crowding. Both keep the border.
    size: {
      sm: {
        root: "size-1",
      },
      lg: {
        root: "size-2.5",
      },
    },
  },
  defaultVariants: {
    size: "lg",
  },
});

export type AttentionDotProps = WithoutChildren<ComponentPropsWithRef<"span">> &
  Omit<VariantProps<typeof attentionDot>, "theme">;

export function AttentionDot({ size, className, ...props }: AttentionDotProps) {
  const theme = useTheme();
  const { root } = attentionDot({ theme, size });
  return <span data-slot="attention-dot" className={root({ className })} {...props} />;
}
