import { tv } from "../../lib/tv";

export const sidebarItemRecipe = tv({
  slots: {
    // The tone sets the name's ink, which the title inherits: muted is ink-2,
    // away (offline, not joined) ink-3. The yellow sticker keeps its own ink.
    // Below md the row is a phone list of places (Home, Members, Settings):
    // at least 44px for a finger, in the ListRow title type (16/24 600).
    // 8.5px inside the 1.5px edge centres one 24px line in 44, so a wrapping
    // row starts its first line where a one-line row's sits.
    sidebarItem: [
      "group/sidebar-item flex w-full items-center px-2 text-left",
      "transition-colors",
      "my-px h-9 gap-2 rounded-control border-[1.5px] border-transparent py-0 pr-2.5 pl-2",
      "md:py-0 md:[@media(max-height:600px)]:py-0",
      "max-md:h-auto max-md:min-h-11 max-md:py-[8.5px]",
      "font-sans text-subhead font-medium text-foreground",
      "max-md:text-body max-md:font-semibold",
      "data-active:border-sticker-ink data-active:bg-brand data-active:font-bold data-active:text-sticker-ink data-active:ring-[1.5px] data-active:ring-sticker-edge",
      "not-data-active:data-[tone=muted]:text-foreground-muted not-data-active:data-[tone=away]:text-foreground-hint",
      "outline-none",
    ],
    sidebarItemIcon: [
      "flex shrink-0 items-center justify-center",
      "[&>svg]:shrink-0",
      "size-[19px] text-foreground-hint [&>svg]:size-4 [&>svg]:stroke-2",
      "group-data-active/sidebar-item:text-sticker-ink",
    ],
    sidebarItemChannelIcon: [
      "flex shrink-0 items-center justify-center",
      "[&_svg]:shrink-0",
      "size-[19px] text-foreground-hint [&_svg]:size-4 [&_svg]:stroke-2",
      "group-data-active/sidebar-item:text-sticker-ink",
    ],
    sidebarItemContent: ["has-[>[data-slot=sidebar-item-meta-icon]]:items-center"],
    // The name comes first: a description after it gives up its room before
    // the name does (it shrinks a thousand times faster), so the name only
    // ellipsizes once the description has gone.
    sidebarItemTitle: [
      "block min-w-0 shrink truncate",
      "group-data-[tone=unread]/sidebar-item:font-bold",
    ],
    sidebarItemSubtitle: [
      "block min-w-0 flex-1 truncate",
      "shrink-1000 text-footnote font-normal text-foreground-muted",
      "group-data-active/sidebar-item:text-sticker-ink",
    ],
    sidebarItemMeta: [
      "ml-auto shrink-0",
      "font-mono text-mono-meta font-normal tabular-nums text-foreground-hint",
      "group-data-active/sidebar-item:text-sticker-ink",
    ],
    sidebarItemStatus: ["shrink-0", "inline-flex items-center"],
    sidebarItemIndicator: [
      "shrink-0 items-center justify-center gap-0",
      "[&:has(svg)]:px-0",
      "[&_svg]:shrink-0 [&_svg]:translate-y-0",
      "size-5 min-w-5 rounded-sticker border-0 p-0",
      "bg-brand text-sticker-ink inset-ring-[1.5px] inset-ring-sticker-ink ring-[1.5px] ring-sticker-edge",
      "[&_svg]:size-[13px] [&_svg]:stroke-2",
    ],
    sidebarItemMetaIcon: [
      "inline-flex size-4 shrink-0 items-center justify-center",
      "[&_svg]:shrink-0",
      "text-foreground-hint [&_svg]:size-3.5",
      "group-data-active/sidebar-item:text-sticker-ink",
    ],
    sidebarItemAside: ["flex shrink-0 items-center gap-1"],
    sidebarItemCount: [
      "shrink-0",
      "h-5 min-w-5 items-center justify-center gap-0 rounded-sticker border-0 px-1.5 py-0",
      "data-[slot=sidebar-item-count]:px-1.5",
      "bg-attention text-sticker-ink inset-ring-[1.5px] inset-ring-sticker-ink ring-[1.5px] ring-sticker-edge",
      "font-mono text-mono-meta font-bold tabular-nums tracking-normal",
    ],
    sidebarItemCountSeparator: ["mx-0.5 opacity-60"],
    sidebarItemThreadCount: [
      "inline-flex items-center gap-0.5",
      "[&>svg]:size-3 [&>svg]:shrink-0 [&>svg]:translate-y-0",
    ],
  },
  variants: {
    // A display-only row (this computer, whose action is a button inside it)
    // is no target: no hover, press or focus ring.
    interactive: {
      true: {
        sidebarItem: [
          "hover:bg-fill-subtle active:bg-fill-medium not-data-active:data-popup-open:bg-fill-subtle",
          "focus-visible:shadow-focus",
        ],
      },
      false: { sidebarItem: "cursor-default" },
    },
    // A row whose name may run onto more lines (a pinned row keeps the whole
    // name): it grows instead of truncating, its content hangs from the top so
    // the identity glyph stays beside the first line, and a one-line wrapping
    // row is pixel-identical to a fixed one.
    wrap: {
      false: {},
      true: {
        sidebarItem: [
          "h-auto items-start whitespace-normal",
          "min-h-9 py-[6.5px] md:py-[6.5px] md:[@media(max-height:600px)]:py-[6.5px]",
          "**:data-[slot=sidebar-item-channel-icon]:h-lh **:data-[slot=sidebar-item-icon]:h-lh",
          "**:data-[slot=sidebar-item-meta-icon]:h-lh",
          // The 19px avatar (DS xs) centres on the first line the same way.
          "*:data-[slot=avatar]:mt-[calc((1lh-19px)/2)]",
        ],
      },
    },
    stacked: {
      false: {
        sidebarItemContent: "min-w-0 flex flex-1 items-baseline gap-1 text-left",
      },
      true: { sidebarItemContent: ["min-w-0 flex-1 text-left"] },
    },
  },
  defaultVariants: {
    interactive: true,
    wrap: false,
    stacked: false,
  },
});
