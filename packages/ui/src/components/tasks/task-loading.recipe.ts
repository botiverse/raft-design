import { tv } from "../../lib/tv";

export const taskLoading = tv({
  slots: {
    list: ["flex flex-col gap-2"],
    row: ["flex min-w-0 flex-col gap-1.5 p-3"],
  },
  variants: {
    theme: {
      brutal: {
        row: ["rounded-sm border-2 border-line-strong/30"],
      },
      elegant: {
        row: ["rounded-lg border border-line-muted bg-layer-panel shadow-raft-sm"],
      },
    },
  },
});
