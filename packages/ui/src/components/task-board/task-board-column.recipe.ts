import { tv } from "../../lib/tv";

export const taskBoardColumn = tv({
  slots: {
    root: [
      "group flex shrink-0 self-start flex-col",
      "w-[232px] grow rounded-container p-0",
      "data-[drop-collapsed=true]:data-[drop-state=allowed]:[outline:1.5px_dashed_var(--line-strong)] data-[drop-collapsed=true]:data-[drop-state=allowed]:outline-offset-4",
    ],
    trigger: [
      "group flex w-full touch-manipulation items-center justify-between text-left outline-none",
      "min-h-8 gap-2 rounded-control",
      "font-sans text-footnote font-bold text-foreground-muted",
      "data-[panel-open]:mb-2",
      "focus-visible:shadow-focus",
    ],
    heading: ["flex min-w-0 items-center", "gap-2"],
    badge: [
      "inline-flex items-center gap-2 p-0",
      "font-sans text-footnote font-bold text-foreground-muted",
      "[&>svg]:shrink-0",
    ],
    count: ["font-mono text-mono-meta font-normal text-foreground-hint"],
    chevron: [
      "inline-flex shrink-0 -rotate-90 items-center transition-transform",
      "[&_svg]:size-3.5",
      "group-data-panel-open:rotate-0",
      "motion-reduce:transition-none",
      "text-foreground-hint",
      "group-hover:text-foreground",
    ],
    panel: ["data-ending-style:hidden"],
    items: ["flex flex-col", "gap-2"],
    empty: [
      "px-3",
      "group-data-[drop-state=allowed]:hidden",
      "flex min-h-16 items-center justify-center py-3",
      "rounded-container border border-dashed border-line-seam",
      "text-center text-footnote text-foreground-hint",
      "group-data-[drop-state=blocked]:text-foreground-muted",
    ],
    emptyIdle: ["group-data-[drop-state=allowed]:hidden group-data-[drop-state=blocked]:hidden"],
    emptyAllowed: ["hidden group-data-[drop-state=allowed]:block"],
    emptyBlocked: ["hidden group-data-[drop-state=blocked]:block"],
  },
});
