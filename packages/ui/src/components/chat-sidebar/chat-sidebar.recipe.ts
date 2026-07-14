import { tv } from "../../lib/tv";

export const chatSidebar = tv({
  slots: {
    sidebarRoot: ["flex h-full min-h-0 w-full select-none flex-col"],
    sidebarHeader: ["flex shrink-0 items-center gap-3"],
    sidebarHeaderMask: ["pointer-events-none absolute inset-x-0 top-0 -z-10 hidden"],
    sidebarHeaderMaskLayer: ["absolute inset-x-0 top-0"],
    sidebarHeaderTitle: ["truncate text-lg font-bold text-foreground-strong"],
    sidebarServer: ["relative inline-flex shrink-0 items-center"],
    sidebarServerAvatar: [
      "flex shrink-0 items-center justify-center overflow-hidden",
      "[&_img]:size-full [&_img]:min-h-0 [&_img]:min-w-0 [&_img]:object-cover",
    ],
    sidebarServerLabel: ["min-w-0 truncate"],
    sidebarServerChevron: [
      "flex shrink-0 items-center justify-center",
      "[&_svg]:size-4 [&_svg]:shrink-0",
    ],
    sidebarServerIndicator: ["pointer-events-none absolute"],
    sidebarGroupLabel: [
      "px-2 pt-1 pb-2",
      "font-mono text-[10px] font-medium uppercase tracking-wider text-foreground-muted",
    ],
    sidebarBody: ["relative flex min-h-0 flex-1 overflow-hidden"],
    sidebarContent: ["flex-1 overflow-x-hidden overflow-y-auto px-2 py-3"],
    sidebarMenu: [
      "flex h-6 min-w-0 flex-1 items-center gap-1",
      "text-xs font-bold tracking-widest uppercase",
    ],
    sidebarMenuIcon: [
      "flex size-3 shrink-0 items-center justify-center",
      "[&_svg]:size-3 [&_svg]:shrink-0",
      "[&_svg]:[vector-effect:non-scaling-stroke] [&_svg_*]:[vector-effect:non-scaling-stroke]",
    ],
    sidebarMenuTitle: ["min-w-0 truncate"],
    sidebarMenuAside: ["flex shrink-0 items-center gap-1"],
    sidebarMenuCount: ["font-mono normal-case tracking-normal"],
    sidebarSection: ["px-2"],
    sidebarList: [],
    sidebarSectionHeader: [
      "mt-3 mb-1 flex h-6 items-center justify-between px-2",
      "group/section-header",
    ],
    sidebarSectionButton: [
      "flex h-6 min-w-0 flex-1 items-center gap-1",
      "text-xs font-bold tracking-widest uppercase",
      "[&_svg]:transition-transform [&[data-panel-open]_svg]:rotate-90",
    ],
    sidebarSectionTitle: ["min-w-0 truncate"],
    sidebarSectionCount: ["font-mono normal-case tracking-normal"],
    sidebarSectionIndicator: [
      "inline-flex min-w-[18px] shrink-0 items-center justify-center",
      "group-has-[[data-panel-open]]/section-header:hidden",
      "group-has-[[data-popup-open]]/section-header:hidden",
      "group-hover/section-header:hidden",
    ],
    sidebarSectionTrailing: ["relative flex min-w-[18px] shrink-0 items-center justify-end"],
    sidebarSectionActions: [
      "flex shrink-0 items-center gap-1",
      "pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 opacity-0",
      "max-md:static max-md:pointer-events-auto max-md:translate-y-0 max-md:opacity-100",
      "md:group-hover/section-header:pointer-events-auto md:group-hover/section-header:opacity-100",
      "md:focus-within:pointer-events-auto md:focus-within:opacity-100",
      "md:has-[[data-popup-open]]:pointer-events-auto md:has-[[data-popup-open]]:opacity-100",
    ],
    sidebarSectionAction: [
      "flex size-6 items-center justify-center p-0",
      "[&>svg]:shrink-0 [&>svg:not([class*='size-'])]:size-3.5",
    ],
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
    sidebarFooter: ["shrink-0"],
  },
  variants: {
    theme: {
      brutal: {
        sidebarSection: "px-0",
        sidebarHeader: [
          "h-[var(--shell-header-height,62px)] shrink-0 border-b-2 border-black bg-brutal-cream px-5",
          "max-md:bg-primary-400 max-md:px-4",
          "[@media(max-height:600px)]:h-12",
        ],
        sidebarServer: [
          "-rotate-2 gap-1.5 border-2 border-black bg-black px-3 py-1",
          "font-sans text-base font-bold text-primary-400",
          "shadow-brutal-sm transition-shadow hover:shadow-brutal",
        ],
        sidebarServerAvatar: "hidden",
        sidebarServerLabel: "max-w-[200px]",
        sidebarServerChevron: "rotate-2",
        sidebarServerIndicator: "hidden",
        sidebarBody: "bg-brutal-cream max-md:bg-white",
        sidebarMenu: [
          "text-black transition-colors hover:text-black/70",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:[outline-color:black]",
        ],
        sidebarMenuIcon: ["[&_svg]:![stroke-width:1.5px]", "[&_svg_*]:![stroke-width:1.5px]"],
        sidebarMenuCount: "text-black/40",
        sidebarSectionButton: [
          "text-black transition-colors hover:text-black/70",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:[outline-color:black]",
        ],
        sidebarSectionCount: "text-[12px] font-medium text-black/70",
        sidebarSectionAction: [
          "font-sans font-bold text-black/70",
          "transition-colors duration-100",
          "hover:bg-black/5 hover:text-black active:bg-black/10",
          "focus:outline-none focus-visible:bg-black/5 focus-visible:text-black focus-visible:outline-none",
        ],
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
        sidebarItemMeta: "text-[12px] font-medium text-black/70",
        sidebarItemMention: [
          "rounded border border-black bg-soft-signal",
          "text-[10px] font-bold leading-none text-black",
        ],
        sidebarItemMuted: "text-black",
        sidebarItemDraft: "text-black/40",
        sidebarItemBadge: [
          "h-4 gap-0 rounded border border-black bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white",
        ],
        sidebarFooter: "border-t-2 border-black bg-brutal-cream p-3",
      },
      elegant: {
        sidebarRoot: ["relative [--sidebar-inset-x:28px] md:[--sidebar-inset-x:26px]"],
        sidebarHeader: [
          "absolute inset-x-0 top-0 z-20 isolate",
          "h-[var(--shell-header-height,3.5rem)] border-b-0 bg-transparent",
          "px-[var(--sidebar-inset-x,26px)]",
          "[&_[data-slot=notification-center-trigger]]:-mr-2",
        ],
        sidebarHeaderMask: ["block h-[calc(100%+0.75rem)]"],
        sidebarHeaderMaskLayer: [
          "h-full",
          "data-[layer=solid]:bg-[linear-gradient(to_bottom,var(--layer-page)_0%,var(--layer-page)_28%,color-mix(in_oklch,var(--layer-page)_82%,transparent)_52%,transparent_100%)]",
          "data-[layer=soft]:h-[108%] data-[layer=soft]:bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--layer-page)_48%,transparent)_0%,color-mix(in_oklch,var(--layer-page)_18%,transparent)_40%,transparent_100%)]",
          "data-[layer=blur]:h-[112%] data-[layer=blur]:backdrop-blur-[14px] data-[layer=blur]:backdrop-saturate-125",
          "data-[layer=blur]:[mask-image:linear-gradient(to_bottom,black_0%,black_22%,oklch(0_0_0/0.55)_48%,transparent_100%)]",
          "data-[layer=blur]:[-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_22%,oklch(0_0_0/0.55)_48%,transparent_100%)]",
        ],
        sidebarHeaderTitle: "font-heading text-[17px] font-medium text-foreground-muted",
        sidebarServer: [
          "size-8 justify-center rounded-md bg-layer-panel",
          "transition-colors hover:bg-layer-strong/80",
        ],
        sidebarServerAvatar: "size-8 rounded-[inherit]",
        sidebarServerLabel: "sr-only",
        sidebarServerChevron: "hidden",
        sidebarServerIndicator: "-top-1 -right-1 z-10",
        sidebarBody: "bg-layer-page",
        sidebarContent: [
          "px-[var(--sidebar-inset-x,26px)]",
          "pt-[var(--shell-header-height,3.5rem)]",
        ],
        sidebarMenu: [
          "h-8 w-full justify-between gap-1.5 rounded-md px-[var(--sidebar-row-inset-x,6px)]",
          "text-[12px] leading-none font-normal normal-case tracking-normal",
          "text-foreground-muted",
          "hover:bg-layer-strong/80 hover:text-foreground-strong",
          "active:text-foreground-strong",
        ],
        sidebarMenuIcon: [
          "text-foreground-icon",
          "[&_svg]:![stroke-width:1px] [&_svg_*]:![stroke-width:1px]",
        ],
        sidebarMenuAside: "ml-auto",
        sidebarMenuCount:
          "shrink-0 font-sans text-[12px] font-medium leading-none normal-nums text-foreground-icon",
        sidebarSectionButton: [
          "h-8 w-full justify-start gap-1.5 rounded-md px-[var(--sidebar-row-inset-x,6px)] text-[12px] font-medium leading-none normal-case tracking-normal",
          "text-foreground-icon",
          "hover:text-foreground",
          "[&>svg]:opacity-55",
        ],
        sidebarSectionCount:
          "shrink-0 font-sans text-[12px] font-medium leading-none normal-nums text-foreground-icon",
        sidebarSectionTrailing: "pr-[var(--sidebar-row-inset-x,6px)]",
        sidebarSectionActions: "right-[var(--sidebar-row-inset-x,6px)]",
        sidebarSectionAction: [
          "shrink-0",
          "text-foreground-icon hover:text-foreground",
          "hover:!bg-transparent active:!bg-transparent",
          "hover:before:!bg-transparent active:before:!bg-transparent",
          "focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0",
        ],
        sidebarSection: "px-0",
        sidebarSectionHeader: [
          "relative -mx-[var(--sidebar-row-inset-x,6px)] mt-4 mb-0 flex h-8 w-[calc(100%+12px)] items-center justify-between rounded-md px-0",
          "group/section-header",
          "hover:bg-layer-strong/80",
        ],
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
          "font-sans text-[12px] font-medium leading-none normal-nums text-foreground-icon",
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
        sidebarFooter: "border-t border-line-subtle p-3",
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
