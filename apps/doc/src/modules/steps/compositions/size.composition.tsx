import { Step, Steps } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function StepsSizeContent() {
  return (
    <div className="grid w-full max-w-xl gap-8">
      <Steps current={2} size="sm">
        <Step title="Cart" />
        <Step title="Shipping" />
        <Step title="Payment" />
      </Steps>
      <Steps current={2}>
        <Step title="Cart" />
        <Step title="Shipping" />
        <Step title="Payment" />
      </Steps>
    </div>
  );
}

// @docs-source-strip-start
export function StepsSizeComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <StepsSizeContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
