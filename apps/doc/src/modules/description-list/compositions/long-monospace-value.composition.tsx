import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

// @docs-source-strip-start
export function LongMonospaceValueComposition() {
  return (
    <SourceComparisonPreview>
      <LongMonospaceValueContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end

export function LongMonospaceValueContent() {
  return (
    <DescriptionList>
      <DescriptionItem>
        <DescriptionTerm>Email</DescriptionTerm>
        <DescriptionDetails className="break-all font-mono">ada@example.com</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  );
}
