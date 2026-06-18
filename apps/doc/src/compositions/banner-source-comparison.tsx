import { BannerIconTitleComposition } from "./banner/icon-title-composition.tsx";
import { BannerIconlessWarningComposition } from "./banner/iconless-warning-composition.tsx";
import { BannerLargeActionsComposition } from "./banner/large-actions-composition.tsx";

export const BANNER_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  IconTitle: "apps/doc/src/compositions/banner/icon-title-composition.tsx",
  IconlessWarning: "apps/doc/src/compositions/banner/iconless-warning-composition.tsx",
  LargeActions: "apps/doc/src/compositions/banner/large-actions-composition.tsx",
} as const;

export const BANNER_SOURCE_COMPARISON_COMPOSITION = {
  IconTitle: BannerIconTitleComposition,
  IconlessWarning: BannerIconlessWarningComposition,
  LargeActions: BannerLargeActionsComposition,
} as const;
