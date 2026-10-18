import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";

const mobileNav = tv({
  slots: {
    root: [
      "grid w-full flex-none grid-flow-col auto-cols-fr items-start gap-0",
      "border-t border-line-seam bg-layer-card px-2 pt-1.5 text-foreground-hint",
      "pb-[max(8px,min(env(safe-area-inset-bottom,0px),34px))]",
    ],
    item: [
      "relative inline-flex shrink-0 items-center outline-none",
      "disabled:pointer-events-none disabled:opacity-45",
      "[&_svg]:shrink-0",
      "isolate min-w-0 flex-col justify-start gap-[7px] border-0 px-0 pt-1 pb-0",
      "font-sans text-[10px]/3 font-semibold text-foreground-hint",
      "*:relative *:z-10 [&_svg]:size-[22px] [&_svg]:stroke-2",
      "before:pointer-events-none before:absolute before:top-0 before:left-1/2 before:z-0 before:-translate-x-1/2",
      "before:h-[30px] before:w-14 before:rounded-control before:border-[1.5px] before:border-transparent before:content-['']",
      "active:before:bg-fill-pressed",
      "data-[selected=true]:font-bold data-[selected=true]:text-foreground",
      "data-[selected=true]:[&_svg]:text-sticker-ink",
      "data-[selected=true]:before:border-sticker-ink data-[selected=true]:before:bg-brand data-[selected=true]:before:ring-[1.5px] data-[selected=true]:before:ring-sticker-edge",
      "data-[selected=true]:active:before:press-overlay-sticker",
      "rounded-control focus-visible:shadow-focus",
    ],
    itemLabel: ["min-w-0 truncate", "max-w-full"],
  },
});

export type MobileNavRootProps = useRender.ComponentProps<"nav">;

export function MobileNavRoot({ className, render, ...props }: MobileNavRootProps) {
  const { root } = mobileNav();
  const defaultProps: SlotElementProps<"nav"> = {
    "data-slot": "mobile-nav-root",
    className: root({ className }),
  };

  return useRender({
    defaultTagName: "nav",
    render,
    props: mergeProps<"nav">(defaultProps, props),
  });
}

export type MobileNavItemProps = useRender.ComponentProps<"button"> & {
  nativeButton?: boolean;
  selected?: boolean;
};

export function MobileNavItem({
  nativeButton = true,
  selected,
  className,
  render,
  ...props
}: MobileNavItemProps) {
  const { item } = mobileNav();
  const defaultProps: SlotElementProps<"button"> = {
    type: nativeButton ? "button" : undefined,
    "aria-pressed": nativeButton ? selected : undefined,
    "data-slot": "mobile-nav-item",
    "data-selected": selected ? "true" : undefined,
    className: item({ className }),
  };

  return useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type MobileNavLabelProps = useRender.ComponentProps<"span">;

export function MobileNavLabel({ className, render, ...props }: MobileNavLabelProps) {
  const { itemLabel } = mobileNav();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "mobile-nav-item-label",
    className: itemLabel({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
