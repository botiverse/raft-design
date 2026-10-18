import { useState } from "react";
import { Step, Steps } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function StepsClickableContent() {
  const [current, setCurrent] = useState(2);

  return (
    <Steps current={current} onUpdateCurrent={setCurrent} className="w-full max-w-2xl">
      <Step title="Account" />
      <Step title="Profile" />
      <Step title="Preferences" />
      <Step title="Publish" disabled />
    </Steps>
  );
}

// @docs-source-strip-start
export function StepsClickableComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <StepsClickableContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
