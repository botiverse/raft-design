import { tv } from "../../lib/tv";

export const resizable = tv({
  slots: {
    group: ["flex h-full w-full min-h-0 min-w-0", "data-[orientation=vertical]:flex-col"],
    panel: ["min-h-0 min-w-0"],
    handle: [
      "right-0 z-10 cursor-col-resize select-none",
      "relative -ml-px flex w-px shrink-0 items-center justify-center",
      "bg-transparent outline-none ring-offset-background",
      "after:absolute after:inset-y-0 after:left-1/2 after:w-3 after:-translate-x-1/2",
      "focus-visible:ring-1 focus-visible:ring-line-focus",
      "data-[orientation=horizontal]:-mt-px data-[orientation=horizontal]:ml-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=horizontal]:cursor-row-resize",
      "data-[orientation=horizontal]:after:inset-x-0 data-[orientation=horizontal]:after:top-1/2",
      "data-[orientation=horizontal]:after:h-3 data-[orientation=horizontal]:after:w-full",
      "data-[orientation=horizontal]:after:translate-x-0 data-[orientation=horizontal]:after:-translate-y-1/2",
    ],
  },
  variants: {
    theme: {
      brutal: {
        handle: "hover:bg-black/10",
      },
      elegant: {
        handle: "hover:bg-layer-muted",
      },
    },
  },
});
