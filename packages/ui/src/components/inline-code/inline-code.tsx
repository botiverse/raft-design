import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const inlineCode = tv({
  slots: {
    root: [],
  },
  variants: {
    theme: {
      brutal: {
        root: "border border-black bg-brutal-yellow/40 px-1 text-sm font-mono [overflow-wrap:anywhere]",
      },
      elegant: {
        root: [
          "inline-flex items-center rounded px-2 py-0.5",
          "font-mono text-xs font-medium",
          "bg-foreground/[0.065] text-[oklch(0.38_0_0)] dark:text-[oklch(0.78_0_0)]",
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
