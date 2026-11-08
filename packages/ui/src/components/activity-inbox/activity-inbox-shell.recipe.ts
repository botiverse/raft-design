import { listColumnMargin } from "../../lib/head-edges";
import { tv } from "../../lib/tv";

export const activityInboxShell = tv({
  slots: {
    panel: [
      "flex h-full min-h-0 flex-1 flex-col overflow-hidden",
      "bg-layer-canvas font-sans text-foreground",
      listColumnMargin,
    ],
    frame: ["min-h-0 flex-1"],
    // A ScrollArea container (absolute gutters): useScrollAreaContainer asks for its overflow.
    viewport: [
      "relative flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto *:shrink-0",
      "outline-none focus-visible:shadow-focus",
      "bg-layer-canvas px-0 pt-2 pb-[calc(8px+env(safe-area-inset-bottom,0px))]",
    ],
    loadingMore: ["py-3 text-center", "text-caption text-foreground-hint"],
  },
});
