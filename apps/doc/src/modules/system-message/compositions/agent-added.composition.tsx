import { SystemMessage, SystemMessageContent, SystemMessageTime } from "raft-ui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageAgentAddedContent() {
  return (
    <SystemMessage>
      <SystemMessageTime>2:16 PM</SystemMessageTime>
      <SystemMessageContent>@hermes was added to this channel.</SystemMessageContent>
    </SystemMessage>
  );
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
