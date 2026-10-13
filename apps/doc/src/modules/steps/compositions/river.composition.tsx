import { Step, Steps } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function StepsRiverContent() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-10">
      <Steps current={3} track="river">
        <Step title="Upload" />
        <Step title="Transcode" />
        <Step title="Publish" />
        <Step title="Notify" />
      </Steps>
      <Steps current={2} status="error" track="river" vertical className="max-w-sm">
        <Step title="Build" description="Compiled in 42s" />
        <Step title="Deploy" description="Health check timed out" />
        <Step title="Announce" />
      </Steps>
    </div>
  );
}

// @docs-source-strip-start
export function StepsRiverComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <StepsRiverContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
