import { tv } from "../../lib/tv";

export const taskDnd = tv({
  slots: {
    draggable: [
      "group/task-draggable relative cursor-grab touch-none active:cursor-grabbing",
      "outline-none",
      "data-[dragging=true]:z-20 data-[dragging=true]:will-change-transform",
      "data-[disabled=true]:cursor-default data-[disabled=true]:touch-auto",
      "rounded-container",
      "focus-visible:shadow-focus",
    ],
    overlay: [
      "group/task-drag-overlay pointer-events-none",
      "z-20",
      "**:data-[slot=task-card]:shadow-float",
    ],
    placeholder: [
      "hidden w-full shrink-0",
      "h-(--task-dnd-placeholder-height,72px) rounded-container",
      "border-[1.5px] border-dashed border-line-strong bg-transparent",
      "data-[drop-state=allowed]:block",
    ],
  },
});
