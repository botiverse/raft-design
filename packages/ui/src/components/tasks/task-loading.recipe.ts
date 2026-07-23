import { tv } from "../../lib/tv";

export const taskLoading = tv({
  slots: {
    list: ["flex flex-col gap-[8px]"],
    row: ["flex min-w-0 flex-col gap-[6px] p-[12px]"],
  },
  variants: {
    theme: {
      brutal: {
        row: ["rounded-[4px] border-2 border-line-strong/30"],
      },
      elegant: {
        row: ["rounded-[8px] border border-line-subtle bg-layer-panel shadow-sm"],
      },
    },
  },
});
