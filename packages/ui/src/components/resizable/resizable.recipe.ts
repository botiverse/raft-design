import { tv } from "../../lib/tv";

export const resizable = tv({
  slots: {
    group: ["flex h-full w-full min-h-0 min-w-0", "data-[orientation=vertical]:flex-col"],
    panel: ["min-h-0 min-w-0"],
    handle: [
      "right-0 z-10 cursor-ew-resize touch-none select-none",
      "relative -ml-px flex w-px shrink-0 items-center justify-center",
      "before:pointer-events-none before:absolute before:top-1/2 before:left-[5px] before:h-6 before:w-1 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:transition-colors before:content-['']",
      "after:absolute after:inset-y-0 after:left-0 after:w-2.5 after:content-['']",
      "focus-visible:outline-none focus-visible:before:outline-2 focus-visible:before:outline-offset-2 focus-visible:before:outline-foreground-strong",
      "data-[orientation=horizontal]:-mt-px data-[orientation=horizontal]:ml-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=horizontal]:cursor-ns-resize",
      "data-[orientation=horizontal]:before:top-[5px] data-[orientation=horizontal]:before:left-1/2 data-[orientation=horizontal]:before:h-1 data-[orientation=horizontal]:before:w-6",
      "data-[orientation=horizontal]:after:inset-x-0 data-[orientation=horizontal]:after:top-0",
      "data-[orientation=horizontal]:after:h-2.5 data-[orientation=horizontal]:after:w-full",
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
