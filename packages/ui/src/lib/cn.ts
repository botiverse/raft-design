import { clsx, type ClassValue } from "cnfast";
import { extendTailwindMerge } from "tailwind-merge";

// `shadow-raft-*` are custom shadow *geometry* utilities; without this they
// would be classified as shadow colors and stop conflicting with `shadow-[...]`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      shadow: [{ shadow: [{ raft: ["xs", "sm", "md", "lg", "xl"] }] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type { ClassValue };
