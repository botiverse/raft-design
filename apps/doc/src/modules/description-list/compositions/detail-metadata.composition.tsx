import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

// @docs-source-strip-start
export function DetailMetadataComposition() {
  return (
    <SourceComparisonPreview>
      <DetailMetadataContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end

export function DetailMetadataContent() {
  return (
    <DescriptionList>
      <DescriptionItem>
        <DescriptionTerm>Created</DescriptionTerm>
        <DescriptionDetails className="font-mono">Jun 5, 2026</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  );
}
