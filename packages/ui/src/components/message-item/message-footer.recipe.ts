import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

export const messageFooter = tv({
  slots: {
    savedIndicator: [
      "inline-flex min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap select-none",
      "[&_svg]:shrink-0",
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
    elevation: {
      none: {},
      xs: { savedIndicator: "shadow-raft-xs" },
      sm: { savedIndicator: "shadow-raft-sm" },
    },
    iconOnly: {
      true: { savedIndicator: "size-7 justify-center p-0" },
      false: {},
    },
    theme: {
      brutal: {
        savedIndicator: [
          "h-5 border border-line-strong px-1.5 text-[10px] font-bold leading-none",
          "bg-white text-black transition-[filter] duration-100 hover:brightness-90",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black",
          "[&_svg]:size-2.5 [&_svg]:text-brutal-orange",
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
    {
      theme: "brutal",
      iconOnly: true,
      class: {
        savedIndicator: [
          "border-2 border-black shadow-raft-sm",
          "transition-all hover:-translate-y-px hover:shadow-raft-md",
          "active:translate-px active:shadow-raft-xs [&_svg]:size-3.5",
        ],
      },
    },
    {
      theme: "elegant",
      iconOnly: true,
      class: { savedIndicator: "rounded-md [&_svg]:size-4" },
    },
  ],
  defaultVariants: {
    elevation: "none",
    iconOnly: false,
  },
});

export type MessageFooterVariantProps = VariantProps<typeof messageFooter>;
