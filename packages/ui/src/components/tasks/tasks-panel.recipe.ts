import { tv } from "../../lib/tv";

export const tasksPanel = tv({
  slots: {
    root: ["flex min-h-0 min-w-0 flex-1 flex-col", "bg-layer-canvas text-foreground"],
    toolbar: [
      "grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2",
      "md:flex md:flex-wrap md:items-center md:justify-between",
      "min-h-14 border-b border-line-seam bg-layer-canvas px-5 py-3",
      "max-md:px-4",
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
      "inline-flex items-center",
      "[&_svg]:size-3.5 [&_svg]:shrink-0 [&>svg:last-child]:size-3",
      "h-8 gap-1.5 rounded-control px-2.5",
      "bg-transparent inset-ring inset-ring-line-seam",
      "font-sans text-footnote font-semibold text-foreground-muted whitespace-nowrap",
    ],
    viewport: [
      "min-h-0 flex-1 overflow-auto overscroll-contain p-4",
      "pb-[calc(1rem+env(safe-area-inset-bottom,0px))]",
      "bg-layer-canvas px-5",
      "max-md:px-4",
    ],
    empty: ["flex h-full flex-col items-center justify-center"],
  },
});
