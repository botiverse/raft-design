import { Step, Steps } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function StepsVerticalContent() {
  return (
    <Steps current={2} vertical className="w-full max-w-sm">
      <Step title="Add a machine" description="Connect a machine to the workspace" />
      <Step title="Configure the agent" description="Choose a runtime and the tools it can use" />
      <Step title="Start a conversation" description="Mention the agent in any channel" />
    </Steps>
  );
}

// @docs-source-strip-start
export function StepsVerticalComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <StepsVerticalContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
