import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { messageBlock } from "../message-embed/message-embed.recipe";

export const messageReplies = tv({
  extend: messageBlock,
  slots: {
    root: [
      // The replies surface is a face aligned with the message text: its
      // right edge stays on the content edge of the row (20 from the panel
      // edge). A negative right margin on a 100%-wide block is dropped as
      // over-constrained (measured on the real page 2026-10-09), so no bleed
      // is attempted; the rendered position is pinned by the browser spec.
      "group/message-replies mt-1.5 flex min-w-0 w-full flex-col gap-1 px-2.5 py-2 text-left",
      "transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-line-strong",
    ],
    summary: [
      "flex shrink-0 flex-wrap items-center gap-1 text-xs font-medium transition-colors",
      "[&_strong]:font-semibold",
    ],
    summaryItem: ["inline-flex items-center gap-0.5 align-middle", "[&_svg]:size-2.5"],
    reply: ["flex min-w-0 items-center gap-1.5 text-xs leading-tight"],
    sender: ["min-w-0 shrink truncate font-semibold"],
    content: ["min-w-0 flex-1 truncate"],
    time: ["ml-auto shrink-0"],
  },
  variants: {
    theme: {
      brutal: {
        // border-0 cancels the embed frame the component composes (brutal
        // message-embed adds a 1px black border); the reply surface is a bare
        // wash, matching the source InlineThreadReplies.
        root: "border-0 bg-black/3 hover:bg-black/8",
        summary:
          "text-[12.5px] font-bold text-black/55 group-hover/message-replies:text-black [&_strong]:font-bold",
        reply: "text-[12.5px]",
        sender: "text-black/70",
        content: "text-black/60",
        time: "font-mono text-[11.5px] tabular-nums text-black/40",
      },
      elegant: {
        root: ["rounded-md"],
        summary: "mb-1.5 text-foreground-muted",
        sender: "text-foreground-muted",
        content: "text-foreground-muted/80",
        time: "font-sans text-[11.5px] tabular-nums text-foreground-placeholder",
      },
      raft: {
        root: [
          "mt-2 max-w-[480px] gap-1 rounded-container border-0 px-2.5 py-2",
          "bg-fill-muted text-foreground-muted hover:press-overlay active:press-overlay",
          "focus-visible:outline-none focus-visible:shadow-raft-focus",
        ],
        summary: [
          "gap-1.5 text-footnote font-bold text-foreground-muted has-[strong]:text-foreground",
          "[&_strong]:inline-flex [&_strong]:h-5 [&_strong]:min-w-5 [&_strong]:items-center [&_strong]:justify-center",
          "[&_strong]:rounded-sticker [&_strong]:px-1.5 [&_strong]:font-mono [&_strong]:text-mono-meta [&_strong]:font-bold",
          "[&_strong]:bg-accent [&_strong]:text-sticker-ink [&_strong]:shadow-[inset_0_0_0_1.5px_var(--sticker-ink)] [&_strong]:ring-[1.5px] [&_strong]:ring-sticker-edge",
        ],
        summaryItem: "[&_svg]:size-3.5",
        reply: "gap-1.5 text-footnote",
        sender: "font-semibold text-foreground-muted",
        content: "text-foreground-hint",
        time: "font-mono text-mono-meta tabular-nums text-foreground-hint",
      },
    },
  },
});

export type MessageRepliesVariantProps = VariantProps<typeof messageReplies>;
