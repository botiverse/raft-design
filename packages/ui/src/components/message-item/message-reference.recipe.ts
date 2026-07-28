import { tv, type VariantProps } from "../../lib/tv";

export const messageReference = tv({
  slots: {
    text: [
      "max-w-full overflow-hidden text-ellipsis whitespace-nowrap select-text no-underline",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    chip: [
      "inline-flex max-w-full items-center gap-1 overflow-hidden text-ellipsis whitespace-nowrap align-bottom select-text no-underline",
      "[font-size:inherit] leading-tight",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    pending: [
      "max-w-full overflow-hidden text-ellipsis whitespace-nowrap select-text no-underline",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    unavailable: [
      "max-w-full overflow-hidden text-ellipsis whitespace-nowrap select-text no-underline",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    label: ["min-w-0 truncate"],
    meta: ["shrink-0"],
  },
  variants: {
    theme: {
      brutal: {
        text: "focus-visible:outline-black",
        chip: ["focus-visible:outline-black", "border px-1 font-medium text-foreground"],
        pending: "focus-visible:outline-black",
        unavailable: "focus-visible:outline-black",
        meta: "text-[10px] font-normal leading-none text-foreground/50",
      },
      elegant: { meta: "text-[10px] font-normal leading-none text-foreground-muted" },
    },
    variant: {
      primary: {},
      accent: {},
      muted: {},
      info: {},
      neutral: {},
      link: {},
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      class: {
        text: "has-[>svg]:inline-flex has-[>svg]:items-center has-[>svg]:gap-1",
        pending: "has-[>svg]:inline-flex has-[>svg]:items-center has-[>svg]:gap-1",
        unavailable: "has-[>svg]:inline-flex has-[>svg]:items-center has-[>svg]:gap-1",
      },
    },
    {
      theme: "brutal",
      class: {
        text: [
          "inline-flex cursor-default items-center gap-1 align-bottom border border-black bg-primary-400/40 px-1",
          "[font-size:inherit] font-medium leading-tight text-primary-900 no-underline",
          "hover:bg-primary-400/60 hover:text-primary-900",
        ],
      },
    },
    {
      theme: "brutal",
      class: {
        pending: [
          "inline-flex cursor-wait items-center gap-1 align-bottom border border-line-strong bg-layer-muted px-1 font-medium text-foreground opacity-80",
          "[font-size:inherit] leading-tight",
        ],
        unavailable: [
          "inline-block align-bottom border border-line-strong px-1 font-medium opacity-60",
          "[font-size:inherit] leading-tight",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "primary",
      class: {
        chip: "cursor-default border-black bg-soft-signal text-black hover:bg-soft-signal/80",
      },
    },
    {
      theme: "elegant",
      class: {
        text: [
          "inline-flex h-[19px] items-center gap-0.5 align-middle -mt-px rounded-full border border-transparent bg-[oklch(0.955_0.067_93.62)] px-2 py-0",
          "cursor-pointer font-normal leading-none tracking-normal text-[oklch(0.44_0.09_91.39)]",
          "has-[>svg]:pr-2.5 has-[>svg]:pl-2",
          "transition-[filter,opacity] duration-100 hover:bg-[oklch(0.955_0.067_93.62)] hover:text-[oklch(0.44_0.09_91.39)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: ["primary", "accent", "muted", "info", "neutral", "link"],
      class: {
        chip: [
          "h-[19px] gap-1.5 align-middle -mt-px rounded-full border border-transparent px-2 py-0",
          "cursor-pointer font-normal leading-none tracking-normal text-foreground-strong",
          "has-[>svg]:pr-2.5 has-[>svg]:pl-2",
          "transition-[filter,opacity] duration-100",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "primary",
      class: {
        chip: [
          "bg-[oklch(0.886_0.155_91.41)] text-[oklch(0.431_0.088_86.67)]",
          "hover:bg-[oklch(0.886_0.155_91.41)] hover:text-[oklch(0.431_0.088_86.67)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "accent",
      class: {
        chip: [
          "bg-[oklch(0.914_0.048_358.59)] text-[oklch(0.543_0.215_359.77)]",
          "hover:bg-[oklch(0.914_0.048_358.59)] hover:text-[oklch(0.543_0.215_359.77)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "muted",
      class: {
        chip: "border-line-subtle bg-layer-muted text-foreground-strong hover:bg-layer-strong",
      },
    },
    {
      theme: "elegant",
      variant: "info",
      class: {
        chip: [
          "bg-[oklch(0.914_0.048_358.59)] text-[oklch(0.543_0.215_359.77)]",
          "hover:bg-[oklch(0.914_0.048_358.59)] hover:text-[oklch(0.543_0.215_359.77)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "neutral",
      class: {
        chip: [
          "bg-[oklch(0.91_0.056_224.02)] text-[oklch(0.441_0.078_221.2)]",
          "hover:bg-[oklch(0.91_0.056_224.02)] hover:text-[oklch(0.441_0.078_221.2)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "link",
      class: {
        chip: "bg-layer-muted text-foreground-strong hover:bg-layer-strong",
      },
    },
    {
      theme: "elegant",
      class: {
        pending: [
          "inline-flex h-[19px] items-center gap-1.5 align-middle -mt-px rounded-full border border-transparent bg-layer-muted px-2 py-0",
          "cursor-wait font-medium leading-none tracking-normal text-foreground-muted opacity-100",
          "has-[>svg]:pr-2.5 has-[>svg]:pl-2",
        ],
        unavailable: [
          "inline-flex h-[19px] items-center gap-1.5 align-middle -mt-px rounded-full border border-transparent bg-layer-muted px-2 py-0",
          "cursor-default font-medium leading-none tracking-normal text-foreground-muted opacity-100",
          "has-[>svg]:pr-2.5 has-[>svg]:pl-2",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "accent",
      class: {
        chip: "cursor-default border-black bg-brutal-pink/30 text-black hover:bg-brutal-pink/60",
      },
    },
    {
      theme: "brutal",
      variant: "muted",
      class: {
        chip: "cursor-default border-black bg-soft-signal/40 text-black hover:bg-soft-signal",
      },
    },
    {
      theme: "brutal",
      variant: "info",
      class: {
        chip: "cursor-default border-black bg-brutal-cyan/30 text-black hover:bg-brutal-cyan/60",
      },
    },
    {
      theme: "brutal",
      variant: "neutral",
      class: {
        chip: "cursor-default border-black bg-brutal-stone/25 text-black hover:bg-brutal-stone/40",
      },
    },
    {
      theme: "brutal",
      variant: "link",
      class: {
        chip: "cursor-default border-black bg-white text-[oklch(0.488_0.243_264.376)] hover:bg-black/5",
      },
    },
    {
      theme: "brutal",
      class: {
        pending: "border-black bg-brutal-cyan/30 text-black",
        unavailable: "border-black bg-soft-signal/30 text-black",
      },
    },
  ],
  defaultVariants: {
    variant: "muted",
  },
});

type MessageReferenceVariantProps = VariantProps<typeof messageReference>;

export type MessageReferenceChipVariant = NonNullable<MessageReferenceVariantProps["variant"]>;
