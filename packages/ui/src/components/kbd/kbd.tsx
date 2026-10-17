import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

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
        root: ["text-[13px] text-foreground-strong/70"],
      },
      elegant: {
        root: [
          "min-w-5 rounded-sm bg-layer-panel px-1.5 py-1 text-[10px]",
          "font-medium text-foreground-muted ring-1 ring-inset ring-line-hairline",
          "dark:bg-fill-muted dark:ring-transparent",
          "dark:shadow-[inset_0_1px_0_oklch(0.985_0.004_106.42/0.07),0_0_0_1px_oklch(0_0_0/0.45),0_1.5px_0_oklch(0_0_0/0.5)]",
        ],
      },
      raft: {
        root: [
          "min-w-4 rounded-[3px] px-1",
          "font-mono text-mono-meta font-normal text-foreground-hint",
          "shadow-[inset_0_0_0_1px_var(--line-muted)]",
          "in-data-[slot=tooltip-content]:text-layer-hud-foreground/70",
          "in-data-[slot=tooltip-content]:shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--layer-hud-foreground)_70%,transparent)]",
        ],
      },
    },
  },
});

export type KbdProps = ComponentPropsWithRef<"kbd">;

export function Kbd({ className, ...props }: KbdProps) {
  const theme = useThemeFamily();
  const { root } = kbd({ theme });
  return <kbd data-slot="kbd" className={root({ className })} {...props} />;
}

export type KbdGroupProps = ComponentPropsWithRef<"span">;

export function KbdGroup({ className, ...props }: KbdGroupProps) {
  const theme = useThemeFamily();
  const { group } = kbd({ theme });
  return <span data-slot="kbd-group" className={group({ className })} {...props} />;
}
