import { tv } from "../../lib/tv";

export const comment = tv({
  slots: {
    margin: ["relative min-w-0"],
    marginItem: [
      "absolute inset-x-0 top-0",
      "data-animate:transition-transform data-animate:duration-150 data-animate:ease-out",
      "motion-reduce:transition-none",
      "data-active:z-10",
    ],
    card: [
      "relative flex min-w-0 flex-col gap-2",
      "rounded-container border border-line-hairline p-3",
      "bg-layer-card text-foreground shadow-none outline-none",
      "data-active:border-[1.5px] data-active:border-line-strong data-active:p-[11.5px] data-active:shadow-float",
    ],
    cardTrigger: [
      "absolute -inset-px z-10 cursor-pointer",
      "rounded-container border-0 bg-transparent p-0",
      "hover:bg-fill-row-hover active:bg-fill-pressed",
      "outline-none focus-visible:shadow-focus",
    ],
    cardQuote: ["sr-only"],
    cardMeta: [
      "flex min-w-0 items-center gap-1",
      "font-sans text-caption text-foreground-hint",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
    ],
    entry: ["flex min-w-0 flex-col gap-1", "[[data-slot=comment-entry]+&]:mt-1"],
    entryHeader: ["flex min-w-0 items-center gap-1.5", "*:data-[slot=avatar]:me-0.5"],
    entryAuthor: ["min-w-0 truncate", "text-subhead font-bold text-foreground"],
    entryTime: [
      "shrink-0 whitespace-nowrap",
      "font-mono text-mono-meta tabular-nums text-foreground-hint",
    ],
    entryBody: [
      "wrap-break-word select-text",
      "text-callout text-foreground",
      "selection:bg-brand-soft",
    ],
    marker: [
      "relative inline-flex h-6 shrink-0 items-center gap-1 align-top whitespace-nowrap",
      "rounded-chip border border-line-hairline py-0 ps-[3px] pe-1.5",
      "font-mono text-mono-meta font-bold tabular-nums text-foreground",
      "bg-layer-card [--avatar-group-surface:var(--layer-card)]",
      "cursor-pointer hover:press-overlay active:press-overlay",
      "data-active:border-[1.5px] data-active:border-line-strong data-active:bg-brand-soft data-active:ps-[2.5px] data-active:pe-[5.5px]",
      "data-popup-open:border-[1.5px] data-popup-open:border-line-strong data-popup-open:bg-brand-soft data-popup-open:ps-[2.5px] data-popup-open:pe-[5.5px]",
      "data-active:[--avatar-group-surface:var(--brand-soft)] data-popup-open:[--avatar-group-surface:var(--brand-soft)]",
      "outline-none focus-visible:shadow-focus",
      "after:absolute after:-inset-x-1 after:-inset-y-2.5",
    ],
  },
  variants: {
    clamp: {
      true: { entryBody: ["line-clamp-2"] },
    },
  },
});
