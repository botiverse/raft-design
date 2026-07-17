import { Text } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function TextPanelCopyComposition() {
  return (
    <SourceComparisonPreview className="min-h-56">
      <div className="grid w-[18rem] gap-2">
        <Text.Heading level={6}>Tasks</Text.Heading>
        <Text.Sans size="small">4 open tasks across 2 channels.</Text.Sans>
        <Text.Mono size="eyebrow">Updated 3 min ago</Text.Mono>
      </div>
    </SourceComparisonPreview>
  );
}
