import { tv } from "../../lib/tv";

export const searchThread = tv({
  slots: {
    thread: ["overflow-hidden transition-colors"],
    threadHeader: ["px-3 py-2"],
    threadMeta: ["mb-1 flex flex-wrap items-center gap-2 text-[11px]"],
    threadTimestamp: ["normal-case"],
    threadTitle: ["text-sm"],
    threadMessages: ["flex flex-col [&>*:first-child]:border-t-0"],
  },
  variants: {
    theme: {
      brutal: {
        thread: [
          "border-2 border-black/30 bg-white",
          "hover:border-black hover:shadow-raft-sm",
          "data-[selected=true]:border-black data-[selected=true]:shadow-raft-sm",
        ],
        threadHeader: ["border-b-2 border-black bg-[oklch(0.96625109_0.02494438_333.728876)]"],
        threadMeta: ["font-bold uppercase tracking-wide text-black/70"],
        threadTimestamp: ["font-mono text-black/50"],
        threadTitle: ["font-bold text-black"],
      },
      elegant: {
        thread: [
          "group/thread rounded-lg border-[0.5px] border-line-muted bg-layer-panel shadow-raft-xs",
          "transition-[background-color,border-color] duration-150",
          "hover:bg-[color-mix(in_oklch,var(--ink)_1%,var(--layer-panel))]",
          "data-[selected=true]:border-transparent data-[selected=true]:ring-2 data-[selected=true]:ring-primary-400 data-[selected=true]:ring-offset-2 data-[selected=true]:ring-offset-layer-canvas-muted",
          "dark:border-transparent",
        ],
        threadHeader: ["px-3 pt-2.5 pb-2"],
        threadMeta: ["font-medium text-foreground-muted"],
        threadTimestamp: ["font-sans tabular-nums text-foreground-muted/70"],
        threadTitle: ["font-medium text-foreground-strong"],
        threadMessages: [
          "overflow-clip border-t-[0.5px] border-line-hairline bg-transparent",
          "transition-colors duration-150",
          "dark:border-ink-10",
        ],
      },
    },
  },
});
