import { Checkbox } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function CheckboxContent() {
  return <Checkbox />;
}

// @docs-source-strip-start
export function CheckboxUncheckedComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <CheckboxContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
