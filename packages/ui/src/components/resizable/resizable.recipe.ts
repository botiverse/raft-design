import { tv } from "../../lib/tv";

export const resizable = tv({
  slots: {
    group: ["flex size-full  min-h-0 min-w-0", "data-[orientation=vertical]:flex-col"],
    panel: ["min-h-0 min-w-0"],
    handle: [
      "right-0 z-10 cursor-ew-resize touch-none select-none",
      "relative -mr-3 flex w-3 shrink-0 items-center justify-center pointer-coarse:-mr-6 pointer-coarse:w-6",
      "before:pointer-events-none before:absolute before:transition-colors before:content-['']",
      "focus-visible:outline-none focus-visible:before:outline-2 focus-visible:before:outline-offset-2 focus-visible:before:outline-foreground",
      "data-[orientation=horizontal]:-mb-3 data-[orientation=horizontal]:mr-0 data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:w-full data-[orientation=horizontal]:cursor-ns-resize pointer-coarse:data-[orientation=horizontal]:-mb-6 pointer-coarse:data-[orientation=horizontal]:mr-0 pointer-coarse:data-[orientation=horizontal]:h-6",
      "bg-transparent",
      "before:top-0 before:-left-px before:h-full before:w-px before:translate-none before:rounded-none",
      "before:bg-transparent",
      "hover:before:bg-foreground-muted",
      "data-[separator=active]:before:bg-foreground-muted",
      "focus-visible:keyboard:before:w-0.5 focus-visible:keyboard:before:bg-foreground focus-visible:before:outline-none",
      "data-[orientation=horizontal]:before:-top-px data-[orientation=horizontal]:before:left-0",
      "data-[orientation=horizontal]:before:h-px data-[orientation=horizontal]:before:w-full",
      "data-[orientation=horizontal]:focus-visible:keyboard:before:h-0.5",
    ],
  },
});
