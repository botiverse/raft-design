import { SystemMessage, SystemMessageContent, SystemMessageTime } from "raft-ui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageAgentRemovedContent() {
  return (
    <SystemMessage>
      <SystemMessageTime>2:16 PM</SystemMessageTime>
      <SystemMessageContent>@hermes was removed from this channel.</SystemMessageContent>
    </SystemMessage>
  );
}

// @docs-source-strip-start
export function SystemMessageAgentRemovedComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageAgentRemovedContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
