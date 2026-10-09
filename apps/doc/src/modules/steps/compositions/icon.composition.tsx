import { Star, Upload } from "lucide-react";
import { Step, Steps } from "raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const doneIcon = <Star strokeWidth={2.5} />;

const uploadIcon = <Upload strokeWidth={2.5} />;

export function StepsIconContent() {
  return (
    <Steps current={2} finishIcon={doneIcon} className="w-full max-w-xl">
      <Step title="Choose files" />
      <Step title="Upload" icon={uploadIcon} />
      <Step title="Review" />
    </Steps>
  );
}

// @docs-source-strip-start
export function StepsIconComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <StepsIconContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
