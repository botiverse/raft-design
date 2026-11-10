import { tv } from "../../lib/tv";

export const fitToolbar = tv({
  slots: {
    root: [
      "flex min-w-0 max-w-full flex-nowrap items-center",
      "data-fit-wrapping:flex-wrap data-fit-wrapping:gap-y-0",
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
    plus: ["hidden in-data-fit-plus:block"],
    scroller: [],
    scrollContent: [],
  },
  variants: {
    scroll: {
      true: {
        group: ["block min-w-0 flex-1 shrink basis-0"],
        scroller: ["-my-1.5 w-full gap-[inherit] scroll-px-6 mask-fade-x"],
        scrollContent: ["flex w-max items-center gap-[inherit] py-1.5"],
      },
    },
  },
});
