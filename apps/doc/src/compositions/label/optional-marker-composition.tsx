import { Label, LabelOptional } from "cuvii-rui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function LabelContent() {
  return (
    <Label htmlFor="label-optional-name">
      Middle name
      <LabelOptional />
    </Label>
  );
}

// @docs-source-strip-start
export function LabelOptionalMarkerComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <LabelContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
