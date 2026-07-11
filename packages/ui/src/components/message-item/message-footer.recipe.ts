import { tv, type VariantProps } from "../../lib/tv";

export const messageFooter = tv({
  slots: {
    savedIndicator: [
      "inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap",
      "border border-line-strong px-1.5 text-[10px] font-bold leading-none",
      "[&_svg]:size-[10px] [&_svg]:shrink-0",
    ],
    badge: [
      "inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap",
      "border transition-colors",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    badgeSeparator: ["text-foreground/45"],
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
        badge: [
          "border-line-strong px-1.5 text-[10px] font-bold leading-none text-black",
          "transition-colors hover:bg-brutal-cyan/40",
        ],
      },
      elegant: {
        savedIndicator: "right-[calc(1.75rem-2px)] text-primary-400",
        badge: [
          "!h-[20px] rounded-md px-1.5 py-0.5 shadow-none ring-0",
          "text-[12px] font-[420] tracking-[-0.01em] [&_svg]:size-[11px]",
        ],
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
