import { tv } from "../../lib/tv";

export const activityInboxShell = tv({
  slots: {
    panel: ["flex h-full min-h-0 flex-1 flex-col overflow-hidden"],
    // Header bar, content region, title, and subtitle now come from the shared
    // PanelHeader parts; this slot keeps only the scene-specific icon chip treatment.
    headerIconChip: ["hidden size-9 shrink-0 items-center justify-center md:flex"],
    viewport: ["safe-bottom relative flex-1 overflow-y-auto p-3"],
    loadingMore: ["py-3 text-center text-xs"],
  },
  variants: {
    theme: {
      brutal: {
        panel: ["bg-white text-black"],
        headerIconChip: ["border-2 border-black bg-primary-400 text-black"],
        viewport: ["bg-white"],
        loadingMore: ["font-bold text-black/40"],
      },
      elegant: {
        panel: ["bg-layer-canvas-muted text-foreground"],
        headerIconChip: ["rounded-md bg-fill-muted text-foreground-icon", "dark:bg-layer-card"],
        viewport: ["bg-layer-panel pt-1.5 dark:bg-transparent", "px-7 max-md:pl-5 max-md:pr-3.5"],
        loadingMore: ["font-medium text-foreground-placeholder"],
      },
    },
  },
});
