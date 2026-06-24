import { Textarea } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function TextareaContent() {
  return (
    <Textarea aria-label="Message" className="w-80" rows={4} disabled placeholder="Disabled" />
  );
}

// @docs-source-strip-start
export function TextareaDisabledStylingComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <TextareaContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
