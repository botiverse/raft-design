import { clsx, type ClassValue } from "cnfast";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Custom theme shadows (e.g. `--shadow-field-hover`) generate `shadow-*`
 * utilities that default cnfast/tailwind-merge do not treat as part of the
 * `shadow` conflict group. Standard scale tokens (`shadow-sm`…`shadow-xl`)
 * already merge correctly.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: ["field-hover"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type { ClassValue };
