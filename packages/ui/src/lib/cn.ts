import { clsx, type ClassValue } from "cnfast";
import { extendTailwindMerge } from "tailwind-merge";

// `shadow-raft-*` are custom shadow *geometry* utilities; without this they
// would be classified as shadow colors and stop conflicting with `shadow-[...]`.
// `text-field` / `font-field` are the field metric axis utilities. Without
// registering them tailwind-merge cannot classify them: `text-field` falls into
// text *color* and `font-field` into font *family*, so neither conflicts with a
// theme's `text-sm` / `text-[13px]` / `font-bold`. Both classes then survive the
// merge and the winner is decided by stylesheet emission order — which is why
// the axis appeared to apply to font-weight but not font-size. Same failure
// shape as `shadow-raft-*` above.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      shadow: [{ shadow: [{ raft: ["xs", "sm", "md", "lg", "xl"] }] }],
      "font-size": [{ text: ["field", "card-title"] }],
      "font-weight": [{ font: ["field", "card-title"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type { ClassValue };
