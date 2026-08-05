import { Spinner } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function SpinnerContent() {
  return <Spinner />;
}

// @docs-source-strip-start
export function SpinnerDefaultComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <SpinnerContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
