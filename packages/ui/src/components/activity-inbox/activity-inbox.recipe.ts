import { tv } from "../../lib/tv";

export const activityInbox = tv({
  slots: {
    list: ["flex flex-col gap-2"],
    item: ["relative flex w-full items-start gap-3 p-3 text-left", "transition-colors"],
    itemOpen: ["absolute inset-0 z-0 outline-none"],
    itemSelection: ["relative z-10 mt-0.5 flex size-4 shrink-0 items-center justify-center"],
    itemContent: ["pointer-events-none relative z-10 min-w-0 flex-1 text-left"],
    itemSubtitle: ["mb-0.5 min-w-0 text-[11px] leading-3"],
    itemHeading: ["mb-0.5 flex min-w-0 items-start gap-2"],
    itemTitle: [
      "line-clamp-2 min-w-0 flex-1 text-sm leading-5",
      "[&>svg]:mr-1.5 [&>svg]:inline-block [&>svg]:size-[13px] [&>svg]:align-[-2px]",
    ],
    itemTrailing: ["pointer-events-none relative z-10 flex shrink-0 items-center gap-3"],
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
          "aria-disabled:pointer-events-none aria-disabled:hover:border-black/30 aria-disabled:hover:shadow-none",
          "data-[active=true]:border-black data-[active=true]:bg-white data-[active=true]:shadow-[2px_2px_0px_oklch(0.1812926_0.0049716_17.6198)]",
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
        list: ["gap-2.5"],
        item: [
          "p-4",
          "rounded-lg border-[0.5px] border-line-subtle bg-[oklch(0.985_0.003_84.559)] shadow-xs",
          "transition-[background-color,box-shadow] duration-150",
          "hover:bg-[color-mix(in_oklch,var(--ink)_2%,oklch(0.985_0.003_84.559))] hover:shadow-sm",
          "aria-disabled:pointer-events-none",
          "data-[active=true]:border-line data-[active=true]:bg-layer-active data-[active=true]:shadow-sm",
          "has-[[data-slot=activity-inbox-item-open]:focus-visible]:ring-1 has-[[data-slot=activity-inbox-item-open]:focus-visible]:ring-primary-400",
        ],
        itemSubtitle: ["mb-1", "font-medium text-foreground-muted/70"],
        itemHeading: ["mb-1 items-baseline"],
        itemTitle: [
          "font-normal tracking-[-0.01em] text-foreground-muted",
          "group-data-[unread=true]/activity-item:font-medium",
          "group-data-[unread=true]/activity-item:text-foreground-strong",
          "[&>svg]:text-foreground-icon",
        ],
        itemTimestamp: ["tabular-nums text-foreground-muted/70"],
        itemBody: [
          "leading-4.5",
          "tracking-[-0.01em] text-foreground-muted",
          "group-data-[unread=true]/activity-item:text-foreground",
        ],
        itemMetadata: ["mt-2"],
        itemSender: ["font-medium text-foreground-muted"],
        itemActions: [
          "[&>[data-slot=panel-toggle-action][data-pressed]]:bg-transparent",
          "[&>[data-slot=panel-toggle-action][data-pressed]]:text-primary-400",
          "[&>[data-slot=panel-toggle-action][data-pressed]:hover]:bg-layer-strong/80",
          "[&>[data-slot=panel-toggle-action][data-pressed]:hover]:text-primary-400",
        ],
      },
    },
  },
});
