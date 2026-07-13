import { BannerIconTitleComposition } from "./compositions/icon-title.composition.tsx";
import { BannerIconlessWarningComposition } from "./compositions/iconless-warning.composition.tsx";
import { BannerLargeActionsComposition } from "./compositions/large-actions.composition.tsx";

export const BANNER_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  IconTitle: "apps/doc/src/modules/banner/compositions/icon-title.composition.tsx",
  IconlessWarning: "apps/doc/src/modules/banner/compositions/iconless-warning.composition.tsx",
  LargeActions: "apps/doc/src/modules/banner/compositions/large-actions.composition.tsx",
} as const;

export const BANNER_SOURCE_COMPARISON_COMPOSITION = {
  IconTitle: BannerIconTitleComposition,
  IconlessWarning: BannerIconlessWarningComposition,
  LargeActions: BannerLargeActionsComposition,
} as const;
