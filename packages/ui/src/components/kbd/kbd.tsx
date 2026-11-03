import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

const kbd = tv({
  slots: {
    root: [
      "pointer-events-none inline-flex w-fit shrink-0 items-center justify-center gap-1",
      "whitespace-nowrap select-none",
      "rounded-sticker",
      "font-mono font-normal",
      "inset-ring inset-ring-line-hairline",
    ],
    group: ["inline-flex items-center gap-1"],
  },
  variants: {
    size: {
      sm: {
        root: [
          "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3",
          "min-w-4 px-1",
          "text-mono-meta text-foreground-hint",
          "in-data-[slot=tooltip-content]:text-foreground-on-hud/70",
          "in-data-[slot=tooltip-content]:shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground-on-hud)_70%,transparent)]",
        ],
      },
      md: {
        root: [
          "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5",
          "h-6 min-w-6 px-1.5",
          "text-mono-code text-foreground-muted",
          "bg-fill-muted",
        ],
      },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export type KbdSize = NonNullable<VariantProps<typeof kbd>["size"]>;

export type KbdProps = ComponentPropsWithRef<"kbd"> & {
  /**
   * `sm` (the default) is a hint beside something else: a menu item, a
   * tooltip, the search trigger, an input. `md` is a key that is the content,
   * in a list of shortcuts.
   */
  size?: KbdSize;
};

export function Kbd({ className, size = "sm", ...props }: KbdProps) {
  const { root } = kbd({ size });
  return <kbd data-slot="kbd" className={root({ className })} {...props} />;
}

export type KbdGroupProps = ComponentPropsWithRef<"span">;

export function KbdGroup({ className, ...props }: KbdGroupProps) {
  const { group } = kbd();
  return <span data-slot="kbd-group" className={group({ className })} {...props} />;
}
