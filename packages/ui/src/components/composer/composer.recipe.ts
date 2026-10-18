import { tv } from "../../lib/tv";

export const composer = tv({
  slots: {
    root: ["flex w-full flex-col gap-2 border-2 p-2"],
    input: [
      "min-h-5 max-h-32 w-full resize-none bg-transparent text-base leading-5 outline-none md:text-sm",
      "field-sizing-content overflow-y-auto",
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
      raft: {
        root: [
          "rounded-container border-[1.5px] px-3 pt-3 pb-2",
          "border-line-strong bg-layer-card text-foreground shadow-none",
          "focus-within:shadow-raft-focus",
        ],
        input: [
          "min-h-6 px-0.5",
          // The DS composer input is 16/24 regular wherever it is hosted: it
          // states its weight rather than inheriting one (a thread footer's
          // 12/16 500 caption type made its text and placeholder medium).
          "font-sans text-body font-normal text-foreground md:text-body",
          "placeholder:text-foreground-placeholder",
        ],
        toolbar: "gap-2",
        meta: "gap-2",
        iconButton: [
          "size-8 rounded-control text-foreground-icon",
          "disabled:border-transparent disabled:bg-transparent",
          "aria-disabled:border-transparent aria-disabled:bg-transparent",
          "[[data-slot=composer-actions]:first-child>&:first-child]:ml-[-5px]",
          "[&_svg:not([class*='size-'])]:size-4.5",
        ],
      },
    },
  },
});
