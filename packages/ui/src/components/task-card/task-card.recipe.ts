import { tv } from "../../lib/tv";

export const taskCard = tv({
  slots: {
    root: [
      "relative w-full text-left",
      "transition-all duration-100",
      "data-[interactive=true]:cursor-pointer",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:transform-none",
      "group-data-[dragging=true]/task-draggable:transform-none",
      "motion-reduce:transform-none motion-reduce:transition-none",
      "rounded-container border border-line-hairline bg-layer-card p-3 text-foreground shadow-none",
      "data-[interactive=true]:hover:press-overlay data-[interactive=true]:active:press-overlay",
      "data-[disabled=true]:bg-fill-muted data-[disabled=true]:opacity-100",
      "group-data-[dragging=true]/task-draggable:shadow-float",
    ],
    row: ["flex min-w-0 items-start gap-2"],
    body: ["min-w-0 flex-1"],
    meta: ["flex min-w-0 flex-nowrap items-center gap-2", "mb-2"],
    channel: ["min-w-0 truncate", "font-mono text-mono-meta font-normal text-foreground-hint"],
    number: ["shrink-0", "font-mono text-mono-meta font-normal text-foreground-hint"],
    legacy: [
      "shrink-0",
      "inline-flex h-[22px] items-center rounded-chip px-1.5 py-0",
      "inset-ring inset-ring-line-hairline",
      "font-mono text-mono-meta font-normal text-foreground-muted",
    ],
    title: [
      "line-clamp-3 wrap-break-word",
      "text-body font-semibold text-foreground",
      "in-data-[disabled=true]:text-foreground-disabled",
    ],
    description: [
      "line-clamp-2 wrap-break-word",
      "mt-1 text-callout text-foreground-muted",
      "in-data-[disabled=true]:text-foreground-disabled",
    ],
  },
});
