import { SYSTEM_MESSAGE_FIXTURES } from "../system-message.fixtures.ts";
import { SystemMessageRow } from "../system-message-row.tsx";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageTaskStartedContent() {
  return <SystemMessageRow message={SYSTEM_MESSAGE_FIXTURES.taskStarted} time="2:18 PM" />;
}

// @docs-source-strip-start
export function SystemMessageTaskStartedComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageTaskStartedContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
