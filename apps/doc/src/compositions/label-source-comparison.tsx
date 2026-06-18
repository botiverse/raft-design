import { LabelInlineFormLabelComposition } from "./label/inline-form-label-composition.tsx";
import { LabelOptionalMarkerComposition } from "./label/optional-marker-composition.tsx";
import { LabelRequiredMarkerComposition } from "./label/required-marker-composition.tsx";
import { LabelSecondaryTextComposition } from "./label/secondary-text-composition.tsx";

export const LABEL_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  InlineFormLabel: "apps/doc/src/compositions/label/inline-form-label-composition.tsx",
  OptionalMarker: "apps/doc/src/compositions/label/optional-marker-composition.tsx",
  RequiredMarker: "apps/doc/src/compositions/label/required-marker-composition.tsx",
  SecondaryText: "apps/doc/src/compositions/label/secondary-text-composition.tsx",
} as const;

export const LABEL_SOURCE_COMPARISON_COMPOSITION = {
  InlineFormLabel: LabelInlineFormLabelComposition,
  OptionalMarker: LabelOptionalMarkerComposition,
  RequiredMarker: LabelRequiredMarkerComposition,
  SecondaryText: LabelSecondaryTextComposition,
} as const;
