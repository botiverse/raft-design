import { tv } from "../../lib/tv";

export const messageList = tv({
  slots: {
    root: ["relative h-full min-h-0"],
    viewport: ["min-w-0 overscroll-none"],
    content: ["flex min-h-full w-full min-w-0 flex-col"],
    dateDividerRoot: ["relative flex select-none items-center justify-center px-3 py-2"],
    dateDividerRule: ["absolute inset-x-3 top-1/2"],
    dateDividerChipWrap: ["relative"],
    dateDividerChip: ["inline-flex items-center"],
    notice: ["text-center"],
    historyLimited: ["inline-flex items-center gap-1.5"],
  },
  variants: {
    theme: {
      brutal: {
        dateDividerRule: "border-t-2 border-black/15",
        dateDividerChipWrap: "bg-white",
        dateDividerChip:
          "bg-white px-2 text-[10px] font-bold uppercase tracking-widest text-black/50",
        notice: "pb-2 font-mono text-xs",
        historyLimited: "border border-black/20 bg-white/70 px-2 py-1 [&_svg]:size-3",
      },
      elegant: {
        content: "md:pb-[var(--panel-footer-clearance)]",
        dateDividerRoot: "opacity-70",
        dateDividerRule: "border-t border-line-muted",
        dateDividerChipWrap: "bg-layer-panel",
        dateDividerChip:
          "bg-layer-panel px-2 font-mono text-[11px] font-normal uppercase tracking-widest text-foreground-muted",
        notice: "pb-2 font-sans text-xs",
        historyLimited:
          "rounded border border-line-subtle bg-layer-panel/70 px-2 py-1 [&_svg]:size-3",
      },
    },
    tone: {
      faint: {
        notice: "text-foreground/40",
      },
      muted: {
        notice: "text-foreground/50",
      },
    },
  },
  defaultVariants: {
    tone: "faint",
  },
});
