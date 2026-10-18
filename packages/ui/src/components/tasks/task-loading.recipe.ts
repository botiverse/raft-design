import { tv } from "../../lib/tv";

export const taskLoading = tv({
  slots: {
    list: ["flex flex-col gap-2"],
    row: [
      "flex min-w-0 flex-col p-3",
      "gap-2 rounded-container border border-line-hairline bg-layer-card shadow-none",
    ],
  },
});
