import { tv } from "../../lib/tv";

export const search = tv({
  slots: {
    frame: "flex h-full min-h-0 flex-1 flex-col",
    header: "flex items-center gap-3",
    content: "relative flex min-h-0 min-w-0 flex-1 flex-col",
    headerIconChip: "flex size-9 shrink-0 items-center justify-center",
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
        header: [
          "h-[62px] px-5 border-b-2 border-black bg-white",
          "[@media(max-height:600px)]:h-[62px]!",
        ],
        headerIconChip: "border-2 border-black bg-soft-signal",
        filtersRow: "border-b-2 border-black bg-white",
        viewport: "bg-white",
        summary: ["font-bold uppercase tracking-widest text-black/60"],
        sectionHeading: [
          "font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-black/50",
        ],
      },
      elegant: {
        frame: "bg-layer-canvas-muted dark:bg-layer-canvas-muted",
        header: [
          "min-h-(--shell-header-height,56px)",
          "max-md:h-[var(--shell-header-height,56px)] max-md:bg-layer-canvas-muted dark:bg-layer-canvas-muted",
          "max-md:pl-5 max-md:pr-3.5 md:pl-9 md:pr-5",
        ],
        headerIconChip: "rounded-md bg-fill-muted text-foreground-icon",
        filtersRow: [
          "border-b border-line-muted bg-layer-panel",
          "px-7 max-md:pl-5 max-md:pr-3.5",
          "dark:bg-transparent",
        ],
        viewport: ["bg-layer-panel dark:bg-transparent", "px-7 max-md:pl-5 max-md:pr-3.5"],
        summary: ["font-medium", "text-foreground-muted"],
        section: [
          "rounded-[10px] bg-[color-mix(in_oklch,var(--ink-4),var(--layer-panel))] p-3 shadow-raft-xs",
          "dark:bg-layer-card",
        ],
        sectionHeading: ["px-0 pt-0 pb-2.5 text-xs font-medium", "text-foreground-muted"],
        list: ["gap-2.5"],
      },
    },
  },
});
