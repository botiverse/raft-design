import { Input } from "@raft/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function InputContent() {
  return <Input aria-label="Email" className="w-80" disabled placeholder="Disabled" />;
}

// @docs-source-strip-start
export function InputDisabledStylingComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <InputContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
