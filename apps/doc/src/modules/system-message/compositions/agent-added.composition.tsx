import { SYSTEM_MESSAGE_FIXTURES } from "../system-message.fixtures.ts";
import { SystemMessageRow } from "../system-message-row.tsx";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageAgentAddedContent() {
  return <SystemMessageRow message={SYSTEM_MESSAGE_FIXTURES.agentAdded} time="2:16 PM" />;
}

// @docs-source-strip-start
export function SystemMessageAgentAddedComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageAgentAddedContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
