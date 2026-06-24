import { Spinner } from "cuvii-rui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function SpinnerLargeContent() {
  return <Spinner size="lg" />;
}

// @docs-source-strip-start
export function SpinnerLargeComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SpinnerLargeContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
