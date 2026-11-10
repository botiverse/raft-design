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
      "data-fit-more:hidden",
    ],
    label: ["in-data-fit-label:sr-only"],
  },
  variants: {
    scroll: {
      true: {
        group: [
          "min-w-0 flex-1 shrink basis-0 overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-none",
          "-my-1.5 py-1.5 scroll-px-6 mask-fade-x",
        ],
      },
    },
  },
});
