import { tv } from "../../lib/tv";

export const messageAttachment = tv({
  slots: {
    group: "flex max-w-[360px] flex-wrap items-start gap-2",
    card: [
      "group/attachment relative inline-flex h-20 w-44 min-w-44 max-w-44 shrink-0 flex-col overflow-hidden",
      "text-left",
    ],
    title: "block w-full max-w-full shrink-0 truncate",
    meta: "mt-auto flex w-full min-w-0 max-w-full items-center justify-between",
    metaStart: "min-w-0 flex-1 truncate",
    metaEnd: [
      "ml-auto inline-flex shrink-0 items-center gap-1",
      "[&_svg]:size-[10px] [&_svg]:shrink-0",
    ],
    summary: [
      "mt-0.5 inline-flex shrink-0 items-center whitespace-nowrap",
      "text-[10px]",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    commentSummary: "gap-[2.5px]",
    diffSummary: "gap-1.5",
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
        card: [
          "border border-black/15 bg-white px-2.5 py-1.5 text-black transition-colors",
          "hover:border-black/30 hover:bg-ink-2",
        ],
        title: "text-xs font-medium text-black",
        meta: "gap-1.5 text-[10px] text-black/45",
        summary: "font-medium text-black/45",
        diffAddition: "text-success",
        diffDeletion: "text-danger",
        action: "text-black/60 group-hover/attachment:text-black",
      },
      elegant: {
        card: [
          "h-18 rounded-[5px] border-[0.5px] border-line-muted/70 bg-layer-panel px-2.5 py-1.5 text-foreground-strong shadow-raft-xs",
          "transition-[background-color,border-color] duration-150",
          "hover:border-line-muted hover:bg-ink-2 active:bg-ink-8",
          "dark:border-transparent dark:hover:border-transparent",
          "dark:hover:bg-[color-mix(in_oklch,var(--ink)_5%,var(--layer-panel))]",
          "dark:active:bg-[color-mix(in_oklch,var(--ink)_8%,var(--layer-panel))]",
        ],
        title: "text-xs font-medium text-foreground",
        meta: "gap-1.5 text-[10px] text-foreground-placeholder",
        summary: "font-medium text-foreground-placeholder",
        diffAddition: "text-success",
        diffDeletion: "text-danger",
        action:
          "text-foreground-icon transition-colors group-hover/attachment:text-foreground-strong",
      },
      raft: {
        card: [
          "rounded-container border border-line-muted bg-layer-card py-2 pr-1.5 pl-2.5 text-foreground",
          "outline-none hover:press-overlay active:press-overlay focus-visible:shadow-raft-focus",
          "[&_[data-slot=message-attachment-action]_svg]:size-4",
        ],
        title: "pr-1 font-sans text-callout font-semibold text-foreground",
        meta: "gap-2 font-mono text-mono-meta text-foreground-hint",
        summary: "pr-1 font-mono text-mono-meta text-foreground-hint [&_svg]:size-3.5",
        diffAddition: "text-success-strong",
        diffDeletion: "text-danger-strong",
        action: [
          "-my-1 size-6 rounded-control text-foreground",
          "outline-none hover:bg-fill-pressed active:bg-fill-pressed",
          "focus-visible:shadow-raft-focus",
          "[&_svg]:size-4",
        ],
      },
    },
  },
});
