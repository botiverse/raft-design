import { InputDefaultComposition } from "./compositions/default.composition.tsx";
import { InputDisabledStylingComposition } from "./compositions/disabled-styling.composition.tsx";
import { InputInvalidDisabledPriorityComposition } from "./compositions/invalid-disabled-priority.composition.tsx";
import { InputInvalidStateComposition } from "./compositions/invalid-state.composition.tsx";
import { InputPasswordManagerSuppressionComposition } from "./compositions/password-manager-suppression.composition.tsx";

export const INPUT_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  Default: "apps/doc/src/modules/input/compositions/default.composition.tsx",
  DisabledStyling: "apps/doc/src/modules/input/compositions/disabled-styling.composition.tsx",
  InvalidDisabledPriority:
    "apps/doc/src/modules/input/compositions/invalid-disabled-priority.composition.tsx",
  InvalidState: "apps/doc/src/modules/input/compositions/invalid-state.composition.tsx",
  PasswordManagerSuppression:
    "apps/doc/src/modules/input/compositions/password-manager-suppression.composition.tsx",
  Preview: "apps/doc/src/modules/input/compositions/preview.composition.tsx",
} as const;

export const INPUT_SOURCE_COMPARISON_COMPOSITION = {
  Default: InputDefaultComposition,
  DisabledStyling: InputDisabledStylingComposition,
  InvalidDisabledPriority: InputInvalidDisabledPriorityComposition,
  InvalidState: InputInvalidStateComposition,
  PasswordManagerSuppression: InputPasswordManagerSuppressionComposition,
} as const;
