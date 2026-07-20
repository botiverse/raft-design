import { BannerDefaultComposition } from "./compositions/default.composition.tsx";
import { BannerDestructiveComposition } from "./compositions/destructive.composition.tsx";
import { BannerInfoComposition } from "./compositions/info.composition.tsx";
import { BannerSuccessComposition } from "./compositions/success.composition.tsx";
import { BannerWarningComposition } from "./compositions/warning.composition.tsx";

export const BANNER_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  Default: "apps/doc/src/modules/banner/compositions/default.composition.tsx",
  Destructive: "apps/doc/src/modules/banner/compositions/destructive.composition.tsx",
  Warning: "apps/doc/src/modules/banner/compositions/warning.composition.tsx",
  Info: "apps/doc/src/modules/banner/compositions/info.composition.tsx",
  Success: "apps/doc/src/modules/banner/compositions/success.composition.tsx",
  Preview: "apps/doc/src/modules/banner/compositions/preview.composition.tsx",
} as const;

export const BANNER_SOURCE_COMPARISON_COMPOSITION = {
  Default: BannerDefaultComposition,
  Destructive: BannerDestructiveComposition,
  Warning: BannerWarningComposition,
  Info: BannerInfoComposition,
  Success: BannerSuccessComposition,
} as const;
