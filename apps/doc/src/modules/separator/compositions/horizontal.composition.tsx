import { Separator, Text } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SeparatorHorizontalContent() {
  return (
    <div className="grid w-56 gap-3 [[data-theme=elegant]_&]:text-foreground-muted">
      <Text.Sans size="small">Channel settings</Text.Sans>
      <Separator />
      <Text.Sans size="small">Visibility actions</Text.Sans>
    </div>
  );
}

// @docs-source-strip-start
export function SeparatorHorizontalComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SeparatorHorizontalContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
