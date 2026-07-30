import { tv } from "../../lib/tv";

export const messageQuotedPreview = tv({
  slots: {
    root: ["group block w-full text-left"],
    content: [],
    header: ["flex items-start"],
    context: ["min-w-0 flex flex-1 flex-wrap items-center"],
    channel: ["inline-flex items-center"],
    thread: ["inline-flex items-center"],
    author: ["inline-flex min-w-0 items-center"],
    authorName: ["truncate"],
    authorMeta: ["truncate"],
    timestamp: ["shrink-0"],
    body: ["min-w-0"],
    text: ["line-clamp-2"],
    attachments: ["flex flex-wrap"],
    attachment: ["inline-flex items-center"],
    loading: ["w-full animate-pulse"],
    unavailable: ["group block w-full text-left"],
  },
  variants: {
    theme: {
      brutal: {
        root: "border border-black/15 bg-white hover:border-black/30 hover:bg-black/5",
        content: "px-2.5 py-2 sm:px-3 sm:py-2.5",
        header: "mb-1 gap-2 sm:mb-1.5",
        context: "gap-x-1.5 gap-y-1 text-xs leading-none text-black/30",
        channel: "gap-1 font-bold text-black/70",
        author: "gap-1.5",
        authorName: "font-bold text-black/70",
        authorMeta: "font-mono text-[10px] text-black/40",
        timestamp: "font-mono text-[10px] text-black/40",
        text: "text-xs leading-snug text-black sm:text-[13px]",
        attachments: "mt-2 gap-1.5",
        attachment:
          "gap-1 border-[1.5px] border-black bg-brutal-lavender px-1.5 py-0.5 font-mono text-[10px] font-bold leading-none text-black",
        thread: "gap-1 font-bold text-brutal-pink",
        loading: "border-2 border-black bg-white",
        unavailable:
          "border-2 border-black/30 bg-black/5 text-[13px] leading-snug italic text-black/40 hover:shadow-sm",
      },
      elegant: {
        root: [
          "rounded-md border border-line-subtle bg-layer-panel",
          "shadow-[0_1px_2px_oklch(0_0_0/0.04)]",
          "transition-[background-color,border-color,box-shadow] duration-150",
          "hover:border-line-strong hover:bg-layer-muted hover:shadow-[0_1px_3px_oklch(0_0_0/0.06)]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
        ],
        content: "px-3 py-2.5 sm:px-3.5 sm:py-3",
        header: "mb-1.5 gap-3",
        context: "gap-x-1.5 gap-y-1 text-[11px] leading-4 text-foreground-placeholder",
        channel: "gap-1 font-medium text-foreground-strong",
        author: "gap-1.5",
        authorName: "font-medium text-foreground-strong",
        authorMeta: "font-mono text-[11px] leading-4 text-foreground-muted",
        timestamp: "font-mono text-[11px] leading-4 text-foreground-muted tabular-nums",
        text: "text-[13px] leading-5 text-foreground-muted",
        attachments: "mt-1.5 gap-1.5",
        attachment:
          "gap-1 rounded-sm border border-line-subtle bg-layer-muted px-2 py-1 text-[11px] leading-4 font-medium text-foreground-muted",
        thread: "gap-1 font-medium text-foreground-strong",
        loading: "rounded-md border border-line-subtle bg-layer-panel p-3",
        unavailable:
          "rounded-md border border-line-subtle bg-layer-muted/50 text-foreground-muted transition-colors hover:border-line-strong hover:bg-layer-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      },
    },
  },
});
