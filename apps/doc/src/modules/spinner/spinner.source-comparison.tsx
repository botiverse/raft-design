import { SpinnerDefaultComposition } from "./compositions/default.composition.tsx";
import { SpinnerInverseComposition } from "./compositions/inverse.composition.tsx";
import { SpinnerLargeComposition } from "./compositions/large.composition.tsx";
import { SpinnerDefaultSourcePreview } from "./source-comparison/default.source.tsx";
import { SpinnerInverseSourcePreview } from "./source-comparison/inverse.source.tsx";
import { SpinnerLargeSourcePreview } from "./source-comparison/large.source.tsx";

export const SPINNER_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  Default: "apps/doc/src/modules/spinner/compositions/default.composition.tsx",
  Inverse: "apps/doc/src/modules/spinner/compositions/inverse.composition.tsx",
  Large: "apps/doc/src/modules/spinner/compositions/large.composition.tsx",
} as const;

export const SPINNER_SOURCE_COMPARISON_COMPOSITION = {
  Default: SpinnerDefaultComposition,
  Inverse: SpinnerInverseComposition,
  Large: SpinnerLargeComposition,
} as const;

export const SPINNER_SOURCE_COMPARISON_SOURCE = {
  Default: SpinnerDefaultSourcePreview,
  Inverse: SpinnerInverseSourcePreview,
  Large: SpinnerLargeSourcePreview,
} as const;
