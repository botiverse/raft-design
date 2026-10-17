import { tv } from "../../lib/tv";

export const resizable = tv({
  slots: {
    group: ["flex size-full  min-h-0 min-w-0", "data-[orientation=vertical]:flex-col"],
    panel: ["min-h-0 min-w-0"],
    handle: [
      "right-0 z-10 cursor-ew-resize touch-none select-none",
      "relative -ml-1.5 -mr-1.5 flex w-3 shrink-0 items-center justify-center",
      "before:pointer-events-none before:absolute before:top-1/2 before:left-1/2 before:h-6 before:w-1 before:-translate-1/2  before:rounded-full before:transition-colors before:content-['']",
      "focus-visible:outline-none focus-visible:before:outline-2 focus-visible:before:outline-offset-2 focus-visible:before:outline-foreground-strong",
      "data-[orientation=horizontal]:-mt-1.5 data-[orientation=horizontal]:-mb-1.5 data-[orientation=horizontal]:ml-0 data-[orientation=horizontal]:mr-0 data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:cursor-ns-resize",
      "data-[orientation=horizontal]:before:top-1/2 data-[orientation=horizontal]:before:left-1/2 data-[orientation=horizontal]:before:h-1 data-[orientation=horizontal]:before:w-6",
    ],
  },
  variants: {
    theme: {
      brutal: {
        handle: [
          "bg-transparent before:bg-black/10",
          "hover:before:bg-black/20",
          "data-[separator=active]:before:bg-black/20",
          "focus-visible:before:bg-black/20",
        ],
      },
      raft: {
        handle: [
          "bg-transparent",
          "before:top-0 before:left-[5px] before:h-full before:w-px before:translate-none before:rounded-none",
          "before:bg-transparent",
          "hover:before:bg-foreground-muted",
          "data-[separator=active]:before:bg-foreground-muted",
          "focus-visible:before:w-0.5 focus-visible:before:bg-foreground focus-visible:before:outline-none",
          "data-[orientation=horizontal]:before:top-[5px] data-[orientation=horizontal]:before:left-0",
          "data-[orientation=horizontal]:before:h-px data-[orientation=horizontal]:before:w-full",
          "data-[orientation=horizontal]:focus-visible:before:h-0.5",
        ],
      },
      elegant: {
        handle: [
          "bg-transparent before:bg-ink-10",
          "hover:before:bg-ink-20",
          "data-[separator=active]:before:bg-ink-20",
          "focus-visible:before:bg-ink-20",
        ],
      },
    },
  },
});
