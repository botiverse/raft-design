import { tv } from "../../lib/tv";

export const messageMultiSelect = tv({
  slots: {
    root: ["flex min-h-0 min-w-0 flex-1 flex-col"],
    checkbox: [
      "self-start",
      "data-checked:shadow-none data-indeterminate:shadow-none",
      "hover:data-checked:shadow-none hover:data-indeterminate:shadow-none",
      "mt-2 rounded-sticker",
    ],
    toolbar: [
      "flex items-center",
      "gap-2 rounded-container px-2.5 py-2",
      "bg-layer-popover ring-1 ring-line-seam shadow-raft-float",
    ],
  },
});
