import { tv } from "../../lib/tv";

export const messageAttachment = tv({
  slots: {
    group: ["flex max-w-[22.5rem] flex-wrap items-start gap-2"],
    frame: [
      "group/attachment relative inline-block h-20 w-44 min-w-44 max-w-44 shrink-0 align-top",
      "[&>[data-slot=message-attachment-action]]:absolute [&>[data-slot=message-attachment-action]]:right-7 [&>[data-slot=message-attachment-action]]:bottom-1.5",
    ],
    card: [
      "group/attachment relative inline-flex h-20 w-44 min-w-44 max-w-44 shrink-0 flex-col justify-between overflow-hidden",
      "border px-2.5 py-2 text-left transition-colors",
      "has-[[data-slot=message-attachment-loading-bar]]:cursor-wait has-[[data-slot=message-attachment-loading-bar]]:bg-soft-signal/30",
      "has-[[data-slot=message-attachment-pending-indicator]]:opacity-70",
    ],
    icon: [
      "absolute bottom-1.5 right-1.5 flex size-5 items-center justify-center",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    body: ["w-full min-w-0 max-w-full overflow-hidden"],
    title: ["block w-full max-w-full truncate text-xs font-bold"],
    meta: ["mt-0.5 block truncate text-[10px]"],
    metaDetail: ["inline-flex items-center gap-1 pl-1", "[&_svg]:size-[9px] [&_svg]:shrink-0"],
    metaSeparator: ["text-foreground/35"],
    summary: [
      "flex items-center gap-1.5 whitespace-nowrap pr-5",
      "font-mono text-[10px] font-bold tracking-[-0.04em]",
    ],
    actions: ["absolute right-1.5 bottom-1.5 flex items-center gap-0.5"],
    action: ["relative flex size-5 items-center justify-center", "[&_svg]:size-3 [&_svg]:shrink-0"],
    loadingBar: [
      "absolute inset-x-0 bottom-0 flex h-6 items-center gap-1.5",
      "border-t-2 border-line-strong px-2",
      "text-[10px] font-bold uppercase tracking-wide",
    ],
    pendingIndicator: [
      "absolute right-2 bottom-2 inline-flex size-5 items-center justify-center",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    errorOverlay: [
      "absolute inset-0 flex flex-col items-center justify-center gap-1",
      "border border-line-strong bg-warning-base/90 px-2 text-center",
      "text-[10px] font-bold leading-tight text-foreground",
    ],
  },
  variants: {
    theme: {
      brutal: {
        card: ["border-black/15 bg-white text-black", "hover:border-black/30 hover:bg-black/5"],
        icon: "text-black/60 group-hover/attachment:text-black",
        title: "text-black",
        meta: "text-black/45",
        summary: "text-black/70",
        action: "text-black/60 group-hover/attachment:text-black",
        loadingBar: "bg-soft-signal text-black",
        pendingIndicator: "text-black/60",
      },
      elegant: {
        card: [
          "rounded-lg border-line-subtle bg-layer-panel text-foreground",
          "hover:border-line-muted hover:bg-layer-muted",
        ],
        icon: "text-foreground-icon group-hover/attachment:text-foreground",
        title: "text-foreground-strong",
        meta: "text-foreground-placeholder",
        summary: "text-foreground-muted",
        action: "text-foreground-icon group-hover/attachment:text-foreground",
        loadingBar: "border-line-subtle bg-layer-muted text-foreground-muted",
        pendingIndicator: "text-foreground-icon",
      },
    },
  },
});
