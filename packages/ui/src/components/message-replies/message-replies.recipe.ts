import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { messageBlock } from "../message-embed/message-embed.recipe";

export const messageReplies = tv({
  extend: messageBlock,
  slots: {
    root: [
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
        time: "font-sans text-[11.5px] tabular-nums text-black/40",
      },
      elegant: {
        root: ["rounded-md"],
        summary: "mb-1.5 text-foreground-muted",
        sender: "text-foreground-muted",
        content: "text-foreground-muted/80",
        time: "font-mono text-[10px] text-foreground-placeholder",
      },
    },
  },
});

export type MessageRepliesVariantProps = VariantProps<typeof messageReplies>;
