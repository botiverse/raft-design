import { tv } from "../../lib/tv";

export const activityInboxShell = tv({
  slots: {
    panel: [
      "flex h-full min-h-0 flex-1 flex-col overflow-hidden",
      "bg-layer-canvas font-sans text-foreground",
    ],
    viewport: [
      "relative flex flex-1 flex-col gap-0.5 overflow-y-auto scrollbar-list *:shrink-0",
      "bg-layer-canvas p-0 pb-[env(safe-area-inset-bottom,0px)]",
    ],
    loadingMore: ["py-3 text-center", "text-caption text-foreground-hint"],
  },
});
