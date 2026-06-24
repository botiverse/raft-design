import { Input } from "cuvii-rui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function InputContent() {
  return (
    <Input
      aria-label="Search"
      className="w-80"
      suppressPasswordManager
      placeholder="Search customers..."
    />
  );
}

// @docs-source-strip-start
export function InputPasswordManagerSuppressionComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <InputContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
