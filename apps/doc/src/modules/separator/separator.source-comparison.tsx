import { SeparatorHorizontalComposition } from "./compositions/horizontal.composition.tsx";
import { SeparatorVerticalComposition } from "./compositions/vertical.composition.tsx";

export const SEPARATOR_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  Horizontal: "apps/doc/src/modules/separator/compositions/horizontal.composition.tsx",
  Vertical: "apps/doc/src/modules/separator/compositions/vertical.composition.tsx",
} as const;

export const SEPARATOR_SOURCE_COMPARISON_COMPOSITION = {
  Horizontal: SeparatorHorizontalComposition,
  Vertical: SeparatorVerticalComposition,
} as const;
