import { tv, type VariantProps } from "../../lib/tv";

/** Shared by every reference surface: `text`, `chip`, `pending`, `unavailable`. */
const surface = [
  "max-w-full overflow-hidden text-ellipsis whitespace-nowrap select-text no-underline",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
  "[&_svg]:size-3 [&_svg]:shrink-0",
];

/** Elegant pill geometry, shared by every surface in that theme. */
const elegantPill = [
  "h-[19px] align-middle -mt-px rounded-full border border-transparent px-2 py-0",
  "leading-none tracking-normal",
  "has-[>svg]:pr-2.5 has-[>svg]:pl-2",
];

/** Brutal surfaces only become a row when the consumer passes a leading icon. */
const brutalIconRow = "has-[>svg]:inline-flex has-[>svg]:items-center has-[>svg]:gap-1";

const brutalBox = ["align-bottom border px-1 font-medium", "[font-size:inherit] leading-tight"];

export const messageReference = tv({
  slots: {
    text: surface,
    chip: [
      ...surface,
      "inline-flex items-center gap-1 align-bottom",
      "[font-size:inherit] leading-tight",
    ],
    pending: surface,
    unavailable: surface,
    chipLabel: ["min-w-0 truncate"],
    chipMeta: ["shrink-0"],
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
        text: ["focus-visible:outline-black", brutalIconRow],
        chip: ["focus-visible:outline-black", "border px-1 font-medium text-foreground"],
        pending: ["focus-visible:outline-black", brutalIconRow],
        unavailable: ["focus-visible:outline-black", brutalIconRow],
        chipMeta: "text-[10px] font-normal leading-none text-foreground/50",
        badge: "border border-black bg-soft-signal px-1 text-black",
      },
      elegant: {
        chipMeta: "text-[10px] font-normal leading-none text-foreground-muted",
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
        text: [
          "inline-flex cursor-default items-center gap-1 border-black bg-primary-400/40",
          ...brutalBox,
          "text-primary-900 no-underline hover:bg-primary-400/60 hover:text-primary-900",
        ],
        pending: [
          "inline-flex cursor-wait items-center gap-1 border-line-strong bg-layer-muted opacity-80",
          ...brutalBox,
          "text-foreground",
        ],
        unavailable: ["inline-block border-line-strong opacity-60", ...brutalBox],
      },
    },
    {
      theme: "brutal",
      class: {
        pending: "border-black bg-brutal-cyan/30 text-black",
        unavailable: "border-black bg-soft-signal/30 text-black",
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
      theme: "elegant",
      class: {
        text: [
          ...elegantPill,
          "inline-flex items-center gap-0.5",
          "cursor-pointer font-normal bg-[oklch(0.955_0.067_93.62)] text-[oklch(0.44_0.09_91.39)]",
          "transition-[filter,opacity] duration-100 hover:bg-[oklch(0.955_0.067_93.62)] hover:text-[oklch(0.44_0.09_91.39)]",
        ],
        pending: [
          ...elegantPill,
          "inline-flex items-center gap-1.5",
          "cursor-wait font-medium bg-layer-muted text-foreground-muted",
        ],
        unavailable: [
          ...elegantPill,
          "inline-flex items-center gap-1.5",
          "cursor-default font-medium bg-layer-muted text-foreground-muted",
        ],
      },
    },
    {
      theme: "elegant",
      variant: ["primary", "accent", "muted", "info", "neutral", "link"],
      class: {
        chip: [
          ...elegantPill,
          "[--reference-badge-ink:var(--color-foreground-inverse)]",
          "group relative gap-1.5",
          "cursor-pointer font-normal text-foreground-strong",
          "has-[>[data-message-reference-badge]]:overflow-visible",
          "has-[>[data-message-reference-badge]]:pr-2.5 has-[>[data-message-reference-badge]]:pl-[21.5px]",
          "transition-[filter,opacity] duration-100",
        ],
      },
    },
    {
      // The bare-icon path renders the icon itself as the badge circle.
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
      variant: ["accent", "info"],
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
      variant: "link",
      class: {
        chip: [
          "[--reference-badge:var(--color-foreground-muted)]",
          "bg-layer-muted text-foreground-strong hover:bg-layer-strong",
        ],
      },
    },
  ],
  defaultVariants: {
    variant: "muted",
  },
});

type MessageReferenceVariantProps = VariantProps<typeof messageReference>;

export type MessageReferenceChipVariant = NonNullable<MessageReferenceVariantProps["variant"]>;
