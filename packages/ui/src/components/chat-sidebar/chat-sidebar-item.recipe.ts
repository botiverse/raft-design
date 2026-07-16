import { tv } from "../../lib/tv";

export const chatSidebarItem = tv({
  slots: {
    sidebarItem: [
      "group/sidebar-item mb-1 flex w-full items-center gap-1.5 px-2 py-2 text-left",
      "border-2 text-sm font-medium transition-colors",
      "[@media(max-height:600px)]:py-1 md:py-1",
    ],
    sidebarItemIcon: [
      "flex size-[18px] shrink-0 items-center justify-center",
      "[&>svg]:size-3.5 [&>svg]:shrink-0",
    ],
    sidebarItemChannelIcon: [
      "flex shrink-0 items-center justify-center",
      "[&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:stroke-[1.5]",
    ],
    sidebarItemText: ["min-w-0 flex flex-1 items-baseline gap-1 text-left"],
    sidebarItemTitle: ["block min-w-0 truncate"],
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
          "hover:border-black hover:bg-white hover:shadow-brutal-sm",
          "active:border-black active:bg-white active:shadow-brutal-sm",
          "data-[active]:border-black data-[active]:bg-brutal-pink",
          "data-[active]:shadow-brutal-sm",
          "data-[popup-open]:border-black data-[popup-open]:bg-white data-[popup-open]:shadow-brutal-sm",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:[outline-color:black]",
        ],
        sidebarItemTitle: "font-medium text-black",
        sidebarItemSubtitle: "text-black/40",
        sidebarItemMeta: "text-xs font-medium text-black/70",
        sidebarItemIndicator: [
          "rounded border border-black bg-soft-signal",
          "text-[10px] font-bold leading-none text-black",
        ],
        sidebarItemMetaIcon: "text-black/70",
        sidebarItemCount: [
          "h-4 gap-0 rounded border border-black bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white",
        ],
      },
      elegant: {
        sidebarItem: [
          "relative isolate mb-0.5 -mx-[var(--sidebar-row-inset-x,6px)] w-[calc(100%+12px)] rounded-md border border-transparent px-[var(--sidebar-row-inset-x,6px)] py-1.5 md:py-1.5 [@media(max-height:600px)]:py-1",
          "[&>*]:z-10",
          "text-[13px] font-medium text-foreground-muted",
          "hover:border-transparent hover:bg-layer-strong/80 hover:text-foreground-strong",
          "active:border-transparent active:bg-layer-strong/80 active:text-foreground-strong",
          "data-[active]:border-transparent data-[active]:bg-layer-panel",
          "data-[active]:text-foreground",
          "data-[active]:shadow-sm data-[active]:ring-1 data-[active]:ring-line-subtle/45",
          "data-[active]:before:pointer-events-none data-[active]:before:absolute data-[active]:before:inset-0 data-[active]:before:z-0 data-[active]:before:rounded-[inherit]",
          "data-[active]:before:bg-[linear-gradient(in_oklab_180deg,oklab(100%_0_0_/_8%)_0%,oklab(0%_0_0_/_3%)_100%)] data-[active]:before:content-['']",
          "data-[popup-open]:border-transparent data-[popup-open]:bg-layer-panel",
          "data-[popup-open]:shadow-xs data-[popup-open]:ring-1 data-[popup-open]:ring-line-subtle/30",
        ],
        sidebarItemTitle: "font-[450] text-foreground-muted",
        sidebarItemIcon: "size-[18px] text-foreground-icon [&_svg]:stroke-[1.5]",
        sidebarItemChannelIcon:
          "size-3 text-foreground-icon [&_svg]:!size-3.5 [&_svg]:!stroke-[1.5]",
        sidebarItemSubtitle: "text-ink-30",
        sidebarItemMeta:
          "font-sans text-xs font-medium leading-none normal-nums text-foreground-icon",
        sidebarItemStatus: [
          "pointer-events-none absolute top-1/2 right-[calc(100%+2px)] -translate-y-1/2",
          "[&_[data-slot=status]]:size-2",
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
  },
});

export const chatSidebarItemInlineText = tv({
  base: ["min-w-0"],
  variants: {
    align: {
      baseline: "",
      center: "items-center",
    },
    titleWidth: {
      auto: "",
      constrained: [
        "[&>[data-slot=chat-sidebar-item-title]]:max-w-[70%]",
        "[&>[data-slot=chat-sidebar-item-title]]:shrink-0",
      ],
    },
  },
  defaultVariants: {
    align: "baseline",
    titleWidth: "auto",
  },
});
