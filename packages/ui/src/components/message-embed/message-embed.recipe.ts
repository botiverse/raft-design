import { tv } from "../../lib/tv";

export const messageEmbed = tv({
  slots: {
    root: [
      "group block min-w-0 text-left",
      "rounded-container border border-line-muted bg-layer-card",
      "outline-none focus-visible:shadow-raft-focus",
    ],
    header: ["min-w-0", "px-3 py-2"],
    content: ["min-w-0"],
    footer: ["min-w-0", "px-3 py-2"],
  },
});
