import { tv } from "../../lib/tv";

export const fitToolbar = tv({
  slots: {
    root: [
      "flex min-w-0 max-w-full flex-nowrap items-center",
      "data-fit-wrapping:flex-wrap data-fit-wrapping:gap-y-0",
      "has-data-[slot=fit-toolbar-search]:relative",
      "has-data-[slot=fit-toolbar-search]:[--fit-scroll-grow:0] has-data-[slot=fit-toolbar-search]:[--fit-scroll-basis:auto]",
    ],
    group: [
      "group/fit-group flex shrink-0 flex-nowrap items-center",
      "data-fit-wrap:mt-(--fit-gap)",
    ],
    full: ["contents group-data-fit-collapse/fit-group:hidden"],
    short: ["hidden group-data-fit-collapse/fit-group:contents"],
    button: [
      "data-fit-label:w-8 data-fit-label:px-0 md:pointer-fine:data-fit-label:w-(--control-height)",
      "data-fit-plus:w-8 data-fit-plus:px-0 md:pointer-fine:data-fit-plus:w-(--control-height)",
      "data-fit-more:hidden",
    ],
    label: ["in-data-fit-label:sr-only in-data-fit-plus:sr-only"],
    icon: ["contents in-data-fit-plus:hidden"],
    fullIcon: ["contents in-data-fit-label:hidden"],
    collapsedIcon: ["hidden in-data-fit-label:contents"],
    picker: ["data-fit-label:gap-1 data-fit-label:px-2", "data-fit-more:hidden"],
    pickerValue: [],
    chevron: ["inline-flex"],
    plus: ["hidden in-data-fit-plus:block"],
    scroller: [],
    scrollContent: [],
    search: ["contents"],
    searchButton: [
      "hidden order-first in-data-fit-collapse:inline-flex",
      "w-8 px-0 md:pointer-fine:w-(--control-height)",
      "inert:invisible",
    ],
    searchSpacer: ["hidden min-w-0 flex-1 basis-0 self-stretch in-data-fit-collapse:block"],
    searchField: [
      "w-auto min-w-(--fit-search-min) flex-1 basis-0",
      "in-data-fit-collapse:not-data-open:hidden",
      "in-data-fit-collapse:data-open:absolute in-data-fit-collapse:data-open:min-w-0",
    ],
    searchInput: ["[&::-webkit-search-cancel-button]:appearance-none"],
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
  },
});
