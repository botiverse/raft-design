import { tv } from "../../lib/tv";

export const messageAttachment = tv({
  slots: {
    group: ["flex max-w-[22.5rem] flex-wrap items-start gap-2"],
    frame: [
      "group/attachment relative inline-block h-20 w-44 min-w-44 max-w-44 shrink-0 align-top",
      "[&>[data-slot=message-attachment-action]]:absolute [&>[data-slot=message-attachment-action]]:right-7 [&>[data-slot=message-attachment-action]]:bottom-1.5",
    ],
    card: [
      "group/attachment relative inline-flex h-20 w-44 min-w-44 max-w-44 shrink-0 flex-col overflow-hidden",
      "text-left",
      "has-[[data-slot=message-attachment-loading-bar]]:cursor-wait",
      "has-[[data-slot=message-attachment-icon]]:grid has-[[data-slot=message-attachment-icon]]:grid-cols-[2.5rem_minmax(0,1fr)] has-[[data-slot=message-attachment-icon]]:items-start has-[[data-slot=message-attachment-icon]]:gap-3",
      "has-[[data-slot=message-attachment-icon]]:[&>[data-slot=message-attachment-body]]:col-start-2 has-[[data-slot=message-attachment-icon]]:[&>[data-slot=message-attachment-body]]:row-start-1 has-[[data-slot=message-attachment-icon]]:[&>[data-slot=message-attachment-body]]:self-stretch",
      "has-[[data-slot=message-attachment-actions]]:[&>[data-slot=message-attachment-body]]:pr-7",
      "has-[[data-slot=message-attachment-pending-indicator]]:[&>[data-slot=message-attachment-body]]:pr-7 has-[[data-slot=message-attachment-loading-bar]]:[&>[data-slot=message-attachment-body]]:pb-6",
    ],
    icon: ["col-start-1 row-start-1 flex size-10 shrink-0 items-start justify-start self-start"],
    body: ["flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden"],
    title: ["block w-full max-w-full truncate"],
    meta: ["mt-auto flex min-w-0 max-w-full items-center"],
    metaLabel: ["min-w-0 flex-1 truncate"],
    metaDetail: ["inline-flex shrink-0 items-center gap-1", "[&_svg]:size-[9px] [&_svg]:shrink-0"],
    metaSeparator: ["text-foreground/35"],
    summary: ["mt-0.5 flex items-center whitespace-nowrap"],
    actions: ["absolute right-1.5 bottom-1.5 flex items-center gap-0.5"],
    action: ["relative flex size-5 items-center justify-center", "[&_svg]:size-3 [&_svg]:shrink-0"],
    loadingBar: ["absolute inset-x-0 bottom-0 flex h-6 items-center"],
    pendingIndicator: [
      "absolute right-2 bottom-2 inline-flex size-5 items-center justify-center",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
  },
  variants: {
    theme: {
      brutal: {
        card: [
          "border border-black/15 bg-white px-2.5 py-1 text-black transition-colors",
          "hover:border-black/30 hover:bg-black/5",
          "has-[[data-slot=message-attachment-loading-bar]]:bg-soft-signal/30",
          "has-[[data-slot=message-attachment-pending-indicator]]:opacity-70",
        ],
        icon: "text-black/60 group-hover/attachment:text-black",
        title: "text-xs font-bold text-black",
        meta: "gap-1.5 text-[10px] text-black/45",
        summary: "gap-1.5 font-mono text-[10px] font-bold tracking-[-0.04em] text-black/70",
        action: "text-black/60 group-hover/attachment:text-black",
        loadingBar:
          "gap-1.5 border-t-2 border-black bg-soft-signal px-2 text-[10px] font-bold uppercase tracking-wide text-black",
        pendingIndicator: "text-black/60",
      },
      elegant: {
        card: [
          "rounded-lg border border-line-subtle bg-layer-panel px-2.5 py-1 text-foreground shadow-xs",
          "transition-[background-color,border-color,box-shadow] duration-150",
          "hover:border-line-muted hover:bg-ink-2 hover:shadow-sm active:bg-ink-8",
          "has-[[data-slot=message-attachment-loading-bar]]:bg-soft-signal/20",
          "has-[[data-slot=message-attachment-pending-indicator]]:opacity-70",
        ],
        icon: "text-foreground-icon transition-colors group-hover/attachment:text-foreground",
        title: "text-xs font-medium text-foreground-strong",
        meta: "gap-1.5 text-[10px] text-foreground-placeholder",
        summary:
          "gap-1.5 font-mono text-[10px] font-medium tracking-[-0.04em] text-foreground-muted",
        action: "text-foreground-icon transition-colors group-hover/attachment:text-foreground",
        loadingBar:
          "gap-1.5 border-t border-line-subtle bg-ink-2 px-2 text-[10px] font-medium uppercase tracking-wide text-foreground-muted",
        pendingIndicator: "text-foreground-icon",
      },
    },
  },
});
