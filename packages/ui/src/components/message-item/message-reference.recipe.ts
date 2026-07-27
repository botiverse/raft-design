import { tv, type VariantProps } from "../../lib/tv";

export const messageReference = tv({
  slots: {
    text: [
      "max-w-full overflow-hidden text-ellipsis whitespace-nowrap select-text no-underline",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      "[&_svg]:shrink-0",
    ],
    chip: [
      "max-w-full overflow-hidden text-ellipsis whitespace-nowrap select-text no-underline",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      "[&_svg]:shrink-0",
    ],
    pending: [
      "max-w-full overflow-hidden text-ellipsis whitespace-nowrap select-text no-underline",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      "[&_svg]:shrink-0",
    ],
    unavailable: [
      "max-w-full overflow-hidden text-ellipsis whitespace-nowrap select-text no-underline",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      "[&_svg]:shrink-0",
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
    tone: {
      primary: {
        chip: ["inline-block align-bottom", "[font-size:inherit] leading-tight"],
      },
      accent: {
        chip: ["inline-block align-bottom", "[font-size:inherit] leading-tight"],
      },
      muted: {
        chip: ["inline-block align-bottom", "[font-size:inherit] leading-tight"],
      },
      info: {
        chip: ["inline-block align-bottom", "[font-size:inherit] leading-tight"],
      },
      neutral: {
        chip: ["inline-flex items-center gap-1 align-bottom", "[font-size:inherit] leading-tight"],
      },
      panel: {
        chip: [
          "inline-flex items-center gap-1 align-bottom",
          "[font-size:inherit] leading-tight",
          "[&_svg]:size-3",
        ],
      },
      external: {
        chip: [
          "inline-flex items-center gap-1 align-bottom",
          "[font-size:inherit] leading-tight",
          "[&_svg]:size-3",
        ],
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      class: {
        text: [
          "font-medium underline decoration-2 underline-offset-2",
          "[font-size:inherit]",
          "cursor-default text-black decoration-black/30",
          "hover:text-brutal-pink hover:decoration-brutal-pink",
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
      tone: "primary",
      class: {
        chip: "cursor-default border-black bg-soft-signal text-black hover:bg-soft-signal/80",
      },
    },
    {
      theme: "elegant",
      class: {
        text: [
          "inline-block cursor-pointer align-bottom font-medium text-foreground-strong",
          "underline decoration-1 underline-offset-2",
          "decoration-1 decoration-foreground/30 hover:text-foreground hover:decoration-foreground/70",
        ],
      },
    },
    {
      theme: "elegant",
      tone: ["primary", "accent", "muted", "info", "neutral", "panel", "external"],
      class: {
        chip: [
          "cursor-pointer rounded-sm border-line-subtle px-1.5",
          "font-medium leading-tight text-foreground-strong",
        ],
      },
    },
    {
      theme: "elegant",
      tone: "primary",
      class: {
        chip: [
          "border-primary-400/20 bg-primary-400/15 text-foreground-strong",
          "hover:bg-primary-400/25",
        ],
      },
    },
    {
      theme: "elegant",
      tone: "accent",
      class: {
        chip: [
          "border-accent-400/20 bg-accent-400/10 text-foreground-strong",
          "hover:bg-accent-400/15",
        ],
      },
    },
    {
      theme: "elegant",
      tone: "muted",
      class: {
        chip: "border-line-subtle bg-layer-muted text-foreground-strong hover:bg-layer-strong",
      },
    },
    {
      theme: "elegant",
      tone: "info",
      class: {
        chip: [
          "border-info-base/20 bg-info-base/10 text-foreground-strong",
          "hover:bg-info-base/20",
        ],
      },
    },
    {
      theme: "elegant",
      tone: "neutral",
      class: {
        chip: "border-line-subtle bg-layer-muted text-foreground-strong hover:bg-layer-strong",
      },
    },
    {
      theme: "elegant",
      tone: ["panel", "external"],
      class: {
        chip: "border-line-subtle bg-layer-muted text-foreground-strong hover:bg-layer-strong",
      },
    },
    {
      theme: "elegant",
      class: {
        pending: [
          "cursor-wait rounded-sm border-line-subtle bg-layer-muted px-1.5 opacity-100",
          "font-medium leading-tight text-foreground-muted",
        ],
        unavailable: [
          "cursor-default rounded-sm border-line-subtle bg-layer-muted/70 px-1.5 opacity-100",
          "font-medium leading-tight text-foreground-muted",
        ],
      },
    },
    {
      theme: "brutal",
      tone: "accent",
      class: {
        chip: "cursor-default border-black bg-brutal-pink/30 text-black hover:bg-brutal-pink/60",
      },
    },
    {
      theme: "brutal",
      tone: ["muted", "panel"],
      class: {
        chip: "cursor-default border-black bg-soft-signal/40 text-black hover:bg-soft-signal",
      },
    },
    {
      theme: "brutal",
      tone: "info",
      class: {
        chip: "cursor-default border-black bg-brutal-cyan/30 text-black hover:bg-brutal-cyan/60",
      },
    },
    {
      theme: "brutal",
      tone: "neutral",
      class: {
        chip: "cursor-default border-black bg-brutal-stone/25 text-black hover:bg-brutal-stone/40",
      },
    },
    {
      theme: "brutal",
      tone: "external",
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
});

export type MessageReferenceChipToneProps = VariantProps<typeof messageReference>;
export type MessageReferenceChipTone = NonNullable<MessageReferenceChipToneProps["tone"]>;
