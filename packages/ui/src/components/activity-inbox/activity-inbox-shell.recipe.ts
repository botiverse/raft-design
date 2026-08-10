import { tv } from "../../lib/tv";

export const activityInboxShell = tv({
  slots: {
    panel: ["flex h-full min-h-0 flex-1 flex-col overflow-hidden"],
    viewport: ["safe-bottom relative flex-1 overflow-y-auto"],
    loadingMore: ["py-3 text-center text-xs"],
  },
  variants: {
    theme: {
      brutal: {
        panel: ["bg-white text-black"],
        viewport: ["bg-white p-3"],
        loadingMore: ["font-bold text-black/40"],
      },
      elegant: {
        panel: ["bg-layer-canvas-muted text-foreground", "md:[&>[data-panel-frame-header]]:pl-3"],
        viewport: ["bg-layer-panel dark:bg-transparent", "px-7 max-md:pl-5 max-md:pr-3.5"],
        loadingMore: ["font-medium text-foreground-placeholder"],
      },
    },
  },
});
