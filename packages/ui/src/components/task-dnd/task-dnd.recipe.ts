import { tv } from "../../lib/tv";

export const taskDnd = tv({
  slots: {
    draggable: [
      "group/task-draggable relative cursor-grab touch-none active:cursor-grabbing",
      "outline-none",
      "data-[dragging=true]:z-20 data-[dragging=true]:opacity-90 data-[dragging=true]:will-change-transform",
      "data-[disabled=true]:cursor-default data-[disabled=true]:touch-auto",
    ],
  },
  variants: {
    theme: {
      brutal: {
        draggable: [
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
        ],
      },
      elegant: {
        draggable: [
          "focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-transparent",
          "focus-visible:ring-2 focus-visible:ring-primary-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-layer-page",
          "[@media(forced-colors:active)]:focus-visible:[outline-color:CanvasText]",
        ],
      },
    },
  },
});
