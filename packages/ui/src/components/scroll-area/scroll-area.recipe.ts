import { tv } from "../../lib/tv";

export const scrollArea = tv({
  slots: {
    root: ["relative min-h-0"],
    viewport: [
      "size-full min-h-0 overscroll-contain outline-none",
      "[overflow-anchor:auto] [-webkit-overflow-scrolling:touch]",
    ],
    content: ["min-h-full"],
    scrollbar: [
      "group/scroll-area-scrollbar z-50 flex touch-none select-none p-1",
      "opacity-0 transition-opacity duration-150 pointer-events-none",
      "data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0",
      "data-[orientation=vertical]:w-3 data-[orientation=vertical]:justify-center",
      "data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:justify-center",
    ],
    thumb: [
      "relative rounded-full",
      "group-data-[orientation=vertical]/scroll-area-scrollbar:w-1.5",
      "group-data-[orientation=horizontal]/scroll-area-scrollbar:h-1.5",
    ],
    corner: ["bg-transparent"],
  },
  variants: {
    theme: {
      brutal: {
        thumb: ["bg-black/35 hover:bg-black/55"],
      },
      elegant: {
        thumb: ["bg-foreground-muted/35 hover:bg-foreground-muted/55"],
      },
      raft: {
        thumb: ["rounded-[2px] bg-foreground/30 hover:bg-foreground/45"],
      },
    },
  },
});
