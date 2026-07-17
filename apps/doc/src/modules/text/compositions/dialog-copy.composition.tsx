import { Text } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function TextDialogCopyComposition() {
  return (
    <SourceComparisonPreview className="min-h-56">
      <div className="grid w-[18rem] gap-2">
        <Text.Mono size="eyebrow">Workspace setup</Text.Mono>
        <Text.Heading level={6}>Invite people</Text.Heading>
        <Text.Sans size="small">Add teammates now or continue with a private workspace.</Text.Sans>
      </div>
    </SourceComparisonPreview>
  );
}
