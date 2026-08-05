import { Status } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function StatusContent() {
  return <Status />;
}

// @docs-source-strip-start
export function StatusDefaultComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <StatusContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
