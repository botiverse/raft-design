import { Separator, Text } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function SeparatorHorizontalContent() {
  return (
    <div className="grid w-56 gap-3 in-data-[theme=elegant]:text-foreground-muted">
      <Text.Sans size="small">Channel settings</Text.Sans>
      <Separator />
      <Text.Sans size="small">Visibility actions</Text.Sans>
    </div>
  );
}

// @docs-source-strip-start
export function SeparatorHorizontalComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <SeparatorHorizontalContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
