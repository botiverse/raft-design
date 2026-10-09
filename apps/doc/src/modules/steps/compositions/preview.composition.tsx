import { Step, Steps } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function StepsPreviewContent() {
  return (
    <Steps current={2} className="w-full max-w-2xl">
      <Step title="Create" description="Name and region" />
      <Step title="Configure" description="Pick the machine" />
      <Step title="Share" description="Invite your team" />
      <Step title="Launch" />
    </Steps>
  );
}

// @docs-source-strip-start
export function StepsPreviewComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <StepsPreviewContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
