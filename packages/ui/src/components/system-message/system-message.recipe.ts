import { tv } from "../../lib/tv";

export const messageSystem = tv({
  slots: {
    systemRoot: ["mb-1 flex min-w-0 items-center justify-center gap-2 px-2 py-1.5"],
    systemTime: ["shrink-0 whitespace-nowrap font-mono text-xs text-foreground/40"],
    systemContent: ["min-w-0 truncate text-xs text-foreground/50"],
    systemGroup: ["mb-1"],
    systemGroupHeader: ["flex justify-center py-1.5"],
    systemGroupDisclosure: [
      "group flex max-w-full items-center gap-1.5 px-2 py-1",
      "text-xs text-foreground/50 transition-colors hover:text-foreground/75",
      "[&_[data-slot=system-message-group-chevron]]:size-3",
      "[&_[data-slot=system-message-group-chevron]]:shrink-0",
      "[&_[data-slot=system-message-group-chevron]]:rotate-90",
      "[&_[data-slot=system-message-group-chevron]]:text-foreground/35",
      "[&_[data-slot=system-message-group-chevron]]:transition-transform",
      "[&[data-panel-open]_[data-slot=system-message-group-chevron]]:-rotate-90",
    ],
    systemGroupSummary: ["truncate"],
    systemGroupChevron: [],
    systemGroupPanel: [],
  },
  variants: {
    theme: {
      brutal: {},
      elegant: {
        systemTime: ["font-sans text-[11px] font-medium tabular-nums", "text-foreground-muted"],
        systemContent: ["font-sans text-[12px]", "text-foreground-muted"],
        systemGroupDisclosure: [
          "rounded-md font-sans text-[12px] text-foreground-muted",
          "hover:bg-layer-strong/35 hover:text-foreground-strong",
          "[&_[data-slot=system-message-group-chevron]]:text-foreground-icon",
        ],
      },
    },
  },
});
