import { Status } from "@slock/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function StatusContent() {
  return <Status variant="success" />;
}

// @docs-source-strip-start
export function StatusSuccessComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <StatusContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
