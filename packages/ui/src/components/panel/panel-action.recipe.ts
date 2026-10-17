import { tv } from "../../lib/tv";

const panelActionBase = tv({
  base: [
    "relative inline-flex w-auto shrink-0 items-center justify-center",
    "overflow-visible font-sans leading-none tabular-nums select-none outline-none",
    "transition-all duration-100",
    "[&>svg]:pointer-events-none [&>svg]:shrink-0",
  ],
  variants: {
    theme: {
      brutal: [
        "rounded-none border-2 border-black bg-white px-1 py-[5px] text-black",
        "shadow-raft-sm",
        "hover:-translate-y-px hover:bg-white hover:shadow-raft-md",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        "[&>svg]:size-3.5",
      ],
      elegant: [
        "rounded-md border-0 bg-transparent px-2 py-2",
        "hover:bg-fill-strong/80 hover:text-foreground-strong",
        "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
        "[&>svg]:size-4",
      ],
      raft: [
        "h-11 min-w-11 rounded-control border-[1.5px] border-transparent bg-transparent px-2 py-0",
        "text-foreground",
        "hover:bg-fill-pressed active:bg-fill-pressed",
        "focus-visible:shadow-raft-focus",
        "[&>svg]:size-[22px]",
      ],
    },
  },
});

export const panelAction = tv({
  extend: panelActionBase,
  base: [
    "gap-1.5 text-xs/[1] whitespace-nowrap",
    "disabled:pointer-events-none disabled:opacity-40 disabled:transform-none",
  ],
  variants: {
    theme: {
      brutal: [
        "active:not-data-haspopup:scale-100 active:translate-px  active:shadow-raft-xs",
        "disabled:shadow-raft-sm",
      ],
      elegant: [
        "text-foreground-icon shadow-none",
        "active:bg-fill-strong/80 active:text-foreground-strong",
      ],
      raft: [
        "gap-1.5 text-footnote font-bold",
        "disabled:bg-transparent disabled:text-foreground-disabled disabled:opacity-100",
        "aria-pressed:border-sticker-ink aria-pressed:bg-primary aria-pressed:text-sticker-ink",
        "aria-pressed:active:press-overlay-sticker",
      ],
    },
  },
});

export const panelToggleAction = tv({
  extend: panelActionBase,
  base: ["data-disabled:pointer-events-none data-disabled:opacity-40 data-disabled:transform-none"],
  variants: {
    theme: {
      brutal: [
        "active:translate-px  active:shadow-raft-xs",
        "data-pressed:bg-brutal-orange data-pressed:text-black",
        "data-pressed:hover:bg-brutal-orange",
        "data-disabled:shadow-raft-sm",
      ],
      elegant: [
        "text-foreground-icon shadow-none",
        "active:bg-fill-strong/80 active:text-foreground-strong",
        "data-pressed:bg-fill-strong data-pressed:text-foreground-strong",
        "data-pressed:hover:bg-fill-strong",
      ],
      raft: [
        "gap-1.5 text-footnote font-bold",
        "data-disabled:bg-transparent data-disabled:text-foreground-disabled data-disabled:opacity-100",
        "data-pressed:border-sticker-ink data-pressed:bg-primary data-pressed:text-sticker-ink",
        "data-pressed:active:press-overlay-sticker",
      ],
    },
  },
});
