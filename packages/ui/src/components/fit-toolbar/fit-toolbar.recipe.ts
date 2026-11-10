import { tv } from "../../lib/tv";

export const fitToolbar = tv({
  slots: {
    root: [
      "flex min-w-0 max-w-full flex-nowrap items-center",
      "data-fit-wrapping:flex-wrap data-fit-wrapping:gap-y-0",
      "data-fit-search:relative",
      "data-fit-search:[--fit-scroll-grow:0] data-fit-search:[--fit-scroll-basis:auto]",
    ],
    group: [
      "group/fit-group flex shrink-0 flex-nowrap items-center",
      "data-fit-wrap:mt-(--fit-gap)",
      "data-fit-more:hidden",
    ],
    full: ["contents group-data-fit-collapse/fit-group:hidden"],
    short: ["hidden group-data-fit-collapse/fit-group:contents"],
    button: [
      "data-fit-label:w-8 data-fit-label:px-0 md:pointer-fine:data-fit-label:w-(--control-height)",
      "data-fit-plus:w-8 data-fit-plus:px-0 md:pointer-fine:data-fit-plus:w-(--control-height)",
      "data-fit-more:hidden",
    ],
    split: ["data-fit-more:hidden"],
    splitMain: [
      "in-data-fit-label:w-8 in-data-fit-label:px-0 md:pointer-fine:in-data-fit-label:w-(--control-height)",
      "in-data-fit-plus:w-8 in-data-fit-plus:px-0 md:pointer-fine:in-data-fit-plus:w-(--control-height)",
    ],
    label: ["in-data-fit-label:sr-only in-data-fit-plus:sr-only"],
    icon: ["contents in-data-fit-plus:hidden"],
    fullIcon: ["contents in-data-fit-label:hidden"],
    collapsedIcon: ["hidden in-data-fit-label:contents"],
    picker: ["data-fit-label:gap-1 data-fit-label:px-2", "data-fit-more:hidden"],
    pickerValue: [],
    chevron: ["inline-flex"],
    plus: ["hidden in-data-fit-plus:block"],
    more: ["hidden data-fit-shown:inline-flex"],
    scroller: [],
    scrollContent: [],
    end: ["flex shrink-0 items-center gap-[inherit]"],
    search: ["contents"],
    searchButton: ["hidden order-first in-data-fit-collapse:inline-flex", "inert:invisible"],
    searchSizer: ["pointer-events-none invisible absolute inset-s-0 top-0 size-0 overflow-hidden"],
    searchSpacer: ["hidden min-w-0 flex-1 basis-0 self-stretch in-data-fit-collapse:block"],
    searchField: [
      "w-auto min-w-(--fit-search-min) flex-1 basis-0",
      "in-data-fit-collapse:not-data-open:not-focus-within:hidden",
      "in-data-fit-collapse:data-open:absolute in-data-fit-collapse:data-open:min-w-0",
      "in-data-fit-collapse:focus-within:absolute in-data-fit-collapse:focus-within:min-w-0",
    ],
    // Typed text longer than the field ends in an ellipsis. The placeholder
    // isn't cut here: FitToolbarSearch cuts it at a word itself ("Search…").
    searchInput: ["[&::-webkit-search-cancel-button]:appearance-none", "text-ellipsis"],
  },
  variants: {
    count: {
      true: { pickerValue: ["font-mono text-mono-meta"] },
    },
    scroll: {
      true: {
        group: [
          "block min-w-0 shrink grow-(--fit-scroll-grow,1) basis-(--fit-scroll-basis,0px)",
          "data-fit-wrap:grow",
        ],
        scroller: ["-my-1.5 w-full gap-[inherit] scroll-px-6 mask-fade-x"],
        scrollContent: ["flex w-max items-center gap-[inherit] py-1.5"],
      },
    },
    pinned: {
      true: {
        group: ["flex"],
        scroller: ["w-auto min-w-0 flex-auto"],
      },
    },
  },
});
