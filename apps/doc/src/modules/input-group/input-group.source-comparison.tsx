import { InputGroupInvalidStateComposition } from "./compositions/invalid-state.composition.tsx";
import { InputGroupSearchInputComposition } from "./compositions/search-input.composition.tsx";
import { InputGroupSlugInputComposition } from "./compositions/slug-input.composition.tsx";

export const INPUT_GROUP_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  InvalidState: "apps/doc/src/modules/input-group/compositions/invalid-state.composition.tsx",
  SearchInput: "apps/doc/src/modules/input-group/compositions/search-input.composition.tsx",
  SlugInput: "apps/doc/src/modules/input-group/compositions/slug-input.composition.tsx",
} as const;

export const INPUT_GROUP_SOURCE_COMPARISON_COMPOSITION = {
  InvalidState: InputGroupInvalidStateComposition,
  SearchInput: InputGroupSearchInputComposition,
  SlugInput: InputGroupSlugInputComposition,
} as const;
