import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from "raft-ui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

// @docs-source-strip-start
export function RichCreatorValueComposition() {
  return (
    <SourceComparisonPreview>
      <RichCreatorValueContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end

export function RichCreatorValueContent() {
  return (
    <DescriptionList>
      <DescriptionItem>
        <DescriptionTerm>Creator</DescriptionTerm>
        <DescriptionDetails className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-2 text-sm text-black hover:underline"
          >
            <span className="size-5 border-2 border-black bg-brutal-yellow" />
            <span className="font-bold">Ada Lovelace</span>
            <span className="font-mono text-xs text-black/50">@ada</span>
          </button>
        </DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  );
}
