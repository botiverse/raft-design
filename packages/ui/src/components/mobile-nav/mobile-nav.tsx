import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { tv } from "../../lib/tv";

const mobileNav = tv({
  slots: {
    root: [],
    item: [
      "relative inline-flex shrink-0 items-center justify-center outline-none",
      "disabled:pointer-events-none disabled:opacity-45",
      "[&_svg]:size-4.5 [&_svg]:shrink-0",
    ],
    itemLabel: ["min-w-0 truncate"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "grid w-full flex-none grid-flow-col auto-cols-fr items-stretch gap-0",
          "border-t-2 border-black bg-white pb-[min(env(safe-area-inset-bottom,0px),34px)] text-black",
        ],
        item: [
          "min-w-0 flex-col gap-0.5 border-0 border-r-2 border-line-strong px-0 py-2 text-[10px] tracking-wider last:border-r-0",
          "text-black/55 hover:text-black active:bg-ink-6",
          "data-[selected=true]:text-black data-[selected=true]:bg-primary-400 data-[selected=true]:shadow-none",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
        ],
      },
      elegant: {
        root: [
          "flex w-fit max-w-full flex-none self-center items-center gap-2 rounded-full bg-layer-panel p-1 shadow-raft-lg",
          "mt-2 mb-[max(8px,env(safe-area-inset-bottom,0px))]",
        ],
        item: [
          "relative size-11 min-w-0 gap-0 rounded-full border-0 p-0",
          "text-foreground-placeholder *:relative *:z-10",
          "hover:text-foreground-muted active:bg-fill-strong",
          "data-[selected=true]:bg-layer-panel data-[selected=true]:text-foreground-strong data-[selected=true]:shadow-raft-xl data-[selected=true]:ring-1 data-[selected=true]:ring-line-muted/45",
          "dark:data-[selected=true]:bg-fill-muted dark:data-[selected=true]:ring-transparent",
          "data-[selected=true]:before:pointer-events-none data-[selected=true]:before:absolute data-[selected=true]:before:inset-0 data-[selected=true]:before:z-0 data-[selected=true]:before:rounded-[inherit]",
          "data-[selected=true]:before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0/12%)_0%,oklab(0%_0_0/6%)_100%)] data-[selected=true]:before:content-['']",
          "dark:data-[selected=true]:before:hidden",
        ],
        itemLabel: "sr-only",
      },
      raft: {
        root: [
          "grid w-full flex-none grid-flow-col auto-cols-fr items-start gap-0",
          "border-t border-line-seam bg-layer-card px-2 pt-1.5 text-foreground-hint",
          "pb-[max(8px,min(env(safe-area-inset-bottom,0px),34px))]",
        ],
        item: [
          "isolate min-w-0 flex-col justify-start gap-[7px] border-0 px-0 pt-1 pb-0",
          "font-sans text-[10px]/3 font-semibold text-foreground-hint",
          "*:relative *:z-10 [&_svg]:size-[22px] [&_svg]:stroke-2",
          "before:pointer-events-none before:absolute before:top-0 before:left-1/2 before:z-0 before:-translate-x-1/2",
          "before:h-[30px] before:w-14 before:rounded-control before:border-[1.5px] before:border-transparent before:content-['']",
          "active:before:bg-fill-pressed",
          "data-[selected=true]:font-bold data-[selected=true]:text-foreground",
          "data-[selected=true]:[&_svg]:text-sticker-ink",
          "data-[selected=true]:before:border-sticker-ink data-[selected=true]:before:bg-primary",
          "data-[selected=true]:active:before:press-overlay-sticker",
          "rounded-control focus-visible:shadow-raft-focus",
        ],
        itemLabel: "max-w-full",
      },
    },
  },
});

export type MobileNavRootProps = useRender.ComponentProps<"nav">;

export function MobileNavRoot({ className, render, ...props }: MobileNavRootProps) {
  const theme = useThemeFamily();
  const { root } = mobileNav({ theme });
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
  const theme = useThemeFamily();
  const { item } = mobileNav({ theme });
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
  const theme = useThemeFamily();
  const { itemLabel } = mobileNav({ theme });
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
