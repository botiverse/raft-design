/**
 * The × that removes a chip: a tag in a Combobox field (`ComboboxChipRemove`)
 * and an applied filter (`FilterChipRemove`). A `foreground-hint` glyph on a
 * `rounded-sticker` square that takes the medium fill on hover and press, and
 * an inset ink ring when the keyboard reaches it (the chip around it is too
 * tight for an outer ring). Each chip gives it its own size.
 */
export const chipRemoveBase = [
  "inline-flex shrink-0 items-center justify-center outline-none transition-colors",
  "rounded-sticker text-foreground-hint",
  "hover:bg-fill-medium active:bg-fill-medium",
  "focus-visible:keyboard:inset-ring-2 focus-visible:keyboard:inset-ring-foreground",
  "[&>svg]:size-3.5",
];
