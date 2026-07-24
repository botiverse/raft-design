import { tv } from "../../lib/tv";

export const taskCardStatus = tv({
  base: [
    "inline-flex min-w-0 shrink-0 touch-manipulation items-center gap-1",
    "transition-[filter,opacity] duration-100 outline-none",
    "disabled:cursor-not-allowed disabled:opacity-60",
    "data-[busy=true]:pointer-events-none data-[busy=true]:cursor-wait data-[busy=true]:opacity-60 data-[busy=true]:disabled:opacity-100",
  ],
  variants: {
    theme: {
      brutal: [
        "ml-auto border-2 border-line-strong px-2 py-px",
        "text-[10px] leading-4 font-semibold text-foreground",
        "[&:not(:has([data-slot=task-card-status-label]))]:hidden",
        "[&_svg]:pointer-events-none [&_svg]:size-2.5 [&_svg]:shrink-0 [&_svg]:text-foreground",
        "[&_[data-slot=task-card-status-label]]:inline-flex [&_[data-slot=task-card-status-label]]:items-center [&_[data-slot=task-card-status-label]]:gap-1",
        "hover:brightness-90",
        "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
      ],
      elegant: [
        "flex h-3.5 items-center rounded-sm border border-transparent p-0 leading-none",
        "[&:has([data-slot=task-card-status-label])]:hidden",
        "[&>svg]:pointer-events-none [&>svg]:shrink-0",
        "[&>svg[data-slot=task-status-icon]]:size-3.5",
        "transition-[filter,opacity]",
        "hover:brightness-[0.96] active:scale-[0.985]",
        "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-transparent",
        "focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-1 focus-visible:ring-offset-layer-panel",
        "[@media(forced-colors:active)]:focus-visible:[outline-color:CanvasText]",
      ],
    },
  },
});
