import { tv } from "../../lib/tv";

export const messageActionCard = tv({
  slots: {
    root: ["action-card relative mt-1 w-full text-left"],
    header: ["flex flex-wrap items-center"],
  },
  variants: {
    theme: {
      brutal: {
        root: "",
        header: "gap-2 border-b-0 text-sm font-bold leading-snug",
      },
      elegant: {
        root: "",
        header: "gap-2 py-2 text-[13px] font-[550] leading-snug",
      },
    },
  },
});
