import { SYSTEM_MESSAGE_FIXTURES } from "../system-message.fixtures.ts";
import { SystemMessage, SystemMessageContent, SystemMessageTime } from "raft-ui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageTaskDeletedContent() {
  return (
    <SystemMessage>
      <SystemMessageTime>2:18 PM</SystemMessageTime>
      <SystemMessageContent>{SYSTEM_MESSAGE_FIXTURES.taskDeleted.content}</SystemMessageContent>
    </SystemMessage>
  );
}

// @docs-source-strip-start
export function SystemMessageTaskDeletedComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageTaskDeletedContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
