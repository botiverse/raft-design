import { tv } from "../../lib/tv";

export const messageActionCard = tv({
  slots: {
    root: ["mt-1 w-full"],
    header: ["flex flex-wrap items-center gap-2 leading-snug"],
    headerStatus: ["ml-auto"],
  },
  variants: {
    theme: {
      brutal: {
        header: "border-b-0 text-sm font-bold",
      },
      elegant: {
        header: "py-2 text-[13px] font-[550]",
      },
    },
  },
});
