import { Status } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function StatusContent() {
  return <Status variant="primary" pulse />;
}

// @docs-source-strip-start
export function StatusPrimaryPulseComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <StatusContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
