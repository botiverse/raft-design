import { InlineCode } from "@slock/ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function InlineCodeContent() {
  return <InlineCode>aria-invalid</InlineCode>;
}

// @docs-source-strip-start
export function InlineCodeInlineProseTokenComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <InlineCodeContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
