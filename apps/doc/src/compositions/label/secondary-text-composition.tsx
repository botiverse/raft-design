import { Label, LabelSub } from "@slock/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function LabelContent() {
  return (
    <Label htmlFor="label-secondary-project">
      Project URL
      <LabelSub>public</LabelSub>
    </Label>
  );
}

// @docs-source-strip-start
export function LabelSecondaryTextComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <LabelContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
