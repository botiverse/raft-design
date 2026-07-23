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
    variant: {
      // Underline text mention (@Ada)
      plain: {
        root: [
          "font-medium underline decoration-2 underline-offset-2",
          "[font-size:inherit]",
          "hover:text-accent-500 hover:decoration-accent-500",
        ],
      },
      // Soft-signal chip (@you / self)
      highlight: {
        root: [
          "inline-block align-bottom border border-line-strong bg-soft-signal px-1 font-medium text-foreground",
          "[font-size:inherit] leading-tight",
          "hover:bg-soft-signal/80",
        ],
      },
      // Accent / pink chip (#channel)
      accent: {
        root: [
          "inline-block align-bottom border border-line-strong bg-accent-200/60 px-1 font-medium text-foreground",
          "[font-size:inherit] leading-tight",
          "hover:bg-accent-400/45",
        ],
      },
      // Neutral muted chip (#task)
      muted: {
        root: [
          "inline-block align-bottom border border-line-strong bg-layer-muted px-1 font-medium text-foreground",
          "[font-size:inherit] leading-tight",
          "hover:bg-layer-strong",
        ],
      },
      // Info / cyan chip (thread)
      info: {
        root: [
          "inline-block align-bottom border border-line-strong bg-info-light px-1 font-medium text-info-dark",
          "[font-size:inherit] leading-tight",
          "hover:bg-info-base/45",
        ],
      },
      // Subtle stone chip (comment)
      subtle: {
        root: [
          "inline-flex items-center gap-1 align-bottom border border-line-strong px-1 font-medium text-foreground",
          "[font-size:inherit] leading-tight",
        ],
      },
      // Panel chip (internal permalink)
      panel: {
        root: [
          "inline-flex items-center gap-1 align-bottom border border-line-strong bg-layer-panel px-1 font-medium text-foreground",
          "[font-size:inherit] leading-tight",
          "hover:bg-layer-muted",
          "[&_svg]:size-3",
        ],
      },
      // External permalink
      external: {
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
      variant: "plain",
      class: {
        root: [
          "cursor-default text-black decoration-black/30",
          "hover:text-brutal-pink hover:decoration-brutal-pink",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "highlight",
      class: { root: "cursor-default border-black bg-soft-signal text-black" },
    },
    {
      theme: "brutal",
      variant: "accent",
      class: {
        root: "cursor-default border-black bg-brutal-pink/30 text-black hover:bg-brutal-pink/60",
      },
    },
    {
      theme: "brutal",
      variant: "muted",
      class: {
        root: "cursor-default border-black bg-soft-signal/40 text-black hover:bg-soft-signal",
      },
    },
    {
      theme: "brutal",
      variant: "info",
      class: {
        root: "cursor-default border-black bg-brutal-cyan/30 text-black hover:bg-brutal-cyan/60",
      },
    },
    {
      theme: "brutal",
      variant: "subtle",
      class: {
        root: "cursor-default border-black bg-brutal-stone/25 text-black hover:bg-brutal-stone/40",
      },
    },
    {
      theme: "brutal",
      variant: "panel",
      class: {
        root: "cursor-default border-black bg-soft-signal/40 text-black hover:bg-soft-signal",
      },
    },
    {
      theme: "brutal",
      variant: "external",
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
      variant: "plain",
      class: {
        root: [
          "inline-block cursor-pointer align-bottom font-medium text-foreground-strong",
          "decoration-1 decoration-foreground/30 hover:text-foreground hover:decoration-foreground/70",
        ],
      },
    },
    {
      theme: "elegant",
      variant: ["highlight", "accent", "muted", "info", "subtle", "panel", "external"],
      class: {
        root: [
          "cursor-pointer rounded-sm border-line-subtle px-1.5",
          "font-medium leading-tight text-foreground-strong",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "highlight",
      class: {
        root: [
          "border-primary-400/20 bg-primary-400/15 text-foreground-strong",
          "hover:bg-primary-400/25",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "accent",
      class: {
        root: [
          "border-accent-400/20 bg-accent-400/10 text-foreground-strong",
          "hover:bg-accent-400/15",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "muted",
      class: {
        root: "border-line-subtle bg-layer-muted text-foreground-strong hover:bg-layer-strong",
      },
    },
    {
      theme: "elegant",
      variant: "info",
      class: {
        root: [
          "border-info-base/20 bg-info-base/10 text-foreground-strong",
          "hover:bg-info-base/20",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "subtle",
      class: {
        root: "border-line-subtle bg-layer-muted text-foreground-strong hover:bg-layer-strong",
      },
    },
    {
      theme: "elegant",
      variant: ["panel", "external"],
      class: {
        root: "border-line-subtle bg-layer-muted text-foreground-strong hover:bg-layer-strong",
      },
    },
    {
      theme: "elegant",
      variant: "pending",
      class: {
        root: [
          "cursor-wait rounded-sm border-line-subtle bg-layer-muted px-1.5 opacity-100",
          "font-medium leading-tight text-foreground-muted",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "unavailable",
      class: {
        root: [
          "cursor-default rounded-sm border-line-subtle bg-layer-muted/70 px-1.5 opacity-100",
          "font-medium leading-tight text-foreground-muted",
        ],
      },
    },
  ],
  defaultVariants: {
    variant: "muted",
  },
});

export type MessageReferenceVariantProps = VariantProps<typeof messageReference>;
export type MessageReferenceVariant = NonNullable<MessageReferenceVariantProps["variant"]>;
