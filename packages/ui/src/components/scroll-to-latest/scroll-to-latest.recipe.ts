import { tv } from "../../lib/tv";

export const scrollToLatest = tv({
  base: ["absolute bottom-3 left-1/2 z-10 -translate-x-1/2"],
  variants: {
    theme: {
      brutal: {},
      elegant: "md:bottom-40",
    },
  },
});
