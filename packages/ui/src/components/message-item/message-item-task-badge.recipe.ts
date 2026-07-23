import { tv } from "../../lib/tv";

export const messageItemTaskBadge = tv({
  base: [
    "inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap",
    "border border-line-strong px-1.5 text-[10px] font-bold leading-none text-foreground",
    "transition-[filter,opacity] duration-100 hover:brightness-90",
    "disabled:cursor-not-allowed disabled:opacity-60",
    "[&_svg]:size-2.5 [&_svg]:shrink-0",
  ],
  variants: {
    theme: {
      brutal: "",
      elegant: "",
    },
  },
});
