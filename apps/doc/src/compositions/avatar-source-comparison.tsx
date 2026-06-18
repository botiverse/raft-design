import { AvatarIdentityResolutionComposition } from "./avatar/identity-resolution-composition.tsx";
import { AvatarPanelHeaderComposition } from "./avatar/panel-header-composition.tsx";
import { AvatarScaleComposition } from "./avatar/scale-composition.tsx";

export const AVATAR_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  IdentityResolution: "apps/doc/src/compositions/avatar/identity-resolution-composition.tsx",
  PanelHeader: "apps/doc/src/compositions/avatar/panel-header-composition.tsx",
  Scale: "apps/doc/src/compositions/avatar/scale-composition.tsx",
} as const;

export const AVATAR_SOURCE_COMPARISON_COMPOSITION = {
  IdentityResolution: AvatarIdentityResolutionComposition,
  PanelHeader: AvatarPanelHeaderComposition,
  Scale: AvatarScaleComposition,
} as const;
