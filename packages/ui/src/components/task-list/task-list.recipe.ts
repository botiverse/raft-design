import { tv } from "../../lib/tv";

export const taskList = tv({
  slots: {
    root: "",
  },
  variants: {
    theme: {
      brutal: {
        root: ["space-y-6"],
      },
      elegant: {},
    },
  },
});
