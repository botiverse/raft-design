import { RadioGroupReferralSourceComposition } from "./compositions/referral-source.composition.tsx";
import { RadioGroupReferralSourceRestoredComposition } from "./compositions/referral-source-restored.composition.tsx";
import { RadioGroupResetModeComposition } from "./compositions/reset-mode.composition.tsx";
import { RadioGroupResetModeRestoredComposition } from "./compositions/reset-mode-restored.composition.tsx";

export const RADIO_GROUP_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  ReferralSource:
    "apps/doc/src/modules/radio-group/compositions/referral-source-restored.composition.tsx",
  ResetMode: "apps/doc/src/modules/radio-group/compositions/reset-mode-restored.composition.tsx",
} as const;

export const RADIO_GROUP_SOURCE_COMPARISON_COMPOSITION = {
  ReferralSource: RadioGroupReferralSourceComposition,
  ReferralSourceRestored: RadioGroupReferralSourceRestoredComposition,
  ResetMode: RadioGroupResetModeComposition,
  ResetModeRestored: RadioGroupResetModeRestoredComposition,
} as const;
