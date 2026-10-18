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
    sidebarItemCountSeparator: ["mx-0.5 opacity-60"],
    sidebarItemThreadCount: [
      "inline-flex items-center gap-0.5",
      "[&>svg]:size-3 [&>svg]:shrink-0 [&>svg]:translate-y-0",
    ],
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
          "h-4 min-w-4 items-center justify-center gap-0 rounded-sm px-1 py-0",
          // Badge widens to px-2 via :has(svg) when it holds an icon; a thread
          // segment must stay as tight as a plain number. The self attribute
          // selector outranks it without adding another :has() (rui#382).
          "data-[slot=sidebar-item-count]:px-1",
          "text-[10px] font-normal leading-none tabular-nums tracking-normal",
        ],
      },
      raft: {
        sidebarItem: [
          "my-px h-9 gap-2 rounded-control border-[1.5px] border-transparent py-0 pr-2.5 pl-2",
          "md:py-0 [@media(max-height:600px)]:py-0",
          "font-sans text-subhead font-medium text-foreground",
          "hover:bg-fill-pressed active:bg-fill-pressed not-data-active:data-popup-open:bg-fill-pressed",
          "data-active:border-sticker-ink data-active:bg-primary data-active:font-bold data-active:text-sticker-ink",
          "focus-visible:shadow-raft-focus outline-none",
        ],
        sidebarItemIcon: [
          "size-[19px] text-foreground-hint [&>svg]:size-4 [&>svg]:stroke-2",
          "group-data-active/sidebar-item:text-sticker-ink",
        ],
        sidebarItemChannelIcon: [
          "size-[19px] text-foreground-hint [&_svg]:size-4 [&_svg]:stroke-2",
          "group-data-active/sidebar-item:text-sticker-ink",
        ],
        sidebarItemSubtitle: [
          "text-footnote font-normal text-foreground-muted",
          "group-data-active/sidebar-item:text-sticker-ink",
        ],
        sidebarItemMeta: [
          "font-mono text-mono-meta font-normal tabular-nums text-foreground-hint",
          "group-data-active/sidebar-item:text-sticker-ink",
        ],
        sidebarItemStatus: "inline-flex items-center",
        sidebarItemIndicator: [
          "size-5 min-w-5 rounded-sticker border-0 p-0",
          "bg-primary text-sticker-ink shadow-[inset_0_0_0_1.5px_var(--sticker-ink)]",
          "[&_svg]:size-[13px] [&_svg]:stroke-2",
        ],
        sidebarItemMetaIcon: [
          "text-foreground-hint [&_svg]:size-3.5",
          "group-data-active/sidebar-item:text-sticker-ink",
        ],
        sidebarItemCount: [
          "h-5 min-w-5 items-center justify-center gap-0 rounded-sticker border-0 px-1.5 py-0",
          "data-[slot=sidebar-item-count]:px-1.5",
          "bg-accent text-sticker-ink shadow-[inset_0_0_0_1.5px_var(--sticker-ink)]",
          "font-mono text-mono-meta font-bold tabular-nums tracking-normal",
        ],
      },
    },
    variant: {
      default: {},
      primary: {},
      accent: {},
    },
    // A row whose name may run onto more lines (a pinned row keeps the whole
    // name): it grows instead of truncating, its content hangs from the top so
    // the identity glyph stays beside the first line, and a one-line wrapping
    // row is pixel-identical to a fixed one.
    wrap: {
      false: {},
      true: { sidebarItem: ["h-auto items-start whitespace-normal"] },
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
    wrap: false,
    stacked: false,
  },
  compoundVariants: [
    {
      // DS `.rf-srow` is 36 tall with its 20px line centred: 8px from the row
      // edge to the text, i.e. 6.5px inside the 1.5px sticker edge. A wrapping
      // row keeps that inset as padding (restated at md and in short windows,
      // where the fixed row zeroes it) and grows from 36. The leading glyph
      // and inline meta icons take the line's height so they centre on the
      // first line, whatever the line height (the phone row is larger).
      theme: "raft",
      wrap: true,
      class: {
        sidebarItem: [
          "min-h-9 py-[6.5px] md:py-[6.5px] [@media(max-height:600px)]:py-[6.5px]",
          "**:data-[slot=sidebar-item-channel-icon]:h-lh **:data-[slot=sidebar-item-icon]:h-lh",
          "**:data-[slot=sidebar-item-meta-icon]:h-lh",
          // The 19px avatar (DS xs) centres on the first line the same way.
          "*:data-[slot=avatar]:mt-[calc((1lh-19px)/2)]",
        ],
      },
    },
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
