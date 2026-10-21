import { tv } from "../../lib/tv";

export const virtualList = tv({
  slots: {
    root: [
      "h-full max-h-[inherit] min-w-px",
      "overflow-x-hidden overflow-y-auto [overflow-anchor:none]",
      "outline-none",
    ],
    empty: [],
  },
  variants: {
    xScrollable: {
      true: { root: "overflow-x-auto" },
    },
    showScrollbar: {
      true: {},
      false: { root: "scrollbar-none [&::-webkit-scrollbar]:hidden" },
    },
    printable: {
      true: { root: "print:h-auto! print:max-h-none! print:overflow-visible!" },
    },
    emptyCentered: {
      true: {
        root: "flex flex-col",
        empty: "flex min-h-0 flex-1 items-center justify-center",
      },
    },
    iosCompensation: {
      true: { root: "overscroll-none" },
    },
  },
  defaultVariants: {
    showScrollbar: false,
  },
});
