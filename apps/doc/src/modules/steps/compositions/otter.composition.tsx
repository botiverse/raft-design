import { OtterIndicator } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function StepsOtterContent() {
  return (
    <div className="flex flex-wrap items-center gap-8">
      <OtterIndicator status="wait" width={64} height={64} />
      <OtterIndicator status="process" width={64} height={64} />
      <OtterIndicator status="error" width={64} height={64} />
      <OtterIndicator status="finish" width={64} height={64} />
    </div>
  );
}

// @docs-source-strip-start
export function StepsOtterComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <StepsOtterContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
