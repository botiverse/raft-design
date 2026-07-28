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
    badge: [
      "inline-flex items-center gap-1",
      "text-[10px] leading-none font-medium",
      // Doubled class outranks the surface's own `[&_svg]` icon treatment.
      "[&&_svg]:size-2.5 [&&_svg]:rounded-none [&&_svg]:bg-transparent [&&_svg]:p-0 [&&_svg]:text-current",
    ],
    badgeLabel: ["overflow-hidden whitespace-nowrap"],
  },
  variants: {
    theme: {
      brutal: {
        text: "focus-visible:outline-black",
        chip: ["focus-visible:outline-black", "border px-1 font-medium text-foreground"],
        pending: "focus-visible:outline-black",
        unavailable: "focus-visible:outline-black",
        meta: "text-[10px] font-normal leading-none text-foreground/50",
        badge: "border border-black bg-soft-signal px-1 text-black",
      },
      elegant: {
        meta: "text-[10px] font-normal leading-none text-foreground-muted",
        // Anchored by its right edge so the reveal grows leftwards over preceding text.
        badge: [
          "absolute top-1/2 right-[calc(100%-17.5px)] z-10 -translate-y-1/2",
          "h-4 flex-row-reverse gap-0 rounded-full px-[3px]",
          "bg-[var(--reference-badge)] text-[var(--reference-badge-ink)]",
          "transition-[padding,gap] duration-200 ease-out motion-reduce:transition-none",
          "group-hover:gap-1 group-hover:pl-1.5",
          "group-focus-visible:gap-1 group-focus-visible:pl-1.5",
        ],
        badgeLabel: [
          "max-w-0 opacity-0",
          "transition-[max-width,opacity] duration-200 ease-out motion-reduce:transition-none",
          "group-hover:max-w-16 group-hover:opacity-100",
          "group-focus-visible:max-w-16 group-focus-visible:opacity-100",
        ],
      },
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
          "[--reference-badge-ink:var(--color-foreground-inverse)]",
          "group relative h-[19px] gap-1.5 align-middle -mt-px rounded-full border border-transparent px-2 py-0",
          "cursor-pointer font-normal leading-none tracking-normal text-foreground-strong",
          "has-[>svg]:pr-2.5 has-[>svg]:pl-2",
          "has-[>[data-message-reference-badge]]:overflow-visible",
          "has-[>[data-message-reference-badge]]:pr-2.5 has-[>[data-message-reference-badge]]:pl-[21.5px]",
          "transition-[filter,opacity] duration-100",
        ],
      },
    },
    {
      theme: "elegant",
      variant: ["accent", "muted", "info", "neutral", "link"],
      class: {
        chip: [
          "has-[>svg]:pl-[1.5px]",
          "[&_svg]:size-4 [&_svg]:rounded-full [&_svg]:bg-[var(--reference-badge)] [&_svg]:p-[3px] [&_svg]:text-[var(--reference-badge-ink)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "primary",
      class: {
        chip: [
          "bg-primary-400 text-[oklch(0.431_0.088_86.67)]",
          "hover:bg-primary-400 hover:text-[oklch(0.431_0.088_86.67)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "accent",
      class: {
        chip: [
          "[--reference-badge:oklch(0.543_0.215_359.77)]",
          "bg-[oklch(0.965_0.019_358.59)] text-[oklch(0.543_0.215_359.77)]",
          "hover:bg-[oklch(0.965_0.019_358.59)] hover:text-[oklch(0.543_0.215_359.77)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "muted",
      class: {
        chip: [
          "[--reference-badge:var(--color-foreground-muted)]",
          "border-line-subtle bg-layer-muted text-foreground-strong hover:bg-layer-strong",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "info",
      class: {
        chip: [
          "[--reference-badge:oklch(0.543_0.215_359.77)]",
          "bg-[oklch(0.965_0.019_358.59)] text-[oklch(0.543_0.215_359.77)]",
          "hover:bg-[oklch(0.965_0.019_358.59)] hover:text-[oklch(0.543_0.215_359.77)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "neutral",
      class: {
        chip: [
          "[--reference-badge:oklch(0.441_0.078_221.2)]",
          "bg-[oklch(0.966_0.022_224.02)] text-[oklch(0.441_0.078_221.2)]",
          "hover:bg-[oklch(0.966_0.022_224.02)] hover:text-[oklch(0.441_0.078_221.2)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "link",
      class: {
        chip: [
          "[--reference-badge:var(--color-foreground-muted)]",
          "bg-layer-muted text-foreground-strong hover:bg-layer-strong",
        ],
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
