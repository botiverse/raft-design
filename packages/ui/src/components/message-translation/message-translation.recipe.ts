import { tv } from "../../lib/tv";

export const messageTranslation = tv({
  slots: {
    translationOriginal: ["not-italic"],
    translationOriginalLabel: [],
    translationStatus: ["inline-flex items-center gap-1.5"],
    translationPendingStatus: ["inline-flex items-center gap-1.5"],
    translationFailedStatus: ["inline-flex items-center gap-1.5"],
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
        translationPendingStatus: "font-mono text-[11px] text-black/45",
        translationFailedStatus: ["font-mono text-[11px] text-black/45", "text-brutal-orange"],
        translationAction: "decoration-black/40 hover:decoration-black",
        translationRetryAction:
          "font-bold text-brutal-orange decoration-black/40 hover:decoration-black",
      },
      elegant: {
        translationOriginalLabel:
          "mb-0.5 text-[10px] font-medium tracking-normal text-foreground-muted/70",
        translationStatus: "text-[11px] leading-none text-foreground-muted",
        translationPendingStatus: "text-[11px] leading-none text-foreground-muted",
        translationFailedStatus: "text-[11px] leading-none text-warning-base",
        translationAction: "text-foreground-muted/70 no-underline hover:text-foreground-muted",
        translationRetryAction: [
          "rounded-sm px-1 py-0.5",
          "text-warning-base no-underline",
          "transition-colors hover:bg-[oklch(0.95_0.03_44.33)] hover:text-warning-base",
        ],
      },
    },
  },
});
