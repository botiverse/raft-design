import { tv } from "../../lib/tv";

export const taskListSection = tv({
  slots: {
    root: ["space-y-2"],
    trigger: [
      "group flex w-full touch-manipulation items-center text-left outline-none",
      "disabled:cursor-default",
      "min-h-8 justify-start gap-2 rounded-control",
      "font-sans text-footnote font-bold text-foreground-hint",
      "focus-visible:shadow-focus",
    ],
    heading: ["flex min-w-0 items-center", "gap-2"],
    badge: [
      "inline-flex items-center gap-2 p-0",
      "font-sans text-footnote font-bold text-foreground-hint",
      "[&>svg]:shrink-0",
    ],
    count: ["font-mono text-mono-meta font-normal text-foreground-hint"],
    chevron: [
      "inline-flex shrink-0 -rotate-90 items-center transition-transform",
      "[&_svg]:size-3.5",
      "group-data-panel-open:rotate-0",
      "motion-reduce:transition-none",
      "-order-1 text-foreground-hint",
      "group-hover:text-foreground",
    ],
    panel: ["data-ending-style:hidden"],
    items: ["space-y-2"],
    empty: [
      "px-3",
      "flex min-h-16 items-center justify-center py-3",
      "rounded-container border border-dashed border-line-seam",
      "text-center text-footnote text-foreground-hint",
    ],
  },
});
