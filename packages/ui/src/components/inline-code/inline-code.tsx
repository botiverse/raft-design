import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

const inlineCode = tv({
  slots: {
    root: [],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border border-line-strong bg-brutal-yellow/50 px-1.5",
          "font-mono text-sm font-medium text-foreground-strong [overflow-wrap:anywhere]",
        ],
      },
      elegant: {
        root: [
          "inline-flex items-center rounded-md px-2.5 py-[1.5px]",
          "font-mono text-sm font-medium",
          "bg-[oklch(0.955_0_0)] text-[oklch(0.44_0_0)]",
          "dark:bg-fill-muted dark:text-foreground dark:shadow-raft-xs",
        ],
      },
    },
  },
});

export type InlineCodeProps = ComponentPropsWithRef<"code">;

export function InlineCode({ className, ...props }: InlineCodeProps) {
  const theme = useThemeFamily();
  const { root } = inlineCode({ theme });

  return <code data-slot="inline-code" className={root({ className })} {...props} />;
}
