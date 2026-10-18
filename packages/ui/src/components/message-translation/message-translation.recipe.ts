import { tv } from "../../lib/tv";

export const messageTranslation = tv({
  slots: {
    translationOriginal: ["not-italic", "mt-1"],
    translationOriginalLabel: ["mb-0.5 font-mono text-mono-meta text-foreground-hint"],
    translationStatus: [
      "inline-flex items-center gap-1.5",
      "mt-1 font-mono text-mono-meta text-foreground-hint [&_svg]:size-3",
    ],
    translationFailedStatus: [
      "inline-flex items-center gap-1.5",
      "mt-1 font-mono text-mono-meta text-warning-strong",
      "[&_svg]:size-3",
    ],
    translationProgressTrack: ["h-1"],
    translationAction: [
      "inline-flex items-center gap-1",
      "underline",
      "rounded-[2px] font-sans text-caption font-semibold text-foreground",
      "decoration-[1.5px] underline-offset-[3px] hover:decoration-attention-500",
      "outline-none focus-visible:shadow-focus",
    ],
    translationRetryAction: [
      "inline-flex items-center gap-1",
      "underline",
      "rounded-[2px] font-sans text-caption font-semibold text-foreground",
      "decoration-[1.5px] underline-offset-[3px] hover:decoration-attention-500",
      "outline-none focus-visible:shadow-focus",
    ],
  },
});
