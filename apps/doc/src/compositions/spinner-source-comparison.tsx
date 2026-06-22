import LegacySpinner from "../../../../packages/ui/src/legacy/Spinner.tsx";
import { SourceComparisonPreview } from "./source-comparison-preview.tsx";
import { SpinnerDefaultComposition } from "./spinner/default-composition.tsx";
import { SpinnerInverseComposition } from "./spinner/inverse-composition.tsx";
import { SpinnerLargeComposition } from "./spinner/large-composition.tsx";

export const SPINNER_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  Default: "apps/doc/src/compositions/spinner/default-composition.tsx",
  Inverse: "apps/doc/src/compositions/spinner/inverse-composition.tsx",
  Large: "apps/doc/src/compositions/spinner/large-composition.tsx",
} as const;

export const SPINNER_SOURCE_COMPARISON_COMPOSITION = {
  Default: SpinnerDefaultComposition,
  Inverse: SpinnerInverseComposition,
  Large: SpinnerLargeComposition,
} as const;

export function SpinnerDefaultSourcePreview({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <LegacySpinner />
    </SourceComparisonPreview>
  );
}

export function SpinnerLargeSourcePreview({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <LegacySpinner size="lg" />
    </SourceComparisonPreview>
  );
}

export function SpinnerInverseSourcePreview({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <span className="rounded bg-gray-950 p-3 text-white">
        <LegacySpinner />
      </span>
    </SourceComparisonPreview>
  );
}

export const SPINNER_SOURCE_COMPARISON_SOURCE = {
  Default: SpinnerDefaultSourcePreview,
  Inverse: SpinnerInverseSourcePreview,
  Large: SpinnerLargeSourcePreview,
} as const;
