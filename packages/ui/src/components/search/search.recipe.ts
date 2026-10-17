import { tv } from "../../lib/tv";

export const search = tv({
  slots: {
    frame: "flex h-full min-h-0 flex-1 flex-col",
    filtersRow: "shrink-0 px-4 py-3",
    viewport: ["min-h-0 flex-1 overflow-y-auto p-4"],
    summary: ["mb-3 block px-1 text-xs"],
    section: ["mb-3"],
    sectionHeading: ["px-1 py-2"],
    list: ["flex flex-col gap-2"],
  },
  variants: {
    theme: {
      brutal: {
        frame: "bg-white",
        filtersRow: "border-b-2 border-black bg-white",
        viewport: "bg-white",
        summary: ["font-bold uppercase tracking-widest text-black/60"],
        sectionHeading: [
          "font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black/50",
        ],
      },
      elegant: {
        frame: "bg-layer-canvas-muted dark:bg-layer-canvas-muted",
        filtersRow: [
          "relative z-10 border-b border-line-muted bg-layer-panel",
          "px-3 py-2 max-md:pl-5 max-md:pr-3.5",
          "dark:bg-transparent",
        ],
        viewport: ["bg-layer-panel dark:bg-transparent", "px-3 py-3 max-md:pl-5 max-md:pr-3.5"],
        summary: ["font-medium", "text-foreground-muted"],
        section: [
          "rounded-container bg-[color-mix(in_oklch,var(--ink-4),var(--layer-panel))] p-3 shadow-raft-xs",
          "dark:bg-layer-card",
        ],
        sectionHeading: ["px-0 pt-0 pb-2.5 text-xs font-medium", "text-foreground-muted"],
        list: ["gap-1.5"],
      },
      raft: {
        frame: "bg-layer-panel text-foreground",
        filtersRow: ["border-b border-line-seam bg-layer-panel px-4 py-3"],
        viewport: ["bg-layer-panel px-0 pt-0 pb-4"],
        summary: ["mb-0 px-4 pt-2 font-sans text-footnote text-foreground-hint"],
        section: ["mb-0"],
        sectionHeading: [
          "flex items-center gap-2 px-4 pt-5 pb-2",
          "font-sans text-footnote font-bold text-foreground-hint",
        ],
        list: ["gap-0"],
      },
    },
  },
});
