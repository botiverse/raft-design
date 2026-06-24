import { Badge } from "cuvii-rui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function BadgeContent() {
  return <Badge appearance="outline">task #42 @bugen</Badge>;
}

// @docs-source-strip-start
export function BadgeDefaultPreservedCasingComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <BadgeContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
