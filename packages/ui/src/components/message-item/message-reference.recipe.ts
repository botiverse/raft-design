import { tv, type VariantProps } from "../../lib/tv";

export const messageReference = tv({
  slots: {
    root: [
      "max-w-full overflow-hidden text-ellipsis whitespace-nowrap select-text no-underline",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      "[&_svg]:shrink-0",
    ],
    label: ["min-w-0 truncate"],
    meta: ["shrink-0 text-[10px] leading-none font-medium text-foreground/50"],
  },
  variants: {
    theme: {
      brutal: { root: "focus-visible:outline-black" },
      elegant: { meta: "text-foreground-muted" },
    },
    variant: {
      // Other-member mention (@Ada)
      mention: {
        root: [
          "font-medium underline decoration-2 underline-offset-2",
          "[font-size:inherit]",
          "hover:text-accent-500 hover:decoration-accent-500",
        ],
      },
      // Current-member mention (@you)
      self: {
        root: [
          "inline-block align-bottom border border-line-strong bg-soft-signal px-1 font-medium text-foreground",
          "[font-size:inherit] leading-tight",
          "hover:bg-soft-signal/80",
        ],
      },
      // Channel, DM, thread, or message destination
      conversation: {
        root: [
          "inline-block align-bottom border border-line-strong bg-accent-200/60 px-1 font-medium text-foreground",
          "[font-size:inherit] leading-tight",
          "hover:bg-accent-400/45",
        ],
      },
      // Attachment-comment context
      attachment: {
        root: [
          "inline-flex items-center gap-1 align-bottom border border-line-strong px-1 font-medium text-foreground",
          "[font-size:inherit] leading-tight",
        ],
      },
      // Internal Slock permalink
      permalink: {
        root: [
          "inline-flex items-center gap-1 align-bottom border border-line-strong bg-layer-panel px-1 font-medium text-foreground",
          "[font-size:inherit] leading-tight",
          "hover:bg-layer-muted",
          "[&_svg]:size-3",
        ],
      },
      // External permalink
      "external-permalink": {
        root: [
          "inline-flex items-center gap-1 align-bottom border border-line-strong bg-layer-panel px-1 font-medium text-info-dark",
          "[font-size:inherit] leading-tight",
          "hover:bg-layer-muted",
          "[&_svg]:size-3",
        ],
      },
      // Resolving / loading chip
      pending: {
        root: [
          "inline-flex cursor-wait items-center gap-1 align-bottom border border-line-strong bg-layer-muted px-1 font-medium text-foreground opacity-80",
          "[font-size:inherit] leading-tight",
        ],
      },
      // Missing / unresolvable chip
      unavailable: {
        root: [
          "inline-block align-bottom border border-line-strong px-1 font-medium opacity-60",
          "[font-size:inherit] leading-tight",
        ],
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      variant: [
        "mention",
        "self",
        "conversation",
        "attachment",
        "permalink",
        "external-permalink",
        "pending",
        "unavailable",
      ],
      class: { root: "has-[>svg]:inline-flex has-[>svg]:items-center has-[>svg]:gap-1" },
    },
    {
      theme: "brutal",
      variant: "mention",
      class: {
        root: [
          "cursor-default text-black decoration-black/30",
          "hover:text-brutal-pink hover:decoration-brutal-pink",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "self",
      class: { root: "cursor-default border-black bg-soft-signal text-black" },
    },
    {
      theme: "brutal",
      variant: "conversation",
      class: {
        root: "cursor-default border-black bg-brutal-pink/30 text-black hover:bg-brutal-pink/60",
      },
    },
    {
      theme: "brutal",
      variant: "attachment",
      class: {
        root: "cursor-default border-black bg-brutal-stone/25 text-black hover:bg-brutal-stone/40",
      },
    },
    {
      theme: "brutal",
      variant: "permalink",
      class: {
        root: "cursor-default border-black bg-soft-signal/40 text-black hover:bg-soft-signal",
      },
    },
    {
      theme: "brutal",
      variant: "external-permalink",
      class: {
        root: "cursor-default border-black bg-white text-[oklch(0.488_0.243_264.376)] hover:bg-black/5",
      },
    },
    {
      theme: "brutal",
      variant: "pending",
      class: { root: "border-black bg-brutal-cyan/30 text-black" },
    },
    {
      theme: "brutal",
      variant: "unavailable",
      class: { root: "border-black bg-soft-signal/30 text-black" },
    },
    {
      theme: "elegant",
      variant: ["mention", "self", "conversation", "permalink", "external-permalink"],
      class: {
        root: "transition-[filter,opacity] duration-100 hover:brightness-[0.96]",
      },
    },
    {
      theme: "elegant",
      variant: ["mention", "self"],
      class: {
        root: "has-[>svg]:gap-[2.5px]",
      },
    },
    {
      theme: "elegant",
      variant: "mention",
      class: {
        root: [
          "inline-block cursor-pointer align-bottom rounded-full border border-transparent bg-[oklch(0.955_0.067_93.62)] px-2 py-0 no-underline",
          "has-[>svg]:pr-2.5 has-[>svg]:pl-2 font-medium text-[oklch(0.44_0.09_91.39)] hover:bg-[oklch(0.955_0.067_93.62)] hover:text-[oklch(0.44_0.09_91.39)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: ["self", "conversation", "permalink", "external-permalink"],
      class: {
        root: [
          "cursor-pointer rounded-full border-transparent px-2 py-0",
          "has-[>svg]:pr-2.5 has-[>svg]:pl-2 font-medium text-foreground-strong",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "self",
      class: {
        root: [
          "border-transparent bg-[oklch(0.886_0.155_91.41)] text-[oklch(0.431_0.088_86.67)]",
          "hover:bg-[oklch(0.886_0.155_91.41)] hover:text-[oklch(0.431_0.088_86.67)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "conversation",
      class: {
        root: [
          "border-transparent bg-[oklch(0.914_0.048_358.59)] text-[oklch(0.543_0.215_359.77)]",
          "hover:bg-[oklch(0.914_0.048_358.59)] hover:text-[oklch(0.543_0.215_359.77)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: ["permalink", "external-permalink"],
      class: {
        root: [
          "border-transparent bg-[oklch(0.783_0.135_219.26)] text-[oklch(0.445_0.083_224.7)]",
          "hover:bg-[oklch(0.783_0.135_219.26)] hover:text-[oklch(0.445_0.083_224.7)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "attachment",
      class: {
        root: [
          "cursor-pointer rounded-full border-transparent bg-[oklch(0.91_0.056_224.02)] px-2 py-0 text-[oklch(0.441_0.078_221.2)]",
          "has-[>svg]:pr-2.5 has-[>svg]:pl-2 hover:bg-[oklch(0.91_0.056_224.02)] hover:text-[oklch(0.441_0.078_221.2)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "pending",
      class: {
        root: [
          "cursor-wait rounded-full border-transparent bg-layer-muted px-2 py-0 opacity-100",
          "has-[>svg]:pr-2.5 has-[>svg]:pl-2 font-medium text-foreground-muted",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "unavailable",
      class: {
        root: [
          "cursor-default rounded-full border-transparent bg-layer-muted px-2 py-0 opacity-100",
          "has-[>svg]:pr-2.5 has-[>svg]:pl-2 font-medium text-foreground-muted",
        ],
      },
    },
    {
      theme: "elegant",
      variant: [
        "mention",
        "self",
        "conversation",
        "attachment",
        "permalink",
        "external-permalink",
        "pending",
        "unavailable",
      ],
      class: {
        root: [
          "inline-flex h-[19px] items-center gap-1.5 align-middle -mt-px text-[13px] font-medium leading-none tracking-normal",
          "[&_svg]:size-3",
        ],
      },
    },
  ],
  defaultVariants: {
    variant: "conversation",
  },
});

export type MessageReferenceVariantProps = VariantProps<typeof messageReference>;
export type MessageReferenceVariant = NonNullable<MessageReferenceVariantProps["variant"]>;
