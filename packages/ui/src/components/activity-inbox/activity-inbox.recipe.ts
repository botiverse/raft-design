import { tv } from "../../lib/tv";

export const activityInbox = tv({
  slots: {
    list: ["flex flex-col gap-2"],
    item: [
      "relative flex w-full items-start gap-3 p-3 text-left",
      "has-[[data-slot=activity-inbox-item-trailing]]:[&_[data-slot=activity-inbox-item-heading]]:pr-36",
      "has-[[data-slot=activity-inbox-item-trailing]]:[&_[data-slot=activity-inbox-item-subtitle]]:pr-36",
      "transition-colors",
    ],
    itemOpen: ["absolute inset-0 z-0 outline-none"],
    itemSelection: ["relative z-10 mt-0.5 flex size-4 shrink-0 items-center justify-center"],
    itemContent: ["pointer-events-none relative z-10 min-w-0 flex-1 text-left"],
    itemSubtitle: ["mb-0.5 min-w-0 py-0.5 text-[11px] leading-3"],
    itemHeading: ["mb-0.5 flex min-w-0 items-start gap-2"],
    itemTitle: [
      "relative line-clamp-2 min-w-0 flex-1 pl-[18px] text-sm leading-5",
      "[&>svg]:absolute [&>svg]:top-[3px] [&>svg]:left-0 [&>svg]:size-3.5",
    ],
    itemTrailing: [
      "pointer-events-none absolute top-1.5 right-3 z-10",
      "flex shrink-0 items-center gap-3",
    ],
    itemTimestamp: ["shrink-0 whitespace-nowrap text-right text-xs leading-5 tabular-nums"],
    itemBody: ["line-clamp-2 text-xs leading-4"],
    itemSender: [],
    itemMetadata: ["mt-1 flex min-h-5 flex-wrap items-center gap-1.5"],
    itemActions: ["pointer-events-auto flex shrink-0 items-center gap-1.5"],
  },
  variants: {
    theme: {
      brutal: {
        item: [
          "border-2 border-black/30 bg-white",
          "hover:border-black hover:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
          "active:border-black active:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
          "data-[disabled]:pointer-events-none data-[disabled]:hover:border-black/30 data-[disabled]:hover:shadow-none",
          "data-[active=true]:border-primary-400 data-[active=true]:hover:border-primary-400",
          "has-[[data-slot=activity-inbox-item-open]:focus-visible]:border-black has-[[data-slot=activity-inbox-item-open]:focus-visible]:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
        ],
        itemSubtitle: ["font-bold text-black/45"],
        itemTitle: [
          "font-semibold text-black/55",
          "group-data-[unread=true]/activity-item:font-bold",
          "group-data-[unread=true]/activity-item:text-black",
          "[&>svg]:text-black/45",
        ],
        itemTimestamp: ["font-mono text-black/40"],
        itemTrailing: ["top-2"],
        itemBody: ["text-black/55", "group-data-[unread=true]/activity-item:text-black"],
        itemSender: ["font-bold text-black/70"],
        itemActions: [
          "[&>[data-slot=panel-toggle-action][data-pressed]]:bg-white",
          "[&>[data-slot=panel-toggle-action][data-pressed]]:text-brutal-orange",
          "[&>[data-slot=panel-toggle-action][data-pressed]:hover]:bg-white",
          "[&>[data-slot=panel-toggle-action][data-pressed]:hover]:text-brutal-orange",
        ],
      },
      elegant: {
        list: [
          "gap-2.5 rounded-[10px] bg-[color-mix(in_oklch,var(--ink-4),var(--layer-panel))] p-3 shadow-raft-xs",
          "dark:bg-layer-card",
        ],
        item: [
          "p-3",
          "rounded-lg border-[0.5px] border-line-muted bg-layer-panel shadow-raft-xs",
          "transition-[background-color,border-color] duration-150",
          "hover:bg-[color-mix(in_oklch,var(--ink)_1%,var(--layer-panel))]",
          "dark:border-transparent",
          "data-[disabled]:pointer-events-none",
          "data-[active=true]:border-transparent data-[active=true]:ring-2 data-[active=true]:ring-primary-400 data-[active=true]:ring-offset-2 data-[active=true]:ring-offset-layer-page",
          "has-[[data-slot=activity-inbox-item-open]:focus-visible]:ring-1 has-[[data-slot=activity-inbox-item-open]:focus-visible]:ring-primary-400",
          "dark:has-[[data-slot=activity-inbox-item-open]:focus-visible]:ring-2 dark:has-[[data-slot=activity-inbox-item-open]:focus-visible]:ring-primary-400/60",
        ],
        itemSubtitle: ["mb-1", "font-medium text-foreground-placeholder"],
        itemHeading: ["mb-1"],
        itemTitle: [
          "font-normal tracking-[-0.01em] text-foreground",
          "group-data-[unread=true]/activity-item:font-medium",
          "group-data-[unread=true]/activity-item:text-foreground-strong",
          "[&>svg]:text-foreground-icon",
        ],
        itemTimestamp: ["tabular-nums text-foreground-placeholder"],
        itemBody: [
          "text-[13px] leading-4.5",
          "tracking-[-0.01em] text-foreground-muted",
          "group-data-[unread=true]/activity-item:text-foreground",
        ],
        itemMetadata: ["mt-2"],
        itemSender: ["font-medium text-foreground"],
        itemActions: [
          "[&>[data-slot=panel-toggle-action][data-pressed]]:bg-transparent",
          "[&>[data-slot=panel-toggle-action][data-pressed]]:text-primary-400",
          "[&>[data-slot=panel-toggle-action][data-pressed]:hover]:bg-fill-strong/80",
          "[&>[data-slot=panel-toggle-action][data-pressed]:hover]:text-primary-400",
          "dark:[&>[data-slot=panel-toggle-action][data-pressed]]:bg-fill-muted",
          "dark:[&>[data-slot=panel-toggle-action][data-pressed]:hover]:bg-fill-strong",
        ],
      },
    },
  },
});
