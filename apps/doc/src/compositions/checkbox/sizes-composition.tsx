import { Checkbox } from "cuvii-rui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function CheckboxContent() {
  return (
    <>
      <Checkbox size="sm" checked readOnly />
      <Checkbox size="md" checked readOnly />
    </>
  );
}

// @docs-source-strip-start
export function CheckboxSizesComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <CheckboxContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
