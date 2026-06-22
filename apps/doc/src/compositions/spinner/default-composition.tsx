import { Spinner } from "@raft/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function SpinnerContent() {
  return <Spinner />;
}

// @docs-source-strip-start
export function SpinnerDefaultComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SpinnerContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
