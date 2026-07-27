import { tv, type VariantProps } from "../../lib/tv";

export const messageThreadRepliesPreview = tv({
  slots: {
    root: ["mt-1.5 min-w-0"],
    trigger: [
      "group/thread-replies-preview flex w-full flex-col gap-1 px-2.5 py-2 text-left",
      "transition-colors focus-visible:outline focus-visible:outline-1",
    ],
    summary: ["shrink-0 text-[12.5px] font-bold transition-colors"],
    reply: ["flex min-w-0 items-center gap-1.5 text-[12.5px] leading-tight"],
    avatar: ["shrink-0"],
    sender: ["shrink-0 font-semibold"],
    preview: ["min-w-0 flex-1 truncate"],
    time: ["ml-auto shrink-0 text-[11.5px] tabular-nums"],
    legacyReplies: ["mt-1.5 flex flex-col gap-0.5 border-l-2 pl-2.5"],
    legacyTrigger: [
      "group/inline-replies mt-1.5 flex w-full flex-col gap-1 px-2.5 py-2 text-left",
      "transition-colors focus-visible:outline focus-visible:outline-1",
    ],
    legacySummary: ["shrink-0 text-[12.5px] font-bold transition-colors"],
    legacyCount: ["w-fit shrink-0 text-left text-[12.5px] font-bold hover:underline"],
  },
  variants: {
    theme: {
      brutal: {
        trigger: ["bg-black/[0.03] hover:bg-black/[0.08]", "focus-visible:outline-black"],
        summary: "text-black/55 group-hover/thread-replies-preview:text-black",
        sender: "text-black/70",
        preview: "text-black/60",
        time: "text-black/40",
        legacyReplies: "border-black/15",
        legacyTrigger: ["bg-black/[0.03] hover:bg-black/[0.08]", "focus-visible:outline-black"],
        legacySummary: "text-black/55 group-hover/inline-replies:text-black",
        legacyCount: "text-[oklch(0.605_0.111_224.369)]",
      },
      elegant: {
        trigger: [
          "rounded-md bg-layer-muted/70 hover:bg-layer-strong/80",
          "focus-visible:outline-line-focus",
        ],
        summary: "text-primary-600",
        sender: "text-foreground-muted",
        preview: "text-foreground-muted/80",
        time: "text-foreground-muted",
        legacyReplies: "border-line-subtle",
        legacyTrigger: [
          "rounded-md bg-layer-muted/70 hover:bg-layer-strong/80",
          "focus-visible:outline-line-focus",
        ],
        legacySummary: "text-primary-600",
        legacyCount: "text-primary-600",
      },
    },
  },
});

export type MessageThreadRepliesPreviewVariantProps = VariantProps<
  typeof messageThreadRepliesPreview
>;
