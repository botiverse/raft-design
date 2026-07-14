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
    sidebarItemTextStack: ["min-w-0 flex-1 text-left"],
    sidebarItemTitle: ["block min-w-0 truncate"],
    sidebarItemSubtitle: ["block min-w-0 flex-1 truncate text-xs font-normal"],
    sidebarItemMeta: ["ml-auto shrink-0 font-mono text-[10px]"],
    sidebarItemIndicator: ["ml-1 shrink-0"],
    sidebarItemPresence: ["shrink-0"],
    sidebarItemMention: [
      "ml-1 size-4 shrink-0 items-center justify-center gap-0 px-0 py-0",
      "[&:has(svg)]:px-0",
      "[&_svg]:size-2.5 [&_svg]:shrink-0 [&_svg]:translate-y-0",
    ],
    sidebarItemMuted: [
      "ml-1 inline-flex size-4 shrink-0 items-center justify-center",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    sidebarItemDraft: [
      "inline-flex size-4 shrink-0 items-center justify-center",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    sidebarItemAside: ["flex shrink-0 items-center gap-1"],
    sidebarItemBadge: ["shrink-0"],
  },
  variants: {
    theme: {
      brutal: {
        sidebarItem: [
          "border-transparent text-black",
          "hover:border-black hover:bg-white hover:shadow-brutal-sm",
          "active:border-black active:bg-white active:shadow-brutal-sm",
          "aria-[current=page]:border-black aria-[current=page]:bg-brutal-pink",
          "aria-[current=page]:shadow-brutal-sm",
          "aria-expanded:border-black aria-expanded:bg-white aria-expanded:shadow-brutal-sm",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:[outline-color:black]",
        ],
        sidebarItemTitle: "font-medium text-black group-data-[unread=true]/sidebar-item:font-bold",
        sidebarItemSubtitle: "text-black/40",
        sidebarItemMeta: "text-xs font-medium text-black/70",
        sidebarItemMention: [
          "rounded border border-black bg-soft-signal",
          "text-[10px] font-bold leading-none text-black",
        ],
        sidebarItemMuted: "text-black",
        sidebarItemDraft: "text-black/40",
        sidebarItemBadge: [
          "h-4 gap-0 rounded border border-black bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white",
        ],
      },
      elegant: {
        sidebarItem: [
          "relative mb-0.5 -mx-[var(--sidebar-row-inset-x,6px)] w-[calc(100%+12px)] rounded-md border border-transparent px-[var(--sidebar-row-inset-x,6px)] py-1.5 md:py-1.5 [@media(max-height:600px)]:py-1",
          "text-[13px] font-medium text-foreground-muted",
          "hover:border-transparent hover:bg-layer-strong/80 hover:text-foreground-strong",
          "active:border-transparent active:bg-layer-strong/80 active:text-foreground-strong",
          "aria-[current=page]:border-transparent aria-[current=page]:bg-layer-panel",
          "aria-[current=page]:text-foreground",
          "aria-[current=page]:shadow-xs aria-[current=page]:ring-1 aria-[current=page]:ring-line-subtle/30",
          "aria-expanded:border-transparent aria-expanded:bg-layer-panel",
          "aria-expanded:shadow-xs aria-expanded:ring-1 aria-expanded:ring-line-subtle/30",
        ],
        sidebarItemTitle: [
          "font-[450] text-foreground-muted",
          "group-data-[unread=true]/sidebar-item:font-semibold",
          "group-data-[unread=true]/sidebar-item:text-foreground-strong",
        ],
        sidebarItemIcon: "size-[18px] text-foreground-icon [&_svg]:stroke-[1.5]",
        sidebarItemChannelIcon:
          "size-3 text-foreground-icon [&_svg]:!size-3.5 [&_svg]:!stroke-[1.5]",
        sidebarItemSubtitle: "text-ink-30",
        sidebarItemMeta:
          "font-sans text-xs font-medium leading-none normal-nums text-foreground-icon",
        sidebarItemIndicator: ["pointer-events-none absolute top-1/2 right-full -translate-y-1/2"],
        sidebarItemPresence: [
          "pointer-events-none absolute top-1/2 right-[calc(100%+2px)] -translate-y-1/2",
          "[&_[data-slot=status]]:size-2",
        ],
        sidebarItemMention: [
          "rounded-sm border-0",
          "text-[10px] font-normal leading-none tracking-normal",
        ],
        sidebarItemMuted: "text-foreground-muted",
        sidebarItemDraft: "text-foreground-icon",
        sidebarItemBadge: [
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
