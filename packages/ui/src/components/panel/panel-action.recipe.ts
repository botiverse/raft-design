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
        "shadow-sm",
        "hover:-translate-y-px hover:bg-white hover:shadow-md",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
        "[&>svg]:size-3.5",
      ],
      elegant: [
        "rounded-md border-0 bg-transparent px-2 py-2",
        "hover:bg-layer-strong/80 hover:text-foreground",
        "focus-visible:ring-[0.5px] focus-visible:ring-primary-500",
        "[&>svg]:size-4",
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
        "active:not-data-[has-popup]:scale-100 active:translate-x-px active:translate-y-px active:shadow-xs",
        "disabled:shadow-sm",
      ],
      elegant: [
        "text-foreground-icon shadow-none",
        "active:bg-layer-strong/80 active:text-foreground",
      ],
    },
  },
});

export const panelToggleAction = tv({
  extend: panelActionBase,
  base: [
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[disabled]:transform-none",
  ],
  variants: {
    theme: {
      brutal: [
        "active:translate-x-px active:translate-y-px active:shadow-xs",
        "data-[pressed]:bg-brutal-orange data-[pressed]:text-black",
        "data-[pressed]:hover:bg-brutal-orange",
        "data-[disabled]:shadow-sm",
      ],
      elegant: [
        "text-foreground-icon shadow-none",
        "active:bg-layer-strong/80 active:text-foreground",
        "data-[pressed]:bg-layer-strong data-[pressed]:text-foreground",
        "data-[pressed]:hover:bg-layer-strong",
      ],
    },
  },
});
