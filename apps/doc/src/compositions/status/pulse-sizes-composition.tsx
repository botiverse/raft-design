import { Status } from "@slock/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function StatusContent() {
  return (
    <>
      <Status size="sm" variant="primary" pulse />
      <Status size="md" variant="primary" pulse />
      <Status size="lg" variant="primary" pulse />
    </>
  );
}

// @docs-source-strip-start
export function StatusPulseSizesComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className} gap="loose">
      <StatusContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
