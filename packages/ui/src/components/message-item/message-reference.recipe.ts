import { tv } from "../../lib/tv";

/** Chip variants the public `MessageReferenceChip` prop accepts. */
export type MessageReferenceChipVariant = "accent" | "muted" | "info" | "link";

/** Visual variants the public `MessageReferenceText` prop accepts. */
export type MessageReferenceTextVariant = "primary" | "secondary";

// A reference chip in a message: the body text's size on the body text's
// baseline, its box the text's own line box plus symmetric padding (no fixed
// height, no nudge), so the letters look centred and the chip scales with the
// message font size. `items-baseline` (icons centre on their own) lets the
// text, not a leading icon, set the baseline; `truncate` keeps a reference on
// one line.
const chip = (fill: string) => [
  "h-[22px] items-center gap-0.5 rounded-sticker px-1.5 has-[>svg]:pl-[3px] align-[1px]",
  // oxlint-disable-next-line better-tailwindcss/enforce-canonical-classes
  "[font-size:0.875em] leading-5 font-semibold",
  "[&_svg]:size-3.5 [&_svg]:text-foreground-icon",
  fill,
];
const linkChip = (fill: string) => [
  ...chip(fill),
  "text-foreground cursor-pointer hover:press-overlay active:press-overlay",
];

export const messageReference = tv({
  slots: {
    root: [
      "inline-flex items-baseline gap-1",
      "py-0 align-baseline",
      // oxlint-disable-next-line better-tailwindcss/enforce-canonical-classes
      "[font-size:inherit] leading-[1.2em]",
      "max-w-full truncate select-text no-underline",
      "outline-none focus-visible:shadow-raft-focus",
      "[&_svg]:size-[0.857em] [&_svg]:shrink-0 [&_svg]:self-center",
      "has-[>[data-slot=message-reference-indicator]]:relative has-[>[data-slot=message-reference-indicator]]:mr-2",
      "has-[>[data-slot=message-reference-indicator]]:inline-block",
      "has-[>[data-slot=message-reference-indicator]]:overflow-visible",
    ],
    chipLabel: "min-w-0 truncate",
    indicator: [
      "pointer-events-none absolute -right-1.5 top-0 inline-flex size-2 shrink-0 items-center justify-center",
      "*:data-[slot=status]:size-full",
    ],
  },
  variants: {
    variant: {
      // You: a small yellow sticker.
      primary: {
        root: [
          "inline-flex cursor-pointer rounded-sticker px-[3px]",
          "font-semibold text-sticker-ink no-underline",
          "bg-primary inset-ring-[1.5px] inset-ring-sticker-ink ring-[1.5px] ring-sticker-edge",
          "hover:press-overlay-sticker",
        ],
      },
      // Someone else: an ink underline.
      secondary: {
        root: [
          "inline cursor-pointer font-bold text-foreground",
          "underline decoration-foreground-hint decoration-[1.5px] underline-offset-[3px]",
          "hover:decoration-foreground",
        ],
      },
      // A place is pink, a thing in it cyan; one that cannot be opened is grey.
      accent: { root: linkChip("bg-accent-soft") },
      muted: { root: linkChip("bg-inactive-soft") },
      info: { root: linkChip("bg-info-soft") },
      link: { root: linkChip("bg-info-soft") },
      pending: { root: chip("cursor-wait bg-inactive-soft text-foreground-muted") },
      unavailable: { root: chip("cursor-default bg-inactive-soft text-foreground-hint") },
    },
  },
  defaultVariants: {
    variant: "muted",
  },
});
