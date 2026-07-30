import { tv } from "../../lib/tv";

export const messageTextSelectionToolbar = tv({
  slots: {
    toolbar: ["flex min-w-0 items-center select-none overflow-hidden text-xs"],
    button: ["flex h-7 items-center gap-1.5 px-2 outline-none transition-colors"],
    separator: ["w-px"],
  },
  variants: {
    theme: {
      brutal: {
        toolbar: "border-2 border-black bg-white font-semibold shadow-sm",
        button: "text-black hover:bg-soft-signal/30 focus-visible:bg-soft-signal/30",
        separator: "bg-black/20",
      },
      elegant: {
        toolbar:
          "gap-1 rounded-lg border-[0.5px] border-line-subtle bg-layer-panel p-1 font-medium shadow-xs",
        button: [
          "rounded-sm text-foreground-muted",
          "hover:bg-layer-muted hover:text-foreground-strong",
          "focus-visible:bg-layer-muted focus-visible:text-foreground-strong",
        ],
        separator: "hidden",
      },
    },
  },
});
