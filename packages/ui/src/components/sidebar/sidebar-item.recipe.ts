import { tv } from "../../lib/tv";

export const sidebarItemRecipe = tv({
  slots: {
    sidebarItem: [
      "group/sidebar-item mb-1 flex w-full items-center gap-1.5 px-2 py-2 text-left",
      "border-2 text-sm font-medium transition-colors",
      "[@media(max-height:600px)]:py-1 md:py-1",
    ],
    sidebarItemIcon: [
      "flex size-4.5 shrink-0 items-center justify-center",
      "[&>svg]:size-3.5 [&>svg]:shrink-0",
    ],
    sidebarItemChannelIcon: [
      "flex shrink-0 items-center justify-center",
      "[&_svg]:shrink-0 [&_svg]:stroke-[1.5]",
    ],
    sidebarItemContent: ["has-[>[data-slot=sidebar-item-meta-icon]]:items-center"],
    sidebarItemTitle: [
      "block min-w-0 truncate",
      // The inline row caps/shrinks the title when a subtitle follows; the
      // content mirrors that into variables instead of styling the title (a
      // descendant) from an ancestor :has() (#133).
      "max-w-(--si-title-max-w,none)",
      "shrink-(--si-title-shrink,1)",
    ],
    sidebarItemSubtitle: ["block min-w-0 flex-1 truncate text-xs font-normal"],
    sidebarItemMeta: ["ml-auto shrink-0 font-mono text-[10px]"],
    sidebarItemStatus: ["shrink-0"],
    sidebarItemIndicator: [
      "size-4 shrink-0 items-center justify-center gap-0 px-0 py-0",
      "[&:has(svg)]:px-0",
      "[&_svg]:size-2.5 [&_svg]:shrink-0 [&_svg]:translate-y-0",
    ],
    sidebarItemMetaIcon: [
      "inline-flex size-4 shrink-0 items-center justify-center",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    sidebarItemAside: ["flex shrink-0 items-center gap-1"],
    sidebarItemCount: ["shrink-0"],
  },
  variants: {
    theme: {
      brutal: {
        sidebarItem: [
          "border-transparent text-black",
          "hover:border-black hover:bg-white hover:shadow-raft-sm",
          "active:border-black active:bg-white active:shadow-raft-sm",
          "data-active:border-black",
          "data-active:shadow-raft-sm",
          "data-popup-open:border-black data-popup-open:bg-white data-popup-open:shadow-raft-sm",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[black]",
        ],
        sidebarItemTitle: "font-medium text-black",
        sidebarItemChannelIcon: "[&_svg]:size-3",
        sidebarItemSubtitle: "text-black/40",
        sidebarItemMeta: [
          "inline-flex h-4 items-center justify-center border border-transparent px-1.5",
          "font-sans text-xs font-bold leading-none tabular-nums text-black/70",
        ],
        sidebarItemStatus: ["[&>[data-slot=status]]:size-2"],
        sidebarItemIndicator: [
          "rounded-sm border border-black bg-primary",
          "text-[10px] font-bold leading-none text-black",
        ],
        sidebarItemMetaIcon: "text-black/70",
        sidebarItemCount: [
          "h-4 gap-0 rounded-sm border border-black bg-brutal-pink px-1.5 py-0.5",
          "font-sans text-[10px] font-bold leading-none tabular-nums text-white",
        ],
      },
      elegant: {
        sidebarItem: [
          "relative isolate mb-0.5 -mx-(--sidebar-row-inset-x,6px) w-[calc(100%+12px)] rounded-md border border-transparent px-(--sidebar-row-inset-x,6px) py-1.5 md:py-1.5 [@media(max-height:600px)]:py-1",
          "*:z-10",
          "text-[13px] font-medium text-foreground-muted",
          "hover:border-transparent hover:bg-fill-strong/80 hover:text-foreground",
          "dark:hover:bg-ink-6 dark:active:bg-ink-6",
          "active:border-transparent active:bg-fill-strong/80 active:text-foreground",
          "data-active:border-transparent data-active:bg-layer-panel",
          "dark:data-active:bg-layer-card",
          "data-active:text-foreground-strong",
          "data-active:shadow-raft-sm data-active:ring-1 data-active:ring-line-muted/45",
          "dark:data-active:ring-transparent",
          "data-popup-open:border-transparent data-popup-open:bg-layer-panel",
          "dark:data-popup-open:bg-layer-card",
          "data-popup-open:shadow-raft-xs data-popup-open:ring-1 data-popup-open:ring-line-muted/30",
          "dark:data-popup-open:ring-transparent",
        ],
        sidebarItemTitle: "font-[450] text-foreground-muted",
        sidebarItemIcon: "size-4.5 text-foreground-icon [&_svg]:stroke-[1.5]",
        sidebarItemChannelIcon: "size-3 text-foreground-icon [&_svg]:size-3.5",
        sidebarItemSubtitle: "text-ink-30",
        sidebarItemMeta: [
          "inline-flex h-4 min-w-4 items-center justify-center",
          "font-sans text-[10px] font-medium leading-none tabular-nums text-foreground-icon",
        ],
        sidebarItemStatus: [
          "pointer-events-none absolute top-1/2 right-[calc(100%+2px)] -translate-y-1/2",
          "[&>[data-slot=status]]:size-1",
        ],
        sidebarItemIndicator: [
          "rounded-sm border-0",
          "text-[10px] font-normal leading-none tracking-normal",
        ],
        sidebarItemMetaIcon: "text-foreground-icon",
        sidebarItemCount: [
          "h-4 min-w-4 items-center justify-center rounded-sm px-1 py-0",
          "text-[10px] font-normal leading-none tabular-nums tracking-normal",
        ],
      },
    },
    variant: {
      default: {},
      primary: {},
      accent: {},
    },
    stacked: {
      false: {
        sidebarItemContent: [
          "min-w-0 flex flex-1 items-baseline gap-1 text-left",
          "has-[>[data-slot=sidebar-item-subtitle]]:[--si-title-max-w:70%]",
          "has-[>[data-slot=sidebar-item-subtitle]]:[--si-title-shrink:0]",
        ],
      },
      true: { sidebarItemContent: ["min-w-0 flex-1 text-left"] },
    },
  },
  defaultVariants: {
    variant: "default",
    stacked: false,
  },
  compoundVariants: [
    {
      theme: "brutal",
      variant: "default",
      class: { sidebarItem: "data-active:bg-white" },
    },
    {
      theme: "brutal",
      variant: "primary",
      class: { sidebarItem: "data-active:bg-brutal-yellow" },
    },
    {
      theme: "brutal",
      variant: "accent",
      class: { sidebarItem: "data-active:bg-brutal-pink" },
    },
  ],
});
