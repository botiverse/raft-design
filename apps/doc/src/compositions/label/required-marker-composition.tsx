import { Label, LabelAsterisk } from "@raft/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function LabelContent() {
  return (
    <Label htmlFor="label-required-email">
      Email
      <LabelAsterisk />
    </Label>
  );
}

// @docs-source-strip-start
export function LabelRequiredMarkerComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <LabelContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
