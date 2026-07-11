import { tv, type VariantProps } from "../../lib/tv";

export const messageReference = tv({
  slots: {
    root: [
      "max-w-full overflow-hidden text-ellipsis whitespace-nowrap align-bottom select-text no-underline",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      "[&_svg]:shrink-0",
    ],
    label: ["min-w-0 truncate"],
    meta: ["shrink-0 text-[10px] leading-none font-normal text-foreground/50"],
  },
  variants: {
    theme: {
      brutal: {},
      elegant: {},
    },
    treatment: {
      mention: {
        root: [
          "font-bold underline decoration-2 underline-offset-2",
          "hover:text-accent-500 hover:decoration-accent-500",
        ],
      },
      selfMention: {
        root: [
          "inline-block border border-line-strong bg-soft-signal px-1 font-bold text-foreground",
          "[font-size:inherit] leading-[1.5]",
          "hover:bg-soft-signal/80",
        ],
      },
      channel: {
        root: [
          "inline-block border border-line-strong bg-accent-200/60 px-1 font-bold text-foreground",
          "[font-size:inherit] leading-[1.5]",
          "hover:bg-accent-400/45",
        ],
      },
      task: {
        root: [
          "inline-block border border-line-strong bg-layer-muted px-1 font-bold text-foreground",
          "[font-size:inherit] leading-[1.5]",
          "hover:bg-layer-strong",
        ],
      },
      thread: {
        root: [
          "inline-block border border-line-strong bg-info-light px-1 font-bold text-info-dark",
          "[font-size:inherit] leading-[1.5]",
          "hover:bg-info-base/45",
        ],
      },
      permalink: {
        root: [
          "inline-flex items-center gap-1 border border-line-strong bg-layer-panel px-1 font-bold text-foreground",
          "[font-size:inherit] leading-[1.5]",
          "hover:bg-layer-muted",
        ],
      },
      externalPermalink: {
        root: [
          "inline-flex items-center gap-1 border border-line-strong bg-layer-panel px-1 font-bold text-info-dark",
          "[font-size:inherit] leading-[1.5]",
          "hover:bg-layer-muted",
        ],
      },
      loading: {
        root: [
          "inline-flex cursor-wait items-center gap-1 border border-line-strong bg-layer-muted px-1 font-bold text-foreground opacity-80",
          "[font-size:inherit] leading-[1.5]",
        ],
      },
      channelUnavailable: {
        root: [
          "inline-block border border-line-strong px-1 font-bold opacity-60",
          "[font-size:inherit] leading-[1.5]",
        ],
      },
      threadUnavailable: {
        root: [
          "inline-block border border-line-strong px-1 font-bold opacity-60",
          "[font-size:inherit] leading-[1.5]",
        ],
      },
      taskUnavailable: {
        root: [
          "inline-block border border-line-strong px-1 font-bold opacity-60",
          "[font-size:inherit] leading-[1.5]",
        ],
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      treatment: "mention",
      class: {
        root: [
          "cursor-default text-black decoration-black/30",
          "hover:text-brutal-pink hover:decoration-brutal-pink",
        ],
      },
    },
    {
      theme: "brutal",
      treatment: "selfMention",
      class: { root: "cursor-default border-black bg-soft-signal text-black" },
    },
    {
      theme: "brutal",
      treatment: "channel",
      class: {
        root: "cursor-default border-black bg-brutal-pink/30 text-black hover:bg-brutal-pink/60",
      },
    },
    {
      theme: "brutal",
      treatment: "task",
      class: {
        root: "cursor-default border-black bg-soft-signal/40 text-black hover:bg-soft-signal",
      },
    },
    {
      theme: "brutal",
      treatment: "thread",
      class: {
        root: "cursor-default border-black bg-brutal-cyan/30 text-black hover:bg-brutal-cyan/60",
      },
    },
    {
      theme: "brutal",
      treatment: "permalink",
      class: {
        root: "cursor-default border-black bg-soft-signal/40 text-black hover:bg-soft-signal",
      },
    },
    {
      theme: "brutal",
      treatment: "externalPermalink",
      class: {
        root: "cursor-default border-black bg-white text-[oklch(0.488_0.243_264.376)] hover:bg-black/5",
      },
    },
    {
      theme: "brutal",
      treatment: "loading",
      class: { root: "border-black bg-brutal-cyan/30 text-black" },
    },
    {
      theme: "brutal",
      treatment: "channelUnavailable",
      class: { root: "border-black bg-brutal-pink/30 text-black" },
    },
    {
      theme: "brutal",
      treatment: "threadUnavailable",
      class: { root: "border-black bg-brutal-cyan/30 text-black" },
    },
    {
      theme: "brutal",
      treatment: "taskUnavailable",
      class: { root: "border-black bg-soft-signal/30 text-black" },
    },
    {
      theme: "elegant",
      treatment: [
        "mention",
        "selfMention",
        "channel",
        "task",
        "thread",
        "permalink",
        "externalPermalink",
      ],
      class: { root: "cursor-pointer" },
    },
    {
      theme: "elegant",
      treatment: ["channelUnavailable", "threadUnavailable", "taskUnavailable"],
      class: { root: "cursor-not-allowed border-line-strong bg-layer-muted text-foreground" },
    },
  ],
});

export type MessageReferenceVariantProps = VariantProps<typeof messageReference>;
