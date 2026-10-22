import { tv } from "../../lib/tv";

/** Chip variants the public `MessageReferenceChip` prop accepts. */
export type MessageReferenceChipVariant = "accent" | "muted" | "info" | "link";

/** Visual variants the public `MessageReferenceText` prop accepts. */
export type MessageReferenceTextVariant = "primary" | "secondary";

// A reference chip in a message sits on the body text's baseline, and its
// letters look centred in the fill (design/foundations/alignment.md, Marks in
// running text). The fill is the label's 20px line box plus 1px above and below,
// 22px in all, with no fixed height and no vertical nudge. `items-baseline`
// (the root's `[&_svg]:self-center` centres icons on their own) lets the text,
// not a leading icon, set the chip's baseline. With `items-center` the icon
// would supply it, and the chip's words would float 2px above the sentence.
// The ink at both ends sits 6px from the edge (alignment.md, Chips): a Lucide
// icon keeps 1/24 of its box empty at each side, about what a letter keeps, so
// an icon end takes the same padding as a text end. A 3px icon end left the icon
// 3.6px from the edge against 7px after the last letter.
const chip = (fill: string) => [
  "items-baseline gap-0.5 rounded-sticker px-1.5 py-px",
  // oxlint-disable-next-line better-tailwindcss/enforce-canonical-classes
  "[font-size:0.875em] leading-5 font-semibold",
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
          "bg-brand inset-ring-[1.5px] inset-ring-sticker-ink ring-[1.5px] ring-sticker-edge",
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
