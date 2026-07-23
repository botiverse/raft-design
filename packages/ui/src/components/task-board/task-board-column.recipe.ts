import { tv } from "../../lib/tv";

export const taskBoardColumn = tv({
  slots: {
    root: ["group flex w-[320px] shrink-0 self-start flex-col p-[12px]", "transition-colors"],
    trigger: [
      "group flex w-full touch-manipulation items-center justify-between gap-[12px] text-left outline-none",
      "data-[panel-open]:mb-[12px]",
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
    emptyIdle: ["group-data-[drop-state=allowed]:hidden group-data-[drop-state=blocked]:hidden"],
    emptyAllowed: ["hidden group-data-[drop-state=allowed]:block"],
    emptyBlocked: ["hidden group-data-[drop-state=blocked]:block"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-2 border-line-strong/20 bg-layer-panel/30",
          "data-[drop-state=allowed]:border-line-strong data-[drop-state=allowed]:bg-soft-signal/20 data-[drop-state=allowed]:shadow-sm",
          "data-[drop-state=blocked]:border-danger-base data-[drop-state=blocked]:bg-danger-lighter",
        ],
        trigger: [
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
        ],
        badge: ["border border-line-strong", "font-heading font-bold uppercase text-foreground"],
        count: ["font-mono text-foreground/50"],
        chevron: ["text-foreground/50", "group-hover:text-foreground"],
        empty: [
          "border-2 border-dashed border-line-strong/20",
          "text-[14px] leading-[20px] text-foreground/40",
          "group-data-[drop-state=allowed]:border-line-strong group-data-[drop-state=allowed]:text-foreground/60",
          "group-data-[drop-state=blocked]:border-danger-base group-data-[drop-state=blocked]:text-danger-dark",
        ],
      },
      elegant: {
        root: [
          "rounded-[10px] border-[0.5px] border-ink-2/50 bg-ink-2",
          "data-[drop-state=allowed]:border-info-base/40 data-[drop-state=allowed]:bg-info-lighter/40 data-[drop-state=allowed]:shadow-sm",
          "data-[drop-state=blocked]:border-danger-base/40 data-[drop-state=blocked]:bg-danger-lighter/40",
        ],
        trigger: [
          "rounded-[6px]",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-transparent",
          "focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-layer-panel",
          "[@media(forced-colors:active)]:focus-visible:[outline-color:CanvasText]",
        ],
        badge: [
          "inline-flex items-center gap-[6px]",
          "font-sans text-[12px] leading-[16px] font-medium text-foreground-muted",
          "[&_svg]:size-[14px] [&_svg]:shrink-0",
        ],
        count: ["font-sans font-medium tabular-nums text-foreground-placeholder"],
        chevron: ["text-foreground-icon", "group-hover:text-foreground"],
        empty: [
          "rounded-[8px] border border-dashed border-line-subtle bg-layer-panel",
          "text-[13px] leading-[18px] text-foreground-placeholder",
          "group-data-[drop-state=allowed]:border-info-base/40 group-data-[drop-state=allowed]:text-info-dark",
          "group-data-[drop-state=blocked]:border-danger-base/40 group-data-[drop-state=blocked]:text-danger-dark",
        ],
      },
    },
  },
});
