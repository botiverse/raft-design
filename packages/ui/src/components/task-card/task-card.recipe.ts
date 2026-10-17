import { tv } from "../../lib/tv";

export const taskCard = tv({
  slots: {
    root: [
      "relative w-full px-3 py-2.5 text-left",
      "transition-all duration-100",
      "data-[interactive=true]:cursor-pointer",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40 data-[disabled=true]:transform-none",
      "group-data-[dragging=true]/task-draggable:transform-none group-data-[dragging=true]/task-draggable:shadow-raft-sm",
      "motion-reduce:transform-none motion-reduce:transition-none",
    ],
    row: ["flex min-w-0 items-start gap-2"],
    body: ["min-w-0 flex-1"],
    meta: ["mb-1.5 flex min-w-0 flex-nowrap items-center gap-2"],
    channel: ["text-xs leading-4"],
    number: ["shrink-0 text-[11px]"],
    legacy: ["shrink-0 px-1.5 py-0.5 text-[10px]"],
    title: ["line-clamp-3 wrap-break-word"],
    description: ["mt-2 line-clamp-2 wrap-break-word"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-2 border-line-strong bg-layer-panel shadow-raft-sm",
          "hover:-translate-y-px hover:shadow-raft-md",
        ],
        meta: ["flex-nowrap"],
        channel: ["min-w-0 truncate", "font-bold text-foreground-strong/60"],
        number: ["font-mono text-foreground-strong/35"],
        legacy: ["border border-line-muted", "font-heading font-bold text-foreground-strong/50"],
        title: ["text-sm leading-5 font-bold text-foreground-strong"],
        description: ["text-xs leading-4 text-foreground-strong/70"],
      },
      elegant: {
        root: [
          "rounded-lg border-[0.5px] border-line-muted bg-layer-panel shadow-raft-xs",
          "hover:bg-[color-mix(in_oklch,var(--ink)_1%,var(--layer-panel))] group-data-[drop-over=true]/task-draggable:hover:bg-layer-panel data-[interactive=true]:active:bg-[color-mix(in_oklch,var(--ink)_1%,var(--layer-panel))]",
          "dark:border-transparent",
        ],
        channel: ["min-w-0 truncate font-medium text-foreground-muted"],
        meta: ["gap-1.5"],
        number: ["font-sans leading-3.5 font-medium tabular-nums text-foreground-placeholder"],
        legacy: [
          "rounded-sm border border-line-muted bg-fill-muted",
          "font-sans leading-3 font-medium tracking-[0.2px] text-foreground-muted",
        ],
        title: ["text-sm leading-5 font-medium text-foreground"],
        description: ["text-[13px] leading-4.5 text-foreground-muted"],
      },
      raft: {
        root: [
          "rounded-container border border-line-muted bg-layer-card p-3 text-foreground shadow-none",
          "data-[interactive=true]:hover:press-overlay data-[interactive=true]:active:press-overlay",
          "data-[disabled=true]:bg-fill-muted data-[disabled=true]:opacity-100",
          "group-data-[dragging=true]/task-draggable:shadow-raft-float",
        ],
        meta: ["mb-2"],
        channel: ["min-w-0 truncate", "font-mono text-mono-meta font-normal text-foreground-hint"],
        number: ["font-mono text-mono-meta font-normal text-foreground-hint"],
        legacy: [
          "inline-flex h-[22px] items-center rounded-chip px-1.5 py-0",
          "shadow-[inset_0_0_0_1px_var(--line-muted)]",
          "font-mono text-mono-meta font-normal text-foreground-muted",
        ],
        title: [
          "text-body font-semibold text-foreground",
          "in-data-[disabled=true]:text-foreground-disabled",
        ],
        description: [
          "mt-1 text-callout text-foreground-muted",
          "in-data-[disabled=true]:text-foreground-disabled",
        ],
      },
    },
  },
});
