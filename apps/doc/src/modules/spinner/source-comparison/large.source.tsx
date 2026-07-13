import LegacySpinner from "../../../../../../packages/ui/src/legacy/Spinner.tsx";
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";

export function SpinnerLargeSourcePreview({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <LegacySpinner size="lg" />
    </SourceComparisonPreview>
  );
}
