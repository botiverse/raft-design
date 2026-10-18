import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";

const kbd = tv({
  slots: {
    root: [
      "pointer-events-none inline-flex w-fit shrink-0 items-center justify-center gap-1",
      "whitespace-nowrap select-none",
      "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3",
      "min-w-4 rounded-[3px] px-1",
      "font-mono text-mono-meta font-normal text-foreground-hint",
      "inset-ring inset-ring-line-hairline",
      "in-data-[slot=tooltip-content]:text-foreground-on-hud/70",
      "in-data-[slot=tooltip-content]:shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground-on-hud)_70%,transparent)]",
    ],
    group: ["inline-flex items-center gap-1"],
  },
});

export type KbdProps = ComponentPropsWithRef<"kbd">;

export function Kbd({ className, ...props }: KbdProps) {
  const { root } = kbd();
  return <kbd data-slot="kbd" className={root({ className })} {...props} />;
}

export type KbdGroupProps = ComponentPropsWithRef<"span">;

export function KbdGroup({ className, ...props }: KbdGroupProps) {
  const { group } = kbd();
  return <span data-slot="kbd-group" className={group({ className })} {...props} />;
}
