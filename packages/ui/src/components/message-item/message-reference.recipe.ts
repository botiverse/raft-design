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
    // One rule for every reference in a message (#proj-rui task #84): the
    // chip is the body text's size and sits on the body text's baseline, and
    // its coloured box is the text's own line box plus symmetric padding —
    // no fixed height, no vertical nudge. The letters then look centred in
    // the box in every theme. `items-baseline` (with icons centred on their
    // own) makes the text, not a leading icon, set the chip's baseline.
    root: [
      "inline-flex items-baseline gap-1",
      "py-0 align-baseline",
      // oxlint-disable-next-line better-tailwindcss/enforce-canonical-classes
      "[font-size:inherit] leading-[1.2em]",
      "max-w-full truncate   select-text no-underline",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-strong",
      "[&_svg]:size-[0.857em] [&_svg]:shrink-0 [&_svg]:self-center",
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
          "h-[calc(1.2em+2px)] items-center rounded-l-full rounded-r-none pr-2.5 pl-2",
          "font-normal leading-none tracking-normal",
          "bg-(--reference-badge,transparent) text-(--reference-badge-ink,currentColor)",
          "[clip-path:inset(0_0_0_100%_round_9999px_0_0_9999px)]",
          "transition-[clip-path] duration-200 ease-out motion-reduce:transition-none",
          "group-hover:[clip-path:inset(0_round_9999px_0_0_9999px)]",
          "group-focus-visible:[clip-path:inset(0_round_9999px_0_0_9999px)]",
        ],
      },
      raft: {
        root: "focus-visible:outline-none focus-visible:shadow-raft-focus",
        badge: "hidden",
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
      theme: "raft",
      variant: "primary",
      class: {
        root: [
          "inline-flex cursor-pointer rounded-sticker px-[3px]",
          "font-semibold text-sticker-ink no-underline",
          "bg-primary shadow-[inset_0_0_0_1.5px_var(--sticker-ink)]",
          "hover:press-overlay-sticker",
        ],
      },
    },
    {
      theme: "raft",
      variant: "secondary",
      class: {
        root: [
          "inline cursor-pointer font-bold text-foreground",
          "underline decoration-foreground-hint decoration-[1.5px] underline-offset-[3px]",
          "hover:decoration-foreground",
        ],
      },
    },
    {
      theme: "raft",
      variant: ["accent", "muted", "info", "link", "pending", "unavailable"],
      class: {
        root: [
          "h-[22px] items-center gap-0.5 rounded-sticker px-1.5 has-[>svg]:pl-[3px] align-[1px]",
          // oxlint-disable-next-line better-tailwindcss/enforce-canonical-classes
          "[font-size:0.875em] leading-5 font-semibold text-foreground",
          "[&_svg]:size-3.5 [&_svg]:text-foreground-icon",
        ],
      },
    },
    {
      theme: "raft",
      variant: ["accent", "muted", "info", "link"],
      class: { root: "cursor-pointer hover:press-overlay active:press-overlay" },
    },
    { theme: "raft", variant: "accent", class: { root: "bg-accent-soft" } },
    { theme: "raft", variant: ["info", "link"], class: { root: "bg-info-soft" } },
    { theme: "raft", variant: "muted", class: { root: "bg-inactive-soft" } },
    {
      theme: "raft",
      variant: "pending",
      class: { root: "cursor-wait bg-inactive-soft text-foreground-muted" },
    },
    {
      theme: "raft",
      variant: "unavailable",
      class: { root: "cursor-default bg-inactive-soft text-foreground-hint" },
    },
    {
      theme: "brutal",
      variant: "primary",
      class: {
        root: [
          "inline-flex cursor-default gap-1 border border-black bg-primary px-1",
          "font-medium text-black",
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
          "hover:text-brutal-pink hover:decoration-brutal-pink",
        ],
      },
    },
    {
      theme: "brutal",
      variant: ["accent", "muted", "info", "link"],
      class: {
        root: [
          "inline-flex max-w-full cursor-default gap-1 border border-black px-1",
          "font-medium text-black",
          "has-[>svg]:relative has-[>svg]:isolate has-[>svg]:pr-1 has-[>svg]:pl-0",
          "has-[>svg]:before:pointer-events-none has-[>svg]:before:absolute has-[>svg]:before:inset-y-0 has-[>svg]:before:left-0 has-[>svg]:before:z-0",
          "has-[>svg]:before:w-[calc(0.857em+6px)] has-[>svg]:before:border-r has-[>svg]:before:border-black has-[>svg]:before:bg-(--reference-icon) has-[>svg]:before:content-['']",
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
          "inline-flex cursor-wait gap-1 border border-black bg-brutal-stone/30 px-1 font-medium text-black opacity-80",
        ],
      },
    },
    {
      theme: "brutal",
      variant: "unavailable",
      class: {
        root: [
          "inline-flex gap-1 border border-black bg-brutal-stone/30 px-1 font-medium text-black opacity-60",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "primary",
      class: {
        root: [
          "inline-flex gap-0.5 rounded-full border border-transparent bg-primary-400 px-2",
          "cursor-pointer font-normal tracking-normal text-[oklch(0.431_0.088_86.67)]",
          "transition-[filter,opacity] duration-100 hover:bg-primary-400 hover:text-[oklch(0.431_0.088_86.67)]",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "secondary",
      class: {
        root: "inline cursor-pointer font-medium underline underline-offset-2",
      },
    },
    {
      theme: "elegant",
      variant: ["accent", "muted", "info", "link"],
      class: {
        root: [
          "[--reference-badge-ink:var(--color-foreground-inverse)]",
          "group relative inline-flex max-w-full gap-1 rounded-full border border-transparent pr-2 pl-2",
          "cursor-pointer font-normal tracking-normal text-foreground",
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
          "has-[>[data-slot=message-reference-label]]:before:size-[calc(1.2em+2px)]",
          "has-[>[data-slot=message-reference-label]]:before:rounded-full",
          "has-[>[data-slot=message-reference-label]]:before:bg-(--reference-badge,transparent)",
          "has-[>[data-slot=message-reference-label]]:before:content-['']",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:relative",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:z-10",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:mx-[calc((1.2em+2px-0.857em)/2)]",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:overflow-visible",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:shrink-0",
          "has-[>[data-slot=message-reference-label]]:[&>svg]:text-(--reference-badge-ink,currentColor)",
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
          "inline-flex gap-1.5 rounded-full border border-transparent bg-fill-muted px-2",
          "cursor-wait font-normal tracking-normal text-foreground-muted",
        ],
      },
    },
    {
      theme: "elegant",
      variant: "unavailable",
      class: {
        root: [
          "inline-flex gap-1.5 rounded-full border border-transparent bg-fill-muted px-2",
          "cursor-default font-normal tracking-normal text-foreground-muted",
        ],
      },
    },
  ],
  defaultVariants: {
    variant: "muted",
  },
});
