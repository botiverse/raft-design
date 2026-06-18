import { InputDefaultComposition } from "./input/default-composition.tsx";
import { InputDisabledStylingComposition } from "./input/disabled-styling-composition.tsx";
import { InputInvalidDisabledPriorityComposition } from "./input/invalid-disabled-priority-composition.tsx";
import { InputInvalidStateComposition } from "./input/invalid-state-composition.tsx";
import { InputPasswordManagerSuppressionComposition } from "./input/password-manager-suppression-composition.tsx";

export const INPUT_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  Default: "apps/doc/src/compositions/input/default-composition.tsx",
  DisabledStyling: "apps/doc/src/compositions/input/disabled-styling-composition.tsx",
  InvalidDisabledPriority:
    "apps/doc/src/compositions/input/invalid-disabled-priority-composition.tsx",
  InvalidState: "apps/doc/src/compositions/input/invalid-state-composition.tsx",
  PasswordManagerSuppression:
    "apps/doc/src/compositions/input/password-manager-suppression-composition.tsx",
} as const;

export const INPUT_SOURCE_COMPARISON_COMPOSITION = {
  Default: InputDefaultComposition,
  DisabledStyling: InputDisabledStylingComposition,
  InvalidDisabledPriority: InputInvalidDisabledPriorityComposition,
  InvalidState: InputInvalidStateComposition,
  PasswordManagerSuppression: InputPasswordManagerSuppressionComposition,
} as const;
