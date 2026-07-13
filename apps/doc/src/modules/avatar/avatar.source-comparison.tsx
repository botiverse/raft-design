import { AvatarIdentityResolutionComposition } from "./compositions/identity-resolution.composition.tsx";
import { AvatarPanelHeaderComposition } from "./compositions/panel-header.composition.tsx";
import { AvatarScaleComposition } from "./compositions/scale.composition.tsx";

export const AVATAR_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  IdentityResolution:
    "apps/doc/src/modules/avatar/compositions/identity-resolution.composition.tsx",
  PanelHeader: "apps/doc/src/modules/avatar/compositions/panel-header.composition.tsx",
  Scale: "apps/doc/src/modules/avatar/compositions/scale.composition.tsx",
} as const;

export const AVATAR_SOURCE_COMPARISON_COMPOSITION = {
  IdentityResolution: AvatarIdentityResolutionComposition,
  PanelHeader: AvatarPanelHeaderComposition,
  Scale: AvatarScaleComposition,
} as const;
