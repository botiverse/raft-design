import { SystemMessage, SystemMessageContent, SystemMessageTime } from "raft-ui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageTaskClaimedContent() {
  return (
    <SystemMessage>
      <SystemMessageTime>2:18 PM</SystemMessageTime>
      <SystemMessageContent>📌 Ada claimed #42 "Polish SystemMessage docs"</SystemMessageContent>
    </SystemMessage>
  );
}

// @docs-source-strip-start
export function SystemMessageTaskClaimedComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageTaskClaimedContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
