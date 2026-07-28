import { SystemMessage, SystemMessageContent, SystemMessageTime } from "raft-ui/wip";

// @docs-source-strip-start
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
// @docs-source-strip-end

export function SystemMessageTaskCreatedContent() {
  return (
    <SystemMessage>
      <SystemMessageTime>2:18 PM</SystemMessageTime>
      <SystemMessageContent>
        📋 2 new tasks created: #41 "Release review checklist", #42 "Polish SystemMessage docs"
      </SystemMessageContent>
    </SystemMessage>
  );
}

// @docs-source-strip-start
export function SystemMessageTaskCreatedComposition({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <SystemMessageTaskCreatedContent />
    </SourceComparisonPreview>
  );
}
// @docs-source-strip-end
