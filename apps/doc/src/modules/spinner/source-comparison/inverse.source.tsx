import LegacySpinner from "../../../../../../packages/ui/src/legacy/Spinner.tsx";
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";

export function SpinnerInverseSourcePreview({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <span className="rounded bg-gray-950 p-3 text-white">
        <LegacySpinner />
      </span>
    </SourceComparisonPreview>
  );
}
