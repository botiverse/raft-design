import { tv } from "../../lib/tv";

export const messageTextSelectionToolbar = tv({
  slots: {
    toolbar: [
      "flex min-w-0 items-center select-none",
      "gap-0.5 overflow-visible rounded-container p-0.5 text-footnote font-bold",
      "bg-layer-popover ring-1 ring-line-seam ring-inset shadow-float",
    ],
    button: [
      "flex shrink-0 items-center gap-1.5 outline-none transition-colors",
      "h-7 rounded-control px-2.5 whitespace-nowrap text-foreground",
      "hover:bg-fill-pressed active:bg-fill-pressed",
      "focus-visible:shadow-focus",
      "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-foreground-muted",
    ],
    separator: ["w-px shrink-0", "mx-0.5 h-5 bg-line-hairline"],
  },
});
