import { tv } from "../../lib/tv";

export const taskBoardColumn = tv({
  slots: {
    root: "",
    trigger: "",
    heading: "",
    badge: "",
    count: "",
    chevron: "",
    panel: "",
    items: "",
    empty: "",
    emptyIdle: "",
    emptyAllowed: "",
    emptyBlocked: "",
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "group flex w-[320px] shrink-0 self-start flex-col border-2 p-3",
          "border-line-strong/20 bg-layer-panel/30 transition-colors",
          "data-[drop-state=allowed]:border-line-strong data-[drop-state=allowed]:bg-soft-signal/20 data-[drop-state=allowed]:shadow-sm",
          "data-[drop-state=blocked]:border-danger-base data-[drop-state=blocked]:bg-danger-lighter",
        ],
        trigger: [
          "group flex w-full touch-manipulation items-center justify-between gap-3 text-left outline-none",
          "data-[panel-open]:mb-3",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
        ],
        heading: ["flex min-w-0 items-center gap-2"],
        badge: [
          "border border-line-strong px-2 py-0.5",
          "font-heading text-[10px] font-bold text-foreground",
        ],
        count: ["font-mono text-xs text-foreground/50"],
        chevron: [
          "inline-flex shrink-0 -rotate-90 items-center text-foreground/50 transition-transform [&_svg]:size-3.5",
          "group-hover:text-foreground group-data-[panel-open]:rotate-0",
          "motion-reduce:transition-none",
        ],
        panel: ["data-[ending-style]:hidden"],
        items: ["space-y-2.5"],
        empty: [
          "border-2 border-dashed border-line-strong/20 px-3 py-5",
          "text-sm text-foreground/40",
          "group-data-[drop-state=allowed]:border-line-strong group-data-[drop-state=allowed]:text-foreground/60",
          "group-data-[drop-state=blocked]:border-danger-base group-data-[drop-state=blocked]:text-danger-dark",
        ],
        emptyIdle: [
          "group-data-[drop-state=allowed]:hidden group-data-[drop-state=blocked]:hidden",
        ],
        emptyAllowed: ["hidden group-data-[drop-state=allowed]:block"],
        emptyBlocked: ["hidden group-data-[drop-state=blocked]:block"],
      },
      elegant: {},
    },
  },
});
