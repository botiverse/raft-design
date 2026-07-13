import { Label } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function LabelContent() {
  return <Label htmlFor="label-inline-email">Email</Label>;
}

// @docs-source-strip-start
export function LabelInlineFormLabelComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <LabelContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
