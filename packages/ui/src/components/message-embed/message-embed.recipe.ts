import { tv } from "../../lib/tv";

// Shared elegant treatment for standalone blocks inside messages: layer-card
// fill, shadow, and hover lift. Extended by message-embed and message-replies.
export const messageBlock = tv({
  slots: { root: "" },
  variants: {
    theme: {
      brutal: { root: "" },
      elegant: {
        root: [
          "bg-layer-card shadow-raft-xs",
          "transition-[background-color,box-shadow] duration-150",
          "hover:bg-[color-mix(in_oklch,var(--ink)_2%,var(--layer-card))] hover:shadow-raft-sm",
        ],
      },
    },
  },
});

export const messageEmbed = tv({
  extend: messageBlock,
  slots: {
    root: ["group block min-w-0 text-left"],
    header: ["min-w-0"],
    content: ["min-w-0"],
    footer: ["min-w-0"],
  },
  variants: {
    theme: {
      brutal: {
        root: "border border-black/20 bg-white",
        header: "border-b border-black/10 bg-white px-2.5 py-1.5",
        content: "bg-white",
        footer: "border-t border-black/10 bg-white px-3 py-1.5",
      },
      elegant: {
        root: [
          "rounded-lg border-[0.5px] border-line-muted p-[2px]",
          "dark:border-transparent",
          "focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-[oklch(0.507_0.185_257.731)]",
        ],
        header: "px-3 py-1.5 sm:px-3.5",
        content: [
          "overflow-clip rounded-[5.5px] border-[0.5px] border-line-muted bg-layer-panel",
          "transition-colors duration-150 group-hover:bg-[color-mix(in_oklch,var(--ink)_2%,var(--layer-panel))]",
          "dark:border-transparent dark:shadow-[inset_0_1px_0_oklch(1_0_0/0.04),0_0_0_1px_oklch(0_0_0/0.35)]",
        ],
        footer: "px-3 py-1.5 sm:px-3.5",
      },
    },
  },
});
