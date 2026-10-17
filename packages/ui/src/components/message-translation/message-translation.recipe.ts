import { tv } from "../../lib/tv";

export const messageTranslation = tv({
  slots: {
    translationOriginal: ["not-italic"],
    translationOriginalLabel: [],
    translationStatus: ["inline-flex items-center gap-1.5"],
    translationFailedStatus: ["inline-flex items-center gap-1.5"],
    translationProgressTrack: [],
    translationAction: [
      "inline-flex items-center gap-1",
      "font-medium underline underline-offset-2",
    ],
    translationRetryAction: [
      "inline-flex items-center gap-1",
      "font-medium underline underline-offset-2",
    ],
  },
  variants: {
    theme: {
      brutal: {
        translationOriginalLabel:
          "mb-0.5 text-[10px] font-bold uppercase tracking-normal text-black/40",
        translationStatus: "font-mono text-[11px] text-black/45",
        translationFailedStatus: ["font-mono text-[11px] text-black/45", "text-brutal-orange"],
        translationAction: "decoration-black/40 hover:decoration-black",
        translationRetryAction:
          "font-bold text-brutal-orange decoration-black/40 hover:decoration-black",
      },
      elegant: {
        translationOriginalLabel:
          "mb-0.5 text-[10px] font-medium tracking-normal text-foreground-muted/70",
        translationStatus: "text-[11px] leading-none text-foreground-muted",
        translationFailedStatus: "text-[11px] leading-none text-warning",
        translationProgressTrack: "h-1.5",
        translationAction: "text-foreground-muted/70 no-underline hover:text-foreground-muted",
        translationRetryAction: [
          "rounded-sm px-1 py-0.5",
          "text-warning no-underline",
          "transition-colors hover:bg-warning-soft hover:text-warning",
        ],
      },
      raft: {
        translationOriginal: "mt-1",
        translationOriginalLabel: "mb-0.5 font-mono text-mono-meta text-foreground-hint",
        translationStatus: "mt-1 font-mono text-mono-meta text-foreground-hint [&_svg]:size-3",
        translationFailedStatus: [
          "mt-1 font-mono text-mono-meta text-warning-strong",
          "[&_svg]:size-3",
        ],
        translationProgressTrack: "h-1",
        translationAction: [
          "rounded-[2px] font-sans text-caption font-semibold text-foreground",
          "decoration-[1.5px] underline-offset-[3px] hover:decoration-accent-500",
          "outline-none focus-visible:shadow-raft-focus",
        ],
        translationRetryAction: [
          "rounded-[2px] font-sans text-caption font-semibold text-foreground",
          "decoration-[1.5px] underline-offset-[3px] hover:decoration-accent-500",
          "outline-none focus-visible:shadow-raft-focus",
        ],
      },
    },
  },
});
