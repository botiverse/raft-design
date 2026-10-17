import { tv } from "../../lib/tv";

export const messageTextSelectionToolbar = tv({
  slots: {
    toolbar: ["flex min-w-0 items-center select-none overflow-hidden text-xs"],
    button: ["flex h-7 items-center gap-1.5 px-2 outline-none transition-colors"],
    separator: ["w-px"],
  },
  variants: {
    theme: {
      brutal: {
        toolbar: "border-2 border-black bg-white font-semibold shadow-raft-sm",
        button: "text-black hover:bg-primary/30 focus-visible:bg-primary/30",
        separator: "bg-black/20",
      },
      elegant: {
        toolbar: [
          "gap-1 rounded-lg border-[0.5px] border-line-muted bg-layer-panel p-1 font-medium shadow-raft-xs",
          "dark:border-transparent",
        ],
        button: [
          "rounded-sm text-foreground-muted",
          "hover:bg-fill-muted hover:text-foreground",
          "focus-visible:bg-fill-muted focus-visible:text-foreground",
        ],
        separator: "hidden",
      },
      raft: {
        toolbar: [
          "gap-0.5 overflow-visible rounded-control p-[3px] text-footnote font-bold",
          "bg-layer-popover ring-1 ring-line-seam shadow-raft-float",
        ],
        button: [
          "h-8 rounded-control px-2.5 text-foreground",
          "hover:bg-fill-pressed active:bg-fill-pressed",
          "focus-visible:shadow-raft-focus",
          "[&_svg]:size-4 [&_svg]:text-foreground-icon",
        ],
        separator: "mx-0.5 h-5 bg-line-muted",
      },
    },
  },
});
