import LegacySpinner from "../../../../../../packages/ui/src/legacy/Spinner.tsx";
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";

export function SpinnerDefaultSourcePreview({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <LegacySpinner />
    </SourceComparisonPreview>
  );
}
