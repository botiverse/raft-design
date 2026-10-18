import { tv } from "../../lib/tv";

export const messageList = tv({
  slots: {
    root: ["relative h-full min-h-0"],
    viewport: ["min-w-0 overscroll-none"],
    content: ["flex min-h-full w-full min-w-0 flex-col"],
    dateDividerRoot: ["flex select-none items-center", "gap-2 px-4 py-3"],
    dateDividerRule: ["flex-1", "min-w-3 border-t border-line-hairline"],
    dateDividerChip: [
      "inline-flex items-center",
      "font-mono text-mono-meta whitespace-nowrap text-foreground-hint",
    ],
    notice: ["text-center", "pb-2 font-mono text-mono-meta"],
    historyLimited: [
      "inline-flex items-center",
      "h-[22px] gap-1 rounded-chip px-1.5",
      "font-mono text-mono-meta text-foreground-muted",
      "inset-ring inset-ring-line-hairline",
      "[&_svg]:size-3",
    ],
  },
  variants: {
    tone: {
      faint: {
        notice: ["text-foreground-hint"],
      },
      muted: {
        notice: ["text-foreground-muted"],
      },
    },
  },
  defaultVariants: {
    tone: "faint",
  },
});
