import { tv } from "../../lib/tv";

export const textSelectionToolbar = tv({
  slots: {
    toolbar: [
      "flex min-w-0 items-center select-none",
      "gap-1 overflow-visible rounded-container p-1 text-control font-bold",
      "bg-layer-popover ring-1 ring-line-seam ring-inset shadow-float",
    ],
    button: [
      "flex shrink-0 items-center gap-1.5 outline-none transition-colors",
      "h-7 rounded-chip px-2.5 whitespace-nowrap text-foreground",
      "hover:bg-fill-medium active:bg-fill-medium",
      "focus-visible:shadow-focus",
      "[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-foreground-muted",
    ],
    separator: ["w-px shrink-0", "h-5 bg-line-hairline"],
  },
});
