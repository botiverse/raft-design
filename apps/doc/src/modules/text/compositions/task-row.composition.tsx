import { Text } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function TextTaskRowContent() {
  return (
    <div className="grid w-[20rem] gap-1">
      <div className="flex items-center justify-between gap-3">
        <Text.Sans
          render={<span />}
          size="small"
          variant="default"
          className="truncate font-medium text-foreground"
        >
          Audit component migration
        </Text.Sans>
        <Text.Mono render={<span />} size="meta">
          Today
        </Text.Mono>
      </div>
      <Text.Sans size="caption">Compare source usage before replacing legacy primitives.</Text.Sans>
    </div>
  );
}

// @docs-source-strip-start
export function TextTaskRowComposition() {
  return (
    <SourceComparisonPreview className="min-h-56">
      <TextTaskRowContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
