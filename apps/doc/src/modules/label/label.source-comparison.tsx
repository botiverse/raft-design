import { LabelInlineFormLabelComposition } from "./compositions/inline-form-label.composition.tsx";
import { LabelOptionalMarkerComposition } from "./compositions/optional-marker.composition.tsx";
import { LabelRequiredMarkerComposition } from "./compositions/required-marker.composition.tsx";
import { LabelSecondaryTextComposition } from "./compositions/secondary-text.composition.tsx";

export const LABEL_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  InlineFormLabel: "apps/doc/src/modules/label/compositions/inline-form-label.composition.tsx",
  OptionalMarker: "apps/doc/src/modules/label/compositions/optional-marker.composition.tsx",
  RequiredMarker: "apps/doc/src/modules/label/compositions/required-marker.composition.tsx",
  SecondaryText: "apps/doc/src/modules/label/compositions/secondary-text.composition.tsx",
} as const;

export const LABEL_SOURCE_COMPARISON_COMPOSITION = {
  InlineFormLabel: LabelInlineFormLabelComposition,
  OptionalMarker: LabelOptionalMarkerComposition,
  RequiredMarker: LabelRequiredMarkerComposition,
  SecondaryText: LabelSecondaryTextComposition,
} as const;
