import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

export const messageFooter = tv({
  slots: {
    savedIndicator: [
      "inline-flex min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap select-none",
      "[&_svg]:shrink-0",
      "h-[22px] rounded-chip px-1.5",
      "text-caption font-semibold text-foreground-muted",
      "bg-fill-muted hover:press-overlay active:press-overlay",
      "outline-none focus-visible:shadow-raft-focus",
      "[&_svg]:size-3.5 [&_svg]:text-foreground",
    ],
    readReceipt: [
      "ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap",
      "[&_svg]:shrink-0",
      "h-[22px] font-mono text-mono-meta text-foreground-hint [&_svg]:size-3",
    ],
    badge: [
      "inline-flex min-w-0 max-w-full items-center overflow-hidden whitespace-nowrap select-none",
      "transition-colors [&_svg]:shrink-0",
      "h-6 gap-1 rounded-chip border-0 px-2 shadow-none",
      "text-footnote font-bold text-foreground-muted",
      "bg-fill-muted hover:press-overlay active:press-overlay",
      "[&_svg]:size-3.5",
    ],
    badgeSeparator: ["text-foreground-strong/45"],
  },
  variants: {
    badgeStatus: { read: {}, unread: { badge: ["text-foreground"] } },
    elevation: {
      none: {},
      xs: { savedIndicator: "shadow-raft-xs" },
      sm: { savedIndicator: "shadow-raft-sm" },
    },
    iconOnly: {
      true: {
        savedIndicator: [
          "justify-center p-0",
          "size-8 rounded-control bg-transparent",
          "[&_svg]:size-[18px] [&_svg]:text-foreground-icon",
        ],
      },
      false: {},
    },
  },
  defaultVariants: {
    elevation: "none",
    iconOnly: false,
  },
});

export type MessageFooterVariantProps = VariantProps<typeof messageFooter>;
