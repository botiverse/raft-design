import { CheckboxCheckedComposition } from "./compositions/checked.composition.tsx";
import { CheckboxDefaultCheckedComposition } from "./compositions/default-checked.composition.tsx";
import { CheckboxDisabledComposition } from "./compositions/disabled.composition.tsx";
import { CheckboxIndeterminateComposition } from "./compositions/indeterminate.composition.tsx";
import { CheckboxPreviewOnHoverMarkerComposition } from "./compositions/preview-on-hover-marker.composition.tsx";
import { CheckboxPrimaryCheckedComposition } from "./compositions/primary-checked.composition.tsx";
import { CheckboxSettingsGroupComposition } from "./compositions/settings-group.composition.tsx";
import { CheckboxSizesComposition } from "./compositions/sizes.composition.tsx";
import { CheckboxUncheckedComposition } from "./compositions/unchecked.composition.tsx";

export const CHECKBOX_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  Checked: "apps/doc/src/modules/checkbox/compositions/checked.composition.tsx",
  DefaultChecked: "apps/doc/src/modules/checkbox/compositions/default-checked.composition.tsx",
  Disabled: "apps/doc/src/modules/checkbox/compositions/disabled.composition.tsx",
  Indeterminate: "apps/doc/src/modules/checkbox/compositions/indeterminate.composition.tsx",
  PreviewOnHoverMarker:
    "apps/doc/src/modules/checkbox/compositions/preview-on-hover-marker.composition.tsx",
  PrimaryChecked: "apps/doc/src/modules/checkbox/compositions/primary-checked.composition.tsx",
  SettingsGroup: "apps/doc/src/modules/checkbox/compositions/settings-group.composition.tsx",
  Sizes: "apps/doc/src/modules/checkbox/compositions/sizes.composition.tsx",
  Unchecked: "apps/doc/src/modules/checkbox/compositions/unchecked.composition.tsx",
} as const;

export const CHECKBOX_SOURCE_COMPARISON_COMPOSITION = {
  Checked: CheckboxCheckedComposition,
  DefaultChecked: CheckboxDefaultCheckedComposition,
  Disabled: CheckboxDisabledComposition,
  Indeterminate: CheckboxIndeterminateComposition,
  PreviewOnHoverMarker: CheckboxPreviewOnHoverMarkerComposition,
  PrimaryChecked: CheckboxPrimaryCheckedComposition,
  SettingsGroup: CheckboxSettingsGroupComposition,
  Sizes: CheckboxSizesComposition,
  Unchecked: CheckboxUncheckedComposition,
} as const;
