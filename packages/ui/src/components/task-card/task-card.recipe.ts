import { tv } from "../../lib/tv";

export const taskCard = tv({
  slots: {
    root: [
      "relative w-full px-3 py-2.5 text-left",
      "transition-all duration-100",
      "data-[interactive=true]:cursor-pointer",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40 data-[disabled=true]:transform-none",
      "group-data-[dragging=true]/task-draggable:transform-none group-data-[dragging=true]/task-draggable:shadow-sm",
      "motion-reduce:transform-none motion-reduce:transition-none",
    ],
    row: ["flex min-w-0 items-start gap-2"],
    body: ["min-w-0 flex-1"],
    meta: ["mb-1.5 flex min-w-0 flex-nowrap items-center gap-2"],
    channel: ["text-xs leading-4"],
    number: ["shrink-0 text-[11px]"],
    legacy: ["shrink-0 px-1.5 py-0.5 text-[10px]"],
    title: ["line-clamp-3 break-words"],
    description: ["mt-2 line-clamp-2 break-words"],
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
        title: ["text-sm leading-5 font-bold text-foreground"],
        description: ["text-xs leading-4 text-foreground/70"],
      },
      elegant: {
        root: [
          "rounded-lg border-[0.5px] border-line-subtle bg-layer-panel shadow-xs",
          "hover:bg-[color-mix(in_oklch,oklch(0_0_0)_1%,var(--layer-panel))] group-data-[drop-over=true]/task-draggable:hover:bg-layer-panel data-[interactive=true]:active:bg-[color-mix(in_oklch,oklch(0_0_0)_1%,var(--layer-panel))]",
        ],
        channel: ["min-w-0 truncate font-medium text-foreground-muted"],
        meta: ["gap-1.5"],
        number: ["font-sans leading-3.5 font-medium tabular-nums text-foreground-placeholder"],
        legacy: [
          "rounded-sm border border-line-subtle bg-layer-muted",
          "font-sans leading-3 font-medium tracking-[0.2px] text-foreground-muted",
        ],
        title: ["text-sm leading-5 font-medium text-foreground-strong"],
        description: ["text-[13px] leading-4.5 text-foreground-muted"],
      },
    },
  },
});
