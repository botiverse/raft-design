import { tv } from "../../lib/tv";

export const tasksPanel = tv({
  slots: {
    root: "",
    toolbar: "",
    toolbarGroup: "",
    viewport: "",
    empty: "",
  },
  variants: {
    theme: {
      brutal: {
        root: ["flex min-h-0 min-w-0 flex-1 flex-col"],
        toolbar: [
          "flex flex-wrap items-center justify-between gap-2",
          "shrink-0 border-b-2 border-line-strong bg-layer-panel px-4 py-3",
        ],
        toolbarGroup: ["flex flex-wrap items-center gap-2"],
        viewport: [
          "min-h-0 flex-1 overflow-auto overscroll-contain bg-layer-panel p-4",
          "[padding-bottom:env(safe-area-inset-bottom)]",
        ],
        empty: ["flex h-full flex-col items-center justify-center"],
      },
      elegant: {},
    },
  },
});
