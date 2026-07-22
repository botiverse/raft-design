import { tv } from "../../lib/tv";

export const messageActionCard = tv({
  slots: {
    root: ["action-card relative mt-1 flex w-full items-start gap-3 border-2 p-3 text-left"],
    content: ["min-w-0 flex-1"],
    header: ["flex flex-wrap items-center gap-2 text-sm font-bold leading-snug"],
    details: ["mt-1 text-xs"],
    hint: ["mt-1 border-l-2 pl-2 text-xs italic"],
    completion: ["mt-1 text-xs"],
    actions: ["mt-2 flex flex-wrap items-center gap-3"],
  },
  variants: {
    theme: {
      brutal: {
        root: "border-black/30 bg-white",
        details: "text-black/55",
        hint: "border-black/20 text-black/55",
        completion: "text-black/55",
      },
      elegant: {
        root: "rounded-md border-line-subtle bg-layer-panel",
        details: "text-foreground-muted",
        hint: "border-line-subtle text-foreground-muted",
        completion: "text-foreground-muted",
      },
    },
  },
});
