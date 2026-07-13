import { Checkbox } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function CheckboxContent() {
  return <Checkbox indeterminate />;
}

// @docs-source-strip-start
export function CheckboxIndeterminateComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <CheckboxContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
