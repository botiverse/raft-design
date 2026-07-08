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
          "font-mono text-sm font-medium text-foreground [overflow-wrap:anywhere]",
        ],
      },
      elegant: {
        root: [
          "inline-flex items-center rounded-md px-2.5 py-0.5",
          "font-mono text-sm font-medium",
          "bg-[oklch(0.955_0_0)] text-[oklch(0.44_0_0)] dark:bg-[oklch(0.24_0.006_286)] dark:text-[oklch(0.78_0_0)]",
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
