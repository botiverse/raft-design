import { tv } from "../../lib/tv";

export const topicList = tv({
  slots: {
    group: ["flex min-w-0 flex-col gap-2"],
    groupLabel: ["block min-w-0 truncate"],
    root: ["flex min-w-0 flex-col"],
    item: [
      "group/topic-list-item relative isolate",
      "grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-left",
      "has-data-[slot=topic-list-item-avatar]:grid-cols-[auto_minmax(0,1fr)_auto]",
      "transition-colors",
    ],
    itemTrigger: ["absolute inset-0 z-0 outline-none"],
    itemAvatar: ["pointer-events-none relative z-10 flex shrink-0 pt-0.5"],
    itemContent: ["pointer-events-none relative z-10 flex min-w-0 flex-col gap-0.5"],
    itemHeading: [
      "flex min-w-0 items-center gap-2",
      "*:not-data-[slot=topic-list-item-title]:shrink-0",
    ],
    itemTitle: [
      "block min-w-0 truncate",
      "[&>svg]:mr-1 [&>svg]:inline [&>svg]:size-3.5 [&>svg]:align-[-2px]",
    ],
    itemExcerpt: ["block min-w-0 truncate"],
    itemAuthor: [],
    itemAside: ["pointer-events-none relative z-10", "flex shrink-0 flex-col items-end gap-1"],
    itemTime: ["whitespace-nowrap tabular-nums"],
    itemStats: ["flex items-center gap-2"],
    itemReplies: [
      "inline-flex items-center gap-1 tabular-nums",
      "[&>svg]:size-3.5 [&>svg]:shrink-0",
    ],
  },
  variants: {
    theme: {
      brutal: {
        groupLabel: ["px-1 font-heading text-xs leading-4 font-bold uppercase text-black/60"],
        root: ["border-2 border-black bg-white shadow-raft-sm"],
        item: [
          "border-b-2 border-black px-4 py-3 last:border-b-0",
          "hover:bg-brutal-yellow/40",
          "has-[>[aria-current]:not([aria-current=false])]:bg-brutal-yellow",
          "has-[[data-slot=topic-list-item-trigger]:focus-visible]:outline-2",
          "has-[[data-slot=topic-list-item-trigger]:focus-visible]:outline-solid",
          "has-[[data-slot=topic-list-item-trigger]:focus-visible]:-outline-offset-4",
          "has-[[data-slot=topic-list-item-trigger]:focus-visible]:outline-black",
        ],
        itemTitle: [
          "text-sm leading-5 font-semibold text-black/70",
          "group-data-[unread=true]/topic-list-item:font-bold",
          "group-data-[unread=true]/topic-list-item:text-black",
        ],
        itemExcerpt: ["text-xs leading-4 text-black/55"],
        itemAuthor: ["font-bold text-black/70"],
        itemTime: ["font-mono text-xs leading-5 text-black/45"],
        itemReplies: ["font-mono text-xs leading-4 font-bold text-black/70"],
      },
      elegant: {
        groupLabel: [
          "px-3 text-xs leading-4 font-medium tracking-[-0.01em] text-foreground-placeholder",
        ],
        root: ["gap-0.5"],
        item: [
          "rounded-lg px-3 py-2.5",
          "hover:bg-ink-4",
          "has-[>[aria-current]:not([aria-current=false])]:bg-ink-6",
          "has-[[data-slot=topic-list-item-trigger]:focus-visible]:ring-2",
          "has-[[data-slot=topic-list-item-trigger]:focus-visible]:ring-primary-400/80",
        ],
        itemTitle: [
          "text-sm leading-5 font-medium tracking-[-0.01em] text-foreground-muted",
          "group-data-[unread=true]/topic-list-item:font-semibold",
          "group-data-[unread=true]/topic-list-item:text-foreground-strong",
          "[&>svg]:text-foreground-icon",
        ],
        itemExcerpt: [
          "text-[13px] leading-4.5 tracking-[-0.01em] text-foreground-placeholder",
          "group-data-[unread=true]/topic-list-item:text-foreground-muted",
        ],
        itemAuthor: ["font-medium text-foreground-muted"],
        itemTime: ["text-[11px] leading-5 font-medium text-foreground-placeholder"],
        itemReplies: [
          "text-xs leading-4 font-medium text-foreground-muted",
          "[&>svg]:text-foreground-icon",
        ],
      },
    },
  },
});
