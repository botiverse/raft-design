import { tv } from "../../lib/tv";

export const messageTextSelectionToolbar = tv({
  slots: {
    toolbar: [
      "flex min-w-0 items-center select-none",
      "gap-0.5 overflow-visible rounded-control p-[3px] text-footnote font-bold",
      "bg-layer-popover ring-1 ring-line-seam shadow-raft-float",
    ],
    button: [
      "flex items-center gap-1.5 outline-none transition-colors",
      "h-8 rounded-control px-2.5 text-foreground",
      "hover:bg-fill-pressed active:bg-fill-pressed",
      "focus-visible:shadow-raft-focus",
      "[&_svg]:size-4 [&_svg]:text-foreground-icon",
    ],
    separator: ["w-px", "mx-0.5 h-5 bg-line-muted"],
  },
});
