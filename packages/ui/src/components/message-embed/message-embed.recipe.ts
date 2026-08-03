import { tv } from "../../lib/tv";

export const messageEmbed = tv({
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
          "rounded-lg border-[0.5px] border-line-muted bg-layer-card p-[2px] shadow-raft-xs",
          "transition-[background-color,box-shadow] duration-150",
          "hover:bg-[color-mix(in_oklch,var(--ink)_2%,var(--layer-card))] hover:shadow-raft-sm",
          "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-1px] focus-visible:outline-[oklch(0.507_0.185_257.731)]",
        ],
        header: "px-3 py-1.5 sm:px-3.5",
        content: [
          "overflow-clip rounded-[5.5px] border-[0.5px] border-line-muted bg-layer-panel",
          "transition-colors duration-150 group-hover:bg-[color-mix(in_oklch,var(--ink)_2%,var(--layer-panel))]",
        ],
        footer: "px-3 py-1.5 sm:px-3.5",
      },
    },
  },
});
