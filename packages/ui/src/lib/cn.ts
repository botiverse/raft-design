import { clsx } from "cnfast";
import type { ClassValue } from "cnfast";
import { extendTailwindMerge } from "tailwind-merge";

// `shadow-float` / `shadow-sticker` / `shadow-focus` (and the deprecated
// `shadow-raft-*`) are custom shadow *geometry* utilities; without this they
// would be classified as shadow colors and stop conflicting with `shadow-[...]`.
// `text-field` / `font-field` are the field metric axis utilities. Without
// registering them tailwind-merge cannot classify them: `text-field` falls into
// text *color* and `font-field` into font *family*, so neither conflicts with a
// recipe's `text-sm` / `text-[13px]` / `font-bold`. Both classes then survive the
// merge and the winner is decided by stylesheet emission order — which is why
// the axis appeared to apply to font-weight but not font-size. Same failure
// shape as `shadow-raft-*` above.
// `h-control`, `size-control-icon` and the other control metric utilities
// read the control axis from the theme's spacing; without registering them
// tailwind-merge does not see `h-control` and `h-8` as the same property.
// `min-h-option` and `py-option-inset` are the option metric axis, likewise.
// The hover overlays (`overlay-subtle`, `overlay-medium`, ... and their
// deprecated names) paint background-image: registered there, a later
// `hover:bg-none` or another tier's overlay replaces them instead of both
// surviving.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      spacing: [
        "control",
        "control-cta",
        "control-icon",
        "control-hit",
        "control-embedded",
        "embedded-inset",
        "option",
        "option-inset",
        "icon-inset",
      ],
    },
    classGroups: {
      shadow: [
        { shadow: ["float", "sticker", "focus"] },
        { shadow: [{ raft: ["xs", "sm", "md", "lg", "xl", "float", "sticker", "focus"] }] },
      ],
      rounded: [{ rounded: ["sticker", "chip", "control", "container", "dialog"] }],
      "font-size": [
        {
          text: [
            "field",
            "card-title",
            "hero",
            "display",
            "title",
            "headline",
            "body",
            "subhead",
            "callout",
            "footnote",
            "caption",
            "label",
            "mono-meta",
            "mono-code",
            "control",
          ],
        },
      ],
      "font-weight": [{ font: ["field", "card-title"] }],
      "bg-image": [
        { overlay: ["subtle", "medium", "sticker-medium", "frame-medium"] },
        "press-overlay",
        "press-overlay-sticker",
        "row-hover-overlay",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type { ClassValue };
