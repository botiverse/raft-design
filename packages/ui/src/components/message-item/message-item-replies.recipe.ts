import { tv, type VariantProps } from "../../lib/tv";

export const messageItemReplies = tv({
  slots: {
    root: ["mt-1.5 min-w-0"],
    trigger: [
      "group/message-item-replies flex w-full flex-col text-left",
      "transition-colors focus-visible:outline",
    ],
    summary: ["shrink-0 transition-colors"],
    reply: ["flex min-w-0 items-center gap-1.5"],
    avatar: ["shrink-0"],
    sender: ["shrink-0"],
    content: ["min-w-0 flex-1 truncate"],
    time: ["ml-auto shrink-0 tabular-nums"],
  },
  variants: {
    theme: {
      brutal: {
        trigger: [
          "gap-1 px-2.5 py-2 bg-black/[0.03] hover:bg-black/[0.08]",
          "focus-visible:outline-1 focus-visible:outline-black",
        ],
        summary:
          "text-[12.5px] font-bold text-black/55 group-hover/message-item-replies:text-black",
        reply: "text-[12.5px] leading-tight",
        sender: "font-semibold text-black/70",
        content: "text-black/60",
        time: "text-[11.5px] text-black/40",
      },
      elegant: {
        trigger: [
          "gap-1 rounded-md bg-layer-muted/70 px-2.5 py-2 hover:bg-layer-strong/80",
          "focus-visible:outline-1 focus-visible:outline-line-focus",
        ],
        summary: "text-[12.5px] font-bold text-primary-600",
        reply: "text-[12.5px] leading-tight",
        sender: "font-semibold text-foreground-muted",
        content: "text-foreground-muted/80",
        time: "text-[11.5px] text-foreground-muted",
      },
    },
  },
});

export type MessageItemRepliesVariantProps = VariantProps<typeof messageItemReplies>;
