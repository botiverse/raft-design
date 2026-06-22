import { Spinner } from "@raft/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function SpinnerInverseContent() {
  return (
    <span className="rounded bg-gray-950 p-3 text-white">
      <Spinner />
    </span>
  );
}

// @docs-source-strip-start
export function SpinnerInverseComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SpinnerInverseContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
