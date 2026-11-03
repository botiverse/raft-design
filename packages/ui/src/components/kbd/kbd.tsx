import type { ComponentPropsWithRef } from "react";
import { markInlinePart } from "../../lib/inline-part";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

const kbd = tv({
  slots: {
    root: [
      "pointer-events-none inline-flex w-fit shrink-0 items-center justify-center gap-1",
      "whitespace-nowrap select-none [&_svg]:pointer-events-none",
      "font-mono font-normal",
      "inset-ring inset-ring-line-hairline",
    ],
    group: ["inline-flex items-center gap-1"],
  },
  variants: {
    size: {
      sm: {
        root: [
          "[&_svg:not([class*='size-'])]:size-3",
          "min-w-4 rounded-[3px] px-1",
          "text-mono-meta text-foreground-hint",
          "in-data-[slot=tooltip-content]:text-foreground-on-hud/70",
          "in-data-[slot=tooltip-content]:shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--foreground-on-hud)_70%,transparent)]",
        ],
      },
      md: {
        root: [
          "[&_svg:not([class*='size-'])]:size-3.5",
          "h-6 min-w-6 rounded-sticker px-1.5",
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

/**
 * One keyboard key in a cap, a native `kbd`: at `sm`, the default, a hint
 * beside a menu item, a tooltip's text or a field; at `md`, a key that is the
 * content, as in a list of shortcuts. One key per cap: write a shortcut as a
 * KbdGroup of Kbd, or from key names with KbdShortcut.
 */
export function Kbd({ className, size = "sm", ...props }: KbdProps) {
  const { root } = kbd({ size });
  return <kbd data-slot="kbd" className={root({ className })} {...props} />;
}

export type KbdGroupProps = ComponentPropsWithRef<"span">;

/** Caps of one shortcut, 4px apart. */
export function KbdGroup({ className, ...props }: KbdGroupProps) {
  const { group } = kbd();
  return <span data-slot="kbd-group" className={group({ className })} {...props} />;
}

markInlinePart(Kbd);
markInlinePart(KbdGroup);
