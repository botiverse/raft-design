import { tv } from "../../lib/tv";

export const messageList = tv({
  slots: {
    root: ["relative h-full min-h-0"],
    viewport: ["min-w-0"],
    content: ["flex min-h-full flex-col"],
    dateDividerRoot: [],
    dateDividerRule: ["absolute inset-x-3 top-1/2 border-t-2"],
    dateDividerChipWrap: ["relative"],
    dateDividerChip: [
      "inline-flex items-center px-2",
      "text-[10px] font-bold uppercase tracking-widest",
    ],
    notice: ["pb-2 text-center font-mono text-xs"],
    historyLimited: ["inline-flex items-center gap-1.5 border px-2 py-1", "[&_svg]:size-3"],
  },
  variants: {
    theme: {
      brutal: {
        dateDividerRule: "border-black/15",
        dateDividerChipWrap: "bg-white",
        dateDividerChip: "bg-white text-black/50",
        historyLimited: "border-black/20 bg-white/70",
      },
      elegant: {
        dateDividerRule: "border-t border-line-muted",
        dateDividerChipWrap: "bg-layer-panel",
        dateDividerChip: "bg-layer-panel font-mono text-[11px] font-normal text-foreground-muted",
        notice: "font-sans",
        historyLimited: "rounded border-line-subtle bg-layer-panel/70",
      },
    },
    sticky: {
      true: {
        dateDividerRoot: "pointer-events-none flex justify-center pt-1",
      },
      false: {
        dateDividerRoot: "relative flex select-none items-center justify-center px-3 py-2",
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
  compoundVariants: [
    {
      theme: "elegant",
      sticky: false,
      class: { dateDividerRoot: "opacity-70" },
    },
  ],
  defaultVariants: {
    sticky: false,
    tone: "faint",
  },
});
