import { tv } from "../../lib/tv";

export const messageSystem = tv({
  slots: {
    systemRoot: ["flex min-w-0 items-center justify-center"],
    systemTime: ["shrink-0 whitespace-nowrap"],
    systemContent: ["min-w-0 truncate"],
    systemGroup: [],
    systemGroupHeader: ["flex justify-center"],
    systemGroupDisclosure: [
      "group flex max-w-full items-center",
      "[&_[data-slot=system-message-group-chevron]]:shrink-0",
      "[&_[data-slot=system-message-group-chevron]]:rotate-90",
      "[&_[data-slot=system-message-group-chevron]]:transition-transform",
      "[&[data-panel-open]_[data-slot=system-message-group-chevron]]:-rotate-90",
    ],
    systemGroupSummary: ["truncate"],
    systemGroupChevron: [],
    systemGroupPanel: [],
  },
  variants: {
    theme: {
      brutal: {
        systemRoot: ["mb-1 gap-2 px-2 py-1.5"],
        systemTime: ["font-mono text-xs text-black/40"],
        systemContent: ["text-xs text-black/50"],
        systemGroup: ["mb-1"],
        systemGroupHeader: ["py-1.5"],
        systemGroupDisclosure: [
          "gap-1.5 px-2 py-1 text-xs text-black/50 hover:text-black/75",
          "[&_[data-slot=system-message-group-chevron]]:size-3",
          "[&_[data-slot=system-message-group-chevron]]:text-black/35",
        ],
      },
      elegant: {
        systemRoot: ["mb-1 gap-2 px-2 py-1.5"],
        systemTime: ["font-sans text-[11px] font-medium tabular-nums", "text-foreground-muted"],
        systemContent: ["font-sans text-[12px]", "text-foreground-muted"],
        systemGroup: ["mb-1"],
        systemGroupHeader: ["py-1.5"],
        systemGroupDisclosure: [
          "gap-1.5 rounded-md px-2 py-1 font-sans text-[12px] text-foreground-muted",
          "transition-colors hover:bg-layer-strong/35 hover:text-foreground-strong",
          "[&_[data-slot=system-message-group-chevron]]:size-3",
          "[&_[data-slot=system-message-group-chevron]]:text-foreground-icon",
        ],
      },
    },
  },
});
