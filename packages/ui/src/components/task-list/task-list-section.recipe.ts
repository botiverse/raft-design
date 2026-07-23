import { tv } from "../../lib/tv";

export const taskListSection = tv({
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
  },
  variants: {
    theme: {
      brutal: {
        root: ["space-y-2.5"],
        trigger: [
          "group flex w-full touch-manipulation items-center justify-between gap-3 text-left outline-none",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
          "disabled:cursor-default",
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
        ],
      },
      elegant: {},
    },
  },
});
