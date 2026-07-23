import { tv } from "../../lib/tv";

export const taskCard = tv({
  slots: {
    root: [
      "relative w-full px-[12px] py-[10px] text-left",
      "transition-all duration-100",
      "data-[interactive=true]:cursor-pointer",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40 data-[disabled=true]:transform-none",
      "group-data-[dragging=true]/task-draggable:transform-none group-data-[dragging=true]/task-draggable:shadow-sm",
      "motion-reduce:transform-none motion-reduce:transition-none",
    ],
    row: ["flex min-w-0 items-start gap-[8px]"],
    body: ["min-w-0 flex-1"],
    meta: ["mb-[6px] flex min-w-0 flex-wrap items-center gap-[8px]"],
    channel: ["text-[12px] leading-[16px]"],
    number: ["shrink-0 text-[11px]"],
    legacy: ["shrink-0 px-[6px] py-[2px] text-[10px]"],
    title: ["line-clamp-3 break-words"],
    description: ["mt-[4px] line-clamp-2 break-words"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-2 border-line-strong bg-layer-panel shadow-sm",
          "hover:-translate-y-px hover:shadow-md",
        ],
        meta: ["flex-nowrap"],
        channel: ["min-w-0 truncate", "font-bold text-foreground/60"],
        number: ["font-mono text-foreground/35"],
        legacy: ["border border-line-subtle", "font-heading font-bold text-foreground/50"],
        title: ["text-[14px] leading-[20px] font-bold text-foreground"],
        description: ["text-[12px] leading-[16px] text-foreground/70"],
      },
      elegant: {
        root: [
          "rounded-[8px] border-[0.5px] border-line-subtle bg-layer-panel shadow-xs",
          "hover:bg-ink-2/5 group-data-[drop-over=true]/task-draggable:hover:bg-layer-panel data-[interactive=true]:active:bg-ink-2/5",
          "group-data-[dragging=true]/task-drag-overlay:bg-ink-2/5",
        ],
        channel: ["font-medium text-foreground-muted"],
        meta: ["gap-[6px]"],
        number: ["font-sans leading-[14px] font-medium tabular-nums text-foreground-placeholder"],
        legacy: [
          "rounded-[4px] border border-line-subtle bg-layer-muted",
          "font-sans leading-[12px] font-medium tracking-[0.2px] text-foreground-muted",
        ],
        title: ["text-[14px] leading-[20px] font-medium text-foreground-strong"],
        description: ["text-[13px] leading-[18px] text-foreground-muted"],
      },
    },
  },
});
