import { tv } from "../../lib/tv";

export const messageAttachment = tv({
  slots: {
    group: ["flex max-w-[22.5rem] flex-wrap items-start"],
    frame: [
      "group/attachment relative inline-block h-20 w-44 min-w-44 max-w-44 shrink-0 align-top",
      "[&>[data-slot=message-attachment-action]]:absolute [&>[data-slot=message-attachment-action]]:right-7 [&>[data-slot=message-attachment-action]]:bottom-1.5",
    ],
    card: [
      "group/attachment relative inline-flex h-20 w-44 min-w-44 max-w-44 shrink-0 flex-col justify-between overflow-hidden",
      "text-left",
      "has-[[data-slot=message-attachment-loading-bar]]:cursor-wait",
    ],
    icon: [
      "absolute bottom-1.5 right-1.5 flex size-5 items-center justify-center",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    body: ["w-full min-w-0 max-w-full overflow-hidden"],
    title: ["block w-full max-w-full truncate"],
    meta: ["flex min-w-0 max-w-full items-center"],
    metaLabel: ["min-w-0 flex-1 truncate"],
    metaDetail: ["inline-flex shrink-0 items-center gap-1", "[&_svg]:size-[9px] [&_svg]:shrink-0"],
    metaSeparator: ["text-foreground/35"],
    summary: ["flex items-center whitespace-nowrap pr-5"],
    actions: ["absolute right-1.5 bottom-1.5 flex items-center gap-0.5"],
    action: ["relative flex size-5 items-center justify-center", "[&_svg]:size-3 [&_svg]:shrink-0"],
    loadingBar: ["absolute inset-x-0 bottom-0 flex h-6 items-center"],
    pendingIndicator: [
      "absolute right-2 bottom-2 inline-flex size-5 items-center justify-center",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    errorOverlay: ["absolute inset-0 flex flex-col items-center justify-center text-center"],
  },
  variants: {
    theme: {
      brutal: {
        group: "gap-2",
        card: [
          "border border-black/15 bg-white px-2.5 py-2 text-black transition-colors",
          "hover:border-black/30 hover:bg-black/5",
          "has-[[data-slot=message-attachment-loading-bar]]:bg-soft-signal/30",
          "has-[[data-slot=message-attachment-pending-indicator]]:opacity-70",
        ],
        icon: "text-black/60 group-hover/attachment:text-black",
        title: "text-xs font-bold text-black",
        meta: "mt-0.5 gap-1.5 text-[10px] text-black/45",
        summary: "gap-1.5 font-mono text-[10px] font-bold tracking-[-0.04em] text-black/70",
        action: "text-black/60 group-hover/attachment:text-black",
        loadingBar:
          "gap-1.5 border-t-2 border-black bg-soft-signal px-2 text-[10px] font-bold uppercase tracking-wide text-black",
        pendingIndicator: "text-black/60",
        errorOverlay:
          "gap-1 border border-line-strong bg-warning-base/90 px-2 text-[10px] font-bold leading-tight text-foreground",
      },
      elegant: {
        group: "gap-2",
        card: [
          "rounded-lg border border-line-subtle bg-layer-panel px-2.5 py-2 text-foreground transition-colors",
          "hover:border-line-muted hover:bg-layer-muted",
          "has-[[data-slot=message-attachment-loading-bar]]:bg-soft-signal/30",
          "has-[[data-slot=message-attachment-pending-indicator]]:opacity-70",
        ],
        icon: "text-foreground-icon group-hover/attachment:text-foreground",
        title: "text-xs font-medium text-foreground-strong",
        meta: "mt-0.5 gap-1.5 text-[10px] text-foreground-placeholder",
        summary:
          "gap-1.5 font-mono text-[10px] font-medium tracking-[-0.04em] text-foreground-muted",
        action: "text-foreground-icon group-hover/attachment:text-foreground",
        loadingBar:
          "gap-1.5 border-t border-line-subtle bg-layer-muted px-2 text-[10px] font-medium uppercase tracking-wide text-foreground-muted",
        pendingIndicator: "text-foreground-icon",
        errorOverlay:
          "gap-1 border border-line-strong bg-warning-base/90 px-2 text-[10px] font-medium leading-tight text-foreground",
      },
    },
  },
});
