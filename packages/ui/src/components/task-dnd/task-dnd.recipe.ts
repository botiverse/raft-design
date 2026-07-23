import { tv } from "../../lib/tv";

export const taskDnd = tv({
  slots: {
    draggable: "",
  },
  variants: {
    theme: {
      brutal: {
        draggable: [
          "group/task-draggable relative cursor-grab touch-none active:cursor-grabbing",
          "outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-black",
          "data-[dragging=true]:z-20 data-[dragging=true]:opacity-90 data-[dragging=true]:will-change-transform",
          "data-[disabled=true]:cursor-default data-[disabled=true]:touch-auto",
        ],
      },
      elegant: {},
    },
  },
});
