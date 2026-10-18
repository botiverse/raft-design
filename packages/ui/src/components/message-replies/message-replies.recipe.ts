import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

export const messageReplies = tv({
  slots: {
    root: [
      // The replies surface is a face aligned with the message text: its
      // right edge stays on the content edge of the row (20 from the panel
      // edge). A negative right margin on a 100%-wide block is dropped as
      // over-constrained (measured on the real page 2026-10-09), so no bleed
      // is attempted; the rendered position is pinned by the browser spec.
      "group/message-replies flex min-w-0 w-full flex-col text-left",
      "transition-colors focus-visible:outline-1 focus-visible:outline-line-strong",
      "mt-2 max-w-[480px] gap-1 rounded-container border-0 px-2.5 py-2",
      "bg-fill-muted text-foreground-muted hover:press-overlay active:press-overlay",
      "focus-visible:outline-none focus-visible:shadow-focus",
    ],
    summary: [
      "flex shrink-0 flex-wrap items-center transition-colors",
      "gap-1.5 text-footnote font-bold text-foreground-muted has-[strong]:text-foreground",
      "[&_strong]:inline-flex [&_strong]:h-5 [&_strong]:min-w-5 [&_strong]:items-center [&_strong]:justify-center",
      "[&_strong]:rounded-sticker [&_strong]:px-1.5 [&_strong]:font-mono [&_strong]:text-mono-meta [&_strong]:font-bold",
      "[&_strong]:bg-attention [&_strong]:text-sticker-ink [&_strong]:inset-ring-[1.5px] [&_strong]:inset-ring-sticker-ink [&_strong]:ring-[1.5px] [&_strong]:ring-sticker-edge",
    ],
    summaryItem: ["inline-flex items-center gap-0.5 align-middle", "[&_svg]:size-3.5"],
    reply: ["flex min-w-0 items-center", "gap-1.5 text-footnote"],
    sender: ["min-w-0 shrink truncate", "font-semibold text-foreground-muted"],
    content: ["min-w-0 flex-1 truncate", "text-foreground-hint"],
    time: ["ml-auto shrink-0", "font-mono text-mono-meta tabular-nums text-foreground-hint"],
  },
});

export type MessageRepliesVariantProps = VariantProps<typeof messageReplies>;
