import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

// Raft Design System › the neutral icon tile (`rf-tile`): what has no face (a
// system notice, a file, an app, a computer, a kind of search result) sits in
// the same neutral square as a channel, with an icon. It follows the avatar
// sizes so it lines up wherever an avatar would sit.
const iconTile = tv({
  slots: {
    root: ["inline-flex shrink-0 items-center justify-center", "rounded-sticker [&_svg]:shrink-0"],
  },
  variants: {
    variant: {
      default: { root: "bg-fill-muted text-foreground-muted" },
      // System notices only: an error or a warning, and a message.
      warning: { root: "bg-warning-soft text-foreground" },
      information: { root: "bg-info-soft text-foreground" },
    },
    size: {
      xs: { root: "size-[19px] [&_svg:not([class*='size-'])]:size-[11px]" },
      sm: { root: "size-[27px] [&_svg:not([class*='size-'])]:size-3.5" },
      md: { root: "size-[35px] [&_svg:not([class*='size-'])]:size-[18px]" },
      lg: { root: "size-[51px] [&_svg:not([class*='size-'])]:size-[22px]" },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export type IconTileProps = useRender.ComponentProps<"span"> & VariantProps<typeof iconTile>;

/** A neutral square holding an icon, sized like an avatar: 19, 27, 35 or 51. */
export function IconTile({ variant, size, className, render, ...props }: IconTileProps) {
  const { root } = iconTile({ variant, size });
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "icon-tile",
    "data-size": size ?? "md",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
