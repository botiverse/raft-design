import { tv } from "../../lib/tv";

export const filterChip = tv({
  slots: {
    root: [
      "inline-flex h-7 shrink-0 items-center gap-1.5 px-3",
      "whitespace-nowrap text-xs leading-none",
      "outline-none transition-colors",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
      "data-disabled:pointer-events-none data-disabled:opacity-45",
    ],
    count: ["tabular-nums"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-2 border-black/25 bg-white font-semibold text-black/70",
          "hover:border-black hover:text-black",
          "data-pressed:border-black data-pressed:bg-brutal-yellow data-pressed:text-black",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
        ],
        count: ["font-mono text-black/55"],
      },
      elegant: {
        root: [
          "rounded-full border border-line-muted bg-layer-panel font-medium text-foreground-muted",
          "hover:bg-ink-4 hover:text-foreground",
          "data-pressed:border-transparent data-pressed:bg-primary-400/15 data-pressed:text-foreground-strong",
          "data-pressed:hover:bg-primary-400/20",
          "focus-visible:ring-2 focus-visible:ring-primary-400/80",
        ],
        count: ["text-foreground-placeholder"],
      },
    },
  },
});
