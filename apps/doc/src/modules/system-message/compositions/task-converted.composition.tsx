import { SystemMessage, SystemMessageContent, SystemMessageTime } from "raft-ui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageTaskConvertedContent() {
  return (
    <SystemMessage>
      <SystemMessageTime>2:18 PM</SystemMessageTime>
      <SystemMessageContent>
        📋 Atlas converted a message to task #41 "Release review checklist"
      </SystemMessageContent>
    </SystemMessage>
  );
}

// @docs-source-strip-start
export function SystemMessageTaskConvertedComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageTaskConvertedContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
