import { tv } from "../../lib/tv";

export const chatSidebar = tv({
  slots: {
    sidebarRoot: ["flex h-full min-h-0 w-full select-none flex-col"],
    sidebarHeader: ["flex shrink-0 items-center gap-3"],
    sidebarHeaderTitle: ["truncate text-lg font-bold text-foreground-strong"],
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
    sidebarSectionHeader: ["mt-3 mb-1 flex h-6 items-center justify-between px-2"],
    sidebarSectionButton: [
      "flex h-6 min-w-0 flex-1 items-center gap-1",
      "text-xs font-bold tracking-widest uppercase",
      "[&_svg]:transition-transform [&[data-panel-open]_svg]:rotate-90",
    ],
    sidebarSectionTitle: ["min-w-0 truncate"],
    sidebarSectionCount: ["font-mono normal-case tracking-normal"],
    sidebarSectionIndicator: ["ml-1", "[[data-panel-open]_&]:hidden"],
    sidebarSectionActions: ["flex shrink-0 items-center gap-1"],
    sidebarSectionAction: ["flex size-6 items-center justify-center p-0"],
    sidebarItem: [
      "mb-1 flex w-full items-center gap-1.5 px-2 py-2 text-left",
      "border-2 text-sm font-medium transition-colors",
      "[@media(max-height:600px)]:py-1 md:py-1",
    ],
    sidebarItemIcon: ["flex size-[18px] shrink-0 items-center justify-center"],
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
      "ml-1 inline-flex size-4 shrink-0 items-center justify-center",
      "[&_svg]:size-2.5 [&_svg]:shrink-0",
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
    sidebarResizeGroup: [
      "flex h-full w-full min-h-0 min-w-0",
      "aria-[orientation=vertical]:flex-col",
    ],
    sidebarResizePanel: ["min-h-0 min-w-0"],
    sidebarResizeHandle: [
      "right-0 z-10 hidden cursor-col-resize select-none md:flex",
      "relative -ml-px flex w-px shrink-0 items-center justify-center",
      "bg-transparent outline-none ring-offset-background",
      "after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2",
      "focus-visible:ring-1 focus-visible:ring-line-focus",
      "aria-[orientation=horizontal]:-mt-px aria-[orientation=horizontal]:ml-0 aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full",
      "aria-[orientation=horizontal]:after:inset-x-0 aria-[orientation=horizontal]:after:top-1/2",
      "aria-[orientation=horizontal]:after:h-3 aria-[orientation=horizontal]:after:w-full",
      "aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2",
    ],
  },
  variants: {
    unread: {
      true: {},
    },
    theme: {
      brutal: {
        sidebarSection: "px-0",
        sidebarHeader:
          "h-[62px] shrink-0 border-b-2 border-black bg-brutal-cream px-5 [@media(max-height:600px)]:h-12",
        sidebarBody: "bg-brutal-cream",
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
        sidebarSectionCount: "text-black/40",
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
        sidebarItemSubtitle: "text-black/40",
        sidebarItemMeta: "text-black/40",
        sidebarItemMention: "rounded border border-black bg-soft-signal text-black",
        sidebarItemMuted: "text-black/40",
        sidebarItemDraft: "text-black/40",
        sidebarItemBadge: [
          "h-4 gap-0 rounded border border-black bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white",
        ],
        sidebarFooter: "border-t-2 border-black bg-brutal-cream p-3",
        sidebarResizePanel: "has-[>[data-slot=app-shell-sidebar]]:bg-brutal-cream",
        sidebarResizeHandle: "hover:bg-black/10",
      },
      elegant: {
        sidebarHeader:
          "h-[var(--shell-header-height,3.5rem)] border-b-0 px-[var(--sidebar-inset-x,22px)]",
        sidebarHeaderTitle: "font-heading text-[17px] font-medium text-foreground-muted",
        sidebarBody: "bg-layer-page",
        sidebarContent: "px-[var(--sidebar-inset-x,22px)]",
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
          "ml-auto inline-flex min-w-7 shrink-0 items-center justify-end font-sans text-[12px] font-medium leading-none normal-nums text-foreground-muted/50",
        sidebarSectionButton: [
          "h-8 w-full justify-between gap-1.5 rounded-md px-[var(--sidebar-row-inset-x,6px)] text-[12px] font-medium leading-none normal-case tracking-normal",
          "text-foreground-icon",
          "hover:bg-layer-strong/80 hover:text-foreground",
          "[&>svg]:opacity-55",
        ],
        sidebarSectionCount:
          "ml-auto inline-flex min-w-7 shrink-0 items-center justify-end font-sans text-[12px] font-medium leading-none normal-nums text-foreground-muted/50",
        sidebarSectionActions: "pr-[var(--sidebar-row-inset-x,6px)]",
        sidebarSectionAction: "shrink-0 text-foreground-icon",
        sidebarSection: "px-0",
        sidebarSectionHeader:
          "relative -mx-[var(--sidebar-row-inset-x,6px)] mt-4 mb-0 flex h-8 w-[calc(100%+12px)] items-center justify-between px-0",
        sidebarItem: [
          "relative mb-0.5 -mx-[var(--sidebar-row-inset-x,6px)] w-[calc(100%+12px)] rounded-md border border-transparent px-[var(--sidebar-row-inset-x,6px)] py-1.5 md:py-1.5 [@media(max-height:600px)]:py-1",
          "text-[13px] font-medium text-foreground-muted",
          "has-[[data-slot=chat-sidebar-item-badge]]:[--sidebar-item-title-weight:450]",
          "hover:border-transparent hover:bg-layer-strong/80 hover:text-foreground-strong",
          "active:border-transparent active:bg-layer-strong/80 active:text-foreground-strong",
          "aria-[current=page]:border-transparent aria-[current=page]:bg-layer-panel",
          "aria-[current=page]:text-foreground",
          "aria-[current=page]:shadow-xs aria-[current=page]:ring-1 aria-[current=page]:ring-line-subtle/30",
          "aria-expanded:border-transparent aria-expanded:bg-layer-panel",
          "aria-expanded:shadow-xs aria-expanded:ring-1 aria-expanded:ring-line-subtle/30",
        ],
        sidebarItemTitle: "font-[var(--sidebar-item-title-weight,400)]",
        sidebarItemIcon: "size-5 text-foreground-icon [&_svg]:size-4 [&_svg]:stroke-[1.5]",
        sidebarItemChannelIcon:
          "size-3 text-foreground-icon [&_svg]:!size-3.5 [&_svg]:!stroke-[2.25]",
        sidebarItemSubtitle: "text-ink-30",
        sidebarItemMeta:
          "font-sans text-[12px] font-medium leading-none normal-nums text-foreground-muted/50",
        sidebarItemIndicator: ["pointer-events-none absolute top-1/2 right-full -translate-y-1/2"],
        sidebarItemPresence: [
          "pointer-events-none absolute top-1/2 right-full -translate-y-1/2",
          "[&_[data-slot=status]]:size-2",
        ],
        sidebarItemMention: "rounded-sm border-0 bg-primary-400 text-primary-950",
        sidebarItemMuted: "text-foreground-icon",
        sidebarItemDraft: "text-foreground-icon",
        sidebarItemBadge: [
          "min-w-[18px] justify-center rounded-sm border-0 bg-primary-400 px-1 py-px text-[10px] text-primary-950 tabular-nums",
        ],
        sidebarFooter: "border-t border-line-subtle p-3",
        sidebarResizePanel: "has-[>[data-slot=app-shell-sidebar]]:bg-layer-page",
        sidebarResizeHandle: "hover:bg-layer-muted",
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      unread: true,
      class: { sidebarItemTitle: "font-bold" },
    },
    {
      theme: "elegant",
      unread: true,
      class: { sidebarItemTitle: "[--sidebar-item-title-weight:500]" },
    },
  ],
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
