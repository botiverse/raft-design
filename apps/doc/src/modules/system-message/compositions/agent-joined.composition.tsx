import { SYSTEM_MESSAGE_FIXTURES } from "../system-message.fixtures.ts";
import { SystemMessageRow } from "../system-message-row.tsx";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageAgentJoinedContent() {
  return <SystemMessageRow message={SYSTEM_MESSAGE_FIXTURES.agentJoined} time="2:16 PM" />;
}

// @docs-source-strip-start
export function SystemMessageAgentJoinedComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageAgentJoinedContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
