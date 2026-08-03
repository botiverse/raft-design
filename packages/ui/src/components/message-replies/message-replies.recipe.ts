import { tv, type VariantProps } from "../../lib/tv";
import { messageMat } from "../message-embed/message-embed.recipe";

export const messageReplies = tv({
  extend: messageMat,
  slots: {
    root: [
      "group/message-replies mt-1.5 flex min-w-0 w-full flex-col gap-1 px-2.5 py-2 text-left",
      "transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-line-strong",
    ],
    summary: [
      "mb-1.5 flex shrink-0 flex-wrap items-center gap-1 text-xs font-medium transition-colors",
      "[&_strong]:font-semibold",
    ],
    summaryItem: ["inline-flex items-center gap-0.5 align-middle", "[&_svg]:size-2.5"],
    reply: ["flex min-w-0 items-center gap-1.5 text-xs leading-tight"],
    sender: ["shrink-0 font-semibold"],
    content: ["min-w-0 flex-1 truncate"],
    time: ["ml-auto shrink-0 font-mono text-[10px]"],
  },
  variants: {
    theme: {
      brutal: {
        root: "bg-white hover:bg-ink-2",
        summary: "text-secondary-700 group-hover/message-replies:text-foreground-strong",
        sender: "text-secondary-800",
        content: "text-secondary-700",
        time: "text-secondary-500",
      },
      elegant: {
        root: ["rounded-md"],
        summary: "text-foreground-muted",
        sender: "text-foreground-muted",
        content: "text-foreground-muted/80",
        time: "text-foreground-placeholder",
      },
    },
  },
});

export type MessageRepliesVariantProps = VariantProps<typeof messageReplies>;
