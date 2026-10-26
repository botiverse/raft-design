import { tv } from "../../lib/tv";

export const searchThread = tv({
  slots: {
    thread: [
      "overflow-hidden",
      "relative rounded-none border-0 bg-transparent text-foreground shadow-none",
    ],
    threadHeader: ["py-2", "px-4 pt-3 pb-0"],
    threadMeta: [
      "flex flex-wrap items-center",
      "mb-0.5 gap-1.5",
      "font-mono text-mono-meta font-normal text-foreground-hint",
    ],
    threadTimestamp: ["normal-case", "ml-auto"],
    threadTitle: ["font-sans text-callout font-semibold text-foreground"],
    threadMessages: ["flex flex-col gap-0.5 py-2", "border-t-0 bg-transparent"],
  },
});
