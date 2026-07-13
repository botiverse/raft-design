import { FieldCompactLabelComposition } from "./compositions/compact-label.composition.tsx";
import { FieldErrorComposition } from "./compositions/error.composition.tsx";
import { FieldLabelControlHelperComposition } from "./compositions/label-control-helper.composition.tsx";

export const FIELD_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  CompactLabel: "apps/doc/src/modules/field/compositions/compact-label.composition.tsx",
  Error: "apps/doc/src/modules/field/compositions/error.composition.tsx",
  LabelControlHelper:
    "apps/doc/src/modules/field/compositions/label-control-helper.composition.tsx",
} as const;

export const FIELD_SOURCE_COMPARISON_COMPOSITION = {
  CompactLabel: FieldCompactLabelComposition,
  Error: FieldErrorComposition,
  LabelControlHelper: FieldLabelControlHelperComposition,
} as const;
