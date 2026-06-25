import { Separator, Text } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "../source-comparison-preview.tsx";
// @docs-source-strip-end

export function SeparatorVerticalContent() {
  return (
    <div className="flex h-14 items-center gap-4">
      <Text.Sans size="small">Filters</Text.Sans>
      <Separator orientation="vertical" />
      <Text.Sans size="small">Sort</Text.Sans>
    </div>
  );
}

// @docs-source-strip-start
export function SeparatorVerticalComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SeparatorVerticalContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
