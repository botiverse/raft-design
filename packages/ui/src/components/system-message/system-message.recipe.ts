import { tv } from "../../lib/tv";

export const messageSystem = tv({
  slots: {
    // A system note is a standalone line between messages: it keeps a net
    // 12 above and below (2026-10-11) — the note owns its 4px lead-in, the
    // message that follows cancels the rest of the group-break accounting
    // via data-follows-system.
    systemRoot: ["flex min-w-0 items-center justify-center", "gap-2 px-2 pt-1 pb-0"],
    systemTime: ["shrink-0 whitespace-nowrap", "text-black/40"],
    systemContent: ["min-w-0 truncate", "text-black/50"],
    systemGroup: [""],
    systemGroupHeader: ["flex justify-center", "pb-0"],
    systemGroupDisclosure: [
      "group relative flex max-w-full items-center",
      "gap-1.5 px-2 pb-0.5 text-black/50 hover:text-black/75",
      "[&[data-panel-open]_[data-slot=system-message-group-chevron]]:-rotate-90",
    ],
    systemGroupSummary: ["truncate"],
    systemGroupChevron: ["size-3 shrink-0 rotate-90 text-black/35 transition-transform"],
  },
  variants: {
    theme: {
      brutal: {
        // Brutal's rows carry their own mt/py rhythm; its previous-row
        // contribution above a note differs from elegant's, so the note's
        // lead-in closes the same 12 seam (2026-10-11, gzj's review).
        systemRoot: "pt-0",
        systemGroupHeader: "pt-0",
        // brutal's real clickable height ran to the row's very bottom (17).
        systemGroupDisclosure: ["pt-px", "pb-0", "text-xs"],
        systemTime: ["font-mono text-xs"],
        systemContent: ["text-xs"],
      },
      elegant: {
        systemRoot: "pt-[3px]",
        systemGroupHeader: "pt-px",
        systemTime: [
          "font-sans text-[11px] font-medium tabular-nums",
          "dark:text-foreground-strong/40",
        ],
        systemContent: ["font-sans text-[12px]", "dark:text-foreground-strong/50"],
        systemGroupDisclosure: [
          "pt-0.5",
          "rounded-md font-sans text-[12px]",
          "transition-colors",
          "dark:text-foreground-strong/50 dark:hover:text-foreground-strong/75",
        ],
        systemGroupChevron: ["dark:text-foreground-strong/35"],
      },
    },
  },
});
