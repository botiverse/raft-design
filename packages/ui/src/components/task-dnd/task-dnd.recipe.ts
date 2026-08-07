import { tv } from "../../lib/tv";

export const taskDnd = tv({
  slots: {
    draggable: [
      "group/task-draggable relative cursor-grab touch-none active:cursor-grabbing",
      "outline-none",
      "data-[dragging=true]:z-20 data-[dragging=true]:will-change-transform",
      "data-[disabled=true]:cursor-default data-[disabled=true]:touch-auto",
    ],
    overlay: "group/task-drag-overlay pointer-events-none",
    placeholder: "hidden w-full shrink-0",
  },
  variants: {
    theme: {
      brutal: {
        draggable: [
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
          "data-[dragging=true]:opacity-90",
        ],
        overlay: ["z-20 opacity-90", "[&_[data-slot=task-card]]:shadow-raft-md"],
        placeholder: [
          "h-[var(--task-dnd-placeholder-height,72px)] border-2 border-dashed border-line-strong",
          "bg-primary/20",
          "data-[drop-state=allowed]:block",
        ],
      },
      elegant: {
        draggable: [
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-transparent",
          "focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-layer-canvas-muted",
          "dark:focus-visible:ring-offset-layer-card",
          "[@media(forced-colors:active)]:focus-visible:[outline-color:CanvasText]",
        ],
        placeholder: [
          "h-[var(--task-dnd-placeholder-height,72px)] rounded-lg border border-dashed border-line-muted",
          "bg-[color-mix(in_oklch,var(--ink)_4%,var(--layer-panel))]",
          "data-[drop-state=allowed]:block",
        ],
      },
    },
  },
});
