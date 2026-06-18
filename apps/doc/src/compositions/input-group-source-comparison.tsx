import { InputGroupInvalidStateComposition } from "./input-group/invalid-state-composition.tsx";
import { InputGroupSearchInputComposition } from "./input-group/search-input-composition.tsx";
import { InputGroupSlugInputComposition } from "./input-group/slug-input-composition.tsx";

export const INPUT_GROUP_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  InvalidState: "apps/doc/src/compositions/input-group/invalid-state-composition.tsx",
  SearchInput: "apps/doc/src/compositions/input-group/search-input-composition.tsx",
  SlugInput: "apps/doc/src/compositions/input-group/slug-input-composition.tsx",
} as const;

export const INPUT_GROUP_SOURCE_COMPARISON_COMPOSITION = {
  InvalidState: InputGroupInvalidStateComposition,
  SearchInput: InputGroupSearchInputComposition,
  SlugInput: InputGroupSlugInputComposition,
} as const;
