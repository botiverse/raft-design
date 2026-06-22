import { Status } from "@raft/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function StatusContent() {
  return <Status variant="accent" size="xs" />;
}

// @docs-source-strip-start
export function StatusAttentionCompactComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <StatusContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
