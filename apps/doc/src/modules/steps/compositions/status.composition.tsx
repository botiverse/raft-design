import { Step, Steps } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function StepsStatusContent() {
  return (
    <div className="grid w-full max-w-2xl gap-8">
      <Steps current={3} status="error">
        <Step title="Build" />
        <Step title="Test" />
        <Step title="Deploy" description="Staging is unreachable" />
        <Step title="Verify" />
      </Steps>
      <Steps current={4} status="finish">
        <Step title="Build" />
        <Step title="Test" />
        <Step title="Deploy" />
        <Step title="Verify" />
      </Steps>
      <Steps current={2}>
        <Step title="Build" />
        <Step title="Test" />
        <Step title="Deploy" status="error" description="Rolled back" />
        <Step title="Verify" status="wait" />
      </Steps>
    </div>
  );
}

// @docs-source-strip-start
export function StepsStatusComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <StepsStatusContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
