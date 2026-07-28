import { Text } from "raft-ui";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function TextDetailCopyContent() {
  return (
    <dl className="grid w-[18rem] gap-3">
      <div className="grid gap-1">
        <Text.Mono render={<dt />} size="eyebrow">
          Owner
        </Text.Mono>
        <Text.Sans render={<dd />} size="small" variant="default" className="font-medium">
          Mira
        </Text.Sans>
      </div>
      <div className="grid gap-1">
        <Text.Mono render={<dt />} size="eyebrow">
          Notes
        </Text.Mono>
        <Text.Sans render={<dd />} size="caption">
          Ready for source comparison.
        </Text.Sans>
      </div>
    </dl>
  );
}

// @docs-source-strip-start
export function TextDetailCopyComposition() {
  return (
    <SourceComparisonPreview className="min-h-56">
      <TextDetailCopyContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
