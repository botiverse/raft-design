import { tv } from "../../lib/tv";

export const messageSystem = tv({
  slots: {
    // A system note is a standalone line between messages, a turn of its
    // own: like a message row it keeps the lead (12px) above its text and the
    // row inset (4px) under it, so it sits the message step (16px) from the
    // text on both sides (design/foundations/spacing.md#timeline-rhythm);
    // 6px above and below inside an open group panel. It reads
    // no marker from its neighbours: raft-ui reads neither the Raft web app's
    // `data-followed-by` nor `followsSystemFor`. The web app still writes
    // `data-followed-by` for its own classes.
    systemRoot: [
      "flex min-w-0 items-center justify-center",
      "gap-2 px-4 pt-timeline-lead pb-timeline-row in-data-[slot=system-message-group-panel]:py-1.5",
      "font-mono text-mono-meta text-foreground-hint",
      "before:min-w-3 before:flex-1 before:border-t before:border-line-hairline",
      "after:min-w-3 after:flex-1 after:border-t after:border-line-hairline",
    ],
    systemTime: ["shrink-0 whitespace-nowrap", "font-mono text-mono-meta text-foreground-hint"],
    systemContent: ["min-w-0 truncate", "text-foreground-hint"],
    systemGroup: ["group/system-group"],
    // The disclosure is a 28px button (`h-7` below) around a line of mono
    // text, so a closed header gives back the half of the difference it
    // overhangs the text by, above and below, to keep the note's lead and row
    // inset. Open, it keeps the 6px under it that its panel's lines keep.
    systemGroupHeader: [
      "flex justify-center",
      "items-center gap-2 px-4",
      "pt-[calc(var(--spacing-timeline-lead)-(--spacing(7)-var(--text-mono-meta--line-height))/2)]",
      "mb-[calc(var(--spacing-timeline-row)-(--spacing(7)-var(--text-mono-meta--line-height))/2)] group-data-open/system-group:mb-0 group-data-open/system-group:pb-1.5",
      "before:min-w-3 before:flex-1 before:border-t before:border-line-hairline",
      "after:min-w-3 after:flex-1 after:border-t after:border-line-hairline",
    ],
    systemGroupDisclosure: [
      "group relative flex max-w-full items-center",
      "[&[data-panel-open]_[data-slot=system-message-group-chevron]]:-rotate-90",
      "h-7 gap-1 rounded-control px-2 py-0",
      "font-mono text-mono-meta text-foreground-hint",
      "hover:bg-fill-medium hover:text-foreground active:bg-fill-medium",
      "outline-none focus-visible:shadow-focus",
    ],
    systemGroupSummary: ["truncate"],
    systemGroupChevron: ["size-3 shrink-0 rotate-90 transition-transform", "text-foreground-hint"],
  },
});
