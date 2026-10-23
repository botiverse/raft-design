import { tv } from "../../lib/tv";

export const choiceList = tv({
  slots: {
    root: ["grid min-w-0 gap-2"],
    searchInput: ["[&::-webkit-search-cancel-button]:appearance-none"],
    frame: ["min-w-0 rounded-container border border-line-hairline bg-layer-card p-1"],
    rows: ["grid grid-cols-[minmax(0,1fr)_auto] gap-x-0 gap-y-0.5"],
    group: ["col-span-2 col-start-1 grid grid-cols-subgrid grid-rows-subgrid gap-x-0 gap-y-0.5"],
    item: [
      "col-span-2 flex min-w-0 items-start gap-2.5 rounded-chip px-2.5",
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
      "relative z-10 col-start-2 flex h-lh items-center self-start pr-1",
      "mt-option-inset pointer-coarse:mt-[calc((--spacing(11)-1lh)/2)]",
      "font-sans text-subhead",
    ],
    note: ["px-2.5 py-2 font-sans text-callout text-foreground-hint"],
  },
  variants: {
    scroll: {
      true: { frame: ["max-h-72 overflow-y-auto overscroll-contain"] },
    },
    hasAction: {
      true: { item: ["pr-11"] },
    },
  },
});
