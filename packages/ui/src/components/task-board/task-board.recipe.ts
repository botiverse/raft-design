import { tv } from "../../lib/tv";

export const taskBoard = tv({
  slots: {
    root: "",
  },
  variants: {
    theme: {
      brutal: {
        root: ["flex min-w-max items-start gap-4 pr-4"],
      },
      elegant: {},
    },
  },
});
