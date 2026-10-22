import { inlineChip } from "../../lib/inline-chip";
import { tv } from "../../lib/tv";

/** Chip variants the public `MessageReferenceChip` prop accepts. */
export type MessageReferenceChipVariant = "accent" | "muted" | "info" | "link";

/** Visual variants the public `MessageReferenceText` prop accepts. */
export type MessageReferenceTextVariant = "primary" | "secondary";

// A reference chip is an inline chip (lib/inline-chip.ts, message-item.md,
// Chips in running text): 0.875em text on the body line less 2px, its letters
// on the sentence's baseline. `items-baseline` lets the text, not a leading
// icon, set the chip's baseline; the root's `self-center` centres the icon on
// the chip. With `items-center` the icon would supply the baseline, and the
// chip's words would float 2px above the sentence (alignment.md, Marks in
// running text). A loading spinner takes the icon's 14px slot.
const chip = (fill: string) => [
  ...inlineChip,
  "[--message-reference-em:1em]",
  "[&_svg]:size-3.5 [&_svg]:text-foreground-muted",
  "*:data-[slot=spinner]:w-3.5",
  fill,
];
const linkChip = (fill: string) => [
  ...chip(fill),
  "text-foreground cursor-pointer hover:overlay-medium active:overlay-medium",
];

// Where a note after the label (`msg`) is drawn. "x-height" puts the middle of
// its x-height on the label's; "icon" puts it on the middle of the label's cap
// height, the line the icon centres on. Both keep the label's baseline in the
// layout. The choice is still open: change this one line to switch.
const SUFFIX_CENTRE: "x-height" | "icon" = "x-height";
const SUFFIX_LIFT = {
  "x-height": "top-[calc((1em-var(--message-reference-em))/4)]",
  icon: "top-[calc(0.25em-var(--message-reference-em)*0.35)]",
}[SUFFIX_CENTRE];

export const messageReference = tv({
  slots: {
    root: [
      "inline-flex items-baseline gap-1",
      "py-0 align-baseline",
      // oxlint-disable-next-line better-tailwindcss/enforce-canonical-classes
      "[font-size:inherit] leading-[1.2em]",
      "max-w-full truncate select-text no-underline",
      "outline-none focus-visible:shadow-focus",
      "[&_svg]:size-[0.857em] [&_svg]:shrink-0 [&_svg]:self-center",
      "*:data-[slot=spinner]:self-center",
      "has-[>[data-slot=message-reference-indicator]]:relative has-[>[data-slot=message-reference-indicator]]:mr-2",
      "has-[>[data-slot=message-reference-indicator]]:inline-block",
      "has-[>[data-slot=message-reference-indicator]]:overflow-visible",
    ],
    chipLabel: "min-w-0 truncate",
    // A note after the label, in smaller machine type. It keeps the label's
    // baseline in the layout, and is drawn higher (SUFFIX_CENTRE). For the
    // x-height: a quarter of the size difference, since Space Grotesk and Space
    // Mono both have a 0.5em x-height (alignment.md#chips). On the baseline, an
    // 11px note sat 0.3px low beside a 12.25px label and 0.75px low beside a
    // 14px one, and its descenders made it look lower still.
    suffix: [
      "relative shrink-0",
      SUFFIX_LIFT,
      "font-mono text-label leading-none font-normal text-foreground-hint",
    ],
    indicator: [
      "pointer-events-none absolute -right-1.5 top-0 inline-flex size-2 shrink-0 items-center justify-center",
      "*:data-[slot=status]:size-full",
    ],
  },
  variants: {
    variant: {
      // You: a small yellow sticker, in the inline chip's box. Its ink edge
      // is drawn inside, so it is no bigger than the chips beside it.
      primary: {
        root: [
          "inline-flex cursor-pointer",
          ...inlineChip,
          "[--message-reference-em:1em]",
          "text-sticker-ink no-underline",
          "bg-brand inset-ring-[1.5px] inset-ring-sticker-ink",
          "hover:overlay-sticker-medium active:overlay-sticker-medium",
        ],
      },
      // Someone else: bold ink, underlined in ink on hover.
      secondary: {
        root: [
          "inline cursor-pointer font-bold text-foreground",
          "decoration-foreground decoration-[1.5px] underline-offset-[3px] hover:underline",
        ],
      },
      // A place is pink, a thing in it cyan; one that cannot be opened is grey.
      accent: { root: linkChip("bg-attention-soft") },
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
