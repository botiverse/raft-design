import { tv } from "../../lib/tv";

export const taskDnd = tv({
  slots: {
    draggable: [
      "group/task-draggable relative cursor-grab touch-manipulation select-none [-webkit-touch-callout:none] active:cursor-grabbing",
      "outline-none",
      "data-[dragging=true]:z-20 data-[dragging=true]:will-change-transform",
      "data-[disabled=true]:cursor-default data-[disabled=true]:touch-auto",
      "rounded-container",
      "focus-visible:shadow-focus",
    ],
    overlay: ["group/task-drag-overlay pointer-events-none", "size-full rounded-[inherit]"],
    placeholder: [
      "hidden w-full shrink-0",
      "h-(--task-dnd-placeholder-height,72px) rounded-container",
      "data-[drop-state=allowed]:block",
    ],
  },
});
