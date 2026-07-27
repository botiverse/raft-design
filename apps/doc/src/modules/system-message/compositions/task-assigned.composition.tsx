import { SYSTEM_MESSAGE_FIXTURES } from "../system-message.fixtures.ts";
import { SystemMessage, SystemMessageContent, SystemMessageTime } from "raft-ui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageTaskAssignedContent() {
  return (
    <SystemMessage>
      <SystemMessageTime>2:18 PM</SystemMessageTime>
      <SystemMessageContent>{SYSTEM_MESSAGE_FIXTURES.taskAssigned.content}</SystemMessageContent>
    </SystemMessage>
  );
}

// @docs-source-strip-start
export function SystemMessageTaskAssignedComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageTaskAssignedContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
