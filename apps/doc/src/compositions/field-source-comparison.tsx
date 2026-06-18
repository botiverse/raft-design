import { FieldCompactLabelComposition } from "./field/compact-label-composition.tsx";
import { FieldErrorComposition } from "./field/error-composition.tsx";
import { FieldLabelControlHelperComposition } from "./field/label-control-helper-composition.tsx";

export const FIELD_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  CompactLabel: "apps/doc/src/compositions/field/compact-label-composition.tsx",
  Error: "apps/doc/src/compositions/field/error-composition.tsx",
  LabelControlHelper: "apps/doc/src/compositions/field/label-control-helper-composition.tsx",
} as const;

export const FIELD_SOURCE_COMPARISON_COMPOSITION = {
  CompactLabel: FieldCompactLabelComposition,
  Error: FieldErrorComposition,
  LabelControlHelper: FieldLabelControlHelperComposition,
} as const;
