import { tv } from "../../lib/tv";

export const taskBoardColumn = tv({
  slots: {
    root: "group flex w-80 shrink-0 self-start flex-col p-3",
    trigger: [
      "group flex w-full touch-manipulation items-center justify-between gap-3 text-left outline-none",
      "data-[panel-open]:mb-3",
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
    items: ["flex flex-col gap-2.5"],
    empty: ["px-3 py-5", "group-data-[drop-state=allowed]:hidden"],
    emptyIdle: ["group-data-[drop-state=allowed]:hidden group-data-[drop-state=blocked]:hidden"],
    emptyAllowed: ["hidden group-data-[drop-state=allowed]:block"],
    emptyBlocked: ["hidden group-data-[drop-state=blocked]:block"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-2 border-line-strong/20 bg-layer-panel/30 transition-colors",
          "data-[drop-state=allowed]:border-line-strong data-[drop-state=allowed]:bg-primary/20 data-[drop-state=allowed]:shadow-raft-sm",
          "data-[drop-state=blocked]:border-danger data-[drop-state=blocked]:bg-danger-soft",
          "has-[[data-slot=task-drop-placeholder][data-drop-state=allowed]]:border-line-strong has-[[data-slot=task-drop-placeholder][data-drop-state=allowed]]:bg-primary/20 has-[[data-slot=task-drop-placeholder][data-drop-state=allowed]]:shadow-raft-sm",
          "has-[[data-slot=task-drop-placeholder][data-drop-state=blocked]]:border-danger has-[[data-slot=task-drop-placeholder][data-drop-state=blocked]]:bg-danger-soft",
        ],
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
          "group-data-[drop-state=allowed]:border-line-strong group-data-[drop-state=allowed]:text-foreground-strong/60",
          "group-data-[drop-state=blocked]:border-danger group-data-[drop-state=blocked]:text-danger-strong",
        ],
      },
      elegant: {
        root: [
          "rounded-[10px] bg-[color-mix(in_oklch,var(--ink-4),var(--layer-panel))]",
          "dark:bg-layer-card",
          "data-[drop-collapsed=true]:data-[drop-state=allowed]:[outline:1px_dashed_var(--line-muted)]",
        ],
        heading: ["gap-1.5"],
        trigger: [
          "rounded-md pl-3 pr-0",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-transparent",
          "focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-layer-panel",
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
          "rounded-lg border border-dashed border-line-muted bg-layer-panel",
          "text-[13px] leading-4.5 text-foreground-placeholder",
          "group-data-[drop-state=blocked]:border-danger/40 group-data-[drop-state=blocked]:text-danger-strong",
        ],
      },
    },
  },
});
