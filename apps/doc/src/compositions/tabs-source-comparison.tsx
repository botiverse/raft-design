import { TabsReorderableDefaultComposition } from "./tabs/reorderable-default-composition.tsx";
import { TabsReorderableDefaultBackgroundComposition } from "./tabs/reorderable-default-background-composition.tsx";
import { TabsReorderableUnderlineComposition } from "./tabs/reorderable-underline-composition.tsx";
import { TabsReorderableUnderlineBackgroundComposition } from "./tabs/reorderable-underline-background-composition.tsx";

export const TABS_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  ReorderableDefault: "apps/doc/src/compositions/tabs/reorderable-default-composition.tsx",
  ReorderableDefaultBackground:
    "apps/doc/src/compositions/tabs/reorderable-default-background-composition.tsx",
  ReorderableUnderline: "apps/doc/src/compositions/tabs/reorderable-underline-composition.tsx",
  ReorderableUnderlineBackground:
    "apps/doc/src/compositions/tabs/reorderable-underline-background-composition.tsx",
} as const;

export const TABS_SOURCE_COMPARISON_COMPOSITION = {
  ReorderableDefault: TabsReorderableDefaultComposition,
  ReorderableDefaultBackground: TabsReorderableDefaultBackgroundComposition,
  ReorderableUnderline: TabsReorderableUnderlineComposition,
  ReorderableUnderlineBackground: TabsReorderableUnderlineBackgroundComposition,
} as const;
