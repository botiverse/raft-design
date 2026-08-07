import { tv } from "../../lib/tv";

export const taskListSection = tv({
  slots: {
    root: ["space-y-3.5"],
    trigger: [
      "group flex w-full touch-manipulation items-center justify-between gap-3 text-left outline-none",
      "disabled:cursor-default",
    ],
    heading: ["flex min-w-0 items-center gap-2"],
    badge: ["px-2 py-0.5", "text-[10px]"],
    count: ["text-xs leading-4"],
    chevron: [
      "inline-flex shrink-0 -rotate-90 items-center transition-transform",
      "[&_svg]:size-3.5",
      "group-data-panel-open:rotate-0",
      "motion-reduce:transition-none",
    ],
    panel: ["data-ending-style:hidden"],
    items: ["space-y-2.5"],
    empty: ["px-3 py-5"],
  },
  variants: {
    theme: {
      brutal: {
        trigger: [
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
        ],
        badge: [
          "inline-flex items-center gap-1 border border-line-strong",
          "font-heading font-bold uppercase text-foreground-strong",
          "[&_svg]:size-2.5 [&_svg]:shrink-0 [&_svg]:text-foreground-strong",
        ],
        count: ["font-mono text-foreground-strong/50"],
        chevron: ["text-foreground-strong/50", "group-hover:text-foreground-strong"],
        empty: [
          "border-2 border-dashed border-line-strong/20",
          "text-sm leading-5 text-foreground-strong/40",
        ],
      },
      elegant: {
        root: [
          "rounded-[10px] bg-[color-mix(in_oklch,var(--ink-4),var(--layer-panel))] p-3 shadow-raft-xs",
          "dark:bg-layer-card",
        ],
        items: ["[&_[data-slot=task-card]:hover]:bg-ink-2/3"],
        heading: ["gap-1.5"],
        trigger: [
          "rounded-md pl-0.5 pr-[5px]",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-transparent",
          "focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-layer-canvas-muted",
          "dark:focus-visible:ring-offset-layer-card",
          "forced-colors:focus-visible:outline-[CanvasText]",
        ],
        badge: [
          "inline-flex items-center gap-1.5 px-0 py-0",
          "font-sans text-xs leading-4 font-medium text-foreground-muted",
          "[&_svg]:size-3.5 [&_svg]:shrink-0",
        ],
        count: ["font-sans font-medium tabular-nums text-foreground-placeholder"],
        chevron: ["text-foreground-icon", "group-hover:text-foreground-strong"],
        empty: [
          "rounded-lg border border-dashed border-line-muted bg-fill-muted",
          "text-[13px] leading-4.5 text-foreground-placeholder",
        ],
      },
    },
  },
});
