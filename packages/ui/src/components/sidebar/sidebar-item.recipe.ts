import { listCell, listCellStates } from "../../lib/list-cell";
import { tv } from "../../lib/tv";

export const sidebarItemRecipe = tv({
  slots: {
    // The tone sets the name's ink, which the title inherits: muted is ink-2,
    // away (offline, not joined) ink-3. The yellow sticker keeps its own ink.
    // The row is a list cell (lib/list-cell.ts): it runs the sidebar's full
    // width, 38px tall, and its states are drawn on the inset shape, as tall
    // as the row. SidebarList spaces the rows 2px apart and pads its ends by 8px.
    // The content sits 9.5px inside the shape on both sides (17.5px from the
    // row's edges), where it sat inside the old 1.5px edge.
    // Below md the row is a phone list of places (Home, Members, Settings):
    // at least 44px for a finger, in the ListRow title type (16/24 600).
    // 10px top and bottom centres one 24px line in 44, so a wrapping row
    // starts its first line where a one-line row's sits.
    sidebarItem: [
      "group/sidebar-item flex w-full items-center text-left",
      listCell,
      "h-[38px] gap-2 rounded-none border-0 py-0",
      "pr-[calc(var(--cell-inset-end)+9.5px)] pl-[calc(var(--cell-inset-x)+9.5px)]",
      "md:py-0 md:[@media(max-height:600px)]:py-0",
      "max-md:h-auto max-md:min-h-11 max-md:py-2.5",
      "font-sans text-subhead font-medium text-foreground",
      "max-md:text-body max-md:font-semibold",
      "data-active:font-bold data-active:text-sticker-ink",
      "data-active:before:bg-selected data-active:before:inset-ring-[1.5px] data-active:before:inset-ring-sticker-ink data-active:before:ring-[1.5px] data-active:before:ring-sticker-edge",
      "not-data-active:data-[tone=muted]:text-foreground-muted not-data-active:data-[tone=away]:text-foreground-hint",
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
      "has-[svg]:px-0",
      "[&_svg]:shrink-0 [&_svg]:translate-y-0",
      "size-5 min-w-5 rounded-sticker border-0 p-0",
      "bg-you text-sticker-ink inset-ring-[1.5px] inset-ring-sticker-ink ring-[1.5px] ring-sticker-edge",
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
    // is no target: no hover, press or focus ring. Keyboard focus is the 2px
    // inset ring on the shape; on the selected sticker it sits inside the
    // sticker's ink edge.
    interactive: {
      true: {
        sidebarItem: [
          listCellStates,
          "data-active:active:before:overlay-sticker-medium",
          "not-data-active:focus-visible:keyboard:before:inset-ring-2 not-data-active:focus-visible:keyboard:before:inset-ring-foreground",
          "data-active:focus-visible:keyboard:before:shadow-[inset_0_0_0_3.5px_var(--foreground)]",
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
          "min-h-[38px] py-[9px] md:py-[9px] md:[@media(max-height:600px)]:py-[9px]",
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
