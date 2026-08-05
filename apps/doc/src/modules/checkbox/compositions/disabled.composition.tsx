import { Checkbox } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function CheckboxContent() {
  return <Checkbox checked disabled readOnly />;
}

// @docs-source-strip-start
export function CheckboxDisabledComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <CheckboxContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
