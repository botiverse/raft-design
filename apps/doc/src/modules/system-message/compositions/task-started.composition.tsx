import { SystemMessage, SystemMessageContent, SystemMessageTime } from "raft-ui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageTaskStartedContent() {
  return (
    <SystemMessage>
      <SystemMessageTime>2:18 PM</SystemMessageTime>
      <SystemMessageContent>
        📌 @Ada started task #42 "Polish SystemMessage docs"
      </SystemMessageContent>
    </SystemMessage>
  );
}

// @docs-source-strip-start
export function SystemMessageTaskStartedComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageTaskStartedContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
