import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const kbd = tv({
  slots: {
    root: [
      "pointer-events-none inline-flex w-fit shrink-0 items-center justify-center gap-1",
      "whitespace-nowrap font-sans text-sm font-medium leading-none select-none",
      "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3",
    ],
    group: ["inline-flex items-center gap-1"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["text-foreground/60"],
      },
      elegant: {
        root: [
          "h-5 rounded bg-layer-panel px-1.5 text-[10px]",
          "font-medium text-foreground-muted ring-1 ring-inset ring-line-muted",
        ],
      },
    },
  },
});

export type KbdProps = ComponentPropsWithRef<"kbd">;

export function Kbd({ className, ...props }: KbdProps) {
  const theme = useTheme();
  const { root } = kbd({ theme });
  return <kbd data-slot="kbd" className={root({ className })} {...props} />;
}

export type KbdGroupProps = ComponentPropsWithRef<"span">;

export function KbdGroup({ className, ...props }: KbdGroupProps) {
  const theme = useTheme();
  const { group } = kbd({ theme });
  return <span data-slot="kbd-group" className={group({ className })} {...props} />;
}
