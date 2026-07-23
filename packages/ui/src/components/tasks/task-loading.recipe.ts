import { tv } from "../../lib/tv";

export const taskLoading = tv({
  slots: {
    list: "",
    row: "",
  },
  variants: {
    theme: {
      brutal: {
        list: ["flex flex-col gap-2"],
        row: ["flex min-w-0 flex-col gap-1.5 rounded border-2 border-line-strong/30 p-3"],
      },
      elegant: {},
    },
  },
});
