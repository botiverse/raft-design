import { tv } from "../../lib/tv";

export const messageAttachment = tv({
  slots: {
    group: "flex max-w-[360px] flex-wrap items-start gap-2",
    card: [
      "group/attachment relative inline-flex h-20 w-44 min-w-44 max-w-44 shrink-0 flex-col overflow-hidden",
      "text-left",
      "rounded-container border border-line-hairline bg-layer-card py-2 pr-1.5 pl-2.5 text-foreground",
      "outline-none hover:press-overlay active:press-overlay focus-visible:shadow-focus",
      "[&_[data-slot=message-attachment-action]_svg]:size-4",
    ],
    title: [
      "block w-full max-w-full shrink-0 truncate",
      "pr-1 font-sans text-callout font-semibold text-foreground",
    ],
    meta: [
      "mt-auto flex w-full min-w-0 max-w-full items-center justify-between",
      "gap-2 font-mono text-mono-meta text-foreground-hint",
    ],
    metaStart: "min-w-0 flex-1 truncate",
    metaEnd: [
      "ml-auto inline-flex shrink-0 items-center gap-1",
      "[&_svg]:size-[10px] [&_svg]:shrink-0",
    ],
    summary: [
      "mt-0.5 inline-flex shrink-0 items-center whitespace-nowrap",
      "[&_svg]:shrink-0",
      "pr-1 font-mono text-mono-meta text-foreground-hint [&_svg]:size-3.5",
    ],
    commentSummary: "gap-[2.5px]",
    diffSummary: "gap-1.5",
    diffAddition: ["text-success-strong"],
    diffDeletion: ["text-danger-strong"],
    action: [
      "relative flex items-center justify-center",
      "before:absolute before:-inset-1 before:content-['']",
      "[&_svg]:shrink-0",
      "-my-1 size-6 rounded-control text-foreground",
      "outline-none hover:bg-fill-pressed active:bg-fill-pressed",
      "focus-visible:shadow-focus",
      "[&_svg]:size-4",
    ],
  },
});
