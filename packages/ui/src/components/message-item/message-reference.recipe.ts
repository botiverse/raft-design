import { tv, type VariantProps } from "../../lib/tv";

export const messageReference = tv({
  slots: {
    root: [
      "max-w-full overflow-hidden text-ellipsis whitespace-nowrap select-text no-underline",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      "[&_svg]:shrink-0",
    ],
    label: ["min-w-0 truncate"],
    meta: ["shrink-0 text-[10px] leading-none font-normal text-foreground/50"],
  },
  variants: {
    theme: {
      brutal: { root: "focus-visible:outline-black" },
      elegant: { meta: "text-foreground-muted" },
    },
    treatment: {
      mention: {
        root: [
          "font-bold underline decoration-2 underline-offset-2",
          "hover:text-accent-500 hover:decoration-accent-500",
        ],
      },
      // Chip box matches source MSG_REF_CHIP: leading-[21px] + 1px border ≈ 23px.
      // `align-bottom` keeps equal-height chips flush with each other and the
      // line box; body leading must be ≥ 23px (see message-item body) so wrapped
      // lines do not overlap.
      selfMention: {
        root: [
          "inline-block align-bottom border border-line-strong bg-soft-signal px-1 font-bold text-foreground",
          "[font-size:inherit] leading-[21px]",
          "hover:bg-soft-signal/80",
        ],
      },
      channel: {
        root: [
          "inline-block align-bottom border border-line-strong bg-accent-200/60 px-1 font-bold text-foreground",
          "[font-size:inherit] leading-[21px]",
          "hover:bg-accent-400/45",
        ],
      },
      task: {
        root: [
          "inline-block align-bottom border border-line-strong bg-layer-muted px-1 font-bold text-foreground",
          "[font-size:inherit] leading-[21px]",
          "hover:bg-layer-strong",
        ],
      },
      thread: {
        root: [
          "inline-block align-bottom border border-line-strong bg-info-light px-1 font-bold text-info-dark",
          "[font-size:inherit] leading-[21px]",
          "hover:bg-info-base/45",
        ],
      },
      comment: {
        root: [
          "inline-flex items-center gap-1 align-bottom border border-line-strong px-1 font-bold text-foreground",
          "[font-size:inherit] leading-[21px]",
        ],
      },
      permalink: {
        root: [
          "inline-flex items-center gap-1 align-bottom border border-line-strong bg-layer-panel px-1 font-bold text-foreground",
          "[font-size:inherit] leading-[21px]",
          "hover:bg-layer-muted",
          "[&_svg]:size-3",
        ],
      },
      externalPermalink: {
        root: [
          "inline-flex items-center gap-1 align-bottom border border-line-strong bg-layer-panel px-1 font-bold text-info-dark",
          "[font-size:inherit] leading-[21px]",
          "hover:bg-layer-muted",
          "[&_svg]:size-3",
        ],
      },
      loading: {
        root: [
          "inline-flex cursor-wait items-center gap-1 align-bottom border border-line-strong bg-layer-muted px-1 font-bold text-foreground opacity-80",
          "[font-size:inherit] leading-[21px]",
        ],
      },
      channelUnavailable: {
        root: [
          "inline-block align-bottom border border-line-strong px-1 font-bold opacity-60",
          "[font-size:inherit] leading-[21px]",
        ],
      },
      threadUnavailable: {
        root: [
          "inline-block align-bottom border border-line-strong px-1 font-bold opacity-60",
          "[font-size:inherit] leading-[21px]",
        ],
      },
      taskUnavailable: {
        root: [
          "inline-block align-bottom border border-line-strong px-1 font-bold opacity-60",
          "[font-size:inherit] leading-[21px]",
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
      treatment: "comment",
      class: {
        root: "cursor-default border-black bg-brutal-stone/25 text-black hover:bg-brutal-stone/40",
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
      treatment: "mention",
      class: {
        root: [
          "inline-block cursor-pointer align-bottom font-medium text-foreground-strong",
          "decoration-1 decoration-foreground/30 hover:text-foreground hover:decoration-foreground/70",
        ],
      },
    },
    {
      theme: "elegant",
      treatment: [
        "selfMention",
        "channel",
        "task",
        "thread",
        "comment",
        "permalink",
        "externalPermalink",
      ],
      class: {
        root: [
          "cursor-pointer rounded-sm border-line-subtle px-1.5",
          "font-medium leading-[21px] text-foreground-strong",
        ],
      },
    },
    {
      theme: "elegant",
      treatment: "selfMention",
      class: {
        root: [
          "border-primary-400/20 bg-primary-400/15 text-foreground-strong",
          "hover:bg-primary-400/25",
        ],
      },
    },
    {
      theme: "elegant",
      treatment: "channel",
      class: {
        root: [
          "border-accent-400/20 bg-accent-400/10 text-foreground-strong",
          "hover:bg-accent-400/15",
        ],
      },
    },
    {
      theme: "elegant",
      treatment: "task",
      class: {
        root: "border-line-subtle bg-layer-muted text-foreground-strong hover:bg-layer-strong",
      },
    },
    {
      theme: "elegant",
      treatment: "thread",
      class: {
        root: [
          "border-info-base/20 bg-info-base/10 text-foreground-strong",
          "hover:bg-info-base/20",
        ],
      },
    },
    {
      theme: "elegant",
      treatment: "comment",
      class: {
        root: "border-line-subtle bg-layer-muted text-foreground-strong hover:bg-layer-strong",
      },
    },
    {
      theme: "elegant",
      treatment: ["permalink", "externalPermalink"],
      class: {
        root: "border-line-subtle bg-layer-muted text-foreground-strong hover:bg-layer-strong",
      },
    },
    {
      theme: "elegant",
      treatment: "loading",
      class: {
        root: [
          "cursor-wait rounded-sm border-line-subtle bg-layer-muted px-1.5 opacity-100",
          "font-medium leading-[21px] text-foreground-muted",
        ],
      },
    },
    {
      theme: "elegant",
      treatment: ["channelUnavailable", "threadUnavailable", "taskUnavailable"],
      class: {
        root: [
          "cursor-default rounded-sm border-line-subtle bg-layer-muted/70 px-1.5 opacity-100",
          "font-medium leading-[21px] text-foreground-muted",
        ],
      },
    },
  ],
});

export type MessageReferenceVariantProps = VariantProps<typeof messageReference>;
