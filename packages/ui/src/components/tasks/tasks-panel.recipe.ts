import { tv } from "../../lib/tv";

export const tasksPanel = tv({
  slots: {
    root: ["flex min-h-0 min-w-0 flex-1 flex-col bg-layer-panel", "dark:bg-transparent"],
    toolbar: [
      "grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2",
      "px-4 py-3",
      "md:flex md:flex-wrap md:items-center md:justify-between",
    ],
    toolbarGroup: ["flex flex-wrap items-center gap-2"],
    toolbarNewTask: [
      "col-start-1 row-start-1 justify-self-start",
      "flex flex-wrap items-center gap-2",
    ],
    toolbarFilters: [
      "col-span-2 row-start-2 min-w-0",
      "only:col-auto only:row-auto",
      "md:mr-auto",
      "flex flex-wrap items-center gap-2",
    ],
    toolbarView: ["col-start-2 row-start-1 justify-self-end", "flex flex-wrap items-center gap-2"],
    toolbarLabel: [
      "inline-flex items-center text-xs leading-4",
      "[&_svg]:size-3.5 [&_svg]:shrink-0 [&>svg:last-child]:size-3",
    ],
    viewport: [
      "min-h-0 flex-1 overflow-auto overscroll-contain p-4",
      "pb-[calc(1rem+env(safe-area-inset-bottom,0px))]",
    ],
    empty: ["flex h-full flex-col items-center justify-center"],
  },
  variants: {
    theme: {
      brutal: {
        toolbar: ["border-b-2 border-line-strong bg-layer-panel"],
        toolbarLabel: [
          "gap-2 border-2 border-line-muted bg-layer-panel px-3 py-1.5",
          "font-heading font-bold text-foreground-strong/70",
        ],
        viewport: ["bg-layer-panel"],
      },
      elegant: {
        toolbar: [
          "border-b border-line-muted bg-layer-panel px-7",
          "max-md:pl-5 max-md:pr-3.5",
          "dark:bg-transparent",
        ],
        toolbarLabel: [
          "gap-1.5 rounded-sm border border-transparent bg-transparent px-2.5 py-[7px]",
          "shadow-[inset_0_1px_0.5px_oklch(1_0_0/0.05),0_0_0_1px_var(--line-muted)]",
          "font-sans font-medium text-foreground-muted",
        ],
        toolbarView: ["[&_[data-slot=tabs-list]]:gap-2"],
        viewport: ["bg-layer-panel px-7", "max-md:pl-5 max-md:pr-3.5", "dark:bg-transparent"],
      },
      raft: {
        root: ["bg-layer-panel text-foreground", "dark:bg-layer-panel"],
        toolbar: ["min-h-14 border-b border-line-seam bg-layer-panel px-5 py-3", "max-md:px-4"],
        toolbarLabel: [
          "h-8 gap-1.5 rounded-control px-2.5",
          "bg-transparent shadow-[inset_0_0_0_1px_var(--line-seam)]",
          "font-sans text-footnote font-semibold text-foreground-muted whitespace-nowrap",
        ],
        viewport: ["bg-layer-panel px-5", "max-md:px-4"],
      },
    },
  },
});
