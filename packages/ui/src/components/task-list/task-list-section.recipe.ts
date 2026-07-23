import { tv } from "../../lib/tv";

export const taskListSection = tv({
  slots: {
    root: ["space-y-[10px]"],
    trigger: [
      "group flex w-full touch-manipulation items-center justify-between gap-[12px] text-left outline-none",
      "disabled:cursor-default",
    ],
    heading: ["flex min-w-0 items-center gap-[8px]"],
    badge: ["px-[8px] py-[2px]", "text-[10px]"],
    count: ["text-[12px] leading-[16px]"],
    chevron: [
      "inline-flex shrink-0 -rotate-90 items-center transition-transform",
      "[&_svg]:size-[14px]",
      "group-data-[panel-open]:rotate-0",
      "motion-reduce:transition-none",
    ],
    panel: ["data-[ending-style]:hidden"],
    items: ["space-y-[10px]"],
    empty: ["px-[12px] py-[20px]"],
  },
  variants: {
    theme: {
      brutal: {
        trigger: [
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
        ],
        badge: ["border border-line-strong", "font-heading font-bold uppercase text-foreground"],
        count: ["font-mono text-foreground/50"],
        chevron: ["text-foreground/50", "group-hover:text-foreground"],
        empty: [
          "border-2 border-dashed border-line-strong/20",
          "text-[14px] leading-[20px] text-foreground/40",
        ],
      },
      elegant: {
        root: [
          "rounded-[10px] bg-[color-mix(in_oklch,var(--ink-2)_60%,var(--layer-panel))] p-[12px] shadow-xs",
        ],
        heading: ["gap-[6px]"],
        trigger: [
          "rounded-[6px] pl-[13px] pr-[5px]",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-transparent",
          "focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-layer-page",
          "[@media(forced-colors:active)]:focus-visible:[outline-color:CanvasText]",
        ],
        badge: [
          "inline-flex items-center gap-[6px] px-0 py-0",
          "font-sans text-[12px] leading-[16px] font-medium text-foreground-muted",
          "[&_svg]:size-[14px] [&_svg]:shrink-0",
        ],
        count: ["font-sans font-medium tabular-nums text-foreground-placeholder"],
        chevron: ["text-foreground-icon", "group-hover:text-foreground"],
        empty: [
          "rounded-[8px] border border-dashed border-line-subtle bg-layer-muted",
          "text-[13px] leading-[18px] text-foreground-placeholder",
        ],
      },
    },
  },
});
