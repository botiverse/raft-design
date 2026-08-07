import { tv } from "../../lib/tv";

export const composer = tv({
  slots: {
    root: ["flex w-full flex-col gap-2 border-2 p-2"],
    input: [
      "min-h-5 max-h-32 w-full resize-none bg-transparent text-base leading-5 outline-none md:text-sm",
    ],
    toolbar: ["flex items-center justify-between gap-3"],
    actions: ["flex items-center gap-2"],
    meta: ["flex items-center gap-4"],
    iconButton: [],
  },
  variants: {
    theme: {
      brutal: {
        root: "border-black bg-white shadow-raft-sm focus-within:shadow-raft-md",
        input: "font-sans text-black placeholder:text-black/35",
        meta: "gap-3",
        iconButton: [
          "size-[26px] p-1 border-black bg-white text-black shadow-raft-sm",
          "hover:-translate-y-px hover:border-black hover:bg-white hover:shadow-raft-md",
          "active:translate-px  active:shadow-raft-xs",
        ],
      },
      elegant: {
        root: [
          "overflow-hidden rounded-lg border-0 p-0",
          "bg-layer-panel",
          "shadow-raft-sm ring-1 ring-ink-6 dark:shadow-none dark:ring-transparent",
          "dark:focus-within:ring-[0.5px] dark:focus-within:ring-accent-400/70",
        ],
        input: [
          "min-h-16 px-3 pt-3",
          "font-sans text-foreground-strong",
          "placeholder:text-foreground-placeholder",
        ],
        toolbar: "translate-y-1 gap-2 px-2.5 pt-1 pb-2.5",
        actions: "gap-1.5",
        iconButton: [
          "p-[7px]",
          "text-foreground-icon",
          "hover:bg-fill-strong/80 hover:text-foreground-strong",
          "active:bg-fill-strong/80 active:text-foreground-strong",
        ],
      },
    },
  },
});
