import { Badge } from "cuvii-rui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function BadgeContent() {
  return <Badge.Experimental />;
}

// @docs-source-strip-start
export function BadgeExperimentalPresetComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <BadgeContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
