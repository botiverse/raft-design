import { tv } from "../../lib/tv";

// The rows run from edge to edge of the frame and touch, as a settings card's
// rows do (design/patterns/lists.md): a hover fill inset in the frame's own
// rounded border would draw a third edge, and a padded scroller left the
// first row's fill 4px under the border while the 2px between rows read as
// none. The frame clips the fill to its corners, and a hairline at the top of
// every row after another divides them, drawn inside the row so it adds no
// height and every row keeps its own.
const hairline = [
  "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:hidden",
  "before:border-t before:border-line-hairline",
  "[[data-slot=choice-list-item]+&]:before:block [[data-slot=choice-list-section]+&]:before:block",
];

export const choiceList = tv({
  slots: {
    root: ["grid min-w-0 gap-2"],
    searchInput: ["[&::-webkit-search-cancel-button]:appearance-none"],
    frame: [
      "flex min-w-0 flex-col overflow-hidden",
      "rounded-container border border-line-hairline bg-layer-card",
    ],
    scroller: ["min-h-0 min-w-0"],
    rows: ["isolate grid grid-cols-[minmax(0,1fr)_auto] gap-0"],
    group: ["col-span-2 col-start-1 grid grid-cols-subgrid grid-rows-subgrid gap-0"],
    section: ["col-span-2 col-start-1 grid grid-cols-subgrid grid-rows-subgrid"],
    heading: [
      "col-span-2 px-3.5 pt-2 pb-1",
      "font-sans text-caption font-bold text-foreground-hint",
    ],
    item: [
      "relative col-span-2 flex min-w-0 items-start gap-2.5 px-3.5",
      ...hairline,
      "min-h-option py-option-inset",
      "pointer-coarse:min-h-11 pointer-coarse:py-[calc((--spacing(11)-1lh)/2)]",
      "text-left font-sans text-subhead",
      "not-data-disabled:hover:bg-brand-soft not-data-disabled:active:overlay-medium",
      "data-disabled:cursor-not-allowed",
    ],
    media: ["flex h-lh shrink-0 items-center"],
    body: ["grid min-w-0 flex-1 gap-0.5"],
    label: ["truncate font-semibold text-foreground", "in-data-disabled:text-foreground-disabled"],
    description: [
      "block truncate font-sans text-footnote font-normal text-foreground-muted",
      "in-data-disabled:text-foreground-disabled",
    ],
    action: [
      "relative col-start-2 flex h-lh items-center self-start pr-2",
      "mt-option-inset pointer-coarse:mt-[calc((--spacing(11)-1lh)/2)]",
      "font-sans text-subhead",
    ],
    note: ["px-3.5 py-2 font-sans text-callout text-foreground-hint"],
    footer: ["shrink-0 border-t border-line-seam p-1"],
  },
  variants: {
    scroll: {
      true: { scroller: ["max-h-72 overflow-y-auto overscroll-contain"] },
    },
    fill: {
      true: {
        root: ["flex min-h-0 flex-1 flex-col"],
        frame: ["min-h-0 flex-1"],
        scroller: ["flex-1 overflow-y-auto overscroll-contain"],
      },
    },
    hasAction: {
      true: { item: ["pr-12"] },
    },
  },
});
