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
// running text). A loading spinner keeps its own box, as wide as its pixels:
// in an icon's 14px slot its ink sat about 2px further in than the text's at the
// other end (alignment.md, Chips).
const chip = (fill: string) => [
  ...inlineChip,
  "[--message-reference-em:1em]",
  "[&_svg]:size-3.5 [&_svg]:text-foreground-muted",
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
    // A 14px box for a leading icon that is not a plain svg, such as an app's
    // image or a 3xs Avatar: a leading mark of the inline chip, which gives it
    // 4.5px at each end and 4px to the text (lib/inline-chip.ts). It centres
    // on the chip as an svg does (an image would sit on the baseline). An
    // app's image is drawn to its edges, so its ink starts 4.5px in, as a
    // status pixel's does, against 4.5px plus the last letter's side bearing
    // at the other end (alignment.md, Chips). An image takes the 2px corner of
    // small images (shape.md).
    icon: [
      "inline-flex size-3.5 shrink-0 items-center justify-center self-center",
      "*:size-full *:shrink-0 [&>img]:rounded-[2px] [&>img]:object-cover",
    ],
    indicator: [
      "pointer-events-none absolute -right-1.5 top-0 inline-flex size-2 shrink-0 items-center justify-center",
      "*:data-[slot=status]:size-full",
    ],
    // The read receipt: a check after the mention's text, the size of an icon
    // in a reference (12px beside 14px text). It is centred on the letters'
    // cap height, the line every icon in a reference centres on
    // (alignment.md#a-mark-that-leads-text): in running text by raising its
    // bottom edge to half the cap height (0.7em / 2) less half its own box,
    // in a flex row by `self-center`. Its 12px box sits inside the line, so
    // the mention's box and the line keep their height. Lucide draws the check
    // 3/24 inside its box where other icons leave 1/24, about a letter's side
    // bearing, so its end takes the extra 2/24 back: the ink at that end sits
    // as far from the mention's edge as the first letter does
    // (alignment.md#chips).
    readMark: [
      "relative inline-block shrink-0 self-center",
      "-mr-[calc(0.857em*2/24)]",
      "align-[calc(0.7em/2-0.857em/2)] leading-none",
      "text-foreground-hint",
      "[&>svg]:block [&>svg]:size-[0.857em]",
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
    // A chip whose words come from outside Raft (an app's title) stops at
    // 24em, about 294px on a desktop and 336px on a phone, or the line.
    capped: {
      true: { root: "max-w-[min(100%,24em)]" },
    },
  },
  defaultVariants: {
    variant: "muted",
  },
});
