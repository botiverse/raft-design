import type { ComponentPropsWithRef } from "react";
import { tv } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

const inlineCode = tv({
  slots: {
    root: ["inline-flex items-center rounded px-1.5 py-0.5", "font-mono text-xs font-medium"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-2 border-line-strong bg-layer-panel font-display text-foreground-strong",
          "shadow-2xs",
        ],
      },
      elegant: {
        root: [
          "border border-foreground/8 bg-foreground/[0.045] text-[oklch(0.38_0_0)] dark:text-[oklch(0.78_0_0)]",
          "shadow-[0_0.5px_0.5px_-0.5px_oklch(0_0_0_/_0.08)]",
        ],
      },
    },
  },
});

export type InlineCodeProps = ComponentPropsWithRef<"code">;

export function InlineCode({ className, ...props }: InlineCodeProps) {
  const theme = useTheme();
  const { root } = inlineCode({ theme });

  return <code data-slot="inline-code" className={root({ className })} {...props} />;
}
