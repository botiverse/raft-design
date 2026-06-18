import { BadgeAccentComposition } from "./badge/accent-composition.tsx";
import { BadgeButtonRenderComposition } from "./badge/button-render-composition.tsx";
import { BadgeDangerComposition } from "./badge/danger-composition.tsx";
import { BadgeDefaultComposition } from "./badge/default-composition.tsx";
import { BadgeDefaultPreservedCasingComposition } from "./badge/default-preserved-casing-composition.tsx";
import { BadgeExperimentalPresetComposition } from "./badge/experimental-preset-composition.tsx";
import { BadgeInformationComposition } from "./badge/information-composition.tsx";
import { BadgeMutedComposition } from "./badge/muted-composition.tsx";
import { BadgeOutlineAppearanceComposition } from "./badge/outline-appearance-composition.tsx";
import { BadgePrimaryComposition } from "./badge/primary-composition.tsx";
import { BadgeSoftAppearanceComposition } from "./badge/soft-appearance-composition.tsx";
import { BadgeSuccessComposition } from "./badge/success-composition.tsx";

export const BADGE_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  Accent: "apps/doc/src/compositions/badge/accent-composition.tsx",
  ButtonRender: "apps/doc/src/compositions/badge/button-render-composition.tsx",
  Danger: "apps/doc/src/compositions/badge/danger-composition.tsx",
  Default: "apps/doc/src/compositions/badge/default-composition.tsx",
  DefaultPreservedCasing:
    "apps/doc/src/compositions/badge/default-preserved-casing-composition.tsx",
  ExperimentalPreset: "apps/doc/src/compositions/badge/experimental-preset-composition.tsx",
  Information: "apps/doc/src/compositions/badge/information-composition.tsx",
  Muted: "apps/doc/src/compositions/badge/muted-composition.tsx",
  OutlineAppearance: "apps/doc/src/compositions/badge/outline-appearance-composition.tsx",
  Primary: "apps/doc/src/compositions/badge/primary-composition.tsx",
  SoftAppearance: "apps/doc/src/compositions/badge/soft-appearance-composition.tsx",
  Success: "apps/doc/src/compositions/badge/success-composition.tsx",
} as const;

export const BADGE_SOURCE_COMPARISON_COMPOSITION = {
  Accent: BadgeAccentComposition,
  ButtonRender: BadgeButtonRenderComposition,
  Danger: BadgeDangerComposition,
  Default: BadgeDefaultComposition,
  DefaultPreservedCasing: BadgeDefaultPreservedCasingComposition,
  ExperimentalPreset: BadgeExperimentalPresetComposition,
  Information: BadgeInformationComposition,
  Muted: BadgeMutedComposition,
  OutlineAppearance: BadgeOutlineAppearanceComposition,
  Primary: BadgePrimaryComposition,
  SoftAppearance: BadgeSoftAppearanceComposition,
  Success: BadgeSuccessComposition,
} as const;
