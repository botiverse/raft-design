import { tv } from "../../lib/tv";

/** Chip variants the public `MessageReferenceChip` prop accepts. */
export type MessageReferenceChipVariant = "accent" | "muted" | "info" | "link";

/** Visual variants the public `MessageReferenceText` prop accepts. */
export type MessageReferenceTextVariant = "primary" | "secondary";

export const messageReference = tv({
  slots: {
    // The first three entries carry the inline-chip layout contract that
    // replaces slock's local MSG_REF_CHIP constant (slock #proj-message
    // task #28): inline layout with icon/text/trailing gap, zero vertical
    // padding with baseline alignment, and em-based sizing so the chip
    // scales with the message font-size preference and matches the
    // inline-code background-box height. `truncate` stays: it pins the
    // nowrap contract so refs never split across lines in screenshot export.
    root: [
      "inline-flex items-center gap-1",
      "py-0 align-bottom",
      // Keep the arbitrary-property form: the canonical `text-[0.875em]`
      // shorthand lives in a different tailwind-merge conflict group, so it
      // would survive next to a compound's `[font-size:inherit]` and the
      // override order would no longer be deterministic.
      // oxlint-disable-next-line better-tailwindcss/enforce-canonical-classes
      "[font-size:0.875em] leading-[1.3em]",
      "max-w-full truncate   select-text no-underline",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
      "[&_svg]:size-3 [&_svg]:shrink-0",
      "has-[>[data-slot=message-reference-indicator]]:relative has-[>[data-slot=message-reference-indicator]]:mr-2",
      "has-[>[data-slot=message-reference-indicator]]:inline-block",
      "has-[>[data-slot=message-reference-indicator]]:overflow-visible",
    ],
    chipLabel: ["min-w-0 truncate"],
    badge: ["inline-flex items-center whitespace-nowrap"],
    indicator: [
      "pointer-events-none absolute -right-1.5 top-0 inline-flex size-2 shrink-0 items-center justify-center",
      "*:data-[slot=status]:size-full",
    ],
  },
  variants: {
    theme: {
      brutal: {
        root: "focus-visible:outline-black",
        badge: "hidden",
      },
      elegant: {
        badge: [
          "pointer-events-none absolute -top-px right-[calc(100%-10px)] z-0",
          "h-[19px] items-center rounded-l-full rounded-r-none pr-2.5 pl-2",
          "font-normal leading-none tracking-normal",
          "bg-(--reference-badge,transparent) text-(--reference-badge-ink,currentColor)",
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
      variant: "primary",
      class: {
        root: [
          "inline-flex cursor-default items-center gap-1 align-bottom border border-black bg-primary px-1",
          "[font-size:inherit] font-medium leading-tight text-black",
          "has-[>svg]:inline-flex has-[>svg]:items-center has-[>svg]:gap-1",
          "hover:bg-primary/80 hover:text-black",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "secondary",
      class: {
        root: [
          "inline cursor-default font-bold text-black underline decoration-black/30 decoration-2 underline-offset-2",
          // A plain-text reference is body copy, not a chip: it must sit on the
          // surrounding baseline at the surrounding size. The slot default
          // (`[font-size:0.875em] leading-[1.3em] align-bottom`) is sized for the
          // bordered chip variants; inherited here it produced a shorter inline
          // box bottom-aligned in a taller line box, i.e. a baseline that sits
          // below the text either side of it.
          // oxlint-disable-next-line better-tailwindcss/enforce-canonical-classes
          "[font-size:inherit] leading-[inherit] align-baseline",
          "hover:text-brutal-pink hover:decoration-brutal-pink",
        ],
      },
    },
    {
      theme: "brutal",
      variant: ["accent", "muted", "info", "link"],
      class: {
        root: [
          "inline-flex max-w-full cursor-default items-center gap-1 align-bottom border border-black px-1",
          "[font-size:inherit] font-medium leading-tight text-black",
          "has-[>svg]:relative has-[>svg]:isolate has-[>svg]:h-[19px] has-[>svg]:py-0 has-[>svg]:pr-1 has-[>svg]:pl-0",
          "has-[>svg]:before:pointer-events-none has-[>svg]:before:absolute has-[>svg]:before:inset-y-0 has-[>svg]:before:left-0 has-[>svg]:before:z-0",
          "has-[>svg]:before:w-[18px] has-[>svg]:before:border-r has-[>svg]:before:border-black has-[>svg]:before:bg-(--reference-icon) has-[>svg]:before:content-['']",
          "has-[>svg]:[&>svg]:relative has-[>svg]:[&>svg]:z-10 has-[>svg]:[&>svg]:mx-[3px] has-[>svg]:[&>svg]:text-black",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "accent",
      class: {
        root: "[--reference-icon:var(--color-brutal-pink)] bg-brutal-pink/30 hover:bg-brutal-pink/60",
      },
    },
    {
      theme: "brutal",
      variant: "muted",
      class: {
        root: "[--reference-icon:var(--color-brutal-stone)] bg-brutal-stone/25 hover:bg-brutal-stone/40",
      },
    },
    {
      theme: "brutal",
      variant: "info",
      class: {
        root: "[--reference-icon:var(--color-brutal-cyan)] bg-brutal-cyan/30 hover:bg-brutal-cyan/60",
      },
    },
    {
      theme: "brutal",
      variant: "link",
      class: {
        root: "[--reference-icon:var(--color-brutal-cyan)] bg-brutal-cyan/30 text-black hover:bg-brutal-cyan/60",
      },
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
      variant: "primary",
      class: {
        root: [
          "inline-flex h-[19px] items-center gap-0.5 align-middle -mt-px rounded-full border border-transparent bg-primary-400 px-2 py-0",
          "[font-size:inherit] cursor-pointer font-normal leading-none tracking-normal text-[oklch(0.431_0.088_86.67)]",
          "transition-[filter,opacity] duration-100 hover:bg-primary-400 hover:text-[oklch(0.431_0.088_86.67)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "secondary",
      class: {
        root: [
          "inline cursor-pointer font-medium underline underline-offset-2",
          // See the brutal `secondary` note: same reason, same fix.
          // oxlint-disable-next-line better-tailwindcss/enforce-canonical-classes
          "[font-size:inherit] leading-[inherit] align-baseline",
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
          "[font-size:inherit] cursor-pointer font-normal leading-none tracking-normal text-foreground",
          "transition-[filter,opacity] duration-100",
          "has-[>[data-slot=message-reference-label]]:gap-1",
          "has-[>[data-slot=message-reference-label]]:pr-2",
          "has-[>[data-slot=message-reference-label]]:pl-0",
          "has-[>[data-slot=message-reference-label]]:isolate",
          "has-[>[data-slot=message-reference-label]]:overflow-visible",
          "has-[>[data-message-reference-badge]]:overflow-visible",
          "has-[>[data-slot=message-reference-label]]:before:pointer-events-none",
          "has-[>[data-slot=message-reference-label]]:before:absolute",
          "has-[>[data-slot=message-reference-label]]:before:-top-px",
          "has-[>[data-slot=message-reference-label]]:before:left-0",
          "has-[>[data-slot=message-reference-label]]:before:z-1",
          "has-[>[data-slot=message-reference-label]]:before:size-[19px]",
          "has-[>[data-slot=message-reference-label]]:before:rounded-full",
          "has-[>[data-slot=message-reference-label]]:before:bg-(--reference-badge,transparent)",
          "has-[>[data-slot=message-reference-label]]:before:content-['']",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:relative",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:z-10",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:mx-[3.5px]",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:overflow-visible",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:shrink-0",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:text-(--reference-badge-ink,currentColor)",
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
          "[--reference-badge:var(--accent-strong)]",
          "bg-[oklch(0.965_0.019_358.59)] text-[oklch(0.543_0.215_359.77)]",
          "hover:bg-[oklch(0.965_0.019_358.59)] hover:text-[oklch(0.543_0.215_359.77)]",
          "dark:bg-accent-soft dark:text-accent-strong",
          "dark:hover:bg-accent-soft dark:hover:text-accent-strong",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "muted",
      class: {
        root: [
          "[--reference-badge:var(--color-foreground-muted)]",
          "border-line-muted bg-fill-muted text-foreground hover:bg-fill-strong",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "link",
      class: {
        root: [
          "[--reference-badge:var(--info-strong)]",
          "bg-[oklch(0.966_0.022_224.02)] text-info-strong",
          "hover:bg-[oklch(0.966_0.022_224.02)] hover:text-info-strong",
          "dark:bg-info-soft dark:hover:bg-info-soft",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "pending",
      class: {
        root: [
          "inline-flex h-[19px] items-center gap-1.5 align-middle -mt-px rounded-full border border-transparent bg-fill-muted px-2 py-0",
          "cursor-wait font-normal leading-none tracking-normal text-foreground-muted",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "unavailable",
      class: {
        root: [
          "inline-flex h-[19px] items-center gap-1.5 align-middle -mt-px rounded-full border border-transparent bg-fill-muted px-2 py-0",
          "cursor-default font-normal leading-none tracking-normal text-foreground-muted",
        ],
      },
    },
  ],
  defaultVariants: {
    variant: "muted",
  },
});
