import { tv } from "../../lib/tv";

/** Chip variants the public `MessageReferenceChip` prop accepts. */
export type MessageReferenceChipVariant =
  | "primary"
  | "accent"
  | "muted"
  | "info"
  | "neutral"
  | "link";

export const messageReference = tv({
  slots: {
    root: [
      "max-w-full overflow-hidden text-ellipsis whitespace-nowrap select-text no-underline",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    chipLabel: ["min-w-0 truncate"],
    chipMeta: ["shrink-0"],
    badge: ["inline-flex items-center", "text-[10px] leading-none font-medium whitespace-nowrap"],
  },
  variants: {
    theme: {
      brutal: {
        root: "focus-visible:outline-black",
        chipMeta: "text-[10px] font-normal leading-none text-foreground/50",
        badge: "hidden",
      },
      elegant: {
        chipMeta: "text-[10px] font-normal leading-none text-foreground-muted",
        // The reference colour lives on the label; the chip keeps the pale wash behind it.
        chipLabel: [
          "inline-flex h-4 items-center rounded-full px-1.5",
          "bg-[var(--reference-badge,transparent)] text-[var(--reference-badge-ink,currentColor)]",
        ],
        // Parked just left of the chip icon and clipped to nothing, so the caption grows leftwards
        // over preceding text on hover without measuring anything or moving the chip. Decorative —
        // the chip stays the pointer target.
        badge: [
          "pointer-events-none absolute top-1/2 right-[calc(100%-6px)] z-10 -translate-y-1/2",
          "h-4 rounded-full px-1.5",
          "bg-[var(--reference-badge)] text-[var(--reference-badge-ink)]",
          "[clip-path:inset(0_0_0_100%_round_9999px)]",
          "transition-[clip-path] duration-200 ease-out motion-reduce:transition-none",
          "group-hover:[clip-path:inset(0_round_9999px)]",
          "group-focus-visible:[clip-path:inset(0_round_9999px)]",
        ],
      },
    },
    variant: {
      mention: {},
      primary: {},
      accent: {},
      muted: {},
      info: {},
      neutral: {},
      link: {},
      pending: {},
      unavailable: {},
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      variant: "mention",
      class: {
        root: [
          "inline-flex cursor-default items-center gap-1 align-bottom border border-black bg-primary-400/40 px-1",
          "[font-size:inherit] font-medium leading-tight text-primary-900 no-underline",
          "has-[>svg]:inline-flex has-[>svg]:items-center has-[>svg]:gap-1",
          "hover:bg-primary-400/60 hover:text-primary-900",
        ],
      },
    },
    {
      theme: "brutal",
      variant: ["primary", "accent", "muted", "info", "neutral", "link"],
      class: {
        root: [
          "inline-flex max-w-full cursor-default items-center gap-1 align-bottom border border-black px-1",
          "[font-size:inherit] font-medium leading-tight text-black",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "primary",
      class: { root: "bg-soft-signal hover:bg-soft-signal/80" },
    },
    {
      theme: "brutal",
      variant: "accent",
      class: { root: "bg-brutal-pink/30 hover:bg-brutal-pink/60" },
    },
    {
      theme: "brutal",
      variant: "muted",
      class: { root: "bg-soft-signal/40 hover:bg-soft-signal" },
    },
    {
      theme: "brutal",
      variant: "info",
      class: { root: "bg-brutal-cyan/30 hover:bg-brutal-cyan/60" },
    },
    {
      theme: "brutal",
      variant: "neutral",
      class: { root: "bg-brutal-stone/25 hover:bg-brutal-stone/40" },
    },
    {
      theme: "brutal",
      variant: "link",
      class: { root: "bg-white text-[oklch(0.488_0.243_264.376)] hover:bg-black/5" },
    },
    {
      theme: "brutal",
      variant: "pending",
      class: {
        root: [
          "inline-flex cursor-wait items-center gap-1 align-bottom border border-black bg-brutal-cyan/30 px-1 font-medium text-black opacity-80",
          "[font-size:inherit] leading-tight",
          "has-[>svg]:inline-flex has-[>svg]:items-center has-[>svg]:gap-1",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "unavailable",
      class: {
        root: [
          "inline-block align-bottom border border-black bg-soft-signal/30 px-1 font-medium text-black opacity-60",
          "[font-size:inherit] leading-tight",
          "has-[>svg]:inline-flex has-[>svg]:items-center has-[>svg]:gap-1",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "mention",
      class: {
        root: [
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
        root: [
          "[--reference-badge-ink:var(--color-foreground-inverse)]",
          "group relative inline-flex h-[19px] max-w-full items-center gap-1.5 align-middle -mt-px rounded-full border border-transparent px-2 py-0",
          "[font-size:inherit] cursor-pointer font-normal leading-none tracking-normal text-foreground-strong",
          "has-[>svg]:pr-2.5 has-[>svg]:pl-2",
          // The filled label runs to the chip edge, so the chip drops its right padding.
          "has-[>[data-slot=message-reference-label]]:pr-0",
          "has-[>[data-message-reference-badge]]:overflow-visible",
          "transition-[filter,opacity] duration-100",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "primary",
      class: {
        root: [
          "bg-primary-400 text-[oklch(0.431_0.088_86.67)]",
          "hover:bg-primary-400 hover:text-[oklch(0.431_0.088_86.67)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: ["accent", "info"],
      class: {
        root: [
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
        root: [
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
        root: [
          "[--reference-badge:var(--color-foreground-muted)]",
          "border-line-subtle bg-layer-muted text-foreground-strong hover:bg-layer-strong",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "link",
      class: {
        root: [
          "[--reference-badge:var(--color-foreground-muted)]",
          "bg-layer-muted text-foreground-strong hover:bg-layer-strong",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "pending",
      class: {
        root: [
          "inline-flex h-[19px] items-center gap-1.5 align-middle -mt-px rounded-full border border-transparent bg-layer-muted px-2 py-0",
          "cursor-wait font-medium leading-none tracking-normal text-foreground-muted",
          "has-[>svg]:pr-2.5 has-[>svg]:pl-2",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "unavailable",
      class: {
        root: [
          "inline-flex h-[19px] items-center gap-1.5 align-middle -mt-px rounded-full border border-transparent bg-layer-muted px-2 py-0",
          "cursor-default font-medium leading-none tracking-normal text-foreground-muted",
          "has-[>svg]:pr-2.5 has-[>svg]:pl-2",
        ],
      },
    },
  ],
  defaultVariants: {
    variant: "muted",
  },
});
