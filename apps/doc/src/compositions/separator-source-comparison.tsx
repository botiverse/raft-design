import { SeparatorHorizontalComposition } from "./separator/horizontal-composition.tsx";
import { SeparatorVerticalComposition } from "./separator/vertical-composition.tsx";

export const SEPARATOR_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  Horizontal: "apps/doc/src/compositions/separator/horizontal-composition.tsx",
  Vertical: "apps/doc/src/compositions/separator/vertical-composition.tsx",
} as const;

export const SEPARATOR_SOURCE_COMPARISON_COMPOSITION = {
  Horizontal: SeparatorHorizontalComposition,
  Vertical: SeparatorVerticalComposition,
} as const;
