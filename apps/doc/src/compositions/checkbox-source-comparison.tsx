import { CheckboxCheckedComposition } from "./checkbox/checked-composition.tsx";
import { CheckboxDefaultCheckedComposition } from "./checkbox/default-checked-composition.tsx";
import { CheckboxDisabledComposition } from "./checkbox/disabled-composition.tsx";
import { CheckboxIndeterminateComposition } from "./checkbox/indeterminate-composition.tsx";
import { CheckboxPreviewOnHoverMarkerComposition } from "./checkbox/preview-on-hover-marker-composition.tsx";
import { CheckboxPrimaryCheckedComposition } from "./checkbox/primary-checked-composition.tsx";
import { CheckboxSizesComposition } from "./checkbox/sizes-composition.tsx";
import { CheckboxUncheckedComposition } from "./checkbox/unchecked-composition.tsx";

export const CHECKBOX_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  Checked: "apps/doc/src/compositions/checkbox/checked-composition.tsx",
  DefaultChecked: "apps/doc/src/compositions/checkbox/default-checked-composition.tsx",
  Disabled: "apps/doc/src/compositions/checkbox/disabled-composition.tsx",
  Indeterminate: "apps/doc/src/compositions/checkbox/indeterminate-composition.tsx",
  PreviewOnHoverMarker:
    "apps/doc/src/compositions/checkbox/preview-on-hover-marker-composition.tsx",
  PrimaryChecked: "apps/doc/src/compositions/checkbox/primary-checked-composition.tsx",
  Sizes: "apps/doc/src/compositions/checkbox/sizes-composition.tsx",
  Unchecked: "apps/doc/src/compositions/checkbox/unchecked-composition.tsx",
} as const;

export const CHECKBOX_SOURCE_COMPARISON_COMPOSITION = {
  Checked: CheckboxCheckedComposition,
  DefaultChecked: CheckboxDefaultCheckedComposition,
  Disabled: CheckboxDisabledComposition,
  Indeterminate: CheckboxIndeterminateComposition,
  PreviewOnHoverMarker: CheckboxPreviewOnHoverMarkerComposition,
  PrimaryChecked: CheckboxPrimaryCheckedComposition,
  Sizes: CheckboxSizesComposition,
  Unchecked: CheckboxUncheckedComposition,
} as const;
