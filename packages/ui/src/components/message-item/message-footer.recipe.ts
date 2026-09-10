import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

export const messageFooter = tv({
  slots: {
    savedIndicator: [
      "inline-flex min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap select-none",
      "[&_svg]:shrink-0",
      "data-[icon-only]:size-7 data-icon-only:justify-center data-[icon-only]:p-0",
    ],
    readReceipt: [
      "ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap",
      "[&_svg]:shrink-0",
    ],
    badge: [
      "inline-flex min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap select-none",
      "transition-colors [&_svg]:shrink-0",
    ],
    badgeSeparator: ["text-foreground-strong/45"],
  },
  variants: {
    badgeStatus: { read: {}, unread: {} },
    theme: {
      brutal: {
        savedIndicator: [
          "h-5 border border-line-strong px-1.5 text-[10px] font-bold leading-none",
          "bg-brutal-orange/15 text-black transition-[filter] duration-100 hover:brightness-90",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black",
          "[&_svg]:size-2.5 [&_svg]:text-brutal-orange",
          "data-icon-only:border-2 data-icon-only:border-black data-icon-only:shadow-raft-sm",
          "data-icon-only:transition-all data-icon-only:hover:-translate-y-px data-icon-only:hover:shadow-raft-md",
          "data-icon-only:active:translate-px data-icon-only:active:shadow-raft-xs data-[icon-only]:[&_svg]:size-3.5",
        ],
        readReceipt: "h-5 text-[10px] font-bold leading-none text-black/45 [&_svg]:size-2.5",
        badge: [
          "h-5 border border-line-strong px-1.5 text-[10px] font-bold leading-none text-black",
          "hover:bg-brutal-cyan/40",
          "[&_svg]:size-3",
        ],
      },
      elegant: {
        savedIndicator: [
          "h-5 gap-1.5 rounded-full bg-primary-soft px-1.5 py-0.5",
          "text-[11px] font-medium leading-3 tracking-[0.22px] text-primary-600 dark:text-primary-strong",
          "transition-[filter,opacity] duration-100 hover:brightness-95",
          "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
          "[&_svg]:size-[11px]",
          "data-[icon-only]:rounded-md data-[icon-only]:[&_svg]:size-4",
        ],
        readReceipt: "h-5 text-[11px] font-medium text-foreground-muted [&_svg]:size-2.5",
        badge: [
          "h-5 rounded-md px-1.5",
          "text-[12px] font-[420] tracking-[-0.01em] hover:bg-fill-strong/80 [&_svg]:size-[11px]",
        ],
      },
    },
  },
  compoundVariants: [
    { theme: "brutal", badgeStatus: "read", class: { badge: "bg-white" } },
    { theme: "brutal", badgeStatus: "unread", class: { badge: "bg-brutal-cyan/20" } },
    {
      theme: "elegant",
      badgeStatus: "read",
      class: { badge: "text-foreground-muted" },
    },
    {
      theme: "elegant",
      badgeStatus: "unread",
      class: {
        badge: ["bg-info-soft/50 text-[12px] tracking-[-0.01em]"],
      },
    },
  ],
});

export type MessageFooterVariantProps = VariantProps<typeof messageFooter>;
