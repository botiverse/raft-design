import { tv } from "../../lib/tv";

/** Chip variants the public `MessageReferenceChip` prop accepts. */
export type MessageReferenceChipVariant = "accent" | "muted" | "info" | "link";

/** Visual variants the public `MessageReferenceText` prop accepts. */
export type MessageReferenceTextVariant = "primary" | "secondary";

export const messageReference = tv({
  slots: {
    root: [
      "max-w-full overflow-hidden text-ellipsis whitespace-nowrap select-text no-underline",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus",
      "[&_svg]:size-3 [&_svg]:shrink-0",
    ],
    chipLabel: ["min-w-0 truncate"],
    chipMeta: ["shrink-0"],
    badge: ["inline-flex items-center whitespace-nowrap"],
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
        badge: [
          "pointer-events-none absolute -top-px right-[calc(100%-10px)] z-0",
          "inline-flex h-[19px] items-center rounded-l-full rounded-r-none pr-2.5 pl-2",
          "font-normal leading-none tracking-normal",
          "bg-[var(--reference-badge,transparent)] text-[var(--reference-badge-ink,currentColor)]",
          "[clip-path:inset(0_0_0_100%_round_9999px_0_0_9999px)]",
          "transition-[clip-path] duration-200 ease-out motion-reduce:transition-none",
          "group-hover:[clip-path:inset(0_round_9999px_0_0_9999px)]",
          "group-focus-visible:[clip-path:inset(0_round_9999px_0_0_9999px)]",
        ],
      },
    },
    variant: {
      primary: {},
      secondary: {},
      accent: {},
      muted: {},
      info: {},
      link: {},
      pending: {},
      unavailable: {},
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      variant: ["primary", "secondary"],
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
      variant: "primary",
      class: {
        root: "bg-soft-signal text-black hover:bg-soft-signal/80 hover:text-black",
      },
    },
    {
      theme: "brutal",
      variant: ["accent", "muted", "info", "link"],
      class: {
        root: [
          "inline-flex max-w-full cursor-default items-center gap-1 align-bottom border border-black px-1",
          "[font-size:inherit] font-medium leading-tight text-black",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "accent",
      class: { root: "bg-brutal-pink/30 hover:bg-brutal-pink/60" },
    },
    {
      theme: "brutal",
      variant: "muted",
      class: { root: "bg-brutal-stone/25 hover:bg-brutal-stone/40" },
    },
    {
      theme: "brutal",
      variant: "info",
      class: { root: "bg-brutal-cyan/30 hover:bg-brutal-cyan/60" },
    },
    {
      theme: "brutal",
      variant: "link",
      class: { root: "bg-brutal-cyan/30 text-black hover:bg-brutal-cyan/60" },
    },
    {
      theme: "brutal",
      variant: "pending",
      class: {
        root: [
          "inline-flex cursor-wait items-center gap-1 align-bottom border border-black bg-brutal-stone/30 px-1 font-medium text-black opacity-80",
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
          "inline-block align-bottom border border-black bg-brutal-stone/30 px-1 font-medium text-black opacity-60",
          "[font-size:inherit] leading-tight",
          "has-[>svg]:inline-flex has-[>svg]:items-center has-[>svg]:gap-1",
        ],
      },
    },
    {
      theme: "elegant",
      variant: ["primary", "secondary"],
      class: {
        root: [
          "inline-flex h-[19px] items-center gap-0.5 align-middle -mt-px rounded-full border border-transparent bg-[oklch(0.955_0.067_93.62)] px-2 py-0",
          "[font-size:inherit] cursor-pointer font-normal leading-none tracking-normal text-primary-800",
          "transition-[filter,opacity] duration-100 hover:bg-[oklch(0.955_0.067_93.62)] hover:text-primary-800",
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
      variant: ["accent", "muted", "info", "link"],
      class: {
        root: [
          "[--reference-badge-ink:var(--color-foreground-inverse)]",
          "group relative inline-flex h-[19px] max-w-full items-center gap-1 align-middle -mt-px rounded-full border border-transparent py-0 pr-2 pl-2",
          "[font-size:inherit] cursor-pointer font-normal leading-none tracking-normal text-foreground-strong",
          "transition-[filter,opacity] duration-100",
          "has-[>[data-slot=message-reference-label]]:gap-1",
          "has-[>[data-slot=message-reference-label]]:pr-2",
          "has-[>[data-slot=message-reference-label]]:pl-0",
          "has-[>[data-slot=message-reference-label]]:isolate",
          "has-[>[data-message-reference-badge]]:overflow-visible",
          "has-[>[data-slot=message-reference-label]]:before:pointer-events-none",
          "has-[>[data-slot=message-reference-label]]:before:absolute",
          "has-[>[data-slot=message-reference-label]]:before:-top-px",
          "has-[>[data-slot=message-reference-label]]:before:left-0",
          "has-[>[data-slot=message-reference-label]]:before:z-[1]",
          "has-[>[data-slot=message-reference-label]]:before:size-[19px]",
          "has-[>[data-slot=message-reference-label]]:before:rounded-full",
          "has-[>[data-slot=message-reference-label]]:before:bg-[var(--reference-badge,transparent)]",
          "has-[>[data-slot=message-reference-label]]:before:content-['']",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:relative",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:z-10",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:mx-[3.5px]",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:overflow-visible",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:shrink-0",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:text-[var(--reference-badge-ink,currentColor)]",
          "not-has-[>[data-slot=message-reference-label]]:pt-0",
          "not-has-[>[data-slot=message-reference-label]]:pb-[3px]",
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
          "[--reference-badge:oklch(0.441_0.078_221.2)]",
          "bg-[oklch(0.966_0.022_224.02)] text-[oklch(0.441_0.078_221.2)]",
          "hover:bg-[oklch(0.966_0.022_224.02)] hover:text-[oklch(0.441_0.078_221.2)]",
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
        ],
      },
    },
  ],
  defaultVariants: {
    variant: "muted",
  },
});
