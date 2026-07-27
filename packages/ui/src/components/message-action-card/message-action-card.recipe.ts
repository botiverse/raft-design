import { tv } from "../../lib/tv";

export const messageActionCard = tv({
  slots: {
    root: ["action-card relative flex w-full items-start text-left"],
    content: ["min-w-0 flex-1"],
    header: ["flex flex-wrap items-center"],
    details: [],
    hint: [],
    completion: [],
    actions: ["flex flex-wrap items-center"],
  },
  variants: {
    theme: {
      brutal: {
        root: "mt-1 gap-3 border-2 border-black/30 bg-white p-3",
        header: "gap-2 text-sm font-bold leading-snug",
        details: "mt-1 text-xs text-black/55",
        hint: "mt-1 border-l-2 border-black/20 pl-2 text-xs italic text-black/55",
        completion: "mt-1 text-xs text-black/55",
        actions: "mt-2 gap-3",
      },
      elegant: {
        root: "mt-1 gap-3 rounded-md border border-line-subtle bg-layer-panel p-3",
        header: "gap-2 text-sm font-medium leading-snug",
        details: "mt-1 text-xs text-foreground-muted",
        hint: "mt-1 border-l border-line-subtle pl-2 text-xs italic text-foreground-muted",
        completion: "mt-1 text-xs text-foreground-muted",
        actions: "mt-2 gap-3",
      },
    },
  },
});
