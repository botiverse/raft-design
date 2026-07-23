import { tv } from "../../lib/tv";

export const taskCardStatus = tv({
  slots: {
    root: [
      "relative min-w-0 shrink-0",
      "data-[busy=true]:pointer-events-none data-[busy=true]:opacity-60",
    ],
    trigger: [
      "inline-flex touch-manipulation items-center gap-1",
      "transition-[filter,opacity] duration-100",
      "outline-none",
      "disabled:cursor-not-allowed disabled:opacity-60",
      "data-[busy=true]:cursor-wait data-[busy=true]:disabled:opacity-100",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: ["order-last ml-auto flex items-center"],
        trigger: [
          "border-2 border-line-strong px-2 py-0.5",
          "text-xs leading-4 font-bold text-foreground",
          "[&_svg]:pointer-events-none [&_svg]:size-2.5 [&_svg]:shrink-0 [&_svg]:opacity-40",
          "hover:brightness-90",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
        ],
      },
      elegant: {
        root: ["flex h-3.5 items-center"],
        trigger: [
          "flex h-3.5 items-center rounded-sm border border-transparent p-0 leading-none",
          "[&_[data-slot=task-status-icon]]:pointer-events-none [&_[data-slot=task-status-icon]]:size-3.5 [&_[data-slot=task-status-icon]]:shrink-0",
          "transition-[filter,opacity]",
          "hover:brightness-[0.96] active:scale-[0.985]",
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-transparent",
          "focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-1 focus-visible:ring-offset-layer-panel",
          "[@media(forced-colors:active)]:focus-visible:[outline-color:CanvasText]",
        ],
      },
    },
  },
});
