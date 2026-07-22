import { tv, type VariantProps } from "../../lib/tv";

export const messageFooter = tv({
  slots: {
    savedIndicator: [
      "inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap",
      "border border-line-strong px-1.5 text-[10px] font-bold leading-none",
      "[&_svg]:size-[10px] [&_svg]:shrink-0",
    ],
    readReceipt: [
      "inline-flex h-5 shrink-0 items-center gap-1 whitespace-nowrap",
      "text-[10px] font-bold leading-none",
      "[&_svg]:size-[10px] [&_svg]:shrink-0",
    ],
    badge: [
      "inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap",
      "border transition-colors",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    badgeSeparator: ["text-foreground/45"],
    inlineReplies: ["mt-1.5 flex flex-col gap-0.5 border-l-2 pl-2.5"],
    inlineRepliesTrigger: [
      "mt-1.5 flex w-full flex-col gap-1 px-2.5 py-2 text-left transition-colors",
      "focus-visible:outline focus-visible:outline-1",
    ],
    inlineRepliesSummary: ["shrink-0 text-[12.5px] font-bold"],
    inlineReplyRow: ["flex min-w-0 items-center gap-1.5 text-[12.5px] leading-tight"],
    inlineReplyAvatar: ["shrink-0"],
    inlineReplySender: ["shrink-0 font-semibold"],
    inlineReplyPreview: ["min-w-0 truncate"],
    inlineReplyCount: ["w-fit shrink-0 text-left text-[12.5px] font-bold hover:underline"],
  },
  variants: {
    badgeStatus: { read: {}, unread: {} },
    theme: {
      brutal: {
        savedIndicator: [
          "bg-brutal-orange/15 text-black transition-[filter] duration-100 hover:brightness-90",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black",
          "[&_svg]:text-brutal-orange",
        ],
        readReceipt: "text-black/45",
        badge: [
          "border-line-strong px-1.5 text-[10px] font-bold leading-none text-black",
          "transition-colors hover:bg-brutal-cyan/40",
        ],
        inlineReplies: "border-black/15",
        inlineRepliesTrigger: [
          "bg-black/[0.04] hover:bg-black/[0.12]",
          "focus-visible:outline-black",
        ],
        inlineRepliesSummary: "text-[oklch(0.605_0.111_224.369)]",
        inlineReplySender: "text-black/70",
        inlineReplyPreview: "text-black/60",
        inlineReplyCount: "text-[oklch(0.605_0.111_224.369)]",
      },
      elegant: {
        savedIndicator: [
          "gap-1.5 rounded-full border-transparent bg-[oklch(0.955_0.067_93.62)] px-2 py-0.5",
          "text-[11px] font-medium leading-3 tracking-[0.22px] text-primary-600",
          "transition-[filter,opacity] duration-100 enabled:hover:brightness-90",
          "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
          "[&_svg]:size-[11px] [&_svg]:shrink-0",
        ],
        readReceipt: "text-[11px] font-medium text-foreground-muted",
        badge: [
          "!h-[20px] rounded-md px-1.5 py-0.5 shadow-none ring-0",
          "text-[12px] font-[420] tracking-[-0.01em] [&_svg]:size-[11px]",
        ],
        inlineReplies: "border-line-subtle",
        inlineRepliesTrigger: [
          "rounded-md bg-layer-muted/70 hover:bg-layer-strong/80",
          "focus-visible:outline-line-focus",
        ],
        inlineRepliesSummary: "text-primary-600",
        inlineReplySender: "text-foreground-muted",
        inlineReplyPreview: "text-foreground-muted/80",
        inlineReplyCount: "text-primary-600",
      },
    },
  },
  compoundVariants: [
    { theme: "brutal", badgeStatus: "read", class: { badge: "!bg-white" } },
    { theme: "brutal", badgeStatus: "unread", class: { badge: "!bg-brutal-cyan/20" } },
    {
      theme: "elegant",
      badgeStatus: "read",
      class: { badge: "text-foreground-muted" },
    },
    {
      theme: "elegant",
      badgeStatus: "unread",
      class: {
        badge: [
          "!h-[20px] border-transparent !bg-primary-100 !text-primary-800",
          "text-[12px] tracking-[-0.01em] hover:!bg-primary-200/90",
        ],
      },
    },
  ],
});

export type MessageFooterVariantProps = VariantProps<typeof messageFooter>;
