import { tv } from "../../lib/tv";

// Narrow is below `md`: the viewport's, or the dock's when the toolbar sits in
// `SelectionToolbarDock` (a thread beside a conversation is narrow on any
// desktop). Both variants are listed on every narrow rule.
export const selectionToolbar = tv({
  slots: {
    dock: [
      "@container/selection-toolbar",
      "pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center",
      "px-5 pb-[calc(--spacing(4)+env(safe-area-inset-bottom))]",
      "*:pointer-events-auto",
    ],
    root: [
      "flex min-w-0 max-w-full flex-nowrap items-center gap-1",
      "rounded-container border border-line-strong bg-layer-popover px-2 py-1.5 shadow-float",
      // Each button's hit area reaches only half the 4px gap toward its
      // neighbour, so a tap between two lands on the nearer; the first and
      // last reach out to the frame's edge.
      "**:data-[slot=button]:after:inset-x-[-3px]",
      "**:data-[slot=button]:first:after:left-[-9.5px] **:data-[slot=button]:last:after:right-[-9.5px]",
    ],
    count: ["shrink-0 px-2 whitespace-nowrap text-callout font-bold text-foreground tabular-nums"],
    countValue: ["font-mono"],
    hint: [
      "shrink-0 pr-1 whitespace-nowrap text-caption text-foreground-hint",
      "max-md:hidden @max-md/selection-toolbar:hidden",
    ],
    actions: ["flex min-w-0 flex-nowrap items-center gap-1"],
    action: [
      "pr-3 pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
      "max-md:px-1.5 @max-md/selection-toolbar:px-1.5",
    ],
    actionLabel: ["max-md:sr-only @max-md/selection-toolbar:sr-only"],
    actionChevron: ["-ml-1 size-3 max-md:hidden @max-md/selection-toolbar:hidden"],
    more: [
      "hidden px-1.5 [&_svg:not([class*='size-'])]:size-3.5",
      "max-md:inline-flex @max-md/selection-toolbar:inline-flex",
    ],
  },
  variants: {
    secondary: {
      true: { action: "max-md:hidden @max-md/selection-toolbar:hidden" },
    },
    menu: {
      true: { action: "pr-2.5" },
    },
  },
});
