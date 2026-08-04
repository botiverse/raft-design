import { tv } from "../../lib/tv";

export const messageList = tv({
  slots: {
    root: ["relative h-full min-h-0"],
    viewport: ["min-w-0 overscroll-none"],
    content: ["flex min-h-full w-full min-w-0 flex-col"],
    dateDividerRoot: ["flex select-none items-center px-3 py-2"],
    dateDividerRule: ["flex-1"],
    dateDividerChip: ["inline-flex items-center"],
    notice: ["text-center"],
    historyLimited: ["inline-flex items-center gap-1.5"],
  },
  variants: {
    theme: {
      brutal: {
        dateDividerRule: "translate-y-px border-t-2 border-black/15",
        dateDividerChip: "px-2 text-[10px] font-bold uppercase tracking-widest text-black/50",
        notice: "pb-2 font-mono text-xs",
        historyLimited: "border border-black/20 bg-white/70 px-2 py-1 [&_svg]:size-3",
      },
      elegant: {
        content: "md:pb-[var(--panel-footer-clearance)]",
        dateDividerRoot: "opacity-70",
        dateDividerRule: "border-t border-line-hairline",
        dateDividerChip:
          "px-2 font-mono text-[11px] font-normal uppercase tracking-widest text-foreground-muted",
        notice: "pb-2 font-sans text-xs",
        historyLimited:
          "rounded border border-line-muted bg-layer-panel/70 px-2 py-1 [&_svg]:size-3",
      },
    },
    tone: {
      faint: {
        notice: "text-foreground-strong/40",
      },
      muted: {
        notice: "text-foreground-strong/50",
      },
    },
  },
  defaultVariants: {
    tone: "faint",
  },
});
