import { tv } from "../../lib/tv";

export const messageQuotedPreview = tv({
  slots: {
    root: ["group block w-full text-left"],
    content: ["min-w-0"],
    header: ["flex min-w-0 items-center"],
    context: ["min-w-0 flex flex-wrap items-center"],
    channel: ["inline-flex items-center"],
    thread: ["inline-flex items-center"],
    author: ["inline-flex min-w-0 items-center"],
    authorName: ["truncate"],
    authorMeta: ["truncate"],
    timestamp: ["ml-auto shrink-0"],
    text: ["line-clamp-2"],
    attachments: ["mt-2 flex flex-wrap gap-1.5"],
    attachment: ["inline-flex items-center"],
    loading: ["w-full animate-pulse"],
    unavailable: ["group block w-full text-left"],
  },
  variants: {
    theme: {
      brutal: {
        root: "border border-black/15 bg-white hover:border-black/20 hover:bg-[color-mix(in_oklch,black_2%,white)]",
        content: "px-2.5 py-2.5 sm:px-3 sm:py-3",
        header: "gap-2 border-b border-black/15 px-2.5 py-2 sm:px-3 sm:py-2.5",
        context: "mb-1 gap-x-1.5 gap-y-1 text-xs leading-none text-black/30",
        channel: "gap-1 text-[11px] leading-4 font-bold text-black/70",
        author: "gap-1.5",
        authorName: "font-bold text-black/70",
        authorMeta: "font-mono text-[10px] text-black/40",
        timestamp: "font-mono text-[11px] leading-4 text-black/40",
        text: "text-xs leading-snug text-black sm:text-[13px]",
        attachment:
          "gap-1 border-[1.5px] border-black bg-brutal-lavender px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none text-black",
        thread: "gap-1 text-[11px] leading-4 font-bold text-brutal-pink",
        loading: "border border-black/15 bg-white",
        unavailable:
          "border-2 border-black/30 bg-black/5 text-[13px] leading-snug italic text-black/40 hover:shadow-sm",
      },
      elegant: {
        root: [
          "overflow-clip rounded-md border-[0.5px] border-line-subtle bg-layer-panel shadow-xs",
          "transition-[background-color,box-shadow] duration-150",
          "hover:bg-[color-mix(in_oklch,var(--ink)_2%,var(--layer-panel))] hover:shadow-sm",
          "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-1px] focus-visible:outline-[oklch(0.507_0.185_257.731)]",
        ],
        content: "px-3 py-3 sm:px-3.5 sm:py-3.5",
        header:
          "gap-2 border-b border-line-subtle bg-[color-mix(in_oklch,var(--layer-panel)_99%,var(--ink))] px-3 py-2 transition-colors duration-150 group-hover:bg-[color-mix(in_oklch,var(--layer-panel)_97%,var(--ink))] sm:px-3.5 sm:py-2.5",
        context: "mb-1.5 gap-x-1.5 gap-y-1 text-[11px] leading-4 text-foreground-placeholder",
        channel: "gap-1 text-[11px] leading-4 font-medium text-foreground-muted",
        author: "gap-1.5",
        authorName: "font-medium text-foreground-strong",
        authorMeta: "font-mono text-[11px] leading-4 text-foreground-muted",
        timestamp: "text-[11px] leading-4 text-foreground-muted tabular-nums",
        text: "text-[13px] leading-5 text-foreground-muted",
        attachment:
          "gap-1 rounded-sm border border-line-subtle bg-layer-muted px-2 py-1 text-[11px] leading-4 font-medium text-foreground-muted",
        thread: "gap-1 text-[11px] leading-4 font-medium text-foreground-muted",
        loading: "rounded-md border-[0.5px] border-line-subtle bg-layer-panel p-3",
        unavailable:
          "rounded-md border border-line-subtle bg-layer-muted/50 text-foreground-muted transition-colors hover:border-line-strong hover:bg-layer-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      },
    },
  },
});
