import { Status } from "cuvii-rui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function StatusContent() {
  return <Status variant="warning" />;
}

// @docs-source-strip-start
export function StatusWarningComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <StatusContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
