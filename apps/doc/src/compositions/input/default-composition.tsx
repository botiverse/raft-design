import { Input } from "@slock/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function InputContent() {
  return <Input aria-label="Email" className="w-80" placeholder="you@example.com" />;
}

// @docs-source-strip-start
export function InputDefaultComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <InputContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
