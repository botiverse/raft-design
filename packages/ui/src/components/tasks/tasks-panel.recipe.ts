import { tv } from "../../lib/tv";

export const tasksPanel = tv({
  slots: {
    root: ["flex min-h-0 min-w-0 flex-1 flex-col bg-layer-panel"],
    toolbar: ["flex shrink-0 flex-wrap items-center justify-between gap-2", "px-4 py-3"],
    toolbarGroup: ["flex flex-wrap items-stretch gap-2", "[&>[data-slot=button]]:h-auto"],
    toolbarLabel: [
      "inline-flex items-center text-xs leading-4",
      "[&_svg]:size-3.5 [&_svg]:shrink-0 [&>svg:last-child]:size-3",
    ],
    viewport: [
      "min-h-0 flex-1 overflow-auto overscroll-contain p-4",
      "[padding-bottom:env(safe-area-inset-bottom)]",
    ],
    empty: ["flex h-full flex-col items-center justify-center"],
  },
  variants: {
    theme: {
      brutal: {
        toolbar: ["border-b-2 border-line-strong bg-layer-panel"],
        toolbarLabel: [
          "gap-2 border-2 border-line-subtle bg-layer-panel px-3 py-1.5",
          "font-heading font-bold text-foreground/70",
        ],
        viewport: ["bg-layer-panel"],
      },
      elegant: {
        toolbar: ["border-b border-line-subtle bg-layer-panel px-7"],
        toolbarLabel: [
          "gap-1.5 rounded-sm border border-transparent bg-transparent px-2.5 py-[7px]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0_/_0.05),0_0_0_1px_var(--line-subtle)]",
          "font-sans font-medium text-foreground-muted",
        ],
        viewport: ["bg-layer-panel px-7"],
      },
    },
  },
});
