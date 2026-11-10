import { tv } from "../../lib/tv";

// Two densities. On a phone and on a touch screen (everything not
// `md:pointer-fine:`) the bar is as tall as a head and holds a head's
// buttons: bar buttons (`bar-button-size`, 44px) side by side, each its own
// tap, showing their icons alone with no chevrons. With a mouse on a desktop
// they are `md` ghost buttons (34px) 4px apart with their labels, 44px tall
// in all. What doesn't fit gives way in the steps SelectionToolbar measures
// (fit-toolbar): `data-fit-label` turns an action into an icon square (and
// the hint into screen-reader text), `data-fit-more` moves it into More.
// The first and last direct children's hit areas reach the frame's edge.
export const selectionToolbar = tv({
  slots: {
    dock: [
      "pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center",
      "px-5 pb-[calc(--spacing(4)+env(safe-area-inset-bottom))]",
      "*:pointer-events-auto",
    ],
    root: [
      "w-fit gap-0 md:pointer-fine:gap-1",
      "h-(--header-height) px-(--header-air) py-0",
      "rounded-container bg-layer-popover ring-1 ring-line-seam shadow-float",
      "**:data-[slot=button]:after:inset-x-[-1.5px] md:pointer-fine:**:data-[slot=button]:after:inset-x-[-3px]",
      "*:data-[slot=button]:first:after:-left-[(var(--header-air)+1.5px)] *:data-[slot=button]:last:after:-right-[(var(--header-air)+1.5px)]",
    ],
    count: [
      "shrink-0 pr-0 pl-2 md:pointer-fine:px-2",
      "whitespace-nowrap text-callout font-bold text-foreground tabular-nums",
    ],
    countValue: ["font-mono"],
    hint: [
      "shrink-0 pr-1 whitespace-nowrap text-caption text-foreground-hint",
      "data-fit-label:sr-only",
    ],
    actions: ["gap-0 md:pointer-fine:gap-1"],
    action: [
      "[&_svg:not([class*='size-'])]:size-3.5",
      "size-(--bar-button-size) justify-center px-0 after:inset-y-[-1.5px]",
      "md:pointer-fine:w-auto md:pointer-fine:pr-3 md:pointer-fine:pl-2.5",
      "md:pointer-fine:data-fit-label:w-(--control-height) md:pointer-fine:data-fit-label:px-0",
      "data-fit-more:hidden",
    ],
    actionLabel: ["sr-only md:pointer-fine:not-sr-only md:pointer-fine:in-data-fit-label:sr-only"],
    actionChevron: [
      "-ml-1 hidden size-3 md:pointer-fine:block md:pointer-fine:in-data-fit-label:hidden",
    ],
    more: [
      "hidden data-fit-shown:inline-flex [&_svg:not([class*='size-'])]:size-3.5",
      "size-(--bar-button-size) px-0 after:inset-y-[-1.5px]",
      "md:pointer-fine:w-(--control-height)",
    ],
    close: ["size-(--bar-button-size) after:inset-y-[-1.5px]"],
  },
  variants: {
    menu: {
      true: { action: "md:pointer-fine:pr-2.5" },
    },
  },
});
