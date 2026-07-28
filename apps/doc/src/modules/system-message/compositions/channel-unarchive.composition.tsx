import { SystemMessage, SystemMessageContent, SystemMessageTime } from "raft-ui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageChannelUnarchiveContent() {
  return (
    <SystemMessage>
      <SystemMessageTime>2:16 PM</SystemMessageTime>
      <SystemMessageContent>📤 Atlas unarchived this channel</SystemMessageContent>
    </SystemMessage>
  );
}

// @docs-source-strip-start
export function SystemMessageChannelUnarchiveComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageChannelUnarchiveContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
