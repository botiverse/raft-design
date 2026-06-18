import { Badge } from "@slock/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function BadgeContent() {
  return <Badge variant="danger">Failed</Badge>;
}

// @docs-source-strip-start
export function BadgeDangerComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <BadgeContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
