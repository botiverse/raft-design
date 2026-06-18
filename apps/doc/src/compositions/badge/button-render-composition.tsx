import { Badge } from "@slock/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function BadgeContent() {
  return (
    <Badge render={<button type="button" aria-label="Open thread replies" />} variant="information">
      3 replies
    </Badge>
  );
}

// @docs-source-strip-start
export function BadgeButtonRenderComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <BadgeContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
