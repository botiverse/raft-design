import { tv } from "../../lib/tv";

export const messageEmbed = tv({
  slots: {
    root: [
      "group block min-w-0 text-left",
      "rounded-container border border-line-hairline bg-layer-card",
      "outline-none focus-visible:shadow-focus",
      "data-[interactive=true]:hover:overlay-subtle data-[interactive=true]:active:overlay-medium",
    ],
    header: ["min-w-0", "px-3 py-2"],
    content: ["min-w-0"],
    footer: ["min-w-0", "px-3 py-2"],
  },
});
