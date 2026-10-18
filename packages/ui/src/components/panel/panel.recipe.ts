import { tv } from "../../lib/tv";

export const panel = tv({
  slots: {
    root: ["[--panel-footer-clearance:10rem]", "bg-layer-canvas text-foreground"],
    header: ["[@media(max-height:600px)]:h-12"],
    body: ["relative min-h-0 flex-1 overflow-hidden"],
    scrollViewport: [
      "h-full min-h-0 overflow-y-auto overscroll-contain",
      "[overflow-anchor:auto] [-webkit-overflow-scrolling:touch]",
    ],
    scrollContent: ["min-h-full"],
    section: ["border-t px-5 py-4", "border-line-hairline"],
    footer: [
      "relative flex shrink-0 items-center pt-3",
      "bg-layer-canvas",
      "px-5 max-md:px-4",
      "pb-[calc(env(safe-area-inset-bottom)+1rem)] max-md:pb-[calc(env(safe-area-inset-bottom)+0.5rem)]",
    ],
  },
  variants: {
    edge: {
      inset: {
        root: "group/panel-frame",
      },
      attached: {
        root: ["group/panel-frame", "border-l border-line-seam max-md:border-l-0"],
      },
    },
  },
});
