import { tv, type VariantProps } from "../../lib/tv";

export const messageReference = tv({
  slots: {
    root: [
      "inline-flex max-w-full items-center overflow-hidden text-ellipsis whitespace-nowrap align-bottom",
      "[font-size:inherit] leading-[1.5] select-text",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      "[&_svg]:shrink-0",
    ],
    label: ["min-w-0 truncate"],
    meta: ["shrink-0 text-[10px] leading-none font-normal text-foreground/50"],
  },
  variants: {
    treatment: {
      mention: {
        root: [
          "cursor-pointer font-bold text-foreground underline decoration-line-strong decoration-2 underline-offset-2",
          "hover:text-accent-500 hover:decoration-accent-500",
        ],
      },
      selfMention: {
        root: [
          "cursor-pointer border border-line-strong bg-soft-signal px-1 font-bold text-foreground",
          "hover:bg-soft-signal/80",
        ],
      },
      channel: {
        root: [
          "cursor-pointer border border-line-strong bg-accent-200/60 px-1 font-bold text-foreground",
          "hover:bg-accent-400/45",
        ],
      },
      task: {
        root: [
          "cursor-pointer border border-line-strong bg-layer-muted px-1 font-bold text-foreground",
          "hover:bg-layer-strong",
        ],
      },
      thread: {
        root: [
          "cursor-pointer border border-line-strong bg-info-light px-1 font-bold text-info-dark",
          "hover:bg-info-base/45",
        ],
      },
      permalink: {
        root: [
          "cursor-pointer gap-1 border border-line-strong bg-layer-panel px-1 font-bold text-foreground",
          "hover:bg-layer-muted",
        ],
      },
      loading: {
        root: [
          "cursor-wait gap-1 border border-line-strong bg-layer-muted px-1 font-bold text-foreground opacity-80",
        ],
      },
      unavailable: {
        root: [
          "cursor-not-allowed border border-line-strong bg-layer-muted px-1 font-bold text-foreground opacity-60",
        ],
      },
    },
  },
});

export type MessageReferenceVariantProps = VariantProps<typeof messageReference>;
