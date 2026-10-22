import { tv } from "../../lib/tv";

// The composer's footer adds no space above it: the list ends a section step
// over the composer's frame with `pb-timeline-end` under its last row
// (design/foundations/spacing.md#timeline-rhythm), and PanelFooter's own
// 12px would stack on it.
export const conversationPanel = tv({
  slots: {
    root: [
      "flex h-full min-h-0 min-w-0 flex-1 flex-col",
      "bg-layer-canvas font-sans text-foreground",
    ],
    content: ["flex min-h-0 min-w-0 flex-1 flex-col", "bg-layer-canvas"],
    tabs: [
      "shrink-0",
      "border-b border-line-seam bg-layer-canvas",
      // The tab row is the scroller (it spans the panel and scrolls its
      // own tabs, starting on the 20px edge the head and body keep).
      "*:data-[slot=tabs-list]:w-full *:data-[slot=tabs-list]:px-5 max-md:*:data-[slot=tabs-list]:px-4",
      "*:data-[slot=tabs-list]:data-[variant=default]:py-2",
    ],
    footer: ["pt-0", "bg-layer-canvas"],
  },
});
