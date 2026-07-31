import { tv } from "../../lib/tv";

export const messageSystem = tv({
  slots: {
    systemRoot: ["flex min-w-0 items-center justify-center", "mb-1 gap-2 px-2 py-1.5"],
    systemTime: ["shrink-0 whitespace-nowrap", "text-black/40"],
    systemContent: ["min-w-0 truncate", "text-black/50"],
    systemGroup: ["mb-1"],
    systemGroupHeader: ["flex justify-center", "py-1.5"],
    systemGroupDisclosure: [
      "group flex max-w-full items-center",
      "gap-1.5 px-2 py-1 text-black/50 hover:text-black/75",
      "[&_[data-slot=system-message-group-chevron]]:shrink-0",
      "[&_[data-slot=system-message-group-chevron]]:rotate-90",
      "[&_[data-slot=system-message-group-chevron]]:transition-transform",
      "[&_[data-slot=system-message-group-chevron]]:size-3",
      "[&_[data-slot=system-message-group-chevron]]:text-black/35",
      "[&[data-panel-open]_[data-slot=system-message-group-chevron]]:-rotate-90",
    ],
    systemGroupSummary: ["truncate"],
  },
  variants: {
    theme: {
      brutal: {
        systemTime: ["font-mono text-xs"],
        systemContent: ["text-xs"],
        systemGroupDisclosure: ["text-xs"],
      },
      elegant: {
        systemTime: ["font-sans text-[11px] font-medium tabular-nums"],
        systemContent: ["font-sans text-[12px]"],
        systemGroupDisclosure: ["rounded-md font-sans text-[12px]", "transition-colors"],
      },
    },
  },
});
