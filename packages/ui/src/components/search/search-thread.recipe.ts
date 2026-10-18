import { tv } from "../../lib/tv";

export const searchThread = tv({
  slots: {
    thread: [
      "overflow-hidden transition-colors",
      "relative rounded-none border-0 bg-transparent text-foreground shadow-none",
      "not-first:before:absolute not-first:before:top-0 not-first:before:right-0 not-first:before:left-4 not-first:before:border-t not-first:before:border-line-muted",
    ],
    threadHeader: ["py-2", "px-4 pt-3 pb-1"],
    threadMeta: [
      "flex flex-wrap items-center",
      "mb-0.5 gap-1.5",
      "font-mono text-mono-meta font-normal text-foreground-hint",
    ],
    threadTimestamp: ["normal-case", "ml-auto"],
    threadTitle: ["font-sans text-callout font-semibold text-foreground"],
    threadMessages: ["flex flex-col [&>*:first-child]:border-t-0", "border-t-0 bg-transparent"],
  },
});
