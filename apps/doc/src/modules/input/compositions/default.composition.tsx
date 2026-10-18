import { Input } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function InputContent() {
  return <Input aria-label="Email" className="w-80" placeholder="you@example.com" />;
}

// @docs-source-strip-start
export function InputDefaultComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <InputContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
