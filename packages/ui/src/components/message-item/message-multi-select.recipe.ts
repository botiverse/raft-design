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
      "gap-2 rounded-container py-1 pr-1 pl-2.5",
      "**:data-[slot=button]:h-7 **:data-[slot=button]:w-auto **:data-[slot=button]:min-w-7",
      "**:data-[slot=button]:rounded-chip",
      "**:data-[slot=button]:after:inset-x-[-3px] **:data-[slot=button]:first:after:left-[-9.5px] **:data-[slot=button]:last:after:right-[-9.5px]",
      "pointer-coarse:**:data-[slot=button]:after:inset-y-[-9.5px]",
      "bg-layer-popover ring-1 ring-line-seam shadow-float",
    ],
    toolbarActions: ["flex min-w-0 flex-1 flex-wrap items-center justify-end", "gap-1"],
  },
});
