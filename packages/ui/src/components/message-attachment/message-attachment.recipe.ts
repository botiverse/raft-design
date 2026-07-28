import { tv } from "../../lib/tv";

export const messageAttachment = tv({
  slots: {
    group: ["flex max-w-[22.5rem] flex-wrap items-start gap-2"],
    content: [
      "group/attachment relative inline-flex h-20 w-44 min-w-44 max-w-44 shrink-0 flex-col overflow-hidden",
      "text-left",
    ],
    title: ["block w-full max-w-full shrink-0 truncate"],
    meta: ["mt-auto flex w-full min-w-0 max-w-full items-center justify-between"],
    metaLabel: ["min-w-0 flex-1 truncate"],
    metaDetail: ["inline-flex shrink-0 items-center gap-1", "[&_svg]:size-[9px] [&_svg]:shrink-0"],
    metaSeparator: ["text-foreground/35"],
    summary: [
      "mt-0.5 flex shrink-0 items-center whitespace-nowrap",
      "[&_svg]:size-[9px] [&_svg]:shrink-0",
    ],
    commentSummary: ["gap-[2.5px]"],
    diffSummary: [],
    diffAddition: [],
    diffDeletion: [],
    action: [
      "relative flex size-3 items-center justify-center",
      "before:absolute before:-inset-1 before:content-['']",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
  },
  variants: {
    theme: {
      brutal: {
        content: [
          "border border-black/15 bg-white px-2.5 py-1.5 text-black transition-colors",
          "hover:border-black/30 hover:bg-ink-2",
        ],
        title: "text-xs font-medium text-black",
        meta: "gap-1.5 text-[10px] text-black/45",
        summary: "gap-1.5 font-mono text-[10px] font-bold tracking-[-0.04em] text-black/70",
        commentSummary: "text-black/45",
        diffAddition: "text-success-dark",
        diffDeletion: "text-danger-base",
        action: "text-black/60 group-hover/attachment:text-black",
      },
      elegant: {
        content: [
          "h-18 rounded-[5px] border-[0.5px] border-line-subtle/70 bg-layer-panel px-2.5 py-1.5 text-foreground shadow-xs",
          "transition-[background-color,border-color] duration-150",
          "hover:border-line-subtle hover:bg-ink-2 active:bg-ink-8",
        ],
        title: "text-xs font-medium text-foreground-strong",
        meta: "gap-1.5 text-[10px] text-foreground-placeholder",
        summary:
          "gap-1.5 font-mono text-[10px] font-medium tracking-[-0.04em] text-foreground-muted",
        commentSummary: "text-foreground-placeholder",
        diffAddition: "text-success-dark",
        diffDeletion: "text-danger-base",
        action: "text-foreground-icon transition-colors group-hover/attachment:text-foreground",
      },
    },
  },
});
