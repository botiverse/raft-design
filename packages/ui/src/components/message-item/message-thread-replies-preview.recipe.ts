import { tv, type VariantProps } from "../../lib/tv";

export const messageThreadRepliesPreview = tv({
  slots: {
    root: ["mt-1.5 min-w-0"],
    trigger: [
      "group/thread-replies-preview flex w-full flex-col text-left",
      "transition-colors focus-visible:outline",
    ],
    summary: ["shrink-0 transition-colors"],
    reply: ["flex min-w-0 items-center gap-1.5"],
    avatar: ["shrink-0"],
    sender: ["shrink-0"],
    preview: ["min-w-0 flex-1 truncate"],
    time: ["ml-auto shrink-0 tabular-nums"],
    legacyReplies: ["mt-1.5 flex flex-col gap-0.5"],
    legacyTrigger: [
      "group/inline-replies mt-1.5 flex w-full flex-col text-left",
      "transition-colors focus-visible:outline",
    ],
    legacySummary: ["shrink-0 transition-colors"],
    legacyCount: ["w-fit shrink-0 text-left hover:underline"],
  },
  variants: {
    theme: {
      brutal: {
        trigger: [
          "gap-1 px-2.5 py-2 bg-black/[0.03] hover:bg-black/[0.08]",
          "focus-visible:outline-1 focus-visible:outline-black",
        ],
        summary:
          "text-[12.5px] font-bold text-black/55 group-hover/thread-replies-preview:text-black",
        reply: "text-[12.5px] leading-tight",
        sender: "font-semibold text-black/70",
        preview: "text-black/60",
        time: "text-[11.5px] text-black/40",
        legacyReplies: "border-l-2 border-black/15 pl-2.5",
        legacyTrigger: [
          "gap-1 px-2.5 py-2 bg-black/[0.03] hover:bg-black/[0.08]",
          "focus-visible:outline-1 focus-visible:outline-black",
        ],
        legacySummary:
          "text-[12.5px] font-bold text-black/55 group-hover/inline-replies:text-black",
        legacyCount: "text-[12.5px] font-bold text-[oklch(0.605_0.111_224.369)]",
      },
      elegant: {
        trigger: [
          "gap-1 rounded-md bg-layer-muted/70 px-2.5 py-2 hover:bg-layer-strong/80",
          "focus-visible:outline-1 focus-visible:outline-line-focus",
        ],
        summary: "text-[12.5px] font-bold text-primary-600",
        reply: "text-[12.5px] leading-tight",
        sender: "font-semibold text-foreground-muted",
        preview: "text-foreground-muted/80",
        time: "text-[11.5px] text-foreground-muted",
        legacyReplies: "border-l border-line-subtle pl-2.5",
        legacyTrigger: [
          "gap-1 rounded-md bg-layer-muted/70 px-2.5 py-2 hover:bg-layer-strong/80",
          "focus-visible:outline-1 focus-visible:outline-line-focus",
        ],
        legacySummary: "text-[12.5px] font-bold text-primary-600",
        legacyCount: "text-[12.5px] font-bold text-primary-600",
      },
    },
  },
});

export type MessageThreadRepliesPreviewVariantProps = VariantProps<
  typeof messageThreadRepliesPreview
>;
