import {
  ButtonAccentSourcePreview,
  ButtonDangerSourcePreview,
  ButtonDefaultSourcePreview,
  ButtonIconOnlySourcePreview,
  ButtonInformationSourcePreview,
  ButtonInlineIconSourcePreview,
  ButtonMissingSourcePreview,
  ButtonMutedSourcePreview,
  ButtonOutlineSourcePreview,
  ButtonPrimarySourcePreview,
  ButtonSizesSourcePreview,
  ButtonWarningSourcePreview,
} from "./button.source-comparison.source.tsx";
import { ButtonAccentComposition } from "./compositions/accent.composition.tsx";
import { ButtonDangerComposition } from "./compositions/danger.composition.tsx";
import { ButtonDangerOutlineComposition } from "./compositions/danger-outline.composition.tsx";
import { ButtonDangerSecondaryComposition } from "./compositions/danger-secondary.composition.tsx";
import { ButtonDefaultComposition } from "./compositions/default.composition.tsx";
import { ButtonGhostComposition } from "./compositions/ghost.composition.tsx";
import { ButtonIconOnlyComposition } from "./compositions/icon-only.composition.tsx";
import { ButtonInformationComposition } from "./compositions/information.composition.tsx";
import { ButtonInlineIconComposition } from "./compositions/inline-icon.composition.tsx";
import { ButtonLinkComposition } from "./compositions/link.composition.tsx";
import { ButtonMutedComposition } from "./compositions/muted.composition.tsx";
import { ButtonOutlineComposition } from "./compositions/outline.composition.tsx";
import { ButtonPrimaryComposition } from "./compositions/primary.composition.tsx";
import { ButtonSizesComposition } from "./compositions/sizes.composition.tsx";
import { ButtonWarningComposition } from "./compositions/warning.composition.tsx";

export const BUTTON_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  Accent: "apps/doc/src/modules/button/compositions/accent.composition.tsx",
  Danger: "apps/doc/src/modules/button/compositions/danger.composition.tsx",
  DangerOutline: "apps/doc/src/modules/button/compositions/danger-outline.composition.tsx",
  DangerSecondary: "apps/doc/src/modules/button/compositions/danger-secondary.composition.tsx",
  Default: "apps/doc/src/modules/button/compositions/default.composition.tsx",
  Ghost: "apps/doc/src/modules/button/compositions/ghost.composition.tsx",
  IconOnly: "apps/doc/src/modules/button/compositions/icon-only.composition.tsx",
  Information: "apps/doc/src/modules/button/compositions/information.composition.tsx",
  InlineIcon: "apps/doc/src/modules/button/compositions/inline-icon.composition.tsx",
  Link: "apps/doc/src/modules/button/compositions/link.composition.tsx",
  Muted: "apps/doc/src/modules/button/compositions/muted.composition.tsx",
  Outline: "apps/doc/src/modules/button/compositions/outline.composition.tsx",
  Primary: "apps/doc/src/modules/button/compositions/primary.composition.tsx",
  Sizes: "apps/doc/src/modules/button/compositions/sizes.composition.tsx",
  Warning: "apps/doc/src/modules/button/compositions/warning.composition.tsx",
} as const;

export const BUTTON_SOURCE_COMPARISON_COMPOSITION = {
  Accent: ButtonAccentComposition,
  Danger: ButtonDangerComposition,
  DangerOutline: ButtonDangerOutlineComposition,
  DangerSecondary: ButtonDangerSecondaryComposition,
  Default: ButtonDefaultComposition,
  Ghost: ButtonGhostComposition,
  IconOnly: ButtonIconOnlyComposition,
  Information: ButtonInformationComposition,
  InlineIcon: ButtonInlineIconComposition,
  Link: ButtonLinkComposition,
  Muted: ButtonMutedComposition,
  Outline: ButtonOutlineComposition,
  Primary: ButtonPrimaryComposition,
  Sizes: ButtonSizesComposition,
  Warning: ButtonWarningComposition,
} as const;

export const BUTTON_SOURCE_COMPARISON_SOURCE = {
  Accent: ButtonAccentSourcePreview,
  Danger: ButtonDangerSourcePreview,
  Default: ButtonDefaultSourcePreview,
  IconOnly: ButtonIconOnlySourcePreview,
  Information: ButtonInformationSourcePreview,
  InlineIcon: ButtonInlineIconSourcePreview,
  Missing: ButtonMissingSourcePreview,
  Muted: ButtonMutedSourcePreview,
  Outline: ButtonOutlineSourcePreview,
  Primary: ButtonPrimarySourcePreview,
  Sizes: ButtonSizesSourcePreview,
  Warning: ButtonWarningSourcePreview,
} as const;
