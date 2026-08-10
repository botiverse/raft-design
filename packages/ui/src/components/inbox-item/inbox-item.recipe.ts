import { tv } from "../../lib/tv";

export const inboxItem = tv({
  slots: {
    item: [
      "relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-3 p-3 text-left",
      "has-data-[slot=inbox-item-selection]:grid-cols-[auto_minmax(0,1fr)_auto]",
      "transition-colors",
    ],
    itemTrigger: ["absolute inset-0 z-0 outline-none"],
    itemSelection: ["relative z-10 mt-0.5 flex size-4 shrink-0 items-center justify-center"],
    itemContent: ["pointer-events-none relative z-10 min-w-0 flex-1 text-left"],
    itemContext: ["flex min-w-0 items-center gap-2 py-0.5"],
    itemSubtitle: ["mb-0.5 min-w-0 py-0.5 text-[11px] leading-3"],
    itemHeading: ["mb-0.5 flex min-w-0 items-start gap-2"],
    itemTitle: [
      "relative line-clamp-2 min-w-0 flex-1 pl-[18px] text-sm leading-5",
      "[&>svg]:absolute [&>svg]:top-[3px] [&>svg]:left-0 [&>svg]:size-3.5",
    ],
    itemTrailing: [
      "pointer-events-none relative z-10 -mt-1.5",
      "flex shrink-0 items-center gap-3",
      "max-md:flex-col-reverse max-md:items-end max-md:gap-0.5",
    ],
    itemTimestamp: ["shrink-0 whitespace-nowrap text-right text-xs leading-5 tabular-nums"],
    itemBody: ["line-clamp-2 text-xs leading-4"],
    itemMessage: ["min-w-0"],
    itemSender: [],
    itemMetadata: ["mt-1 flex min-h-5 flex-wrap items-center gap-1.5"],
    itemActions: ["pointer-events-auto flex shrink-0 items-center gap-1.5"],
  },
  variants: {
    theme: {
      brutal: {
        item: [
          "border-2 border-black/30 bg-white",
          "hover:border-black hover:shadow-raft-sm",
          "active:border-black active:shadow-raft-sm",
          "data-disabled:pointer-events-none data-disabled:hover:border-black/30 data-disabled:hover:shadow-none",
          "data-[active=true]:border-black data-[active=true]:shadow-raft-sm",
          "data-[active=true]:hover:border-black data-[active=true]:hover:shadow-raft-sm",
          "has-[[data-slot=inbox-item-open]:focus-visible]:border-black has-[[data-slot=inbox-item-open]:focus-visible]:shadow-raft-sm",
        ],
        itemContext: ["mb-1 py-0 text-xs leading-4 font-bold text-black/45"],
        itemSubtitle: ["font-bold text-black/45"],
        itemTitle: [
          "font-semibold text-black/55",
          "group-data-[unread=true]/inbox-item:font-bold",
          "group-data-[unread=true]/inbox-item:text-black",
          "[&>svg]:text-black/45",
        ],
        itemTimestamp: ["font-mono text-black/40"],
        itemTrailing: ["-mt-1"],
        itemBody: ["text-black/55", "group-data-[unread=true]/inbox-item:text-black"],
        itemMessage: ["line-clamp-3 text-sm leading-5 text-black"],
        itemSender: ["font-bold text-black/70"],
        itemActions: [
          "[&>[data-slot=panel-toggle-action][data-pressed]]:bg-white",
          "[&>[data-slot=panel-toggle-action][data-pressed]]:text-brutal-orange",
          "[&>[data-slot=panel-toggle-action][data-pressed]:hover]:bg-white",
          "[&>[data-slot=panel-toggle-action][data-pressed]:hover]:text-brutal-orange",
        ],
      },
      elegant: {
        item: [
          "p-3",
          "rounded-lg border-[0.5px] border-line-muted bg-layer-panel shadow-raft-xs",
          "transition-[background-color,border-color] duration-150",
          "hover:bg-[color-mix(in_oklch,var(--ink)_1%,var(--layer-panel))]",
          "dark:border-transparent",
          "data-disabled:pointer-events-none",
          "data-[active=true]:border-transparent data-[active=true]:ring-1 data-[active=true]:ring-primary-400 data-[active=true]:ring-offset-2 data-[active=true]:ring-offset-layer-canvas-muted",
          "dark:data-[active=true]:ring-2",
          "has-[[data-slot=inbox-item-open]:focus-visible]:ring-1 has-[[data-slot=inbox-item-open]:focus-visible]:ring-primary-400",
          "dark:has-[[data-slot=inbox-item-open]:focus-visible]:ring-2 dark:has-[[data-slot=inbox-item-open]:focus-visible]:ring-primary-400/60",
        ],
        itemContext: [
          "mb-1 text-xs leading-4 tracking-[-0.01em]",
          "font-medium text-foreground-placeholder",
        ],
        itemSubtitle: [
          "mb-1 text-xs leading-4 tracking-[-0.01em]",
          "font-medium text-foreground-placeholder",
        ],
        itemHeading: ["mb-1"],
        itemTitle: [
          "text-sm leading-5 font-medium tracking-[-0.01em] text-foreground",
          "group-data-[unread=true]/inbox-item:text-foreground-strong",
          "[&>svg]:text-foreground-icon",
        ],
        itemTimestamp: [
          "text-[11px] leading-5 font-medium tabular-nums",
          "text-foreground-placeholder",
        ],
        itemBody: [
          "text-[13px] leading-4.5",
          "tracking-[-0.01em] text-foreground-muted",
          "group-data-[unread=true]/inbox-item:text-foreground",
        ],
        itemMessage: [
          "line-clamp-2 text-[13px] leading-4.5",
          "tracking-[-0.01em] text-foreground-muted",
        ],
        itemMetadata: ["mt-2"],
        itemSender: ["font-medium text-foreground"],
        itemActions: [
          "gap-0.5",
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
