import { SYSTEM_MESSAGE_FIXTURES } from "../system-message.fixtures.ts";
import { SystemMessageRow } from "../system-message-row.tsx";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageTaskReleasedContent() {
  return <SystemMessageRow message={SYSTEM_MESSAGE_FIXTURES.taskReleased} time="2:18 PM" />;
}

// @docs-source-strip-start
export function SystemMessageTaskReleasedComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageTaskReleasedContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
