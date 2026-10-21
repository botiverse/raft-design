import { tv } from "../../lib/tv";

export const messageSystem = tv({
  slots: {
    // A system note is a standalone line between messages: its own `py-3`
    // keeps 12px above and below it, 6px inside an open group panel. It reads
    // no marker from its neighbours: raft-ui reads neither the Raft web app's
    // `data-followed-by` nor `followsSystemFor`. The web app still writes
    // `data-followed-by` for its own classes.
    systemRoot: [
      "flex min-w-0 items-center justify-center",
      "gap-2 px-4 py-3 in-data-[slot=system-message-group-panel]:py-1.5",
      "font-mono text-mono-meta text-foreground-hint",
      "before:min-w-3 before:flex-1 before:border-t before:border-line-hairline",
      "after:min-w-3 after:flex-1 after:border-t after:border-line-hairline",
    ],
    systemTime: ["shrink-0 whitespace-nowrap", "font-mono text-mono-meta text-foreground-hint"],
    systemContent: ["min-w-0 truncate", "text-foreground-hint"],
    systemGroup: [""],
    systemGroupHeader: [
      "flex justify-center",
      "items-center gap-2 px-4 py-1.5",
      "before:min-w-3 before:flex-1 before:border-t before:border-line-hairline",
      "after:min-w-3 after:flex-1 after:border-t after:border-line-hairline",
    ],
    systemGroupDisclosure: [
      "group relative flex max-w-full items-center",
      "[&[data-panel-open]_[data-slot=system-message-group-chevron]]:-rotate-90",
      "h-7 gap-1 rounded-control px-2 py-0",
      "font-mono text-mono-meta text-foreground-hint",
      "hover:bg-fill-medium hover:text-foreground",
      "outline-none focus-visible:shadow-focus",
    ],
    systemGroupSummary: ["truncate"],
    systemGroupChevron: ["size-3 shrink-0 rotate-90 transition-transform", "text-foreground-hint"],
  },
});
